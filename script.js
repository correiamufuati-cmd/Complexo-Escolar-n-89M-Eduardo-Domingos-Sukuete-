import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, setDoc, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js";

const firebaseConfig = {
  apiKey: "AIzaSyC0NRCbPalAC3Yrfpc8qYdJVU6DxuEOyTw",
  authDomain: "sac-escolar.firebaseapp.com",
  projectId: "sac-escolar",
  storageBucket: "sac-escolar.firebasestorage.app",
  messagingSenderId: "507793955855",
  appId: "1:507793955855:web:405579f5e01b3f90cc577a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variáveis
let adminPassword = "Admin123";
let sistemaAberto = false;

// NAVEGAÇÃO
function mostrar(id){
  document.querySelectorAll('section').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
window.mostrar = mostrar;

// LOGIN ADMIN
function entrarAdmin(){
  const senha = document.getElementById('adminSenha').value;
  if(senha === adminPassword){
    mostrar('adminPainel');
    carregarPublicacoesAdmin();
    carregarLogotipo();
  } else alert('Senha incorreta');
}
window.entrarAdmin = entrarAdmin;

// SISTEMA
function toggleSistema(){
  sistemaAberto = !sistemaAberto;
  document.getElementById('estadoSistema').innerText = sistemaAberto ? 'Aberto' : 'Fechado';
}
window.toggleSistema = toggleSistema;

// LOGOTIPO
const logoInput = document.getElementById('logoUpload');
const logoImg = document.getElementById('logo');
logoInput.addEventListener('change', async e=>{
  const file = e.target.files[0];
  if(!file) return alert('Selecione uma imagem');
  const reader = new FileReader();
  reader.onload = async () => {
    await setDoc(doc(db,'config','logo'), { base64: reader.result });
    logoImg.src = reader.result;
    logoImg.style.display='block';
    alert('Logotipo salvo!');
  };
  reader.readAsDataURL(file);
});
async function carregarLogotipo(){
  const data = await getDoc(doc(db,'config','logo'));
  if(data.exists()){
    logoImg.src = data.data().base64;
    logoImg.style.display='block';
  }
}

// PUBLICAÇÕES
async function adicionarPublicacao(admin){
  let titulo = admin ? document.getElementById('publicacaoTitulo').value.trim() : document.getElementById('publicacaoTituloUsuario').value.trim();
  let texto = admin ? document.getElementById('publicacaoTexto').value.trim() : document.getElementById('publicacaoTextoUsuario').value.trim();
  if(!titulo || !texto) return alert('Preencha título e mensagem');

  await addDoc(collection(db,'publicacoes'), { titulo, texto, timestamp: Date.now() });

  alert('Publicação adicionada!');
  if(admin){ document.getElementById('publicacaoTitulo').value=''; document.getElementById('publicacaoTexto').value=''; }
  else { document.getElementById('publicacaoTituloUsuario').value=''; document.getElementById('publicacaoTextoUsuario').value=''; }

  carregarPublicacoesInicio();
  carregarPublicacoesAdmin();
}
window.adicionarPublicacao = adicionarPublicacao;

async function carregarPublicacoesInicio(){
  const container = document.getElementById('publicacoesInicio');
  container.innerHTML='';
  const snap = await getDocs(collection(db,'publicacoes'));
  snap.forEach(docSnap=>{
    const data = docSnap.data();
    const div = document.createElement('div');
    div.className='publicacao-item';
    div.innerHTML = `<strong>${data.titulo}</strong><p>${data.texto}</p>`;
    container.appendChild(div);
  });
}

async function carregarPublicacoesAdmin(){
  const lista = document.getElementById('listaPublicacoes');
  lista.innerHTML='';
  const snap = await getDocs(collection(db,'publicacoes'));
  snap.forEach(docSnap=>{
    const data = docSnap.data();
    const li = document.createElement('li');
    li.innerHTML=`<strong>${data.titulo}</strong> - ${data.texto} 
      <button class="delete-btn" onclick="removerPublicacao('${docSnap.id}')">Remover</button>`;
    lista.appendChild(li);
  });
}
window.removerPublicacao = async function(id){
  if(!confirm('Remover publicação?')) return;
  await deleteDoc(doc(db,'publicacoes',id));
  carregarPublicacoesInicio();
  carregarPublicacoesAdmin();
}

// REGISTAR PAUTA EXCEL
async function registarPauta(){
  alert("Registar foi clicado");
  const input = document.getElementById('excelUpload');
  const file = input.files[0];
  if(!file) return alert('Selecione um ficheiro Excel');
  const reader = new FileReader();
  reader.onload = async e => {
    const data = new Uint8Array(e.target.result);
    const wb = XLSX.read(data,{type:'array'});
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws,{header:1});
    const classe = document.getElementById('classeNome').value.trim();
    if(!classe) return alert('Preencha a classe');
    await setDoc(doc(db,'pautas',classe), { dados: json, timestamp: Date.now() });
    alert('Pauta registada com sucesso!');
    input.value='';
  };
  reader.readAsArrayBuffer(file);
}
window.registarPauta = registarPauta;
