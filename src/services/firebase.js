import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDo7Mru805Js7qazf2MhXT0xO7s0UxBxdo",
  authDomain: "campus-events-56.firebaseapp.com",
  projectId: "campus-events-56",
  storageBucket: "campus-events-56.firebasestorage.app",
  messagingSenderId: "373400922206",
  appId: "1:373400922206:web:702fa3b8a8426989982ccf",
  measurementId: "G-WN6EQPTKXS"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const database = getFirestore(app);