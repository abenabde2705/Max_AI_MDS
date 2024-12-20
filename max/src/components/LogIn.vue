<template>
  <div class="login-container">
    <div class="login-form-container">
      <NavBar />
      
      <div class="login-form-header">
        <h1>MAX</h1>
        <p>Connectez-vous à votre compte</p>
      </div>

      <form @submit.prevent="handleSubmit" class="login-form">
        <!-- Message d'erreur -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-group">
          <input
            type="email"
            placeholder="Adresse email"
            v-model="form.email"
            required
            class="login-input"
          />
        </div>
        
        <div class="form-group">
          <input
            type="password"
            placeholder="Mot de passe"
            v-model="form.password"
            required
            class="login-input"
          />
        </div>

        <div class="forgot-password">
          <button type="button" class="forgot-password-btn" @click="$router.push('/reset-password')">
            Mot de passe oublié ?
          </button>
        </div>

        <button type="submit" class="login-submit-btn" :disabled="loading">
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>

        <p class="login-terms">
          Pas encore de compte ? 
          <button type="button" class="login-terms-button" @click="$router.push('/SignUp')">
            Inscrivez-vous ici.
          </button>
        </p>
      </form>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from './NavBar.vue'
import Footer from './Footer.vue'

const router = useRouter()
const error = ref('')
const loading = ref(false)

const form = ref({
  email: '',
  password: ''
})

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    // Simulation d'une connexion
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (form.value.email && form.value.password) {
      console.log('Tentative de connexion avec:', form.value)
      router.push('/chat')
    } else {
      error.value = 'Veuillez remplir tous les champs'
    }
  } catch (e) {
    error.value = 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  background: linear-gradient(104.32deg, #1C5372 0%, #90DBF5 57.67%, #FFD2C7 95.58%);
  position: relative;
  overflow: hidden;
  min-height: 100vh;
}

.login-form-container {
  width: 100%;
  max-width: 40rem;
  margin: 0 auto;
  padding: 2rem;
}

.login-form {
  background: rgba(128, 128, 128, 0.2);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-form-header {
  text-align: center;
  margin-bottom: 3rem;
}

.login-form-header h1 {
  color: white;
  font-size: 3.75rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.login-form-header p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.25rem;
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%;
}

.login-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.login-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.5);
  transform: translateY(-2px);
}

.error-message {
  background-color: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.forgot-password {
  text-align: right;
  margin-bottom: 1.5rem;
}

.forgot-password-btn {
  background: none;
  border: none;
  color: white;
  font-size: 0.9rem;
  text-decoration: underline;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.forgot-password-btn:hover {
  opacity: 0.8;
}

.login-submit-btn {
  width: 100%;
  padding: 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1.1rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-submit-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
}

.login-submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-terms {
  text-align: center;
  color: white;
  font-size: 0.9rem;
  margin-top: 1.5rem;
}

.login-terms-button {
  background: none;
  border: none;
  color: black;
  transition: all 0.3s ease;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 600;
}

.login-terms-button:hover {
  color: white;
}

@media (max-width: 640px) {
  .login-form-container {
    padding: 1rem;
  }

  .login-form-header h1 {
    font-size: 3rem;
  }

  .login-form {
    padding: 1.5rem;
  }
}
</style>