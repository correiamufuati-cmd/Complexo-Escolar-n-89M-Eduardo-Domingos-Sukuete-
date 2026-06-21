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
apiKey: "AIzaSyDD326KBs3K1vsJsLNhfenFlsLFjRljxNE",
authDomain: "escola-digital-47497.firebaseapp.com",
projectId: "escola-digital-47497"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= CORE ================= */
const $ = (id) => document.getElementById(id);

const show = (id) => document.getElementById(id)?.classList.remove("hidden");
const hide = (id) => document.getElementById(id)?.classList.add("hidden");

let escolaAtual = null;

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

console.log("Sistema iniciado ✔");

$("btnCriarEscola")?.addEventListener("click", criarEscola);
$("btnLoginEscola")?.addEventListener("click", loginEscola);

$("btnCriarTurma")?.addEventListener("click", criarTurma);
$("btnCriarAluno")?.addEventListener("click", criarAluno);
$("btnImportarPDF")?.addEventListener("click", importarPDF);

$("btnCriarMiniPauta")?.addEventListener("click", criarMiniPauta);

carregarEscolas();

});

/* ================= ESCOLAS ================= */
async function criarEscola(){

const nome = $("nomeEscola").value;
const senha = $("senhaEscola").value;

if(!nome || !senha){
alert("Preenche tudo");
return;
}

await addDoc(collection(db,"escolas"),{
nome,
senha,
criadoEm: Date.now()
});

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
<button onclick="abrirLogin('${d.id}')">Entrar</button>
</div>`;
});
}

/* ================= LOGIN ================= */
window.abrirLogin = function(id){
escolaAtual = id;

hide("portal");
show("loginEscola");

$("idEscola").value = id;
};

window.loginEscola = async function(){

const id = $("idEscola").value;
const senha = $("senhaLogin").value;

const snap = await getDoc(doc(db,"escolas",id));

if(!snap.exists()){
alert("Escola não existe");
return;
}

if(snap.data().senha !== senha){
alert("Senha errada");
return;
}

hide("loginEscola");
show("dashboard");

$("nomeEscolaAtiva").innerText = snap.data().nome;

showPage("home");
};

/* ================= NAV ================= */
window.showPage = function(id){

document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));

document.getElementById(id).classList.add("active");

if(id==="alunos") loadAlunos();
if(id==="turmas") loadTurmas();
if(id==="pautas") loadMiniPautas();
};

window.sair = function(){
location.reload();
};

/* ================= TURMAS ================= */
async function criarTurma(){

if(!escolaAtual) return;

await addDoc(collection(db,"turmas"),{
escolaId: escolaAtual,
classe: $("classeTurma").value,
turma: $("nomeTurma").value,
ano: $("anoTurma").value
});

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

box.innerHTML += `<div class="card">${t.classe} ${t.turma}</div>`;
});
}

/* ================= ALUNOS ================= */
async function criarAluno(){

if(!escolaAtual) return;

await addDoc(collection(db,"alunos"),{
escolaId: escolaAtual,
nome: $("nomeAluno").value,
turma: $("turmaAluno").value,
matricula: "2026-"+Math.floor(Math.random()*999999),
username: $("nomeAluno").value.toLowerCase().replace(/\s/g,"").slice(0,6),
senha: Math.random().toString(36).slice(2,10).toUpperCase()
});

loadAlunos();
}

async function loadAlunos(){

const box = $("listaAlunos");
if(!box) return;

box.innerHTML = "";

const snap = await getDocs(collection(db,"alunos"));

snap.forEach(d=>{
const a = d.data();
if(a.escolaId !== escolaAtual) return;

box.innerHTML += `<div class="card">${a.nome} - ${a.turma}</div>`;
});
}

/* ================= PDF IMPORT ================= */
async function importarPDF(){

if(!escolaAtual) return;

const file = $("pdfFile").files[0];
const turma = $("turmaPDF").value;

if(!file){
alert("Seleciona PDF");
return;
}

const reader = new FileReader();

reader.onload = async function(){

const pdf = await pdfjsLib.getDocument({
data: new Uint8Array(this.result)
}).promise;

let texto = "";

for(let i=1;i<=pdf.numPages;i++){
const page = await pdf.getPage(i);
const content = await page.getTextContent();

texto += content.items.map(x=>x.str).join(" ") + "\n";
}

const nomes = texto.split("\n").filter(n=>n.trim().length>3);

for(const nome of nomes){

await addDoc(collection(db,"alunos"),{
escolaId: escolaAtual,
nome,
turma,
matricula: "2026-"+Math.floor(Math.random()*999999),
username: nome.toLowerCase().replace(/\s/g,"").slice(0,6),
senha: Math.random().toString(36).slice(2,10).toUpperCase()
});

}

loadAlunos();
alert("PDF importado com sucesso!");
};

reader.readAsArrayBuffer(file);
}

/* ================= MINI PAUTAS ================= */
async function criarMiniPauta(){

if(!escolaAtual) return;

await addDoc(collection(db,"minipautas"),{
escolaId: escolaAtual,
classe: $("mpClasse").value,
turma: $("mpTurma").value,
disciplina: $("mpDisciplina").value,
professor: $("mpProfessor").value
});

loadMiniPautas();
}

async function loadMiniPautas(){

const box = $("listaMiniPautas");
if(!box) return;

box.innerHTML = "";

const snap = await getDocs(collection(db,"minipautas"));

snap.forEach(d=>{
const m = d.data();
if(m.escolaId !== escolaAtual) return;

box.innerHTML += `<div class="card">${m.disciplina} - ${m.turma}</div>`;
});
}
