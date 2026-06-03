import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore, collection, addDoc, getDocs, deleteDoc, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= FIREBASE =================
const app = initializeApp({
apiKey: "SUA_API_KEY",
authDomain: "sac-escolar.firebaseapp.com",
projectId: "sac-escolar"
});

const db = getFirestore(app);

// ================= UTIL =================
function gerarSenha(){
return Math.random().toString(36).substring(2,8).toUpperCase();
}

// ================= MENU =================
function mostrar(id){
document.querySelectorAll(".pagina").forEach(p=>p.classList.remove("ativa"));
document.getElementById(id).classList.add("ativa");
}

// ================= ADMIN LOGIN =================
function entrarAdmin(){
const senha = document.getElementById("senhaAdmin").value;

if(senha === "Admin123"){
mostrar("admin");
listarSenhas();
carregarPautas();
carregarPublicacoes();
}else{
alert("Senha incorreta");
}
}

// ================= IMPORTAR EXCEL =================
async function importarExcel(file){

const data = await file.arrayBuffer();
const wb = XLSX.read(data,{type:"array"});

for(const sheetName of wb.SheetNames){

const sheet = wb.Sheets[sheetName];
const json = XLSX.utils.sheet_to_json(sheet);

for(const aluno of json){

await addDoc(collection(db,"turmas",sheetName,"alunos"),{
nome: aluno.Nome,
pagina: aluno.Pagina,
senha: gerarSenha()
});

}

}

alert("Importação concluída!");
listarSenhas();
}

// ================= LISTAR SENHAS =================
async function listarSenhas(){

const box = document.getElementById("listaSenhas");
if(!box) return;

box.innerHTML = "";

const turmas = await getDocs(collection(db,"turmas"));

for(const t of turmas.docs){

box.innerHTML += `<h3>${t.id}</h3>`;

const alunos = await getDocs(collection(db,"turmas",t.id,"alunos"));

alunos.forEach(a=>{
const d = a.data();

box.innerHTML += `
<div class="card">
<strong>${d.nome}</strong><br>
Senha: ${d.senha}<br>
<button onclick="apagarAluno('${t.id}','${a.id}')">Apagar</button>
</div>`;
});

}
}

// ================= APAGAR ALUNO =================
async function apagarAluno(turma,id){
await deleteDoc(doc(db,"turmas",turma,"alunos",id));
listarSenhas();
}

// ================= LOGIN ALUNO =================
async function loginAluno(){

const senha = document.getElementById("senhaAluno").value;

const turmas = await getDocs(collection(db,"turmas"));

for(const t of turmas.docs){

const alunos = await getDocs(collection(db,"turmas",t.id,"alunos"));

for(const a of alunos.docs){

const d = a.data();

if(d.senha === senha){

window.open(`boletim.pdf#page=${d.pagina}`,"_blank");
return;

}

}

}

alert("Senha inválida");
}

// ================= PAUTAS (EXCEL ONLINE) =================
async function entrarProfessor(){

const turma = document.getElementById("pautaSelect").value;
const senha = document.getElementById("senhaProfessor").value;

const snap = await getDoc(doc(db,"pautas",turma));

if(!snap.exists()){
alert("Pauta não encontrada");
return;
}

const p = snap.data();

if(p.senha === senha){
window.open(p.link,"_blank");
}else{
alert("Senha incorreta");
}

}

// ================= PAUTAS LISTAR =================
async function carregarPautas(){

const select = document.getElementById("pautaSelect");
if(!select) return;

select.innerHTML = `<option value="">Selecionar...</option>`;

const snap = await getDocs(collection(db,"pautas"));

snap.forEach(d=>{
const p = d.data();

select.innerHTML += `
<option value="${d.id}">
${p.classe} - ${p.disciplina}
</option>`;
});

}

// ================= PUBLICAÇÕES =================
async function criarPublicacao(){

await addDoc(collection(db,"publicacoes"),{
titulo: document.getElementById("tituloPub").value,
texto: document.getElementById("textoPub").value
});

carregarPublicacoes();
}

async function carregarPublicacoes(){

const box = document.getElementById("listaPublicacoesPublicas");
if(!box) return;

box.innerHTML = "";

const snap = await getDocs(collection(db,"publicacoes"));

snap.forEach(d=>{
const p = d.data();

box.innerHTML += `
<div class="card">
<h4>${p.titulo}</h4>
<p>${p.texto}</p>
<button onclick="apagarPublicacao('${d.id}')">Apagar</button>
</div>`;
});

}

// ================= APAGAR PUBLICAÇÃO =================
async function apagarPublicacao(id){
await deleteDoc(doc(db,"publicacoes",id));
carregarPublicacoes();
}

// ================= EXPORT =================
window.mostrar = mostrar;
window.entrarAdmin = entrarAdmin;

window.importarExcel = importarExcel;

window.loginAluno = loginAluno;

window.carregarPautas = carregarPautas;
window.entrarProfessor = entrarProfessor;

window.criarPublicacao = criarPublicacao;
window.carregarPublicacoes = carregarPublicacoes;

window.apagarAluno = apagarAluno;
window.apagarPublicacao = apagarPublicacao;

window.listarSenhas = listarSenhas;
