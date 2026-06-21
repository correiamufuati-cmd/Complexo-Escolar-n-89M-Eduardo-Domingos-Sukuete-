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
apiKey: "SUA_API_KEY",
authDomain: "escola-digital-47497.firebaseapp.com",
projectId: "escola-digital-47497"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let escolaAtual = null;
const $ = id => document.getElementById(id);

/* INIT */
document.addEventListener("DOMContentLoaded",()=>{

$("btnCriarEscola").onclick = criarEscola;
$("btnLoginEscola").onclick = loginEscola;
$("btnCriarAluno").onclick = criarAluno;
$("btnCriarTurma").onclick = criarTurma;
$("btnCriarProfessor").onclick = criarProfessor;

carregarEscolas();
});

/* NAV */
window.showPage = (id)=>{
document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
$(id).classList.add("active");
};

window.sair = ()=>location.reload();

/* SUPER ADMIN */
window.abrirSuperAdmin = ()=>{
$("portal").classList.add("hidden");
$("superAdmin").classList.remove("hidden");
};

window.validarSuperAdmin = ()=>{
if($("senhaSuperAdmin").value!=="0987")return alert("Erro");
$("superAdmin").classList.add("hidden");
$("dashboard").classList.remove("hidden");
};

/* PDF/EXCEL */
window.importarPDF = async ()=>{
const file = $("pdfFile").files[0];
if(!file)return alert("Seleciona ficheiro");

const pdf = await pdfjsLib.getDocument({
data:new Uint8Array(await file.arrayBuffer())
}).promise;

alert("Ficheiro carregado");
};

/* ESCOLAS */
async function criarEscola(){
await addDoc(collection(db,"escolas"),{
nome:$("nomeEscola").value,
senha:$("senhaEscola").value
});
carregarEscolas();
}

async function carregarEscolas(){
const box=$("listaEscolas");
box.innerHTML="";
const snap=await getDocs(collection(db,"escolas"));

snap.forEach(d=>{
box.innerHTML+=`
<div class="card">
${d.data().nome}
<button onclick="entrar('${d.id}')">Entrar</button>
</div>`;
});
}

window.entrar=async(id)=>{
escolaAtual=id;
$("portal").classList.add("hidden");
$("loginEscola").classList.remove("hidden");
$("idEscola").value=id;
};

window.loginEscola=async()=>{
const snap=await getDoc(doc(db,"escolas",$("idEscola").value));
if(!snap.exists())return alert("Não existe");
if(snap.data().senha!==$("senhaLogin").value)return alert("Erro");

$("loginEscola").classList.add("hidden");
$("dashboard").classList.remove("hidden");
$("nomeEscolaAtiva").innerText=snap.data().nome;
};

/* ALUNO */
async function criarAluno(){
await addDoc(collection(db,"alunos"),{
nome:$("nomeAluno").value,
turma:$("turmaAluno").value,
escolaId:escolaAtual
});
}

/* TURMA */
async function criarTurma(){
await addDoc(collection(db,"turmas"),{
classe:$("classeTurma").value,
nome:$("nomeTurma").value,
ano:$("anoTurma").value,
escolaId:escolaAtual
});
}

/* PROFESSOR */
async function criarProfessor(){
await addDoc(collection(db,"professores"),{
nome:$("nomeProfessor").value,
disciplina:$("discProfessor").value,
escolaId:escolaAtual
});
}
