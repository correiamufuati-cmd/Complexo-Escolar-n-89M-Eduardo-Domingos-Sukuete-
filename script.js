// === FIREBASE ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC0NRCbPalAC3Yrfpc8qYdJVU6DxuEOyTw",
  authDomain: "sac-escolar.firebaseapp.com",
  projectId: "sac-escolar",
  storageBucket: "sac-escolar.firebasestorage.app",
  messagingSenderId: "507793955855",
  appId: "1:507793955855:web:405579f5e01b3f90cc577a",
  measurementId: "G-5TWFNGZMBQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// === VARIÁVEIS ===
let adminPassword = "Admin123";
let pautas = {};
let workbookAtual = null;
let planilhaAtual = '';
let sistemaAberto = false;
let pautaAtual = null;

// === NAVEGAÇÃO ===
function mostrar(id) {
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// === LOGO E PUBLICAÇÕES ===
const logoInput = document.getElementById('logoUpload');
const logoImg = document.getElementById('logo');
const publicacoesInicio = document.getElementById('publicacoesInicio');

window.addEventListener('load', async () => {
  // Carrega logotipo
  const logoData = await getDoc(doc(db, 'config', 'logo'));
  if (logoData.exists()) {
    logoImg.src = logoData.data().url;
    logoImg.style.display = 'block';
    publicacoesInicio.prepend(logoImg);
  }

  carregarPublicacoesInicio();
  carregarClasses();
});

// Upload do logotipo
logoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return alert('Selecione uma imagem');
  const logoRef = ref(storage, 'logo/' + file.name);
  await uploadBytes(logoRef, file);
  const url = await getDownloadURL(logoRef);
  await setDoc(doc(db, 'config', 'logo'), { url });
  logoImg.src = url;
  logoImg.style.display = 'block';
  publicacoesInicio.prepend(logoImg);
  alert('Logotipo carregado e salvo!');
});

// === PUBLICAÇÕES ===
async function adicionarPublicacao(admin) {
  let titulo = admin ? document.getElementById('publicacaoTitulo').value.trim() : document.getElementById('publicacaoTituloUsuario').value.trim();
  let texto = admin ? document.getElementById('publicacaoTexto').value.trim() : document.getElementById('publicacaoTextoUsuario').value.trim();
  let arquivo = admin ? document.getElementById('publicacaoFile').files[0] : document.getElementById('publicacaoFileUsuario').files[0];

  if (!titulo || !texto) return alert('Preencha título e mensagem');

  let arquivoURL = '';
  if (arquivo) {
    const fileRef = ref(storage, 'publicacoes/' + arquivo.name);
    await uploadBytes(fileRef, arquivo);
    arquivoURL = await getDownloadURL(fileRef);
  }

  await addDoc(collection(db, 'publicacoes'), {
    titulo,
    texto,
    arquivoURL,
    timestamp: Date.now()
  });

  alert('Publicação adicionada!');

  // Limpar inputs
  if (admin) {
    document.getElementById('publicacaoTitulo').value = '';
    document.getElementById('publicacaoTexto').value = '';
    document.getElementById('publicacaoFile').value = '';
  } else {
    document.getElementById('publicacaoTituloUsuario').value = '';
    document.getElementById('publicacaoTextoUsuario').value = '';
    document.getElementById('publicacaoFileUsuario').value = '';
  }

  carregarPublicacoesInicio();
  carregarPublicacoesAdmin();
}

// Carregar publicações no início
async function carregarPublicacoesInicio() {
  publicacoesInicio.innerHTML = '';
  const logoData = await getDoc(doc(db, 'config', 'logo'));
  if (logoData.exists()) publicacoesInicio.prepend(logoImg);

  const snapshot = await getDocs(collection(db, 'publicacoes'));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const div = document.createElement('div');
    div.className = 'publicacao-item';
    div.innerHTML = `<strong>${data.titulo}</strong><p>${data.texto}</p>${data.arquivoURL ? `<a href="${data.arquivoURL}" target="_blank">Arquivo</a>` : ""}`;
    publicacoesInicio.appendChild(div);
  });
}

