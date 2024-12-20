<script setup>
import { ref, nextTick } from 'vue'
import { 
  Home as HomeIcon,
  User as UserIcon, 
  BookOpen as BookOpenIcon, 
  Settings as SettingsIcon, 
  Send as SendIcon 
} from 'lucide-vue-next'

// Scénario prédéfini
const chatScenario = {
  questions: [
    "Je me sens dépassé en ce moment.",
    "C'est surtout au travail, trop de responsabilités.",
    "Non, je ne sais pas comment aborder le sujet avec eux.",
    "Merci, je vais essayer la respiration."
  ],
  responses: {
    "Je me sens dépassé en ce moment.": "Je suis désolé d'apprendre que vous ressentez cela. Pouvez-vous m'en dire un peu plus ? Est-ce lié à votre travail, à vos relations, ou à autre chose ?",
    "C'est surtout au travail, trop de responsabilités.": "Je comprends, les responsabilités au travail peuvent être écrasantes parfois. Est-ce que vous avez eu l'occasion de parler de cela avec vos collègues ou votre supérieur ?",
    "Non, je ne sais pas comment aborder le sujet avec eux.": "C'est normal de se sentir ainsi. Parfois, partager vos ressentis peut soulager la pression. Souhaitez-vous quelques conseils pour en parler ? Ou préférez-vous explorer des techniques pour gérer cette anxiété en attendant ?",
    "Merci, je vais essayer la respiration.": "C'est un excellent choix ! N'oubliez pas que vous faites de votre mieux, et chaque petit pas compte. Si vous avez besoin de moi à nouveau, je suis toujours là pour vous. Prenez soin de vous ! 💚"
  }
}

const userMessage = ref('')
const chatHistory = ref([
  {
    sender: 'bot',
    text: 'Je suis à ton écoute, est-ce que je peux t\'aider ?',
    isTyping: false
  }
])

const sendMessage = async () => {
  if (!userMessage.value.trim()) return

  const messageText = userMessage.value.trim()

  // Ajoute le message de l'utilisateur
  chatHistory.value.push({
    sender: 'user',
    text: messageText,
    isTyping: false
  })

  // Recherche une réponse dans le scénario
  const botResponse = chatScenario.responses[messageText] || 
    "Je ne suis pas sûr de comprendre. Pouvez-vous reformuler ou choisir une des options proposées ? (suivez le script pour l'instant 😉)"

  // Ajoute un message temporaire "en train d'écrire"
  chatHistory.value.push({
    sender: 'bot',
    text: '',
    isTyping: true
  })

  // Simule un délai de réponse
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Remplace le message temporaire par la vraie réponse
  chatHistory.value[chatHistory.value.length - 1] = {
    sender: 'bot',
    text: botResponse,
    isTyping: false
  }

  // Réinitialise le champ de message
  userMessage.value = ''

  // Scroll vers le bas
  await nextTick()
  const chatContainer = document.querySelector('.chat-area')
  if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight
  }
}
</script>

<template>
  <div class="app-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
          <h1>MAX</h1>
      </div>

      <nav class="nav-menu">
        <div>
            <h2>Historique Des Conversations</h2>
        </div>
      </nav>

      <div class="bottom-nav">
        <div class="nav-buttons">
          <button @click="$router.push('/landingpage')">
            <HomeIcon class="icon" />
          </button>
          <button>
            <UserIcon class="icon" />
          </button>
          <button>
            <BookOpenIcon class="icon" />
          </button>
          <button>
            <SettingsIcon class="icon" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="header">
        <button class="premium-button" @click="$router.push('/landingpage#abonnement')">
          Souscrire À Premium +
        </button>
      </header>

      <div class="chat-area">
        <div class="chat-container">
          <div v-for="(message, index) in chatHistory" 
               :key="index" 
               :class="['message-container', message.sender === 'user' ? 'user-message' : 'bot-message']">
            <div class="avatar">
              <template v-if="message.sender === 'bot'">
                <img src="../assets/LOGO_rose_pale300x.png" alt="MAX" class="avatar-img" style="width: 40px; height: 40px; object-fit: contain;" />
              </template>
              <template v-else>
                Toi
              </template>
            </div>
            <div class="message-content">
              <div class="message" :class="{ 'typing': message.isTyping }">
                <div v-if="message.isTyping" class="typing-animation">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <template v-else>
                  {{ message.text }}
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="input-container">
  <div class="input-wrapper">
    <input 
      v-model="userMessage"
      type="text" 
      placeholder="Écrire Un Message"
      class="message-input"
      @keyup.enter="sendMessage"
    >
    <button class="send-button" @click="sendMessage">
            <SendIcon class="send-icon" />
    </button>
  </div>
