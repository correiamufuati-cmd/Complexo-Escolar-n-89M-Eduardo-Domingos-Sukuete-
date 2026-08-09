alert("ÁREA DO ALUNO CARREGADA ✅");

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


/* =====================================================
   SESSÃO DO ALUNO
===================================================== */

const dados =
    localStorage.getItem("alunoLogado");


if (!dados) {

    alert(
        "Sessão expirada. Faça login novamente."
    );

    window.location.href =
        "student-login.html";

    throw new Error(
        "Aluno não autenticado."
    );

}


const aluno =
    JSON.parse(dados);


console.log(
    "ALUNO LOGADO:",
    aluno
);


/* =====================================================
   ELEMENTOS PRINCIPAIS
===================================================== */

const nomeElemento =
    document.getElementById(
        "nomeAluno"
    );


const codigoElemento =
    document.getElementById(
        "codigo"
    );


const turmaElemento =
    document.getElementById(
        "turma"
    );


const estadoElemento =
    document.getElementById(
        "estado"
    );


/* =====================================================
   MOSTRAR DADOS DO ALUNO
===================================================== */

if (nomeElemento) {

    nomeElemento.textContent =
        aluno.nome ||
        "Aluno";

}


if (codigoElemento) {

    codigoElemento.textContent =
        "Código: " +
        (
            aluno.codigoAluno ||
            "—"
        );

}


if (turmaElemento) {

    turmaElemento.textContent =
        "Turma: " +
        (
            aluno.turmaNome ||
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
   FUNÇÃO AUXILIAR
   IDENTIFICAR TRIMESTRE
===================================================== */

function obterTrimestre(valor) {

    const v =
        String(valor)
        .trim()
        .toLowerCase();


    if (
        v === "1" ||
        v === "1º" ||
        v === "1°" ||
        v.includes("1º trimestre") ||
        v.includes("1° trimestre") ||
        v.includes("1 trimestre")
    ) {

        return 1;

    }


    if (
        v === "2" ||
        v === "2º" ||
        v === "2°" ||
        v.includes("2º trimestre") ||
        v.includes("2° trimestre") ||
        v.includes("2 trimestre")
    ) {

        return 2;

    }


    if (
        v === "3" ||
        v === "3º" ||
        v === "3°" ||
        v.includes("3º trimestre") ||
        v.includes("3° trimestre") ||
        v.includes("3 trimestre")
    ) {

        return 3;

    }


    return 99;

}


/* =====================================================
   FORMATAR TRIMESTRE
===================================================== */

function formatarTrimestre(numero) {

    if (
        numero === 1
    ) {

        return "1.º Trimestre";

    }


    if (
        numero === 2
    ) {

        return "2.º Trimestre";

    }


    if (
        numero === 3
    ) {

        return "3.º Trimestre";

    }


    return "Trimestre";

}


/* =====================================================
   CONVERTER MF PARA NÚMERO
===================================================== */

function numeroMF(valor) {

    if (
        valor === "" ||
        valor === null ||
        valor === undefined
    ) {

        return null;

    }


    const numero =
        Number(valor);


    return Number.isFinite(numero)
        ? numero
        : null;

}


/* =====================================================
   MÉDIA ANUAL
===================================================== */

function calcularMediaAnual(notas) {

    const valores = [];


    Object.values(notas)
    .forEach(
        nota => {

            const mf =
                numeroMF(
                    nota.MF
                );


            if (
                mf !== null
            ) {

                valores.push(
                    mf
                );

            }

        }
    );


    if (
        valores.length === 0
    ) {

        return "";

    }


    const soma =
        valores.reduce(
            (
                total,
                valor
            ) =>
                total + valor,
            0
        );


    return (
        soma /
        valores.length
    ).toFixed(1);

}


/* =====================================================
   TESTE INICIAL
===================================================== */

console.log(
    "student-area.js inicializado corretamente ✅"
);
