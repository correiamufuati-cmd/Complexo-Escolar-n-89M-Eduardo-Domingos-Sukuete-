import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
getFirestore,
collection,
addDoc,
getDocs,
getDoc,
doc,
deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
apiKey: "AIzaSyDD326KBs3K1vsJsLNhfenFlsLFjRljxNE",
authDomain: "escola-digital-47497.firebaseapp.com",
projectId: "escola-digital-47497"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let escolaAtual = null;

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

const btnCriar = document.getElementById("btnCriarEscola");
const btnLogin = document.getElementById("btnLoginEscola");

if (btnCriar) btnCriar.addEventListener("click", criarEscola);
if (btnLogin) btnLogin.addEventListener("click", loginEscola);

carregarEscolas();

});

/* ================= CRIAR ESCOLA ================= */
async function criarEscola() {

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

alert("Escola criada: " + ref.id);
carregarEscolas();
}

/* ================= LISTAR ESCOLAS ================= */
async function carregarEscolas() {

const box = document.getElementById("listaEscolas");
if (!box) return;

box.innerHTML = "";

const snap = await getDocs(collection(db, "escolas"));

snap.forEach(d => {

box.innerHTML += `
<div class="card">
<h3>${d.data().nome}</h3>
<p>ID: ${d.id}</p>

<button onclick="abrirLogin('${d.id}')">Entrar</button>
</div>
`;

});

}

/* ================= ABRIR LOGIN ================= */
window.abrirLogin = function (id) {

console.log("Abrir login:", id);

escolaAtual = id;

document.getElementById("portal").classList.add("hidden");
document.getElementById("loginEscola").classList.remove("hidden");

document.getElementById("idEscola").value = id;

};

/* ================= LOGIN ESCOLA ================= */
window.loginEscola = async function () {

try {

const id = document.getElementById("idEscola").value;
const senha = document.getElementById("senhaLogin").value;

if (!id || !senha) {
alert("Preenche todos os campos");
return;
}

const snap = await getDoc(doc(db, "escolas", id));

if (!snap.exists()) {
alert("Escola não encontrada");
return;
}

const escola = snap.data();

if (escola.senha !== senha) {
alert("Senha incorreta");
return;
}

document.getElementById("loginEscola").classList.add("hidden");
document.getElementById("dashboard").classList.remove("hidden");

document.getElementById("nomeEscolaAtiva").innerText = escola.nome;
document.getElementById("nivelEscolaAtiva").innerText = escola.anoLetivo || "";

showPage("home");

console.log("Login OK");

} catch (err) {
console.error(err);
alert("Erro no login");
}

};

/* ================= SUPER ADMIN ================= */
window.abrirSuperAdmin = function () {

document.getElementById("portal").classList.add("hidden");
document.getElementById("superAdmin").classList.remove("hidden");

};

window.validarSuperAdmin = function () {

const senha = document.getElementById("senhaSuperAdmin").value;

if (senha !== "0987") {
alert("Senha errada");
return;
}

document.getElementById("superAdmin").classList.add("hidden");
document.getElementById("superAdminDashboard").classList.remove("hidden");

loadAdminEscolas();
loadStats();

};

/* ================= ADMIN ================= */
async function loadAdminEscolas() {

const box = document.getElementById("escolas");
box.innerHTML = "";

const snap = await getDocs(collection(db, "escolas"));

snap.forEach(d => {

box.innerHTML += `
<div class="card">
<h3>${d.data().nome}</h3>
<p>ID: ${d.id}</p>

<button onclick="verEscola('${d.id}')">Ver</button>
<button onclick="eliminarEscola('${d.id}')">Eliminar</button>
</div>
`;

});

}

window.verEscola = async function (id) {

const snap = await getDoc(doc(db, "escolas", id));

alert(JSON.stringify(snap.data(), null, 2));

};

window.eliminarEscola = async function (id) {

await deleteDoc(doc(db, "escolas", id));
alert("Eliminado");

loadAdminEscolas();

};

async function loadStats() {

const snap = await getDocs(collection(db, "escolas"));

let total = 0;
snap.forEach(() => total++);

document.getElementById("stats").innerHTML = `
<div class="card">
<h2>Total de escolas: ${total}</h2>
</div>
`;

}

/* ================= NAV ================= */
window.showPage = function (id) {

document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
document.getElementById(id).classList.add("active");

};

/* ================= ADMIN NAV ================= */
window.showAdminPage = function (id) {

document.querySelectorAll(".adminPage").forEach(p => p.style.display = "none");

const el = document.getElementById(id);
if (el) el.style.display = "block";

if (id === "escolas") loadAdminEscolas();
if (id === "stats") loadStats();

};

/* ================= SAIR ================= */
window.sair = function () {

location.reload();

};
