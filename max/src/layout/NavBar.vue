<script setup>
import { ref, onMounted,computed  } from 'vue'

const menuItems = [
  { text: 'À Propos', href: '#about' },
  { text: 'Fonctionnalités', href: '#fonc' },
  { text: 'Témoignage', href: '#tem' },

  { text: 'Abonnement', href: '#title' },
  { text: 'Newsletter', href: '#news' }

]
// État pour ouvrir/fermer le menu mobile
const isMenuOpen = ref(false);
const isDropdownOpen = ref(false);
const isLoggedIn = ref(false);
const userEmail = ref('');


onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    isLoggedIn.value = true;
    // Simuler l’email : idéalement, récupère-le après login et stocke-le
    userEmail.value = localStorage.getItem('name') || 'client@example.com';
  }
});

const getInitials = computed(() => {
  const names = userEmail.value.split(' ');
  const firstInitial = names[0]?.charAt(0).toUpperCase() || '';
  const lastInitial = names[1]?.charAt(0).toUpperCase() || '';
  return firstInitial + lastInitial;
});
// Méthode pour scroller vers une section
const scrollToSection = (href) => {
  const targetElement = document.querySelector(href);
  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    isMenuOpen.value = false; // Ferme le menu mobile après le clic
  }
};


const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('name');
  isLoggedIn.value = false;
  isDropdownOpen.value = false;
};


</script>

<template>
  <div class="navbar-container">
    <nav class="navbar">
      <div class="nav-left">
        <div class="logo"><router-link style=" text-decoration: none;" to="/"><h1 style="color: white; text-decoration: none;">MAX</h1></router-link></div>
        <!-- Bouton hamburger pour mobile -->
        <button class="hamburger" @click="isMenuOpen = !isMenuOpen">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        <!-- Menu desktop -->
        <div
          class="nav-items cta"
          :class="{ 'mobile-menu': true, 'open': isMenuOpen }"
        >
        <a
  v-for="item in menuItems"
  :key="item.text"
  href="#"
  @click.prevent="scrollToSection(item.href)"
  class="nav-link"
>
  {{ item.text }}
</a>

        </div>
     
      </div>
      <div class="website-buttons">
        <button v-if="!isLoggedIn" class="connexion-btn cta">
    <router-link style="color: white; text-decoration: none;" to="/auth">Connexion</router-link>
  </button>
  <div v-else class="user-menu">
    <button class="user-icon" @click="isDropdownOpen = !isDropdownOpen">
  {{ getInitials }}
</button>
    <div v-if="isDropdownOpen" class="dropdown">
      <p>{{ userEmail }}</p>
      <button @click="logout">Déconnexion</button>
    </div>
  </div>
        <button class="inscription-btn cta">
          
          <router-link style=" text-decoration: none;" to="/chatbot"><a> Parlez à Max</a></router-link>

          <span class="arrow">→</span>
        </button>
        
      </div>
      <!-- Boutons -->
     
    </nav>
  </div>
</template>

<style scoped>
.navbar-container {
  display: flex;
  justify-content: center;
  padding-top: 2rem;
}

.navbar {
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 2rem;
  background: rgba(28, 83, 114, 1);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  width: 90%;
  height: 55px;
  max-width: 1200px;
  position: relative;
  z-index: 10;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 2px;
  margin-right: 1rem;
}

.nav-items {
  display: flex;
  gap: 2.5rem;
  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.nav-link {
  position: relative;
  color: white;
  text-decoration: none;
  display: inline-block;
  padding: 0.5rem 0;
  transition: color 0.3s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px; /* Ajuste la position en dessous du texte */
  width: 0;
  height: 2px; /* Hauteur de la bordure */
  background-color: white;
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%; /* Le soulignement couvre tout le texte */
}




/* Hamburger menu */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 0.3rem;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 11;
}

.hamburger .bar {
  width: 25px;
  height: 3px;
  background-color: white;
  border-radius: 5px;
}

.website-buttons {
  display: flex;
  gap: 1rem;
}

.connexion-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  transition: opacity 0.2s;
}

.connexion-btn:hover {
  opacity: 0.8;
}

.inscription-btn {
  background: rgba(28, 83, 114, 0.5);
  color: white !important;
  padding: 0.5rem 1.5rem;
  border: 1px solid white;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.inscription-btn a{
  color: white;
}
.inscription-btn a:hover{
  color: rgba(28, 83, 114, 0.5);
}


/*
.parlez{
  color: white;
}
.parlez:hover{
  color: rgba(28, 83, 114, 0.5);
}
*/
.inscription-btn:hover {
  background: rgba(255, 255, 255, 0.7);
  color: rgba(28, 83, 114, 0.5) !important;
}

.arrow {
  font-size: 1.1em;
}
.user-menu {
  position: relative;
}

.user-icon {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
  line-height: inherit;
}

.dropdown {
  position: absolute;
  right: 0;
  background: white;
  color: black;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  min-width: 150px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 20;
}

.dropdown p {
  margin: 0;
  font-size: 0.9rem;
}

.dropdown button {
  background: none;
  border: none;
  color: #1c5372;
  cursor: pointer;
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

.dropdown button:hover {
  text-decoration: underline;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .website-buttons {
    display: flex; /* Rendre les boutons visibles */
    flex-direction: column; /* Empiler les boutons verticalement */
    gap: 1rem; /* Ajouter un espace entre les boutons */
    align-items: center;
    margin-top: 1rem;
    width: 100%;


  }
  .website-buttons button {
  width: 100%;
  justify-content: center;
}
  .website-buttons .inscription-btn,
.website-buttons .connexion-btn {
  margin-bottom: 0.5rem;
}

  .navbar {
    flex-wrap: wrap;
    height: auto;
  }

  .nav-items {
    display: none;
  }

  .nav-items.mobile-menu {
        display: flex;
        align-items: center;
        flex-direction: column;
        gap: 1rem;
        background: rgba(28, 83, 114, 0.9);
        position: absolute;
        top: 120%;
        left: 0;
        right: 0;
        padding: 1rem;
        border-radius: 20px 20px 20px 20px;
        z-index: 10;
        transform: translateY(-200%);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
    }

  .nav-items.mobile-menu.open {
    transform: translateY(0);
    opacity: 1;
  }

  .hamburger {
    display: flex;
  }

  
}

@media (max-width: 480px) {
  .nav-left {
    justify-content: space-between;
    width: 100%;
  }

  .logo {
    font-size: 1.2rem;
  }

  .hamburger .bar {
    width: 20px;
  }

  .nav-items.mobile-menu {
    padding: 0.5rem 1rem;
  }

  .nav-link {
    font-size: 0.8rem;
  }
}
</style>
