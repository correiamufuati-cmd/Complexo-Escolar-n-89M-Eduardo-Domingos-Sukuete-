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

/* BOTÕES ESCOLA + ADMIN (EVENT DELEGATION) */
document.addEventListener("click", (e) => {

const schoolBtn = e.target.closest(".pageBtn");
if(schoolBtn){
showPage(schoolBtn.dataset.page);
return;
}

const adminBtn = e.target.closest(".adminBtn");
if(adminBtn){
showAdminPage(adminBtn.dataset.admin);
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

const nome = document.getElementById("nomeEscola").value;
const provincia = document.getElementById("provincia").value;
const municipio = document.getElementById("municipio").value;
const ano = document.getElementById("anoLetivo").value;
const email = document.getElementById("email").value;
const senha = document.getElementById("senhaEscola").value;

if(!nome || !senha){
alert("Preenche todos os campos!");
return;
}

const ref = await addDoc(collection(db,"escolas"),{
nome, provincia, municipio, anoLetivo: ano, email, senha
});

alert("Escola criada com ID: " + ref.id);

carregarEscolas();
}

/* ================= LISTAR ESCOLAS ================= */
async function carregarEscolas(){

const box = document.getElementById("listaEscolas");
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

if(!snap.exists()){
alert("Escola não encontrada");
return;
}

if(snap.data().senha !== senha){
alert("Senha errada");
return;
}

document.getElementById("loginEscola").classList.add("hidden");
document.getElementById("dashboard").classList.remove("hidden");

document.getElementById("nomeEscolaAtiva").innerText = snap.data().nome;
document.getElementById("nivelEscolaAtiva").innerText = snap.data().anoLetivo;

showPage("home");

}

/* ================= SUPER ADMIN ================= */
function validarSuperAdmin(){

const senha = document.getElementById("senhaSuperAdmin").value;

if(senha === "0987"){

document.getElementById("superAdmin").classList.add("hidden");
document.getElementById("superAdminDashboard").classList.remove("hidden");

showAdminPage("escolas");

}else{
alert("Senha incorreta");
}

}

/* ================= NAVEGAÇÃO ESCOLA ================= */
function showPage(page){

document.querySelectorAll(".page")
.forEach(p => p.style.display = "none");

const target = document.getElementById(page);

if(target){
target.style.display = "block";
}

}

/* ================= NAVEGAÇÃO SUPER ADMIN ================= */
function showAdminPage(page){

document.querySelectorAll(".adminPage")
.forEach(p => p.style.display = "none");

const target = document.getElementById(page);

if(target){
target.style.display = "block";
}

}

/* ================= SAIR ================= */
window.sair = function(){

document.getElementById("dashboard").classList.add("hidden");
document.getElementById("superAdminDashboard").classList.add("hidden");
document.getElementById("portal").classList.remove("hidden");

};
