import { useState, useEffect, useRef } from 'react';
import {
  fetchConversations,
  fetchMessages,
  createConversation,
  sendChatMessage,
  deleteConversation,
  fetchMessageCount,
} from '../services/chat.api';

export function useChat() {
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: 'Bonjour, je suis là pour vous écouter et vous soutenir. Comment vous sentez-vous aujourd\'hui ?',
    },
  ]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messageLimitReached, setMessageLimitReached] = useState(false);
  const [messageCount, setMessageCount] = useState<{ used: number; limit: number | null; is_premium: boolean } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      loadConversations();
      loadMessageCount();
    } else {
      console.log('Pas de token trouvé - mode local activé');
    }
  }, []);

  const loadMessageCount = async () => {
    try {
      const res = await fetchMessageCount();
      setMessageCount(res.data);
      setMessageLimitReached(!res.data.is_premium && res.data.limit !== null && res.data.used >= res.data.limit);
    } catch (error: any) {
      console.warn('Impossible de charger le compteur de messages:', error);
    }
  };

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
          role: 'assistant',
          content: 'Bonjour, je suis là pour vous écouter et vous soutenir. Comment vous sentez-vous aujourd\'hui ?',
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
            role: 'assistant',
            content: 'Bonjour, je suis là pour vous écouter et vous soutenir. Comment vous sentez-vous aujourd\'hui ?',
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
      // Auto-créer une conversation si l'utilisateur est authentifié mais n'en a pas encore
      let convId = activeConversation;
      if (isAuthenticated && !convId) {
        try {
          const res = await createConversation();
          convId = res.data.id;
          setActiveConversation(convId);
          loadConversations();
        } catch (convErr) {
          console.error('Impossible de créer la conversation automatiquement:', convErr);
        }
      }

      abortRef.current = new AbortController();

      let aiResponse: string;

      if (isAuthenticated && convId) {
        // Appel unique : le backend sauvegarde les deux messages et retourne la réponse IA
        const res = await sendChatMessage(convId, content, abortRef.current.signal);
        aiResponse = res.data.response;
        await loadMessageCount();
      } else {
        aiResponse = 'Vous devez être connecté pour discuter avec MAX.';
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() },
      ]);
    } catch (error: any) {
      if (error.response?.status === 403 && error.response?.data?.error === 'MESSAGE_LIMIT_REACHED') {
        setMessageLimitReached(true);
        setMessageCount(prev => prev ? { ...prev, used: error.response.data.used, limit: error.response.data.limit } : null);
        setMessages((prev) => prev.slice(0, -1));
      } else if (error.name === 'CanceledError') {
        // Annulé par l'utilisateur, rien à faire
      } else {
        console.error('[useChat] sendMessage error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          code: error.code,
        });
        const isNetworkError = !error.response;
        const errorMessage = isNetworkError
          ? 'Le service de chat est temporairement indisponible. Veuillez réessayer plus tard.'
          : `Désolé, une erreur est survenue (${error.response?.status ?? 'inconnue'}). Veuillez réessayer.`;
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: errorMessage },
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
    messageLimitReached,
    messageCount,
  };
}
