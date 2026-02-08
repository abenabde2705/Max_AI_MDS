import React, { useEffect } from 'react';
import PlanCard from './PlanCard';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface AbonnementProps {
  className?: string;
}

const Abonnement: React.FC<AbonnementProps> = ({ className }) => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div id="app" className="py-16 px-8 min-h-[600px]" >
      <div data-aos="fade-up" data-aos-duration="500" data-aos-delay="200">
        <h1 id="title" className="text-[#DAE63D] text-[2.5rem] font-bold text-center mb-12 tracking-[3px] font-['Ubuntu',sans-serif]">ABONNEMENTS</h1>
        
        <div className="flex flex-wrap justify-center items-stretch gap-12 max-w-[1400px] mx-auto mt-0">
          <PlanCard
            title="Plan Free"
            price="Gratuit"
            priceLabel=""
            description="Version D'essai"
            features={[
              'Fonctionnalités Incluses :',
              '',
              'Limite De 10 Échanges',
              '',
              'Chatbot Max (Écoute Empathique)',
            ]}
            buttonText=""
            buttonStyle="free"
          />
          
          <PlanCard
            title="Plan Premium"
            price="14,99€"
            priceLabel=" / mois"
            description="Engagement : Sans engagement ou avec abonnement"
            features={[
              'Fonctionnalités Incluses :',
              '',
              'Suivi Émotionnel Personnalisé',
              '',
              'Statistiques Bien-Être',
              '',
              'Recommandation De Professionnels (Coach)',
              '',
              'Contenus Exclusifs Audio / Vidéo',
              '',
              'Journal Émotionnel Simple',
            ]}
            buttonText=""
            buttonStyle="primary"
            highlight={true}
          />
          
          <PlanCard
            title="Plan Campus"
            price="8€"
            priceLabel=" / mois"
            description="Pris en charge par l'établissement"
            features={[
              'Fonctionnalités Incluses :',
              '',
              'Accès Complet À l\'offre Premium Pour Tous Les Étudiants Concernés',
            ]}
            buttonText=""
            buttonStyle="campus"
          />
        </div>
      </div>
    </div>
  );
};

export default Abonnement;