import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, setDoc,
  getDocs, doc, getDoc, deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js";

/* ================= FIREBASE ================= */

const firebaseConfig = {
  apiKey: "AIzaSyC0NRCbPalAC3Yrfpc8qYdJVU6DxuEOyTw",
  authDomain: "sac-escolar.firebaseapp.com",
  projectId: "sac-escolar",
  storageBucket: "sac-escolar.appspot.com",
  messagingSenderId: "507793955855",
  appId: "1:507793955855:web:405579f5e01b3f90cc577a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= MENU ================= */

function mostrar(id) {
  document.querySelectorAll("section").forEach(sec => {
    sec.classList.remove("active");
  });

  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

/* ================= LOGOTIPO ================= */

function carregarLogo(event) {
  const reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById("logoImg").src = e.target.result;
  };
  reader.readAsDataURL(event.target.files[0]);
}

/* ================= REGISTRAR PAUTA ================= */

async function registarPauta() {
  const classe = document.getElementById("classeNome").value.trim();
  const senha = document.getElementById("senhaClasse").value.trim();
  const arquivo = document.getElementById("excelUpload").files[0];

  if (!classe || !senha || !arquivo) {
    alert("Preencha todos os campos.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result.split(",")[1];

    await setDoc(doc(db, "pautas", classe), {
      senha,
      arquivo: base64
    });

    alert("Pauta registrada com sucesso!");
    carregarClassesProfessor();
  };

  reader.readAsDataURL(arquivo);
}

/* ================= PROFESSOR ================= */

async function carregarClassesProfessor() {
  const select = document.getElementById("classeProfessor");
  if (!select) return;

  select.innerHTML = "";

  const snap = await getDocs(collection(db, "pautas"));
  snap.forEach(d => {
    select.innerHTML += `<option value="${d.id}">${d.id}</option>`;
  });
}

async function acessarPauta() {
  const classe = document.getElementById("classeProfessor").value.trim();
  const senha = document.getElementById("senhaProfessor").value.trim();

  if (!classe || !senha) {
    alert("Preencha classe e senha.");
    return;
  }

  const docSnap = await getDoc(doc(db, "pautas", classe));

  if (!docSnap.exists()) {
    alert("Classe não encontrada.");
    return;
  }

  const dados = docSnap.data();

  if (dados.senha !== senha) {
    alert("Senha incorreta!");
    return;
  }

  document.getElementById("areaNotas").style.display = "block";

  const workbook = XLSX.read(dados.arquivo, { type: "base64" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  let html = XLSX.utils.sheet_to_html(sheet);
  html = html.replace(/style="[^"]*"/g, "");

  document.getElementById("tabelaContainer").innerHTML = html;

  document.querySelectorAll("#tabelaContainer td").forEach(td => {
    td.contentEditable = true;
  });
}

/* ================= PUBLICAÇÕES ================= */

async function adicionarPublicacao() {
  const titulo = document.getElementById("tituloPub").value;
  const texto = document.getElementById("textoPub").value;

  if (!titulo || !texto) {
    alert("Preencha título e texto.");
    return;
  }

  await addDoc(collection(db, "publicacoes"), {
    titulo,
    texto,
    data: new Date()
  });

  alert("Publicação adicionada!");
  carregarPublicacoes();
}

async function carregarPublicacoes() {
  const container = document.getElementById("listaPublicacoes");
  if (!container) return;

  container.innerHTML = "";

  const snap = await getDocs(collection(db, "publicacoes"));
  snap.forEach(docSnap => {
    const pub = docSnap.data();
    container.innerHTML += `
      <div class="card">
        <h4>${pub.titulo}</h4>
        <p>${pub.texto}</p>
      </div>
    `;
  });
}

/* ================= ESTATÍSTICA ================= */

function carregarEstatistica() {
  document.getElementById("estatisticaConteudo").innerHTML =
    "<p>Estatísticas serão implementadas aqui.</p>";
}

/* ================= INICIALIZAÇÃO ================= */

window.onload = () => {
  carregarClassesProfessor();
  carregarPublicacoes();
};

/* ================= EXPORTAR FUNÇÕES ================= */

window.mostrar = mostrar;
window.registarPauta = registarPauta;
window.acessarPauta = acessarPauta;
window.adicionarPublicacao = adicionarPublicacao;
window.carregarLogo = carregarLogo;
window.carregarEstatistica = carregarEstatistica;
