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
    <div class="features-grid" data-aos="fade-up" data-aos-duration="500" data-aos-delay="200">
      <div v-for="feature in features" :key="feature.title" class="feature-card">
        <div class="icon">
          <img style="height: auto; width: 70%;" :src="feature.image" alt="Icon feature" />
        </div>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features-section {
  padding: 4rem 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Deux colonnes sur les écrans larges */
  gap: 3rem;
  max-width: 1800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
.feature-card {
  background: #E9E9E9;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
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
  font-family: 'Articulat CF regular', sans-serif;
  color: #181A20;
  font-size: 1.25rem;
}

p {
  color: #666;
  line-height: 1.4;
  font-size: 0.95rem;
  max-width: 90%; /* Limite la largeur pour les petits écrans */
  margin: 0 auto;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr; /* Une seule colonne sur les écrans moyens et petits */
    gap: 2rem;
  }

  .feature-card {
    height: auto; /* Supprime la contrainte de hauteur fixe pour s'adapter au contenu */
  }

  p {
    font-size: 0.9rem; /* Ajuste légèrement la taille du texte pour les écrans moyens */
  }
}

@media (max-width: 480px) {
  .features-section {
    padding: 2rem 1rem; /* Réduction du padding pour les très petits écrans */
  }

  h3 {
    font-size: 1.1rem; /* Réduction légère de la taille des titres */
  }

  p {
    font-size: 0.85rem; /* Réduction supplémentaire pour les textes sur les écrans très petits */
  }
}
</style>
