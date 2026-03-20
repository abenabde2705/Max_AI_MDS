import React, { useState, useRef, useEffect } from 'react';
import TestimonialsPopup from './Modals/TestimonialsPopup';
import { getToken } from '../utils/token';
import testi1 from '../assets/img/valeurs/testi1.png';
import testi3 from '../assets/img/valeurs/testi3.png';
import jour1 from '../assets/img/valeurs/JOUR_1.webp';
import jour2 from '../assets/img/valeurs/JOUR_2.webp';

interface Testimonial {
  quote: string;
  author: string;
  image: string;
}

interface TestimonialsSectionProps {
  id?: string;
  className?: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Max a changé la manière dont je gère mon anxiété. Je me sens enfin écouté.",
    author: "Sophie, 20 ans",
    image: testi1
  },
  {
    quote: "Grâce à Max, je ne me sens plus seul dans les moments difficiles.",
    author: "Lucas, 28 ans",
    image: jour1
  },
  {
    quote: "Avec Max, j'ai enfin trouvé une oreille attentive, sans jugement. Ça change tout.",
    author: "Emma, 18 ans",
    image: testi3
  },
  {
    quote: "Max est toujours là, même quand personne d'autre ne peut l'être. C'est rassurant.",
    author: "Thomas, 23 ans",
    image: jour2
  }
];

// Duplicate for seamless infinite loop
const loopedTestimonials = [...testimonials, ...testimonials];

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ id, className }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const isLoggedIn = !!getToken();
  const trackRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const speedRef = useRef(0.5); // px per frame

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const animate = () => {
      posRef.current += speedRef.current;
      const halfWidth = track.scrollWidth / 2;
      if (posRef.current >= halfWidth) {
        posRef.current = 0;
      }
      track.style.transform = `translateX(-${posRef.current}px)`;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleMouseEnter = () => { speedRef.current = 0; };
  const handleMouseLeave = () => { speedRef.current = 0.5; };

  return (
    <section id={id} className={`testimonials-section ${className}`}>
      <div className="testimonials-container">
        <h2>TÉMOIGNAGES UTILISATEURS</h2>

        <div
          className="testimonials-carousel-viewport"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="testimonials-carousel-track" ref={trackRef}>
            {loopedTestimonials.map((t, i) => (
              <div key={`${t.author}-${i}`} className="testimonial-card">
                <img src={t.image} alt={t.author} className="testimonial-card__bg" />
                <div className="testimonial-card__gradient" />
                <div className="testimonial-card__content">
                  <p className="testimonial-card__quote">"{t.quote}"</p>
                  <span className="testimonial-card__author">{t.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="testimonials-button-container">
          <button
            onClick={() => isLoggedIn && setIsPopupOpen(true)}
            className={`voir-plus-btn${!isLoggedIn ? ' voir-plus-btn--disabled' : ''}`}
            disabled={!isLoggedIn}
            title={!isLoggedIn ? 'Connectez-vous pour donner votre avis' : undefined}
          >
            Donnez votre avis
          </button>
        </div>

        <TestimonialsPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          onSubmitted={() => console.log('Témoignage soumis avec succès')}
        />
      </div>
    </section>
  );
};

export default TestimonialsSection;
