import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  plan?: string;
  createdAt?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    plan: 'Free',
    createdAt: '',
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(user);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    newsletter: false,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const userData = data.user || data;
          const profile: UserProfile = {
            firstName: userData.firstName || userData.firstname || '',
            lastName: userData.lastName || userData.lastname || '',
            email: userData.email || '',
            phone: userData.phone || '',
            birthDate: userData.birthDate || userData.birth_date || '',
            plan: userData.plan || 'Free',
            createdAt: userData.createdAt || userData.created_at || '',
          };
          setUser(profile);
          setFormData(profile);
        } else {
          localStorage.removeItem('token');
          navigate('/auth');
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
    const token = localStorage.getItem('token');
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
          phone: formData.phone,
          birthDate: formData.birthDate,
        }),
      });

      if (response.ok) {
        setUser(formData);
        setEditMode(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    navigate('/auth');
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
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
        <button className="profile-header__back" onClick={() => navigate(-1)}>
          ←
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
            <button className="profile-avatar-card__edit-btn">
              <span>📷</span>
            </button>
          </div>
          <div className="profile-avatar-card__info">
            <h2 className="profile-avatar-card__name">
              {user.firstName} {user.lastName}
            </h2>
            <p className="profile-avatar-card__plan">
              Membre {user.plan === 'premium' ? 'Premium' : 'Free'}
            </p>
            <p className="profile-avatar-card__since">
              Membre depuis {formatMemberSince(user.createdAt)}
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="profile-success-banner">
            ✅ Profil mis à jour avec succès
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
              <div className="profile-form__row">
                <div className="profile-form__field">
                  <label className="profile-form__label">Téléphone</label>
                  <input
                    className="profile-form__input"
                    value={editMode ? formData.phone || '' : user.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!editMode}
                    placeholder="+33 6 00 00 00 00"
                  />
                </div>
                <div className="profile-form__field">
                  <label className="profile-form__label">Date de naissance</label>
                  <input
                    className="profile-form__input"
                    value={editMode ? formData.birthDate || '' : user.birthDate || ''}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    disabled={!editMode}
                    type="date"
                  />
                </div>
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
                <button className="profile-btn profile-btn--primary profile-btn--sm">Modifier</button>
              </div>
              <div className="profile-security__divider" />
              <div className="profile-security__row profile-security__row--2fa">
                <span className="profile-security__label">Authentification à deux facteurs</span>
                <button className="profile-btn profile-btn--outline profile-btn--sm">Activer</button>
              </div>
            </div>

            {/* Abonnement */}
            <h3 className="profile-card__title" style={{ marginTop: '2rem' }}>Abonnement &amp; Facturation</h3>
            <div className="profile-subscription">
              <div className="profile-subscription__plan-row">
                <div>
                  <p className="profile-subscription__plan-name">
                    Plan {user.plan === 'premium' ? 'premium' : 'free'}
                  </p>
                  <p className="profile-subscription__plan-price">
                    {user.plan === 'premium' ? '14,99€ / Mois' : 'Gratuit'}
                  </p>
                </div>
                <span className={`profile-subscription__badge ${user.plan === 'premium' ? 'profile-subscription__badge--premium' : ''}`}>
                  Actif
                </span>
              </div>
              <div className="profile-subscription__actions">
                <button className="profile-btn profile-btn--outline profile-btn--sm" onClick={() => navigate('/#title')}>
                  Changer de plan
                </button>
                {user.plan === 'premium' && (
                  <button className="profile-btn profile-btn--danger profile-btn--sm">
                    Annuler l'abonnement
                  </button>
                )}
              </div>
              <div className="profile-subscription__billing-row">
                <div>
                  <p className="profile-subscription__billing-title">Historique de facturation</p>
                  <p className="profile-subscription__billing-sub">Téléchargez vos factures</p>
                </div>
                <button className="profile-btn profile-btn--primary profile-btn--sm">Voir</button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="profile-card">
            <h3 className="profile-card__title">Notifictaions</h3>
            <div className="profile-notifications">
              {[
                { key: 'email' as const, label: 'Notifications par email' },
                { key: 'sms' as const, label: 'Notifications SMS' },
                { key: 'newsletter' as const, label: 'Newsletter MAX' },
              ].map(({ key, label }) => (
                <div key={key} className="profile-notifications__row">
                  <span className="profile-notifications__label">{label}</span>
                  <button
                    className={`profile-toggle ${notifications[key] ? 'profile-toggle--on' : ''}`}
                    onClick={() => toggleNotification(key)}
                  >
                    <span className="profile-toggle__thumb" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Compte */}
          <div className="profile-card">
            <div className="profile-account-action">
              <div>
                <p className="profile-account-action__title">Déconnexion</p>
                <p className="profile-account-action__sub">Se déconnecter de votre compte</p>
              </div>
              <button className="profile-btn profile-btn--outline" onClick={handleLogout}>
                Deconnexion
              </button>
            </div>
            <div className="profile-account-action__divider" />
            <div className="profile-account-action">
              <div>
                <p className="profile-account-action__title">Supprimer mon compte</p>
                <p className="profile-account-action__sub">Cette action est irréversible</p>
              </div>
              <button className="profile-btn profile-btn--danger">Supprimer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
