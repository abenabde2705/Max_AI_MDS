<script setup>
const features = [
  {
    title: 'Toujours à vos côtés',
    description: 'Une aide accessible 24/7 pour vous accompagner à chaque étape de votre vie.',
    icon: '👥'
  },
  {
    title: 'Aide pour tous, sans jugement',
    description: 'Qui que vous soit, votre histoire, Max est là pour vous écouter avec bienveillance.',
    icon: '🤝'
  },
  {
    title: 'Sécurité des données',
    description: 'Vos informations sont protégées selon des normes strictes en matière de sécurité.',
    icon: '🛡️'
  },
  {
    title: 'Confidentialité',
    description: 'Vos échanges restent privés et confidentiels, toujours.',
    icon: '💬'
  }
]
</script>

<template>
  <section class="features-section">
    <div class="features-grid">
      <div v-for="feature in features" :key="feature.title" class="feature-card">
        <div class="icon">{{ feature.icon }}</div>
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
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

h3 {
  color: #1C5372;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

p {
  color: #666;
  line-height: 1.6;
}
</style>