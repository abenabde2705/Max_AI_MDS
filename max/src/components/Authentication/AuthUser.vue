<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../../layout/NavBar.vue'
import Footer from '../../layout/Footer.vue'

export default {
  name: 'AuthPage',
  components: {
    NavBar,
    Footer
  },
  data() {
    return {
      mode: 'login',
      error: '',
      loading: false,
      form: {
        firstName: '',
        lastName: '',
        birthDate: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
      }
    };
  },
  methods: {
    toggleMode() {
      this.mode = this.mode === 'login' ? 'register' : 'login';
      this.error = '';
    },
    validateForm() {
      this.error = '';
      
      if (this.mode === 'register') {
        if (!this.form.firstName.trim()) {
          this.error = 'Le prénom est requis';
          return false;
        }
        if (!this.form.lastName.trim()) {
          this.error = 'Le nom est requis';
          return false;
        }
        if (!this.form.birthDate) {
          this.error = 'La date de naissance est requise';
          return false;
        }
        if (this.form.password !== this.form.confirmPassword) {
          this.error = 'Les mots de passe ne correspondent pas';
          return false;
        }
        if (!this.form.acceptTerms) {
          this.error = 'Veuillez accepter les termes de confidentialité';
          return false;
        }
      }
      
      if (!this.form.email.trim()) {
        this.error = 'L\'email est requis';
        return false;
      }
      if (!this.form.password) {
        this.error = 'Le mot de passe est requis';
        return false;
      }
      
      return true;
    },
    async handleSubmit() {
  if (!this.validateForm()) return;

  this.loading = true;

  try {
    if (this.mode === 'login') {
      const response = await fetch('http://185.98.139.244/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.form.email,
          password: this.form.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        this.error = data.message || 'Erreur lors de la connexion.';
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('name', data.user.firstName + ' ' + data.user.lastName);

      //console.log('data', data);
      //console.log('token', data.token);
      //console.log('name', data.user.firstName + ' ' + data.user.lastName);
    
      this.$router.push('/chatbot');
    } else {
      // Calculer l'âge à partir de la date de naissance
      const birthDate = new Date(this.form.birthDate);
      const ageDiffMs = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDiffMs);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);

      const response = await fetch('http://185.98.139.244/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: this.form.firstName,
          lastName: this.form.lastName,
          age: age,
          email: this.form.email,
          password: this.form.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        this.error = data.message || 'Erreur lors de l\'inscription.';
        return;
      }

      this.$router.push('/chatbot');  // Redirige vers la page de vérification ou login
    }
  } catch (error) {
    this.error = 'Une erreur est survenue. Veuillez réessayer.';
    console.error('Auth error:', error);
  } finally {
    this.loading = false;
  }
}
,
    goToLogin() {
      this.mode = 'login';
    },
    goToRegister() {
      this.mode = 'register';
    }
  }
};
</script>

<template>
  <div class="login-container">
    <NavBar/>
    
    <div class="login-form-container">
    
      
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="login-form-header">
        <h1>MAX</h1>
        <p>{{ mode === 'login' ? 'Welcome Back' : 'Rejoignez Max' }}</p>
      </div>
        <!-- Message d'erreur -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <template v-if="mode === 'register'">
          <div class="form-row">
            
            <div class="form-group">
              <label for="firstName">Prénom</label>
              <input
                id="firstName"
                type="text"
                v-model="form.firstName"
                placeholder="Votre prénom"
                class="login-input"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="lastName">Nom</label>
              <input
                id="lastName"
                type="text"
                v-model="form.lastName"
                placeholder="Votre nom"
                class="login-input"
                required
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="birthDate">Date de naissance</label>
            <input
              id="birthDate"
              type="date"
              v-model="form.birthDate"
              class="login-input"
              required
            />
          </div>
        </template>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            v-model="form.email"
            placeholder="example@email.com"
            class="login-input"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            v-model="form.password"
            placeholder="Votre mot de passe"
            class="login-input"
            required
          />
        </div>
        
        <template v-if="mode === 'register'">
          <div class="form-group">
            <label for="confirmPassword">Confirmez le mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              v-model="form.confirmPassword"
              placeholder="Confirmez votre mot de passe"
              class="login-input"
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
        </template>
        
        <template v-else>
          <div class="forgot-password">
            <button type="button" class="forgot-password-btn">
              Mot de passe oublié ?
            </button>
          </div>
        </template>
        
        <button type="submit" class="login-submit-btn" :disabled="loading">
          {{ loading ? (mode === 'login' ? 'Connexion...' : 'Inscription...') : (mode === 'login' ? 'Se connecter' : 'S\'inscrire') }}
        </button>
        
        <p class="login-terms">
          {{ mode === 'login' ? "Pas encore de compte ?" : "Déjà inscrit(e) ?" }}
          <button type="button" class="login-terms-button" @click="toggleMode">
            {{ mode === 'login' ? "S'inscrire ici" : "Se connecter ici" }}
          </button>
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
            {{ mode === 'login' ? 'Connexion avec Google' : 'Inscription avec Google' }}
          </button>
      
        </div>
      </form>
    </div>
    
    <Footer />
  </div>
</template>

<style scoped>
.login-container {
  background: linear-gradient(104.32deg, #1C5372 0%, #90DBF5 57.67%, #FFD2C7 95.58%);
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.login-form-container {
  width: 100%;
  max-width: 40rem;
  margin: 2rem auto;
  padding: 2rem;
  flex: 1;
}

.login-form {
  background: rgba(255, 255, 255, 0.089);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* Utiliser un pseudo-élément pour créer la bordure en dégradé */
.login-form::before {
  content: "";
  position: absolute;
  inset: 0; /* équivalent à top:0, right:0, bottom:0, left:0 */
  border-radius: 1rem;
  padding: 1px; /* épaisseur de la bordure */
  background: linear-gradient(45deg, #12c2e9, #c471ed, #f7797d);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.login-form-header {
  text-align: center;
  margin-bottom: 2rem;
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

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%;
}

.form-group label {
  display: block;
  color: white;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
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
  margin-bottom: 1.5rem;
  text-align: center;
  border: 1px solid rgba(239, 68, 68, 0.3);
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
  background: #76bbd7;
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
  color: white;
  transition: all 0.3s ease;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 600;
}

.login-terms-button:hover {
  opacity: 0.8;
}

.terms-checkbox {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.terms-checkbox input {
  margin-right: 0.5rem;
  cursor: pointer;
}

.terms-checkbox label {
  color: white;
  font-size: 0.875rem;
  margin-bottom: 0;
  cursor: pointer;
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

@media (max-width: 768px) {
  .login-form-container {
    padding: 1.5rem;
    max-width: 100%;
  }

  .login-form-header h1 {
    font-size: 3rem;
  }

  .login-form {
    padding: 1.5rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>