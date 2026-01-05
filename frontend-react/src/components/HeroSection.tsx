import React from 'react';
import { Link } from 'react-router-dom';

interface HeroSectionProps {
  id?: string;
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ id, className }) => {
  return (
    <div id={id} className={`hero ${className}`}>
      <div className="hero-content" data-aos="fade-up" data-aos-duration="500" data-aos-delay="100">
        <img src="/src/assets/img/hero/logomax.png" alt="MAX" className="hero-title" />
        
        <p className="hero-subtitle">Tu n'es jamais seul. Je suis là pour toi...</p>
        <button className="cta-button">
          <Link to="/chatbot" style={{ textDecoration: 'none', color: '#161A4D' }}>
            Parlez-moi
          </Link>
        </button>
        
    
      </div>
    </div>
  );
};

export default HeroSection;