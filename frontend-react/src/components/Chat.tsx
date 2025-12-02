import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { marked } from 'marked';
import OnlineBarChat from './OnlineBarChat';
import { 
  Home as HomeIcon,
  User as UserIcon, 
  BookOpen as BookOpenIcon, 
  Settings as SettingsIcon, 
  Send as SendIcon,
  StopCircle as StopIcon,
  Plus as PlusIcon,
  Trash2 as TrashIcon,
  MessageCircle as MessageIcon
} from 'lucide-react';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  isTyping: boolean;
  timestamp: number;
  id?: string;
}

interface Conversation {
  id: string;
  title?: string;
  created_at: string;
  started_at?: string;
  lastMessage?: {
    content: string;
    sender: string;
    sent_at: string;
  };
}

interface ApiMessage {
  id: string;
  sender: string;
  content: string;
  sent_at: string;
}

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const [userMessage, setUserMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const abortController = useRef<AbortController>(new AbortController());

  // Configuration API
  const API_BASE = 'http://localhost:3000/api';
  const CHAT_API = 'http://localhost:8000';
  
  const getToken = () => localStorage.getItem('token');
  
  const axiosConfig = {
    headers: { 
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  };

  // Charger les conversations au montage du composant
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/auth');
      return;
    }
    
    loadConversations();
  }, [navigate]);

  // Charger toutes les conversations de l'utilisateur
  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/conversations`, axiosConfig);
      console.log('Conversations reçues:', response.data);
      console.log('Première conversation:', response.data[0]);
      setConversations(response.data);
      
      // Si aucune conversation active et qu'il y en a au moins une, sélectionner la première
      if (!activeConversation && response.data.length > 0 && response.data[0].id) {
        console.log('Switching to conversation ID:', response.data[0].id);
        await switchConversation(response.data[0].id);
      }
      // Si pas de conversations, laisser l'interface vide - l'utilisateur créera une conversation manuellement
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des conversations:', error);
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
      }
    } finally {
      setLoading(false);
    }
  };

  // Charger les messages d'une conversation spécifique
  const loadMessages = async (conversationId: string | null): Promise<Message[]> => {
    if (!conversationId || conversationId === undefined) {
      console.warn('Tentative de chargement de messages avec un ID invalide:', conversationId);
      return [];
    }
    
    try {
      const response = await axios.get(`${API_BASE}/messages?conversation_id=${conversationId}`, axiosConfig);
      const messages: Message[] = response.data.messages.map((msg: ApiMessage) => ({
        sender: msg.sender === 'user' ? 'user' : 'bot',
        text: msg.content,
        isTyping: false,
        timestamp: new Date(msg.sent_at).getTime(),
        id: msg.id
      }));
      
      setChatHistory(messages);
      return messages;
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      return [];
    }
  };

  const cancelResponse = () => {
    abortController.current.abort();
    abortController.current = new AbortController();
    
    // Remplacer le message "typing" par un message d'annulation
    const lastMessage = chatHistory[chatHistory.length - 1];
    if (lastMessage && lastMessage.isTyping) {
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          sender: 'bot',
          text: 'Réponse annulée.',
          isTyping: false,
          timestamp: new Date().getTime()
        };
        return newHistory;
      });
    }
    
    setIsWaitingForResponse(false);
  };

  const createNewConversation = async () => {
    try {
      const response = await axios.post(`${API_BASE}/conversations`, {}, axiosConfig);
      const newConversation = response.data;
      
      // Ajouter message d'accueil automatique
      await axios.post(`${API_BASE}/messages`, {
        conversation_id: newConversation.id,
        sender: 'ai',
        content: 'Je suis à ton écoute, est-ce que je peux t\'aider ?'
      }, axiosConfig);
      
      // Ajouter la nouvelle conversation à la liste existante sans recharger tout
      const newConvWithMessage = {
        ...newConversation,
        lastMessage: {
          content: 'Je suis à ton écoute, est-ce que je peux t\'aider ?',
          sender: 'ai',
          sent_at: new Date().toISOString()
        }
      };
      
      setConversations(prev => [newConvWithMessage, ...prev]);
      await switchConversation(newConversation.id);
      
    } catch (error) {
      console.error('Erreur lors de la création de conversation:', error);
    }
  };

  const switchConversation = async (id: string | null): Promise<void> => {
    if (!id || id === undefined) {
      console.warn('Tentative de switch vers une conversation avec un ID invalide:', id);
      return;
    }
    setActiveConversation(id);
    await loadMessages(id);
  };

  const deleteConversation = async (conversationId: string | null | undefined, event?: React.MouseEvent): Promise<void> => {
    event?.stopPropagation();
    
    console.log('Tentative de suppression avec ID:', conversationId, 'Type:', typeof conversationId);
    
    if (!conversationId || conversationId === undefined) {
      console.warn('Tentative de suppression avec un ID invalide:', conversationId);
      return;
    }
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      try {
        await axios.delete(`${API_BASE}/conversations/${conversationId}`, axiosConfig);
        
        // Supprimer de la liste locale sans recharger
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        
        // Si c'était la conversation active, désélectionner
        if (activeConversation === conversationId) {
          setActiveConversation(null);
          setChatHistory([]);
        }
        
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const sendMessage = async () => {
    if (!userMessage.trim() || !activeConversation) return;

    const messageText = userMessage.trim();
    setUserMessage('');
    setIsWaitingForResponse(true);
    
    const currentTime = new Date().getTime();

    // Ajouter le message utilisateur à l'interface
    setChatHistory(prev => [
      ...prev,
      {
        sender: 'user',
        text: messageText,
        isTyping: false,
        timestamp: currentTime
      },
      {
        sender: 'bot',
        text: '',
        isTyping: true,
        timestamp: currentTime
      }
    ]);

    try {
      // Sauvegarder le message utilisateur dans la base de données
      await axios.post(`${API_BASE}/messages`, {
        conversation_id: activeConversation,
        sender: 'user',
        content: messageText
      }, axiosConfig);

      abortController.current = new AbortController();

      // Appeler l'API Mistral
      const response = await axios.post(`${CHAT_API}/chat`, {
        message: messageText,
        conversation_id: activeConversation
      }, { signal: abortController.current.signal });

      const botResponse = response.data.response;

      // Sauvegarder la réponse de l'IA dans la base de données
      await axios.post(`${API_BASE}/messages`, {
        conversation_id: activeConversation,
        sender: 'ai',
        content: botResponse
      }, axiosConfig);

      const responseTime = new Date().getTime();

      // Mettre à jour l'interface
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          sender: 'bot',
          text: botResponse, 
          isTyping: false,
          timestamp: responseTime
        };
        return newHistory;
      });

    } catch (error) {
      console.error('Erreur lors de l\'envoi du message :', error);
      const errorTime = new Date().getTime();
      
      // Afficher un message d'erreur
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          sender: 'bot',
          text: 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.',
          isTyping: false,
          timestamp: errorTime
        };
        return newHistory;
      });
      
      // Sauvegarder le message d'erreur aussi
      try {
        await axios.post(`${API_BASE}/messages`, {
          conversation_id: activeConversation,
          sender: 'ai',
          content: 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.'
        }, axiosConfig);
      } catch (saveError) {
        console.error('Erreur lors de la sauvegarde du message d\'erreur:', saveError);
      }
    } finally {
      setIsWaitingForResponse(false);
    }

    // Scroll vers le bas
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-area');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  };

  const renderMarkdown = (text: string): string => {
    return marked(text) as string;
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo">
          <h1>MAX</h1>
        </div>

        <nav className="nav-menu">
          <div className="conversations-header">
            <button onClick={createNewConversation} className="new-chat-btn" disabled={loading}>
              <PlusIcon className="icon" />
              Nouvelle conversation
            </button>
          </div>
          
          <div className="conversations-list">
            {loading ? (
              <div className="loading-conversations">
                <div className="loading-spinner"></div>
                <p>Chargement des conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="no-conversations">
                <MessageIcon className="empty-icon" />
                <p>Aucune conversation</p>
                <small>Créez votre première conversation !</small>
              </div>
            ) : (
              conversations.map((conv) => {
                const conversationTitle = conv.lastMessage 
                  ? (conv.lastMessage.content.length > 30 
                    ? `${conv.lastMessage.content.substring(0, 30)}...`
                    : conv.lastMessage.content)
                  : 'Nouvelle conversation';
                
                const conversationDate = new Date(conv.started_at || conv.created_at).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit'
                });

                return (
                  <div 
                    key={conv.id}
                    className={`conversation-item ${activeConversation === conv.id ? 'active' : ''}`}
                  >
                    <button 
                      onClick={() => switchConversation(conv.id)}
                      className="conversation-btn"
                    >
                      <div className="conversation-info">
                        <div className="conversation-title">{conversationTitle}</div>
                        <div className="conversation-date">{conversationDate}</div>
                      </div>
                    </button>
                    <button 
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="delete-conversation-btn"
                      title="Supprimer la conversation"
                    >
                      <TrashIcon className="trash-icon" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </nav>

        <div className="bottom-nav">
          <div className="nav-buttons">
            <Link to="/">
              <button>
                <HomeIcon className="icon" />
              </button>
            </Link>
            <Link to="/auth">
              <button>
                <UserIcon className="icon" />
              </button>
            </Link>
            <Link to="/unknown">
              <button>
                <BookOpenIcon className="icon" />
              </button>
            </Link>
            <button>
              <SettingsIcon className="icon" />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <OnlineBarChat />

        <div className="chat-area">
          <div className="chat-container">
            {!activeConversation ? (
              <div className="welcome-message">
                <MessageIcon className="welcome-icon" />
                <h2>Bienvenue sur Max AI</h2>
                <p>Créez une nouvelle conversation pour commencer à discuter avec votre assistant IA personnel.</p>
                <button 
                  onClick={createNewConversation} 
                  className="start-chat-btn"
                  disabled={loading}
                >
                  <PlusIcon className="icon" />
                  Commencer une conversation
                </button>
              </div>
            ) : (
              chatHistory.map((message, index) => (
                <div key={index} className={`message-wrapper ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                  <div className="message-container">
                    <div className="message-content">
                      <div className={`message ${message.isTyping ? 'typing' : ''}`}>
                        {message.isTyping ? (
                          <div className="typing-animation">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        ) : (
                          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }} />
                        )}
                      </div>
                      {!message.isTyping && (
                        <div className="message-timestamp">
                          {formatTimestamp(message.timestamp)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="input-container">
          <div className="input-wrapper">
            <input 
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              type="text" 
              placeholder="Écrire Un Message"
              className="message-input"
              onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isWaitingForResponse}
            />
            {!isWaitingForResponse ? (
              <button 
                className="send-button" 
                onClick={sendMessage}
                disabled={!userMessage.trim()}
              >
                <SendIcon className="send-icon" />
              </button>
            ) : (
              <button 
                className="stop-button" 
                onClick={cancelResponse}
              >
                <StopIcon className="stop-icon" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;