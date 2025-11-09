<script setup>
import { ref } from 'vue';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'submitted']);

const firstName = ref('');
const lastName = ref('');
const age = ref('');
const email = ref('');
const testimonialText = ref('');
const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const closePopup = () => {
  emit('close');
  // Reset form state
  firstName.value = '';
  lastName.value = '';
  age.value = '';
  email.value = '';
  testimonialText.value = '';
  errorMessage.value = '';
  successMessage.value = '';
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const submitTestimonial = async () => {
  // Form validation
  if (!firstName.value.trim()) {
    errorMessage.value = 'Veuillez entrer votre prénom';
    return;
  }
  
  if (!lastName.value.trim()) {
    errorMessage.value = 'Veuillez entrer votre nom';
    return;
  }
  
  if (!age.value) {
    errorMessage.value = 'Veuillez entrer votre âge';
    return;
  }
  
  if (isNaN(Number(age.value)) || Number(age.value) <= 0) {
    errorMessage.value = 'Veuillez entrer un âge valide';
    return;
  }
  
  if (!email.value.trim()) {
    errorMessage.value = 'Veuillez entrer votre email';
    return;
  }
  
  if (!validateEmail(email.value)) {
    errorMessage.value = 'Veuillez entrer un email valide';
    return;
  }
  
  if (!testimonialText.value.trim()) {
    errorMessage.value = 'Veuillez entrer un témoignage';
    return;
  }

  try {
    isSubmitting.value = true;
    errorMessage.value = '';
    
    // Add to Firestore
    const testimonialsRef = collection(db, 'testimonials');
    await addDoc(testimonialsRef, {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      age: Number(age.value),
      email: email.value.trim(),
      text: testimonialText.value.trim(),
      createdAt: serverTimestamp(),
      approved: false // Add an approval flag for moderation
    });
    
    successMessage.value = 'Merci pour votre témoignage !';
    
    // Reset form fields
    firstName.value = '';
    lastName.value = '';
    age.value = '';
    email.value = '';
    testimonialText.value = '';
    
    // Close popup after 2 seconds
    setTimeout(() => {
      emit('submitted');
      closePopup();
    }, 2000);
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi du témoignage:', error);
    errorMessage.value = `Une erreur est survenue: ${error.message}`;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="popup-overlay" @click="closePopup">
    <div class="popup-content" @click.stop>
      <div class="popup-header">
        <h2>Partagez votre expérience</h2>
        <button class="close-button" @click="closePopup">×</button>
      </div>
      
      <div class="popup-body">
        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Prénom</label>
            <input
              id="firstName"
              v-model="firstName"
              type="text"
              placeholder="Votre prénom"
              :disabled="isSubmitting"
            />
          </div>
          
          <div class="form-group">
            <label for="lastName">Nom</label>
            <input
              id="lastName"
              v-model="lastName"
              type="text"
              placeholder="Votre nom"
              :disabled="isSubmitting"
            />
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="age">Âge</label>
            <input
              id="age"
              v-model="age"
              type="number"
              min="1"
              max="120"
              placeholder="Votre âge"
              :disabled="isSubmitting"
            />
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              placeholder="Votre email"
              :disabled="isSubmitting"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label for="testimonial">Votre témoignage</label>
          <textarea 
            id="testimonial" 
            v-model="testimonialText"
            placeholder="Partagez votre expérience avec MAX..."
            rows="4"
            :disabled="isSubmitting"
          ></textarea>
        </div>
        
        <div class="form-actions">
            <button 
            class="submit-button" 
            @click="submitTestimonial" 
            :disabled="isSubmitting || cooldown">
            {{ isSubmitting ? 'Envoi en cours...' : cooldown ? 'Envoyé !' : 'Envoyer' }}
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.popup-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: popup-appear 0.3s ease-out;
}

@keyframes popup-appear {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #1C5372;
  color: white;
}

.popup-header h2 {
  font-size: 1.25rem;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  transition: background-color 0.2s;
  border-radius: 50%;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.popup-body {
  padding: 20px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

input, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
}

textarea {
  resize: vertical;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #1C5372;
  box-shadow: 0 0 0 2px rgba(28, 83, 114, 0.2);
}

input:disabled, textarea:disabled {
  background-color: #f7f7f7;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-button {
  background-color: #1C5372;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover {
  background-color: #164259;
}

.submit-button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.error-message {
  padding: 10px;
  background-color: #fee2e2;
  color: #b91c1c;
  border-radius: 4px;
  margin-bottom: 16px;
}

.success-message {
  padding: 10px;
  background-color: #dcfce7;
  color: #166534;
  border-radius: 4px;
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
    gap: 16px;
  }
  
  .form-row .form-group {
    margin-bottom: 0;
  }
}
</style>