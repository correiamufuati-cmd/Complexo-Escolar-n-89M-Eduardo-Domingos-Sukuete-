import { protectPage } from "./authGuard.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

import { app } from "./firebase.js";

const db = getFirestore(app);
const auth = getAuth(app);

// 🔐 proteger página
protectPage("gestor");

// 👤 carregar dados do utilizador
setTimeout(() => {
  const user = window.currentUser;

  document.getElementById("userInfo").innerText =
    `${user.name} (${user.role})`;

  document.getElementById("schoolName").innerText =
    user.schoolId;
}, 1000);

// 📊 carregar estatísticas
async function loadStats() {

  const studentsSnap = await getDocs(collection(db, "students"));
  const teachersSnap = await getDocs(collection(db, "teachers"));
  const classesSnap = await getDocs(collection(db, "classes"));

  document.getElementById("totalStudents").innerText = studentsSnap.size;
  document.getElementById("totalTeachers").innerText = teachersSnap.size;
  document.getElementById("totalClasses").innerText = classesSnap.size;
}

loadStats();

// 🚪 logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "/login.html";
  });
});
