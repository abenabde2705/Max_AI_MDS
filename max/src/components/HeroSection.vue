<script setup>
import '../styles/buttons.css'
</script>

<template>
  <div class="hero">
    <div class="hero-content" data-aos="fade-up" data-aos-duration="500" data-aos-delay="100">
      <h1 class="title">MAX</h1>
      
      <p class="subtitle">Tu n'es jamais seul. Je suis là pour toi...</p>
      <button class="cta-button"> <router-link to="chatbot" style="text-decoration: none; color: white;">Parlez-moi</router-link></button>
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
  font-size: 14rem;
  color: #FFF1EF;
  letter-spacing: 4px;
}

.subtitle {
  font-size: 1.5rem;
  color: white;
  margin-bottom: 2rem;
  opacity: 0.9;

  /* Typewriter animation */
  overflow: hidden;
  white-space: nowrap;
  border-right: 2px solid white;
  width: 0; /* Start hidden */
  animation: typing 6s steps(30, end) infinite, blink 0.6s step-end infinite;
}

/* Keyframes for typing effect */
@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 100%; /* Adjust based on the text length */
  }
}

/* Keyframes for blinking cursor */
@keyframes blink {
  from, to {
    border-color: transparent;
  }
  50% {
    border-color: white;
  }
}

/* Responsive Styles */
@media (max-width: 768px) {
  .title {
    font-size: 10rem; /* Ajuste la taille pour les tablettes et mobiles */
    letter-spacing: 3px;
  }

  .subtitle {
    font-size: 1.2rem; /* Réduit légèrement la taille de la sous-titre */
  }

  .hero-content {
    padding: 1rem; /* Réduit les marges intérieures pour un meilleur ajustement */
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 6rem; /* Ajuste pour les petits écrans */
    letter-spacing: 2px;
  }

  .subtitle {
    font-size: 1rem; /* Réduit encore la taille pour de petits appareils */
  }

  .cta-button {
    font-size: 1rem; /* Ajuste la taille du bouton */
    padding: 0.8rem 1.5rem;
  }
}
</style>
