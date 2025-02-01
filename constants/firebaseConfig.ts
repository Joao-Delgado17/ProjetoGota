import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDalx6xpvNhPqzlLPIvws9_qOWrEyBQCa0",
  authDomain: "geolocation-f1600.firebaseapp.com",
  databaseURL: "https://geolocation-f1600-default-rtdb.firebaseio.com",
  projectId: "geolocation-f1600",
  storageBucket: "gs://geolocation-f1600.firebasestorage.app",
  messagingSenderId: "703301534570",
  appId: "1:703301534570:web:5c14fa7e28b3f0013d1b13",
  measurementId: "G-PFV4YB168E"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app); // 🔥 Agora Firebase Storage está incluído

export { app, db, storage }; // 🔥 Exportando Storage para uso nos uploads
