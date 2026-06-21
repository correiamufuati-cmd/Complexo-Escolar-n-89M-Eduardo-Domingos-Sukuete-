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
apiKey: "AIzaSyDD326KBs3K1vsJsLNhfenFlsLFjRljxNE",
authDomain: "escola-digital-47497.firebaseapp.com",
projectId: "escola-digital-47497",
storageBucket: "escola-digital-47497.firebasestorage.app",
messagingSenderId: "322752680482",
appId: "1:322752680482:web:9f56c69fa6ba752f46707b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("🔥 Firebase ligado com sucesso");

/* ================= INÍCIO SEGURO ================= */
window.onload = function () {

console.log("✔ INIT OK");

const btn = document.getElementById("btnCriarEscola");

console.log("BTN:", btn);

if (btn) {
btn.addEventListener("click", criarEscola);
}

carregarEscolas();
};

/* ================= CRIAR ESCOLA ================= */
async function criarEscola() {

console.log("✔ Criar escola chamado");

const nome = document.getElementById("nomeEscola").value;
const provincia = document.getElementById("provincia").value;
const municipio = document.getElementById("municipio").value;
const ano = document.getElementById("anoLetivo").value;
const email = document.getElementById("email").value;
const senha = document.getElementById("senhaEscola").value;

if (!nome || !senha) {
alert("Preenche nome e senha!");
return;
}

const ref = await addDoc(collection(db, "escolas"), {
nome,
provincia,
municipio,
anoLetivo: ano,
email,
senha,
criadoEm: Date.now()
});

alert("Escola criada com ID: " + ref.id);

carregarEscolas();
}

/* ================= LISTAR ESCOLAS ================= */
async function carregarEscolas() {

const box = document.getElementById("listaEscolas");

if (!box) return;

box.innerHTML = "";

const snap = await getDocs(collection(db, "escolas"));

snap.forEach(d => {

const e = d.data();

box.innerHTML += `
<div class="card">
<h3>${e.nome}</h3>
<p>${e.municipio || ""} - ${e.provincia || ""}</p>

<button onclick="abrirLogin('${d.id}')">Entrar</button>

</div>
`;

});

}

/* ================= LOGIN ESCOLA ================= */
window.abrirLogin = function (id) {

document.getElementById("portal").classList.add("hidden");
document.getElementById("loginEscola").classList.remove("hidden");

window.escolaSelecionada = id;

};

/* ================= LOGIN ================= */
window.loginEscola = async function () {

const id = document.getElementById("idEscola").value;
const senha = document.getElementById("senhaLogin").value;

const snap = await getDoc(doc(db, "escolas", id));

if (snap.exists() && snap.data().senha === senha) {

const e = snap.data();

document.getElementById("loginEscola").classList.add("hidden");
document.getElementById("dashboard").classList.remove("hidden");

document.getElementById("nomeEscolaAtiva").innerText = e.nome;
document.getElementById("nivelEscolaAtiva").innerText = e.anoLetivo;

} else {
alert("Login inválido");
}

};

/* ================= SUPER ADMIN ================= */
window.abrirSuperAdmin = function () {

document.getElementById("portal").classList.add("hidden");
document.getElementById("superAdmin").classList.remove("hidden");

};

window.validarSuperAdmin = function () {

const senha = document.getElementById("senhaSuperAdmin").value;

if (senha === "0987") {
alert("Super Admin OK");
} else {
alert("Senha errada");
}

};

/* ================= NAV ================= */
window.showPage = function (id) {

document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
document.getElementById(id).classList.add("active");

};

/* ================= SAIR ================= */
window.sair = function () {

document.getElementById("dashboard").classList.add("hidden");
document.getElementById("portal").classList.remove("hidden");

};
