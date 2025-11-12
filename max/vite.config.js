import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Charger les variables d'environnement depuis la racine
  const env = loadEnv(mode, path.resolve(__dirname, '../'), '');
  
  return {
    plugins: [vue()],
    server: {
      watch: {
        usePolling: true, // Active le polling pour détecter les changements dans Docker
      },
      host: true, // Permet à Vite d'écouter sur toutes les interfaces réseau
      port: 5174, // Port différent pour éviter les conflits
      strictPort: true,
    },
    define: {
      // Exposer les variables Firebase au client
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID),
      'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(env.VITE_FIREBASE_MEASUREMENT_ID),
    },
    envDir: '../',
  };
});
