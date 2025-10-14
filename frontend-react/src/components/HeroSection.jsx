import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = ({ id, className }) => {
  return (
    <div id={id} className={`hero ${className}`}>
      <div className="hero-content" data-aos="fade-up" data-aos-duration="500" data-aos-delay="100">
        <h1 className="hero-title">MAX</h1>
        
        <p className="hero-subtitle">Tu n'es jamais seul. Je suis là pour toi...</p>
        <button className="cta-button">
          <Link to="/chatbot" style={{ textDecoration: 'none', color: 'white' }}>
            Parlez-moi
          </Link>
        </button>
        
    
      </div>
    </div>
  );
};

export default HeroSection;