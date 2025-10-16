import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuration du test
export const options = {
  stages: [
    { duration: '30s', target: 5 },   // Ramp up à 5 utilisateurs
    { duration: '1m', target: 5 },   // Maintenir 5 utilisateurs
    { duration: '30s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% des requêtes < 300ms
    http_req_failed: ['rate<0.01'],   // Moins de 1% d'erreurs
  },
};

const API_BASE = 'http://localhost:3000/api';

// Données de test avec timestamp pour éviter les doublons
const timestamp = Date.now();
const testUser = {
  email: `test-k6-${timestamp}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'K6',
  age: 25
};

let authToken = '';

export function setup() {
  console.log(`🔧 Setup: Creating test user ${testUser.email}`);
  
  // Créer un utilisateur de test au début
  const registerRes = http.post(`${API_BASE}/auth/register`, JSON.stringify(testUser), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (registerRes.status === 201) {
    console.log('✅ Test user created successfully');
  } else {
    console.error('❌ Failed to create test user:', registerRes.status, registerRes.body);
    return {};
  }
  
  // Se connecter pour obtenir le token
  const loginRes = http.post(`${API_BASE}/auth/login`, JSON.stringify({
    email: testUser.email,
    password: testUser.password
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (loginRes.status === 200) {
    const loginData = JSON.parse(loginRes.body);
    console.log('✅ Authentication successful');
    return { token: loginData.token };
  }
  
  console.error('❌ Setup failed - Login error:', loginRes.status, loginRes.body);
  return {};
}

export default function(data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`
  };
  
  // Test 1: Charger les conversations (route principale à tester)
  const conversationsRes = http.get(`${API_BASE}/conversations`, { headers });
  check(conversationsRes, {
    'conversations loaded': (r) => r.status === 200,
    'conversations response time < 300ms': (r) => r.timings.duration < 300,
  });
  
  sleep(1);
  
  // Test 2: Créer une conversation
  const newConvRes = http.post(`${API_BASE}/conversations`, '{}', { headers });
  check(newConvRes, {
    'conversation created': (r) => r.status === 201,
  });
  
  if (newConvRes.status === 201) {
    const conversation = JSON.parse(newConvRes.body);
    
    // Test 3: Envoyer un message (route critique à tester)
    const messageRes = http.post(`${API_BASE}/messages`, JSON.stringify({
      conversation_id: conversation.id,
      sender: 'user',
      content: 'Test message from k6 load test'
    }), { headers });
    
    check(messageRes, {
      'message sent': (r) => r.status === 201,
      'message response time < 200ms': (r) => r.timings.duration < 200,
    });
    
    // Test 4: Charger les messages (route secondaire à tester)
    if (messageRes.status === 201) {
      const messagesRes = http.get(`${API_BASE}/messages/${conversation.id}`, { headers });
      check(messagesRes, {
        'messages loaded': (r) => r.status === 200,
        'messages response time < 300ms': (r) => r.timings.duration < 300,
      });
    }
  }
  
  // Test 5: Vérifier la santé de l'API
  const healthRes = http.get(`${API_BASE}/health`);
  check(healthRes, {
    'health check OK': (r) => r.status === 200,
    'health response time < 100ms': (r) => r.timings.duration < 100,
  });
  
  sleep(2);
}

export function teardown(data) {
  // Nettoyer les données de test si nécessaire
  console.log('🧹 Test cleanup completed');
}