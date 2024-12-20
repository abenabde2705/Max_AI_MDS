<style scoped>
/* ... autres styles ... */

.message-container {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  position: relative;
}

.user-message {
  flex-direction: row-reverse;
}

.avatar {
  width: 2rem;
  height: 2rem;
  background-color: #1C5372;
  border-radius: 50%;
  margin: 0 1rem;
  flex-shrink: 0;
}

.message {
  position: relative;
  padding: 1rem 1.5rem;
  border-radius: 1.5rem;
  max-width: 80%;
  font-size: 0.95rem;
  line-height: 1.4;
}

/* Style pour les messages utilisateur */
.user-message .message {
  background-color: #FFB4A2;
  color: #333;
  border-top-right-radius: 4px;
  margin-right: 0.5rem;
}

/* Style pour les messages du bot */
.bot-message .message {
  background-color: #90DBF5;
  color: #333;
  border-top-left-radius: 4px;
  margin-left: 0.5rem;
}

/* Effet de flou/ombre pour les messages */
.message {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* Animation d'apparition des messages */
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

.message-container {
  animation: fadeIn 0.3s ease-out;
}
</style> 