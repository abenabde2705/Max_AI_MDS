import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const envFromFile = loadEnv(mode, path.resolve(__dirname, '../'), '');
  const envFromProcess = Object.fromEntries(
    Object.entries(process.env).filter(([k]) => k.startsWith('VITE_'))
  );
  const env = { ...envFromFile, ...envFromProcess };
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      watch: {
        usePolling: true,
      },
      host: true,
      allowedHosts: [
        'dev.maxai-mds.fr',
        'maxai-mds.fr',      
        'www.maxai-mds.fr', 
        'localhost'
      ],
      port: 5173,
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