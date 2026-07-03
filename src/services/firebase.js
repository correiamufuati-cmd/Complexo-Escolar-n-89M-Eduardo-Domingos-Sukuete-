import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

// 🔥 CONFIGURAÇÃO FIREBASE (substituir pelos teus dados)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 🚀 inicializar app
export const app = initializeApp(firebaseConfig);

// 🔐 autenticação
export const auth = getAuth(app);

// 🗄️ base de dados
export const db = getFirestore(app);

// 📦 armazenamento (imagens, ficheiros, etc.)
export const storage = getStorage(app);
