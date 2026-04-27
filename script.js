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

// ADMIN
function entrarAdmin(){
if(adminSenha.value==="Admin123"){
mostrar("admin");
}else{
alert("Senha errada");
}
}

// SENHA
function gerarSenha(){
senhaAcesso.value=Math.random().toString(36).substring(2,8);
}

// SISTEMA
async function toggleSistema(){
const refSys=doc(db,"config","system");
const snap=await getDoc(refSys);
const estado=snap.exists()? !snap.data().ativo:true;
await setDoc(refSys,{ativo:estado});
alert("Sistema atualizado");
}

// EXCEL LINK
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
${a.disciplina} | ${a.senha}
<button onclick="apagarAcesso('${d.id}')">Apagar</button>
</div>`;
});
}

async function apagarAcesso(id){
await deleteDoc(doc(db,"acessos",id));
carregarAcessos();
}

// PROFESSOR (CORRIGIDO)
async function entrarProfessor(){

const sys=await getDoc(doc(db,"config","system"));
if(sys.exists() && !sys.data().ativo){
alert("Sistema fechado");
return;
}

const snap=await getDocs(collection(db,"acessos"));

snap.forEach(d=>{
const a=d.data();

if(a.disciplina===loginDisciplina.value && a.senha===loginSenha.value){

// FORÇA ABRIR NO NAVEGADOR
window.open(a.link + "&web=1","_blank");

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
if(senha!=="publico"){
const s=prompt("Senha:");
if(s!==senha) return;
}

pdfViewer.style.display="block";
pdfViewer.innerHTML=`<iframe src="${link}"></iframe>`;
}

// DASHBOARD
async function carregarGrafico(){

const a=(await getDocs(collection(db,"acessos"))).size;
const p=(await getDocs(collection(db,"publicacoes"))).size;
const f=(await getDocs(collection(db,"ficheiros"))).size;

new Chart(document.getElementById("grafico"),{
type:"bar",
data:{
labels:["Acessos","Publicações","Ficheiros"],
datasets:[{data:[a,p,f]}]
}
});
}

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
