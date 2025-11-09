import { createWebHistory, createRouter } from 'vue-router' ;
import LandingPage from './components/LandingPage.vue';
import ChatBot from './components/Chat.vue';

import AuthUser from './components/Authentication/AuthUser.vue'
import SuccessPage from './components/SuccessPage.vue';
import ConditionsUtilisation from './components/Politics/ConditionsUtilisation.vue'
import PolitiqueConfidentialites from './components/Politics/PolitiqueConfidentialite.vue'

//import NotFound from './components/NotFound.vue';


const routes = [
    { path: '/',name: 'LandingPage', component: LandingPage }, 
    { path: '/ChatBot',name: 'ChatBot',  component: ChatBot },
  
    { path: '/Auth', name: 'Auth', component: AuthUser },

    { path: '/SuccessPage', name: 'SuccessPage', component: SuccessPage },
    { path: '/Politics/ConditionsUtilisation', name: 'ConditionsUtilisation', component: ConditionsUtilisation },
    { path: '/Politics/PolitiqueConfidentialites', name: 'PolitiqueConfidentialites', component: PolitiqueConfidentialites },


  
    // Route pour la page principale
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('./components/NotFound.vue') // Créez ce composant
    }
    // Route pour les URL non définies
  ];
  
  

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;