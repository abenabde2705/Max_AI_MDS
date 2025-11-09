<script setup>
import ChatExample from './ChatExample.vue'
</script>

<template>
  <section class="about-section">
    <div data-aos="fade-up" data-aos-duration="200" data-aos-delay="100">
    <h2 class="title">QUI EST MAX ?</h2>
    
    <div class="description">
      <p>Je suis là pour vous écouter, vous soutenir et vous aider à avancer. Grâce à l'intelligence artificielle, je vous propose des conseils adaptés pour gérer le stress, l'anxiété ou les moments difficiles. Vos échanges restent confidentiels et sécurisés.</p>
      <p>Je ne remplace pas un professionnel, mais je suis là pour vous accompagner, sans jugement, à chaque étape.</p>
    </div>

    <div class="features-container">
      <div class="feature-text">
        <h3>UNE ÉCOUTE SIMPLE,<br />DES RÉPONSES CLAIRES</h3>
        <p>Je m'adapte à vous, à votre personnalité et à vos besoins. Je retiens ce que vous partagez avec moi et j'évolue à vos côtés. Vous choisissez comment je communique : bienveillant, direct ou neutre, c'est vous qui décidez.</p>
        <p>Besoin d'un avis ? Envoyez-moi une photo ou décrivez une situation, je suis là pour vous guider et vous conseiller.</p>
      </div>
      <ChatExample />
    </div>
  </div>
  </section>
</template>

<style scoped>
.about-section {
  /**background-color: #1C5372;*/
  color: rgb(0, 0, 0);
  padding: 4rem 2rem;
}

.title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: bold;
  font-family: 'TT Modernoir Trial';
}

.description {
  max-width: 800px;
  margin: 0 auto 4rem;
  text-align: center;
  line-height: 1.6;
}

.description p {
}

.features-container {
  display: flex;
  margin: 0 auto;
  gap: 4rem;
  align-items: center;
}

.feature-text {
  flex: 1;
  max-width: 800px;

}

.feature-text h3 {
  font-family: 'TT Modernoir Trial';
  font-size: 38px;
  font-weight: bold;
  color: #000000;
  margin-bottom: 2rem;
  line-height: 1.2;
  margin-left: 12px;
  text-align: -webkit-center;
}

.feature-text p {
  margin-bottom: 1rem;
  line-height: 1.6;
}

/* Responsive styles */
@media (max-width: 768px) {
  .features-container {
    flex-direction: column;
    gap: 2rem;
    text-align: center;
  }

  .feature-text h3 {
    font-size: 32px; /* Légère réduction pour petits écrans */
    margin-left: 0;
  }

  .feature-text p {
    margin-bottom: 1rem;
  }

  .description {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 2rem; /* Réduction pour les très petits écrans */
  }

  .feature-text h3 {
    font-size: 28px; /* Réduction supplémentaire */
  }

  .features-container {
    gap: 1.5rem;
  }

  .description {
    padding: 0 0.5rem;
  }
}
</style>
