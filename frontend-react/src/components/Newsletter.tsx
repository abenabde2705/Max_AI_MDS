import React, { useState, useMemo, FormEvent } from 'react';
import { subscribeNewsletter } from '../services/chat.api';
import { getToken } from '../utils/token';

interface NewsletterProps {
  className?: string;
}

const Newsletter: React.FC<NewsletterProps> = ({ className: _className }) => {
  const loggedInEmail = getToken() ? localStorage.getItem('userEmail') : null;

  const [email, setEmail] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isValidEmail = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, [email]);

  const subscribe = async (emailToUse: string) => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await subscribeNewsletter(emailToUse.trim());
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    } catch {
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidEmail) {
      setErrorMessage('Veuillez entrer une adresse email valide');
      return;
    }
    await subscribe(email);
  };

  return (
    <div className="newsletter-container" id="news">
      <div className="newsletter-content">
        <div className="newsletter-left">
          <h2 className="newsletter-title">Restez informé</h2>
          <p className="newsletter-subtitle">Conseils bien-être, nouveautés Max et ressources santé mentale — directement dans votre boîte mail.</p>
        </div>

        <div className="newsletter-right">
          {loggedInEmail ? (
            <div className="newsletter-form">
              <span className="newsletter-email-display">{loggedInEmail}</span>
              <button
                className="newsletter-button"
                disabled={isSubmitting}
                onClick={() => subscribe(loggedInEmail)}
              >
                {isSubmitting ? 'Envoi...' : 'S\'abonner'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="newsletter-input"
                aria-label="Adresse email"
                disabled={isSubmitting}
                required
              />
              <button
                type="submit"
                className="newsletter-button"
                disabled={!isValidEmail || isSubmitting}
              >
                {isSubmitting ? 'Envoi...' : 'S\'abonner'}
              </button>
            </form>
          )}

          {isSubscribed && (
            <div className="success-message">
              Vous êtes inscrit(e) à la newsletter Max !
            </div>
          )}

          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          <p className="privacy-notice">
            Nous prenons soin de vos données dans notre <a href="/politics/politique-confidentialites" className="privacy-link">politique de confidentialité</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;