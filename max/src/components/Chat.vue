<template>
  <div class="app-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
       <button @click="$router.push('/landingpage')"> <h1>MAX</h1></button>
      </div>

      <nav class="nav-menu">
        <section class="nav-section">
          <h2>Historique Des Conversations</h2>
          <ul>
            <li><a href="#">Toutes Les Conversations</a></li>
            <li><a href="#">Conversations Marquées</a></li>
          </ul>
        </section>

        <section class="nav-section">
          <h2>Forum De Discussion</h2>
          <ul>
            <li><a href="#">Sujets Populaires</a></li>
            <li><a href="#">Rejoindre Un Groupe</a></li>
          </ul>
        </section>

        <section class="nav-section">
          <h2>Articles Et Vidéos</h2>
          <ul>
            <li><a href="#">Board De Motivation</a></li>
            <li><a href="#">Vidéos Éducatives & Témoignages</a></li>
          </ul>
        </section>

        <section class="nav-section">
          <h2>Ressources Thématiques</h2>
          <ul>
            <li><a href="#">Journal De Gratitude</a></li>
            <li><a href="#">Activités Anti-Stress</a></li>
            <li><a href="#">Combattre L'anxiété</a></li>
          </ul>
        </section>
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
      <!-- Header -->
      <header class="header">
        <button class="premium-button">
          Souscrire À Premium +
        </button>
      </header>

      <!-- Chat Area -->
      <div class="chat-area">
        <div class="chat-container">
          <!-- Initial Bot Message -->
          <div class="message-container bot-message">
            <div class="avatar">
              MAX
            </div>
            <div class="message-content">
              <div class="message">
                Je Suis À Ton Écoute, Est-Ce Que Je Peux T'aider ?
              </div>
            </div>
          </div>

          <!-- Messages -->
          <div v-for="(message, index) in chatHistory" 
               :key="index" 
               :class="['message-container', message.sender === 'user' ? 'user-message' : 'bot-message']">
            <div class="avatar">
              {{ message.sender === 'bot' ? 'MAX' : 'Toi' }}
            </div>
            <div class="message-content">
              <div class="message">
                {{ message.text }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Input -->
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

<script setup>
import { ref } from 'vue'
import { HomeIcon, UserIcon, BookOpenIcon, SettingsIcon, SendIcon } from 'lucide-vue-next'

const chatHistory = ref([])
const userMessage = ref('')

const handleQuickReply = async (message) => {
  userMessage.value = message
  await sendMessage()
}

const sendMessage = async () => {
  if (!userMessage.value.trim()) return

  // Ajoute le message de l'utilisateur à l'historique
  chatHistory.value.push({ sender: "user", text: userMessage.value })

  // Envoie la requête au backend
  try {
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage.value }),
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la requête à l'API.")
    }

    const data = await response.json()

    // Ajoute la réponse du bot à l'historique
    chatHistory.value.push({
      sender: "bot",
      text: data.reply,
    })
  } catch (error) {
    console.error("Erreur :", error)
    chatHistory.value.push({
      sender: "bot", 
      text: "Une erreur est survenue. Veuillez réessayer plus tard."
    })
  }

  // Réinitialise le champ de saisie
  userMessage.value = ""
}
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #60a5fa, #93c5fd, #fbcfe8);
}

.sidebar {
  width: 16rem;
  background-color: #1e40af;
  color: white;
  padding: 1rem;
  position: relative;
}

.logo {
  margin-bottom: 2rem;
}

.logo h1 {
  font-size: 1.875rem;
  font-weight: bold;
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
  background-color: #1e3a8a;
  padding: 1rem;
}

.nav-buttons {
  display: flex;
  justify-content: space-between;
}

.nav-buttons button {
  padding: 0.5rem;
  border-radius: 0.25rem;
}

.nav-buttons button:hover {
  background-color: #1e40af;
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
}

.chat-container {
  max-width: 42rem;
  margin: 0 auto;
}

.message-container {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  width: 100%;
}

.user-message {
  flex-direction: row-reverse;
}

.bot-message {
  flex-direction: row;
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
}

.user-message .message {
  background-color: #dbeafe;
}

.bot-message .message {
  background-color: #f3f4f6;
}

.quick-replies {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
  border-top: 1px solid #e5e7eb;
}

.input-wrapper {
  max-width: 42rem;
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
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #1e40af;
  padding: 0.5rem;
}

.send-icon {
  width: 1.5rem;
  height: 1.5rem;
}
</style>