import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore, collection, addDoc, getDocs, deleteDoc, doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp({
apiKey: "SUA_API_KEY",
authDomain: "sac-escolar.firebaseapp.com",
projectId: "sac-escolar"
});

const db = getFirestore(app);

/* ================= MENU ================= */
window.mostrar = (id)=>{
document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
document.getElementById(id).classList.add("active");
}

/* ================= PUBLICAÇÕES ================= */
window.criarPublicacao = async ()=>{
await addDoc(collection(db,"publicacoes"),{
titulo:tituloPub.value,
texto:textoPub.value,
data:Date.now()
});
carregarPublicacoes();
}

async function carregarPublicacoes(){
let box = document.getElementById("listaPublicacoes");
let inicio = document.getElementById("inicioPublicacoes");

box.innerHTML="";
inicio.innerHTML="";

const snap = await getDocs(collection(db,"publicacoes"));

snap.forEach(d=>{
let p=d.data();

let html = `
<div class="card">
<h3>${p.titulo}</h3>
<p>${p.texto}</p>

<input id="c-${d.id}" placeholder="Comentário">
<button onclick="comentar('${d.id}')">Comentar</button>

<div id="l-${d.id}"></div>

<button onclick="apagarPub('${d.id}')">Apagar</button>
</div>
`;

box.innerHTML += html;
inicio.innerHTML += html;
});
}

window.apagarPub = async (id)=>{
await deleteDoc(doc(db,"publicacoes",id));
carregarPublicacoes();
}

window.comentar = async (id)=>{
let input=document.getElementById("c-"+id);

await addDoc(collection(db,"publicacoes",id,"comentarios"),{
texto:input.value
});

carregarPublicacoes();
}

/* ================= PAUTAS ================= */
window.entrarPauta = async ()=>{
let id=pautaSelect.value;
let senha=senhaPauta.value;

let snap=await getDoc(doc(db,"pautas",id));

if(snap.exists() && snap.data().senha===senha){
alert("Acesso autorizado");
window.open(snap.data().link);
}else alert("Erro");
}

/* ================= ALUNO ================= */
window.loginAluno = async ()=>{
let senha=senhaAluno.value;

let snap=await getDocs(collection(db,"alunos"));

snap.forEach(d=>{
if(d.data().senha===senha){
boletim.innerHTML=JSON.stringify(d.data(),null,2);
}
});
}

/* ================= ENCARREGADO ================= */
window.loginEnc = async ()=>{
filhos.innerHTML="Funcionalidade futura";
}

/* ================= ADMIN ================= */
window.importarExcel = async ()=>{
alert("Importação ainda em fase de ligação ao Excel");
}

window.uploadPDF = async ()=>{
alert("Upload PDF pronto para integrar");
}

/* ================= INIT ================= */
window.onload = ()=>{
carregarPublicacoes();
  }
