import React, { useState, useMemo, FormEvent } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface NewsletterProps {
  className?: string;
}

const Newsletter: React.FC<NewsletterProps> = ({ className: _className }) => {
  const [email, setEmail] = useState<string>('');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isValidEmail = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, [email]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isValidEmail) {
      setErrorMessage('Veuillez entrer une adresse email valide');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      // Ajouter à Firestore
      const newsletterRef = collection(db, 'newsletter');
      await addDoc(newsletterRef, {
        email: email.trim(),
        dateInscription: serverTimestamp(),
      });

      console.log('Email ajouté avec succès à la newsletter');
      setIsSubscribed(true);
      setEmail('');

      // Réinitialiser le message de succès après 3 secondes
      setTimeout(() => {
        setIsSubscribed(false);
      }, 3000);
    } catch (error: unknown) {
      console.error('Erreur lors de l\'inscription:', error);
      const firebaseError = error as Error;
      setErrorMessage(`Erreur: ${firebaseError.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="newsletter-container" id="news">
      <div className="newsletter-content">
        <div className="newsletter-left">
          <h2 className="newsletter-title">MAX Newsletter</h2>
        </div>
        
        <div className="newsletter-right">
          <p className="newsletter-description">
            Faites partie de l'histoire et abonnez-vous à la newsletter pour des nouvelles et des mises à jour sur nos ateliers
          </p>
          
          <form onSubmit={handleSubmit} className="newsletter-form">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="" 
              className="newsletter-input"
              aria-label="Email address"
              disabled={isSubmitting}
              required
            />
            
            <button 
              type="submit" 
              className="newsletter-button" 
              disabled={!isValidEmail || isSubmitting}
            >
              {isSubmitting ? 'ENVOI...' : ' + Découvrir Max'}
            </button>
          </form>
    
          {isSubscribed && (
            <div className="success-message">
              Merci pour votre inscription!
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