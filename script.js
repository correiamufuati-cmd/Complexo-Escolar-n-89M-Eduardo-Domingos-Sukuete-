import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "sac-escolar.firebaseapp.com",
  projectId: "sac-escolar"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// MENU
function mostrar(id) {
  document.querySelectorAll(".pagina").forEach(p => p.classList.remove("ativa"));
  document.getElementById(id).classList.add("ativa");
}

// SENHA
function gerarSenha() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let senha = "";
  for (let i = 0; i < 6; i++) {
    senha += chars[Math.floor(Math.random() * chars.length)];
  }
  document.getElementById("senhaAcesso").value = senha;
}

// SISTEMA
async function toggleSistema() {
  const ref = doc(db, "config", "system");
  const snap = await getDoc(ref);
  const estado = snap.exists() ? !snap.data().ativo : false;
  await setDoc(ref, { ativo: estado });
  alert("Sistema: " + (estado ? "ATIVO" : "DESLIGADO"));
}

// ACESSOS
async function criarAcesso() {
  const disciplina = document.getElementById("disciplina").value;
  const senha = document.getElementById("senhaAcesso").value;
  const link = document.getElementById("linkExcel").value;

  await addDoc(collection(db, "acessos"), { disciplina, senha, link });

  carregarAcessos();
}

async function carregarAcessos() {
  const lista = document.getElementById("listaAcessos");
  lista.innerHTML = "";

  const snap = await getDocs(collection(db, "acessos"));

  snap.forEach(d => {
    const a = d.data();
    lista.innerHTML += `
      <div class="card">
        ${a.disciplina} | ${a.senha}
        <button onclick="apagarAcesso('${d.id}')">Apagar</button>
      </div>
    `;
  });
}

async function apagarAcesso(id) {
  await deleteDoc(doc(db, "acessos", id));
  carregarAcessos();
}

// LOGIN PROFESSOR
async function entrarProfessor() {
  const disciplina = document.getElementById("loginDisciplina").value;
  const senha = document.getElementById("loginSenha").value;

  const snap = await getDocs(collection(db, "acessos"));

  let acesso = null;

  snap.forEach(d => {
    const a = d.data();
    if (a.disciplina === disciplina && a.senha === senha) {
      acesso = a;
    }
  });

  if (acesso) {
    window.open(acesso.link, "_blank");
  } else {
    alert("Acesso negado");
  }
}

// PUBLICAÇÕES
async function criarPublicacao() {
  const titulo = document.getElementById("pubTitulo").value;
  const texto = document.getElementById("pubTexto").value;

  await addDoc(collection(db, "publicacoes"), { titulo, texto });

  carregarPublicacoes();
}

async function carregarPublicacoes() {
  const feed = document.getElementById("feed");
  const lista = document.getElementById("listaPublicacoes");

  feed.innerHTML = "";
  lista.innerHTML = "";

  const snap = await getDocs(collection(db, "publicacoes"));

  snap.forEach(d => {
    const p = d.data();

    feed.innerHTML += `<div class="card"><b>${p.titulo}</b><p>${p.texto}</p></div>`;

    lista.innerHTML += `
      <div class="card">
        ${p.titulo}
        <button onclick="apagarPublicacao('${d.id}')">Apagar</button>
      </div>
    `;
  });
}

async function apagarPublicacao(id) {
  await deleteDoc(doc(db, "publicacoes", id));
  carregarPublicacoes();
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
  carregarPublicacoes();
  carregarAcessos();
});

// EXPORT
window.mostrar = mostrar;
window.gerarSenha = gerarSenha;
window.criarAcesso = criarAcesso;
window.apagarAcesso = apagarAcesso;
window.entrarProfessor = entrarProfessor;
window.criarPublicacao = criarPublicacao;
window.apagarPublicacao = apagarPublicacao;
window.toggleSistema = toggleSistema;
