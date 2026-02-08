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
    <div className="py-20 px-8 bg-gradient-purple">
      <h1 className="text-title font-bold text-white text-center mb-12 font-ubuntu">Restez informé de nos actualités</h1>
      <form onSubmit={submitForm} className="max-w-3xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <input 
              name="prenom"
              value={formData.prenom}
              onChange={handleInputChange}
              type="text" 
              placeholder="Prénom"
              className="w-full px-6 py-4 rounded-4xl border border-white/20 bg-white text-purple-dark placeholder-purple-dark/55 focus:outline-none focus:ring-2 focus:ring-primary-yellow font-ubuntu disabled:opacity-60"
              required
              disabled={isSubmitting}
            />
            <input 
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              type="text" 
              placeholder="Nom"
              className="w-full px-6 py-4 rounded-4xl border border-white/20 bg-white text-purple-dark placeholder-purple-dark/55 focus:outline-none focus:ring-2 focus:ring-primary-yellow font-ubuntu disabled:opacity-60"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-4">
            <input 
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              type="number" 
              placeholder="Âge"
              className="w-full px-6 py-4 rounded-4xl border border-white/20 bg-white text-purple-dark placeholder-purple-dark/55 focus:outline-none focus:ring-2 focus:ring-primary-yellow font-ubuntu disabled:opacity-60"
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
              className="w-full px-6 py-4 rounded-4xl border border-white/20 bg-white text-purple-dark placeholder-purple-dark/55 focus:outline-none focus:ring-2 focus:ring-primary-yellow font-ubuntu disabled:opacity-60"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="md:col-span-2">
            <input 
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              type="tel" 
              placeholder="Numéro de téléphone"
              className="w-full px-6 py-4 rounded-4xl border border-white/20 bg-white text-purple-dark placeholder-purple-dark/55 focus:outline-none focus:ring-2 focus:ring-primary-yellow font-ubuntu disabled:opacity-60"
              required
              disabled={isSubmitting}
            />
          </div>

          {message && (
            <div className={`md:col-span-2 px-4 py-3 rounded-lg text-center font-ubuntu ${messageType === 'success' ? 'bg-green-500/20 border border-green-500 text-green-100' : 'bg-red-500/20 border border-red-500 text-red-100'}`}>
              {message}
            </div>
          )}
          
          <button type="submit" className="md:col-span-2 w-full bg-primary-yellow text-purple-dark border-none px-10 py-4 rounded-full text-body font-semibold cursor-pointer transition-all duration-300 hover:bg-primary-yellow-dark hover:shadow-card-hover disabled:opacity-50 disabled:cursor-not-allowed font-ubuntu" disabled={isSubmitting}>
            {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire à la newsletter'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Mail;