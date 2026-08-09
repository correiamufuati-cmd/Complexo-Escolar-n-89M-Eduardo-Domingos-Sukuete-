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

/* =====================================================
   FUNÇÕES AUXILIARES
===================================================== */

function normalizarTexto(valor) {

    return String(valor || "")
        .trim()
        .toLowerCase();

}


/* =====================================================
   IDENTIFICAR TRIMESTRE
===================================================== */

function obterTrimestre(valor) {

    const v =
        normalizarTexto(valor);

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

function formatarTrimestre(valor) {

    const numero =
        obterTrimestre(valor);


    if (numero === 1) {

        return "1.º Trimestre";

    }


    if (numero === 2) {

        return "2.º Trimestre";

    }


    if (numero === 3) {

        return "3.º Trimestre";

    }


    return valor;

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
        Number(
            String(valor)
                .replace(",", ".")
                .trim()
        );


    return Number.isFinite(numero)
        ? numero
        : null;

}


/* =====================================================
   CALCULAR MÉDIA ANUAL
===================================================== */

function calcularMediaAnual(notas) {

    const valores = [];


    Object.values(notas)
        .forEach(nota => {

            const mf =
                numeroMF(
                    nota.MF
                );


            if (mf !== null) {

                valores.push(mf);

            }

        });


    if (valores.length === 0) {

        return "";

    }


    const soma =
        valores.reduce(
            (total, valor) =>
                total + valor,
            0
        );


    return (
        soma / valores.length
    ).toFixed(1);

}


/* =====================================================
   CARREGAR NOTAS DO ALUNO
===================================================== */

async function carregarNotasAluno() {

    const resultado = {};


    if (!turmaId) {

        console.warn(
            "Aluno sem turmaId."
        );

        return resultado;

    }


    const notasSnapshot =
        await getDocs(
            collection(
                db,
                "notas"
            )
        );


    for (
        const notaDoc
        of notasSnapshot.docs
    ) {

        const dadosNota =
            notaDoc.data();


        /* ---------------------------------------------
           VERIFICAR TURMA
        --------------------------------------------- */

        if (
            String(
                dadosNota.turmaId || ""
            ).trim()
            !==
            turmaId
        ) {

            continue;

        }


        const disciplina =
            String(
                dadosNota.disciplina || ""
            ).trim();


        const trimestre =
            String(
                dadosNota.trimestre || ""
            ).trim();


        if (
            !disciplina ||
            !trimestre
        ) {

            continue;

        }


        /* ---------------------------------------------
           LISTA DE ALUNOS
        --------------------------------------------- */

        const listaAlunos =
            Array.isArray(
                dadosNota.alunos
            )
            ? dadosNota.alunos
            : [];


        let registro = null;


        /* ---------------------------------------------
           PROCURAR PELO NÚMERO
        --------------------------------------------- */

        if (numeroAluno) {

            registro =
                listaAlunos.find(
                    item =>

                        String(
                            item.numero || ""
                        ).trim()
                        ===
                        numeroAluno

                );

        }


        /* ---------------------------------------------
           SE NÃO ENCONTROU, PROCURAR PELO NOME
        --------------------------------------------- */

        if (
            !registro &&
            nomeAluno
        ) {

            registro =
                listaAlunos.find(
                    item =>

                        normalizarTexto(
                            item.nome
                        )
                        ===
                        normalizarTexto(
                            nomeAluno
                        )

                );

        }


        if (!registro) {

            continue;

        }


        /* ---------------------------------------------
           CRIAR DISCIPLINA
        --------------------------------------------- */

        if (!resultado[disciplina]) {

            resultado[disciplina] = {};

        }


        resultado[disciplina][trimestre] = {

            MAC:
                registro.MAC ?? "",

            NPT:
                registro.NPT ?? "",

            MF:
                registro.MF ?? "",

            classificacao:
                registro.classificacao || ""

        };

    }


    console.log(
        "NOTAS DO ALUNO:",
        resultado
    );


    return resultado;

}
