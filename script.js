import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* 🔥 FIREBASE */
const app = initializeApp({
apiKey: "SUA_API_KEY",
authDomain: "SEU_PROJETO.firebaseapp.com",
projectId: "SEU_PROJETO"
});

const db = getFirestore(app);

/* =========================
CRIAR ESCOLA
========================= */
window.addEventListener("DOMContentLoaded", () => {

const btn = document.getElementById("btnCriarEscola");

if(!btn){
console.error("Botão não encontrado");
return;
}

btn.addEventListener("click", async () => {

const nome = document.getElementById("nomeEscola").value.trim();
const provincia = document.getElementById("provincia").value.trim();
const municipio = document.getElementById("municipio").value.trim();
const anoLetivo = document.getElementById("anoLetivo").value.trim();

if(!nome || !provincia || !municipio || !anoLetivo){
alert("Preenche todos os campos!");
return;
}

try{

const ref = await addDoc(collection(db,"escolas"),{
nome,
provincia,
municipio,
anoLetivo,
criadoEm: Date.now()
});

alert("Escola criada com sucesso!");

carregarEscolas();

}catch(err){
console.error(err);
alert("Erro: " + err.message);
}

});

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
</div>
`;

});

}
