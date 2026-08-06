alert("LOGIN-PROFESSOR.JS CARREGADO");

import { db } from "./firebase.js";
import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// =======================
// PROFESSOR LOGADO
// =======================

const professor = JSON.parse(localStorage.getItem("professorLogado"));

if (!professor) {
    window.location.href = "../pages/login-professor.html";
    throw new Error("Professor não autenticado.");
}

// =======================
// ELEMENTOS
// =======================

const nomeProfessor = document.getElementById("nomeProfessor");
const selectTurma = document.getElementById("selectTurma");
const selectDisciplina = document.getElementById("selectDisciplina");
const abrirMiniPauta = document.getElementById("abrirMiniPauta");

// =======================
// NOME
// =======================

nomeProfessor.textContent = professor.nome || "Professor";

// =======================
// ATRIBUIÇÕES
// =======================

const atribuicoes = professor.atribuicoes || [];

// =======================
// CARREGAR TURMAS
// =======================

const turmas = [...new Set(atribuicoes.map(a => a.turmaNome))];

selectTurma.innerHTML =
`<option value="">Selecione a turma</option>`;

turmas.forEach(turma => {

    selectTurma.innerHTML += `
        <option value="${turma}">
            ${turma}
        </option>
    `;

});

// =======================
// CARREGAR DISCIPLINAS
// =======================

selectTurma.addEventListener("change", () => {

    const turmaSelecionada = selectTurma.value;

    selectDisciplina.innerHTML =
    `<option value="">Selecione a disciplina</option>`;

    atribuicoes
        .filter(a => a.turmaNome === turmaSelecionada)
        .forEach(a => {

            selectDisciplina.innerHTML += `
                <option value="${a.disciplina}">
                    ${a.disciplina}
                </option>
            `;

        });

});

// =======================
// ABRIR MINI-PAUTA
// =======================

abrirMiniPauta.addEventListener("click", () => {

    const turma = selectTurma.value;
    const disciplina = selectDisciplina.value;

    if (!turma) {
        alert("Selecione uma turma.");
        return;
    }

    if (!disciplina) {
        alert("Selecione uma disciplina.");
        return;
    }

    localStorage.setItem("turmaSelecionada", turma);
    localStorage.setItem("disciplinaSelecionada", disciplina);

    window.location.href = "../pages/mini-pauta.html";

});
