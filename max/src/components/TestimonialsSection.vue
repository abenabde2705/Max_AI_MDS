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
          <p class="quote">"{{ testimonial.quote }}" - <span class="author">{{ testimonial.author }}</span></p>
          
        </div>
        <button class="voir-plus-btn">Voir plus</button>
      </div>
      <div class="illustration">
        <img src="../assets/img/valeurs/testi3.png" alt="">
        <!-- Placeholder for illustration -->
       
      </div>
      
    </div>
    
  </section>
</template>

<style scoped>
.testimonials-section {
  padding: 4rem 2rem;
  background: #EDE4DC;
}

h2 {
  margin-left: 70px;
    text-align: left;
    color: #82575E;
    font-size: 2rem;
    margin-bottom: 3rem;
}

.testimonials-container {
  display: flex;
  max-width: 1290px;
    margin: 0 auto;
  margin-left: 75px;
  gap: 4rem;
}
.testimonial .author {
  font-family: Articulat CF;
  font-weight: 600;
}

.testimonials-list {
  font-size: 1.2rem;
  flex: 1;
}

.testimonial {
  margin-bottom: 2rem;
}

.quote {
  color: #555;
  line-height: 1.6;
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
  height: 200px;
  background: #FFB4A2;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
}

.voir-plus-btn {
  display: block;
  padding: 0.75rem 2rem;
  background: #82575E;
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