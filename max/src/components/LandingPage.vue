<script setup>
import NavBar from '../layout/NavBar.vue'
import HeroSection from './HeroSection.vue'
import AboutSection from './AboutSection.vue'
import FeatureCards from './FeatureCards.vue'
import TestimonialsSection from './TestimonialsSection.vue'
import DiscoveryOffer from './DiscoveryOffer.vue'
import '../styles/gradients.css'
import Abonnement from './Abonnement.vue' 
import newsletter from './newsletter.vue'
import Footer from '../layout/Footer.vue'
import Mail from './Mail.vue'


</script>

<template>  
  <div class="landing-page">
    <div class="gradient-bg">
      <NavBar class="component-margin" />
      <HeroSection id="hero" class="component-margin" />
    </div>
    <div class="gradient-bg2">
      <AboutSection id="about" class="component-margin" />
      <FeatureCards id="fonc" class="component-margin" />
    </div>
    <div class="gradient-bg3">
      <TestimonialsSection id="tem" class="component-margin" />
      <DiscoveryOffer id="desc" class="component-margin" />
      <Abonnement class="component-margin" />
      <newsletter class="component-margin last-component" />

    </div>
    <div class="footer-container">
      <Footer />
    </div>
  </div>
</template>

<style>
.landing-page {
  min-height: 150vh;
}
.component-margin {
  margin-bottom: 5rem; 
}
.last-component{  padding-bottom: 8rem;
}
.gradient-bg {
  background: linear-gradient(104.32deg, #1C5372 0%, #90DBF5 57.67%, #FFD2C7 95.58%);

  min-height: 100vh;
  position: relative;
  overflow: hidden;
}
.gradient-bg2 {
  background:  linear-gradient(104.32deg, #a6dae7 0%, #E8F0F2 57.67%, #FFF0F0 95.58%);
  min-height: 100vh;

  position: relative;
  overflow: hidden;
}
.gradient-bg3 {
  background: linear-gradient(104.32deg, #a6dae7 0%, #E8F0F2 57.67%, #FFF0F0 95.58%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

</style>