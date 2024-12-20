<template>
  <section class="discovery-section">
    <div class="content">
      <div class="illustration">
        <img src="../assets/img/valeurs/testi1.png" alt="Illustration découverte">
      </div>
      <div class="offer-content">
        <h2>OFFRE DÉCOUVERTE</h2>
        <p>
          Découvrez Max, votre compagnon d'écoute intelligent. Profitez d'un essai gratuit pour explorer ses fonctionnalités : écoute bienveillante, conseils personnalisés et interaction adaptée à votre style. Testez-le dès maintenant pour voir comment il peut vous aider au quotidien.
        </p>
        <button class="discover-btn">Découvrir Max</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.discovery-section {
  padding: 4rem 2rem;
  background: #EDE4DC;
}

.content {
  display: flex;
  max-width: 1290px;
  margin: 0 auto;
  gap: 4rem;
  align-items: center;
}

.illustration {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.illustration img {
  height: auto;
  width: 700px;
}

.offer-content {
  margin-bottom: 114px;
  flex: 1;
}

h2 {
  color: #82575E;
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

p {
  color: #555;
  line-height: 1.6;
  font-size: 17px;
  margin-bottom: 2rem;
}

.discover-btn {
  padding: 1rem 2rem;
  background: #82575E;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: font-size 0.3s;
}

.discover-btn:hover {
  font-size: 1.1rem;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .content {
    flex-direction: column;
    gap: 2rem;
  }

  .illustration img {
    width: 100%; /* L'image prend toute la largeur disponible */
    max-width: 400px; /* Taille maximale pour les écrans moyens */
  }

  .offer-content {
    text-align: center;
    margin-bottom: 0; /* Supprime la marge excessive sur les petits écrans */
  }

  h2 {
    font-size: 1.8rem; /* Réduction légère du titre */
  }

  p {
    font-size: 16px; /* Légère réduction de la taille du texte */
  }
}

@media (max-width: 480px) {
  .discovery-section {
    padding: 2rem 1rem;
  }

  .illustration img {
    max-width: 300px; /* Réduction supplémentaire de l'image */
  }

  h2 {
    font-size: 1.5rem; /* Réduction pour les très petits écrans */
  }

  p {
    font-size: 15px; /* Réduction supplémentaire du texte */
  }

  .discover-btn {
    font-size: 0.9rem; /* Réduction de la taille du bouton */
    padding: 0.8rem 1.5rem;
  }
}
</style>
