<script setup>
import { ref } from 'vue'
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

// État du chat
const userMessage = ref('')
const chatHistory = ref([
  {
    sender: 'bot',
    text: 'Je suis à ton écoute, est-ce que je peux t\'aider ?'
  }
])

// Questions rapides prédéfinies (utilisez les questions du scénario)
const quickReplies = chatScenario.questions

// Fonction pour envoyer un message
const sendMessage = async () => {
  if (!userMessage.value.trim()) return

  const messageText = userMessage.value.trim()

  // Ajoute le message de l'utilisateur
  chatHistory.value.push({
    sender: 'user',
    text: messageText
  })

  // Recherche une réponse dans le scénario
  const botResponse = chatScenario.responses[messageText] || 
    "Je ne suis pas sûr de comprendre. Pouvez-vous reformuler ou choisir une des options proposées ? (suivez le script pour l'instant 😉)"

  // Simule un délai de réponse pour plus de naturel
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Ajoute la réponse du bot
  chatHistory.value.push({
    sender: 'bot',
    text: botResponse
  })

  // Réinitialise le champ de message
  userMessage.value = ''

  // Scroll vers le bas
  await nextTick()
  const chatContainer = document.querySelector('.overflow-y-auto')
  if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight
  }
}

// Fonction pour utiliser une réponse rapide
const useQuickReply = (reply) => {
  userMessage.value = reply
  sendMessage()
}
</script>

<template>
  <div class="flex h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-pink-200">
    <!-- Sidebar reste inchangé -->
    <aside class="w-64 bg-blue-800 text-white p-4">
      <!-- ... votre sidebar existant ... -->
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col">
      <!-- Chat Area -->
      <div class="flex-1 p-6 overflow-y-auto">
        <div class="max-w-2xl mx-auto">
          <!-- Messages -->
          <div v-for="(message, index) in chatHistory" 
               :key="index" 
               class="flex items-start mb-6">
            <div class="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center text-white mr-4">
              {{ message.sender === 'bot' ? 'M' : 'U' }}
            </div>
            <div class="flex-1">
              <div :class="[
                'rounded-lg p-4 mb-2',
                message.sender === 'bot' ? 'bg-gray-100' : 'bg-blue-500 text-white'
              ]">
                {{ message.text }}
              </div>

              <!-- Quick Replies (montrer seulement après les messages du bot) -->
              <div v-if="message.sender === 'bot' && index === chatHistory.length - 1" 
                   class="space-y-2">
                <div class="flex flex-wrap gap-2">
                  <button v-for="reply in quickReplies" 
                          :key="reply"
                          @click="useQuickReply(reply)"
                          class="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm">
                    {{ reply }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="p-4 border-t">
        <div class="max-w-2xl mx-auto">
          <div class="relative">
            <input 
              v-model="userMessage"
              type="text" 
              placeholder="Écrire Un Message"
              class="w-full px-4 py-3 pr-12 rounded-lg border focus:outline-none focus:border-blue-500"
              @keyup.enter="sendMessage"
            >
            <button 
              @click="sendMessage"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-800 p-2">
              <SendIcon class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Vos styles existants */
</style>