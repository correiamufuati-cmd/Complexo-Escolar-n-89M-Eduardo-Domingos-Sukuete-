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

console.log("🔥 SISTEMA ONLINE");

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

console.log("DOM OK");

document.getElementById("btnCriarEscola")
?.addEventListener("click", criarEscola);

document.getElementById("btnLoginEscola")
?.addEventListener("click", loginEscola);

document.getElementById("btnSuperAdmin")
?.addEventListener("click", abrirSuperAdmin);

document.getElementById("btnValidarSuperAdmin")
?.addEventListener("click", validarSuperAdmin);

/* 🔥 EVENT DELEGATION (FIX PRINCIPAL) */
document.addEventListener("click", (e) => {

const btn = e.target.closest(".pageBtn");

if(!btn) return;

const page = btn.dataset.page;

if(page){
showPage(page);
}

});

carregarEscolas();

});

/* ================= CRIAR ESCOLA ================= */
async function criarEscola(){

const nome = document.getElementById("nomeEscola").value;
const provincia = document.getElementById("provincia").value;
const municipio = document.getElementById("municipio").value;
const anoLetivo = document.getElementById("anoLetivo").value;
const email = document.getElementById("email").value;
const senha = document.getElementById("senhaEscola").value;

if(!nome || !senha){
alert("Preenche tudo!");
return;
}

const ref = await addDoc(collection(db,"escolas"),{
nome,
provincia,
municipio,
anoLetivo,
email,
senha,
criadoEm: Date.now()
});

alert("Escola criada! ID: " + ref.id);

carregarEscolas();
}

/* ================= LISTAR ESCOLAS ================= */
async function carregarEscolas(){

const box = document.getElementById("listaEscolas");
box.innerHTML = "";

const snap = await getDocs(collection(db,"escolas"));

snap.forEach(d=>{

const e = d.data();

box.innerHTML += `
<div class="card">
<h3>${e.nome}</h3>
<p>ID: ${d.id}</p>

<button onclick="abrirLogin('${d.id}')">Entrar</button>
</div>
`;

});

}

/* ================= ABRIR LOGIN ================= */
window.abrirLogin = function(id){

document.getElementById("portal").classList.add("hidden");
document.getElementById("loginEscola").classList.remove("hidden");

document.getElementById("idEscola").value = id;

};

/* ================= LOGIN ================= */
async function loginEscola(){

const id = document.getElementById("idEscola").value;
const senha = document.getElementById("senhaLogin").value;

const snap = await getDoc(doc(db,"escolas",id));

if(!snap.exists()){
alert("Escola não existe");
return;
}

const e = snap.data();

if(e.senha !== senha){
alert("Senha errada");
return;
}

document.getElementById("loginEscola").classList.add("hidden");
document.getElementById("dashboard").classList.remove("hidden");

document.getElementById("nomeEscolaAtiva").innerText = e.nome;
document.getElementById("nivelEscolaAtiva").innerText = e.anoLetivo;

}

/* ================= SUPER ADMIN ================= */
function abrirSuperAdmin(){

document.getElementById("portal").classList.add("hidden");
document.getElementById("superAdmin").classList.remove("hidden");

}

function validarSuperAdmin(){

const senha = document.getElementById("senhaSuperAdmin").value;

if(senha === "0987"){

document.getElementById("superAdmin").classList.add("hidden");
document.getElementById("dashboard").classList.remove("hidden");

document.getElementById("nomeEscolaAtiva").innerText = "SUPER ADMIN";
document.getElementById("nivelEscolaAtiva").innerText = "CONTROLO GLOBAL";

} else {
alert("Senha errada");
}

}

/* ================= NAVIGATION ================= */
window.showPage = function(id){

document.querySelectorAll(".page")
.forEach(p => p.classList.remove("active"));

document.getElementById(id)?.classList.add("active");

};

/* ================= SAIR ================= */
window.sair = function(){

document.getElementById("dashboard").classList.add("hidden");
document.getElementById("portal").classList.remove("hidden");

};
