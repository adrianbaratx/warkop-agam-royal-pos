import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/*
  CARA ISI:
  1. Buka Firebase Console
  2. Project settings
  3. Your apps > Web app
  4. Copy firebaseConfig ke bawah ini

  Selama masih berisi "ISI_...", aplikasi tetap bisa jalan mode demo lokal,
  tetapi pesanan dari HP konsumen belum bisa masuk realtime ke laptop kasir.
*/

const firebaseConfig = {
  apiKey: "ISI_API_KEY",
  authDomain: "ISI_AUTH_DOMAIN",
  projectId: "ISI_PROJECT_ID",
  storageBucket: "ISI_STORAGE_BUCKET",
  messagingSenderId: "ISI_MESSAGING_SENDER_ID",
  appId: "ISI_APP_ID",
};

const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => value && !String(value).startsWith("ISI_")
);

let db = null;

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export { db, isFirebaseConfigured };
