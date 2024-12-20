import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from './components/LandingPage.vue';
import ChatBot from './components/Chat.vue';
import SignUp from './components/SignUp.vue';

const routes = [
  { path: '/landingpage', name: 'LandingPage', component: LandingPage }, 
  { path: '/', name: 'ChatBot', component: ChatBot }, 
  { path: '/SignUp', name: 'Signup', component: SignUp }, 

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
