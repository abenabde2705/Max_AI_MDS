<template>
  <div class="chatbot-container">
    <div class="chatbot-messages">
      <div
        v-for="(message, index) in chatHistory"
        :key="index"
        :class="['message', message.sender]"
      >
        <span class="message-bubble">{{ message.text }}</span>
      </div>
    </div>
    <div class="chatbot-input">
      <input
        v-model="userMessage"
        type="text"
        placeholder="Posez une question..."
        @keyup.enter="sendMessage"
      />
      <button @click="sendMessage">Envoyer</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chatHistory: [],
      userMessage: "",
    };
  },
  methods: {
    async sendMessage() {
      if (!this.userMessage.trim()) return;

      // Ajoute le message de l'utilisateur à l'historique
      this.chatHistory.push({ sender: "user", text: this.userMessage });

      // Envoie la requête au backend
      try {
        const response = await fetch("http://localhost:5000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: this.userMessage }),
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la requête à l'API.");
        }

        const data = await response.json();

        // Ajoute la réponse du bot à l'historique
        this.chatHistory.push({
          sender: "bot",
          text: data.reply,
        });
      } catch (error) {
        console.error("Erreur :", error);
        this.chatHistory.push({
          sender: "bot",
          text: "Une erreur est survenue. Veuillez réessayer plus tard.",
        });
      }

      // Réinitialise le champ de saisie
      this.userMessage = "";
    },
  },
};
</script>

<style scoped>
.chatbot-container {
  width: 100%;
  max-width: 400px;
  background: linear-gradient(135deg, #e8f3fc, #ffe6f7);
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chatbot-messages {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.message {
  display: flex;
  align-items: flex-start;
}

.message-bubble {
  padding: 10px 15px;
  border-radius: 20px;
  max-width: 80%;
  word-wrap: break-word;
  line-height: 1.4;
}

.message.user .message-bubble {
  background-color: #a3e3ff;
  color: #004080;
  align-self: flex-end;
}

.message.bot .message-bubble {
  background-color: #fbd1e6;
  color: #800040;
  align-self: flex-start;
}

.chatbot-input {
  display: flex;
  border-top: 1px solid #ddd;
  padding: 10px;
}

.chatbot-input input {
  flex-grow: 1;
  padding: 10px;
  border: none;
  border-radius: 5px;
  outline: none;
  font-size: 14px;
}

.chatbot-input button {
  margin-left: 10px;
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.chatbot-input button:hover {
  background-color: #0056b3;
}
</style>
