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

// === NAVEGAÇÃO ===
function mostrar(id) {
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
window.mostrar = mostrar;

// === LOGO E PUBLICAÇÕES ===
const logoInput = document.getElementById('logoUpload');
const logoImg = document.getElementById('logo');
const publicacoesInicio = document.getElementById('publicacoesInicio');

window.addEventListener('load', async () => {
  const logoData = await getDoc(doc(db, 'config', 'logo'));
  if (logoData.exists()) {
    logoImg.src = logoData.data().url;
    logoImg.style.display = 'block';
  }
  carregarPublicacoesInicio();
  carregarClasses();
});

logoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return alert('Selecione uma imagem');
  const logoRef = ref(storage, 'logo/' + file.name);
  await uploadBytes(logoRef, file);
  const url = await getDownloadURL(logoRef);
  await setDoc(doc(db, 'config', 'logo'), { url });
  logoImg.src = url;
  logoImg.style.display = 'block';
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

async function carregarPublicacoesInicio() {
  publicacoesInicio.innerHTML = '';
  const snapshot = await getDocs(collection(db, 'publicacoes'));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const div = document.createElement('div');
    div.className = 'publicacao-item';
    div.innerHTML = `<strong>${data.titulo}</strong><p>${data.texto}</p>${data.arquivoURL ? `<a href="${data.arquivoURL}" target="_blank">Arquivo</a>` : ""}`;
    publicacoesInicio.appendChild(div);
  });
}

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

window.removerPublicacao = async function (id) {
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

// === PAUTAS / LANÇAMENTO DE NOTAS ===
window.carregarClasses = async function () {
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

window.acessarPauta = async function () {
  if (!sistemaAberto) { alert('Sistema fechado!'); return; }
  const classe = document.getElementById('classeProfessor').value;
  const senha = document.getElementById('senhaProfessor').value;
  const docRef = doc(db, 'pautas', classe);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) { alert('Classe não encontrada'); return; }
  if (docSnap.data().senha !== senha) { alert('Senha incorreta'); return; }
  window.pautaAtual = docSnap.data().dados;
  renderTabela();
  document.getElementById('areaNotas').style.display = 'block';
}

function renderTabela() {
  const container = document.getElementById('tabelaContainer');
  const dados = window.pautaAtual;
  let html = '<table>';
  dados.forEach((linha, i) => {
    html += '<tr>';
    linha.forEach((celula, j) => {
      if (i === 0) html += `<th>${celula}</th>`;
      else html += `<td contenteditable oninput="editarCelula(${i},${j},this.innerText)">${celula || ''}</td>`;
    });
    html += '</tr>';
  });
  html += '</table>';
  container.innerHTML = html;
}

window.editarCelula = function (i, j, valor) { window.pautaAtual[i][j] = valor; }

window.confirmarGuardar = async function () {
  const classe = document.getElementById('classeProfessor').value;
  const senhaClasse = (await getDoc(doc(db, 'pautas', classe))).data().senha;
  await setDoc(doc(db, 'pautas', classe), { senha: senhaClasse, dados: window.pautaAtual });
  alert('Pauta guardada com sucesso!');
}

window.registarPauta = async function () {
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
    await setDoc(doc(db, 'pautas', classe), { senha: senha, dados: sheet });
    alert('Pauta registrada com sucesso!');
    carregarClasses();
    fileInput.value = '';
  }
  reader.readAsArrayBuffer(file);
}

// === GERAR PDF SIMPLES ===
window.gerarPDF = async function () {
  const classe = document.getElementById('classeProfessor').value;
  if (!classe) return alert('Selecione uma classe primeiro!');
  const docRef = doc(db, 'pautas', classe);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return alert('Classe não encontrada');
  const dados = docSnap.data().dados;
  if (!dados || dados.length < 2) return alert('Não há notas lançadas');

  const { jsPDF } = window.jspdf;
  const docPDF = new jsPDF();
  docPDF.setFontSize(16);
  docPDF.text(`Resultados Finais - ${classe}`, 14, 20);
  docPDF.setFontSize(12);
  let startY = 30;
  const rowHeight = 8;

  dados[0].forEach((header, i) => { docPDF.text(String(header), 14 + i * 40, startY); });
  dados.slice(1).forEach((linha, j) => { linha.forEach((cel, i) => { docPDF.text(String(cel || ''), 14 + i * 40, startY + (j + 1) * rowHeight); }); });
  docPDF.save(`${classe}_Resultados.pdf`);
}

// === GERAR PDF AVANÇADO COM ESTATÍSTICAS ===
window.gerarPDFAvancado = async function () {
  const classe = document.getElementById('classeProfessor').value;
  if (!classe) return alert('Selecione uma classe primeiro!');
  const docRef = doc(db, 'pautas', classe);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return alert('Classe não encontrada');
  const dados = docSnap.data().dados;
  if (!dados || dados.length < 2) return alert('Não há notas lançadas');

  const { jsPDF } = window.jspdf;
  const docPDF = new jsPDF('p', 'mm', 'a4');
  const margin = 14;
  let startY = 20;
  const rowHeight = 8;
  const colWidth = 40;

  if (logoImg.src) docPDF.addImage(logoImg.src, 'PNG', margin, startY, 30, 30);
  docPDF.setFontSize(18);
  docPDF.text(`Resultados Finais - ${classe}`, margin + 40, startY + 15);
  startY += 40;

  // Cabeçalho da tabela
  docPDF.setFontSize(12);
  docPDF.setFillColor(60, 130, 200);
  docPDF.setTextColor(255, 255, 255);
  dados[0].forEach((header, i) => {
    docPDF.rect(margin + i * colWidth, startY, colWidth, rowHeight, 'F');
    docPDF.text(String(header), margin + i * colWidth + 2, startY + 6);
  });

  docPDF.setTextColor(0, 0, 0);
  // Dados da tabela
  dados.slice(1).forEach((linha, j) => {
    linha.forEach((cel, i) => {
      docPDF.text(String(cel || ''), margin + i * colWidth + 2, startY + (j + 1) * rowHeight + 6);
    });
  });

  // Estatísticas simples: Média da primeira nota (assumindo coluna 1)
  const notas = dados.slice(1).map(l => parseFloat(l[1])).filter(n => !isNaN(n));
  const media = notas.reduce((a, b) => a + b, 0) / notas.length;
  docPDF.setFontSize(12);
  docPDF.text(`Média da primeira nota: ${media.toFixed(2)}`, margin, startY + (dados.length + 2) * rowHeight);

  docPDF.save(`${classe}_Resultados_Estatisticas.pdf`);
        }

// Expor funções para os botões do HTML
window.entrarAdmin = entrarAdmin;
window.adicionarPublicacao = adicionarPublicacao;
window.toggleSistema = toggleSistema;
window.acessarPauta = acessarPauta;
window.confirmarGuardar = confirmarGuardar;
window.registarPauta = registarPauta;
window.gerarPDF = gerarPDF;
window.gerarPDFAvancado = gerarPDFAvancado;
window.removerPublicacao = removerPublicacao;
window.mostrar = mostrar;
