<template>
  <section class="discovery-section">
    <div class="content">
      <div class="illustration">
        <!-- Placeholder for illustration -->
        <div class="blob-shape"></div>
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
  background: #F8E7E4;
}

.content {
  display: flex;
  max-width: 1200px;
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

.blob-shape {
  width: 300px;
  height: 300px;
  background: #90DBF5;
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
}

.offer-content {
  flex: 1;
}

h2 {
  color: #1C5372;
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.discover-btn {
  padding: 1rem 2rem;
  background: #1C5372;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.discover-btn:hover {
  background: #164259;
}
</style>