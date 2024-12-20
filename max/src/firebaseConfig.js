// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAg26E5CsF3WoXqQCAdFDpzI0GU2V786eY",
  authDomain: "max-ai-66f16.firebaseapp.com",
  projectId: "max-ai-66f16",
  storageBucket: "max-ai-66f16.firebasestorage.app",
  messagingSenderId: "682572378814",
  appId: "1:682572378814:web:0c62d6d68cb4026357e4ef",
  measurementId: "G-XD2B4F8WXP"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// Initialiser analytics seulement côté client
