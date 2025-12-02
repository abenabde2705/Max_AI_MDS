import React, { useState, useEffect } from 'react';

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const scrollThreshold: number = 300; // Apparaît après avoir défilé de 300px

  const checkScroll = (): void => {
    setIsVisible(window.scrollY > scrollThreshold);
  };

  const scrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Vérification initiale

    return () => {
      window.removeEventListener('scroll', checkScroll);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <button 
      onClick={scrollToTop} 
      className="back-to-top"
      aria-label="Retour en haut"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  );
};

export default ScrollToTop;