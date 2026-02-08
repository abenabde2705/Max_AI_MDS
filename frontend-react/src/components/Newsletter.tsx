import React, { useState, useMemo, FormEvent, ChangeEvent } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface NewsletterProps {
  className?: string;
}

const Newsletter: React.FC<NewsletterProps> = ({ className }) => {
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
    <div className="py-16 px-4 md:px-44 text-white font-['Ubuntu',sans-serif]" id="news">
      <div className="max-w-[1300px] mx-auto bg-gradient-purple rounded-[78px] backdrop-blur-[10px] p-12 flex flex-col md:flex-row gap-12 items-start" style={{ filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))' }}>
        <div className="flex-1">
          <h2 className="text-[2.5rem] font-bold leading-tight m-0 text-[#DAE63D] tracking-[1px]">MAX Newsletter</h2>
        </div>
        
        <div className="flex-[2] flex flex-col gap-6">
          <p className="text-[1.1rem] text-white leading-[1.7] m-0">
            Faites partie de l'histoire et abonnez-vous à la newsletter pour des nouvelles et des mises à jour sur nos ateliers
          </p>
          
          <form onSubmit={handleSubmit} className="flex gap-4 mt-2 items-center flex-col md:flex-row">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="" 
              className="flex-1 px-6 py-4 rounded-full border-none bg-white text-[#333] text-base outline-none transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.1)] focus:shadow-[0_6px_20px_rgba(0,0,0,0.15)] focus:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-[#999] w-full md:w-auto"
              aria-label="Email address"
              disabled={isSubmitting}
              required
            />
            
            <button 
              type="submit" 
              className="bg-[#DAE63D] text-[#161A4D] border-none rounded-full px-8 py-4 text-base font-semibold cursor-pointer transition-all duration-300 whitespace-nowrap hover:bg-[#BBC600] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
              disabled={!isValidEmail || isSubmitting}
            >
              {isSubmitting ? 'ENVOI...' : ' + Découvrir Max'}
            </button>
          </form>
    
          {isSubscribed && (
            <div className="text-[#4ade80] bg-[#4ade80]/20 border border-[#4ade80]/40 px-4 py-4 rounded-xl text-center font-semibold">
              Merci pour votre inscription!
            </div>
          )}
          
          {errorMessage && (
            <div className="text-[#f87171] bg-[#f87171]/20 border border-[#f87171]/40 px-4 py-4 rounded-xl text-center font-semibold">
              {errorMessage}
            </div>
          )}
          
          <p className="text-[0.95rem] text-white my-2 text-left">
            Nous prenons soin de vos données dans notre <a href="#" className="text-white no-underline transition-colors duration-200 font-semibold hover:text-white/80">politique de confidentialité</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;