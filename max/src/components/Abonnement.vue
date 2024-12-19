<template>
    <div id="app">
      <h1 class="title">ABONNEMENT</h1>
      <p class="subtitle">
        Choisissez l'abonnement qui vous convient et profitez pleinement de Max.<br />
        <span class="subtitle-note">Sans engagement, annulable à tout moment.</span>
      </p>
      <div class="plans-container">
        <PlanCard
          :title="'Plan Free (Gratuit)'"
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
  #app {
    text-align: center;
    padding: 20px;
    background-color: #E9E9E9;
  }
  
  .title {
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
    font-size: 0.9rem;
    font-weight: normal;
    color: #888;
  }
  
  .plans-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
  }
  </style>
  