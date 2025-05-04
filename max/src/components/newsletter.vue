<template>
  <div class="newsletter-container" id="news">
    <div class="newsletter-content">
      <div class="newsletter-left">
        <h2 class="newsletter-title">Max Newsletter</h2>
      </div>
      
      <div class="newsletter-right">
        <p class="newsletter-description">
          Faites partie de l'histoire et
          abonnez-vous à la newsletter pour des nouvelles et des mises à jour
          sur nos ateliers
        </p>
        
        <form @submit.prevent="handleSubmit" class="newsletter-form">
          <input 
            type="email" 
            v-model="email" 
            placeholder="max@mds.fr" 
            class="newsletter-input"
            aria-label="Email address"
            :disabled="isSubmitting"
            required
          />
          
          <button type="submit" class="newsletter-button" :disabled="!isValidEmail || isSubmitting">
            <span class="arrow-icon">→</span>
            {{ isSubmitting ? 'ENVOI...' : 'S\'ABONNER' }}
          </button>
        </form>
    
        <div v-if="isSubscribed" class="success-message">
          Merci pour votre inscription!
        </div>
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <p class="privacy-notice">
          Nous prenons soin de vos données dans notre 
          <a href="#" class="privacy-link">politique de confidentialité</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebaseConfig'

const email = ref('')
const isSubscribed = ref(false)
const errorMessage = ref('')
const isSubmitting = ref(false)

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})

const handleSubmit = async () => {
  if (!isValidEmail.value) {
    errorMessage.value = 'Veuillez entrer une adresse email valide';
    return;
  }

  try {
    isSubmitting.value = true;
    errorMessage.value = '';

    // Ajouter à Firestore
    const newsletterRef = collection(db, 'newsletter');
    await addDoc(newsletterRef, {
      email: email.value.trim(),
      dateInscription: serverTimestamp(),
    });

    console.log('Email ajouté avec succès à la newsletter');
    isSubscribed.value = true;
    email.value = '';

    // Réinitialiser le message de succès après 3 secondes
    setTimeout(() => {
      isSubscribed.value = false;
    }, 3000);
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    errorMessage.value = `Erreur: ${error.message}`;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.newsletter-container {
  background-color: #1e213a;
  border-radius: 16px;
  padding: 48px;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  margin-bottom: 5rem;
}

/* Reste des styles inchangés... */

.success-message {
  color: #4ade80;
  background-color: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.2);
  padding: 10px;
  border-radius: 8px;
  margin-top: 16px;
  text-align: center;
  font-weight: 500;
}

.error-message {
  color: #f87171;
  background-color: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.2);
  padding: 10px;
  border-radius: 8px;
  margin-top: 16px;
  text-align: center;
  font-weight: 500;
}
.newsletter-container {
  background-color: #1e213a;
  border-radius: 16px;
  padding: 48px;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  margin-bottom: 5rem;
}

.newsletter-content {
  display: flex;
  flex-direction: row;
  gap: 48px;
}

.newsletter-left {
  flex: 1;
}

.newsletter-right {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.newsletter-title {
  font-size: 42px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}

.newsletter-description {
  font-size: 18px;
  line-height: 1.6;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.newsletter-form {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.newsletter-input {
  flex: 1;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: white;
  font-size: 16px;
  color: #333;
  outline: none;
  transition: border-color 0.2s ease;
}

.newsletter-input:focus {
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.newsletter-input::placeholder {
  color: #999;
}

.newsletter-button {
  background: linear-gradient(45deg, #12c2e9, #c471ed, #f7797d);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.newsletter-button:hover {
  transition: all ease 0.8s;
  background-position: 100% 50%;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(196, 113, 237, 0.4);
}

.newsletter-button:disabled {
  background: #999;
  cursor: not-allowed;
}.newsletter-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(196, 113, 237, 0.3);
}

.arrow-icon {
  font-size: 20px;
  margin-left: 4px;
}

.privacy-notice {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 8px 0 0 0;
}

.privacy-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: underline;
  transition: color 0.2s ease;
}

.privacy-link:hover {
  color: white;
}

/* Responsive design */
@media (max-width: 900px) {
  .newsletter-content {
    flex-direction: column;
    gap: 24px;
  }
  
  .newsletter-container {
    padding: 32px;
  }
  
  .newsletter-title {
    font-size: 32px;
  }
}

@media (max-width: 600px) {
  .newsletter-form {
    flex-direction: column;
  }
  
  .newsletter-button {
    width: 100%;
    justify-content: center;
  }
  
  .newsletter-container {
    padding: 24px;
    border-radius: 12px;
  }
}
</style>