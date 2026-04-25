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

// CONFIG
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "sac-escolar.firebaseapp.com",
  projectId: "sac-escolar"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// NAV
function mostrar(id) {
  document.querySelectorAll(".pagina").forEach(p => p.classList.remove("ativa"));
  document.getElementById(id).classList.add("ativa");
}

// GERAR SENHA
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

  atualizarDashboard();
}

// ACESSOS
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

  carregarAcessos();
  atualizarDashboard();
}

async function carregarAcessos() {
  const lista = document.getElementById("listaAcessos");
  lista.innerHTML = "";

  const snap = await getDocs(collection(db, "acessos"));

  snap.forEach(d => {
    const a = d.data();

    lista.innerHTML += `
      <div class="card">
        ${a.professor} - ${a.disciplina}<br>
        Senha: ${a.senha}<br>
        <a href="${a.link}" target="_blank">Abrir Excel</a><br>
        <button onclick="apagarAcesso('${d.id}')">Apagar</button>
      </div>
    `;
  });
}

async function apagarAcesso(id) {
  await deleteDoc(doc(db, "acessos", id));
  carregarAcessos();
  atualizarDashboard();
}

// LOGIN PROFESSOR
async function entrarProfessor() {
  const disciplina = document.getElementById("loginDisciplina").value;
  const senha = document.getElementById("loginSenha").value;

  const ref = doc(db, "config", "system");
  const snapSys = await getDoc(ref);

  if (snapSys.exists() && !snapSys.data().ativo) {
    alert("Sistema desligado");
    return;
  }

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
    alert("Dados incorretos");
  }
}

// PUBLICAÇÕES
async function criarPublicacao() {
  const titulo = document.getElementById("pubTitulo").value;
  const texto = document.getElementById("pubTexto").value;

  await addDoc(collection(db, "publicacoes"), { titulo, texto });

  carregarPublicacoes();
  atualizarDashboard();
}

async function carregarPublicacoes() {
  const lista = document.getElementById("listaPublicacoes");
  lista.innerHTML = "";

  const snap = await getDocs(collection(db, "publicacoes"));

  snap.forEach(d => {
    const p = d.data();

    lista.innerHTML += `
      <div class="card">
        <b>${p.titulo}</b>
        <p>${p.texto}</p>
        <button onclick="apagarPublicacao('${d.id}')">Apagar</button>
      </div>
    `;
  });
}

async function apagarPublicacao(id) {
  await deleteDoc(doc(db, "publicacoes", id));
  carregarPublicacoes();
}

// DASHBOARD
async function atualizarDashboard() {
  const acessos = await getDocs(collection(db, "acessos"));
  document.getElementById("totalAcessos").innerText = acessos.size;

  const pubs = await getDocs(collection(db, "publicacoes"));
  document.getElementById("totalPublicacoes").innerText = pubs.size;

  const ref = doc(db, "config", "system");
  const snap = await getDoc(ref);

  document.getElementById("estadoSistema").innerText =
    snap.exists() && snap.data().ativo ? "ATIVO" : "DESLIGADO";
}

// INIT
document.addEventListener("DOMContentLoaded", () => {
  carregarAcessos();
  carregarPublicacoes();
  atualizarDashboard();
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
