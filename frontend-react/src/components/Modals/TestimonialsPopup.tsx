import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, uploadToStorage } from '../../firebaseConfig';
import { fetchUserProfile } from '../../services/chat.api';
import { getToken } from '../../utils/token';
import { Check, X } from 'lucide-react';
import '../FeedbackModal.css';

interface TestimonialsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

const TestimonialsPopup: React.FC<TestimonialsPopupProps> = ({ isOpen, onClose, onSubmitted }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [testimonialText, setTestimonialText] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!isOpen || !getToken()) return;
    fetchUserProfile()
      .then(res => {
        const u = res.data;
        if (u.firstName) setFirstName(u.firstName);
        if (u.lastName) setLastName(u.lastName);
        if (u.email) setEmail(u.email);
        if (u.dateOfBirth && !age) {
          const calculated = new Date().getFullYear() - new Date(u.dateOfBirth).getFullYear();
          if (calculated > 0 && calculated < 120) setAge(String(calculated));
        }
      })
      .catch(() => {
        const saved = localStorage.getItem('userEmail');
        if (saved) setEmail(saved);
      });
  }, [isOpen]);

  const closePopup = () => {
    if (isSubmitting) return;
    setFirstName(''); setLastName(''); setAge(''); setEmail(''); setTestimonialText('');
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null); setPhotoPreview(null);
    setStatus(null);
    onClose();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'La photo ne doit pas dépasser 5 Mo' });
      return;
    }
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return setStatus({ type: 'error', message: 'Veuillez entrer votre prénom' });
    if (!lastName.trim()) return setStatus({ type: 'error', message: 'Veuillez entrer votre nom' });
    if (!age || isNaN(Number(age)) || Number(age) <= 0) return setStatus({ type: 'error', message: 'Veuillez entrer un âge valide' });
    if (!validateEmail(email)) return setStatus({ type: 'error', message: 'Veuillez entrer un email valide' });
    if (!testimonialText.trim()) return setStatus({ type: 'error', message: 'Veuillez entrer votre témoignage' });

    try {
      setIsSubmitting(true);
      setStatus(null);

      let photoUrl: string | null = null;
      if (photo) {
        const ext = photo.name.split('.').pop() ?? 'jpg';
        photoUrl = await uploadToStorage(photo, `testimonials/${Date.now()}/photo.${ext}`);
      }

      await addDoc(collection(db, 'testimonials'), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: Number(age),
        email: email.trim(),
        text: testimonialText.trim(),
        photoUrl,
        approved: false,
        createdAt: serverTimestamp(),
      });
      setStatus({ type: 'success', message: 'Merci pour votre témoignage !' });
      setTimeout(() => { onSubmitted(); closePopup(); }, 2000);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      setStatus({ type: 'error', message: `Une erreur est survenue : ${msg}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="feedback-overlay" onClick={closePopup}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>

        <div className="feedback-header">
          <div className="feedback-header-info">
            <span className="feedback-header-eyebrow">Max</span>
            <h2>Donnez votre avis</h2>
          </div>
          <button className="feedback-close-btn" onClick={closePopup} disabled={isSubmitting}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="feedback-form-row">
            <div className="feedback-field">
              <label className="feedback-label" htmlFor="tp-firstName">Prénom <span>*</span></label>
              <input
                className="feedback-input"
                id="tp-firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Votre prénom"
                disabled={isSubmitting}
              />
            </div>
            <div className="feedback-field">
              <label className="feedback-label" htmlFor="tp-lastName">Nom <span>*</span></label>
              <input
                className="feedback-input"
                id="tp-lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Votre nom"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="feedback-form-row">
            <div className="feedback-field">
              <label className="feedback-label" htmlFor="tp-age">Âge <span>*</span></label>
              <input
                className="feedback-input"
                id="tp-age"
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Votre âge"
                disabled={isSubmitting}
              />
            </div>
            <div className="feedback-field">
              <label className="feedback-label" htmlFor="tp-email">Email <span>*</span></label>
              <input
                className="feedback-input"
                id="tp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="feedback-field">
            <label className="feedback-label" htmlFor="tp-testimonial">Votre témoignage <span>*</span></label>
            <textarea
              className="feedback-textarea"
              id="tp-testimonial"
              value={testimonialText}
              onChange={(e) => setTestimonialText(e.target.value)}
              placeholder="Partagez votre expérience avec MAX…"
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <div className="feedback-field">
            <label className="feedback-label" htmlFor="tp-photo">Photo de profil <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>(optionnel)</span></label>
            <input
              id="tp-photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              disabled={isSubmitting}
              style={{ color: 'inherit' }}
            />
            {photoPreview && (
              <img src={photoPreview} alt="Aperçu" style={{ marginTop: '0.5rem', width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #DAE63D' }} />
            )}
          </div>

          <div className="feedback-actions">
            <button type="button" className="btn-cancel" onClick={closePopup} disabled={isSubmitting}>
              Annuler
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="btn-submit-loading">
                  <span className="btn-spinner" />
                  Envoi…
                </span>
              ) : 'Envoyer'}
            </button>
          </div>
        </form>

        {status && (
          <div className={`feedback-status ${status.type}`}>
            <span className="feedback-status-icon">
              {status.type === 'success' ? <Check size={20} /> : <X size={20} />}
            </span>
            <h3>{status.type === 'success' ? 'Témoignage envoyé !' : 'Erreur'}</h3>
            <p>{status.message}</p>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
};

export default TestimonialsPopup;
