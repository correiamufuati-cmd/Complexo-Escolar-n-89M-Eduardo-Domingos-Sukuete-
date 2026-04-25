import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
getDocs,
deleteDoc,
doc,
getDoc,
setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
getStorage,
ref,
uploadBytes,
getDownloadURL,
deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
apiKey: "SUA_API_KEY",
authDomain: "sac-escolar.firebaseapp.com",
projectId: "sac-escolar"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// NAV
function mostrar(id) {
document.querySelectorAll(".pagina").forEach(p => p.classList.remove("ativa"));
document.getElementById(id).classList.add("ativa");
}

// ADMIN LOGIN
function entrarAdmin() {
const senha = adminSenha.value;
if (senha === "Admin123") {
mostrar("admin");
} else {
alert("Senha incorreta");
}
}

// SENHAS
function gerarSenha() {
senhaAcesso.value = Math.random().toString(36).substring(2,8);
}

function gerarSenhaFicheiro() {
ficheiroSenha.value = Math.random().toString(36).substring(2,8);
}

// SISTEMA
async function toggleSistema() {
const refSys = doc(db,"config","system");
const snap = await getDoc(refSys);
const estado = snap.exists() ? !snap.data().ativo : true;
await setDoc(refSys,{ativo:estado});
alert("Sistema atualizado");
}

// ACESSOS
async function criarAcesso() {
await addDoc(collection(db,"acessos"),{
disciplina:disciplina.value,
senha:senhaAcesso.value,
link:linkExcel.value
});
carregarAcessos();
}

async function carregarAcessos() {
listaAcessos.innerHTML="";
const snap = await getDocs(collection(db,"acessos"));
snap.forEach(d=>{
const a=d.data();
listaAcessos.innerHTML+=`
<div class="card">
${a.disciplina} | ${a.senha}
<button onclick="apagarAcesso('${d.id}')">Apagar</button>
</div>`;
});
}

async function apagarAcesso(id){
await deleteDoc(doc(db,"acessos",id));
carregarAcessos();
}

// LOGIN PROFESSOR
async function entrarProfessor(){
const snap = await getDocs(collection(db,"acessos"));
snap.forEach(d=>{
const a=d.data();
if(a.disciplina===loginDisciplina.value && a.senha===loginSenha.value){
window.open(a.link);
}
});
}

// PUBLICAÇÕES
async function criarPublicacao(){
await addDoc(collection(db,"publicacoes"),{
titulo:pubTitulo.value,
texto:pubTexto.value
});
carregarPublicacoes();
}

async function carregarPublicacoes(){
feed.innerHTML="";
listaPublicacoes.innerHTML="";
const snap = await getDocs(collection(db,"publicacoes"));
snap.forEach(d=>{
const p=d.data();
feed.innerHTML+=`<div class="card"><b>${p.titulo}</b><p>${p.texto}</p></div>`;
});
}

// FICHEIROS (UPLOAD REAL)
async function uploadFicheiro(){
const file = ficheiroUpload.files[0];
const senha = ficheiroSenha.value;

const storageRef = ref(storage,"ficheiros/"+file.name);
await uploadBytes(storageRef,file);
const url = await getDownloadURL(storageRef);

await addDoc(collection(db,"ficheiros"),{
nome:file.name,
link:url,
senha:senha
});

carregarFicheiros();
}

async function carregarFicheiros(){
ficheirosHome.innerHTML="";
const snap = await getDocs(collection(db,"ficheiros"));
snap.forEach(d=>{
const f=d.data();

ficheirosHome.innerHTML+=`
<div class="card">
📄 ${f.nome}
<button onclick="abrirPDF('${f.link}','${f.senha}')">Ver</button>
</div>`;
});
}

// BOLETINS
async function publicarBoletim(){
await addDoc(collection(db,"boletins"),{
disciplina:boletimDisciplina.value,
link:boletimLink.value
});
carregarBoletins();
}

async function carregarBoletins(){
feed.innerHTML="";
const snap = await getDocs(collection(db,"boletins"));
snap.forEach(d=>{
const b=d.data();
feed.innerHTML+=`
<div class="card">
📘 ${b.disciplina}
<button onclick="abrirPDF('${b.link}','publico')">Ver PDF</button>
</div>`;
});
}

// PDF VIEWER
function abrirPDF(link,senha){
const input = prompt("Senha:");
if(senha !== "publico" && input !== senha){
alert("Acesso negado");
return;
}

pdfViewer.style.display="block";
pdfViewer.innerHTML=`
<div class="pdf-box">
<button onclick="pdfViewer.style.display='none'">Fechar</button>
<iframe src="${link}" width="100%" height="90%"></iframe>
</div>`;
}

// DASHBOARD
async function atualizarDashboard(){
totalAcessos.innerText=(await getDocs(collection(db,"acessos"))).size;
totalPublicacoes.innerText=(await getDocs(collection(db,"publicacoes"))).size;
totalFicheiros.innerText=(await getDocs(collection(db,"ficheiros"))).size;
}

// INIT
document.addEventListener("DOMContentLoaded",()=>{
carregarPublicacoes();
carregarAcessos();
carregarFicheiros();
carregarBoletins();
atualizarDashboard();
});

// EXPORT
window.mostrar=mostrar;
window.entrarAdmin=entrarAdmin;
window.gerarSenha=gerarSenha;
window.gerarSenhaFicheiro=gerarSenhaFicheiro;
window.criarAcesso=criarAcesso;
window.apagarAcesso=apagarAcesso;
window.entrarProfessor=entrarProfessor;
window.criarPublicacao=criarPublicacao;
window.uploadFicheiro=uploadFicheiro;
window.publicarBoletim=publicarBoletim;
window.toggleSistema=toggleSistema;
window.abrirPDF=abrirPDF;
