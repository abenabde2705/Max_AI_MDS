import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    port: 5173,
    strictPort: true,
  },
  // Ajoutez ces options pour le débogage
  build: {
    sourcemap: true,
  },
  logLevel: 'info', // Pour voir plus de logs
});