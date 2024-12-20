
<script>
import { ref } from 'vue'


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
    <h1>Restez informé de nos actualités</h1>
    <form @submit.prevent="submitForm" class="newsletter-form">
    <div class="form-row"> 
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
          required
        >
      </div>
      <button type="submit" class="submit-btn">S'inscrire à la newsletter</button>
    </div>

    </form>
  </div>
</template>


<style scoped>
.newsletter-section {
  background: #1C5372;
  padding: 4rem 2rem;
  color: white;
  text-align: center;
}

.newsletter-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.tagline {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.newsletter-form {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}


.form-row {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}


input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 25px;
  margin-bottom: 1rem;

  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  color: black;
}

input::placeholder {
  color: #666;
}

.submit-btn {
  background: #90DBF5;
  color: #1C5372;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
  font-weight: 600;
}

.submit-btn:hover:not(:disabled) {
  background: #7BC8E2;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.success-message {
  background: rgba(75, 181, 67, 0.2);
  color: #4BB543;
  padding: 1rem;
  border-radius: 10px;
  margin: 1rem 0;
}

.error-message {
  background: rgba(255, 0, 0, 0.2);
  color: #FF0000;
  padding: 1rem;
  border-radius: 10px;
  margin: 1rem 0;
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