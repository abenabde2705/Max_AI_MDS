import { getToken, removeToken } from '../utils/token';
import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoMax from '../assets/img/logomax.png';
import { Lock, FileText, RefreshCw } from 'lucide-react';
import {
  fetchAdminVerifications,
  reviewStudentVerification,
  fetchAdminUsers,
  deleteAdminUser,
  createAdminUser,
  fetchAdminSubscriptions,
  fetchAdminCrisisAlerts,
  resolveAdminCrisisAlert,
} from '../services/chat.api';

type Section = 'users' | 'subscriptions' | 'alerts';
type SubTab = 'all' | 'student';
type AlertFilter = 'all' | 'unread' | 'urgent';

interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  plan: string;
  messageCount: number;
  createdAt: string;
}

interface AdminSubscription {
  id: string;
  userId: string;
  userEmail: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  plan: string;
  status: string;
  startDate: string;
  endDate: string | null;
  stripePeriodEnd: string | null;
}

interface Verification {
  id: string;
  userId: string;
  userEmail: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  status: 'pending' | 'approved' | 'rejected';
  cardImagePath: string;
  submittedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

interface CrisisAlertItem {
  id: string;
  userId: string;
  userEmail: string | null;
  userFirstName: string | null;
  userLastName: string | null;
  messageContent: string;
  severity: 'urgent' | 'moderate';
  status: 'unread' | 'resolved';
  detectedAt: string;
  resolvedAt: string | null;
}

const API_URL = import.meta.env.VITE_API_URL;

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>('users');
  const [authError, setAuthError] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  // Users
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userStats, setUserStats] = useState({ total: 0, active: 0, paying: 0 });
  const [userSearch, setUserSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ firstName: '', lastName: '', email: '', dateOfBirth: '', phone: '', plan: 'free' });
  const [addUserLoading, setAddUserLoading] = useState(false);

  // Subscriptions
  const [subTab, setSubTab] = useState<SubTab>('all');
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [subStats, setSubStats] = useState({ monthlyRevenue: '0.00', premiumCount: 0, studentCount: 0, freeCount: 0 });
  const [subsLoading, setSubsLoading] = useState(false);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Crisis Alerts
  const [alerts, setAlerts] = useState<CrisisAlertItem[]>([]);
  const [alertStats, setAlertStats] = useState({ total: 0, unread: 0, urgent: 0, resolved: 0 });
  const [alertFilter, setAlertFilter] = useState<AlertFilter>('all');
  const [alertsLoading, setAlertsLoading] = useState(false);

  // Sidebar indicator
  const navSections: Section[] = ['users', 'subscriptions', 'alerts'];
  const activeIndex = navSections.indexOf(section);
  const navRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorTop, setIndicatorTop] = useState(0);
  const [indicatorReady, setIndicatorReady] = useState(false);

  useLayoutEffect(() => {
    const activeBtn = btnRefs.current[activeIndex];
    const nav = navRef.current;
    if (activeBtn && nav) {
      const navRect = nav.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      setIndicatorTop(btnRect.top - navRect.top);
      setIndicatorReady(true);
    }
  }, [activeIndex]);

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate('/auth'); return; }
    fetch(`${API_URL}/api/auth/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.user?.role !== 'admin') setAuthError(true); })
      .catch(() => setAuthError(true));
  }, [navigate]);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const { data } = await fetchAdminUsers(userSearch || undefined);
      setUsers(data.data?.users ?? []);
      setUserStats(data.data?.stats ?? { total: 0, active: 0, paying: 0 });
    } catch { showToast('Erreur chargement utilisateurs', 'err'); }
    finally { setUsersLoading(false); }
  }, [userSearch]);

  const loadSubscriptions = useCallback(async () => {
    setSubsLoading(true);
    try {
      const { data } = await fetchAdminSubscriptions();
      setSubscriptions(data.data?.subscriptions ?? []);
      setSubStats(data.data?.stats ?? { monthlyRevenue: '0.00', premiumCount: 0, studentCount: 0, freeCount: 0 });
    } catch { showToast('Erreur chargement abonnements', 'err'); }
    finally { setSubsLoading(false); }
  }, []);

  const loadVerifications = useCallback(async () => {
    setVerifyLoading(true);
    try {
      const { data } = await fetchAdminVerifications('all');
      setVerifications(data.data ?? []);
    } catch { showToast('Erreur chargement vérifications', 'err'); }
    finally { setVerifyLoading(false); }
  }, []);

  const loadAlerts = useCallback(async () => {
    setAlertsLoading(true);
    try {
      const { data } = await fetchAdminCrisisAlerts(alertFilter);
      setAlerts(data.data?.alerts ?? []);
      setAlertStats(data.data?.stats ?? { total: 0, unread: 0, urgent: 0, resolved: 0 });
    } catch { showToast('Erreur chargement alertes', 'err'); }
    finally { setAlertsLoading(false); }
  }, [alertFilter]);

  useEffect(() => { if (!authError && section === 'users') loadUsers(); }, [section, authError, loadUsers]);
  useEffect(() => {
    if (!authError && section === 'subscriptions') {
      loadSubscriptions();
      loadVerifications();
    }
  }, [section, authError, loadSubscriptions, loadVerifications]);
  useEffect(() => { if (!authError && section === 'alerts') loadAlerts(); }, [section, authError, loadAlerts]);

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteAdminUser(id);
      showToast('Utilisateur supprimé', 'ok');
      setDeleteConfirm(null);
      loadUsers();
    } catch { showToast('Erreur suppression', 'err'); }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await reviewStudentVerification(id, 'approved');
      showToast('Vérification approuvée ✓', 'ok');
      loadVerifications();
    // eslint-disable-next-line quotes
    } catch { showToast("Erreur lors de l'approbation.", 'err'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return;
    setActionLoading(id);
    try {
      await reviewStudentVerification(id, 'rejected', rejectReason.trim());
      showToast('Vérification rejetée.', 'ok');
      setRejectingId(null);
      setRejectReason('');
      loadVerifications();
    } catch { showToast('Erreur lors du rejet.', 'err'); }
    finally { setActionLoading(null); }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await resolveAdminCrisisAlert(id);
      showToast('Alerte résolue', 'ok');
      loadAlerts();
    } catch { showToast('Erreur résolution alerte', 'err'); }
  };

  const handleAddUser = async () => {
    if (!addUserForm.firstName.trim() || !addUserForm.email) {
      showToast('Prénom et email sont requis', 'err');
      return;
    }
    setAddUserLoading(true);
    try {
      await createAdminUser({
        firstName: addUserForm.firstName.trim(),
        lastName: addUserForm.lastName.trim(),
        email: addUserForm.email,
        dateOfBirth: addUserForm.dateOfBirth || undefined,
        plan: addUserForm.plan,
      });
      showToast('Utilisateur créé avec succès', 'ok');
      setShowAddUser(false);
      setAddUserForm({ firstName: '', lastName: '', email: '', dateOfBirth: '', phone: '', plan: 'free' });
      loadUsers();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Erreur création utilisateur', 'err');
    } finally {
      setAddUserLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getInitials = (firstName: string | null, lastName: string | null, email: string | null) => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (email) return email.slice(0, 2).toUpperCase();
    return 'U';
  };

  const getUserName = (firstName: string | null, lastName: string | null, email: string | null) => {
    if (firstName || lastName) return `${firstName || ''} ${lastName || ''}`.trim();
    return email || 'Utilisateur';
  };

  const cardImageUrl = (p: string) => {
    const match = p.match(/uploads\/student-cards\/(.+)$/);
    const filename = match ? match[1] : p.split('/').pop();
    return `${API_URL}/uploads/student-cards/${filename}`;
  };
  const isPdf = (p: string) => p.endsWith('.pdf');

  const getPlanLabel = (plan: string) => {
    if (plan === 'premium') return 'Premium';
    if (plan === 'student') return 'Campus';
    return 'Free';
  };

  const getPlanAmount = (plan: string) => {
    if (plan === 'premium') return '14,99€/mois';
    if (plan === 'student') return '8€/mois';
    return 'Gratuit';
  };

  if (authError) {
    return (
      <div className="adm-error">
        <Lock size={48} strokeWidth={1.5} />
        <h2>Accès refusé</h2>
        <p>Vous n'avez pas les droits pour accéder à cette page.</p>
        <button onClick={() => navigate('/')}>Retour à l'accueil</button>
      </div>
    );
  }

  return (
    <div className="adm-root">
      {/* Toast */}
      {toast && <div className={`adm-toast adm-toast--${toast.type}`}>{toast.msg}</div>}

      {/* Preview lightbox */}
      {previewUrl && (
        <div className="adm-lightbox" onClick={() => setPreviewUrl(null)}>
          <button className="adm-lightbox__close" onClick={() => setPreviewUrl(null)}>✕</button>
          <img src={previewUrl} alt="Carte étudiante" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Add user modal */}
      {showAddUser && (
        <div className="adm-modal-overlay" onClick={() => setShowAddUser(false)}>
          <div className="adm-add-user-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-add-user-modal__header">
              <h2 className="adm-add-user-modal__title">Ajouter un utilisateur</h2>
              <button className="adm-add-user-modal__close" onClick={() => setShowAddUser(false)}>✕</button>
            </div>

            <div className="adm-add-user-modal__row">
              <div className="adm-add-user-modal__field">
                <label>Prénom</label>
                <input
                  type="text"
                  placeholder="John"
                  value={addUserForm.firstName}
                  onChange={e => setAddUserForm(f => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="adm-add-user-modal__field">
                <label>Nom</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={addUserForm.lastName}
                  onChange={e => setAddUserForm(f => ({ ...f, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="adm-add-user-modal__field">
              <label>E-mail</label>
              <input
                type="email"
                placeholder="example@email.com"
                value={addUserForm.email}
                onChange={e => setAddUserForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            <div className="adm-add-user-modal__field">
              <label>Date de naissance</label>
              <input
                type="date"
                value={addUserForm.dateOfBirth}
                onChange={e => setAddUserForm(f => ({ ...f, dateOfBirth: e.target.value }))}
              />
            </div>

            <div className="adm-add-user-modal__field">
              <label>Téléphone</label>
              <input
                type="tel"
                placeholder="+33 6 00 00 00 00"
                value={addUserForm.phone}
                onChange={e => setAddUserForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>

            <div className="adm-add-user-modal__field">
              <label>Plan</label>
              <select
                value={addUserForm.plan}
                onChange={e => setAddUserForm(f => ({ ...f, plan: e.target.value }))}
              >
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="student">Campus</option>
              </select>
            </div>

            <div className="adm-add-user-modal__actions">
              <button className="adm-add-user-modal__btn adm-add-user-modal__btn--cancel" onClick={() => setShowAddUser(false)}>
                Annuler
              </button>
              <button
                className="adm-add-user-modal__btn adm-add-user-modal__btn--create"
                onClick={handleAddUser}
                disabled={addUserLoading}
              >
                {addUserLoading ? '…' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="adm-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h3>Confirmer la suppression</h3>
            <p>Cette action est irréversible. L'utilisateur et toutes ses données seront supprimés.</p>
            <div className="adm-modal__actions">
              <button className="adm-btn adm-btn--danger" onClick={() => handleDeleteUser(deleteConfirm)}>Supprimer</button>
              <button className="adm-btn adm-btn--ghost" onClick={() => setDeleteConfirm(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="adm-sidebar">
        <div className="max-chat__logo">
          <button className="max-chat__logo-icon" onClick={() => navigate('/')} title="Retour à l'accueil">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DAE63D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <img src={LogoMax} alt="MAX Logo" className="max-chat__logo-image" />
        </div>

        <div className="adm-sidebar__title">
          <span>DashBoard</span>
          <span>Admin</span>
        </div>

        <nav className="max-chat__nav" ref={navRef}>
          <div
            className="max-chat__nav-indicator"
            style={{ transform: `translateY(${indicatorTop}px)`, opacity: indicatorReady ? 1 : 0 }}
          />
          {(['users', 'subscriptions', 'alerts'] as Section[]).map((s, i) => (
            <button
              key={s}
              ref={el => { btnRefs.current[i] = el; }}
              className={`max-chat__nav-button${section === s ? ' max-chat__nav-button--active' : ''}`}
              onClick={() => setSection(s)}
            >
              {s === 'users' ? 'Utilisateurs' : s === 'subscriptions' ? 'Abonnements' : 'Alertes Crise'}
            </button>
          ))}
        </nav>

        <div className="max-chat__premium">
          <p className="max-chat__premium-note">Dashboard d'administration Max</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="adm-main">

        {/* ── USERS ── */}
        {section === 'users' && (
          <div className="adm-section">
            <div className="adm-section__header">
              <div className="adm-section__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <h1>Gestion des utilisateurs</h1>
                <p>Gérez les comptes, bannissements et accès des utilisateurs</p>
              </div>
            </div>

            <div className="adm-stats-row">
              <div className="adm-stat-card">
                <span className="adm-stat-card__label">Total utilisateurs</span>
                <span className="adm-stat-card__value">{userStats.total}</span>
              </div>
              <div className="adm-stat-card">
                <span className="adm-stat-card__label">Actifs</span>
                <span className="adm-stat-card__value">{userStats.active}</span>
              </div>
              <div className="adm-stat-card">
                <span className="adm-stat-card__label">Abonnés payants</span>
                <span className="adm-stat-card__value">{userStats.paying}</span>
              </div>
            </div>

            <div className="adm-toolbar">
              <div className="adm-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="Rechercher utilisateur ....."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadUsers()}
                />
              </div>
              <button className="adm-btn adm-btn--primary" onClick={loadUsers}><RefreshCw size={14} style={{ marginRight: 6 }} />Rafraîchir</button>
              <button className="adm-btn adm-btn--add" onClick={() => setShowAddUser(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Ajouter un utilisateur
              </button>
            </div>

            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Plan</th>
                    <th>Messages</th>
                    <th>Date d'inscription</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr><td colSpan={5} className="adm-table__empty"><div className="adm-spinner" /></td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={5} className="adm-table__empty">Aucun utilisateur trouvé</td></tr>
                  ) : users.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="adm-user-cell">
                          <div className="adm-avatar">{getInitials(user.firstName, user.lastName, user.email)}</div>
                          <div>
                            <div className="adm-user-name">{getUserName(user.firstName, user.lastName, user.email)}</div>
                            <div className="adm-user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`adm-plan-badge adm-plan-badge--${user.plan}`}>{getPlanLabel(user.plan)}</span></td>
                      <td>{user.messageCount}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <div className="adm-actions">
                          <button
                            className="adm-icon-btn adm-icon-btn--danger"
                            title="Supprimer"
                            onClick={() => setDeleteConfirm(user.id)}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14H6L5 6"/>
                              <path d="M10 11v6"/><path d="M14 11v6"/>
                              <path d="M9 6V4h6v2"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SUBSCRIPTIONS ── */}
        {section === 'subscriptions' && (
          <div className="adm-section">
            <div className="adm-section__header">
              <div className="adm-section__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div>
                <h1>Gestion des Abonnements</h1>
                <p>Suivi des plans, revenus et vérification étudiant</p>
              </div>
            </div>

            <div className="adm-stats-row">
              <div className="adm-stat-card">
                <span className="adm-stat-card__label">Revenu mensuel</span>
                <span className="adm-stat-card__value">{subStats.monthlyRevenue}€</span>
                <span className="adm-stat-card__sub">Abonnements actifs</span>
              </div>
              <div className="adm-stat-card">
                <span className="adm-stat-card__label">Plan Premium</span>
                <span className="adm-stat-card__value">{subStats.premiumCount}</span>
                <span className="adm-stat-card__sub">× 14,99€/mois</span>
              </div>
              <div className="adm-stat-card">
                <span className="adm-stat-card__label">Plan Campus</span>
                <span className="adm-stat-card__value">{subStats.studentCount}</span>
                <span className="adm-stat-card__sub">× 8€/mois</span>
              </div>
              <div className="adm-stat-card">
                <span className="adm-stat-card__label">Vérif. étudiant</span>
                <span className="adm-stat-card__value">{verifications.filter(v => v.status === 'pending').length}</span>
                <span className="adm-stat-card__sub">En attente</span>
              </div>
            </div>

            <div className="adm-distribution">
              <h3>Répartition des abonnements</h3>
              <div className="adm-distribution__row">
                <div className="adm-distribution__item">
                  <span className="adm-distribution__num">{subStats.freeCount}</span>
                  <span className="adm-distribution__label">Free</span>
                </div>
                <div className="adm-distribution__item">
                  <span className="adm-distribution__num">{subStats.premiumCount}</span>
                  <span className="adm-distribution__label">Premium</span>
                </div>
                <div className="adm-distribution__item">
                  <span className="adm-distribution__num">{subStats.studentCount}</span>
                  <span className="adm-distribution__label">Campus</span>
                </div>
              </div>
            </div>

            <div className="adm-tabs">
              <button className={`adm-tab${subTab === 'all' ? ' adm-tab--active' : ''}`} onClick={() => setSubTab('all')}>
                Tous les abonnements
              </button>
              <button className={`adm-tab${subTab === 'student' ? ' adm-tab--active' : ''}`} onClick={() => setSubTab('student')}>
                Vérification étudiante
              </button>
            </div>

            {subTab === 'all' && (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Plan</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Renouvellement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subsLoading ? (
                      <tr><td colSpan={5} className="adm-table__empty"><div className="adm-spinner" /></td></tr>
                    ) : subscriptions.length === 0 ? (
                      <tr><td colSpan={5} className="adm-table__empty">Aucun abonnement</td></tr>
                    ) : subscriptions.map(sub => (
                      <tr key={sub.id}>
                        <td>
                          <div>
                            <div className="adm-user-name">{getUserName(sub.userFirstName, sub.userLastName, sub.userEmail)}</div>
                            <div className="adm-user-email">{sub.userEmail}</div>
                          </div>
                        </td>
                        <td><span className={`adm-plan-badge adm-plan-badge--${sub.plan}`}>{getPlanLabel(sub.plan)}</span></td>
                        <td>{getPlanAmount(sub.plan)}</td>
                        <td>
                          <span className={`adm-status-badge adm-status-badge--${sub.status}`}>
                            {sub.status === 'active' ? 'Actif' : 'Annulé'}
                          </span>
                        </td>
                        <td>{sub.stripePeriodEnd ? formatDate(sub.stripePeriodEnd) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {subTab === 'student' && (
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Plan</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Document</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifyLoading ? (
                      <tr><td colSpan={6} className="adm-table__empty"><div className="adm-spinner" /></td></tr>
                    ) : verifications.filter(v => v.status === 'pending').length === 0 ? (
                      <tr><td colSpan={6} className="adm-table__empty">Aucune vérification en attente</td></tr>
                    ) : verifications.filter(v => v.status === 'pending').map(v => (
                      <tr key={v.id}>
                        <td>
                          <div>
                            <div className="adm-user-name">{getUserName(v.userFirstName, v.userLastName, v.userEmail)}</div>
                            <div className="adm-user-email">{v.userEmail}</div>
                          </div>
                        </td>
                        <td><span className="adm-plan-badge adm-plan-badge--student">Campus</span></td>
                        <td>8€/mois</td>
                        <td><span className="adm-status-badge adm-status-badge--pending">En attente</span></td>
                        <td>
                          {isPdf(v.cardImagePath) ? (
                            <a href={cardImageUrl(v.cardImagePath)} target="_blank" rel="noreferrer" className="adm-doc-link"><FileText size={14} style={{ marginRight: 4 }} />PDF</a>
                          ) : (
                            <img
                              src={cardImageUrl(v.cardImagePath)}
                              alt="Carte"
                              className="adm-doc-thumb"
                              onClick={() => setPreviewUrl(cardImageUrl(v.cardImagePath))}
                            />
                          )}
                        </td>
                        <td>
                          {rejectingId === v.id ? (
                            <div className="adm-reject-form">
                              <input
                                className="adm-reject-input"
                                placeholder="Motif du rejet..."
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                autoFocus
                              />
                              <div className="adm-reject-btns">
                                <button
                                  className="adm-btn adm-btn--danger adm-btn--sm"
                                  onClick={() => handleReject(v.id)}
                                  disabled={!rejectReason.trim() || actionLoading === v.id}
                                >
                                  {actionLoading === v.id ? '…' : 'Confirmer'}
                                </button>
                                <button
                                  className="adm-btn adm-btn--ghost adm-btn--sm"
                                  onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="adm-actions">
                              <button
                                className="adm-btn adm-btn--approve adm-btn--sm"
                                onClick={() => handleApprove(v.id)}
                                disabled={actionLoading === v.id}
                              >
                                Valider
                              </button>
                              <button className="adm-btn adm-btn--reject adm-btn--sm" onClick={() => setRejectingId(v.id)}>
                                Refuser
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── CRISIS ALERTS ── */}
        {section === 'alerts' && (
          <div className="adm-section">
            <div className="adm-section__header">
              <div className="adm-section__icon adm-section__icon--red">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div>
                <h1>Alertes de Crise</h1>
                <p>Notifications de messages à risque détectés par le chatbot</p>
              </div>
            </div>

            <div className="adm-stats-row">
              <div className="adm-stat-card">
                <span className="adm-stat-card__label">Total alertes</span>
                <span className="adm-stat-card__value">{alertStats.total}</span>
              </div>
              <div className="adm-stat-card">
                <span className="adm-stat-card__label">Non lues</span>
                <span className="adm-stat-card__value">{alertStats.unread}</span>
              </div>
              <div className="adm-stat-card">
                <span className="adm-stat-card__label">Haute priorité</span>
                <span className="adm-stat-card__value">{alertStats.urgent}</span>
              </div>
              <div className="adm-stat-card">
                <span className="adm-stat-card__label">Résolues</span>
                <span className="adm-stat-card__value">{alertStats.resolved}</span>
              </div>
            </div>

            <div className="adm-tabs">
              <button className={`adm-tab${alertFilter === 'all' ? ' adm-tab--active' : ''}`} onClick={() => setAlertFilter('all')}>Toutes</button>
              <button className={`adm-tab${alertFilter === 'unread' ? ' adm-tab--active' : ''}`} onClick={() => setAlertFilter('unread')}>Non Lues</button>
              <button className={`adm-tab${alertFilter === 'urgent' ? ' adm-tab--active' : ''}`} onClick={() => setAlertFilter('urgent')}>Haute priorité</button>
            </div>

            {alertsLoading ? (
              <div className="adm-empty"><div className="adm-spinner" /></div>
            ) : alerts.length === 0 ? (
              <div className="adm-empty"><p>Aucune alerte</p></div>
            ) : (
              <div className="adm-alerts-list">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`adm-alert-card adm-alert-card--${alert.severity}${alert.status === 'resolved' ? ' adm-alert-card--resolved' : ''}`}
                  >
                    <div className="adm-alert-card__header">
                      <div>
                        <span className="adm-alert-card__name">
                          {getUserName(alert.userFirstName, alert.userLastName, alert.userEmail)}
                        </span>
                        <span className={`adm-severity-badge adm-severity-badge--${alert.severity}`}>
                          {alert.severity === 'urgent' ? 'Urgence' : 'Modéré'}
                        </span>
                        {alert.status === 'resolved' && (
                          <span className="adm-severity-badge adm-severity-badge--resolved">Résolu</span>
                        )}
                      </div>
                      {alert.status === 'unread' && (
                        <button className="adm-btn adm-btn--resolve" onClick={() => handleResolveAlert(alert.id)}>
                          Résoudre
                        </button>
                      )}
                    </div>
                    <div className="adm-alert-card__email">{alert.userEmail}</div>
                    <div className="adm-alert-card__time">{formatDateTime(alert.detectedAt)}</div>
                    <div className="adm-alert-card__message">
                      "{alert.messageContent.slice(0, 120)}{alert.messageContent.length > 120 ? '...' : ''}"
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
