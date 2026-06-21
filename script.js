import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
getDocs,
getDoc,
doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ================= FIREBASE ================= */
const firebaseConfig = {
apiKey: "SUA_API_KEY",
authDomain: "escola-digital-47497.firebaseapp.com",
projectId: "escola-digital-47497"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= STATE ================= */
let escolaAtual = null;

const $ = (id)=>document.getElementById(id);

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded",()=>{

$("btnCriarEscola").onclick = criarEscola;
$("btnLoginEscola").onclick = loginEscola;
$("btnCriarAluno").onclick = criarAluno;
$("btnCriarTurma").onclick = criarTurma;

carregarEscolas();
});

/* ================= NAV ================= */
window.showPage = function(id){

document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
$(id).classList.add("active");

};

window.sair = ()=>location.reload();

/* ================= SUPER ADMIN ================= */
window.abrirSuperAdmin = function(){
$("portal").classList.add("hidden");
$("superAdmin").classList.remove("hidden");
};

window.validarSuperAdmin = function(){

if($("senhaSuperAdmin").value !== "0987"){
return alert("Senha errada");
}

$("superAdmin").classList.add("hidden");
$("superAdminDashboard").classList.remove("hidden");

loadAdmin();
};

/* ================= PDF ================= */
window.importarPDF = async function(){

const file = $("pdfFile").files[0];
const turma = $("turmaPDF").value;

if(!file || !turma) return alert("Preenche tudo");

const pdf = await pdfjsLib.getDocument({
data: new Uint8Array(await file.arrayBuffer())
}).promise;

alert("PDF carregado OK");

};

/* ================= ESCOLAS ================= */
async function criarEscola(){

await addDoc(collection(db,"escolas"),{
nome:$("nomeEscola").value,
provincia:$("provincia").value,
municipio:$("municipio").value,
ano:$("anoLetivo").value,
senha:$("senhaEscola").value
});

carregarEscolas();
}

async function carregarEscolas(){

const box = $("listaEscolas");
box.innerHTML="";

const snap = await getDocs(collection(db,"escolas"));

snap.forEach(d=>{
box.innerHTML += `
<div class="card">
${d.data().nome}
<button onclick="entrar('${d.id}')">Entrar</button>
</div>`;
});
}

window.entrar = async function(id){
escolaAtual = id;

$("portal").classList.add("hidden");
$("loginEscola").classList.remove("hidden");

$("idEscola").value = id;
};

window.loginEscola = async function(){

const snap = await getDoc(doc(db,"escolas",$("idEscola").value));

if(!snap.exists()) return alert("Não existe");
if(snap.data().senha !== $("senhaLogin").value) return alert("Erro");

$("loginEscola").classList.add("hidden");
$("dashboard").classList.remove("hidden");

$("nomeEscolaAtiva").innerText = snap.data().nome;
};

/* ================= PLACEHOLDER ================= */
async function criarAluno(){}
async function criarTurma(){}
async function loadAdmin(){}
