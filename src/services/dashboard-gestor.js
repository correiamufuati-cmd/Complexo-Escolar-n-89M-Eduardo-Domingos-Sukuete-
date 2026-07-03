import { protectPage } from "./authGuard.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

import { app } from "./firebase.js";

const db = getFirestore(app);
const auth = getAuth(app);

// 🔐 proteger página (apenas gestores)
protectPage("gestor");

// 👤 carregar info do utilizador logado
function loadUserInfo() {
  const user = window.currentUser;

  if (!user) return;

  document.getElementById("userInfo").innerText =
    `${user.name} - ${user.role}`;

  document.getElementById("schoolName").innerText =
    user.schoolId;
}

// 📊 estatísticas da escola
async function loadStats() {
  try {
    const studentsSnap = await getDocs(collection(db, "students"));
    const teachersSnap = await getDocs(collection(db, "teachers"));
    const classesSnap = await getDocs(collection(db, "classes"));

    document.getElementById("totalStudents").innerText = studentsSnap.size;
    document.getElementById("totalTeachers").innerText = teachersSnap.size;
    document.getElementById("totalClasses").innerText = classesSnap.size;

  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error);
  }
}

// 🚪 logout
function setupLogout() {
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "/login.html";
  });
}

// 🚀 inicialização
function initDashboard() {
  loadUserInfo();
  loadStats();
  setupLogout();
}

initDashboard();
