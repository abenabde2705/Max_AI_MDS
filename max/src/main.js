import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router'; // Vérifiez que le chemin est correct

// Montez l'application avec Vue Router
createApp(App).use(router).mount('#app');
