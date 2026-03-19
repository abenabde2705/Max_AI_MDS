import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const closePopup = () => {
    if (isSubmitting) return;
    setFirstName(''); setLastName(''); setAge(''); setEmail(''); setTestimonialText('');
    setStatus(null);
    onClose();
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
      await addDoc(collection(db, 'testimonials'), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: Number(age),
        email: email.trim(),
        text: testimonialText.trim(),
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
