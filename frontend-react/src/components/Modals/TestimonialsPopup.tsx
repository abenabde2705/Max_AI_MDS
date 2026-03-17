import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface TestimonialsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

const TestimonialsPopup: React.FC<TestimonialsPopupProps> = ({ isOpen, onClose, onSubmitted }) => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [testimonialText, setTestimonialText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const closePopup = () => {
    onClose();
    // Reset form state
    setFirstName('');
    setLastName('');
    setAge('');
    setEmail('');
    setTestimonialText('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const submitTestimonial = async () => {
    // Form validation
    if (!firstName.trim()) {
      setErrorMessage('Veuillez entrer votre prénom');
      return;
    }
    
    if (!lastName.trim()) {
      setErrorMessage('Veuillez entrer votre nom');
      return;
    }
    
    if (!age) {
      setErrorMessage('Veuillez entrer votre âge');
      return;
    }
    
    if (isNaN(Number(age)) || Number(age) <= 0) {
      setErrorMessage('Veuillez entrer un âge valide');
      return;
    }
    
    if (!email.trim()) {
      setErrorMessage('Veuillez entrer votre email');
      return;
    }
    
    if (!validateEmail(email)) {
      setErrorMessage('Veuillez entrer un email valide');
      return;
    }
    
    if (!testimonialText.trim()) {
      setErrorMessage('Veuillez entrer un témoignage');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      // Add to Firestore
      const testimonialsRef = collection(db, 'testimonials');
      await addDoc(testimonialsRef, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: Number(age),
        email: email.trim(),
        text: testimonialText.trim(),
        createdAt: serverTimestamp(),
      });
      
      setSuccessMessage('Merci pour votre témoignage !');
      
      // Reset form fields
      setFirstName('');
      setLastName('');
      setAge('');
      setEmail('');
      setTestimonialText('');
      
      // Close popup after 2 seconds
      setTimeout(() => {
        onSubmitted();
        closePopup();
      }, 2000);
      
    } catch (error: unknown) {
      console.error('Erreur lors de l\'envoi du témoignage:', error);
      const firebaseError = error as Error;
      setErrorMessage(`Une erreur est survenue: ${firebaseError.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={closePopup}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>Partagez votre expérience</h2>
          <button className="close-button" onClick={closePopup}>×</button>
        </div>
        
        <div className="popup-body">
          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Prénom</label>
              <input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                type="text"
                placeholder="Votre prénom"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Nom</label>
              <input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                type="text"
                placeholder="Votre nom"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Âge</label>
              <input
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                type="number"
                min="1"
                max="120"
                placeholder="Votre âge"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Votre email"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="testimonial">Votre témoignage</label>
            <textarea 
              id="testimonial" 
              value={testimonialText}
              onChange={(e) => setTestimonialText(e.target.value)}
              placeholder="Partagez votre expérience avec MAX..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-actions">
            <button 
              className="submit-button" 
              onClick={submitTestimonial} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsPopup;