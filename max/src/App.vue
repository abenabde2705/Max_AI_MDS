<script setup>
import BackToTop from './components/ScrollToTop.vue';

import { RouterView } from 'vue-router';
</script>

<template>
  
    <RouterView />
    <BackToTop />

</template>


<style>
body {
  margin: 0;
  padding: 0;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>