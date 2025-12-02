import React, { useState, useEffect } from 'react';
import TestimonialsPopup from './Modals/TestimonialsPopup';
import { testi3 } from '../assets/images';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface Testimonial {
  quote: string;
  author: string;
}

interface TestimonialsSectionProps {
  id?: string;
  className?: string;
}

const testimonials: Testimonial[] = [
  {
    quote: 'Max a changé la manière dont je gère mon anxiété. Je me sens enfin écouté.',
    author: 'Sophie, 20 ans'
  },
  {
    quote: 'Grâce à Max, je ne me sens plus seul dans les moments difficiles.',
    author: 'Lucas, 28 ans'
  },
  {
    quote: 'Avec Max, j\'ai enfin trouvé une oreille attentive, sans jugement. Ça change tout.',
    author: 'Emma, 18 ans'
  },
  {
    quote: 'Max est toujours là, même quand personne d\'autre ne peut l\'être. C\'est rassurant.',
    author: 'Thomas, 23 ans'
  }
];

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ id, className }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    AOS.init();
  }, []);

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSubmitted = () => {
    console.log('Témoignage soumis avec succès');
  };

  return (
    <section id={id} className={`testimonials-section ${className}`}>
      <div data-aos="fade-up" data-aos-duration="500" data-aos-delay="200">
        <h2>TÉMOIGNAGES UTILISATEURS</h2>
        <div className="testimonials-container">
          <div className="testimonials-list">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="testimonial">
                <p className="quote">
                  "{testimonial.quote}" - <span className="author">{testimonial.author}</span>
                </p>
              </div>
            ))}
          </div>
          
          <div className="testimonials-button-container">
            <button onClick={openPopup} className="voir-plus-btn">
              Voir plus
            </button>
          </div>
          
          <TestimonialsPopup 
            isOpen={isPopupOpen}
            onClose={closePopup}
            onSubmitted={handleSubmitted}
          />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;