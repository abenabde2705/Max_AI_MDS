import React, { useState, ChangeEvent, FormEvent } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface FormData {
  prenom: string;
  nom: string;
  age: string;
  email: string;
  telephone: string;
}

const Mail: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    prenom: '',
    nom: '',
    age: '',
    email: '',
    telephone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<string>(''); // 'success' ou 'error'

  const resetForm = (): void => {
    setFormData({
      prenom: '',
      nom: '',
      age: '',
      email: '',
      telephone: ''
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitForm = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const newsletterRef = collection(db, 'newsletter');
      const docRef = await addDoc(newsletterRef, {
        ...formData,
        dateInscription: new Date()
      });
      
      console.log('Document written with ID: ', docRef.id);
      setMessage('Inscription réussie !');
      setMessageType('success');
      resetForm();
    } catch (error: unknown) {
      const firebaseError = error as Error;
      console.error('Erreur détaillée:', firebaseError.message);
      setMessage('Une erreur est survenue lors de l\'inscription');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
      
      // Effacer le message après 5 secondes
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  return (
    <div className="newsletter-section">
      <h1>Restez informé de nos actualités</h1>
      <form onSubmit={submitForm} className="newsletter-form">
        <div className="form-row">
          <div className="form-group">
            <input 
              name="prenom"
              value={formData.prenom}
              onChange={handleInputChange}
              type="text" 
              placeholder="Prénom"
              required
              disabled={isSubmitting}
            />
            <input 
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              type="text" 
              placeholder="Nom"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <input 
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              type="number" 
              placeholder="Âge"
              required
              min="13"
              disabled={isSubmitting}
            />
            <input 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              type="email" 
              placeholder="Email"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <input 
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              type="tel" 
              placeholder="Numéro de téléphone"
              required
              disabled={isSubmitting}
            />
          </div>

          {message && (
            <div className={messageType === 'success' ? 'success-message' : 'error-message'}>
              {message}
            </div>
          )}
          
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire à la newsletter'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Mail;