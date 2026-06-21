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

/* ================= STATE ================= */
let escolaAtual = null;

/* ================= SAFE DOM ================= */
const $ = (id) => document.getElementById(id);

const show = (id) => {
const el = $(id);
if (el) el.classList.remove("hidden");
};

const hide = (id) => {
const el = $(id);
if (el) el.classList.add("hidden");
};

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

$("btnCriarEscola")?.addEventListener("click", criarEscola);
$("btnLoginEscola")?.addEventListener("click", loginEscola);
$("btnCriarPauta")?.addEventListener("click", criarPauta);

/* 🔥 TURMAS */
$("btnCriarTurma")?.addEventListener("click", criarTurma);

carregarEscolas();

});

/* ================= ESCOLAS ================= */
async function criarEscola(){

const nome = $("nomeEscola")?.value;
const senha = $("senhaEscola")?.value;

if(!nome || !senha){
alert("Preenche nome e senha");
return;
}

const ref = await addDoc(collection(db,"escolas"),{
nome,
senha,
criadoEm: Date.now()
});

alert("Escola criada: " + ref.id);
carregarEscolas();
}

async function carregarEscolas(){

const box = $("listaEscolas");
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

escolaAtual = id;

hide("portal");
show("loginEscola");

$("idEscola").value = id;

};

window.loginEscola = async function(){

const id = $("idEscola")?.value;
const senha = $("senhaLogin")?.value;

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

$("nomeEscolaAtiva").innerText = data.nome;
$("nivelEscolaAtiva").innerText = data.anoLetivo || "";

showPage("home");

logAcesso("escola", id);
};

/* ================= TURMAS ================= */
async function criarTurma(){

const classe = $("classeTurma")?.value;
const turma = $("nomeTurma")?.value;
const ano = $("anoTurma")?.value;

if(!classe || !turma || !ano){
alert("Preenche tudo");
return;
}

if(!escolaAtual){
alert("Nenhuma escola ativa");
return;
}

await addDoc(collection(db,"turmas"),{
escolaId: escolaAtual,
classe,
turma,
anoLetivo: ano,
criadoEm: Date.now()
});

alert("Turma criada com sucesso");

loadTurmas();
}

async function loadTurmas(){

const box = $("listaTurmas");
if(!box) return;

box.innerHTML = "";

const snap = await getDocs(collection(db,"turmas"));

snap.forEach(d=>{

const t = d.data();
if(t.escolaId !== escolaAtual) return;

box.innerHTML += `
<div class="card">
<strong>${t.classe} - ${t.turma}</strong>
<p>Ano: ${t.anoLetivo}</p>
</div>
`;

});

}

/* ================= PAUTAS ================= */
window.criarPauta = async function(){

const classe = $("classePauta")?.value;
const turma = $("turmaPauta")?.value;
const disciplina = $("disciplinaPauta")?.value;

if(!classe || !turma || !disciplina){
alert("Preenche tudo");
return;
}

await addDoc(collection(db,"pautas"),{
escolaId: escolaAtual,
classe,
turma,
disciplina,
data: Date.now()
});

alert("Pauta criada");
loadPautas();
};

async function loadPautas(){

const box = $("listaPautas");
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
hide("portal");
show("superAdmin");
};

window.validarSuperAdmin = function(){

const senha = $("senhaSuperAdmin")?.value;

if(senha !== "0987"){
alert("Errado");
return;
}

hide("superAdmin");
show("superAdminDashboard");

loadAdminEscolas();
loadStats();
};

/* ================= NAV ================= */
window.showPage = function(id){

document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));

const el = $(id);
if(el) el.classList.add("active");

if(id === "turmas") loadTurmas();
if(id === "pautas") loadPautas();

};

/* ================= ADMIN ================= */
window.showAdminPage = function(id){

document.querySelectorAll(".adminPage").forEach(p=>p.style.display="none");

const el = document.getElementById(id);
if(el) el.style.display="block";

if(id==="escolas") loadAdminEscolas();
if(id==="stats") loadStats();

};

/* ================= LOGS ================= */
async function logAcesso(tipo, escolaId=null){

try{

const res = await fetch("https://ipapi.co/json/");
const ip = await res.json();

await addDoc(collection(db,"acessos"),{
tipo,
escolaId,
ip: ip.ip,
cidade: ip.city,
pais: ip.country_name,
data: new Date().toISOString()
});

}catch(e){
console.log(e);
}

}

/* ================= SAIR ================= */
window.sair = function(){
location.reload();
};
