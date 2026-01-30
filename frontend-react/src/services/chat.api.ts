import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
const CHAT_API = import.meta.env.VITE_CHAT_API_URL || 'http://localhost:8000';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const fetchConversations = () =>
  axios.get(`${API_BASE}/conversations`, { headers: getAuthHeaders() });

export const fetchUserProfile = () =>
  axios.get(`${API_BASE}/users/me`, { headers: getAuthHeaders() });

export const fetchMessages = (conversationId: string) =>
  axios.get(`${API_BASE}/messages?conversation_id=${conversationId}`, {
    headers: getAuthHeaders(),
  });

export const createConversation = () =>
  axios.post(`${API_BASE}/conversations`, {}, { headers: getAuthHeaders() });

export const sendUserMessage = (
  conversationId: string,
  content: string
) =>
  axios.post(
    `${API_BASE}/messages`,
    { conversation_id: conversationId, sender: 'user', content },
    { headers: getAuthHeaders() }
  );

export const sendAIMessage = (
  conversationId: string,
  content: string
) =>
  axios.post(
    `${API_BASE}/messages`,
    { conversation_id: conversationId, sender: 'ai', content },
    { headers: getAuthHeaders() }
  );

export const askAI = (conversationId: string, message: string, signal?: AbortSignal) =>
  axios.post(
    `${CHAT_API}/chat`,
    { conversation_id: conversationId, message },
    { signal }
  );

export const deleteConversation = (conversationId: string) =>
  axios.delete(`${API_BASE}/conversations/${conversationId}`, { headers: getAuthHeaders() });
