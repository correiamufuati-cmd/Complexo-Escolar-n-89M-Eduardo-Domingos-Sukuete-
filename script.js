import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
getDocs,
getDoc,
doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* FIREBASE */
const app = initializeApp({
apiKey: "SUA_API_KEY",
authDomain: "SEU_PROJECT.firebaseapp.com",
projectId: "SEU_PROJECT"
});

const db = getFirestore(app);

/* ESTADO */
let escolaAtual = null;

/* ================= CRIAR ESCOLA ================= */
document.getElementById("btnCriarEscola").addEventListener("click", async () => {

const nome = nomeEscola.value;
const provincia = provincia.value;
const municipio = municipio.value;
const ano = anoLetivo.value;
const nivel = nivelEnsino.value;
const email = email.value;
const senha = senhaEscola.value;

const ref = await addDoc(collection(db,"escolas"),{
nome, provincia, municipio, ano, nivel, email, senha
});

alert("Escola criada! ID: " + ref.id);

carregarEscolas();

});

/* ================= LISTAR ================= */
async function carregarEscolas(){

const box = document.getElementById("listaEscolas");
box.innerHTML = "";

const snap = await getDocs(collection(db,"escolas"));

snap.forEach(d=>{

const e = d.data();

box.innerHTML += `
<div class="card">
<h3>${e.nome}</h3>
<p>${e.nivel}</p>

<button onclick="abrirLogin('${d.id}','${e.nome}','${e.nivel}')">
Entrar
</button>

</div>
`;

});

}

/* ================= LOGIN ESCOLA ================= */
window.abrirLogin = function(id,nome,nivel){

escolaAtual = id;

portal.classList.add("hidden");
loginEscola.classList.remove("hidden");

}

/* LOGIN VALIDAR */
document.getElementById("btnLoginEscola").onclick = async ()=>{

const id = idEscolaLogin.value;
const senha = senhaLoginEscola.value;

const snap = await getDoc(doc(db,"escolas",id));

if(snap.exists() && snap.data().senha === senha){

const e = snap.data();

loginEscola.classList.add("hidden");
dashboardEscola.classList.remove("hidden");

nomeEscolaAtiva.innerText = e.nome;
nivelEscolaAtiva.innerText = e.nivel;

escolaAtual = id;

}else{
alert("Dados inválidos");
}

}

/* ================= SUPER ADMIN ================= */
window.validarSuperAdmin = function(){

const senha = senhaSuperAdmin.value;

if(senha === "0987"){
alert("Bem-vindo Super Admin");
}else{
alert("Senha incorreta");
}

}

/* ================= DASHBOARD NAV ================= */
window.showPage = function(page){

document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
document.getElementById(page).classList.add("active");

}

/* ================= SAIR ================= */
window.sairEscola = function(){

dashboardEscola.classList.add("hidden");
portal.classList.remove("hidden");

}
