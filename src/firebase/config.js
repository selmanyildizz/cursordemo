import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCHMJAa1Q8cZ845OB8CUuHKl2oUkARMoQM",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "my-project-1657103014422.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "my-project-1657103014422",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "my-project-1657103014422.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "312133555381",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:312133555381:web:c6c5b95020a4ac4d279afc"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app); 