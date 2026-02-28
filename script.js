// script.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, setDoc, getDocs, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js";

// ===== FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyC0NRCbPalAC3Yrfpc8qYdJVU6DxuEOyTw",
  authDomain: "sac-escolar.firebaseapp.com",
  projectId: "sac-escolar",
  storageBucket: "sac-escolar.appspot.com",
  messagingSenderId: "507793955855",
  appId: "1:507793955855:web:405579f5e01b3f90cc577a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== MENU =====
function mostrar(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  const sec = document.getElementById(id);
  if (sec) sec.classList.add("active");
}

// ===== REGISTRAR PAUTA (SALVA EXCEL INTACTO) =====
async function registarPauta() {
  const classe = document.getElementById("classeNome").value.trim();
  const senha = document.getElementById("senhaClasse").value.trim();
  const arquivo = document.getElementById("excelUpload").files[0];

  if (!classe || !senha || !arquivo) {
    alert("Preencha todos os campos.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async function(e) {
    const base64 = e.target.result.split(",")[1];

    await setDoc(doc(db, "pautas", classe), {
      senha: senha,
      arquivo: base64
    });

    alert("Pauta registrada com sucesso!");
    carregarClassesProfessor();
  };

  reader.readAsDataURL(arquivo);
}

// ===== CARREGAR CLASSES =====
async function carregarClassesProfessor() {
  const select = document.getElementById("classeProfessor");
  select.innerHTML = "";

  const snap = await getDocs(collection(db, "pautas"));
  snap.forEach(docSnap => {
    select.innerHTML += `<option value="${docSnap.id}">${docSnap.id}</option>`;
  });
}

// ===== PROFESSOR ABRIR PAUTA (ESTRUTURA ORIGINAL) =====
async function acessarPauta() {
  const classe = document.getElementById("classeProfessor").value;
  const senha = document.getElementById("senhaProfessor").value;

  if (!classe || !senha) {
    alert("Preencha classe e senha.");
    return;
  }

  const docRef = doc(db, "pautas", classe);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    alert("Classe não encontrada.");
    return;
  }

  const dados = docSnap.data();

  if (dados.senha !== senha) {
    alert("Senha incorreta!");
    return;
  }

  document.getElementById("areaNotas").style.display = "block";

  // Reconstruir Excel original
  const workbook = XLSX.read(dados.arquivo, { type: "base64" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const html = XLSX.utils.sheet_to_html(sheet, { id: "tabelaExcel" });
  document.getElementById("tabelaContainer").innerHTML = html;

  // Tornar células editáveis
  document.querySelectorAll("#tabelaExcel td").forEach(td => {
    td.contentEditable = true;
  });
}

// ===== INICIALIZAÇÃO =====
window.onload = () => {
  carregarClassesProfessor();
};

// ===== EXPOR FUNÇÕES =====
window.mostrar = mostrar;
window.registarPauta = registarPauta;
window.acessarPauta = acessarPauta;
