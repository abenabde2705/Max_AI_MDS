import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'max_cookie_consent';

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'min(680px, calc(100vw - 2rem))',
      background: 'linear-gradient(135deg, #161a4d, #2a0035)',
      border: '1.5px solid rgba(218,230,61,0.35)',
      borderRadius: '16px',
      padding: '1.25rem 1.5rem',
      zIndex: 9999,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      gap: '1.25rem',
      flexWrap: 'wrap',
      fontFamily: '\'Ubuntu\', Arial, sans-serif',
    }}>
      {/* Icône */}
      <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>🍪</span>

      {/* Texte */}
      <p style={{
        flex: 1,
        margin: 0,
        color: 'rgba(255,255,255,0.8)',
        fontSize: '0.88rem',
        lineHeight: 1.6,
        minWidth: '200px',
      }}>
        Nous utilisons uniquement des cookies techniques nécessaires au fonctionnement de Max (authentification, session).
        Aucun cookie publicitaire.{' '}
        <Link
          to="/politics/politique-confidentialites"
          style={{ color: '#DAE63D', textDecoration: 'underline' }}
        >
          En savoir plus
        </Link>
      </p>

      {/* Boutons */}
      <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            padding: '0.5rem 1.1rem',
            borderRadius: '50px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent',
            color: 'rgba(255,255,255,0.55)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Refuser
        </button>
        <button
          onClick={accept}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '50px',
            border: 'none',
            background: '#DAE63D',
            color: '#161a4d',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Accepter
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
