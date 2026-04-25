import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs,
  deleteDoc, doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "sac-escolar.firebaseapp.com",
  projectId: "sac-escolar"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// MENU
function mostrar(id) {
  document.querySelectorAll(".pagina").forEach(p => p.classList.remove("ativa"));
  document.getElementById(id).classList.add("ativa");
}

// SENHAS
function gerarSenha() {
  document.getElementById("senhaAcesso").value = Math.random().toString(36).substring(2,8);
}

function gerarSenhaFicheiro() {
  document.getElementById("ficheiroSenha").value = Math.random().toString(36).substring(2,8);
}

// SISTEMA
async function toggleSistema() {
  const ref = doc(db,"config","system");
  const snap = await getDoc(ref);
  const estado = snap.exists() ? !snap.data().ativo : true;
  await setDoc(ref,{ativo:estado});
  alert("Sistema: "+(estado?"ATIVO":"DESLIGADO"));
}

// ACESSOS
async function criarAcesso() {
  await addDoc(collection(db,"acessos"),{
    disciplina:disciplina.value,
    senha:senhaAcesso.value,
    link:linkExcel.value
  });
  carregarAcessos();
}

async function carregarAcessos(){
  listaAcessos.innerHTML="";
  const snap = await getDocs(collection(db,"acessos"));
  snap.forEach(d=>{
    const a=d.data();
    listaAcessos.innerHTML+=`
      <div class="card">
      ${a.disciplina} | ${a.senha}
      <button onclick="apagarAcesso('${d.id}')">Apagar</button>
      </div>`;
  });
}

async function apagarAcesso(id){
  await deleteDoc(doc(db,"acessos",id));
  carregarAcessos();
}

// LOGIN
async function entrarProfessor(){
  const snap = await getDocs(collection(db,"acessos"));
  snap.forEach(d=>{
    const a=d.data();
    if(a.disciplina===loginDisciplina.value && a.senha===loginSenha.value){
      window.open(a.link,"_blank");
    }
  });
}

// PUBLICAÇÕES
async function criarPublicacao(){
  await addDoc(collection(db,"publicacoes"),{
    titulo:pubTitulo.value,
    texto:pubTexto.value
  });
  carregarPublicacoes();
}

async function carregarPublicacoes(){
  feed.innerHTML="";
  listaPublicacoes.innerHTML="";
  const snap = await getDocs(collection(db,"publicacoes"));
  snap.forEach(d=>{
    const p=d.data();
    feed.innerHTML+=`<div class="card">${p.titulo}<p>${p.texto}</p></div>`;
    listaPublicacoes.innerHTML+=`
    <div class="card">
    ${p.titulo}
    <button onclick="apagarPublicacao('${d.id}')">Apagar</button>
    </div>`;
  });
}

async function apagarPublicacao(id){
  await deleteDoc(doc(db,"publicacoes",id));
  carregarPublicacoes();
}

// FICHEIROS
async function partilharFicheiro(){
  await addDoc(collection(db,"ficheiros"),{
    nome:ficheiroNome.value,
    link:ficheiroLink.value,
    senha:ficheiroSenha.value
  });
  carregarFicheiros();
}

async function carregarFicheiros(){
  listaFicheiros.innerHTML="";
  ficheirosHome.innerHTML="";

  const snap = await getDocs(collection(db,"ficheiros"));

  snap.forEach(d=>{
    const f=d.data();

    listaFicheiros.innerHTML+=`
    <div class="card">
    ${f.nome}
    <button onclick="apagarFicheiro('${d.id}')">Apagar</button>
    </div>`;

    ficheirosHome.innerHTML+=`
    <div class="card">
    ${f.nome}
    <button onclick="abrirFicheiro('${f.link}','${f.senha}')">Abrir</button>
    </div>`;
  });
}

function abrirFicheiro(link,senhaReal){
  const s=prompt("Senha:");
  if(s===senhaReal) window.open(link);
}

async function apagarFicheiro(id){
  await deleteDoc(doc(db,"ficheiros",id));
  carregarFicheiros();
}

// BOLETINS
async function publicarBoletim(){
  await addDoc(collection(db,"boletins"),{
    disciplina:boletimDisciplina.value,
    link:boletimLink.value
  });
  carregarBoletins();
}

async function carregarBoletins(){
  listaBoletins.innerHTML="";
  const snap=await getDocs(collection(db,"boletins"));

  snap.forEach(d=>{
    const b=d.data();
    listaBoletins.innerHTML+=`
    <div class="card">
    ${b.disciplina}
    <a href="${b.link}" target="_blank">Ver PDF</a>
    <button onclick="apagarBoletim('${d.id}')">Apagar</button>
    </div>`;
  });
}

async function apagarBoletim(id){
  await deleteDoc(doc(db,"boletins",id));
  carregarBoletins();
}

// DASHBOARD
async function atualizarDashboard(){
  totalAcessos.innerText=(await getDocs(collection(db,"acessos"))).size;
  totalPublicacoes.innerText=(await getDocs(collection(db,"publicacoes"))).size;
  totalFicheiros.innerText=(await getDocs(collection(db,"ficheiros"))).size;
}

// INIT
document.addEventListener("DOMContentLoaded",()=>{
  carregarPublicacoes();
  carregarAcessos();
  carregarFicheiros();
  carregarBoletins();
  atualizarDashboard();
});

// EXPORT
window.mostrar=mostrar;
window.gerarSenha=gerarSenha;
window.gerarSenhaFicheiro=gerarSenhaFicheiro;
window.criarAcesso=criarAcesso;
window.apagarAcesso=apagarAcesso;
window.entrarProfessor=entrarProfessor;
window.criarPublicacao=criarPublicacao;
window.apagarPublicacao=apagarPublicacao;
window.partilharFicheiro=partilharFicheiro;
window.apagarFicheiro=apagarFicheiro;
window.abrirFicheiro=abrirFicheiro;
window.publicarBoletim=publicarBoletim;
window.apagarBoletim=apagarBoletim;
window.toggleSistema=toggleSistema;
