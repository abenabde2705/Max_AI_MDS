import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter, Trend, Gauge } from 'k6/metrics';

// Métriques personnalisées
export let errorRate = new Rate('errors');
export let requestCount = new Counter('requests');
export let responseTime = new Trend('response_time');
export let activeUsers = new Gauge('active_users');

// Configuration des tests de charge progressifs
export let options = {
  stages: [
    { duration: '2m', target: 10 },   // Montée progressive à 10 utilisateurs
    { duration: '2m', target: 10 },   // Maintien à 10 utilisateurs  
    { duration: '2m', target: 25 },   // Montée à 25 utilisateurs
    { duration: '2m', target: 25 },   // Maintien à 25 utilisateurs
    { duration: '3m', target: 50 },   // Montée à 50 utilisateurs
    { duration: '3m', target: 50 },   // Maintien à 50 utilisateurs
    { duration: '3m', target: 100 },  // Montée à 100 utilisateurs (test de stress)
    { duration: '2m', target: 100 },  // Maintien à 100 utilisateurs
    { duration: '2m', target: 0 },    // Descente progressive
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% des requêtes sous 500ms
    http_req_failed: ['rate<0.02'],   // Moins de 2% d'erreurs
    errors: ['rate<0.02'],
    response_time: ['p(90)<200', 'p(95)<300', 'p(99)<500'],
  },
};

const BASE_URL = 'http://localhost:3000';

// Pool d'utilisateurs de test pour éviter les conflits
let userPool = [];
let currentUserIndex = 0;

export function setup() {
  console.log('🚀 Initialisation des tests de charge progressifs');
  console.log('📊 Scénario: Montée de 0 à 100 utilisateurs sur 21 minutes');
  
  // Créer un pool d'utilisateurs de test
  for (let i = 0; i < 200; i++) {
    userPool.push({
      email: `loadtest${i}@performance.com`,
      password: `password${i}`,
      token: null,
      userId: null,
      conversations: []
    });
  }
  
  return { userPool };
}

export default function(data) {
  activeUsers.add(1);
  
  // Sélectionner un utilisateur unique pour cette VU
  const user = data.userPool[currentUserIndex % data.userPool.length];
  currentUserIndex++;
  
  // Authentification si nécessaire
  if (!user.token) {
    authenticateUser(user);
  }
  
  // Simulation d'activité réaliste
  const scenario = Math.random();
  
  if (scenario < 0.4) {
    // 40% - Consultation des conversations existantes
    loadConversations(user);
  } else if (scenario < 0.7) {
    // 30% - Envoi de nouveaux messages
    sendMessage(user);
  } else if (scenario < 0.9) {
    // 20% - Création nouvelle conversation
    createConversation(user);
  } else {
    // 10% - Check de santé système
    healthCheck();
  }
  
  // Pause réaliste entre actions
  sleep(Math.random() * 3 + 1); // 1-4 secondes
}

function authenticateUser(user) {
  requestCount.add(1);
  
  // Inscription
  let registerResponse = http.post(`${BASE_URL}/register`, {
    email: user.email,
    password: user.password
  });
  
  let registerSuccess = check(registerResponse, {
    'registration successful or user exists': (r) => r.status === 201 || r.status === 409,
    'registration response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  if (!registerSuccess) {
    errorRate.add(1);
  }
  
  // Connexion
  let loginResponse = http.post(`${BASE_URL}/login`, {
    email: user.email,
    password: user.password
  });
  
  let loginSuccess = check(loginResponse, {
    'login successful': (r) => r.status === 200,
    'login response time < 500ms': (r) => r.timings.duration < 500,
    'token received': (r) => {
      try {
        return JSON.parse(r.body).token !== undefined;
      } catch {
        return false;
      }
    }
  });
  
  responseTime.add(loginResponse.timings.duration);
  
  if (loginSuccess && loginResponse.status === 200) {
    try {
      const loginData = JSON.parse(loginResponse.body);
      user.token = loginData.token;
      user.userId = loginData.user.id;
    } catch (e) {
      errorRate.add(1);
      console.error('Failed to parse login response:', e);
    }
  } else {
    errorRate.add(1);
  }
}

function loadConversations(user) {
  if (!user.token) return;
  
  requestCount.add(1);
  
  const headers = { 
    'Authorization': `Bearer ${user.token}`,
    'Content-Type': 'application/json'
  };
  
  let response = http.get(`${BASE_URL}/conversations`, { headers });
  
  let success = check(response, {
    'conversations loaded': (r) => r.status === 200,
    'conversations response time < 300ms': (r) => r.timings.duration < 300,
    'valid JSON response': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    }
  });
  
  responseTime.add(response.timings.duration);
  
  if (success && response.status === 200) {
    try {
      const conversations = JSON.parse(response.body);
      user.conversations = conversations.slice(0, 3); // Garder les 3 plus récentes
    } catch (e) {
      errorRate.add(1);
    }
  } else {
    errorRate.add(1);
  }
}

