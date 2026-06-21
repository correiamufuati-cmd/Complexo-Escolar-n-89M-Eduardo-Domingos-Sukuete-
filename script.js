import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
getDocs,
getDoc,
doc,
deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ================= FIREBASE ================= */
const firebaseConfig = {
apiKey: "AIzaSyDD326KBs3K1vsJsLNhfenFlsLFjRljxNE",
authDomain: "escola-digital-47497.firebaseapp.com",
projectId: "escola-digital-47497"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= ESTADO ================= */
let escolaAtual = null;

/* ================= HELPERS (ANTI-ERRO) ================= */
function el(id){
return document.getElementById(id);
}

function show(id){
const e = el(id);
if(!e){
console.error("Elemento não encontrado:", id);
return;
}
e.classList.remove("hidden");
}

function hide(id){
const e = el(id);
if(!e){
console.error("Elemento não encontrado:", id);
return;
}
e.classList.add("hidden");
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

const btnCriar = el("btnCriarEscola");
const btnLogin = el("btnLoginEscola");

if(btnCriar) btnCriar.addEventListener("click", criarEscola);
if(btnLogin) btnLogin.addEventListener("click", loginEscola);

carregarEscolas();

});

/* ================= CRIAR ESCOLA ================= */
async function criarEscola(){

const nome = el("nomeEscola")?.value;
const provincia = el("provincia")?.value;
const municipio = el("municipio")?.value;
const ano = el("anoLetivo")?.value;
const email = el("email")?.value;
const senha = el("senhaEscola")?.value;

if(!nome || !senha){
alert("Preenche nome e senha");
return;
}

const ref = await addDoc(collection(db,"escolas"),{
nome, provincia, municipio,
anoLetivo: ano,
email, senha,
criadoEm: Date.now()
});

alert("Escola criada: " + ref.id);
carregarEscolas();
}

/* ================= LISTAR ESCOLAS ================= */
async function carregarEscolas(){

const box = el("listaEscolas");
if(!box) return;

box.innerHTML = "";

const snap = await getDocs(collection(db,"escolas"));

snap.forEach(d=>{

box.innerHTML += `
<div class="card">
<h3>${d.data().nome}</h3>
<p>ID: ${d.id}</p>
<button onclick="abrirLogin('${d.id}')">Entrar</button>
</div>
`;

});

}

/* ================= ABRIR LOGIN (FIX DEFINITIVO) ================= */
window.abrirLogin = function(id){

console.log("abrirLogin:", id);

escolaAtual = id;

hide("portal");
show("loginEscola");

const input = el("idEscola");
if(input) input.value = id;

};

/* ================= LOGIN ================= */
window.loginEscola = async function(){

try{

const id = el("idEscola")?.value;
const senha = el("senhaLogin")?.value;

if(!id || !senha){
alert("Preenche tudo");
return;
}

const snap = await getDoc(doc(db,"escolas",id));

if(!snap.exists()){
alert("Escola não existe");
return;
}

const data = snap.data();

if(data.senha !== senha){
alert("Senha errada");
return;
}

hide("loginEscola");
show("dashboard");

const nome = el("nomeEscolaAtiva");
const ano = el("nivelEscolaAtiva");

if(nome) nome.innerText = data.nome;
if(ano) ano.innerText = data.anoLetivo || "";

showPage("home");

}catch(err){
console.error(err);
alert("Erro no login");
}

};

/* ================= SUPER ADMIN ================= */
window.abrirSuperAdmin = function(){
hide("portal");
show("superAdmin");
};

window.validarSuperAdmin = function(){

const senha = el("senhaSuperAdmin")?.value;

if(senha !== "0987"){
alert("Errado");
return;
}

hide("superAdmin");
show("superAdminDashboard");

loadAdminEscolas();
loadStats();

};

/* ================= ADMIN ================= */
async function loadAdminEscolas(){

const box = el("escolas");
if(!box) return;

box.innerHTML = "";

const snap = await getDocs(collection(db,"escolas"));

snap.forEach(d=>{

box.innerHTML += `
<div class="card">
<h3>${d.data().nome}</h3>
<p>ID: ${d.id}</p>

<button onclick="verEscola('${d.id}')">Ver</button>
<button onclick="eliminarEscola('${d.id}')">Eliminar</button>
</div>
`;

});

}

window.verEscola = async function(id){

const snap = await getDoc(doc(db,"escolas",id));

alert(JSON.stringify(snap.data(),null,2));

};

window.eliminarEscola = async function(id){

await deleteDoc(doc(db,"escolas",id));
alert("Eliminado");

loadAdminEscolas();

};

async function loadStats(){

const snap = await getDocs(collection(db,"escolas"));

let total = 0;
snap.forEach(()=>total++);

const box = el("stats");

if(box){
box.innerHTML = `
<div class="card">
<h2>Total de escolas: ${total}</h2>
</div>
`;
}

}

/* ================= NAV ================= */
window.showPage = function(id){

document.querySelectorAll(".page")
.forEach(p=>p.classList.remove("active"));

const target = document.getElementById(id);
if(target) target.classList.add("active");

};

/* ================= ADMIN NAV ================= */
window.showAdminPage = function(id){

document.querySelectorAll(".adminPage")
.forEach(p=>p.style.display="none");

const el2 = document.getElementById(id);
if(el2) el2.style.display="block";

if(id==="escolas") loadAdminEscolas();
if(id==="stats") loadStats();

};

/* ================= SAIR ================= */
window.sair = function(){
location.reload();
};
