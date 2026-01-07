import { useState, useEffect, useRef } from 'react';
import {
  fetchConversations,
  fetchMessages,
  createConversation,
  sendUserMessage,
  askAI,
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
      setConversations(res.data);

      if (res.data[0]?.id) {
        switchConversation(res.data[0].id);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.warn('Non authentifié - utilisation du mode local');
        setIsAuthenticated(false);
      }
    }
  };

  const switchConversation = async (id: string) => {
    try {
      setActiveConversation(id);
      const res = await fetchMessages(id);
      setMessages(
        res.data.messages.map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.content,
        }))
      );
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const sendMessage = async (content: string) => {
    setMessages((prev) => [...prev, { role: 'user', content }]);
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

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: aiRes.data.response },
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

  return {
    messages,
    conversations,
    isWaiting,
    sendMessage,
    switchConversation,
    cancelResponse,
    activeConversation,
  };
}
