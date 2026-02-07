import React from 'react';
import { Link } from 'react-router-dom';

interface HeroSectionProps {
  id?: string;
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ id, className }) => {
  return (
    <div id={id} className={`min-h-screen flex items-center justify-center px-8 py-24 ${className || ''}`}>
      <div className="text-center" data-aos="fade-up" data-aos-duration="500" data-aos-delay="100">
        <img src="/src/assets/img/hero/logomax.png" alt="MAX" className="text-hero-desktop md:text-hero-tablet text-hero-mobile font-bold text-white mb-8 mx-auto animate-fade-in" />
        
        <p className="text-2xl md:text-4xl text-white mb-12 overflow-hidden whitespace-nowrap border-r-4 border-white inline-block animate-typing font-ubuntu">Tu n'es jamais seul. Je suis là pour toi...</p>
        <button className="bg-primary-yellow text-white border-none px-10 py-4 rounded-full text-body font-semibold cursor-pointer transition-all duration-500 hover:bg-primary-yellow-dark hover:shadow-card-hover hover:-translate-y-0.5 font-ubuntu">
          <Link to="/chatbot" className="no-underline text-purple-dark">
            Parlez-moi
          </Link>
        </button>
        
    
      </div>
    </div>
  );
};

export default HeroSection;