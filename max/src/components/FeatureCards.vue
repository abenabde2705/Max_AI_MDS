<script setup>
import image1 from '../assets/img/valeurs/toujours_vos_cotes.png';
import image2 from '../assets/img/valeurs/aide.png';
import image3 from '../assets/img/valeurs/securite.png';
import image4 from '../assets/img/valeurs/confidentialite.png';


const features = [
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


</script>

<template>
  <section class="features-section">
    <div class="features-grid">
      <div v-for="feature in features" :key="feature.title" class="feature-card">
        <div class="icon"><img style="height: auto; width: 70%;" :src="feature.image" alt="dsf"></div>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features-section {
  padding: 4rem 2rem;
  background: rgba(255, 210, 199, 1);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.feature-card {
  background: #FFFFFF;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.icon {
  font-size: 2.5rem;
}

h3 {
  color: #1C5372;
  font-size: 1.25rem;
}

p {
  color: #666;
  line-height: 1.4;
  font-size: 0.95rem;
  max-width: 90%;
  margin: 0 auto;
}
</style>