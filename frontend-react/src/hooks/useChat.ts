import { useState, useEffect, useRef } from 'react';
import {
  fetchConversations,
  fetchMessages,
  createConversation,
  sendUserMessage,
  sendAIMessage,
  askAI,
  deleteConversation,
} from '../services/chat.api';

export function useChat() {
  const [messages, setMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "Bonjour, je suis là pour vous écouter et vous soutenir. Comment vous sentez-vous aujourd'hui ?",
    },
  ]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      loadConversations();
    } else {
      console.log('Pas de token trouvé - mode local activé');
    }
  }, []);

  const loadConversations = async () => {
    try {
      const res = await fetchConversations();
      
      // Vérifier si res.data est un tableau
      const conversationsArray = Array.isArray(res.data) ? res.data : [];
      
      // Filtrer les conversations valides (avec un id)
      const validConversations = conversationsArray.filter((conv: any) => conv && conv.id);
      
      setConversations(validConversations);

      // Ne pas basculer automatiquement si on a déjà une conversation active
      if (!activeConversation && validConversations[0]?.id) {
        switchConversation(validConversations[0].id);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn('Non authentifié - utilisation du mode local');
        setIsAuthenticated(false);
      }
    }
  };

  const createNewConversation = async () => {
    try {
      const res = await createConversation();
      const newConv = res.data;
      
      // Recharger la liste des conversations
      await loadConversations();
      
      // Basculer vers la nouvelle conversation
      setActiveConversation(newConv.id);
      setMessages([
        {
          role: "assistant",
          content: "Bonjour, je suis là pour vous écouter et vous soutenir. Comment vous sentez-vous aujourd'hui ?",
        },
      ]);
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
    }
  };

  const switchConversation = async (id: string) => {
    try {
      setActiveConversation(id);
      const res = await fetchMessages(id);
      
      const loadedMessages = res.data.messages.map((m: any) => {
        const role = m.sender === 'user' ? 'user' : 'assistant';
        return {
          role,
          content: m.content,
          timestamp: m.sentAt || m.createdAt || new Date().toISOString(),
        };
      });
      
      // Si aucun message, afficher le message d'accueil
      if (loadedMessages.length === 0) {
        setMessages([
          {
            role: "assistant",
            content: "Bonjour, je suis là pour vous écouter et vous soutenir. Comment vous sentez-vous aujourd'hui ?",
          },
        ]);
      } else {
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const sendMessage = async (content: string) => {
    setMessages((prev) => [...prev, { role: 'user', content, timestamp: new Date().toISOString() }]);
    setIsWaiting(true);

    try {
      if (isAuthenticated && activeConversation) {
        await sendUserMessage(activeConversation, content);
      }

      abortRef.current = new AbortController();

      const conversationId = activeConversation || 'local';
      const aiRes = await askAI(
        conversationId,
        content,
        abortRef.current.signal
      );

      const aiResponse = aiRes.data.response;
      
      // Sauvegarder la réponse de l'IA dans la base de données
      if (isAuthenticated && activeConversation) {
        await sendAIMessage(activeConversation, aiResponse);
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() },
      ]);
    } catch (error: any) {
      if (error.name !== 'CanceledError') {
        console.error('Erreur lors de l\'envoi du message:', error);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Désolé, une erreur est survenue. Veuillez réessayer.' },
        ]);
      }
    } finally {
      setIsWaiting(false);
    }
  };

  const cancelResponse = () => {
    abortRef.current?.abort();
    setIsWaiting(false);
  };

  const removeConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      
      // Si la conversation supprimée est active, créer une nouvelle conversation
      if (activeConversation === id) {
        await createNewConversation();
      }
      
      // Recharger la liste des conversations
      await loadConversations();
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation:', error);
    }
  };

  return {
    messages,
    conversations,
    isWaiting,
    sendMessage,
    switchConversation,
    cancelResponse,
    activeConversation,
    createNewConversation,
    removeConversation,
  };
}
