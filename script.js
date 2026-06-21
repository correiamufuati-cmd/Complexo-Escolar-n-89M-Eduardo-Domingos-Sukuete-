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

const firebaseConfig = {
apiKey: "AIzaSyDD326KBs3K1vsJsLNhfenFlsLFjRljxNE",
authDomain: "escola-digital-47497.firebaseapp.com",
projectId: "escola-digital-47497"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let escolaAtual = null;

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

document.getElementById("btnCriarEscola")
.addEventListener("click", criarEscola);

document.getElementById("btnLoginEscola")
.addEventListener("click", loginEscola);

carregarEscolas();

});

/* ================= ESCOLA ================= */
async function criarEscola(){

const nome = nomeEscola.value;
const senha = senhaEscola.value;

const ref = await addDoc(collection(db,"escolas"),{
nome,
senha,
criadoEm: Date.now()
});

alert("Criado: " + ref.id);
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

/* ================= LOGIN ESCOLA ================= */
window.abrirLogin = function(id){

escolaAtual = id;

portal.classList.add("hidden");
loginEscola.classList.remove("hidden");

};

window.loginEscola = async function(){

const id = idEscola.value;
const senha = senhaLogin.value;

const snap = await getDoc(doc(db,"escolas",id));

if(!snap.exists()) return alert("Erro");

if(snap.data().senha !== senha) return alert("Senha errada");

loginEscola.classList.add("hidden");
dashboard.classList.remove("hidden");

showPage("home");

};

/* ================= PAUTAS ================= */
window.criarPauta = async function(){

await addDoc(collection(db,"pautas"),{
escolaId: escolaAtual,
classe: classePauta.value,
turma: turmaPauta.value,
disciplina: disciplinaPauta.value
});

alert("Pauta criada!");
loadPautas();

};

async function loadPautas(){

const box = document.getElementById("listaPautas");
if(!box) return;

box.innerHTML = "";

const snap = await getDocs(collection(db,"pautas"));

snap.forEach(d=>{

const p = d.data();

if(p.escolaId !== escolaAtual) return;

box.innerHTML += `
<div class="card">
${p.classe} - ${p.turma} - ${p.disciplina}
</div>
`;

});

}

/* ================= SUPER ADMIN ================= */
window.abrirSuperAdmin = function(){

portal.classList.add("hidden");
superAdmin.classList.remove("hidden");

};

window.validarSuperAdmin = function(){

const senha = senhaSuperAdmin.value;

if(senha !== "0987") return alert("Errado");

superAdmin.classList.add("hidden");
superAdminDashboard.classList.remove("hidden");

loadAdminEscolas();
loadStats();

};

/* ================= ADMIN ================= */
async function loadAdminEscolas(){

const box = document.getElementById("escolas");
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

stats.innerHTML = `
<div class="card">
<h2>Total de escolas: ${total}</h2>
</div>
`;

}

/* ================= NAV ================= */
window.showPage = function(id){

document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
document.getElementById(id).classList.add("active");

};

/* ================= ADMIN NAV ================= */
window.showAdminPage = function(id){

document.querySelectorAll(".adminPage").forEach(p=>p.style.display="none");
document.getElementById(id).style.display="block";

if(id==="escolas") loadAdminEscolas();
if(id==="stats") loadStats();

};

/* ================= SAIR ================= */
window.sair = function(){

location.reload();

};
