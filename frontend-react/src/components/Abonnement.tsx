
import React, { useEffect, useState } from 'react';
import PlanCard from './PlanCard';
import StudentVerifyModal from './StudentVerify';
import { createCheckoutSession } from '../services/chat.api';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface AbonnementProps {
  className?: string;
}

const Abonnement: React.FC<AbonnementProps> = ({ className: _className }) => {
  const [loadingPlan, setLoadingPlan] = useState<'premium' | 'student' | null>(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);

  useEffect(() => {
    AOS.init();
  }, []);

  const handlePremiumCheckout = async () => {
    setLoadingPlan('premium');
    try {
      const { data } = await createCheckoutSession('premium');
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erreur checkout premium:', error);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleStudentPlan = () => {
    setStudentModalOpen(true);
  };

  return (
    <>
    <StudentVerifyModal isOpen={studentModalOpen} onClose={() => setStudentModalOpen(false)} />
    <div id="app" className="Abonnement">
      <div data-aos="fade-up" data-aos-duration="500" data-aos-delay="200">
        <h1 id="title" className="title">ABONNEMENTS</h1>

        <div className="plans-container">
          <PlanCard
            title="Plan Free"
            price="Gratuit"
            priceLabel=""
            description="Version D'essai"
            features={[
              'Fonctionnalités Incluses :',
              '',
              'Limite De 10 Échanges Par Jour',
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
            buttonText={loadingPlan === 'premium' ? 'Chargement...' : 'S\'abonner Premium'}
            buttonStyle="primary"
            highlight={true}
            onClick={handlePremiumCheckout}
            disabled={loadingPlan !== null}
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
            buttonText={loadingPlan === 'student' ? 'Chargement...' : 'Vérification étudiante'}
            buttonStyle="campus"
            onClick={handleStudentPlan}
            disabled={loadingPlan !== null}
          />
        </div>
      </div>
    </div>
    </>
  );
};

export default Abonnement;
