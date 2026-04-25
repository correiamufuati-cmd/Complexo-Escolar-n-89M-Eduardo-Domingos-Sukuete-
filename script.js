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

// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "SUA_KEY",
  authDomain: "sac-escolar.firebaseapp.com",
  projectId: "sac-escolar"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= NAV =================
function mostrar(id) {
  document.querySelectorAll(".pagina").forEach(p => p.classList.remove("ativa"));
  document.getElementById(id).classList.add("ativa");
}

// ================= SISTEMA ON/OFF =================
async function getSistema() {
  const ref = doc(db, "config", "system");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().ativo : true;
}

async function toggleSistema() {
  const ref = doc(db, "config", "system");
  const snap = await getDoc(ref);

  const estado = snap.exists() ? !snap.data().ativo : false;

  await setDoc(ref, { ativo: estado });

  alert("Sistema: " + (estado ? "ATIVO" : "DESLIGADO"));
}

// ================= ADMIN: ACESSOS PROFESSORES =================
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

// ================= PROFESSOR LOGIN =================
async function entrarProfessor() {

  if (!(await getSistema())) {
    alert("Sistema desligado pelo administrador");
    return;
  }

  const disciplina = document.getElementById("loginDisciplina").value;
  const senha = document.getElementById("loginSenha").value;

  const snap = await getDocs(collection(db, "acessos"));

  let acesso = null;

  snap.forEach(d => {
    const data = d.data();
    if (data.disciplina === disciplina && data.senha === senha) {
      acesso = data;
    }
  });

  if (acesso) {
    window.open(acesso.link, "_blank");
  } else {
    alert("Acesso negado");
  }
}

// ================= PUBLICAÇÕES =================
async function criarPublicacao() {
  const titulo = document.getElementById("pubTitulo").value;
  const texto = document.getElementById("pubTexto").value;

  await addDoc(collection(db, "publicacoes"), {
    titulo,
    texto,
    data: new Date()
  });

  carregarPublicacoes();
}

async function apagarPublicacao(id) {
  await deleteDoc(doc(db, "publicacoes", id));
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

    feed.innerHTML += `
      <div class="card">
        <h3>${p.titulo}</h3>
        <p>${p.texto}</p>
      </div>
    `;

    lista.innerHTML += `
      <div class="card">
        <b>${p.titulo}</b>
        <p>${p.texto}</p>
        <button onclick="apagarPublicacao('${d.id}')">Apagar</button>
      </div>
    `;
  });
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", carregarPublicacoes);

// ================= EXPORT =================
window.mostrar = mostrar;
window.criarAcesso = criarAcesso;
window.entrarProfessor = entrarProfessor;
window.criarPublicacao = criarPublicacao;
window.apagarPublicacao = apagarPublicacao;
window.toggleSistema = toggleSistema;
