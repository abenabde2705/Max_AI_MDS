import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  submitStudentVerification,
  fetchStudentVerificationStatus,
  createCheckoutSession,
} from '../services/chat.api';

type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

const StudentVerify: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<VerificationStatus>('none');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
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
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('card', selectedFile);

    try {
      await submitStudentVerification(formData);
      setStatus('pending');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erreur lors de l\'envoi. Veuillez réessayer.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleFinalizeCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const { data } = await createCheckoutSession('student');
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Erreur lors de la création du paiement. Veuillez réessayer.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="student-verify-page">
      <div className="student-verify-container">
        <button className="profile-btn profile-btn--outline" onClick={() => navigate(-1)}>
          ← Retour
        </button>

        <h1 className="student-verify-title">Vérification Étudiante</h1>
        <p className="student-verify-subtitle">
          Soumettez votre carte étudiante pour bénéficier du tarif étudiant à 8€/mois.
        </p>

        {/* État : approuvé */}
        {status === 'approved' && (
          <div className="student-verify-status student-verify-status--approved">
            <p className="student-verify-status__icon">✓</p>
            <h2>Votre carte étudiante a été approuvée !</h2>
            <p>Vous pouvez maintenant finaliser votre abonnement au tarif étudiant.</p>
            <button
              className="profile-btn profile-btn--primary"
              onClick={handleFinalizeCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? 'Chargement...' : 'Finaliser mon abonnement (8€/mois)'}
            </button>
          </div>
        )}

        {/* État : en attente */}
        {status === 'pending' && (
          <div className="student-verify-status student-verify-status--pending">
            <p className="student-verify-status__icon">⏳</p>
            <h2>Vérification en cours</h2>
            <p>Votre carte étudiante est en cours d'examen par notre équipe. Revenez dans 24–48h.</p>
          </div>
        )}

        {/* État : rejeté */}
        {status === 'rejected' && (
          <div className="student-verify-status student-verify-status--rejected">
            <p className="student-verify-status__icon">✗</p>
            <h2>Vérification rejetée</h2>
            {rejectionReason && <p>Motif : {rejectionReason}</p>}
            <p>Vous pouvez soumettre un nouveau document ci-dessous.</p>
          </div>
        )}

        {/* Formulaire de soumission */}
        {(status === 'none' || status === 'rejected') && (
          <form className="student-verify-form" onSubmit={handleSubmit}>
            <div
              className="student-verify-dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <p className="student-verify-dropzone__filename">{selectedFile.name}</p>
              ) : (
                <>
                  <p className="student-verify-dropzone__icon">📄</p>
                  <p>Cliquez ou glissez votre carte étudiante ici</p>
                  <p className="student-verify-dropzone__hint">JPEG, PNG, WebP ou PDF — max 5 Mo</p>
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

            {error && <p className="student-verify-error">{error}</p>}

            <button
              type="submit"
              className="profile-btn profile-btn--primary"
              disabled={uploading || !selectedFile}
            >
              {uploading ? 'Envoi en cours...' : 'Envoyer pour vérification'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StudentVerify;
