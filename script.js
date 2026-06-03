import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore, collection, addDoc, getDocs, deleteDoc, doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ================= FIREBASE =================
const app = initializeApp({
apiKey: "SUA_API_KEY",
authDomain: "sac-escolar.firebaseapp.com",
projectId: "sac-escolar"
});

const db = getFirestore(app);
const storage = getStorage(app);

// ================= MENU =================
function mostrar(id){
document.querySelectorAll(".pagina").forEach(p=>p.classList.remove("ativa"));
document.getElementById(id).classList.add("ativa");
}

// ================= ADMIN =================
function entrarAdmin(){
const senha = document.getElementById("senhaAdmin").value;

if(senha === "Admin123"){
mostrar("admin");
carregarTudo();
}else alert("Senha errada");
}

// ================= SISTEMA =================
async function toggleSistema(){
const refSys = doc(db,"config","system");
const snap = await getDoc(refSys);

const estado = snap.exists()? !snap.data().ativo:true;

await setDoc(refSys,{ativo:estado});

document.getElementById("estadoSistema").innerText =
estado ? "ABERTO" : "FECHADO";
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

const inicio = document.getElementById("inicioPublicacoes");
const lista = document.getElementById("listaPublicacoesPublicas");

inicio.innerHTML = "";
lista.innerHTML = "";

const snap = await getDocs(collection(db,"publicacoes"));

snap.forEach(d=>{
const p = d.data();

const html = `
<div class="card">
<h3>${p.titulo}</h3>
<p>${p.texto}</p>

<!-- COMENTÁRIOS -->
<input id="c-${d.id}" placeholder="Comentário">
<button onclick="comentar('${d.id}')">Comentar</button>

<div id="l-${d.id}"></div>

<button onclick="apagarPublicacao('${d.id}')">Apagar</button>
</div>
`;

inicio.innerHTML += html;
lista.innerHTML += html;

carregarComentarios(d.id);
});
}

async function apagarPublicacao(id){
await deleteDoc(doc(db,"publicacoes",id));
carregarPublicacoes();
}

// ================= COMENTÁRIOS =================
async function comentar(postId){

const input = document.getElementById("c-"+postId);

if(!input.value) return;

await addDoc(collection(db,"publicacoes",postId,"comentarios"),{
texto: input.value,
data: Date.now()
});

input.value = "";

carregarComentarios(postId);
}

async function carregarComentarios(postId){

const box = document.getElementById("l-"+postId);
if(!box) return;

box.innerHTML = "";

const snap = await getDocs(collection(db,"publicacoes",postId,"comentarios"));

snap.forEach(d=>{
box.innerHTML += `<div>💬 ${d.data().texto}</div>`;
});
}

// ================= PAUTAS =================
async function criarPauta(){
await addDoc(collection(db,"pautas"),{
classe: document.getElementById("classePauta").value,
disciplina: document.getElementById("disciplinaPauta").value,
senha: document.getElementById("senhaPauta").value,
link: document.getElementById("linkPauta").value
});

carregarPautas();
}

async function carregarPautas(){

const select = document.getElementById("pautaSelect");

select.innerHTML = `<option value="">Selecione</option>`;

const snap = await getDocs(collection(db,"pautas"));

snap.forEach(d=>{
const p = d.data();

select.innerHTML += `
<option value="${d.id}">
${p.classe} - ${p.disciplina}
</option>`;
});
}

async function entrarProfessor(){

const id = document.getElementById("pautaSelect").value;
const senha = document.getElementById("senhaProfessor").value;

const snap = await getDoc(doc(db,"pautas",id));

if(snap.exists() && snap.data().senha === senha){
window.open(snap.data().link,"_blank");
}else alert("Erro login");
}

// ================= ALUNO =================
async function loginAluno(){

const senha = document.getElementById("senhaAluno").value;

const turmas = await getDocs(collection(db,"turmas"));

for(const t of turmas.docs){

const alunos = await getDocs(collection(db,"turmas",t.id,"alunos"));

for(const a of alunos.docs){

const d = a.data();

if(d.senha === senha){

const pdf = await getDoc(doc(db,"config","pdf"));

if(pdf.exists()){
window.open(pdf.data().url + "#page=" + d.pagina,"_blank");
return;
}

}

}

}

alert("Senha inválida");
}

// ================= PDF =================
async function uploadPDF(file){

const r = ref(storage,"boletim.pdf");
await uploadBytes(r,file);

const url = await getDownloadURL(r);

await setDoc(doc(db,"config","pdf"),{url});

alert("PDF carregado");
}

// ================= SENHAS =================
async function listarSenhas(){

const box = document.getElementById("listaSenhas");
box.innerHTML = "";

const turmas = await getDocs(collection(db,"turmas"));

for(const t of turmas.docs){

box.innerHTML += `<h4>${t.id}</h4>`;

const alunos = await getDocs(collection(db,"turmas",t.id,"alunos"));

alunos.forEach(a=>{
const d = a.data();

box.innerHTML += `
<div class="card">
${d.nome} → ${d.senha}
<button onclick="apagarAluno('${t.id}','${a.id}')">Apagar</button>
</div>`;
});
}
}

async function apagarAluno(t,id){
await deleteDoc(doc(db,"turmas",t,"alunos",id));
listarSenhas();
}

// ================= INIT =================
async function carregarTudo(){
carregarPublicacoes();
carregarPautas();
listarSenhas();
}

// ================= EXPORT =================
window.mostrar = mostrar;
window.entrarAdmin = entrarAdmin;
window.toggleSistema = toggleSistema;

window.criarPublicacao = criarPublicacao;
window.carregarPublicacoes = carregarPublicacoes;
window.apagarPublicacao = apagarPublicacao;

window.comentar = comentar;
window.carregarComentarios = carregarComentarios;

window.criarPauta = criarPauta;
window.carregarPautas = carregarPautas;
window.entrarProfessor = entrarProfessor;

window.loginAluno = loginAluno;
window.uploadPDF = uploadPDF;

window.listarSenhas = listarSenhas;
window.apagarAluno = apagarAluno;
