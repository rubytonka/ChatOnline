
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-b2938.firebaseapp.com",
  projectId: "reactchat-b2938",
  storageBucket: "reactchat-b2938.firebasestorage.app",
  messagingSenderId: "1067835890412",
  appId: "1:1067835890412:web:00bc60fb3222075771a3c9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()