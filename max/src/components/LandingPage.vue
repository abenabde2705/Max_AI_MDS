<script setup>
import NavBar from './NavBar.vue'
import HeroSection from './HeroSection.vue'
import AboutSection from './AboutSection.vue'
import FeatureCards from './FeatureCards.vue'
import TestimonialsSection from './TestimonialsSection.vue'
import DiscoveryOffer from './DiscoveryOffer.vue'
import '../styles/gradients.css'
import Abonnement from './Abonnement.vue' 
import newsletter from './newsletter.vue'
import Footer from './footer.vue'
import Mail from './Mail.vue'


</script>

<template>  
  <div class="landing-page">
    <div class="gradient-bg">

      <NavBar  />
      <HeroSection id="hero" />
    </div>
    <AboutSection id="about"/>
    <FeatureCards id="fonc" />
    <TestimonialsSection id="tem" />
    <DiscoveryOffer id="desc"/>
    <Abonnement />
    <Mail id="news"/>
    <Footer />

    
  </div>
</template>

<style>
.landing-page {
  min-height: 100vh;
}

.gradient-bg {
  background: linear-gradient(104.32deg, #1C5372 0%, #90DBF5 57.67%, #FFD2C7 95.58%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}
</style>