// Carregar publicações no painel admin
async function carregarPublicacoesAdmin() {
  const lista = document.getElementById('listaPublicacoes');
  lista.innerHTML = '';
  const snapshot = await getDocs(collection(db, 'publicacoes'));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const li = document.createElement('li');
    li.innerHTML = `<strong>${data.titulo}</strong> - ${data.texto} ${data.arquivoURL ? `<a href="${data.arquivoURL}" target="_blank">Arquivo</a>` : ""} <button class="delete-btn" onclick="removerPublicacao('${docSnap.id}')">Remover</button>`;
    lista.appendChild(li);
  });
}

async function removerPublicacao(id) {
  if (!confirm('Remover publicação?')) return;
  await deleteDoc(doc(db, 'publicacoes', id));
  carregarPublicacoesInicio();
  carregarPublicacoesAdmin();
}

// === LOGIN ADMIN ===
function entrarAdmin() {
  if (document.getElementById('adminSenha').value === adminPassword) {
    mostrar('adminPainel');
    carregarPublicacoesAdmin();
  } else alert('Senha incorreta');
}

// === SISTEMA ===
function toggleSistema() {
  sistemaAberto = !sistemaAberto;
  document.getElementById('estadoSistema').innerText = sistemaAberto ? 'Aberto' : 'Fechado';
}

// === CLASSES / PAUTAS ===
async function carregarClasses() {
  const select = document.getElementById('classeProfessor');
  select.innerHTML = '';
  const snapshot = await getDocs(collection(db, 'pautas'));
  snapshot.forEach(docSnap => {
    const option = document.createElement('option');
    option.value = docSnap.id;
    option.innerText = docSnap.id;
    select.appendChild(option);
  });
}

async function acessarPauta() {
  if (!sistemaAberto) { alert('Sistema fechado!'); return; }
  const classe = document.getElementById('classeProfessor').value;
  const senha = document.getElementById('senhaProfessor').value;
  const docRef = doc(db, 'pautas', classe);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) { alert('Classe não encontrada'); return; }
  if (docSnap.data().senha !== senha) { alert('Senha incorreta'); return; }
  pautaAtual = docSnap.data().dados;
  renderTabela();
  document.getElementById('areaNotas').style.display = 'block';
}

function renderTabela() {
  const container = document.getElementById('tabelaContainer');
  let html = '<table>';
  pautaAtual.forEach((linha, i) => {
    html += '<tr>';
    linha.forEach((cel, j) => {
      if (i === 0) html += `<th>${cel}</th>`;
      else html += `<td contenteditable oninput="editarCelula(${i},${j},this.innerText)">${cel || ''}</td>`;
    });
    html += '</tr>';
  });
  html += '</table>';
  container.innerHTML = html;
}

function editarCelula(i, j, valor) { pautaAtual[i][j] = valor; }

async function confirmarGuardar() {
  const classe = document.getElementById('classeProfessor').value;
  const senhaClasse = (await getDoc(doc(db, 'pautas', classe))).data().senha;
  await setDoc(doc(db, 'pautas', classe), { senha: senhaClasse, dados: pautaAtual });
  alert('Pauta guardada com sucesso!');
}

// Registar pauta (Excel)
async function registarPauta() {
  const fileInput = document.getElementById('excelUpload');
  const file = fileInput.files[0];
  if (!file) return alert('Selecione um arquivo Excel');

  const reader = new FileReader();
  reader.onload = async function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    const classe = document.getElementById('classeNome').value.trim();
    const senha = document.getElementById('senhaClasse').value.trim();
    if (!classe || !senha) return alert('Preencha classe e senha');

    await setDoc(doc(db, 'pautas', classe), { senha, dados: sheet });
    alert('Pauta registrada com sucesso!');
    carregarClasses();
    fileInput.value = '';
  }
  reader.readAsArrayBuffer(file);
}

// === EXPOR FUNÇÕES AO WINDOW PARA BOTÕES ===
window.entrarAdmin = entrarAdmin;
window.adicionarPublicacao = adicionarPublicacao;
window.toggleSistema = toggleSistema;
window.acessarPauta = acessarPauta;
window.confirmarGuardar = confirmarGuardar;
window.registarPauta = registarPauta;
window.removerPublicacao = removerPublicacao;
window.mostrar = mostrar;
window.carregarClasses = carregarClasses;
