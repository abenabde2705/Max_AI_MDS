import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const menuItems = [
  { text: 'À Propos', href: '#about' },
  { text: 'Fonctionnalités', href: '#fonc' },
  { text: 'Témoignage', href: '#tem' },
  { text: 'Abonnement', href: '#title' },
  { text: 'Newsletter', href: '#news' }
];

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // Simuler l'email : idéalement, récupère-le après login et stocke-le
      setUserEmail(localStorage.getItem('name') || 'client@example.com');
    }
  }, []);

  const getInitials = useMemo(() => {
    const names = userEmail.split(' ');
    const firstInitial = names[0]?.charAt(0).toUpperCase() || '';
    const lastInitial = names[1]?.charAt(0).toUpperCase() || '';
    return firstInitial + lastInitial;
  }, [userEmail]);

  // Méthode pour scroller vers une section
  const scrollToSection = (href) => {
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      setIsMenuOpen(false); // Ferme le menu mobile après le clic
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
  };

  return (
    <div className="navbar-container">
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo">
            <Link style={{ textDecoration: 'none' }} to="/">
              <h1 style={{ color: 'white', textDecoration: 'none' }}>MAX</h1>
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
            <button className="connexion-btn cta">
              <Link style={{ color: 'white', textDecoration: 'none' }} to="/auth">Connexion</Link>
            </button>
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
                  <button onClick={logout}>Déconnexion</button>
                </div>
              )}
            </div>
          )}
          <Link style={{ textDecoration: 'none' }} to="/chatbot">
            <button className="inscription-btn cta">
              <span> Parlez à Max</span>
              <span className="arrow">→</span>
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;