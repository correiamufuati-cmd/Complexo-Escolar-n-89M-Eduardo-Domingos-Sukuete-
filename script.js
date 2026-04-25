import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// ================= SISTEMA =================
async function toggleSistema() {
  const ref = doc(db, "config", "system");
  const snap = await getDoc(ref);

  const estado = snap.exists() ? !snap.data().sistemaAtivo : false;

  await setDoc(ref, { sistemaAtivo: estado });

  alert("Sistema: " + (estado ? "ATIVO" : "DESLIGADO"));
}

async function sistemaAtivo() {
  const ref = doc(db, "config", "system");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().sistemaAtivo : true;
}

// ================= PROFESSOR =================
async function entrarProfessor() {

  if (!(await sistemaAtivo())) {
    alert("Sistema desligado");
    return;
  }

  alert("Acesso do professor validado (ligar Excel aqui)");
}

// ================= PUBLICAÇÕES =================
async function criarPublicacao() {
  const titulo = document.getElementById("pubTitulo").value;
  const texto = document.getElementById("pubTexto").value;

  await addDoc(collection(db, "publicacoes"), { titulo, texto });

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

    feed.innerHTML += `<div class="card"><b>${p.titulo}</b><p>${p.texto}</p></div>`;

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
window.criarPublicacao = criarPublicacao;
window.apagarPublicacao = apagarPublicacao;
window.toggleSistema = toggleSistema;
window.entrarProfessor = entrarProfessor;
