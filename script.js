import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore, collection, addDoc, getDocs,
deleteDoc, doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const app = initializeApp({
apiKey: "SUA_API_KEY",
authDomain: "sac-escolar.firebaseapp.com",
projectId: "sac-escolar"
});

const db = getFirestore(app);
const storage = getStorage(app);

// MENU
function mostrar(id){
document.querySelectorAll(".pagina").forEach(p=>p.classList.remove("ativa"));
document.getElementById(id).classList.add("ativa");
}

// ADMIN LOGIN
function entrarAdmin(){
if(adminSenha.value==="Admin123"){
mostrar("admin");
}else alert("Senha incorreta");
}

// SENHAS
function gerarSenha(){
senhaAcesso.value=Math.random().toString(36).substring(2,8);
}

function gerarSenhaFicheiro(){
ficheiroSenha.value=Math.random().toString(36).substring(2,8);
}

// SISTEMA ON/OFF
async function toggleSistema(){
const refSys=doc(db,"config","system");
const snap=await getDoc(refSys);
const estado=snap.exists()? !snap.data().ativo:true;
await setDoc(refSys,{ativo:estado});
}

// ACESSOS
async function criarAcesso(){
await addDoc(collection(db,"acessos"),{
disciplina:disciplina.value,
senha:senhaAcesso.value,
link:linkExcel.value
});
carregarAcessos();
}

async function carregarAcessos(){
listaAcessos.innerHTML="";
const snap=await getDocs(collection(db,"acessos"));
snap.forEach(d=>{
const a=d.data();
listaAcessos.innerHTML+=`
<div class="card">
${a.disciplina}
<button onclick="apagarAcesso('${d.id}')">Apagar</button>
</div>`;
});
}

async function apagarAcesso(id){
await deleteDoc(doc(db,"acessos",id));
carregarAcessos();
}

// PROFESSOR
async function entrarProfessor(){
const snap=await getDocs(collection(db,"acessos"));

snap.forEach(d=>{
const a=d.data();

if(a.disciplina===loginDisciplina.value && a.senha===loginSenha.value){
window.open(a.link+"&web=1","_blank");
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
const snap=await getDocs(collection(db,"publicacoes"));
snap.forEach(d=>{
const p=d.data();
feed.innerHTML+=`<div class="card">${p.titulo}</div>`;
});
}

// PDF
function abrirPDF(link,senha){
const input=prompt("Senha:");
if(input!==senha && senha!=="publico") return;

pdfViewer.style.display="block";
pdfViewer.innerHTML=`
<iframe src="${link}#toolbar=1"></iframe>
<button onclick="pdfViewer.style.display='none'">Fechar</button>
`;
}

// DASHBOARD
async function carregarGrafico(){

const a=(await getDocs(collection(db,"acessos"))).size;
const p=(await getDocs(collection(db,"publicacoes"))).size;

new Chart(document.getElementById("grafico"),{
type:"bar",
data:{
labels:["Acessos","Publicações"],
datasets:[{data:[a,p]}]
}
});
}

// EXCEL ANALYSIS
function analisarExcel(file){

const reader=new FileReader();

reader.onload=function(e){
const data=new Uint8Array(e.target.result);
const wb=XLSX.read(data,{type:"array"});
const sheet=wb.Sheets[wb.SheetNames[0]];
const json=XLSX.utils.sheet_to_json(sheet);

let aprovados=0,reprovados=0;

json.forEach(a=>{
if(a.Media>=10) aprovados++;
else reprovados++;
});

estatisticas.innerHTML=`
<div class="card">Aprovados: ${aprovados}</div>
<div class="card">Reprovados: ${reprovados}</div>
`;
};

reader.readAsArrayBuffer(file);
}

// FRASES
const frases=[
"Educação é o futuro.",
"Aprender muda vidas.",
"Disciplina gera sucesso.",
"Conhecimento é poder."
];

setInterval(()=>{
fraseMotivacional.innerText=
frases[Math.floor(Math.random()*frases.length)];
},4000);

// INIT
document.addEventListener("DOMContentLoaded",()=>{
carregarPublicacoes();
carregarAcessos();
carregarGrafico();
});

// EXPORT
window.mostrar=mostrar;
window.entrarAdmin=entrarAdmin;
window.gerarSenha=gerarSenha;
window.criarAcesso=criarAcesso;
window.apagarAcesso=apagarAcesso;
window.entrarProfessor=entrarProfessor;
window.criarPublicacao=criarPublicacao;
window.toggleSistema=toggleSistema;
window.abrirPDF=abrirPDF;
window.analisarExcel=analisarExcel;
