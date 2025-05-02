<template>
    <div id="app">
      <div  data-aos="fade-up" data-aos-duration="500" data-aos-delay="200">

      <h1 id="title" class="title">ABONNEMENT</h1>
      <p class="subtitle">
        Choisissez l'abonnement qui vous convient et profitez pleinement de Max.<br />
        <span class="subtitle-note">Sans engagement, annulable à tout moment.</span>
      </p>
      <div class="plans-container">
        <PlanCard
          :title="'Plan Free'"
          :price="'0 €'"
          :description="'Commencer gratuitement'"
          :features="[
            'Interactions étendues (10 sessions par jour).',
            'Choix du ton et de la personnalité de Max (bienveillant, neutre ou direct).',
            'Suggestions de ressources personnalisées selon vos besoins.',
          ]"
          :buttonText="'Gratuit'"
          :buttonStyle="'secondary'"
        />
        <PlanCard
        
          :title="'Plan Premium'"   
          :price="'14,99€ / mois'"
          :description="'Essai gratuit (0€ - 14 jours)'"
          :features="[
            'Accès illimité à Max pour discuter à tout moment.',
            'Envoi de photos, vidéos et documents pour des conseils précis.',
            'Personnalisation illimitée : Ajusté à votre style, ton et besoins.',
            'Analyse approfondie pour des conseils et stratégies sur mesure.',
            'Rapports mensuels pour suivre vos progrès émotionnels.',
            'Réductions sur les consultations recommandées via Max.',
          ]"
          :buttonText="'Plan Premium'"
          :buttonStyle="'primary'"
          highlight
        />
        <PlanCard
          :title="'Plan Mensuel'"
          :price="'9,99€ / mois'"
          :description="'Essai gratuit (0€ - 7 jours)'"
          :features="[
            'Accès illimité à Max pour discuter à tout moment.',
            'Envoi de photos, vidéos et documents pour des conseils précis.',
            'Personnalisation illimitée : Ajusté à votre style, ton et besoins.',
            'Analyse approfondie pour des conseils et stratégies sur mesure.',
          ]"
          :buttonText="'Plan Mensuel'"
          :buttonStyle="'secondary'"
        />
        
        
      </div>
    </div>
    </div>
  </template>
  
  <script>
  import PlanCard from "../components/PlanCard.vue";
  
  export default {
    components: {
      PlanCard,
    },
  };
  </script>
  
  <style scoped>
  .plan-card {
  border-radius: 15px;
  padding: 20px;
  width: 350px; /* Largeur fixe pour toutes les cartes */
  min-height: 500px; /* Hauteur minimale pour uniformiser la taille */
  display: flex;
  margin: 20px;
  flex-direction: column;
  transition: all 0.3s;
  text-align: center;
  position: relative;
  background-color: white;
  z-index: 1;
  overflow: hidden;
}

/* Effet de contour dégradé lumineux */
.plan-card::before {
  content: "";
  position: absolute;
  top: -2px;
  box-shadow: 0 8px 24px linear-gradient(45deg, #12c2e9, #c471ed, #f7797d);
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: #ffffff;
  z-index: -1;
  border-radius: 17px;
  animation: glowing 6s ease-in-out infinite alternate;
  opacity: 0.7;
  filter: blur(4px);
  transition: all 0.3s ease;

}

.plan-card:hover::before {
  opacity: 1;
  filter: blur(6px);
  animation-duration: 3s;
}

@keyframes glowing {
  0% {
    background-position: 0% 50%;
    filter: blur(4px);
  }
  50% {
    background-position: 100% 50%;
    filter: blur(6px);
  }
  100% {
    background-position: 0% 50%;
    filter: blur(4px);
  }
}

.plan-card.highlight {
  background: linear-gradient(45deg, #00c6fb, #005bea, #1C5372);
  color: #fff;
  box-shadow: 0 8px 24px linear-gradient(45deg, #12c2e9, #c471ed, #f7797d);
}

.plan-card.highlight::before {
  background: linear-gradient(45deg, #12c2e9, #c471ed, #f7797d);
  opacity: 0.85;
  animation: glowing-premium 4s ease-in-out infinite alternate;
}

@keyframes glowing-premium {
  0% {
    background-position: 0% 50%;
    filter: blur(5px);
  }
  50% {
    background-position: 100% 50%;
    filter: blur(8px);
  }
  100% {
    background-position: 0% 50%;
    filter: blur(5px);
  }
}

.plan-card.highlight p {
  color: #fff !important;
}

.plan-card.highlight li {
  color: #fff !important;
}

.plan-card:hover {
  transform: translateY(-10px) scale(1.02);
}

.plan-maininfo {
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
}

  .plan-title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .plan-price {
  font-size: 1.5rem;
  color: #000000;
  text-align: center;
  margin: 20px 0; 
  
  display: flex;
  align-items: center; /* Centre verticalement */
  justify-content: center; /* Centre horizontalement */
}
  
  .plan-description {
    font-size: 1rem;
    color: #555;
    margin-bottom: 20px;
  }
  
  .plan-features {
    list-style: none;
    padding: 0;
    margin-bottom: 20px;
  }
  
  .plan-features li {
    font-size: 0.9rem;
    color: #555;
    margin-bottom: 8px;
  }
  
  .plan-button {
  display: block;
  width: 100%;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: auto; /* Place le bouton en bas de la carte */
}

.plan-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: 0.5s;
}

.plan-button:hover::after {
  left: 100%;
}

.plan-button.primary {
  background-color: white;
  color: #007bff;
  border: none;
}

.plan-button.primary:hover {
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  transform: translateY(-3px);
  box-shadow: 0 7px 14px rgba(59, 130, 246, 0.4);
}

.plan-button.primary:active {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(59, 130, 246, 0.3);
}

.plan-button.secondary {
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.1);
}

.plan-button.secondary:hover {
  background: rgba(59, 130, 246, 0.05);
  color: #1e40af;
  border-color: #1e40af;
  transform: translateY(-3px);
  box-shadow: 0 7px 14px rgba(59, 130, 246, 0.15);
}

.plan-button.secondary:active {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(59, 130, 246, 0.1);
}


.plan-card.highlight .plan-button {
  animation: pulse-button 2s infinite;
}

/* Styles responsifs */
@media (max-width: 768px) {
  .plan-button {
    padding: 10px 16px;
    font-size: 0.95rem;
  }
}
  #app {
    text-align: center;
    padding: 20px;
   /* background-color: #EDE4DC;*/
  }
  
  .title {
    color: #82575E;
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .subtitle {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 40px;
  }
  
  .subtitle-note {
    font-weight: bold;
    
    font-size: 1.1rem;
    color: black;
  }
  
  .plans-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px;
  }
  </style>
  