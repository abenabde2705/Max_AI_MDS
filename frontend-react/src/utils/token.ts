/**
 * Utilitaire centralisé pour la gestion de la session auth.
 * Le token JWT réel n'est plus stocké côté client — il vit dans un cookie httpOnly.
 * On stocke uniquement le timestamp d'expiration (info non-sensible) pour les
 * vérifications côté client (ProtectedRoute, NavBar, etc.)
 *
 * - "Rester connecté" coché  → localStorage  (persiste après fermeture)
 * - "Rester connecté" décoché → sessionStorage (effacé à la fermeture du navigateur)
 */

/** Stocke l'expiry de session (extrait du JWT) sans stocker le token lui-même. */
export const setToken = (token: string, remember: boolean): void => {
  let exp: number;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    exp = typeof payload.exp === 'number' ? payload.exp : Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
  } catch {
    exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
  }
  const storage = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;
  storage.setItem('auth_exp', String(exp));
  other.removeItem('auth_exp');
  window.dispatchEvent(new Event('storage'));
};

/**
 * Retourne 'authenticated' si la session est valide, null sinon.
 * Valeur truthy/falsy compatible avec tout le code existant.
 */
export const getToken = (): string | null => {
  const exp = localStorage.getItem('auth_exp') ?? sessionStorage.getItem('auth_exp');
  if (!exp) return null;
  if (Number(exp) * 1000 < Date.now()) {
    removeToken();
    return null;
  }
  return 'authenticated';
};

export const removeToken = (): void => {
  localStorage.removeItem('auth_exp');
  sessionStorage.removeItem('auth_exp');
  window.dispatchEvent(new Event('storage'));
};
