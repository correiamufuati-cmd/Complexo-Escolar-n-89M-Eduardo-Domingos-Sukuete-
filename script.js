// ==========================
// SISTEMA COMPLEXO ESCOLAR
// ==========================

// FIREBASE CONFIG (substitui pelos teus dados reais)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ----------------- VARIÁVEIS -----------------
let adminPassword = "Admin123";
let sistemaAberto = false;

// ----------------- FUNÇÕES DE NAVEGAÇÃO -----------------
function mostrar(id){
    document.querySelectorAll('section').forEach(s=>s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
window.mostrar = mostrar;

// ----------------- LOGOTIPO -----------------
const logoInput = document.getElementById('logoUpload');
const logoImg = document.getElementById('logo');
window.addEventListener('load', async ()=>{
    const logoData = await getDoc(doc(db,'config','logo'));
    if(logoData.exists()){
        logoImg.src = logoData.data().url;
        logoImg.style.display='block';
    }
    carregarPublicacoesInicio();
});

logoInput.addEventListener('change', async (e)=>{
    const file = e.target.files[0];
    if(!file) return alert('Selecione uma imagem');

    const logoRef = ref(storage,'logo/'+file.name);
    await uploadBytes(logoRef,file);
    const url = await getDownloadURL(logoRef);

    await setDoc(doc(db,'config','logo'),{url:url});
    logoImg.src=url;
    logoImg.style.display='block';
    alert('Logotipo carregado com sucesso!');
});

// ----------------- PUBLICAÇÕES -----------------
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
    const container = document.getElementById('publicacoesInicio');
    container.innerHTML='';
    const snap = await getDocs(collection(db,'publicacoes'));
    snap.forEach(d=>{
        const data = d.data();
        const div = document.createElement('div');
        div.className='publicacao-item';
        div.innerHTML = `<strong>${data.titulo}</strong><p>${data.texto}</p>`;
        if(data.arquivoURL) div.innerHTML += `<a href="${data.arquivoURL}" target="_blank">Arquivo</a>`;
        container.appendChild(div);
    });
}

async function carregarPublicacoesAdmin(){
    const lista = document.getElementById('listaPublicacoes');
    lista.innerHTML='';
    const snap = await getDocs(collection(db,'publicacoes'));
    snap.forEach(d=>{
        lista.innerHTML += `<li><strong>${d.data().titulo}</strong> - ${d.data().texto} 
        ${d.data().arquivoURL?`<a href="${d.data().arquivoURL}" target="_blank">Arquivo</a>`:""}
        <button class="delete-btn" onclick="removerPublicacao('${d.id}')">Remover</button></li>`;
    });
}

window.removerPublicacao = async function(id){
    if(!confirm('Remover publicação?')) return;
    await deleteDoc(doc(db,'publicacoes',id));
    carregarPublicacoesInicio();
    carregarPublicacoesAdmin();
}

// ----------------- LOGIN ADMIN -----------------
function entrarAdmin(){
    if(document.getElementById('adminSenha').value===adminPassword){
        mostrar('adminPainel');
        carregarPublicacoesAdmin();
    } else alert('Senha incorreta');
}

// ----------------- SISTEMA -----------------
function toggleSistema(){
    sistemaAberto = !sistemaAberto;
    document.getElementById('estadoSistema').innerText = sistemaAberto?'Aberto':'Fechado';
}

// ----------------- REGISTAR PAUTA -----------------
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js";

const db = getFirestore(); // já deve ter inicializado o Firebase anteriormente

export async function registarPauta() {
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
            const dados = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Salva no Firestore
            await setDoc(doc(db, "pautas", classe), {
                senha: senha,
                dados: dados
            });

            alert(`Pauta da classe ${classe} registrada com sucesso!`);
            document.getElementById("excelUpload").value = "";
            document.getElementById("classeNome").value = "";
            document.getElementById("senhaClasse").value = "";
        } catch (err) {
            console.error(err);
            alert("Erro ao registrar a pauta. Veja o console para detalhes.");
        }
    };

    reader.readAsArrayBuffer(arquivo);
}

window.registarPauta = registarPauta; // permite chamar do botão HTML

// ----------------- ONLOAD -----------------
window.onload = () => {
    carregarPublicacoesInicio();
};
