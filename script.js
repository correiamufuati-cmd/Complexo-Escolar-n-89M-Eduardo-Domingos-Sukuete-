import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
getDocs,
getDoc,
doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp({
apiKey: "SUA_API_KEY",
authDomain: "SEU_PROJECT.firebaseapp.com",
projectId: "SEU_PROJECT"
});

const db = getFirestore(app);

let escolaAtual = null;

/* ================= CRIAR ESCOLA ================= */
document.getElementById("btnCriarEscola").onclick = async ()=>{

const ref = await addDoc(collection(db,"escolas"),{
nome: nomeEscola.value,
provincia: provincia.value,
municipio: municipio.value,
ano: anoLetivo.value,
nivel: nivelEnsino.value,
email: email.value,
senha: senhaEscola.value
});

alert("Escola criada: " + ref.id);
carregarEscolas();

}

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

<button onclick="abrirLogin('${d.id}','${e.nome}')">
Entrar
</button>

</div>
`;

});

}

/* ================= LOGIN ESCOLA ================= */
window.abrirLogin = function(id,nome){

escolaAtual = id;

portal.classList.add("hidden");
loginEscola.classList.remove("hidden");

}

/* ================= VALIDAR ================= */
document.getElementById("btnLoginEscola").onclick = async ()=>{

const snap = await getDoc(doc(db,"escolas",idEscola.value));

if(snap.exists() && snap.data().senha === senhaLogin.value){

const e = snap.data();

loginEscola.classList.add("hidden");
dashboard.classList.remove("hidden");

nomeEscolaAtiva.innerText = e.nome;
nivelEscolaAtiva.innerText = e.nivel;

}else{
alert("Erro login");
}

}

/* ================= SUPER ADMIN ================= */
window.abrirSuperAdmin = ()=>{

portal.classList.add("hidden");
superAdmin.classList.remove("hidden");

}

window.validarSuperAdmin = ()=>{

if(senhaSuperAdmin.value === "0987"){
alert("Super Admin OK");
}else{
alert("Erro");
}

}

/* ================= DASHBOARD ================= */
window.showPage = (id)=>{

document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
document.getElementById(id).classList.add("active");

}

/* ================= SAIR ================= */
window.sair = ()=>{

dashboard.classList.add("hidden");
portal.classList.remove("hidden");

}
