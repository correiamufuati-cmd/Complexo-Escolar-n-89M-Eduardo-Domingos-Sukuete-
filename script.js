import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* FIREBASE */
const app = initializeApp({
apiKey: "SUA_API_KEY",
authDomain: "SEU_PROJETO.firebaseapp.com",
projectId: "SEU_PROJETO"
});

const db = getFirestore(app);

/* ESCOLA ATIVA */
let currentSchool = null;

/* ================= CRIAR ESCOLA ================= */
window.addEventListener("DOMContentLoaded", () => {

document.getElementById("btnCriarEscola").addEventListener("click", async () => {

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

}catch(e){
alert("Erro: " + e.message);
}

});

carregarEscolas();

});

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
<p>${e.provincia} - ${e.municipio}</p>

<button onclick="entrarEscola('${d.id}','${e.nome}')">
Entrar
</button>

</div>
`;

});

}

/* ================= ENTRAR NA ESCOLA ================= */
window.entrarEscola = function(id,nome){

currentSchool = id;

document.getElementById("portal").classList.add("hidden");
document.getElementById("dashboardEscola").classList.remove("hidden");

document.getElementById("nomeEscolaAtiva").innerText = nome;

}

/* ================= NAVEGAÇÃO ================= */
function showPage(id){

document.querySelectorAll(".page").forEach(p=>{
p.classList.remove("active");
});

document.getElementById(id).classList.add("active");

}

/* MENU */
document.getElementById("navDashboard").onclick = ()=>showPage("pageDashboard");
document.getElementById("navAlunos").onclick = ()=>showPage("pageAlunos");
document.getElementById("navProfessores").onclick = ()=>showPage("pageProfessores");
document.getElementById("navPautas").onclick = ()=>showPage("pagePautas");
document.getElementById("navBoletins").onclick = ()=>showPage("pageBoletins");

/* ================= SAIR ================= */
document.getElementById("btnSairEscola").onclick = ()=>{

currentSchool = null;

document.getElementById("dashboardEscola").classList.add("hidden");
document.getElementById("portal").classList.remove("hidden");

}
