// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js";

// === CONFIGURAÇÃO FIREBASE ===
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

// === VARIÁVEIS GLOBAIS ===
let adminPassword = "Admin123";
let sistemaAberto = false;
let pautas = {}; // chave: classe, valor: {senha, dados}

// === FUNÇÃO DE NAVEGAÇÃO ===
function mostrar(id){
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
window.mostrar = mostrar;

// === LOGOTIPO ===
const logoInput = document.getElementById('logoUpload');
const logoImg = document.getElementById('logo');
const publicacoesInicio = document.getElementById('publicacoesInicio');

async function carregarLogo(){
    const logoDoc = await getDoc(doc(db,'config','logo'));
    if(logoDoc.exists()){
        logoImg.src = logoDoc.data().url;
        logoImg.style.display='block';
    }
}
logoInput.addEventListener('change', async e=>{
    const file = e.target.files[0];
    if(!file) return alert("Selecione uma imagem");

    const logoRef = ref(storage,'logo/'+file.name);
    await uploadBytes(logoRef,file);
    const url = await getDownloadURL(logoRef);
    await setDoc(doc(db,'config','logo'),{url});
    logoImg.src = url;
    logoImg.style.display='block';
    alert("Logotipo atualizado permanentemente!");
});

// === PUBLICAÇÕES ===
async function adicionarPublicacao(admin){
    let titulo, texto;
    if(admin){
        titulo = document.getElementById('publicacaoTitulo').value.trim();
        texto = document.getElementById('publicacaoTexto').value.trim();
    } else {
        titulo = document.getElementById('publicacaoTituloUsuario').value.trim();
        texto = document.getElementById('publicacaoTextoUsuario').value.trim();
    }
    if(!titulo || !texto) return alert("Preencha título e mensagem");

    await addDoc(collection(db,'publicacoes'),{
        titulo,
        texto,
        timestamp: Date.now()
    });

    if(admin){
        document.getElementById('publicacaoTitulo').value='';
        document.getElementById('publicacaoTexto').value='';
    } else {
        document.getElementById('publicacaoTituloUsuario').value='';
        document.getElementById('publicacaoTextoUsuario').value='';
    }

    carregarPublicacoesInicio();
    carregarPublicacoesAdmin();
}

async function carregarPublicacoesInicio(){
    publicacoesInicio.innerHTML='';
    const snapshot = await getDocs(collection(db,'publicacoes'));
    snapshot.forEach(docSnap=>{
        const data = docSnap.data();
        const div = document.createElement('div');
        div.className='publicacao-item';
        div.innerHTML = `<strong>${data.titulo}</strong><p>${data.texto}</p>`;
        publicacoesInicio.appendChild(div);
    });
}

async function carregarPublicacoesAdmin(){
    const lista = document.getElementById('listaPublicacoes');
    lista.innerHTML='';
    const snapshot = await getDocs(collection(db,'publicacoes'));
    snapshot.forEach(docSnap=>{
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

// === LOGIN ADMIN ===
window.entrarAdmin = function(){
    const senha = document.getElementById('adminSenha').value;
    if(senha === adminPassword){
        mostrar('adminPainel');
        carregarPublicacoesAdmin();
        carregarLogo();
        carregarPautasAdmin();
    } else alert("Senha incorreta");
}

// === SISTEMA ===
window.toggleSistema = function(){
    sistemaAberto = !sistemaAberto;
    document.getElementById('estadoSistema').innerText = sistemaAberto ? 'Aberto':'Fechado';
}

// === REGISTAR PAUTA (ADMIN) ===
window.registarPauta = async function(){
    const nivel = document.getElementById('nivelSelect').value;
    const classe = document.getElementById('classeNome').value.trim();
    const senhaClasse = document.getElementById('senhaClasse').value.trim();
    const file = document.getElementById('excelUpload').files[0];

    if(!classe || !senhaClasse || !file) return alert("Preencha todos os campos e selecione o Excel");

    const reader = new FileReader();
    reader.onload = async e=>{
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data,{type:'array'});
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const dados = XLSX.utils.sheet_to_json(ws,{header:1});
        // Salvar no Firestore
        await setDoc(doc(db,'pautas',classe),{
            nivel, senha: senhaClasse, dados
        });
        alert(`Pauta da classe ${classe} registada com sucesso!`);
        carregarPautasAdmin();
    };
    reader.readAsArrayBuffer(file);
};

// === CARREGAR PAUTAS ADMIN ===
async function carregarPautasAdmin(){
    const lista = document.getElementById('listaPautas');
    lista.innerHTML='';
    const snapshot = await getDocs(collection(db,'pautas'));
    snapshot.forEach(docSnap=>{
        const data = docSnap.data();
        const li = document.createElement('div');
        li.className='card';
        li.innerHTML=`<strong>${docSnap.id}</strong> - Nível: ${data.nivel} 
            <button onclick="removerPauta('${docSnap.id}')">Remover</button>`;
        lista.appendChild(li);
    });
}
window.carregarPautasAdmin = carregarPautasAdmin;

// === REMOVER PAUTA ===
window.removerPauta = async function(classe){
    if(!confirm("Remover pauta?")) return;
    await deleteDoc(doc(db,'pautas',classe));
    carregarPautasAdmin();
}

// === PROFESSOR: ACESSAR PAUTA ===
window.acessarPauta = async function(){
    const classe = document.getElementById('classeProfessor').value;
    const senha = document.getElementById('senhaProfessor').value;
    if(!classe || !senha) return alert("Preencha classe e senha");

    const docSnap = await getDoc(doc(db,'pautas',classe));
    if(!docSnap.exists()) return alert("Classe não encontrada");
    const data = docSnap.data();
    if(data.senha !== senha) return alert("Senha incorreta");

    // Montar tabela
    const container = document.getElementById('tabelaContainer');
    container.innerHTML='';
    const tabela = document.createElement('table');
    data.dados.forEach((row,i)=>{
        const tr = document.createElement('tr');
        row.forEach((cell,j)=>{
            const td = document.createElement(i>0 ? 'td':'th');
            td.textContent = cell || '';
            if(i>0) td.contentEditable=true;
            tr.appendChild(td);
        });
        tabela.appendChild(tr);
    });
    container.appendChild(tabela);
    document.getElementById('areaNotas').style.display='block';
    window.pautaAtual = {classe, tabela};
};

// === CONFIRMAR GUARDAR (PROFESSOR) ===
window.confirmarGuardar = async function(){
    const {classe, tabela} = window.pautaAtual;
    const dados = Array.from(tabela.rows).map(tr=>Array.from(tr.cells).map(td=>td.textContent));
    await setDoc(doc(db,'pautas',classe),{dados, senha: (await getDoc(doc(db,'pautas',classe))).data().senha, nivel:(await getDoc(doc(db,'pautas',classe))).data().nivel});
    alert("Notas guardadas com sucesso!");
}

// === INICIALIZAÇÃO ===
window.addEventListener('load', async ()=>{
    carregarLogo();
    carregarPublicacoesInicio();

    // Carregar classes para select do professor
    const snapshot = await getDocs(collection(db,'pautas'));
    const select = document.getElementById('classeProfessor');
    select.innerHTML='';
    snapshot.forEach(docSnap=>{
        const option = document.createElement('option');
        option.value = docSnap.id;
        option.textContent = docSnap.id;
        select.appendChild(option);
    });
});
