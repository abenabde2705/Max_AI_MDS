/**
 * Utilitaire centralisé pour la gestion du token JWT.
 * - "Rester connecté" coché  → localStorage  (persiste après fermeture)
 * - "Rester connecté" décoché → sessionStorage (effacé à la fermeture du navigateur)
 */

export const getToken = (): string | null =>
  localStorage.getItem('token') ?? sessionStorage.getItem('token');

export const setToken = (token: string, remember: boolean): void => {
  if (remember) {
    localStorage.setItem('token', token);
    sessionStorage.removeItem('token');
  } else {
    sessionStorage.setItem('token', token);
    localStorage.removeItem('token');
  }
  window.dispatchEvent(new Event('storage'));
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  window.dispatchEvent(new Event('storage'));
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};
