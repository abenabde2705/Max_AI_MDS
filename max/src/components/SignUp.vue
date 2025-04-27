<template>
  <div class="login-container">
      <NavBar />
    <div class="login-form-wrapper">
      <div class="logo-section">
        <h1 class="logo-text">MAX</h1>
        <p class="logo-subtitle">Rejoignez Max</p>
      </div>
      
      <div class="form-container">
        <div class="form-header">
          <h2 class="form-title">L'aventure commence ici !</h2>
          <p class="form-subtitle">Découvrez une nouvelle façon d'être accompagné au quotidien.</p>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="email">E-mail</label>
            <input 
              id="email" 
              type="email" 
              v-model="form.email" 
              placeholder="Example@email.com"
              class="form-input"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input 
              id="password" 
              type="password" 
              v-model="form.password" 
              placeholder="at least 8 characters"
              class="form-input"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="phone">Numéro de téléphone</label>
            <input 
              id="phone" 
              type="tel" 
              v-model="form.phone" 
              placeholder="at least 8 characters"
              class="form-input"
              required
            />
          </div>
          
          <div class="terms-checkbox">
            <input 
              type="checkbox" 
              id="terms" 
              v-model="form.acceptTerms"
            />
            <label for="terms">Accepter les Termes de Confidentialité</label>
          </div>
          
          <button type="submit" class="login-button">Connexion</button>
          
          <p class="login-link">
            Déjà inscrit(e) ? <a href="#" @click.prevent="goToLogin">Connecte-toi ici.</a>
          </p>
          
          <div class="divider">
            <span>ou</span>
          </div>
          
          <div class="social-login">
            <button type="button" class="social-button google-button">
              <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                <path d="M1 1h22v22H1z" fill="none"/>
              </svg>
              Inscription avec Google
            </button>
            <button type="button" class="social-button facebook-button">
              <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" fill="#1877F2"/>
              </svg>
              Inscription avec Facebook
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  email: '',
  password: '',
  phone: '',
  acceptTerms: false
})

const handleSubmit = () => {
  if (!form.value.acceptTerms) {
    alert('Veuillez accepter les termes de confidentialité')
    return
  }
  
  // Logique de connexion ici
  console.log('Form submitted:', form.value)
}

const goToLogin = () => {
  // Navigation vers la page de connexion
  console.log('Navigating to login page')
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1C5372 0%, #90DBF5 57.67%, #FFD2C7 95.58%);
  padding: 1rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-section {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo-text {
  font-size: 3.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: 1px;
}

.logo-subtitle {
  color: white;
  font-size: 1.25rem;
  margin-top: 0.5rem;
}

.form-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.form-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: white;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.7);
  color: #333;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input::placeholder {
  color: #666;
}

.form-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.terms-checkbox {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.terms-checkbox input {
  margin-right: 0.5rem;
}

.terms-checkbox label {
  color: white;
  font-size: 0.875rem;
}

.login-button {
  width: 100%;
  padding: 0.875rem;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.login-button:hover {
  background: #2563EB;
}

.login-link {
  text-align: center;
  margin: 1rem 0;
  color: white;
  font-size: 0.875rem;
}

.login-link a {
  color: white;
  text-decoration: underline;
}

.divider {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.divider span {
  padding: 0 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: none;
  background: white;
  color: #333;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-button:hover {
  background: #f8f8f8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.social-icon {
  margin-right: 0.75rem;
}

@media (max-width: 480px) {
  .form-container {
    padding: 1.5rem;
  }
  
  .logo-text {
    font-size: 3rem;
  }
}
</style>