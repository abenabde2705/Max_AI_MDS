<template>
    <div class="success-container">
      <div class="content">
        <div class="logo">MAX</div>
        
        <h1>Félicitations, vous êtes inscrit(e) !</h1>
        
        <img src="../assets/img/valeurs/heart.png" alt="heart" class="heart-icon">
        <p class="message">
          Max est ici pour vous accompagner à chaque étape. Que vous ayez besoin de
          discuter de vos émotions, de gérer votre stress ou d'obtenir des conseils,
          nous sommes là pour vous.
        </p>
  
        <button class="cta-button" @click="$router.push('/')">PARLEZ-MOI</button>
      </div>
    </div>
</template>

<script setup>

</script>

<style scoped>
.success-container {
  background: linear-gradient(104.32deg, #1C5372 0%, #90DBF5 57.67%, #FFD2C7 95.58%);
  color: white;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.back-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  padding: 10px;
  cursor: pointer;
  position: absolute;
  top: 40px;
  left: 10px;
}

.arrow {
  display: inline-block;
  transform: scale(1.5);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.logo {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 1rem 0;
  letter-spacing: 2px;
}

h1 {
  font-size: 1.5rem;
  font-weight: normal;
  margin-bottom: 1.5rem;
}

.heart-icon {
  width: 200px;
  height: 150px;
  margin: 1rem 0;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3));
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.message {
  line-height: 1.4;
  margin: 1.5rem 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.cta-button {
  background: #5597B4;
  border: none;
  color: white;
  padding: 15px 40px;
  border-radius: 25px;
  font-size: 0.9rem;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.cta-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.home-indicator {
  width: 140px;
  height: 5px;
  background: white;
  border-radius: 3px;
  margin: 10px auto;
  opacity: 0.5;
}

@media (max-width: 640px) {
  .content {
    padding: 20px 15px;
  }

  h1 {
    font-size: 1.3rem;
  }

  .message {
    font-size: 1rem;
  }

  .heart-icon {
    width: 60px;
    height: 60px;
  }
}
</style>