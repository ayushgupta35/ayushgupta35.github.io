// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBizkF3dfNhRhmJ0ecMzUTk-KA8wuoEig",
  authDomain: "ayush-portfolio-10d56.firebaseapp.com",
  databaseURL: "https://ayush-portfolio-10d56-default-rtdb.firebaseio.com",
  projectId: "ayush-portfolio-10d56",
  storageBucket: "ayush-portfolio-10d56.firebasestorage.app",
  messagingSenderId: "791246145029",
  appId: "1:791246145029:web:9565dea1a1760070633e6c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
