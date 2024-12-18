<script setup>
const testimonials = [
  {
    quote: "Max a changé la manière dont je gère mon anxiété. Je me sens enfin écouté.",
    author: "Sophie, 20 ans"
  },
  {
    quote: "Grâce à Max, je ne me sens plus seul dans les moments difficiles.",
    author: "Lucas, 28 ans"
  },
  {
    quote: "Avec Max, j'ai enfin trouvé une oreille attentive, sans jugement. Ça change tout.",
    author: "Emma, 18 ans"
  },
  {
    quote: "Max est toujours là, même quand personne d'autre ne peut l'être. C'est rassurant.",
    author: "Thomas, 23 ans"
  }
]
</script>

<template>
  <section class="testimonials-section">
    <h2>TÉMOIGNAGES UTILISATEURS</h2>
    <div class="testimonials-container">
      <div class="testimonials-list">
        <div v-for="testimonial in testimonials" :key="testimonial.author" class="testimonial">
          <p class="quote">"{{ testimonial.quote }}" - {{ testimonial.author }}</p>
        </div>
      </div>
      <div class="illustration">
        <!-- Placeholder for illustration -->
        <div class="blob-shape"></div>
      </div>
    </div>
    <button class="voir-plus-btn">Voir plus</button>
  </section>
</template>

<style scoped>
.testimonials-section {
  padding: 4rem 2rem;
  background: #F8E7E4;
}

h2 {
  text-align: center;
  color: #1C5372;
  font-size: 2rem;
  margin-bottom: 3rem;
}

.testimonials-container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  gap: 4rem;
}

.testimonials-list {
  flex: 1;
}

.testimonial {
  margin-bottom: 2rem;
}

.quote {
  color: #555;
  line-height: 1.6;
  font-style: italic;
}

.illustration {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.blob-shape {
  width: 300px;
  height: 200px;
  background: #FFB4A2;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
}

.voir-plus-btn {
  display: block;
  margin: 2rem auto 0;
  padding: 0.75rem 2rem;
  background: #8B4B5C;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.voir-plus-btn:hover {
  background: #723F4D;
}
</style>