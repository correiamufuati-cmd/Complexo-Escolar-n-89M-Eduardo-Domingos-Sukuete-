import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
getDocs,
deleteDoc,
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ================= FIREBASE ================= */
const app = initializeApp({
apiKey: "SUA_API_KEY",
authDomain: "sac-escolar.firebaseapp.com",
projectId: "sac-escolar"
});

const db = getFirestore(app);

/* ================= NAVEGAÇÃO ================= */
function mostrar(id){
document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
document.getElementById(id).classList.add("active");
}

/* ================= BIND DE BOTÕES ================= */
document.addEventListener("DOMContentLoaded",()=>{

document.getElementById("btnInicio").addEventListener("click",()=>mostrar("inicio"));
document.getElementById("btnPublicacoes").addEventListener("click",()=>mostrar("publicacoes"));
document.getElementById("btnPautas").addEventListener("click",()=>mostrar("pautas"));
document.getElementById("btnAluno").addEventListener("click",()=>mostrar("aluno"));
document.getElementById("btnEnc").addEventListener("click",()=>mostrar("encarregado"));
document.getElementById("btnAdmin").addEventListener("click",()=>mostrar("admin"));

carregarPublicacoes();
});

/* ================= PUBLICAÇÕES ================= */
document.getElementById("btnCriarPub")?.addEventListener("click",async()=>{
const titulo=document.getElementById("tituloPub").value;
const texto=document.getElementById("textoPub").value;

await addDoc(collection(db,"publicacoes"),{
titulo,
texto,
data:Date.now()
});

carregarPublicacoes();
});

async function carregarPublicacoes(){
const box=document.getElementById("listaPublicacoes");
const inicio=document.getElementById("inicioPublicacoes");

box.innerHTML="";
inicio.innerHTML="";

const snap=await getDocs(collection(db,"publicacoes"));

snap.forEach(d=>{
const p=d.data();

const html=`
<div class="card">
<h3>${p.titulo}</h3>
<p>${p.texto}</p>

<input id="c-${d.id}" placeholder="Comentário">
<button class="btnComment" data-id="${d.id}">Comentar</button>

<div id="l-${d.id}"></div>

<button class="btnDeletePub" data-id="${d.id}">Apagar</button>
</div>
`;

box.innerHTML+=html;
inicio.innerHTML+=html;
});

/* rebind após render */
document.querySelectorAll(".btnDeletePub").forEach(b=>{
b.addEventListener("click",async(e)=>{
await deleteDoc(doc(db,"publicacoes",e.target.dataset.id));
carregarPublicacoes();
});
});

document.querySelectorAll(".btnComment").forEach(b=>{
b.addEventListener("click",async(e)=>{
const id=e.target.dataset.id;
const input=document.getElementById("c-"+id);

await addDoc(collection(db,"publicacoes",id,"comentarios"),{
texto:input.value
});

input.value="";
});
});
}

/* ================= PAUTAS ================= */
document.getElementById("btnEntrarPauta")?.addEventListener("click",async()=>{

const id=document.getElementById("pautaSelect").value;
const senha=document.getElementById("senhaPauta").value;

const snap=await getDoc(doc(db,"pautas",id));

if(snap.exists() && snap.data().senha===senha){
window.open(snap.data().link,"_blank");
}else{
alert("Senha incorreta");
}
});

/* ================= EXPORT GLOBAL (SÓ O NECESSÁRIO) ================= */
window.mostrar = mostrar;
