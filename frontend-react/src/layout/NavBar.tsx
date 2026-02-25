import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface MenuItem {
  text: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { text: 'À Propos', href: '#about' },
  { text: 'Fonctionnalités', href: '#fonc' },
  { text: 'Témoignage', href: '#tem' },
  { text: 'Abonnement', href: '#title' },
  { text: 'Newsletter', href: '#news' }
];

interface NavBarProps {
  className?: string;
}

const NavBar: React.FC<NavBarProps> = ({ className }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userDisplay, setUserDisplay] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const userName = localStorage.getItem('userName');
      const userEmailStored = localStorage.getItem('userEmail');
      setUserDisplay(userName || userEmailStored || 'Utilisateur');
    }
  }, []);

  const scrollToSection = (href: string): void => {
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      setIsMenuOpen(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    window.location.reload();
  };

  return (
    <div className="navbar-container">
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo">
            <Link style={{ textDecoration: 'none' }} to="/">
              <img src="/src/assets/img/hero/logomax.png" alt="MAX" className="navbar-logo" />
            </Link>
          </div>
          {/* Bouton hamburger pour mobile */}
          <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
          {/* Menu desktop */}
          <div 
            className={`nav-items cta mobile-menu ${isMenuOpen ? 'open' : ''}`}
          >
            {menuItems.map((item) => (
              <a
                key={item.text}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
                className="nav-link"
              >
                {item.text}
              </a>
            ))}
            {/* Boutons Connexion et Chat dans le menu burger */}
            <div className="mobile-buttons">
              {!isLoggedIn ? (
                <Link to="/auth" className="connexion-btn cta mobile-btn" onClick={() => setIsMenuOpen(false)}>
                  Connexion
                </Link>
              ) : (
                <Link to="/profile" className="user-pill" onClick={() => setIsMenuOpen(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                  <span>{userDisplay}</span>
                </Link>
              )}
              <Link  to="/chatbot" className="inscription-btn cta mobile-btn" onClick={() => setIsMenuOpen(false)}>
                <span>Accéder au chat</span>
                <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="website-buttons desktop-only">
          {!isLoggedIn ? (
            <Link to="/auth" className="connexion-btn cta">
              Connexion
            </Link>
          ) : (
            <Link to="/profile" className="user-pill">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
              <span>{userDisplay}</span>
            </Link>
          )}
          <Link  to="/chatbot" className="inscription-btn cta">
            <span> Accéder au chat</span>
            <span className="arrow">→</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;