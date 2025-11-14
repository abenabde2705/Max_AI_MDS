import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { testi1 } from '../assets/images.js';

const DiscoveryOffer = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <section className="discovery-section">
      <div className="content" data-aos="fade-up" data-aos-duration="500" data-aos-delay="200">
        
       
        
        <div className="offer-content">
          <h2>OFFRE DÉCOUVERTE</h2>
          <p>
            Découvrez Max, votre compagnon d'écoute intelligent. Profitez d'un essai gratuit pour explorer ses fonctionnalités : écoute bienveillante, conseils personnalisés et interaction adaptée à votre style. Testez-le dès maintenant pour voir comment il peut vous aider au quotidien.
          </p>
          <div className="testimonials-button-container">
          <Link to="/chatbot" style={{ textDecoration: 'none' }}>
            <button className="discover-btn">Découvrir Max</button>
          </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscoveryOffer;