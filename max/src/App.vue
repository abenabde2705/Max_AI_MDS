<script setup>

import LandingPage from './components/LandingPage.vue'
import Footer from './components/Footer.vue'
import { RouterView } from 'vue-router';
</script>

<template>
  <RouterView />
 

</template>

<style>
body {
  margin: 0;
  padding: 0;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>