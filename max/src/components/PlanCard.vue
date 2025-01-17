<template>
    <div class="plan-card" :class="{ highlight }">
    <ul class="plan-maininfo"> 
      <h2 class="plan-title">{{ title }}</h2>
      <p class="plan-price">{{ price }}</p>
      <p class="plan-description">{{ description }}</p>
    </ul>
      <ul class="plan-features">
        <li v-for="(feature, index) in features" :key="index">
        <span class="tick-icon">✓</span> {{ feature }}
      </li>      </ul>
      <button class="plan-button" :class="buttonStyle">{{ buttonText }}</button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      title: String,
      price: String,
      description: String,
      features: Array,
      buttonText: String,
      buttonStyle: {
        type: String,
        default: "primary",
      },
      highlight: {
        type: Boolean,
        default: false,
      },
    },
  };
  </script>
  
  <style scoped>
  .plan-card {
    background: #fff;
    border-radius: 10px;
    padding: 20px;
    width: 300px; /* Largeur fixe pour toutes les cartes */
    min-height: 500px; /* Hauteur minimale pour uniformiser la taille */
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s;
    text-align: center;
  }
  .plan-maininfo{
    margin-bottom: 20px;
  }
  .plan-card.highlight {
    background: #1C5372;
color: #fff;  }
    .plan-card.highlight p  {
        color: #fff !important;  }
        .plan-card.highlight li  {
            color: #fff !important; 
            margin-bottom: 1.3rem;
           }
  
  .plan-card:hover {
    transform: scale(1.05);
  }
  .tick-icon{
    color: #00970d;
    font-size: 1.2rem;
    font-weight: 800;
  }
  
  .plan-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .plan-price {
  font-size: 1.5rem;
  color: #000000;
  text-align: center;
  margin: 20px 0; 
  
  display: flex;
  align-items: center; /* Centre verticalement */
  justify-content: center; /* Centre horizontalement */
}
  
  .plan-description {
    font-size: 1rem;
    color: #555;
    margin-bottom: 20px;
  }
  
  .plan-features {
    list-style: none;
    padding: 0;
    margin-bottom: 20px;
  }
  
  .plan-features li {
    font-size: 0.9rem;
    color: #555;
    margin-bottom: 8px;
  }
  
  .plan-button {
    display: block;
    width: 100%;
    padding: 10px;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: auto;
  }
  
  .plan-button.primary {
    background-color: #007bff;
    color: white;
  }
  
  .plan-button.primary:hover {
    background-color: #0056b3;
  }
  
  .plan-button.secondary {
    background-color: white;
    transition: all ease-in-out  0.3s;

    color: #007bff;
    border: 1px solid #007bff;
  }
  
  .plan-button.secondary:hover {
    background-color: #007bff;
    color: white;
  }
  </style>
  