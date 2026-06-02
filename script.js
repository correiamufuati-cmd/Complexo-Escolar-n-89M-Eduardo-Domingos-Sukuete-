import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore, collection, addDoc, getDocs,
deleteDoc, doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
carregarTudo();
}else{
alert("Senha incorreta");
}
}

// ================= SISTEMA =================
async function toggleSistema(){
const refSys = doc(db,"config","system");
const snap = await getDoc(refSys);
const estado = snap.exists() ? !snap.data().ativo : true;

await setDoc(refSys,{ativo:estado});

document.getElementById("estadoSistema").innerText =
estado ? "Aberto" : "Fechado";
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
const select = document.getElementById("pautaSelect");

if(lista) lista.innerHTML = "";
if(select) select.innerHTML = '<option value="">Selecione uma pauta</option>';

const snap = await getDocs(collection(db,"pautas"));

snap.forEach(d=>{
const p = d.data();

if(lista){
lista.innerHTML += `
<div class="pauta-item">
<strong>${p.classe}</strong> - ${p.disciplina}
<br>
<button onclick="apagarPauta('${d.id}')">Apagar</button>
</div>`;
}

if(select){
select.innerHTML += `
<option value="${d.id}">
${p.classe} - ${p.disciplina}
</option>`;
}

});
}

async function apagarPauta(id){
await deleteDoc(doc(db,"pautas",id));
carregarPautas();
}

// ================= PROFESSOR =================
async function entrarProfessor(){

const id = document.getElementById("pautaSelect").value;
const senha = document.getElementById("senhaProfessor").value;

if(!id){
alert("Seleciona uma pauta");
return;
}

const snap = await getDoc(doc(db,"pautas",id));

if(!snap.exists()){
alert("Pauta não encontrada");
return;
}

const p = snap.data();

if(p.senha === senha){
window.open(p.link,"_blank");
}else{
alert("Senha incorreta");
}
}

// botão professor
document.getElementById("btnEntrarPauta")
.addEventListener("click", entrarProfessor);

// ================= PUBLICAÇÕES =================
async function criarPublicacao(){
await addDoc(collection(db,"publicacoes"),{
titulo: document.getElementById("tituloPub").value,
texto: document.getElementById("textoPub").value
});

carregarPublicacoes();
}

async function carregarPublicacoes(){

const feed = document.getElementById("listaPublicacoesPublicas");
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

// ================= DASHBOARD =================
async function carregarGrafico(){

const a = (await getDocs(collection(db,"pautas"))).size;
const p = (await getDocs(collection(db,"publicacoes"))).size;

const ctx = document.getElementById("graficoDashboard");

if(window.grafico) window.grafico.destroy();

window.grafico = new Chart(ctx,{
type:"bar",
data:{
labels:["Pautas","Publicações"],
datasets:[{data:[a,p]}]
}
});
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded",()=>{
carregarPautas();
carregarPublicacoes();
carregarGrafico();
});

// ================= EXPORT =================
window.mostrar = mostrar;
window.entrarAdmin = entrarAdmin;
window.toggleSistema = toggleSistema;

window.criarPauta = criarPauta;
window.carregarPautas = carregarPautas;
window.apagarPauta = apagarPauta;

window.criarPublicacao = criarPublicacao;
window.carregarPublicacoes = carregarPublicacoes;

window.entrarProfessor = entrarProfessor;
window.carregarGrafico = carregarGrafico;
