import { protectPage } from "./authGuard.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

import { app } from "./firebase.js";

const db = getFirestore(app);
const auth = getAuth(app);

protectPage("gestor");

// 👤 carregar dados do utilizador
function loadUser() {
  const user = window.currentUser;

  if (!user) return;

  document.getElementById("userInfo").innerText =
    `${user.name} - ${user.role}`;

  loadSchool(user.schoolId);
}

// 🏫 buscar escola no Firestore
async function loadSchool(schoolId) {
  const q = query(
    collection(db, "schools"),
    where("__name__", "==", schoolId)
  );

  const snap = await getDocs(q);

  snap.forEach(doc => {
    const school = doc.data();

    document.getElementById("schoolName").innerText =
      school.name;
  });
}

// 📊 estatísticas (ainda simples)
async function loadStats() {
  const studentsSnap = await getDocs(collection(db, "students"));
  const teachersSnap = await getDocs(collection(db, "teachers"));
  const classesSnap = await getDocs(collection(db, "classes"));

  document.getElementById("totalStudents").innerText = studentsSnap.size;
  document.getElementById("totalTeachers").innerText = teachersSnap.size;
  document.getElementById("totalClasses").innerText = classesSnap.size;
}

// 🚪 logout
function setupLogout() {
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "/login.html";
  });
}

function init() {
  loadUser();
  loadStats();
  setupLogout();
}

init();
