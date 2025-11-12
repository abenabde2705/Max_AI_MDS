<template>
  <div class="feedback-overlay" v-if="isOpen" @click="closeModal">
    <div class="feedback-modal" @click.stop>
      <div class="feedback-header">
        <h2>📬 Envoyer un Feedback</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <form @submit.prevent="submitFeedback" class="feedback-form">
        <div class="form-group">
          <label for="title">Titre du feedback *</label>
          <input
            type="text"
            id="title"
            v-model="form.title"
            placeholder="Décrivez brièvement le problème ou suggestion"
            required
            :disabled="isSubmitting"
          />
        </div>

        <div class="form-group">
          <label for="description">Description détaillée *</label>
          <textarea
            id="description"
            v-model="form.description"
            placeholder="Expliquez en détail votre feedback..."
            required
            :disabled="isSubmitting"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="type">Type de feedback</label>
            <select id="type" v-model="form.type" required :disabled="isSubmitting">
              <option value="bug">🐛 Bug / Problème</option>
              <option value="feature">✨ Nouvelle fonctionnalité</option>
              <option value="improvement">🔧 Amélioration</option>
              <option value="ui_ux">🎨 Interface utilisateur</option>
              <option value="performance">⚡ Performance</option>
              <option value="other">📝 Autre</option>
            </select>
          </div>

          <div class="form-group">
            <label for="severity">Niveau d'importance</label>
            <select id="severity" v-model="form.severity" required :disabled="isSubmitting">
              <option value="low">🟢 Faible</option>
              <option value="medium">🟡 Moyenne</option>
              <option value="high">🟠 Élevée</option>
              <option value="critical">🔴 Critique</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label for="userEmail">Votre email (optionnel)</label>
          <input
            type="email"
            id="userEmail"
            v-model="form.userEmail"
            placeholder="pour@suivre-votre-feedback.com"
            :disabled="isSubmitting"
          />
        </div>

        <div class="feedback-actions">
          <button type="button" @click="closeModal" class="btn-cancel" :disabled="isSubmitting">
            Annuler
          </button>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            <span v-if="!isSubmitting">📤 Envoyer</span>
            <span v-else>⏳ Envoi...</span>
          </button>
        </div>
      </form>

      <div v-if="submitStatus" class="status-message" :class="submitStatus.type">
        <h3>{{ submitStatus.title }}</h3>
        <p>{{ submitStatus.message }}</p>
        <div v-if="submitStatus.details" class="status-details">
          <small>{{ submitStatus.details }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'submitted'])

// État du formulaire
const form = reactive({
  title: '',
  description: '',
  type: 'improvement',
  severity: 'medium',
  userEmail: ''
})

const isSubmitting = ref(false)
const submitStatus = ref(null)

// Méthodes
const closeModal = () => {
  if (!isSubmitting.value) {
    resetForm()
    emit('close')
  }
}

const resetForm = () => {
  Object.assign(form, {
    title: '',
    description: '',
    type: 'improvement',
    severity: 'medium',
    userEmail: ''
  })
  submitStatus.value = null
}

const submitFeedback = async () => {
  isSubmitting.value = true
  submitStatus.value = null

  try {
    // Récupérer le token JWT du localStorage
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('Vous devez être connecté pour envoyer un feedback')
    }

    const response = await axios.post('http://localhost:3000/api/feedback', {
      title: form.title,
      description: form.description,
      type: form.type,
      severity: form.severity,
      userEmail: form.userEmail
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    // Succès
    submitStatus.value = {
      type: 'success',
      title: '✅ Feedback envoyé !',
      message: 'Votre feedback a été transmis avec succès.',
      details: `ID: ${response.data.feedbackId}`
    }

    // Émettre l'événement de soumission
    emit('submitted', response.data)

    // Réinitialiser le formulaire après 2 secondes
    setTimeout(() => {
      resetForm()
      closeModal()
    }, 3000)

  } catch (error) {
    console.error('Erreur lors de l\'envoi du feedback:', error)
    
    let errorMessage = 'Une erreur est survenue'
    
    if (error.response) {
      errorMessage = error.response.data?.error || error.response.data?.message || errorMessage
    } else if (error.message) {
      errorMessage = error.message
    }

    submitStatus.value = {
      type: 'error',
      title: '❌ Erreur d\'envoi',
      message: errorMessage,
      details: 'Veuillez réessayer ou contacter le support'
    }
  } finally {
    isSubmitting.value = false
  }
}

// Test de connectivité au backend
const testConnection = async () => {
  try {
    await axios.get('http://localhost:3000/api/feedback/test')
    console.log('✅ Connexion au système de feedback OK')
  } catch (error) {
    console.warn('⚠️ Système de feedback non accessible:', error.message)
  }
}

// Test au chargement du composant
testConnection()
</script>

<style scoped>
.feedback-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.feedback-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e1e5e9;
}

.feedback-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f1f3f4;
}

.feedback-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 600;
}

input, select, textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input:disabled, select:disabled, textarea:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

textarea {
  height: 100px;
  resize: vertical;
}

.feedback-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e1e5e9;
}

.btn-cancel, .btn-submit {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f8f9fa;
  color: #495057;
}

.btn-cancel:hover:not(:disabled) {
  background: #e9ecef;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-submit:disabled, .btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.status-message {
  margin-top: 20px;
  padding: 16px;
  border-radius: 8px;
  animation: slideIn 0.3s ease-out;
}

.status-message.success {
  background: #d1eddb;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.status-message h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
}

.status-message p {
  margin: 0 0 8px 0;
}

.status-details small {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .feedback-modal {
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .feedback-actions {
    flex-direction: column;
  }
}
</style>