function createConversation(user) {
  if (!user.token) return;
  
  requestCount.add(1);
  
  const headers = { 
    'Authorization': `Bearer ${user.token}`,
    'Content-Type': 'application/json'
  };
  
  const messages = [
    "Bonjour, j'ai besoin d'aide pour gérer mon stress.",
    "Comment améliorer ma confiance en moi ?",
    "Je ressens de l'anxiété, que faire ?",
    "Pouvez-vous m'aider avec mes problèmes de sommeil ?",
    "Comment gérer les relations difficiles au travail ?",
  ];
  
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  let response = http.post(`${BASE_URL}/conversations`, JSON.stringify({
    message: message
  }), { headers });
  
  let success = check(response, {
    'conversation created': (r) => r.status === 201,
    'conversation creation time < 800ms': (r) => r.timings.duration < 800,
    'conversation ID returned': (r) => {
      try {
        return JSON.parse(r.body).id !== undefined;
      } catch {
        return false;
      }
    }
  });
  
  responseTime.add(response.timings.duration);
  
  if (success && response.status === 201) {
    try {
      const newConv = JSON.parse(response.body);
      user.conversations.push(newConv);
    } catch (e) {
      errorRate.add(1);
    }
  } else {
    errorRate.add(1);
  }
}

function sendMessage(user) {
  if (!user.token || user.conversations.length === 0) {
    createConversation(user);
    return;
  }
  
  requestCount.add(1);
  
  const headers = { 
    'Authorization': `Bearer ${user.token}`,
    'Content-Type': 'application/json'
  };
  
  const conversation = user.conversations[Math.floor(Math.random() * user.conversations.length)];
  
  const followUpMessages = [
    "Merci pour votre aide, pouvez-vous m'en dire plus ?",
    "J'aimerais approfondir ce sujet.",
    "Comment puis-je appliquer ces conseils au quotidien ?",
    "Avez-vous d'autres suggestions ?",
    "Cela m'aide beaucoup, continuons.",
  ];
  
  const message = followUpMessages[Math.floor(Math.random() * followUpMessages.length)];
  
  let response = http.post(`${BASE_URL}/conversations/${conversation.id}/messages`, JSON.stringify({
    message: message
  }), { headers });
  
  let success = check(response, {
    'message sent': (r) => r.status === 201,
    'message response time < 600ms': (r) => r.timings.duration < 600,
    'message content returned': (r) => {
      try {
        return JSON.parse(r.body).content !== undefined;
      } catch {
        return false;
      }
    }
  });
  
  responseTime.add(response.timings.duration);
  
  if (!success) {
    errorRate.add(1);
  }
}

function healthCheck() {
  requestCount.add(1);
  
  let response = http.get(`${BASE_URL}/api/health`);
  
  let success = check(response, {
    'health check OK': (r) => r.status === 200,
    'health response time < 100ms': (r) => r.timings.duration < 100,
  });
  
  responseTime.add(response.timings.duration);
  
  if (!success) {
    errorRate.add(1);
  }
}

export function teardown(data) {
  console.log('🏁 Tests de charge terminés');
  console.log('📊 Consultez Grafana pour l\'analyse détaillée des performances');
}