
import React, { useEffect, useState } from 'react';
import PlanCard from './PlanCard';
import StudentVerifyModal from './StudentVerify';
import { createCheckoutSession } from '../services/chat.api';
import { usePremium } from '../context/PremiumContext';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface AbonnementProps {
  className?: string;
}

const Abonnement: React.FC<AbonnementProps> = ({ className: _className }) => {
  const [loadingPlan, setLoadingPlan] = useState<'premium' | 'student' | null>(null);
  const { isPremium } = usePremium();
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

  const premiumButtonText = isPremium ? 'Abonnement actif' : loadingPlan === 'premium' ? 'Chargement...' : "S'abonner Premium";
  const studentButtonText = isPremium ? 'Abonnement actif' : loadingPlan === 'student' ? 'Chargement...' : "S'abonner en tant qu'étudiant";

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
           
                'Limite De 10 Échanges Par Jour',
                '',
                'Écoute active et bienveillante',
                '',
                'Disponibilité 24h/24 & 7j/7',
                '',
                'Confidentialité totale'
              ]}
              buttonText=""
              buttonStyle="free"
            />

            <PlanCard
              title="Plan Premium"
              price="14,99€"
              priceLabel=" / mois"
              description="Accompagnement complet sans engagement"
              features={[
            
                'Échanges illimités avec Max',
                '',
                'Suivi Émotionnel Personnalisé',
                '',
                'Statistiques Bien-Être',
                '',
                'Recommandation De Professionnels (Coach)',
              
                '',
                'Journal Émotionnel Simple',
                '',
                'Accès prioritaire aux nouvelles fonctions'
              ]}
              buttonText={premiumButtonText}
              buttonStyle="primary"
              highlight={true}
              onClick={isPremium ? undefined : handlePremiumCheckout}
              disabled={isPremium || loadingPlan !== null}
            />

            <PlanCard
              title="Plan Campus"
              price="8€"
              priceLabel=" / mois"
              description="Tarif réduit spécial étudiants"
              features={[

                'Accès Complet À l\'offre Premium Pour Tous Les Étudiants Concernés',
              ]}
              buttonText={studentButtonText}
              buttonStyle="campus"
              onClick={isPremium ? undefined : handleStudentPlan}
              disabled={isPremium || loadingPlan !== null}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Abonnement;
