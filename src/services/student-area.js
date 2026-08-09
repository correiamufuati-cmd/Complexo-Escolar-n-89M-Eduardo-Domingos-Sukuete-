alert("ÁREA DO ALUNO CARREGADA ✅");

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


/* =====================================================
   SESSÃO DO ALUNO
===================================================== */

const dados = localStorage.getItem("alunoLogado");

if (!dados) {

    alert("Sessão expirada. Faça login novamente.");

    window.location.href = "student-login.html";

    throw new Error("Aluno não autenticado.");

}

let aluno;

try {

    aluno = JSON.parse(dados);

} catch (error) {

    alert("Erro ao ler os dados do aluno.");

    console.error(error);

    localStorage.removeItem("alunoLogado");

    window.location.href = "student-login.html";

    throw new Error("Dados do aluno inválidos.");

}


console.log("Aluno logado:", aluno);


/* =====================================================
   ELEMENTOS DA PÁGINA
===================================================== */

const nomeElemento =
    document.getElementById("nomeAluno");

const codigoElemento =
    document.getElementById("codigo");

const turmaElemento =
    document.getElementById("turma");

const estadoElemento =
    document.getElementById("estado");


/* =====================================================
   MOSTRAR DADOS DO ALUNO
===================================================== */

if (nomeElemento) {

    nomeElemento.textContent =
        aluno.nome || "Aluno";

}


if (codigoElemento) {

    codigoElemento.textContent =
        "Código: " +
        (
            aluno.codigoAluno ||
            aluno.codigo ||
            "—"
        );

}


if (turmaElemento) {

    turmaElemento.textContent =
        "Turma: " +
        (
            aluno.turmaNome ||
            aluno.turma ||
            "—"
        );

}


if (estadoElemento) {

    estadoElemento.textContent =
        "Estado: " +
        (
            aluno.estado ||
            "ativo"
        );

}


/* =====================================================
   DADOS DE IDENTIFICAÇÃO
===================================================== */

const turmaId =
    String(
        aluno.turmaId || ""
    ).trim();


const numeroAluno =
    String(
        aluno.numero || ""
    ).trim();


const nomeAluno =
    String(
        aluno.nome || ""
    ).trim();


console.log(
    "Turma ID:",
    turmaId
);

console.log(
    "Número do aluno:",
    numeroAluno
);

console.log(
    "Nome:",
    nomeAluno
);
