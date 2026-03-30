import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Le token JWT vit dans un cookie httpOnly — withCredentials l'envoie automatiquement.
export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
});

export const fetchConversations = () =>
  api.get('/conversations', { headers: getAuthHeaders() });

export const fetchUserProfile = () =>
  api.get('/users/me', { headers: getAuthHeaders() });

export const fetchAuthProfile = () =>
  api.get('/auth/profile', { headers: getAuthHeaders() });

export const fetchMessages = (conversationId: string) =>
  api.get(`/messages?conversation_id=${conversationId}`, {
    headers: getAuthHeaders(),
  });

export const createConversation = () =>
  api.post('/conversations', {}, { headers: getAuthHeaders() });

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
  api.post(
    '/chat',
    { conversation_id: conversationId, message },
    { headers: getAuthHeaders(), signal }
  );

export const deleteConversation = (conversationId: string) =>
  api.delete(`/conversations/${conversationId}`, { headers: getAuthHeaders() });

export const fetchMessageCount = () =>
  api.get('/users/me/message-count', { headers: getAuthHeaders() });

export const fetchConversationStats = () =>
  api.get('/conversations/stats/summary', { headers: getAuthHeaders() });

export const fetchJournalEntries = () =>
  api.get('/journal', { headers: getAuthHeaders() });

export const deleteJournalEntry = (id: string) =>
  api.delete(`/journal/${id}`, { headers: getAuthHeaders() });

// ─── Subscriptions ───────────────────────────────────────────────────────────

export const createCheckoutSession = (plan: 'premium' | 'student') =>
  api.post('/subscriptions/checkout', { plan }, { headers: getAuthHeaders() });

export const createPortalSession = () =>
  api.post('/subscriptions/portal', {}, { headers: getAuthHeaders() });

export const cancelSubscription = () =>
  api.post('/subscriptions/cancel', {}, { headers: getAuthHeaders() });

export const fetchCurrentSubscription = () =>
  api.get('/subscriptions/current', { headers: getAuthHeaders() });

export const fetchSubscriptionPrices = () =>
  api.get('/subscriptions/prices');

// ─── Student Verification ─────────────────────────────────────────────────────

export const submitStudentVerification = (formData: FormData) =>
  api.post('/student-verification/submit', formData, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
  });

export const fetchStudentVerificationStatus = () =>
  api.get('/student-verification/status', { headers: getAuthHeaders() });

// Admin
export const fetchAdminVerifications = (status: 'pending' | 'approved' | 'rejected' | 'all' = 'all') =>
  api.get(`/admin/student-verifications?status=${status}`, { headers: getAuthHeaders() });

export const reviewStudentVerification = (id: string, status: 'approved' | 'rejected', rejectionReason?: string) =>
  api.patch(`/admin/student-verifications/${id}`, { status, rejectionReason }, { headers: getAuthHeaders() });

export const fetchAdminUsers = (search?: string) =>
  api.get(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`, { headers: getAuthHeaders() });

export const deleteAdminUser = (id: string) =>
  api.delete(`/admin/users/${id}`, { headers: getAuthHeaders() });

export const createAdminUser = (data: { firstName: string; lastName: string; email: string; dateOfBirth?: string; plan: string }) =>
  api.post('/admin/users', data, { headers: getAuthHeaders() });

export const updateAdminUser = (id: string, data: { firstName?: string; lastName?: string; email?: string; role?: string; plan?: string }) =>
  api.patch(`/admin/users/${id}`, data, { headers: getAuthHeaders() });

export const fetchAdminSubscriptions = () =>
  api.get('/admin/subscriptions', { headers: getAuthHeaders() });

export const fetchAdminCrisisAlerts = (filter?: string) =>
  api.get(`/admin/crisis-alerts${filter && filter !== 'all' ? `?filter=${filter}` : ''}`, { headers: getAuthHeaders() });

export const resolveAdminCrisisAlert = (id: string) =>
  api.patch(`/admin/crisis-alerts/${id}/resolve`, {}, { headers: getAuthHeaders() });

// ─── Newsletter ───────────────────────────────────────────────────────────────

export const subscribeNewsletter = (email: string) =>
  api.post('/newsletter/subscribe', { email });

export const unsubscribeNewsletter = () =>
  api.post('/newsletter/unsubscribe', {}, { headers: getAuthHeaders() });

export const fetchNewsletterStatus = () =>
  api.get('/newsletter/status', { headers: getAuthHeaders() });

export const saveBirthDate = (birthDate: string) =>
  api.patch('/users/me/birth-date', { birthDate }, { headers: getAuthHeaders() });

export const logoutApi = () =>
  api.post('/auth/logout');
