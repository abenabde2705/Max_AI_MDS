import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAdminVerifications, reviewStudentVerification } from '../services/chat.api';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

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

const API_URL = import.meta.env.VITE_API_URL;

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  // Vérification rôle admin via le profil
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/auth'); return; }

    fetch(`${API_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.user?.role !== 'admin') {
          setAuthError(true);
        }
      })
      .catch(() => setAuthError(true));
  }, [navigate]);

  const loadVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchAdminVerifications(filter);
      setVerifications(data.data ?? []);
    } catch {
      showToast('Erreur lors du chargement.', 'err');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!authError) loadVerifications();
  }, [loadVerifications, authError]);

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await reviewStudentVerification(id, 'approved');
      showToast('Vérification approuvée ✓', 'ok');
      loadVerifications();
    } catch {
      showToast('Erreur lors de l\'approbation.', 'err');
    } finally {
      setActionLoading(null);
    }
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
    } catch {
      showToast('Erreur lors du rejet.', 'err');
    } finally {
      setActionLoading(null);
    }
  };

  const counts = {
    pending: verifications.filter(v => v.status === 'pending').length,
    approved: verifications.filter(v => v.status === 'approved').length,
    rejected: verifications.filter(v => v.status === 'rejected').length,
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Gère les anciens chemins absolus stockés en DB et les nouveaux chemins relatifs
  const cardImageUrl = (p: string) => {
    // Si le chemin contient déjà 'uploads/student-cards/', on extrait juste le nom du fichier
    const match = p.match(/uploads\/student-cards\/(.+)$/);
    const filename = match ? match[1] : p.split('/').pop();
    return `${API_URL}/uploads/student-cards/${filename}`;
  };
  const isPdf = (p: string) => p.endsWith('.pdf');

  if (authError) {
    return (
      <div className="admin-page">
        <div className="admin-403">
          <span>🔒</span>
          <h2>Accès refusé</h2>
          <p>Vous n'avez pas les droits pour accéder à cette page.</p>
          <button className="profile-btn profile-btn--primary" onClick={() => navigate('/')}>Retour à l'accueil</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Toast */}
      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* Preview lightbox */}
      {previewUrl && (
        <div className="admin-lightbox" onClick={() => setPreviewUrl(null)}>
          <button className="admin-lightbox__close" onClick={() => setPreviewUrl(null)}>✕</button>
          <img src={previewUrl} alt="Carte étudiante" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <div className="admin-header__left">
          <button className="admin-back" onClick={() => navigate('/')}>← Retour</button>
          <div>
            <h1 className="admin-title">Administration</h1>
            <p className="admin-subtitle">Vérifications étudiantes</p>
          </div>
        </div>
        <div className="admin-stats">
          <div className="admin-stat admin-stat--pending">
            <span className="admin-stat__num">{counts.pending}</span>
            <span className="admin-stat__label">En attente</span>
          </div>
          <div className="admin-stat admin-stat--approved">
            <span className="admin-stat__num">{counts.approved}</span>
            <span className="admin-stat__label">Approuvées</span>
          </div>
          <div className="admin-stat admin-stat--rejected">
            <span className="admin-stat__num">{counts.rejected}</span>
            <span className="admin-stat__label">Rejetées</span>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="admin-filters">
        {(['pending', 'approved', 'rejected', 'all'] as FilterStatus[]).map(f => (
          <button
            key={f}
            className={`admin-filter-btn${filter === f ? ' admin-filter-btn--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'pending' ? 'En attente' : f === 'approved' ? 'Approuvées' : f === 'rejected' ? 'Rejetées' : 'Toutes'}
          </button>
        ))}
        <button className="admin-refresh" onClick={loadVerifications} title="Rafraîchir">↻</button>
      </div>

      {/* Liste */}
      <div className="admin-list">
        {loading && (
          <div className="admin-empty">
            <div className="admin-spinner" />
            <p>Chargement…</p>
          </div>
        )}

        {!loading && verifications.length === 0 && (
          <div className="admin-empty">
            <span>📭</span>
            <p>Aucune vérification {filter !== 'all' ? `avec le statut « ${filter} »` : ''}.</p>
          </div>
        )}

        {!loading && verifications.map(v => (
          <div key={v.id} className={`admin-card admin-card--${v.status}`}>
            {/* Document preview */}
            <div className="admin-card__preview">
              {isPdf(v.cardImagePath) ? (
                <a href={cardImageUrl(v.cardImagePath)} target="_blank" rel="noreferrer" className="admin-card__pdf">
                  <span>📄</span>
                  <span>Ouvrir le PDF</span>
                </a>
              ) : (
                <img
                  src={cardImageUrl(v.cardImagePath)}
                  alt="Carte étudiante"
                  className="admin-card__img"
                  onClick={() => setPreviewUrl(cardImageUrl(v.cardImagePath))}
                />
              )}
            </div>

            {/* Infos */}
            <div className="admin-card__info">
              <div className="admin-card__top">
                <div>
                  <p className="admin-card__name">
                    {v.userFirstName && v.userLastName
                      ? `${v.userFirstName} ${v.userLastName}`
                      : 'Utilisateur inconnu'}
                  </p>
                  <p className="admin-card__email">{v.userEmail ?? v.userId}</p>
                </div>
                <span className={`admin-badge admin-badge--${v.status}`}>
                  {v.status === 'pending' ? 'En attente' : v.status === 'approved' ? 'Approuvée' : 'Rejetée'}
                </span>
              </div>

              <p className="admin-card__date">Soumis le {formatDate(v.submittedAt)}</p>
              {v.reviewedAt && <p className="admin-card__date">Examiné le {formatDate(v.reviewedAt)}</p>}
              {v.rejectionReason && (
                <p className="admin-card__reason">Motif : {v.rejectionReason}</p>
              )}

              {/* Actions (uniquement pour pending) */}
              {v.status === 'pending' && (
                <div className="admin-card__actions">
                  {rejectingId === v.id ? (
                    <div className="admin-reject-form">
                      <input
                        className="admin-reject-input"
                        placeholder="Motif du rejet (obligatoire)…"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        autoFocus
                      />
                      <div className="admin-reject-btns">
                        <button
                          className="admin-btn admin-btn--danger"
                          onClick={() => handleReject(v.id)}
                          disabled={!rejectReason.trim() || actionLoading === v.id}
                        >
                          {actionLoading === v.id ? '…' : 'Confirmer le rejet'}
                        </button>
                        <button
                          className="admin-btn admin-btn--ghost"
                          onClick={() => { setRejectingId(null); setRejectReason(''); }}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        className="admin-btn admin-btn--approve"
                        onClick={() => handleApprove(v.id)}
                        disabled={actionLoading === v.id}
                      >
                        {actionLoading === v.id ? '…' : '✓ Approuver'}
                      </button>
                      <button
                        className="admin-btn admin-btn--reject"
                        onClick={() => setRejectingId(v.id)}
                      >
                        ✕ Rejeter
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
