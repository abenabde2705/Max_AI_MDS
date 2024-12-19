
<script>
import { ref } from 'vue'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig'

export default {
  name: 'NewsletterForm',
  setup() {
  

    const formData = ref({
      prenom: '',
      nom: '',
      age: '',
      email: '',
      telephone: ''
    })

    const submitForm = async () => {
  try {
    const newsletterRef = collection(db, 'newsletter')
    const docRef = await addDoc(newsletterRef, {
      ...formData.value,
      dateInscription: new Date()
    })
    console.log("Document written with ID: ", docRef.id) // Pour debug
    alert('Inscription réussie !')
    // ... reste du code
  } catch (error) {
    console.error("Erreur détaillée:", error.message) // Pour avoir plus de détails sur l'erreur
    alert("Une erreur est survenue lors de l'inscription")
  }
}

    return {
      formData,
      submitForm
    }
  }
}
</script>
<template>
  <div class="newsletter-section">
    <h3>Restez informé de nos actualités</h3>
    <form @submit.prevent="submitForm" class="newsletter-form">
      <div class="form-group">
        <input 
          v-model="formData.prenom" 
          type="text" 
          placeholder="Prénom"
          required
        >
        <input 
          v-model="formData.nom" 
          type="text" 
          placeholder="Nom"
          required
        >
      </div>
      <div class="form-group">
        <input 
          v-model="formData.age" 
          type="number" 
          placeholder="Âge"
          required
          min="13"
        >
        <input 
          v-model="formData.email" 
          type="email" 
          placeholder="Email"
          required
        >
      </div>
      <div class="form-group">
        <input 
          v-model="formData.telephone" 
          type="tel" 
          placeholder="Numéro de téléphone"
          pattern="[0-9]{10}"
          required
        >
      </div>
      <button type="submit" class="submit-btn">S'inscrire à la newsletter</button>
    </form>
  </div>
</template>


<style scoped>
.newsletter-section {
  margin-top: 4rem;
  padding: 2rem;
  background-color: #f5f5f5;
  border-radius: 10px;
}

h3 {
  color: #1C5372;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.newsletter-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

input {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #1C5372;
}

.submit-btn {
  background-color: #1C5372;
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #164259;
}

@media (max-width: 768px) {
  .form-group {
    flex-direction: column;
  }
}
</style>