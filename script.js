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

/* ================= STATE ================= */
let escolaAtual = null;

/* ================= HELPERS ================= */
const $ = (id) => document.getElementById(id);

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

$("btnCriarTurma")?.addEventListener("click", criarTurma);
$("btnCriarAluno")?.addEventListener("click", criarAluno);
$("btnImportarPDF")?.addEventListener("click", importarPDF);

carregarEscolas();

});

/* ================= TURMAS ================= */
async function criarTurma(){

const classe = $("classeTurma")?.value;
const turma = $("nomeTurma")?.value;
const ano = $("anoTurma")?.value;

if(!classe || !turma || !ano){
alert("Preenche tudo");
return;
}

await addDoc(collection(db,"turmas"),{
escolaId: escolaAtual,
classe,
turma,
anoLetivo: ano,
criadoEm: Date.now()
});

alert("Turma criada");

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
<p>${t.anoLetivo}</p>
</div>
`;

});

}

/* ================= ALUNOS ================= */
function gerarMatricula(){
return "2026-" + Math.floor(100000 + Math.random()*900000);
}

function gerarSenha(){
return Math.random().toString(36).substring(2,10).toUpperCase();
}

function gerarUsername(nome){
return nome.toLowerCase().replace(/\s/g,"").slice(0,6) + Math.floor(Math.random()*900);
}

async function criarAluno(){

const nome = $("nomeAluno")?.value;
const turma = $("turmaAluno")?.value;

await addDoc(collection(db,"alunos"),{
escolaId: escolaAtual,
nome,
turma,
matricula: gerarMatricula(),
username: gerarUsername(nome),
senha: gerarSenha(),
status: "ativo",
criadoEm: Date.now()
});

alert("Aluno criado");

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

box.innerHTML += `
<div class="card">
<h3>${a.nome}</h3>
<p>${a.turma}</p>
<p>${a.matricula}</p>
<p>${a.username}</p>
</div>
`;

});

}

/* ================= PDF IMPORT ================= */
async function importarPDF(){

const file = $("pdfFile")?.files[0];
const turma = $("turmaPDF")?.value;

if(!file || !turma){
alert("Seleciona PDF e turma");
return;
}

const reader = new FileReader();

reader.onload = async function(){

const typedarray = new Uint8Array(this.result);

const pdf = await pdfjsLib.getDocument({data: typedarray}).promise;

let texto = "";

for(let i=1;i<=pdf.numPages;i++){

const page = await pdf.getPage(i);
const content = await page.getTextContent();

texto += content.items.map(i=>i.str).join(" ") + "\n";
}

const nomes = texto
.split("\n")
.map(n=>n.trim())
.filter(n=>n.length > 3);

for(const nome of nomes){

await addDoc(collection(db,"alunos"),{
escolaId: escolaAtual,
nome,
turma,
matricula: gerarMatricula(),
username: gerarUsername(nome),
senha: gerarSenha(),
status: "ativo",
criadoEm: Date.now()
});

}

alert("Importação concluída!");
loadAlunos();

};

reader.readAsArrayBuffer(file);
}
