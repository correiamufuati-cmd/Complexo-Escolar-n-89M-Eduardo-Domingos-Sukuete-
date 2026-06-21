import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
getDocs,
getDoc,
doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyDD326KBs3K1vsJsLNhfenFlsLFjRljxNE",
authDomain: "escola-digital-47497.firebaseapp.com",
projectId: "escola-digital-47497",
storageBucket: "escola-digital-47497.firebasestorage.app",
messagingSenderId: "322752680482",
appId: "1:322752680482:web:9f56c69fa6ba752f46707b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("🔥 SISTEMA OK");

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

/* BOTÕES ESCOLA E ADMIN */
document.addEventListener("click", (e) => {

const pageBtn = e.target.closest(".pageBtn");
if(pageBtn){
showPage(pageBtn.dataset.page);
return;
}

const adminBtn = e.target.closest(".adminBtn");
if(adminBtn){
handleAdmin(adminBtn.dataset.admin);
return;
}

});

/* BOTÕES PRINCIPAIS */
document.getElementById("btnCriarEscola")
?.addEventListener("click", criarEscola);

document.getElementById("btnLoginEscola")
?.addEventListener("click", loginEscola);

document.getElementById("btnSuperAdmin")
?.addEventListener("click", () => {
document.getElementById("portal").classList.add("hidden");
document.getElementById("superAdmin").classList.remove("hidden");
});

document.getElementById("btnValidarSuperAdmin")
?.addEventListener("click", validarSuperAdmin);

carregarEscolas();

});

/* ================= CRIAR ESCOLA ================= */
async function criarEscola(){

const nome = nomeEscola.value;
const provincia = provincia.value;
const municipio = municipio.value;
const ano = anoLetivo.value;
const email = email.value;
const senha = senhaEscola.value;

const ref = await addDoc(collection(db,"escolas"),{
nome, provincia, municipio, anoLetivo: ano, email, senha
});

alert("Escola criada: " + ref.id);

carregarEscolas();
}

/* ================= LISTA ESCOLAS ================= */
async function carregarEscolas(){

const box = document.getElementById("listaEscolas");
if(!box) return;

box.innerHTML = "";

const snap = await getDocs(collection(db,"escolas"));

snap.forEach(d=>{

box.innerHTML += `
<div class="card">
<h3>${d.data().nome}</h3>
<button onclick="abrirLogin('${d.id}')">Entrar</button>
</div>
`;

});

}

/* ================= LOGIN ESCOLA ================= */
window.abrirLogin = function(id){

document.getElementById("portal").classList.add("hidden");
document.getElementById("loginEscola").classList.remove("hidden");

document.getElementById("idEscola").value = id;

};

async function loginEscola(){

const id = document.getElementById("idEscola").value;
const senha = document.getElementById("senhaLogin").value;

const snap = await getDoc(doc(db,"escolas",id));

if(!snap.exists()) return alert("Escola não encontrada");

if(snap.data().senha !== senha) return alert("Senha errada");

document.getElementById("loginEscola").classList.add("hidden");
document.getElementById("dashboard").classList.remove("hidden");

document.getElementById("nomeEscolaAtiva").innerText = snap.data().nome;

showPage("home");

}

/* ================= SUPER ADMIN ================= */
function validarSuperAdmin(){

const senha = document.getElementById("senhaSuperAdmin").value;

if(senha !== "0987") return alert("Senha errada");

document.getElementById("superAdmin").classList.add("hidden");
document.getElementById("superAdminDashboard").classList.remove("hidden");

/* 🔥 AUTO LOAD TOTAL */
carregarEscolasAdmin();
carregarEstatisticas();
carregarConfiguracoes();

showAdminPage("escolas");

}

/* ================= ADMIN HANDLER ================= */
function handleAdmin(page){

showAdminPage(page);

if(page === "escolas") carregarEscolasAdmin();
if(page === "stats") carregarEstatisticas();
if(page === "config") carregarConfiguracoes();

}

/* ================= ESCOLAS ADMIN ================= */
async function carregarEscolasAdmin(){

const box = document.getElementById("escolas");
box.innerHTML = "";

const snap = await getDocs(collection(db,"escolas"));

snap.forEach(d=>{

box.innerHTML += `
<div class="card">
<h3>${d.data().nome}</h3>
<p>${d.id}</p>

<button onclick="verEscola('${d.id}')">Ver</button>
<button onclick="desativarEscola('${d.id}')">Desativar</button>
</div>
`;

});

}

window.verEscola = async function(id){

const snap = await getDoc(doc(db,"escolas",id));
if(!snap.exists()) return;

alert(JSON.stringify(snap.data(),null,2));

}

window.desativarEscola = function(id){
alert("Escola " + id + " desativada (simulado)");
}

/* ================= ESTATÍSTICAS ================= */
async function carregarEstatisticas(){

const snap = await getDocs(collection(db,"escolas"));

let total = 0;
snap.forEach(()=> total++);

document.getElementById("stats").innerHTML = `
<div class="card">
<h2>📊 Estatísticas</h2>
<p>Total de escolas: <b>${total}</b></p>
</div>
`;
}

/* ================= CONFIG ================= */
function carregarConfiguracoes(){

document.getElementById("config").innerHTML = `
<div class="card">
<h2>⚙️ Configurações</h2>

<button onclick="alert('Reset simulado')">Reset Sistema</button>
<button onclick="alert('Backup simulado')">Backup</button>

</div>
`;
}

/* ================= NAV ================= */
function showPage(page){

document.querySelectorAll(".page")
.forEach(p => p.style.display = "none");

document.getElementById(page).style.display = "block";

}

function showAdminPage(page){

document.querySelectorAll(".adminPage")
.forEach(p => p.style.display = "none");

document.getElementById(page).style.display = "block";

}

/* ================= SAIR ================= */
window.sair = function(){

document.getElementById("dashboard").classList.add("hidden");
document.getElementById("superAdminDashboard").classList.add("hidden");
document.getElementById("portal").classList.remove("hidden");

};
