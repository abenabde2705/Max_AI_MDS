import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/img/hero/logomax.png';
import gsap from 'gsap';

interface HeroSectionProps {
  id?: string;
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ id, className }) => {
  const logoRef = useRef<HTMLImageElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from(logoRef.current, { opacity: 0, y: 40, duration: 0.8 })
        .from(subtitleRef.current, { opacity: 0, y: 20, duration: 0.6 }, '-=0.3')
        .from(ctaRef.current, { opacity: 0, scale: 0.9, duration: 0.5 }, '-=0.2');
    });
    return () => ctx.revert();
  }, []);

  return (
    <div id={id} className={`hero ${className}`}>
      <div className="hero-content">
        <img ref={logoRef} src={logoImg} alt="MAX" className="hero-title" />
        <p ref={subtitleRef} className="hero-subtitle">Tu n'es jamais seul. Je suis là pour toi...</p>
        <button ref={ctaRef} className="cta-button">
          <Link to="/chatbot" style={{ textDecoration: 'none', color: '#161A4D' }}>
            Parlez-moi
          </Link>
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
