import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from './components/LandingPage.vue';
import ChatBot from './components/Chat.vue';

const routes = [
  { path: '/landingpage', name: 'LandingPage', component: LandingPage }, 
  { path: '/', name: 'ChatBot', component: ChatBot }, 

  // Route pour la page principale
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('./components/NotFound.vue') // Créez ce composant
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
