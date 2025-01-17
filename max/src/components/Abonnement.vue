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
          :buttonText="'Passer À Premium'"
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
          :buttonText="'Passer Plan Mensuel'"
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
    border-radius: 10px;
    padding: 20px;
    width: 350px; /* Largeur fixe pour toutes les cartes */
    min-height: 500px; /* Hauteur minimale pour uniformiser la taille */
    display: flex;
    margin: 20px;
    flex-direction: column;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s;
    text-align: center;
  }
  .plan-maininfo{
    margin-bottom: 20px;
  }
  .plan-card.highlight {
    background: #1C5372;
    color: #fff; 
   }
    .plan-card.highlight p  {
        color: #fff !important;  }
        .plan-card.highlight li  {
            color: #fff !important;  }
  
  .plan-card:hover {
    transform: scale(1.05);
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
    padding: 10px;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .plan-button.primary {
    background-color: #007bff;
    color: white;
  }
  
  .plan-button.primary:hover {
    background-color: #0056b3;
  }
  
  .plan-button.secondary {
    background-color: white;
    color: #007bff;
    border: 1px solid #007bff;
  }
  
  .plan-button.secondary:hover {
    transition: all ease-in-out  0.3s;
    background-color: #007bff;
    color: white;
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
    gap: 20px;
  }
  </style>
  