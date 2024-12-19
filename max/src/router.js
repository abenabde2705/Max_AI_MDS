import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from './components/LandingPage.vue';
import Chat from './components/Chatpage.vue';

const routes = [
  { path: '/', name: 'LandingPage', component: LandingPage }, // Route pour la page principale
  { path: '/chat', name: 'Chat', component: Chat }, // Route pour la page du chat
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
