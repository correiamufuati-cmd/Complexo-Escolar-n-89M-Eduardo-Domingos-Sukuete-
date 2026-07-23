import { app } from "./firebase.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);


// ===============================
// VERIFICAR LOGIN
// ===============================
onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "../public/login.html";
        return;
    }

    // Email do utilizador
    document.getElementById("userInfo").textContent = user.email;

    // Nome da escola (temporário)
    await carregarEscola();

    // Totais
    await carregarTotais();

});


// ===============================
// ESCOLA
// ===============================
async function carregarEscola() {

    const snapshot = await getDocs(collection(db, "escolas"));

    if (!snapshot.empty) {

        const escola = snapshot.docs[0].data();

        document.getElementById("schoolName").textContent =
            escola.nome;

    }

}


// ===============================
// CARTÕES
// ===============================
async function carregarTotais() {

    const alunos = await getDocs(collection(db, "alunos"));
    const professores = await getDocs(collection(db, "professores"));
    const turmas = await getDocs(collection(db, "turmas"));

    document.getElementById("totalStudents").textContent =
        alunos.size;

    document.getElementById("totalTeachers").textContent =
        professores.size;

    document.getElementById("totalClasses").textContent =
        turmas.size;

}


// ===============================
// LOGOUT
// ===============================
document.getElementById("logoutBtn").addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "../public/login.html";

});
