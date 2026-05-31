import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB75s0qjZi-w90lxQAsUQNcwH_Dv-hE984",
  authDomain: "warkop-agam-royal.firebaseapp.com",
  databaseURL: "https://warkop-agam-royal-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "warkop-agam-royal",
  storageBucket: "warkop-agam-royal.firebasestorage.app",
  messagingSenderId: "857516233485",
  appId: "1:857516233485:web:e36e483b236ef1dea69644",
  measurementId: "G-E3XK7QCV78",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const isFirebaseConfigured = true;

export { db, isFirebaseConfigured };