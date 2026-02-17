import React from 'react';

interface AboutSectionProps {
  id?: string;
  className?: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ id, className }) => {
  // Use the public folder image as background. Spaces and special chars encoded in URL.
  const bgUrl = '/LOGO%20rose%20pale@300x.png';
  return (
    <section id={id} className={`about-section ${className} about-section--bg`} style={{ backgroundImage: `url(${bgUrl})` }}>
      <div data-aos="fade-up" data-aos-duration="200" data-aos-delay="100">
        <div className="feature-text">
          <h2 className="about-title">QUI EST MAX ?</h2>
          <p>Je suis là pour vous écouter, vous soutenir et vous aider à avancer. Grâce à l'intelligence artificielle, je vous propose des conseils adaptés pour gérer le stress, l'anxiété ou les moments difficiles. Vos échanges restent confidentiels et sécurisés. <br /> Je ne remplace pas un professionnel, mais je suis là pour vous accompagner, sans jugement, à chaque étape.</p>
        </div>

        <div className="feature-text">
          <h2  className="about-title">UNE ÉCOUTE SIMPLE,<br />DES RÉPONSES CLAIRES</h2>
          <p>Je m'adapte à vous, à votre personnalité et à vos besoins.Je retiens ce que vous partagez avec moi et j'évolue à vos côtés. Vous choisissez comment je communique : bienveillant, direct ou neutre, c'est vous qui décidez.  Besoin d'un avis ? Envoyez-moi une photo ou décrivez une <br />situation, je suis là pour vous guider et vous conseiller. </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;