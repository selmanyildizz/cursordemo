import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCHMJAa1Q8cZ845OB8CUuHKl2oUkARMoQM",
    authDomain: "my-project-1657103014422.firebaseapp.com",
    projectId: "my-project-1657103014422",
    storageBucket: "my-project-1657103014422.firebasestorage.app",
    messagingSenderId: "312133555381",
    appId: "1:312133555381:web:c6c5b95020a4ac4d279afc",
    measurementId: "G-9QYWS25W0H"
  };

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firestore ve Storage servislerini al
export const db = getFirestore(app);
export const storage = getStorage(app); 