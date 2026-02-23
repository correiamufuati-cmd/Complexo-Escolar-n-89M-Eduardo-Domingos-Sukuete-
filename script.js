// ================= FIREBASE =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

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
const storage = getStorage(app);

// ================= VARIÁVEIS =================
let adminPassword = "Admin123";
let pautas = {};
let sistemaAberto = false;

// ================= FUNÇÕES DE NAVEGAÇÃO =================
function mostrar(id){
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
window.mostrar = mostrar;

// ================= LOGOTIPO =================
const logoInput = document.getElementById('logoUpload');
const logoImg = document.getElementById('logo');
const publicacoesInicio = document.getElementById('publicacoesInicio');

window.addEventListener('load', async () => {
  // Carrega logotipo
  try {
    const logoData = await getDoc(doc(db,'config','logo'));
    if(logoData.exists()){
      logoImg.src = logoData.data().url;
      logoImg.style.display='block';
    }
  } catch(err){
    console.error("Erro ao carregar logotipo:", err);
  }
  carregarPublicacoesInicio();
});

logoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if(!file) return alert('Selecione uma imagem');

  try {
    const logoRef = ref(storage,'logo/'+file.name);
    await uploadBytes(logoRef, file);
    const url = await getDownloadURL(logoRef);
    await setDoc(doc(db,'config','logo'), {url: url});
    logoImg.src = url;
    logoImg.style.display='block';
    alert('Logotipo carregado com sucesso!');
  } catch(err) {
    console.error("Erro ao carregar logotipo:", err);
    alert('Falha ao enviar logotipo');
  }
});

// ================= PUBLICAÇÕES =================
async function adicionarPublicacao(admin){
  let titulo, texto, arquivo;
  if(admin){
    titulo = document.getElementById('publicacaoTitulo').value.trim();
    texto = document.getElementById('publicacaoTexto').value.trim();
    arquivo = document.getElementById('publicacaoFile').files[0];
  } else {
    titulo = document.getElementById('publicacaoTituloUsuario').value.trim();
    texto = document.getElementById('publicacaoTextoUsuario').value.trim();
    arquivo = document.getElementById('publicacaoFileUsuario').files[0];
  }

  if(!titulo || !texto) return alert('Preencha título e mensagem');

  let arquivoURL='';
  try {
    if(arquivo){
      const fileRef = ref(storage,'publicacoes/'+arquivo.name);
      await uploadBytes(fileRef, arquivo);
      arquivoURL = await getDownloadURL(fileRef);
    }
    await addDoc(collection(db,'publicacoes'), {
      titulo,
      texto,
      arquivoURL,
      timestamp: Date.now()
    });
    alert('Publicação adicionada!');
  } catch(err){
    console.error("Erro ao publicar:", err);
    alert('Falha ao publicar');
    return;
  }

  // Limpar campos
  if(admin){
    document.getElementById('publicacaoTitulo').value='';
    document.getElementById('publicacaoTexto').value='';
    document.getElementById('publicacaoFile').value='';
  } else {
    document.getElementById('publicacaoTituloUsuario').value='';
    document.getElementById('publicacaoTextoUsuario').value='';
    document.getElementById('publicacaoFileUsuario').value='';
  }

  carregarPublicacoesInicio();
  carregarPublicacoesAdmin();
}

async function carregarPublicacoesInicio(){
  publicacoesInicio.innerHTML='';
  try {
    const snapshot = await getDocs(collection(db,'publicacoes'));
    snapshot.forEach(docSnap=>{
      const data = docSnap.data();
      const div = document.createElement('div');
      div.className='publicacao-item';
      div.innerHTML = `<strong>${data.titulo}</strong><p>${data.texto}</p>`;
      if(data.arquivoURL) div.innerHTML += `<a href="${data.arquivoURL}" target="_blank">Arquivo</a>`;
      publicacoesInicio.appendChild(div);
    });
  } catch(err){
    console.error("Erro ao carregar publicações:", err);
  }
}

async function carregarPublicacoesAdmin(){
  const lista = document.getElementById('listaPublicacoes');
  lista.innerHTML='';
  try {
    const snapshot = await getDocs(collection(db,'publicacoes'));
    snapshot.forEach(docSnap=>{
      const data = docSnap.data();
      const li = document.createElement('li');
      li.innerHTML=`<strong>${data.titulo}</strong> - ${data.texto} 
      ${data.arquivoURL?`<a href="${data.arquivoURL}" target="_blank">Arquivo</a>`:""}
      <button class="delete-btn" onclick="removerPublicacao('${docSnap.id}')">Remover</button>`;
      lista.appendChild(li);
    });
  } catch(err){
    console.error("Erro ao carregar publicações admin:", err);
  }
}

window.removerPublicacao = async function(id){
  if(!confirm('Remover publicação?')) return;
  try {
    await deleteDoc(doc(db,'publicacoes',id));
    carregarPublicacoesInicio();
    carregarPublicacoesAdmin();
  } catch(err){
    console.error("Erro ao remover publicação:", err);
  }
}

// ================= LOGIN ADMIN =================
function entrarAdmin(){
  const senha = document.getElementById('adminSenha').value;
  if(senha === adminPassword){
    mostrar('adminPainel');
    carregarPublicacoesAdmin();
  } else {
    alert('Senha incorreta');
  }
}

// ================= SISTEMA =================
function toggleSistema(){
  sistemaAberto = !sistemaAberto;
  document.getElementById('estadoSistema').innerText = sistemaAberto ? 'Aberto' : 'Fechado';
}

// ================= REGISTAR PAUTA =================
window.registarPauta = async function(){
  console.log("Registar pauta foi clicado");

  const classe = document.getElementById('classeNome').value.trim();
  const senha = document.getElementById('senhaClasse').value.trim();
  const file = document.getElementById('excelUpload').files[0];

  if(!classe || !senha || !file){
    alert('Preencha todos os campos e selecione um ficheiro Excel.');
    console.log("Campos ou arquivo ausente", {classe, senha, file});
    return;
  }

  const reader = new FileReader();
  reader.onload = async function(e){
    try {
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data, {type:'array'});
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];
      const dados = XLSX.utils.sheet_to_json(ws, {header:1});
      console.log("Dados lidos do Excel:", dados);

      await setDoc(doc(db,'pautas',classe), {senha: senha, dados: dados});
      alert('Pauta registrada com sucesso!');
      console.log("Pauta salva no Firestore");

      // Atualiza lista de pautas
      const lista = document.getElementById('listaPautas');
      const li = document.createElement('li');
      li.textContent = classe;
      lista.appendChild(li);

    } catch(err){
      console.error("Erro ao registar pauta:", err);
      alert('Erro ao registar pauta');
    }
  };
  reader.readAsArrayBuffer(file);
      }
