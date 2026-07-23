import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";


const firebaseConfig = {
  apiKey: "AIzaSyBzfp9Oy7GUPXQi3oq4awzF3HIcvMfXWDw",
  authDomain: "sigea-49e2d.firebaseapp.com",
  projectId: "sigea-49e2d",
  storageBucket: "sigea-49e2d.firebasestorage.app",
  messagingSenderId: "722428091928",
  appId: "1:722428091928:web:130f0fddc11586c4076d6d"
};


export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);
