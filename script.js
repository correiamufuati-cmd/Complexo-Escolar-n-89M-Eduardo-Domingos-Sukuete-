import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore, collection, addDoc, getDocs,
deleteDoc, doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
getStorage
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ================= FIREBASE =================
const app = initializeApp({
apiKey: "SUA_API_KEY",
authDomain: "sac-escolar.firebaseapp.com",
projectId: "sac-escolar"
});

const db = getFirestore(app);

// ================= MENU =================
function mostrar(id){
document.querySelectorAll(".pagina").forEach(p=>p.classList.remove("ativa"));
document.getElementById(id).classList.add("ativa");
}

// ================= ADMIN LOGIN =================
function entrarAdmin(){
const senha = document.getElementById("senhaAdmin").value;

if(senha === "Admin123"){
mostrar("admin");
carregarTudoAdmin();
}else{
alert("Senha incorreta");
}
}

// ================= SISTEMA ON/OFF =================
async function toggleSistema(){
const refSys = doc(db,"config","system");
const snap = await getDoc(refSys);
const estado = snap.exists() ? !snap.data().ativo : true;

await setDoc(refSys,{ativo:estado});

document.getElementById("estadoSistema").innerText =
estado ? "Aberto" : "Fechado";
}

// ================= ACESSOS =================
async function criarAcesso(){
await addDoc(collection(db,"acessos"),{
disciplina: document.getElementById("disciplina").value,
senha: document.getElementById("senhaAcesso").value,
link: document.getElementById("linkExcel").value
});

document.getElementById("disciplina").value = "";
document.getElementById("senhaAcesso").value = "";
document.getElementById("linkExcel").value = "";

carregarAcessos();
}

async function carregarAcessos(){
const lista = document.getElementById("listaAcessos");
lista.innerHTML = "";

const snap = await getDocs(collection(db,"acessos"));

snap.forEach(d=>{
const a = d.data();

lista.innerHTML += `
<div class="card">
<strong>${a.disciplina}</strong>
<br>
<button onclick="apagarAcesso('${d.id}')">Apagar</button>
</div>`;
});
}

async function apagarAcesso(id){
if(!confirm("Apagar este acesso?")) return;

await deleteDoc(doc(db,"acessos",id));
carregarAcessos();
}

// ================= PROFESSOR =================
async function entrarProfessor(){
const snap = await getDocs(collection(db,"acessos"));

snap.forEach(d=>{
const a = d.data();

if(
a.disciplina === document.getElementById("loginDisciplina").value &&
a.senha === document.getElementById("loginSenha").value
){
window.open(a.link + "&web=1","_blank");
}
});
}

// ================= PUBLICAÇÕES =================
async function criarPublicacao(){
await addDoc(collection(db,"publicacoes"),{
titulo: document.getElementById("pubTitulo").value,
texto: document.getElementById("pubTexto").value
});

document.getElementById("pubTitulo").value = "";
document.getElementById("pubTexto").value = "";

carregarPublicacoes();
}

async function carregarPublicacoes(){
const feed = document.getElementById("feed");
const inicio = document.getElementById("inicioPublicacoes");

if(feed) feed.innerHTML = "";
if(inicio) inicio.innerHTML = "";

const snap = await getDocs(collection(db,"publicacoes"));

snap.forEach(d=>{
const p = d.data();

const html = `
<div class="card">
<h4>${p.titulo}</h4>
<p>${p.texto}</p>
</div>
`;

if(feed) feed.innerHTML += html;
if(inicio) inicio.innerHTML += html;
});
}

// ================= PAUTAS =================
async function criarPauta(){
await addDoc(collection(db,"pautas"),{
classe: document.getElementById("classePauta").value,
disciplina: document.getElementById("disciplinaPauta").value,
senha: document.getElementById("senhaPauta").value,
link: document.getElementById("linkPauta").value
});

carregarPautas();
}

async function carregarPautas(){
const lista = document.getElementById("listaPautas");
lista.innerHTML = "";

const snap = await getDocs(collection(db,"pautas"));

snap.forEach(d=>{
const p = d.data();

lista.innerHTML += `
<div class="pauta-item">
<strong>${p.classe}</strong> - ${p.disciplina}
<br>
<small>${p.link}</small>
<br>
<button onclick="apagarPauta('${d.id}')">Apagar</button>
</div>`;
});
}

async function apagarPauta(id){
if(!confirm("Apagar esta pauta?")) return;

await deleteDoc(doc(db,"pautas",id));
carregarPautas();
}

// ================= PDF =================
function abrirPDF(link,senha){
const input = prompt("Senha:");
if(input !== senha && senha !== "publico") return;

const pdfViewer = document.getElementById("pdfViewer");

pdfViewer.style.display = "block";
pdfViewer.innerHTML = `
<iframe src="${link}#toolbar=1"></iframe>
<button onclick="document.getElementById('pdfViewer').style.display='none'">Fechar</button>
`;
}

// ================= DASHBOARD =================
async function carregarGrafico(){
const a = (await getDocs(collection(db,"acessos"))).size;
const p = (await getDocs(collection(db,"publicacoes"))).size;

const ctx = document.getElementById("grafico");

if(window.grafico) window.grafico.destroy();

window.grafico = new Chart(ctx,{
type:"bar",
data:{
labels:["Acessos","Publicações"],
datasets:[{data:[a,p]}]
}
});
}

// ================= EXCEL =================
function analisarExcel(file){
const reader = new FileReader();

reader.onload=function(e){
const data = new Uint8Array(e.target.result);
const wb = XLSX.read(data,{type:"array"});
const sheet = wb.Sheets[wb.SheetNames[0]];
const json = XLSX.utils.sheet_to_json(sheet);

let aprovados=0,reprovados=0;

json.forEach(a=>{
if(a.Media>=10) aprovados++;
else reprovados++;
});

document.getElementById("estatisticas").innerHTML=`
<div class="card">Aprovados: ${aprovados}</div>
<div class="card">Reprovados: ${reprovados}</div>
`;
};

reader.readAsArrayBuffer(file);
}

// ================= FRASES =================
const frases=[
"Educação é o futuro.",
"Aprender muda vidas.",
"Disciplina gera sucesso.",
"Conhecimento é poder."
];

setInterval(()=>{
const el = document.getElementById("fraseMotivacional");
if(el){
el.innerText = frases[Math.floor(Math.random()*frases.length)];
}
},4000);

// ================= INIT =================
document.addEventListener("DOMContentLoaded",()=>{
carregarPublicacoes();
carregarAcessos();
carregarPautas();
carregarGrafico();
});

// ================= EXPORT (OBRIGATÓRIO PARA BOTÕES =================
window.mostrar = mostrar;
window.entrarAdmin = entrarAdmin;
window.toggleSistema = toggleSistema;

window.criarAcesso = criarAcesso;
window.carregarAcessos = carregarAcessos;
window.apagarAcesso = apagarAcesso;

window.entrarProfessor = entrarProfessor;

window.criarPublicacao = criarPublicacao;
window.carregarPublicacoes = carregarPublicacoes;

window.criarPauta = criarPauta;
window.carregarPautas = carregarPautas;
window.apagarPauta = apagarPauta;

window.abrirPDF = abrirPDF;
window.analisarExcel = analisarExcel;

window.carregarGrafico = carregarGrafico;
