<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import axios from 'axios' 
import { marked } from 'marked';
import chatheader from "./OnlineBarChat.vue"
import { 
  Home as HomeIcon,
  User as UserIcon, 
  BookOpen as BookOpenIcon, 
  Settings as SettingsIcon, 
  Send as SendIcon,
  StopCircle  as StopIcon,
  Plus as PlusIcon,
  X as XIcon
} from 'lucide-vue-next'

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const userMessage = ref('')
const chatHistory = ref([
  {
    sender: 'bot',
    text: 'Je suis à ton écoute, est-ce que je peux t\'aider ?',
    isTyping: false,
    timestamp: new Date().getTime() 
  }
])

const conversations = ref([
  {
    id: 1,
    title: 'Conversation 1',
    messages: [...chatHistory.value]
  }
])

const activeConversation = ref(1)
const isWaitingForResponse = ref(false)
const abortController = ref(new AbortController())
const cancelResponse = () => {
  abortController.value.abort()
  abortController.value = new AbortController()
  
  // Remplacer le message "typing" par un message d'annulation
  if (chatHistory.value[chatHistory.value.length - 1].isTyping) {
    const cancelTime = new Date().getTime();
    
    chatHistory.value[chatHistory.value.length - 1] = {
      sender: 'bot',
      text: 'Réponse annulée.',
      isTyping: false,
      timestamp: cancelTime
    }
    
    const currentConvIndex = conversations.value.findIndex(
      conv => conv.id === activeConversation.value
    );
    
    if (currentConvIndex !== -1) {
      conversations.value[currentConvIndex].messages = [...chatHistory.value];
    }
  }
  
  isWaitingForResponse.value = false
}
const createNewConversation = () => {
  const newId = conversations.value.length + 1
  const currentTime = new Date().getTime();
  
  conversations.value.push({
    id: newId,
    title: `Conversation ${newId}`,
    messages: [{
      sender: 'bot',
      text: 'Je suis à ton écoute, est-ce que je peux t\'aider ?',
      isTyping: false,
      timestamp: currentTime
    }]
  })
  switchConversation(newId)
}

const switchConversation = (id) => {
  activeConversation.value = id
  chatHistory.value = conversations.value.find(conv => conv.id === id)?.messages || []
}


const sendMessage = async () => {
  if (!userMessage.value.trim()) return;

  const messageText = userMessage.value.trim();
  // Réinitialisation immédiate du champ de saisie
  userMessage.value = '';
  isWaitingForResponse.value = true;
  
  const currentTime = new Date().getTime();

  chatHistory.value.push({
    sender: 'user',
    text: messageText,
    isTyping: false,
    timestamp: currentTime
  });

  chatHistory.value.push({
    sender: 'bot',
    text: '',
    isTyping: true,
    timestamp: currentTime
  });

  try {
    abortController.value = new AbortController();

    await axios.get('http://localhost:8000/docs');
 
    // Appeler l'API Mistral avec une requête POST
    const response = await axios.post('http://localhost:8000/chat', {
      message: messageText,
    }, { signal: abortController.value.signal });

    const responseTime = new Date().getTime();

    chatHistory.value[chatHistory.value.length - 1] = {
      sender: 'bot',
      text: response.data.response, 
      isTyping: false,
      timestamp: responseTime
    };
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API :", error);
    const errorTime = new Date().getTime();
    chatHistory.value[chatHistory.value.length - 1] = {
      sender: 'bot',
      text: 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.',
      isTyping: false,
      timestamp: errorTime
    };
  }finally {
    // Remettre l'état d'attente à false
    isWaitingForResponse.value = false;
  }

  userMessage.value = '';

  await nextTick();
  const chatContainer = document.querySelector('.chat-area');
  if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
};

const renderMarkdown = (text) => {
  return marked(text);
};
</script>

<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="logo">
        <h1>MAX</h1>
      </div>

      <nav class="nav-menu">
        <div class="conversations-header">
          <!--<h2>Historique Des Conversations</h2>-->
          <button @click="createNewConversation" class="new-chat-btn">
            <PlusIcon class="icon" />
            Nouvelle conversation
          </button>
        </div>
        
        <div class="conversations-list">
          <button 
            v-for="conv in conversations" 
            :key="conv.id"
            @click="switchConversation(conv.id)"
            :class="['conversation-btn', { active: activeConversation === conv.id }]"
          >
            {{ conv.title }}
          </button>
        </div>
      </nav>

      <div class="bottom-nav">
        <div class="nav-buttons">
          <router-link to="/"> <button >
            <HomeIcon class="icon" />
          </button></router-link>
          <router-link to="/auth"> <button >  <UserIcon class="icon" />
          </button></router-link>
          <router-link to="/unknown"> <button>
            <BookOpenIcon class="icon" />
          </button></router-link>
          <router-link to="/unknown"> <button>
            <SettingsIcon class="icon" />
          </button></router-link>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <chatheader/>

      

      <div class="chat-area">
        <div class="chat-container">
          <div v-for="(message, index) in chatHistory" 
               :key="index" 
               :class="['message-wrapper', message.sender === 'user' ? 'user-message' : 'bot-message']">
            <div class="message-container">
             
              <div class="message-content">
                <div class="message" :class="{ 'typing': message.isTyping }">
                  
                  <div v-if="message.isTyping" class="typing-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <template v-else>
                    <div v-html="renderMarkdown(message.text)"></div>
                  </template>
                </div>
                <div v-if="!message.isTyping" class="message-timestamp">
                  {{ formatTimestamp(message.timestamp) }}
                </div>
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
            :disabled="isWaitingForResponse"

          >
          <button 
        v-if="!isWaitingForResponse" 
        class="send-button" 
        @click="sendMessage"
        :disabled="!userMessage.trim()"
      >
        <SendIcon class="send-icon" />
      </button>
      <button 
        v-else 
        class="stop-button" 
        @click="cancelResponse"
      >
        <StopIcon class="stop-icon" />
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
  width: 25rem;
  background-color: #1C5372;
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

