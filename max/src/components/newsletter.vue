<template>
    <div class="newsletter-container">
      <div class="newsletter-box">
        <h1 class="newsletter-title">Abonnez-vous à notre Newsletter</h1>
      
        <form @submit.prevent="subscribe" class="newsletter-form">
       
          <button @click="showPopup = true"  class="newsletter-button">S'abonner</button>
        </form>
        <p v-if="message" class="newsletter-message">{{ message }}</p>
      </div>
      <!-- Popup -->
      <Mail v-if="showPopup" @close="showPopup = false">
      <template #title>
        <h2>Abonnement Réussi !</h2>
      </template>
      <template #content>
        <p>Merci pour votre abonnement. Vous recevrez nos dernières nouvelles bientôt !</p>
      </template>
    </Mail>
    </div>
  </template>
  
  <script>
  import Mail from "./Mail.vue";

  export default {
    data() {
      return {
        email: "",
        message: "",
        showPopup: false, // Contrôle de la visibilité du popup

      };
    },
    methods: {
      subscribe() {
        if (this.validateEmail(this.email)) {
          this.message = "Merci pour votre abonnement ! Vous recevrez bientôt nos nouvelles.";
          this.email = ""; // Réinitialiser le champ email
        } else {
          this.message = "Veuillez entrer une adresse e-mail valide.";
        }
      },
      validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      },
    },
  };
  </script>
  
  <style scoped>
  .newsletter-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    /*background-color: #1C5372;*/
    padding: 20px;
  }
  
  .newsletter-box {
    background-color: #ffffff;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 400px;
    width: 100%;
  }
  
  .newsletter-title {
    font-size: 24px;
    font-weight: bold;
    color: #333333;
    margin-bottom: 10px;
  }
  
  .newsletter-hook {
    font-size: 18px;
    font-weight: bold;
    color: #0056b3;
    margin-bottom: 15px;
  }
  
  .newsletter-description {
    font-size: 16px;
    color: #666666;
    margin-bottom: 20px;
  }
  
  .newsletter-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .newsletter-input {
    padding: 10px;
    font-size: 16px;
    border: 1px solid #cccccc;
    border-radius: 5px;
  }
  
  .newsletter-button {
    background-color: #007bff;
    color: #ffffff;
    padding: 10px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .newsletter-button:hover {
    background-color: #0056b3;
  }
  
  .newsletter-message {
    margin-top: 10px;
    font-size: 14px;
    color: #007bff;
  }
  .popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-box {
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.close-button {
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

.close-button:hover {
  background-color: #0056b3;
}
  </style>
  