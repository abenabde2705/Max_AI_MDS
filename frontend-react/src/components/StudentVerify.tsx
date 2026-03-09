import React, { useState, useEffect, useRef } from 'react';
import {
  submitStudentVerification,
  fetchStudentVerificationStatus,
  createCheckoutSession,
} from '../services/chat.api';

type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

interface StudentVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StudentVerifyModal: React.FC<StudentVerifyModalProps> = ({ isOpen, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<VerificationStatus>('none');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const loadStatus = async () => {
      try {
        const { data } = await fetchStudentVerificationStatus();
        if (data.success && data.data) {
          setStatus(data.data.status);
          setRejectionReason(data.data.rejectionReason || '');
        }
      } catch {
        // pas de vérification existante
      }
    };
    loadStatus();
  }, [isOpen]);

  // Ferme avec Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Bloque le scroll body quand ouvert
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier dépasse la taille maximale de 5 Mo.');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setError('Format non supporté. Utilisez JPEG, PNG, WebP ou PDF.');
      return;
    }
    setError('');
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const synth = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(synth);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { setError('Veuillez sélectionner un fichier.'); return; }
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('card', selectedFile);
    try {
      await submitStudentVerification(formData);
      setStatus('pending');
      setSelectedFile(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setUploading(false);
    }
  };

  const handleFinalizeCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const { data } = await createCheckoutSession('student');
      if (data.url) window.location.href = data.url;
    } catch {
      setError('Erreur lors de la création du paiement. Veuillez réessayer.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sv-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sv-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sv-header">
          <div className="sv-header__icon">🎓</div>
          <div>
            <h2 className="sv-title">Vérification Étudiante</h2>
            <p className="sv-subtitle">Tarif Campus à 8€/mois</p>
          </div>
          <button className="sv-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <div className="sv-body">
          {/* Badge de statut */}
          {status === 'approved' && (
            <div className="sv-status sv-status--approved">
              <span className="sv-status__dot" />
              <div>
                <strong>Carte approuvée !</strong>
                <p>Vous pouvez finaliser votre abonnement au tarif étudiant.</p>
              </div>
            </div>
          )}
          {status === 'pending' && (
            <div className="sv-status sv-status--pending">
              <span className="sv-status__dot" />
              <div>
                <strong>Vérification en cours</strong>
                <p>Notre équipe examine votre carte. Revenez dans 24–48h.</p>
              </div>
            </div>
          )}
          {status === 'rejected' && (
            <div className="sv-status sv-status--rejected">
              <span className="sv-status__dot" />
              <div>
                <strong>Vérification rejetée</strong>
                {rejectionReason && <p>Motif : {rejectionReason}</p>}
                <p>Soumettez un nouveau document ci-dessous.</p>
              </div>
            </div>
          )}

          {/* Formulaire */}
          {(status === 'none' || status === 'rejected') && (
            <form onSubmit={handleSubmit} className="sv-form">
              <div
                className={`sv-dropzone${selectedFile ? ' sv-dropzone--active' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
              >
                {selectedFile ? (
                  <>
                    <span className="sv-dropzone__icon">✓</span>
                    <span className="sv-dropzone__name">{selectedFile.name}</span>
                    <span className="sv-dropzone__hint">Cliquez pour changer</span>
                  </>
                ) : (
                  <>
                    <span className="sv-dropzone__icon">📄</span>
                    <span>Cliquez ou glissez votre carte étudiante</span>
                    <span className="sv-dropzone__hint">JPEG, PNG, WebP ou PDF — max 5 Mo</span>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {error && <p className="sv-error">{error}</p>}

              <button
                type="submit"
                className="profile-btn profile-btn--primary sv-submit"
                disabled={uploading || !selectedFile}
              >
                {uploading ? 'Envoi en cours…' : 'Envoyer pour vérification'}
              </button>
            </form>
          )}

          {/* CTA Checkout */}
          {status === 'approved' && (
            <button
              className="profile-btn profile-btn--primary sv-submit"
              onClick={handleFinalizeCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? 'Redirection…' : 'Finaliser mon abonnement — 8€/mois'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentVerifyModal;
