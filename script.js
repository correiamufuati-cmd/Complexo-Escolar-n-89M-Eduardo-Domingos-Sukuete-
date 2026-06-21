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

document.addEventListener("DOMContentLoaded", () => {

document.getElementById("btnCriarEscola").addEventListener("click", criarEscola);
document.getElementById("btnLoginEscola").addEventListener("click", loginEscola);

document.getElementById("btnSuperAdmin").addEventListener("click", () => {
document.getElementById("portal").classList.add("hidden");
document.getElementById("superAdmin").classList.remove("hidden");
});

document.getElementById("btnValidarSuperAdmin").addEventListener("click", validarSuperAdmin);

/* ESCOLA NAV */
document.addEventListener("click", (e) => {

const btn = e.target.closest(".pageBtn");
if(!btn) return;

showPage(btn.dataset.page);

});

/* ADMIN NAV */
document.addEventListener("click", (e) => {

const btn = e.target.closest(".adminBtn");
if(!btn) return;

showAdminPage(btn.dataset.admin);

});

carregarEscolas();

});

/* ================= ESCOLA ================= */

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

alert("Criada! ID: " + ref.id);

carregarEscolas();
}

async function carregarEscolas(){

const box = document.getElementById("listaEscolas");
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

window.abrirLogin = function(id){

document.getElementById("portal").classList.add("hidden");
document.getElementById("loginEscola").classList.remove("hidden");

document.getElementById("idEscola").value = id;

}

async function loginEscola(){

const id = document.getElementById("idEscola").value;
const senha = document.getElementById("senhaLogin").value;

const snap = await getDoc(doc(db,"escolas",id));

if(!snap.exists()) return alert("Erro");

if(snap.data().senha !== senha) return alert("Senha errada");

document.getElementById("loginEscola").classList.add("hidden");
document.getElementById("dashboard").classList.remove("hidden");

document.getElementById("nomeEscolaAtiva").innerText = snap.data().nome;
document.getElementById("nivelEscolaAtiva").innerText = snap.data().anoLetivo;

showPage("home");

}

/* ================= SUPER ADMIN ================= */

function validarSuperAdmin(){

const senha = senhaSuperAdmin.value;

if(senha !== "0987") return alert("Errado");

document.getElementById("superAdmin").classList.add("hidden");
document.getElementById("superAdminDashboard").classList.remove("hidden");

showAdminPage("escolas");

}

function showPage(page){

document.querySelectorAll(".page").forEach(p=>p.style.display="none");
document.getElementById(page).style.display="block";

}

function showAdminPage(page){

document.querySelectorAll(".adminPage").forEach(p=>p.style.display="none");
document.getElementById(page).style.display="block";

}

/* ================= SAIR ================= */

window.sair = function(){

document.getElementById("dashboard").classList.add("hidden");
document.getElementById("superAdminDashboard").classList.add("hidden");
document.getElementById("portal").classList.remove("hidden");

}
