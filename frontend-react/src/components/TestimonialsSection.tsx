import React, { useState, useRef, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import TestimonialsPopup from './Modals/TestimonialsPopup';
import { getToken } from '../utils/token';
import sophie from '../assets/img/valeurs/sophie.png';
import lucas from '../assets/img/valeurs/lucas.png';
import emma from '../assets/img/valeurs/emma.png';
import thomas from '../assets/img/valeurs/thomas.png';

interface Testimonial {
  quote: string;
  author: string;
  photoUrl: string | null;
  initials: string;
}

interface TestimonialsSectionProps {
  id?: string;
  className?: string;
}

const FALLBACK: Testimonial[] = [
  { quote: 'Max a changé la manière dont je gère mon anxiété. Je me sens enfin écouté.', author: 'Sophie, 20 ans', photoUrl: sophie, initials: 'SL' },
  { quote: 'Grâce à Max, je ne me sens plus seul dans les moments difficiles.', author: 'Lucas, 28 ans', photoUrl: lucas, initials: 'LB' },
  { quote: 'Avec Max, j\'ai enfin trouvé une oreille attentive, sans jugement. Ça change tout.', author: 'Emma, 18 ans', photoUrl: emma, initials: 'EM' },
  { quote: 'Max est toujours là, même quand personne d\'autre ne peut l\'être. C\'est rassurant.', author: 'Thomas, 23 ans', photoUrl: thomas, initials: 'TM' },
];

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ id, className }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK);
  const isLoggedIn = !!getToken();
  const trackRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const speedRef = useRef(0.5);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartPosRef = useRef(0);

  useEffect(() => {
    getDocs(query(collection(db, 'testimonials'), where('approved', '==', true)))
      .then(snap => {
        if (snap.empty) return;
        setTestimonials(snap.docs.map(doc => {
          const d = doc.data();
          return {
            quote: d.text,
            author: `${d.firstName}, ${d.age} ans`,
            photoUrl: d.photoUrl || null,
            initials: `${d.firstName?.[0] || '?'}${d.lastName?.[0] || ''}`.toUpperCase(),
          };
        }));
      })
      .catch(() => {});
  }, []);

  const loopedTestimonials = useMemo(() => {
    // Ensure at least 4 unique cards before doubling to avoid visible duplicates
    let base = [...testimonials];
    while (base.length < 4) base = [...base, ...testimonials];
    return [...base, ...base];
  }, [testimonials]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || loopedTestimonials.length === 0) return;
    posRef.current = 0;

    const animate = () => {
      posRef.current += speedRef.current;
      const halfWidth = track.scrollWidth / 2;
      if (posRef.current >= halfWidth) posRef.current = 0;
      track.style.transform = `translateX(-${posRef.current}px)`;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [loopedTestimonials.length]);

  const handleMouseEnter = () => { speedRef.current = 0.15; };
  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    speedRef.current = 0.5;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartPosRef.current = posRef.current;
    speedRef.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const track = trackRef.current;
    if (!track) return;
    const halfWidth = track.scrollWidth / 2;
    let newPos = dragStartPosRef.current - (e.clientX - dragStartXRef.current);
    if (newPos < 0) newPos += halfWidth;
    if (newPos >= halfWidth) newPos -= halfWidth;
    posRef.current = newPos;
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    speedRef.current = 0.15;
  };

  return (
    <section id={id} className={`testimonials-section ${className}`}>
      <div className="testimonials-container">
        <h2>TÉMOIGNAGES UTILISATEURS</h2>

        <div
          className="testimonials-carousel-viewport"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: isDraggingRef.current ? 'grabbing' : 'grab' }}
        >
          <div className="testimonials-carousel-track" ref={trackRef}>
            {loopedTestimonials.map((t, i) => (
              <div key={`${t.author}-${i}`} className="testimonial-card">
                {t.photoUrl ? (
                  <img src={t.photoUrl} alt={t.author} className="testimonial-card__bg" />
                ) : (
                  <div className="testimonial-avatar-initials">{t.initials}</div>
                )}
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
