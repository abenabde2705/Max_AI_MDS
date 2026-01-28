import React, { useState, useEffect, useMemo } from 'react';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const userName = localStorage.getItem('userName');
      const userEmailStored = localStorage.getItem('userEmail');
      setUserEmail(userName || userEmailStored || 'Utilisateur');
    }
  }, []);

  const getInitials = useMemo<string>(() => {
    const names = userEmail.split(' ');
    const firstInitial = names[0]?.charAt(0).toUpperCase() || '';
    const lastInitial = names[1]?.charAt(0).toUpperCase() || '';
    return firstInitial + lastInitial;
  }, [userEmail]);

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
    setIsDropdownOpen(false);
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
          </div>
        </div>
        <div className="website-buttons">
          {!isLoggedIn ? (
            <Link  to="/auth" className="connexion-btn cta">
              Connexion
            </Link>
          ) : (
            <div className="user-menu">
              <button 
                className="user-icon" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {getInitials}
              </button>
              {isDropdownOpen && (
                <div className="dropdown">
                  <p>{userEmail}</p>
                  <Link to="/dashboard" style={{ textDecoration: 'none', color: '#1c5372', padding: '0.5rem 1rem', display: 'block', width: '100%' }}>
                    Tableau de bord
                  </Link>
                  <button onClick={logout}>Déconnexion</button>
                </div>
              )}
            </div>
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