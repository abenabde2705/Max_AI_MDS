<script setup>
import '../styles/buttons.css'
</script>

<template>
  <div class="hero">
    <div class="hero-content">
      <img src="../assets/LOGO_rose_pale300x.png" alt="MAX" class="title">
      <p class="subtitle">Tu n'es jamais seul. Je suis là pour toi.</p>
      <button class="cta-button">Parlez-moi</button>
    </div>
  </div>
</template>

<style scoped>
.hero {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px);
  text-align: center;
  padding: 2rem;
}

.hero-content {
  max-width: 800px;
}

.title {
  width: 400px;
  height: auto;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.5rem;
  color: white;
  margin-bottom: 2rem;
  letter-spacing: 3px;
  opacity: 0.9;
}
</style>