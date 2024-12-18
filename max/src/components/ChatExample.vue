<template>
  <div class="chat-example">
    <h4>EXEMPLE DE CONVERSATION</h4>
    <div class="chat-window">
      <!-- Ici vous pouvez ajouter des exemples de conversation -->
    </div>
  </div>
</template>

<style scoped>
.chat-example {
  flex: 1;
}

.chat-window {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  min-height: 400px;
}

h4 {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}
</style>