</div>
    </main>
  </div>
</template>


<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #1C5372, #90DBF5, #FFD2C7);
}

.sidebar {
  width: 16rem;
  background-color: #5597B4;
  color: white;
  text-align: center;
  padding: 1rem;
  position: relative;
}

.logo {
  margin-bottom: 2rem;
}

.logo h1 {
  font-size: 3rem;
  font-weight: bold;
  text-align: center;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.nav-section h2 {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.nav-section ul {
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-section a {
  text-decoration: none;
  color: white;
}

.nav-section a:hover {
  color: #bfdbfe;
}

.bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 16rem;
  background-color: #1C5372;
  padding: 1rem;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
}

.nav-buttons button {
  padding: 0.5rem;
  border-radius: 0.25rem;
  color: white;
  background-color: transparent;
  border: none;
  cursor: pointer;
}

.nav-buttons button:hover {
    color: #bfdbfe;
    transition: color 0.2s ease-in-out
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
}

.premium-button {
  background-color: #1e40af;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
}

.premium-button:hover {
  background-color: #1e3a8a;
}

.chat-area {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.chat-container {
  max-width: 80%;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.message-container {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  width: 100%;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-message {
  flex-direction: row-reverse;
}

.bot-message {
  flex-direction: row;
}
.user-message .message {
  background-color: #ffac9c;
  color: #333;
  border-top-right-radius: 4px;
  margin-right: 0.5rem;
}

/* Style pour les messages du bot */
.bot-message .message {
  background-color: #5ac7e5;
  color: #333;
  border-top-left-radius: 4px;
  margin-left: 0.5rem;
}

.message-content .message {
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3), 
              0 0 5px rgba(255, 255, 255, 0.1),
              0 0 2px rgba(255, 255, 255, 0.1);
  color: #333;
  border-top-left-radius: 4px;
  margin-left: 0.5rem;
}
.avatar {
  width: 5rem;
  height: 2rem;
  background-color: #1e40af;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 1rem;
}

.message {
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
  max-width: 70%;
}

.typing-animation {
  display: flex;
  gap: 0.3rem;
  padding: 0.5rem;
}

.typing-animation span {
  width: 0.5rem;
  height: 0.5rem;
  background-color: #1e40af;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-animation span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-animation span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% { 
    transform: scale(0);
  }
  40% { 
    transform: scale(1.0);
  }
}



.reply-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.reply-button {
  background-color: #dbeafe;
  color: #1e40af;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
}

.reply-button:hover {
  background-color: #bfdbfe;
}

.input-container {
  padding: 1rem;
}

.input-wrapper {
  max-width: 80%;
  margin: 0 auto;
  position: relative;
}

.message-input {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 3rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.message-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.send-button {
  position: absolute;
  right: 0.1rem;
  top: 50%;
  transform: translateY(-50%);
  background-color: transparent;
  border: none;
  color: #1e40af;
  padding: 0.5rem;
  cursor: pointer;
}
.send-button:hover {
  color: #bfdbfe;
  transition: color 0.2s ease-in-out
}

.send-icon {
  width: 1.5rem;
  height: 1.5rem;
}
</style>