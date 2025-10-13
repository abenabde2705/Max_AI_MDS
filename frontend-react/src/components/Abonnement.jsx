import React, { useEffect } from 'react';
import PlanCard from './PlanCard.jsx';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Abonnement = ({ className }) => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div id="app" className={className}>
      <div data-aos="fade-up" data-aos-duration="500" data-aos-delay="200">
        <h1 id="title" className="title">ABONNEMENT</h1>
        <p className="subtitle">
          Choisissez l'abonnement qui vous convient et profitez pleinement de Max.<br />
          <span className="subtitle-note">Sans engagement, annulable à tout moment.</span>
        </p>
        
        <div className="plans-container">
          <PlanCard
            title="Version Essai"
            price="0 €"
            description="Limite de 10 échanges"
            features={[
              'Chatbot Max (écoute empathique)',
            ]}
            buttonText="Gratuit"
            buttonStyle="secondary"
          />
          
          <PlanCard
            title="Premium"
            price="15€/mois ou 4,99€/semaine"
            description="Sans engagement ou avec abonnement"
            features={[
              'Suivi émotionnel personnalisé',
              'Statistiques bien-être',
              'Recommendation des pros (coach)',
              'Contenus exclusifs audio/vidéo',
              'Journal émotionnel simple',
            ]}
            buttonText="Plan Premium"
            buttonStyle="primary"
            highlight={true}
          />
          
          <PlanCard
            title="Campus"
            price="8€/mois"
            description="Pris en charge par l'établissement"
            features={[
              'Offre Premium à tous les étudiants concernés',
            ]}
            buttonText="Plan Campus"
            buttonStyle="secondary"
          />
        </div>
      </div>
    </div>
  );
};

export default Abonnement;