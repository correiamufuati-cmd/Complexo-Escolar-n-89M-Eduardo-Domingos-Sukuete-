// ================== script.js ==================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, setDoc, getDocs, doc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ====== Inicializar Firebase ======
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

// ====== Variáveis globais ======
let sistemaAberto = false;

// ====== Funções de Menu ======
function mostrar(id) {
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  const sec = document.getElementById(id);
  if(sec) sec.classList.add('active');
}

// ====== Admin ======
function entrarAdmin() {
  const senha = document.getElementById("adminSenha").value;
  if (senha === "Admin123") {
    mostrar('adminPainel');
    alert("Bem-vindo, administrador!");
  } else {
    alert("Senha incorreta!");
  }
}

function toggleSistema() {
  sistemaAberto = !sistemaAberto;
  document.getElementById("estadoSistema").innerText = sistemaAberto ? "Aberto" : "Fechado";
  alert(`Sistema agora ${sistemaAberto ? "Aberto" : "Fechado"}`);
}

// ====== Registrar Pauta ======
async function registarPauta() {
  const classe = document.getElementById("classeNome").value.trim();
  const senha = document.getElementById("senhaClasse").value.trim();
  const arquivo = document.getElementById("excelUpload").files[0];

  if (!classe || !senha || !arquivo) {
    alert("Preencha todos os campos e selecione um arquivo Excel.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Converter Excel para array de objetos simples
      const dados = XLSX.utils.sheet_to_json(worksheet); 

      // Salvar no Firestore
      await setDoc(doc(db, "pautas", classe), { senha: senha, dados: dados });
      alert(`Pauta da classe ${classe} registrada com sucesso!`);

      // Limpar campos
      document.getElementById("excelUpload").value = "";
      document.getElementById("classeNome").value = "";
      document.getElementById("senhaClasse").value = "";

      // Atualizar select de classes
      carregarClasses();

    } catch (err) {
      alert("Erro ao registrar a pauta: " + err.message);
      console.error(err);
    }
  };

  reader.readAsArrayBuffer(arquivo);
}

// ====== Publicações ======
async function adicionarPublicacao(isAdmin) {
  const titulo = isAdmin ? document.getElementById("publicacaoTitulo").value : document.getElementById("publicacaoTituloUsuario").value;
  const texto = isAdmin ? document.getElementById("publicacaoTexto").value : document.getElementById("publicacaoTextoUsuario").value;

  if (!titulo || !texto) {
    alert("Preencha título e texto da publicação.");
    return;
  }

  try {
    await addDoc(collection(db, "publicacoes"), { titulo, texto, data: new Date() });
    alert("Publicação criada!");
    carregarPublicacoes();
  } catch (err) {
    alert("Erro ao criar publicação.");
    console.error(err);
  }
}

// ====== Carregar Publicações ======
async function carregarPublicacoes() {
  const containerInicio = document.getElementById("publicacoesInicio");
  const containerAdmin = document.getElementById("listaPublicacoes");
  const containerPublico = document.getElementById("publicacoesContainer");

  containerInicio.innerHTML = "";
  containerAdmin.innerHTML = "";
  if(containerPublico) containerPublico.innerHTML = "";

  const snap = await getDocs(collection(db, "publicacoes"));
  snap.forEach(d => {
    const pub = d.data();
    // Início
    containerInicio.innerHTML += `<div class="card"><h4>${pub.titulo}</h4><p>${pub.texto}</p></div>`;
    // Admin
    containerAdmin.innerHTML += `<li>${pub.titulo} <button onclick="apagarPublicacao('${d.id}')">Eliminar</button></li>`;
    // Público
    if(containerPublico) containerPublico.innerHTML += `<div class="card"><h4>${pub.titulo}</h4><p>${pub.texto}</p></div>`;
  });
}

// ====== Apagar Publicação ======
async function apagarPublicacao(id) {
  await deleteDoc(doc(db, "publicacoes", id));
  carregarPublicacoes();
}

// ====== Renderizar Tabela de Notas ======
function renderizarTabelaNotas(dados) {
  const container = document.getElementById("tabelaContainer");
  container.innerHTML = "";

  if (!dados || dados.length === 0) {
    container.innerHTML = "<p>Nenhuma nota encontrada.</p>";
    return;
  }

  let html = "<table><tr>";
  // Cabeçalho
  Object.keys(dados[0]).forEach(key => html += `<th>${key}</th>`);
  html += "</tr>";

  // Linhas
  dados.forEach(row => {
    html += "<tr>";
    Object.values(row).forEach(val => html += `<td contenteditable>${val}</td>`);
    html += "</tr>";
  });

  html += "</table>";
  container.innerHTML = html;
}

// ====== Carregar Classes ======
async function carregarClasses() {
  const select = document.getElementById("classeSelect");
  select.innerHTML = "";
  const snap = await getDocs(collection(db, "pautas"));
  snap.forEach(docItem => {
    const option = document.createElement("option");
    option.value = docItem.id;
    option.textContent = docItem.id;
    select.appendChild(option);
  });
}

// ====== Entrar no Lançamento ======
async function acessarPauta() {
  const classe = document.getElementById("classeSelect").value;
  const senha = document.getElementById("senhaProfessor").value.trim();

  if (!classe || !senha) {
    alert("Selecione a classe e preencha a senha!");
    return;
  }

  try {
    const docRef = doc(db, "pautas", classe);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      alert("Classe não encontrada!");
      return;
    }

    const dados = docSnap.data();
    if (dados.senha !== senha) {
      alert("Senha incorreta!");
      return;
    }

    document.getElementById("areaNotas").style.display = "block";
    const planilhaSelect = document.getElementById("planilhaSelect");
    planilhaSelect.innerHTML = "<option value='principal'>Principal</option>";

    renderizarTabelaNotas(dados.dados);

  } catch (err) {
    alert("Erro ao acessar a pauta: " + err.message);
    console.error(err);
  }
}

// ====== Inicialização ======
document.addEventListener("DOMContentLoaded", () => {
  carregarPublicacoes();
  carregarClasses();

  const btnEntrar = document.getElementById("btnEntrarLancamento");
  if(btnEntrar) btnEntrar.addEventListener("click", acessarPauta);
});

// ====== Tornar funções acessíveis ao HTML ======
window.mostrar = mostrar;
window.entrarAdmin = entrarAdmin;
window.toggleSistema = toggleSistema;
window.registarPauta = registarPauta;
window.adicionarPublicacao = adicionarPublicacao;
window.carregarPublicacoes = carregarPublicacoes;
window.apagarPublicacao = apagarPublicacao;
window.acessarPauta = acessarPauta;
