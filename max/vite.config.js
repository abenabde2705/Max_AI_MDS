import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    watch: {
      usePolling: true, // Active le polling pour détecter les changements dans Docker
    },
    host: true, // Permet à Vite d'écouter sur toutes les interfaces réseau
    port: 5173, // Définit le port du serveur de développement
    strictPort: true, // Assure que le port 5173 est toujours utilisé
  },
});
