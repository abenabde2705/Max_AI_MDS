import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked';
import OnlineBarChat from './OnlineBarChat.jsx';
import { 
  Home as HomeIcon,
  User as UserIcon, 
  BookOpen as BookOpenIcon, 
  Settings as SettingsIcon, 
  Send as SendIcon,
  StopCircle as StopIcon,
  Plus as PlusIcon,
  X as XIcon
} from 'lucide-react';

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const Chat = () => {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'bot',
      text: 'Je suis à ton écoute, est-ce que je peux t\'aider ?',
      isTyping: false,
      timestamp: new Date().getTime() 
    }
  ]);
  
  const [conversations, setConversations] = useState([
    {
      id: 1,
      title: 'Conversation 1',
      messages: [{
        sender: 'bot',
        text: 'Je suis à ton écoute, est-ce que je peux t\'aider ?',
        isTyping: false,
        timestamp: new Date().getTime() 
      }]
    }
  ]);
  
  const [activeConversation, setActiveConversation] = useState(1);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const abortController = useRef(new AbortController());

  const cancelResponse = () => {
    abortController.current.abort();
    abortController.current = new AbortController();
    
    // Remplacer le message "typing" par un message d'annulation
    const lastMessage = chatHistory[chatHistory.length - 1];
    if (lastMessage && lastMessage.isTyping) {
      const cancelTime = new Date().getTime();
      
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          sender: 'bot',
          text: 'Réponse annulée.',
          isTyping: false,
          timestamp: cancelTime
        };
        return newHistory;
      });
      
      setConversations(prev => {
        const newConversations = [...prev];
        const currentConvIndex = newConversations.findIndex(
          conv => conv.id === activeConversation
        );
        
        if (currentConvIndex !== -1) {
          newConversations[currentConvIndex].messages = [...chatHistory];
        }
        return newConversations;
      });
    }
    
    setIsWaitingForResponse(false);
  };

  const createNewConversation = () => {
    const newId = conversations.length + 1;
    const currentTime = new Date().getTime();
    
    const newConv = {
      id: newId,
      title: `Conversation ${newId}`,
      messages: [{
        sender: 'bot',
        text: 'Je suis à ton écoute, est-ce que je peux t\'aider ?',
        isTyping: false,
        timestamp: currentTime
      }]
    };
    
    setConversations(prev => [...prev, newConv]);
    switchConversation(newId);
  };

  const switchConversation = (id) => {
    setActiveConversation(id);
    const conv = conversations.find(conv => conv.id === id);
    if (conv) {
      setChatHistory(conv.messages || []);
    }
  };

  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    const messageText = userMessage.trim();
    setUserMessage('');
    setIsWaitingForResponse(true);
    
    const currentTime = new Date().getTime();

    // Ajouter le message utilisateur
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
      abortController.current = new AbortController();

      await axios.get('http://localhost:8000/docs');
   
      // Appeler l'API Mistral avec une requête POST
      const response = await axios.post('http://localhost:8000/chat', {
        message: messageText,
      }, { signal: abortController.current.signal });

      const responseTime = new Date().getTime();

      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1] = {
          sender: 'bot',
          text: response.data.response, 
          isTyping: false,
          timestamp: responseTime
        };
        return newHistory;
      });
    } catch (error) {
      console.error("Erreur lors de l'appel à l'API :", error);
      const errorTime = new Date().getTime();
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

  const renderMarkdown = (text) => {
    return marked(text);
  };

  const handleKeyPress = (e) => {
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
            <button onClick={createNewConversation} className="new-chat-btn">
              <PlusIcon className="icon" />
              Nouvelle conversation
            </button>
          </div>
          
          <div className="conversations-list">
            {conversations.map((conv) => (
              <button 
                key={conv.id}
                onClick={() => switchConversation(conv.id)}
                className={`conversation-btn ${activeConversation === conv.id ? 'active' : ''}`}
              >
                {conv.title}
              </button>
            ))}
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
            {chatHistory.map((message, index) => (
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
            ))}
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