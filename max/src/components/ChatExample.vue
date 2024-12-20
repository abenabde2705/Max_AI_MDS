<template>
  <div class="chat-example">
    <div class="chat-window">
      <img
        class="chat-image"
        src="../assets/img/valeurs/JOUR_1.webp"
        alt="Exemple de chat"
      />
    </div>
  </div>
</template>

<style scoped>
.chat-example {
  flex: 1;
}

.chat-window {
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chat-image {
  width: 100%;
  max-width: 700px; /* Limite la taille maximale pour les grands écrans */
  margin: 0 auto; /* Centrage horizontal */
}

/* Responsive styles */
@media (max-width: 768px) {
  .chat-window {
    padding: 1rem; /* Réduction du padding pour les écrans moyens */
  }

  .chat-image {
    max-width: 250px; /* Réduction de la taille de l'image */
  }
}

@media (max-width: 480px) {
  .chat-window {
    padding: 0.5rem; /* Réduction supplémentaire du padding */
  }

  .chat-image {
    max-width: 400px; /* Réduction de l'image pour les très petits écrans */
  }
}
</style>
