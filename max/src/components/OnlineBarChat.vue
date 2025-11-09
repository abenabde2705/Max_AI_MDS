<template>
  <div class="BarChat">
    <div class="bar-container">
      <div class="logo-section">
        <div class="LogoContainer">
          <img src="../assets/LOGO_rose_pale300x.png" alt="MAX" class="avatar-img" />
          <div class="online-indicator">
            <div class="online-dot"></div>
          </div>
        </div>
      </div>
      
      <div class="premium-section">
        <button class="premium-button" @click="$router.push('/landingpage#abonnement')">
          Passe à MAX Premium ✨
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.BarChat {
  /*background-color: #81bde1;*/
  padding: 0.75rem 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 10;
  backdrop-filter: blur(5px);
}

.bar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-section {
  display: flex;
  align-items: center;
}

.LogoContainer {
  position: relative;
  width: 48px;
  height: 48px;
}

.avatar-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.avatar-img:hover {
  transform: scale(1.05);
}

.logo-text {
  margin-left: 12px;
  font-weight: 700;
  font-size: 1.5rem;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.premium-section {
  margin-left: auto;
}

.premium-button {
  background: linear-gradient(135deg, #1e40af, #2563eb);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.premium-button:hover {
  background: linear-gradient(135deg, #1e3a8a, #1e40af);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(37, 99, 235, 0.4);
}

.premium-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
}

/* Online indicator styling */
.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

.online-dot {
  width: 10px;
  height: 10px;
  background-color: #4CAF50; /* Green color for online status */
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.6;
    transform: scale(0.9);
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .bar-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .premium-section {
    margin-left: 0;
  }
  
  .BarChat {
    padding: 0.75rem 1rem;
  }
}
</style>