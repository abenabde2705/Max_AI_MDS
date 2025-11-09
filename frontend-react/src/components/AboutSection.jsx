import React from 'react';
import ChatExample from './ChatExample.jsx';

const AboutSection = ({ id, className }) => {
  return (
    <section id={id} className={`about-section ${className}`}>
      <div data-aos="fade-up" data-aos-duration="200" data-aos-delay="100">
        <h2 className="about-title">QUI EST MAX ?</h2>
        
        <div className="about-description">
          <p>Je suis là pour vous écouter, vous soutenir et vous aider à avancer. Grâce à l'intelligence artificielle, je vous propose des conseils adaptés pour gérer le stress, l'anxiété ou les moments difficiles. Vos échanges restent confidentiels et sécurisés.</p>
          <p>Je ne remplace pas un professionnel, mais je suis là pour vous accompagner, sans jugement, à chaque étape.</p>
        </div>

        <div className="features-container">
          <div className="feature-text">
            <h3>UNE ÉCOUTE SIMPLE,<br />DES RÉPONSES CLAIRES</h3>
            <p>Je m'adapte à vous, à votre personnalité et à vos besoins. Je retiens ce que vous partagez avec moi et j'évolue à vos côtés. Vous choisissez comment je communique : bienveillant, direct ou neutre, c'est vous qui décidez.</p>
            <p>Besoin d'un avis ? Envoyez-moi une photo ou décrivez une situation, je suis là pour vous guider et vous conseiller.</p>
          </div>
          <ChatExample />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;