import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= FIREBASE =================
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "sac-escolar.firebaseapp.com",
  projectId: "sac-escolar"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================= NAVEGAÇÃO =================
function mostrar(id) {
  document.querySelectorAll(".pagina").forEach(p => p.classList.remove("ativa"));

  const sec = document.getElementById(id);
  if (sec) sec.classList.add("ativa");
}

// ================= ADMIN: CRIAR ACESSO =================
async function criarAcesso() {
  const professor = document.getElementById("professor").value;
  const disciplina = document.getElementById("disciplina").value;
  const senha = document.getElementById("senhaAcesso").value;
  const link = document.getElementById("linkExcel").value;

  if (!professor || !disciplina || !senha || !link) {
    alert("Preenche tudo!");
    return;
  }

  try {
    await addDoc(collection(db, "acessos"), {
      professor,
      disciplina,
      senha,
      link
    });

    alert("Acesso criado!");
  } catch (e) {
    console.error(e);
    alert("Erro ao criar acesso");
  }
}

// ================= PROFESSOR LOGIN =================
async function entrarProfessor() {
  const disciplina = document.getElementById("loginDisciplina").value;
  const senha = document.getElementById("loginSenha").value;

  const snap = await getDocs(collection(db, "acessos"));

  let acesso = null;

  snap.forEach(doc => {
    const d = doc.data();

    if (d.disciplina === disciplina && d.senha === senha) {
      acesso = d;
    }
  });

  if (acesso) {
    alert("Acesso permitido!");
    window.open(acesso.link, "_blank");
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
  const feed = document.getElementById("feed");
  const lista = document.getElementById("listaPublicacoes");

  feed.innerHTML = "";
  lista.innerHTML = "";

  const snap = await getDocs(collection(db, "publicacoes"));

  snap.forEach(doc => {
    const p = doc.data();

    feed.innerHTML += `<p><b>${p.titulo}</b>: ${p.texto}</p>`;
    lista.innerHTML += `<p><b>${p.titulo}</b>: ${p.texto}</p>`;
  });
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  carregarPublicacoes();
});

// ================= EXPORT =================
window.mostrar = mostrar;
window.criarAcesso = criarAcesso;
window.entrarProfessor = entrarProfessor;
window.criarPublicacao = criarPublicacao;
