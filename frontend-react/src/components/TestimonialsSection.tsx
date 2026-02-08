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
    <section id={id} className={`py-20 px-8 ${className || ''}`}>
      <div data-aos="fade-up" data-aos-duration="500" data-aos-delay="200">
        
        <div className="max-w-[1290px] mx-auto">
          <h2 className="text-[48px] font-bold text-[#DAE63D] mb-12 leading-[30px] text-left font-['Ubuntu',sans-serif]">TÉMOIGNAGES UTILISATEURS</h2>
          <div className="flex flex-col gap-8 mb-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="mb-0">
                <p className="text-2xl text-white italic font-['Ubuntu',sans-serif]">
                  "{testimonial.quote}" - <span className="font-semibold not-italic">{testimonial.author}</span>
                </p>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end w-full mt-4 pr-8">
            <button onClick={openPopup} className="block px-8 py-4 bg-[#DAE63D] text-[#161A4D] border-none rounded-[54px] cursor-pointer text-base transition-all duration-300 shadow-[0px_4px_4px_rgba(0,0,0,0.25),0px_4px_4px_rgba(0,0,0,0.25)] hover:bg-[#BBC600] font-['Ubuntu',sans-serif]">
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