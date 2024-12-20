import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from './components/LandingPage.vue';
import ChatBot from './components/Chat.vue';
import SignUp from './components/SignUp.vue';
import LogIn from './components/LogIn.vue';
import SuccessPage from './components/SuccessPage.vue';
const routes = [
  { path: '/landingpage', name: 'LandingPage', component: LandingPage }, 
  { path: '/', name: 'ChatBot', component: ChatBot }, 
  { path: '/SignUp', name: 'Signup', component: SignUp }, 
  { path: '/LogIn', name: 'LogIn', component: LogIn },
  { path: '/SuccessPage', name: 'SuccessPage', component: SuccessPage },

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
