<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isVisible = ref(false);
const scrollThreshold = 300; // Apparaît après avoir défilé de 300px

const checkScroll = () => {
  isVisible.value = window.scrollY > scrollThreshold;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

onMounted(() => {
  window.addEventListener('scroll', checkScroll);
  checkScroll(); // Vérification initiale
});

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll);
});
</script>

<template>
  <transition name="fade">
    <button 
      v-if="isVisible" 
      @click="scrollToTop" 
      class="back-to-top"
      aria-label="Retour en haut"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <polyline points="18 15 12 9 6 15"></polyline>
      </svg>
    </button>
  </transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #90DBF5, #3b82f6);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 999;
  transform-origin: center;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.back-to-top:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
}

.back-to-top:active {
  transform: translateY(-2px) scale(0.98);
}

.back-to-top svg {
  transition: transform 0.2s;
}

.back-to-top:hover svg {
  transform: translateY(-2px);
}

/* Animation de transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}
</style>