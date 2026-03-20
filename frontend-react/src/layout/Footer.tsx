import { getToken, removeToken } from '../utils/token';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FeedbackModal from '../components/FeedbackModal';
import AppleStoreIcon from '../assets/applestore-removebg-preview.png';
import PlayStoreIcon from '../assets/playstore-removebg-preview.png';

const Footer: React.FC = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = getToken();
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="footer-container">
      <footer className="footer">
        {/* Footer content */}
        <div className="footer-content">
          {/* Colonne : À propos */}
          <div className="footer-column">
            <h4>À propos de Max</h4>
            <p>Votre assistant IA personnel pour une meilleure santé mentale</p>
            <div className="social-links">
              <a href="https://www.linkedin.com/company/maxsant%C3%A9mentale/" target="_blank" rel="noopener noreferrer" className="social-link-btn">
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/max.iamds?igsh=MXBnODdhbDZwYnl4eA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="social-link-btn">
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@l_ia_max?_r=1&_t=ZN-94lp7AnQCdq" target="_blank" rel="noopener noreferrer" className="social-link-btn">
                <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.79a4.85 4.85 0 01-1.01-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Colonne : Liens utiles */}
          <div className="footer-column">
            <h4>Liens utiles</h4>
            <p>
              <Link to="/politics/conditions-utilisation">
              Conditions d'utilisation
              </Link>
            </p>
            <p>
              <Link to="/politics/politique-confidentialites">
              Politique de confidentialité
              </Link>
            </p>
          </div>

          {/* Colonne : Contact */}
          <div className="footer-column">
            <h4>Contact Support</h4>
            <p>
              <a href="mailto:contact@maxai-mds.fr">contact@maxai-mds.fr</a>
            </p>
            <button
              onClick={() => isLoggedIn && setIsFeedbackOpen(true)}
              className={`feedback-footer-btn${!isLoggedIn ? ' feedback-footer-btn--disabled' : ''}`}
              title={isLoggedIn ? 'Envoyer un feedback' : 'Connectez-vous pour envoyer un feedback'}
              disabled={!isLoggedIn}
            >
              Envoyer un Feedback
            </button>
          </div>

          {/* Colonne : Téléchargement */}
          <div className="footer-column">
            <h4>Bientôt Disponible sur :</h4>
            <button>
              <img src={AppleStoreIcon} alt="Logo Apple Store" className="store-logo" />
            Apple Store
            </button>
            <button>
              <img src={PlayStoreIcon} alt="Logo Google Play" className="store-logo" />
            Google Play
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>&copy; 2026 Max IA. Tous droits réservés.</p>
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