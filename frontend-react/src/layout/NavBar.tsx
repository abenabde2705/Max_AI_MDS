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

// Gradient stops from .gradient-bg2 : #161A4D → #470059 → #651E79
const GRADIENT_STOPS = [
  { pos: 0,      r: 22,  g: 26,  b: 77  },  // #161A4D
  { pos: 0.6971, r: 71,  g: 0,   b: 89  },  // #470059
  { pos: 1,      r: 101, g: 30,  b: 121 },  // #651E79
];

function interpolateGradient(progress: number): string {
  const p = Math.max(0, Math.min(1, progress));
  let from = GRADIENT_STOPS[0];
  let to = GRADIENT_STOPS[1];
  for (let i = 0; i < GRADIENT_STOPS.length - 1; i++) {
    if (p >= GRADIENT_STOPS[i].pos && p <= GRADIENT_STOPS[i + 1].pos) {
      from = GRADIENT_STOPS[i];
      to = GRADIENT_STOPS[i + 1];
      break;
    }
  }
  const range = to.pos - from.pos;
  const t = range === 0 ? 0 : (p - from.pos) / range;
  const r = Math.round(from.r + (to.r - from.r) * t);
  const g = Math.round(from.g + (to.g - from.g) * t);
  const b = Math.round(from.b + (to.b - from.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

const NavBar: React.FC<NavBarProps> = ({ className: _className }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userDisplay, setUserDisplay] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('');
  const [menuBg, setMenuBg] = useState<string>(interpolateGradient(0));
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      const userName = localStorage.getItem('userName');
      const userEmailStored = localStorage.getItem('userEmail');
      setUserDisplay(userName || userEmailStored || 'Utilisateur');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth > 768) return;
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      setMenuBg(interpolateGradient(progress));
    };
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const sectionIds = menuItems.map((item) => item.href.replace('#', ''));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  const scrollToSection = (href: string): void => {
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      setActiveSection(href.replace('#', ''));
      setIsMenuOpen(false);
    }
  };

  const _logout = (): void => {
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
            style={isMobile ? { backgroundColor: menuBg } : undefined}
          >
            {menuItems.map((item) => (
              <button
                key={item.text}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href);
                }}
                className={`nav-link${activeSection === item.href.replace('#', '') ? ' active' : ''}`}
              >
                {item.text}
              </button>
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
                <span className="arrow"><img src="/src/assets/img/Vector.svg" alt="Arrow" /></span>
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
            <span className="arrow"><img src="/src/assets/img/Vector.svg" alt="Arrow" /></span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default NavBar;