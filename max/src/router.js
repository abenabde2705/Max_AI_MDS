import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from './components/LandingPage.vue';

const routes = [
  { path: '/landingpage', name: 'LandingPage', component: LandingPage }, 
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
