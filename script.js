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

alert("Escola criada: " + ref.id);
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

/* ================= LOGIN ================= */
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

escolaAtual = id;

loginEscola.classList.add("hidden");
dashboard.classList.remove("hidden");

showPage("home");

};

/* ================= PAUTAS ================= */
window.criarPauta = async function(){

const classe = classePauta.value;
const turma = turmaPauta.value;
const disciplina = disciplinaPauta.value;

await addDoc(collection(db,"pautas"),{
escolaId: escolaAtual,
classe,
turma,
disciplina
});

alert("Pauta criada!");
carregarPautas();

};

async function carregarPautas(){

const box = document.getElementById("listaPautas");
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

if(senha === "0987"){
alert("Super Admin OK");
}else{
alert("Errado");
}

};

/* ================= NAV ================= */
window.showPage = function(id){

document.querySelectorAll(".page")
.forEach(p=>p.classList.remove("active"));

document.getElementById(id).classList.add("active");

};

/* ================= SAIR ================= */
window.sair = function(){

dashboard.classList.add("hidden");
portal.classList.remove("hidden");

};
