import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FeedbackModal from '../components/FeedbackModal';
import LinkedInIcon from '../assets/LinkedIn_icon.svg.png';
import AppleStoreIcon from '../assets/applestore-removebg-preview.png';
import PlayStoreIcon from '../assets/playstore-removebg-preview.png';

const Footer: React.FC = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="flex justify-center py-8 px-4">
      <footer className="backdrop-blur-[20px] bg-white/10 text-white font-['Ubuntu',sans-serif] py-10 px-[10%] relative rounded-[50px] w-[90%] max-w-[1400px] shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20 before:content-[''] before:absolute before:inset-0 before:rounded-[50px] before:p-[2px] before:bg-gradient-to-b before:from-purple-dark before:to-transparent before:[-webkit-mask:linear-gradient(#fff_0_0)_content-box,_linear-gradient(#fff_0_0)] before:[mask-composite:exclude] before:[-webkit-mask-composite:destination-out] before:pointer-events-none">
      {/* Footer content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {/* Colonne : À propos */}
        <div className="flex flex-col gap-4">
          <h4 className="text-primary-yellow text-lg font-bold mb-2">À propos de Max</h4>
          <p className="text-[0.95rem] leading-relaxed">Votre assistant IA personnel pour une meilleure santé mentale</p>
          <div className="flex gap-4 mt-2">
            <a href="https://www.linkedin.com/company/maxsant%C3%A9mentale/" target="_blank" rel="noopener noreferrer">
              <img src={LinkedInIcon} alt="LinkedIn" className="w-8 h-8 transition-transform duration-200 hover:scale-110" />
            </a>
          </div>
        </div>

        {/* Colonne : Liens utiles */}
        <div className="flex flex-col gap-4">
          <h4 className="text-primary-yellow text-lg font-bold mb-2">Liens utiles</h4>
          <p className="m-0">
            <Link to="/politics/conditions-utilisation" className="text-white no-underline transition-colors duration-200 hover:text-primary-yellow">
              Conditions d'utilisation
            </Link>
          </p>
          <p className="m-0">
            <Link to="/politics/politique-confidentialites" className="text-white no-underline transition-colors duration-200 hover:text-primary-yellow">
              Politique de confidentialité
            </Link>
          </p>
        </div>

        {/* Colonne : Contact */}
        <div className="flex flex-col gap-4">
          <h4 className="text-primary-yellow text-lg font-bold mb-2">Contact Support</h4>
          <p className="m-0">
            <a href="mailto:Max@outlook.com" className="text-white no-underline transition-colors duration-200 hover:text-primary-yellow">Max@outlook.com</a>
          </p>
          {isLoggedIn && (
            <button 
              onClick={() => setIsFeedbackOpen(true)}
              className="bg-primary-yellow text-purple-dark border-none px-6 py-3 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-primary-yellow-dark hover:shadow-card-hover"
              title="Envoyer un feedback"
            >
              Envoyer un Feedback
            </button>
          )}
        </div>

        {/* Colonne : Téléchargement */}
        <div className="flex flex-col gap-4">
          <h4 className="text-primary-yellow text-lg font-bold mb-2">Bientôt Disponible sur :</h4>
          <button className="flex items-center gap-3 bg-transparent border border-white/20 text-white px-4 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-white/40">
            <img src={AppleStoreIcon} alt="Logo Apple Store" className="w-6 h-6 object-contain" />
            Apple Store
          </button>
          <button className="flex items-center gap-3 bg-transparent border border-white/20 text-white px-4 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 hover:bg-white/10 hover:border-white/40">
            <img src={PlayStoreIcon} alt="Logo Google Play" className="w-6 h-6 object-contain" />
            Google Play
          </button>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-8 pt-6 text-center border-t border-white/20">
        <p className="text-sm text-text-muted m-0">&copy; 2024 Max IA. Tous droits réservés.</p>
      </div>

      {/* Modal Feedback */}
      {isLoggedIn && (
        <FeedbackModal 
          isOpen={isFeedbackOpen} 
          onClose={() => setIsFeedbackOpen(false)} 
        />
      )}
    </footer>
    </div>
  );
};

export default Footer;