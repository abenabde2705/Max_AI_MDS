import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

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

/**
 * Envoie un message au backend qui proxy vers le Chat API interne.
 * Sauvegarde le message utilisateur ET la réponse IA côté serveur.
 * Aucune clé API n'est exposée au client.
 */
export const sendChatMessage = (
  conversationId: string,
  message: string,
  signal?: AbortSignal
) =>
  axios.post(
    `${API_BASE}/chat`,
    { conversation_id: conversationId, message },
    { headers: getAuthHeaders(), signal }
  );

export const deleteConversation = (conversationId: string) =>
  axios.delete(`${API_BASE}/conversations/${conversationId}`, { headers: getAuthHeaders() });

export const fetchMessageCount = () =>
  axios.get(`${API_BASE}/users/me/message-count`, { headers: getAuthHeaders() });

export const fetchConversationStats = () =>
  axios.get(`${API_BASE}/conversations/stats/summary`, { headers: getAuthHeaders() });

export const fetchJournalEntries = () =>
  axios.get(`${API_BASE}/journal`, { headers: getAuthHeaders() });

export const deleteJournalEntry = (id: string) =>
  axios.delete(`${API_BASE}/journal/${id}`, { headers: getAuthHeaders() });

// ─── Subscriptions ───────────────────────────────────────────────────────────

export const createCheckoutSession = (plan: 'premium' | 'student') =>
  axios.post(`${API_BASE}/subscriptions/checkout`, { plan }, { headers: getAuthHeaders() });

export const createPortalSession = () =>
  axios.post(`${API_BASE}/subscriptions/portal`, {}, { headers: getAuthHeaders() });

export const cancelSubscription = () =>
  axios.post(`${API_BASE}/subscriptions/cancel`, {}, { headers: getAuthHeaders() });

export const fetchCurrentSubscription = () =>
  axios.get(`${API_BASE}/subscriptions/current`, { headers: getAuthHeaders() });

// ─── Student Verification ─────────────────────────────────────────────────────

export const submitStudentVerification = (formData: FormData) =>
  axios.post(`${API_BASE}/student-verification/submit`, formData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
  });

export const fetchStudentVerificationStatus = () =>
  axios.get(`${API_BASE}/student-verification/status`, { headers: getAuthHeaders() });

// Admin
export const fetchAdminVerifications = (status: 'pending' | 'approved' | 'rejected' | 'all' = 'all') =>
  axios.get(`${API_BASE}/admin/student-verifications?status=${status}`, { headers: getAuthHeaders() });

export const reviewStudentVerification = (id: string, status: 'approved' | 'rejected', rejectionReason?: string) =>
  axios.patch(`${API_BASE}/admin/student-verifications/${id}`, { status, rejectionReason }, { headers: getAuthHeaders() });
