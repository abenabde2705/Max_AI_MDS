<template>
  <section class="discovery-section">
    <div class="content">
      <div class="illustration">
        <img src="../assets/img/valeurs/testi1.png" alt="">
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
  display: flex
;
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
.blob-shape {
  width: 300px;
  height: 300px;
  background: #90DBF5;
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
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
</style>