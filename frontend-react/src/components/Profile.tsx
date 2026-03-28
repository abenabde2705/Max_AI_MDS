import { getToken, removeToken } from '../utils/token';
import React, { useState, useEffect } from 'react';

const EyeOn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { fetchCurrentSubscription, cancelSubscription, createPortalSession, subscribeNewsletter, unsubscribeNewsletter, fetchNewsletterStatus } from '../services/chat.api';
import { useBirthDate } from '../context/BirthDateContext';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string;
  plan?: string;
  createdAt?: string;
  isOAuthAccount?: boolean;
}

interface SubscriptionInfo {
  plan: 'premium' | 'student' | 'free';
  status: 'active' | 'canceled';
  stripePeriodEnd?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { setBirthDate: setContextBirthDate } = useBirthDate();
  const [user, setUser] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    birthDate: '',
    plan: 'Free',
    createdAt: '',
  });
  const [subscription, setSubscription] = useState<SubscriptionInfo>({ plan: 'free', status: 'active' });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(user);
  const [notifications, setNotifications] = useState({
    newsletter: false,
  });
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const [profileResponse, subResponse] = await Promise.allSettled([
          fetch(`${API_URL}/api/auth/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetchCurrentSubscription()
        ]);

        if (profileResponse.status === 'fulfilled' && profileResponse.value.ok) {
          const data = await profileResponse.value.json();
          const userData = data.user || data;
          const profile: UserProfile = {
            firstName: userData.firstName || userData.firstname || '',
            lastName: userData.lastName || userData.lastname || '',
            email: userData.email || '',
            birthDate: userData.birthDate || userData.birth_date || '',
            plan: userData.plan || 'Free',
            createdAt: userData.createdAt || userData.created_at || '',
            isOAuthAccount: userData.isOAuthAccount || false,
          };
          setUser(profile);
          setFormData(profile);
        } else {
          removeToken();
          navigate('/auth');
          return;
        }

        if (subResponse.status === 'fulfilled') {
          const subData = subResponse.value.data;
          if (subData.success && subData.data) {
            setSubscription(subData.data);
          }
        }

        try {
          const { data: nlData } = await fetchNewsletterStatus();
          setNotifications(prev => ({ ...prev, newsletter: nlData.subscribed }));
        } catch {
          // silently ignore
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const getInitials = () => {
    const f = user.firstName?.[0] || '';
    const l = user.lastName?.[0] || '';
    return (f + l).toUpperCase() || 'U';
  };

  const formatMemberSince = (dateStr?: string) => {
    if (!dateStr) return 'Janvier 2025';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const handleSave = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          birthDate: formData.birthDate,
        }),
      });

      if (response.ok) {
        setUser(formData);
        if (formData.birthDate) setContextBirthDate(formData.birthDate);
        localStorage.setItem('name', `${formData.firstName} ${formData.lastName}`.trim());
        window.dispatchEvent(new Event('storage'));
        setEditMode(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (passwordForm.next.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    const token = getToken();
    if (!token) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.next }),
      });
      const data = await response.json();
      if (!response.ok) {
        setPasswordError(data.message || 'Erreur lors du changement de mot de passe.');
        return;
      }
      setPasswordSuccess(true);
      setShowPasswordForm(false);
      setPasswordForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch {
      setPasswordError('Erreur réseau. Veuillez réessayer.');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError('');
    const token = getToken();
    if (!token) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        setDeleteError(data.message || 'Erreur lors de la suppression.');
        setDeleteLoading(false);
        return;
      }
      removeToken();
      localStorage.clear();
      navigate('/auth');
    } catch {
      setDeleteError('Erreur réseau. Veuillez réessayer.');
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem('name');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    navigate('/auth');
  };

  const toggleNotification = async (key: keyof typeof notifications) => {
    if (key === 'newsletter') {
      setNewsletterLoading(true);
      const newValue = !notifications.newsletter;
      try {
        if (newValue) {
          await subscribeNewsletter(user.email);
        } else {
          await unsubscribeNewsletter();
        }
        setNotifications(prev => ({ ...prev, newsletter: newValue }));
      } catch {
        // silently ignore, keep current state
      } finally {
        setNewsletterLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading__spinner" />
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <button className="profile-header__back" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="profile-header__title">Mon Profil</h1>
          <p className="profile-header__subtitle">Gérez vos informations et préférences</p>
        </div>
      </div>

      <div className="profile-content">
        {/* Avatar Section */}
        <div className="profile-avatar-card">
          <div className="profile-avatar-card__avatar">
            <span>{getInitials()}</span>
          </div>
          <div className="profile-avatar-card__info">
            <h2 className="profile-avatar-card__name">
              {user.firstName} {user.lastName}
            </h2>
            <p className="profile-avatar-card__plan">
              Membre {subscription.plan === 'premium' ? 'Premium' : subscription.plan === 'student' ? 'Campus' : 'Free'}
            </p>
            <p className="profile-avatar-card__since">
              Membre depuis {formatMemberSince(user.createdAt)}
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="profile-success-banner">
            <CheckCircle size={16} style={{ marginRight: 8 }} />Profil mis à jour avec succès
          </div>
        )}

        <div className="profile-grid">
          {/* Informations Personnelles */}
          <div className="profile-card">
            <h3 className="profile-card__title">Informations Personnelles</h3>
            <div className="profile-form">
              <div className="profile-form__row">
                <div className="profile-form__field">
                  <label className="profile-form__label">Prénom</label>
                  <input
                    className="profile-form__input"
                    value={editMode ? formData.firstName : user.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!editMode}
                  />
                </div>
                <div className="profile-form__field">
                  <label className="profile-form__label">Nom</label>
                  <input
                    className="profile-form__input"
                    value={editMode ? formData.lastName : user.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div className="profile-form__field profile-form__field--full">
                <label className="profile-form__label">E-mail</label>
                <input
                  className="profile-form__input"
                  value={user.email}
                  disabled
                  type="email"
                />
              </div>
              <div className="profile-form__field profile-form__field--full">
                <label className="profile-form__label">Date de naissance</label>
                <input
                  className="profile-form__input"
                  value={editMode ? formData.birthDate || '' : user.birthDate || ''}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  disabled={!editMode}
                  type="date"
                />
              </div>
              <div className="profile-form__actions">
                {editMode ? (
                  <>
                    <button className="profile-btn profile-btn--outline" onClick={() => { setEditMode(false); setFormData(user); }}>
                      Annuler
                    </button>
                    <button className="profile-btn profile-btn--primary" onClick={handleSave}>
                      Sauvegarder
                    </button>
                  </>
                ) : (
                  <button className="profile-btn profile-btn--primary" onClick={() => setEditMode(true)}>
                    Modifier
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sécurité */}
          <div className="profile-card">
            <h3 className="profile-card__title">Sécurité</h3>
            <div className="profile-security">
              {user.isOAuthAccount ? (
                <div className="profile-security__row">
                  <div>
                    <p className="profile-security__label">Mot de passe</p>
                    <p className="profile-security__oauth-note">Compte connecté via Google ou Facebook — le mot de passe est géré par votre fournisseur d'identité.</p>
                  </div>
                </div>
              ) : !showPasswordForm ? (
                <div className="profile-security__row">
                  <div>
                    <p className="profile-security__label">Mot de passe</p>
                    <input
                      className="profile-form__input"
                      type="password"
                      value="••••••••••••••••••"
                      disabled
                      style={{ letterSpacing: '3px' }}
                    />
                  </div>
                  <button
                    className="profile-btn profile-btn--primary profile-btn--sm"
                    onClick={() => { setShowPasswordForm(true); setPasswordError(''); setShowCurrent(false); setShowNext(false); setShowConfirm(false); }}
                  >
                    Modifier
                  </button>
                </div>
              ) : (
                <div className="profile-password-form">
                  <div className="profile-form__field">
                    <label className="profile-form__label">Mot de passe actuel</label>
                    <div className="auth-input-wrap">
                      <input
                        className="profile-form__input"
                        type={showCurrent ? 'text' : 'password'}
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        placeholder="••••••••"
                      />
                      <button type="button" className="auth-eye" onClick={() => setShowCurrent(v => !v)} tabIndex={-1}>
                        {showCurrent ? <EyeOff /> : <EyeOn />}
                      </button>
                    </div>
                  </div>
                  <div className="profile-form__field">
                    <label className="profile-form__label">Nouveau mot de passe</label>
                    <div className="auth-input-wrap">
                      <input
                        className="profile-form__input"
                        type={showNext ? 'text' : 'password'}
                        value={passwordForm.next}
                        onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                        placeholder="Min. 8 caractères"
                      />
                      <button type="button" className="auth-eye" onClick={() => setShowNext(v => !v)} tabIndex={-1}>
                        {showNext ? <EyeOff /> : <EyeOn />}
                      </button>
                    </div>
                  </div>
                  <div className="profile-form__field">
                    <label className="profile-form__label">Confirmer le mot de passe</label>
                    <div className="auth-input-wrap">
                      <input
                        className="profile-form__input"
                        type={showConfirm ? 'text' : 'password'}
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        placeholder="••••••••"
                      />
                      <button type="button" className="auth-eye" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                        {showConfirm ? <EyeOff /> : <EyeOn />}
                      </button>
                    </div>
                  </div>
                  {passwordError && <p className="profile-password-form__error">{passwordError}</p>}
                  <div className="profile-form__actions">
                    <button
                      className="profile-btn profile-btn--outline"
                      onClick={() => { setShowPasswordForm(false); setPasswordForm({ current: '', next: '', confirm: '' }); setPasswordError(''); setShowCurrent(false); setShowNext(false); setShowConfirm(false); }}
                    >
                      Annuler
                    </button>
                    <button className="profile-btn profile-btn--primary" onClick={handleChangePassword}>
                      Confirmer
                    </button>
                  </div>
                </div>
              )}
              {passwordSuccess && (
                <div className="profile-success-banner" style={{ marginTop: '0.75rem' }}>
                  <CheckCircle size={16} style={{ marginRight: 8 }} />Mot de passe mis à jour
                </div>
              )}
            </div>

            {/* Abonnement */}
            <h3 className="profile-card__title" style={{ marginTop: '2rem' }}>Abonnement &amp; Facturation</h3>
            <div className="profile-subscription">
              <div className="profile-subscription__plan-row">
                <div>
                  <p className="profile-subscription__plan-name">
                    Plan {subscription.plan === 'premium' ? 'Premium' : subscription.plan === 'student' ? 'Campus' : 'Free'}
                  </p>
                  <p className="profile-subscription__plan-price">
                    {subscription.plan === 'premium' ? '14,99€ / Mois' : subscription.plan === 'student' ? '8€ / Mois' : 'Gratuit'}
                  </p>
                  {subscription.stripePeriodEnd && (
                    <p className="profile-subscription__plan-renew">
                      Renouvellement : {new Date(subscription.stripePeriodEnd).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
                <span className={`profile-subscription__badge ${subscription.plan !== 'free' ? 'profile-subscription__badge--premium' : ''}`}>
                  {subscription.status === 'active' ? 'Actif' : 'Annulé'}
                </span>
              </div>
              <div className="profile-subscription__actions">
                <button className="profile-btn profile-btn--outline profile-btn--sm" onClick={() => {
                  navigate('/');
                  setTimeout(() => {
                    document.getElementById('title')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}>
                  Changer de plan
                </button>
                {subscription.plan !== 'free' && (
                  <>
                    <button
                      className="profile-btn profile-btn--outline profile-btn--sm"
                      onClick={async () => {
                        try {
                          const { data } = await createPortalSession();
                          if (data.url) window.location.href = data.url;
                        } catch {
                          alert('Impossible d\'ouvrir le portail de facturation. Veuillez réessayer.');
                        }
                      }}
                    >
                      Gérer la facturation
                    </button>
                    <button
                      className="profile-btn profile-btn--danger profile-btn--sm"
                      onClick={() => setShowCancelModal(true)}
                    >
                      Annuler l'abonnement
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="profile-card">
            <h3 className="profile-card__title">Notifications</h3>
            <div className="profile-notifications">
              <div className="profile-notifications__row">
                <span className="profile-notifications__label">Newsletter MAX</span>
                <button
                  className={`profile-toggle ${notifications.newsletter ? 'profile-toggle--on' : ''}`}
                  onClick={() => toggleNotification('newsletter')}
                  disabled={newsletterLoading}
                >
                  <span className="profile-toggle__thumb" />
                </button>
              </div>
            </div>
          </div>

          {/* Compte */}
          <div className="profile-card">
            <div className="profile-account-action">
              <div>
                <p className="profile-account-action__title">Déconnexion</p>
                <p className="profile-account-action__sub">Se déconnecter de votre compte</p>
              </div>
              <button className="profile-btn profile-btn--danger" onClick={handleLogout}>
                Deconnexion
              </button>
            </div>
            <div className="profile-account-action__divider" />
            <div className="profile-account-action">
              <div>
                <p className="profile-account-action__title">Supprimer mon compte</p>
                <p className="profile-account-action__sub">Cette action est irréversible</p>
              </div>
              <button className="profile-btn profile-btn--danger" onClick={() => { setShowDeleteModal(true); setDeleteError(''); }}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modale annulation abonnement */}
      {showCancelModal && (
        <div className="profile-modal-overlay" onClick={() => !cancelLoading && setShowCancelModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="profile-modal__title">Annuler l'abonnement</h2>
            <p className="profile-modal__text">
              Votre abonnement restera actif jusqu'à la <strong>fin de la période en cours</strong>, puis ne sera pas renouvelé.
            </p>
            <div className="profile-modal__actions">
              <button
                className="profile-btn profile-btn--outline"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelLoading}
              >
                Annuler 
              </button>
              <button
                className="profile-btn profile-btn--danger"
                disabled={cancelLoading}
                onClick={async () => {
                  setCancelLoading(true);
                  try {
                    await cancelSubscription();
                    setSubscription(prev => ({ ...prev, status: 'canceled' }));
                    setShowCancelModal(false);
                  } catch {
                    alert('Impossible d\'annuler l\'abonnement. Veuillez réessayer.');
                  } finally {
                    setCancelLoading(false);
                  }
                }}
              >
                {cancelLoading ? 'Annulation...' : 'Confirmer l\'annulation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale suppression de compte */}
      {showDeleteModal && (
        <div className="profile-modal-overlay" onClick={() => !deleteLoading && setShowDeleteModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="profile-modal__title">Supprimer mon compte</h2>
            <p className="profile-modal__text">
              Cette action est <strong>définitive et irréversible</strong>. Toutes vos données seront supprimées : conversations, journal, abonnement.
            </p>
            {deleteError && <p className="profile-modal__error">{deleteError}</p>}
            <div className="profile-modal__actions">
              <button
                className="profile-btn profile-btn--outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Annuler
              </button>
              <button
                className="profile-btn profile-btn--danger"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Suppression...' : 'Confirmer la suppression'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
