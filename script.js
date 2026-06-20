import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
getDocs,
doc,
setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔥 Firebase
const app = initializeApp({
apiKey: "SUA_API_KEY",
authDomain: "SEU_PROJETO.firebaseapp.com",
projectId: "SEU_PROJETO"
});

const db = getFirestore(app);

// 📌 escola ativa
let currentSchool = null;

/* =========================
CRIAR ESCOLA
========================= */
document.getElementById("btnCriarEscola").addEventListener("click", async () => {

const escola = {
nome: document.getElementById("nomeEscola").value,
provincia: document.getElementById("provincia").value,
municipio: document.getElementById("municipio").value,
anoLetivo: document.getElementById("anoLetivo").value,
criadoEm: Date.now()
};

const ref = await addDoc(collection(db, "escolas"), escola);

alert("Escola criada com sucesso!");

carregarEscolas();
});

/* =========================
LISTAR ESCOLAS
========================= */
async function carregarEscolas(){

const box = document.getElementById("listaEscolas");
box.innerHTML = "";

const snap = await getDocs(collection(db,"escolas"));

snap.forEach(d => {

const e = d.data();

box.innerHTML += `
<div class="card">
<h3>${e.nome}</h3>
<p>${e.provincia} - ${e.municipio}</p>

<button onclick="entrarEscola('${d.id}','${e.nome}')">
Entrar
</button>

</div>
`;

});

}

carregarEscolas();

/* =========================
ENTRAR NA ESCOLA
========================= */
window.entrarEscola = function(id,nome){

currentSchool = id;

document.getElementById("portal").classList.add("hidden");
document.getElementById("sistema").classList.remove("hidden");

document.getElementById("nomeEscolaAtiva").innerText = nome;

}

/* =========================
LOGIN SIMPLES (BASE)
========================= */
document.getElementById("btnLogin").addEventListener("click",()=>{

const senha = document.getElementById("senha").value;

if(senha === "1234"){
alert("Login OK (base)");
}else{
alert("Senha incorreta");
}

});

/* =========================
SAIR
========================= */
document.getElementById("btnSair").addEventListener("click",()=>{

currentSchool = null;

document.getElementById("portal").classList.remove("hidden");
document.getElementById("sistema").classList.add("hidden");

});
