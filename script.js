import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔥 Firebase
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "sac-escolar.firebaseapp.com",
  projectId: "sac-escolar"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= MENU =================
function mostrar(id) {
  document.querySelectorAll(".pagina").forEach(p => p.classList.remove("ativa"));
  document.getElementById(id).classList.add("ativa");
}

// ================= ADMIN - CRIAR ACESSO =================
async function criarAcesso() {
  const professor = document.getElementById("professor").value;
  const disciplina = document.getElementById("disciplina").value;
  const senha = document.getElementById("senhaAcesso").value;
  const link = document.getElementById("linkExcel").value;

  await addDoc(collection(db, "acessos"), {
    professor,
    disciplina,
    senha,
    link
  });

  alert("Acesso criado!");
}

// ================= LOGIN PROFESSOR =================
async function entrarProfessor() {
  const disciplina = document.getElementById("loginDisciplina").value;
  const senha = document.getElementById("loginSenha").value;

  const snap = await getDocs(collection(db, "acessos"));

  let encontrado = null;

  snap.forEach(doc => {
    const d = doc.data();
    if (d.disciplina === disciplina && d.senha === senha) {
      encontrado = d;
    }
  });

  if (encontrado) {
    alert("Acesso permitido!");
    window.open(encontrado.link, "_blank");
  } else {
    alert("Acesso negado!");
  }
}

// ================= PUBLICAÇÕES =================
async function criarPublicacao() {
  const titulo = document.getElementById("pubTitulo").value;
  const texto = document.getElementById("pubTexto").value;

  await addDoc(collection(db, "publicacoes"), {
    titulo,
    texto
  });

  carregarPublicacoes();
}

// ================= CARREGAR PUBLICAÇÕES =================
async function carregarPublicacoes() {
  const div = document.getElementById("listaPublicacoes");
  const feed = document.getElementById("feed");

  div.innerHTML = "";
  feed.innerHTML = "";

  const snap = await getDocs(collection(db, "publicacoes"));

  snap.forEach(doc => {
    const p = doc.data();

    div.innerHTML += `<p><b>${p.titulo}</b>: ${p.texto}</p>`;
    feed.innerHTML += `<p><b>${p.titulo}</b>: ${p.texto}</p>`;
  });
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  carregarPublicacoes();
});

// expor funções
window.mostrar = mostrar;
window.criarAcesso = criarAcesso;
window.entrarProfessor = entrarProfessor;
window.criarPublicacao = criarPublicacao;
