import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log('🔧 Firebase Config loaded:', {
  apiKey: firebaseConfig.apiKey ? '✅ OK' : '❌ Missing',
  authDomain: firebaseConfig.authDomain ? '✅ OK' : '❌ Missing',
  projectId: firebaseConfig.projectId ? '✅ OK' : '❌ Missing'
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Analytics avec vérification de support
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('✅ Firebase Analytics initialisé');
    } else {
      console.log('⚠️ Firebase Analytics non supporté dans cet environnement');
    }
  }).catch((error) => {
    console.log('❌ Erreur Analytics:', error.message);
  });
}

export { app, db, analytics };
