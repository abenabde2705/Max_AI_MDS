<script setup>
const menuItems = [
  { text: 'Fonctionnalités', href: '#' },
  { text: 'Abonnement', href: '#' },
  { text: 'À Propos', href: '#' },
  { text: 'Contact', href: '#' }
]
</script>

<template>
  <div class="navbar-container">
    <nav class="navbar">
      <div class="nav-left">
        <div class="logo">MAX</div>
        <div class="nav-items">
          <a v-for="item in menuItems" :key="item.text" :href="item.href" class="nav-link">
            {{ item.text }}
            <span class="dropdown-arrow">▼</span>
          </a>
        </div>
      </div>
      <div class="auth-buttons">
        <button class="connexion-btn">
          <span class="icon">👤</span>
          Connexion
        </button>
        <button class="inscription-btn">
          Inscription
          <span class="arrow">→</span>
        </button>
      </div>
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
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 2rem;
  background: rgba(28, 83, 114, 1);
  backdrop-filter: blur(10px);
  border-radius: 50px;
  width: 80%;
  max-width: 1200px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 3rem;
}

.logo {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  letter-spacing: 2px;
}

.nav-items {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.nav-link:hover {
  opacity: 1;
}

.dropdown-arrow {
  font-size: 0.6em;
  margin-top: 2px;
}

.auth-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
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
  color: white;
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(5px);
  transition: background-color 0.2s;
}

.inscription-btn:hover {
  background: rgba(28, 83, 114, 0.7);
}

.arrow {
  font-size: 1.1em;
}
</style>