<template>
    <div class="signup-container">
      <NavBar />
    <div class="signup-form-container">
     
     
      
  
      <form @submit.prevent="handleSubmit" class="signup-form">
        <div class="signup-form-header">
        <h1>MAX</h1>
        <p>Rejoignez La Communauté </p>

      </div>
        <div class="form-group">

          <input
            type="text"
            placeholder="Prénom"
            v-model="form.firstName"
            class="signup-input"
          />
          <input
            type="text"
            placeholder="Nom"
            v-model="form.lastName" 
            class="signup-input"
          />
        </div>
        <div class="form-group">
          <input
            type="number"
            placeholder="Âge"
            v-model="form.age"
            class="signup-input"
          />
          <input
            type="email"
            placeholder="Adresse email"
            v-model="form.email"
            class="signup-input"
          />
        </div>
        <div class="form-group">
          <input
            type="password"
            placeholder="Mot de passe"
            v-model="form.password"
            class="signup-input full-width"
          />
        </div>
        <div class="form-group">
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            v-model="form.confirmPassword"
            class="signup-input full-width"
          />
        </div>

        <div class="checkbox-group">
          <label class="checkbox-container">
            <input type="checkbox" v-model="form.acceptTerms">
            <span class="checkmark"></span>
            J'accepte les conditions générales d'utilisation
          </label>
        </div>
  
        <button type="submit" class="signup-submit-btn" @click="$router.push('/SuccessPage')">
          Rejoindre MAX
        </button>
  
        <p class="signup-terms">
            Déjà inscrit(e) ? <button class="signup-terms-button" @click="$router.push('/LogIn')">Connectez-vous ici.</button>
        </p>
      </form>
    </div>
    <Footer />
  </div>
</template>
  
<script setup>
import { ref } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import NavBar from './NavBar.vue';
import Footer from './Footer.vue';
  
const form = ref({
  firstName: '',
  lastName: '',
  age: '',
  email: '',
  password: '',
  acceptTerms: false,
  acceptNewsletter: false
})
  
const goBack = () => {
  // Handle back navigation
}
  
const handleSubmit = () => {
  if (!form.value.acceptTerms) {
    alert('Veuillez accepter les conditions générales')
    return
  }
  // Handle form submission
}
</script>
  
<style scoped>
.signup-container {
  background: linear-gradient(104.32deg, #1C5372 0%, #90DBF5 57.67%, #FFD2C7 95.58%);
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  
}

.signup-form-container {
  width: 100%;
  max-width: 40rem;
  margin: 0 auto;
  padding: 2rem;
  
}

.signup-form {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2.5rem;
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  width: 100%;
}

.form-group input {
  flex: 1;
}

.signup-form-header {
  text-align: center;
  margin-bottom: 3rem;
}

.signup-form-header h1 {
  color: white;
  font-size: 3.75rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.signup-form-header p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.25rem;
}

.signup-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  transition: all 0.3s ease;
  color: rgb(68, 63, 63);
}

.signup-input::placeholder {
  color: rgba(22, 20, 20, 0.7);
}

.signup-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.signup-input.full-width {
  width: 100%;
}

.checkbox-group {
  margin: 1.5rem 0;
}

.checkbox-container {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
}

.checkbox-container input {
  margin-right: 0.5rem;
}

.signup-submit-btn {
  width: 100%;
  padding: 1rem;
  background: #76bbd7;
  color: white;
  border: none;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
}

.signup-submit-btn:hover:not(:disabled) {
  background: rgba(37, 99, 235, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
}

.signup-terms {
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  margin-top: 1.5rem;
}

.signup-terms-button {
  background: none;
  border: none;
  color: rgb(2, 2, 2);
  transition: all 0.3s ease;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}

.signup-terms-button:hover {
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}
</style>