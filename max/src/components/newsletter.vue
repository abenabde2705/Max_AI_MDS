<script setup>
import { ref } from 'vue'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig'

const email = ref('')
const isSubscribed = ref(false)

const handleSubmit = async () => {
  if (email.value) {
    try {
      const newsletterRef = collection(db, 'newsletter')
      const docRef = await addDoc(newsletterRef, {
        email: email.value,
        dateInscription: new Date()
      })
      console.log("Document written with ID: ", docRef.id) // Pour debug
      alert('Inscription réussie !')
      isSubscribed.value = true
      email.value = ''
      setTimeout(() => {
        isSubscribed.value = false
      }, 3000)
    } catch (error) {
      console.error("Erreur détaillée:", error.message) // Pour avoir plus de détails sur l'erreur
      alert("Une erreur est survenue lors de l'inscription")
    }
  }
}
</script>

<template>
  <div class="newsletter-container">
    <h2 class="newsletter-title">Abonne-toi et suis l'évolution de Max</h2>
    <p class="newsletter-description">
      Faites partie de l'histoire et
      abonnez-vous à la newsletter pour des nouvelles et des mises à jour
      sur nos ateliers
    </p>
    <form @submit.prevent="handleSubmit" class="newsletter-form">
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        required
        class="newsletter-input"
      />
      <button type="submit" class="newsletter-button">S'ABONNER</button>
    </form>
    <div v-if="isSubscribed" class="success-message">
      Merci pour votre inscription!
    </div>
  </div>
</template>

<style scoped>
.newsletter-container {
  max-width: 60%;
  margin: 0 auto;
    text-align: center;
  font-family: Arial, sans-serif;
}

.newsletter-title {
  color: #24219c;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
}

.newsletter-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
}

.twitter-link {
  color: #24219c;
  text-decoration: none;
}

.newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.newsletter-input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.newsletter-button {
  background-color: #24219c;
  color: white;
  border: none;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.newsletter-button:hover {
  background-color: #1d1a7a;
}

.success-message {
  color: #28a745;
  margin-top: 10px;
}
</style>