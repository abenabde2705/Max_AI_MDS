import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';
const CHAT_API = 'http://localhost:8000';

export const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

export const fetchConversations = () =>
  axios.get(`${API_BASE}/conversations`, { headers: getAuthHeaders() });

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

export const askAI = (conversationId: string, message: string, signal?: AbortSignal) =>
  axios.post(
    `${CHAT_API}/chat`,
    { conversation_id: conversationId, message },
    { signal }
  );
