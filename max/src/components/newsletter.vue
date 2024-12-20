<template>
    <div class="newsletter-container">
      <div class="newsletter-box">
        <h1 class="newsletter-title">Abonnez-vous à notre Newsletter</h1>
        <p class="newsletter-hook">
          Ne manquez rien ! Recevez nos dernières actualités et offres exclusives directement dans votre boîte mail.
        </p>
        <p class="newsletter-description">
          Entrez votre adresse e-mail pour rester connecté(e) avec nous.
        </p>
        <form @submit.prevent="subscribe" class="newsletter-form">
          <input
            type="email"
            v-model="email"
            placeholder="Entrez votre e-mail"
            class="newsletter-input"
            required
          />
          <button type="submit" class="newsletter-button">S'abonner</button>
        </form>
        <p v-if="message" class="newsletter-message">{{ message }}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        email: "",
        message: "",
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
    background-color: #f9f9f9;
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
  </style>
  