.conversations-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.new-chat-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.conversations-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.conversation-btn {
  background: transparent;
  border: none;
  color: white;
  padding: 0.5rem;
  text-align: left;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: background 0.2s;
}

.conversation-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.conversation-btn.active {
  background: rgba(255, 255, 255, 0.2);
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
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease-in-out;
  border: 2px solid transparent;
  cursor: pointer;
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
  width: 100%;
    height: 100%;
  display: flex;
  flex-direction: column;
}

.message-wrapper {
  width: 100%;
  display: flex;
  margin-bottom: 1.5rem;
  animation: fadeIn 0.3s ease-in-out;
}

.message-wrapper.user-message {
  justify-content: flex-end;
}

.message-wrapper.bot-message {
  justify-content: flex-start;

}

.message-container {
  display: flex;
  align-items: flex-start;
  max-width: 90%;
}

.user-message .message-container {
  flex-direction: row-reverse;
}

.avatar {
  width: 40px;
  height: 40px;
  margin: 0 12px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  flex: 1;
}

.message {
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 100%;
  word-wrap: break-word;
}

.user-message .message {
  background-color: #1e40af;
  color: white;
  border-bottom-right-radius: 4px;
  margin-left: auto;
}

.bot-message .message {
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  border-bottom-left-radius: 4px;
  padding-left: 2rem;

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

.input-container {
  padding: 1rem;
  width: 100%; 
}


.input-wrapper {
  max-width: 100%; 
  margin: 0 auto;
  position: relative;
  display: flex;
  gap: 0.5rem;
  width: 100%; 
}

.message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  width: 100%;
}

.message-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.send-button, .questions-button {
  background-color: #1C5372;
  border: none;
  color: white;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-button:hover, .questions-button:hover {
  transform: scale(1.05);
}

.send-icon {
  width: 1.2rem;
  height: 1.2rem;
}
.stop-button {
  background-color: #dc2626;
  border: none;
  color: white;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stop-button:hover {
  background-color: #b91c1c;
}

.message-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}
.questions-popup {
  position: fixed;
  bottom: 5rem;
  right: 1rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 20rem;
  max-width: 90vw;
  z-index: 1000;
}

.questions-content {
  padding: 1rem;
}

.questions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.questions-header h3 {
  font-size: 1.1rem;
  color: #1e40af;
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: #1e40af;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.question-button {
  background: #f3f4f6;
  border: none;
  padding: 0.75rem 1rem;
  text-align: left;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #1f2937;
  font-size: 0.9rem;
  line-height: 1.4;
}

.question-button:hover {
  background: #e5e7eb;
  transform: translateX(4px);
}

.bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  width: inherit;
  background-color: #0A222F;
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
  transition: color 0.2s ease-in-out;
}

.message-timestamp {
  font-weight: 700;
  font-size: 0.7rem;
  margin-top: 4px;
  opacity: 0.7;
  text-align: right;
}

.bot-message .message-timestamp {
  text-align: left;
  color: #ffffff;
  font-weight: 700;
}

.user-message .message-timestamp {
  text-align: right;
  color: rgba(0, 0, 0, 0.8);
}

@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 1rem;
  }

  .chat-container {
    max-width: 95%;
  }

  .message-container {
    max-width: 90%;
  }

  .avatar {
    width: 32px;
    height: 32px;
    margin: 0 8px;
  }

  .bottom-nav {
    position: fixed;
    width: 100%;
    bottom: 0;
    left: 0;
    background-color: #0A222F;
    z-index: 10;
    padding: 0.5rem 1rem;
  }

  .nav-buttons {
    justify-content: center;
    gap: 1rem;
  }

  .main-content {
    padding-bottom: 4rem;
  }

  .chat-area {
    padding-bottom: 6rem;
  }
}
@media (max-width: 642px) {
  .new-chat-btn {
    font-size: 0.85rem;
    padding: 0.4rem 0.6rem;
  }

  .conversation-btn {
    font-size: 0.85rem;
  }

  .message-input {
    font-size: 0.85rem;
    padding: 0.5rem;
  }

  .send-button, .stop-button {
    width: 2rem;
    height: 2rem;
  }

  .send-icon, .stop-icon {
    width: 1rem;
    height: 1rem;
  }
  .app-container {
justify-content: center !important;  }
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
</style>