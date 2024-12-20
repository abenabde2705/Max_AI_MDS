<template>
  <div class="maintenance-container">
    <div class="maintenance-content">
      
      <div class="spinner-container">
        <div class="spinner">M</div>
      </div>

      <h1>En cours de développement</h1>
      <p>Cette fonctionnalité arrive bientôt !</p>
      
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <span class="progress-text">Progression: 25%</span>
      </div>

      <router-link to="/" class="back-button">
        Retour à l'accueil
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.maintenance-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  padding: 1rem;
  color: white;
  font-family: system-ui, -apple-system, sans-serif;
}

.maintenance-content {
  text-align: center;
  max-width: 600px;
  padding: 2rem;
}

.logo {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 2rem;
  letter-spacing: 2px;
}

.spinner-container {
  height: 150px;
  margin: 2rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  font-size: 5rem;
  font-weight: bold;
  color: white;
  animation: spin 3s ease-in-out infinite;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  position: relative;
}

.spinner::after {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 4px solid white;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
  opacity: 0.3;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  50% { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.6; }
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.progress-container {
  margin: 2rem 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  width: 75%;
  height: 100%;
  background: #60a5fa;
  border-radius: 4px;
  animation: pulse 2s ease-in-out infinite;
}

.progress-text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
}

.back-button {
  display: inline-block;
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .maintenance-content {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
  }

  p {
    font-size: 1rem;
  }

  .spinner {
    font-size: 4rem;
  }
}
</style>