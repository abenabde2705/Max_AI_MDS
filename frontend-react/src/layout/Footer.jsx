import React from 'react';
import { Link } from 'react-router-dom';
import LinkedInIcon from '../assets/LinkedIn_icon.svg.png';
import AppleStoreIcon from '../assets/applestore-removebg-preview.png';
import PlayStoreIcon from '../assets/playstore-removebg-preview.png';

const Footer = () => {
  return (
    <footer className="footer">
      {/* Footer content */}
      <div className="footer-content">
        {/* Colonne : À propos */}
        <div className="footer-column">
          <h4>À propos de Max</h4>
          <p>Votre assistant IA personnel pour une meilleure santé mentale</p>
          <div className="social-links">
            <a href="https://www.linkedin.com/company/maxsant%C3%A9mentale/" target="_blank" rel="noopener noreferrer">
              <img src={LinkedInIcon} alt="LinkedIn" className="social-icon" />
            </a>
          </div>
        </div>

        {/* Colonne : Liens utiles */}
        <div className="footer-column">
          <h4>Liens utiles</h4>
          <p>
            <Link to="/Politics/ConditionsUtilisation">
              <a>Conditions d'utilisation</a>
            </Link>
          </p>
          <p>
            <Link to="/Politics/PolitiqueConfidentialites">
              <a>Politique de confidentialité</a>
            </Link>
          </p>
        </div>

        {/* Colonne : Contact */}
        <div className="footer-column">
          <h4>Contact Support</h4>
          <p>
            <a href="mailto:Max@outlook.com">Max@outlook.com</a>
          </p>
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
        <p>&copy; 2024 Max IA. Tous droits réservés.</p>
      </div>
    </footer>
  );
};

export default Footer;