import React from 'react';
import image1 from '../assets/img/valeurs/toujours_vos_cotes.png';
import image2 from '../assets/img/valeurs/aide.png';
import image3 from '../assets/img/valeurs/securite.png';
import image4 from '../assets/img/valeurs/confidentialité.png';

interface Feature {
  title: string;
  description: string;
  image: string;
}

interface FeatureCardsProps {
  id?: string;
  className?: string;
}

const features: Feature[] = [
  {
    title: 'Toujours à vos côtés',
    description: 'Une aide accessible 24/7 pour vous accompagner à chaque étape de votre vie.',
    image: image1
  },
  {
    title: 'Aide pour tous, sans jugement',
    description: 'Qui que vous soit, votre histoire, Max est là pour vous écouter avec bienveillance.',
    image: image2
  },
  {
    title: 'Sécurité des données',
    description: 'Vos informations sont protégées selon des normes strictes en matière de sécurité.',
    image: image3
  },
  {
    title: 'Confidentialité',
    description: 'Vos échanges restent privés et confidentiels, toujours.',
    image: image4
  }
];

const FeatureCards: React.FC<FeatureCardsProps> = ({ id, className }) => {
  return (
    <section id={id} className={`features-section ${className}`}>
      <div className="features-grid" data-aos="fade-up" data-aos-duration="500" data-aos-delay="200">
        {features.map((feature) => (
          <div key={feature.title} className="feature-card">
            <div className="icon">
              <img style={{ height: 'auto', width: '70%' }} src={feature.image} alt="Icon feature" />
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureCards;