// ================= FIREBASE =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC0NRCbPalAC3Yrfpc8qYdJVU6DxuEOyTw",
  authDomain: "sac-escolar.firebaseapp.com",
  projectId: "sac-escolar",
  storageBucket: "sac-escolar.firebasestorage.app",
  messagingSenderId: "507793955855",
  appId: "1:507793955855:web:405579f5e01b3f90cc577a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ================= VARIÁVEIS =================
let adminPassword = "Admin123";
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

async function carregarLogotipo(){
    const logoData = await getDoc(doc(db,'config','logo'));
    if(logoData.exists()){
        logoImg.src = logoData.data().url;
        logoImg.style.display = 'block';
    }
}

logoInput.addEventListener('change', async (e)=>{
    const file = e.target.files[0];
    if(!file) return alert('Selecione uma imagem');

    const logoRef = ref(storage,'logo/'+file.name);
    await uploadBytes(logoRef,file);
    const url = await getDownloadURL(logoRef);

    await setDoc(doc(db,'config','logo'),{url:url});
    logoImg.src = url;
    logoImg.style.display = 'block';
    alert('Logotipo carregado e salvo permanentemente!');
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
    if(arquivo){
        const fileRef = ref(storage,'publicacoes/'+arquivo.name);
        await uploadBytes(fileRef,arquivo);
        arquivoURL = await getDownloadURL(fileRef);
    }

    await addDoc(collection(db,'publicacoes'),{
        titulo,
        texto,
        arquivoURL,
        timestamp:Date.now()
    });

    alert('Publicação adicionada!');
    
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
    const snapshot = await getDocs(collection(db,'publicacoes'));
    snapshot.forEach(docSnap=>{
        const data = docSnap.data();
        const div = document.createElement('div');
        div.className='publicacao-item';
        div.style.color = '#000000'; // garante que o texto apareça
        div.innerHTML = `<strong>${data.titulo}</strong><p>${data.texto}</p>`;
        if(data.arquivoURL) div.innerHTML += `<a href="${data.arquivoURL}" target="_blank">Arquivo</a>`;
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
        ${data.arquivoURL?`<a href="${data.arquivoURL}" target="_blank">Arquivo</a>`:""}
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

// ================= LOGIN ADMIN =================
function entrarAdmin(){
    if(document.getElementById('adminSenha').value===adminPassword){
        mostrar('adminPainel');
        carregarPublicacoesAdmin();
    } else {
        alert('Senha incorreta');
    }
}
window.entrarAdmin = entrarAdmin;

// ================= SISTEMA =================
function toggleSistema(){
    sistemaAberto = !sistemaAberto;
    document.getElementById('estadoSistema').innerText = sistemaAberto?'Aberto':'Fechado';
}
window.toggleSistema = toggleSistema;

// ================= REGISTAR PAUTA =================

window.registarPauta = registarPauta;

// ================= PROFESSOR =================
async function registarPauta() {
    alert("Registar foi clicado");

    const file = document.getElementById('excelUpload').files[0];
    if (!file) return alert("Selecione um ficheiro Excel");

    console.log("Arquivo selecionado:", file.name); // 🔹 debug

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });

        const sheetName = wb.SheetNames[0];
        const sheet = wb.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        console.log("JSON da Pauta:", json); // 🔹 debug
        alert("Arquivo lido com sucesso!");
    };
    reader.readAsArrayBuffer(file);
}
window.acessarPauta = acessarPauta;

// ================= RENDER TABELA =================
function renderTabela(dados) {
    let html = "<table>";
    dados.forEach((linha,i)=>{
        html+="<tr>";
        linha.forEach((cel,j)=>{
            if(i===0) html+=`<th>${cel}</th>`;
            else html+=`<td contenteditable oninput="editar(${i},${j},this.innerText)">${cel||''}</td>`;
        });
        html+="</tr>";
    });
    html+="</table>";
    document.getElementById('tabelaContainer').innerHTML = html;
}
window.renderTabela = renderTabela;

// ================= EDITAR CELULAS =================
let dadosTabela = [];
function editar(i,j,v){ dadosTabela[i][j]=v; }
window.editar = editar;

// ================= GUARDAR NOTAS =================
async function confirmarGuardar(){
    const classe = document.getElementById("classeProfessor").value;
    await setDoc(doc(db,"pautas",classe),{senha: dadosTabela[0][1], dados:dadosTabela}); // ajustar senha se necessário
    alert("Notas guardadas!");
}
window.confirmarGuardar = confirmarGuardar;

// ================= CARREGAR AO ABRIR =================
window.onload = function() {
    carregarPublicacoesInicio();
    carregarLogotipo();
    carregarClasses();
};
