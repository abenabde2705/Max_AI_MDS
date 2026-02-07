import React from 'react';
import image1 from '../assets/img/valeurs/toujours_vos_cotes.png';
import image2 from '../assets/img/valeurs/aide.png';
import image3 from '../assets/img/valeurs/securite.png';
import image4 from '../assets/img/valeurs/confidentialite.png';

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
    <section id={id} className={`py-16 px-8 ${className || ''}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-28 md:gap-x-0 md:gap-y-28 max-w-[1800px] mx-auto px-8" data-aos="fade-up" data-aos-duration="500" data-aos-delay="200">
        {features.map((feature) => (
          <div key={feature.title} className="p-8 rounded-xl text-center transition-all duration-300 ease-in-out h-auto md:h-[320px] flex flex-col items-center justify-center hover:-translate-y-2.5">
            <div className="text-[2.5rem]">
              <img className="h-auto w-[70%] mx-auto" src={feature.image} alt="Icon feature" />
            </div>
            <h3 className="text-xl font-normal text-white my-4 font-['Ubuntu',sans-serif]">{feature.title}</h3>
            <p className="text-white leading-[1.4] text-[0.95rem] max-w-[50%] mx-auto">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureCards;