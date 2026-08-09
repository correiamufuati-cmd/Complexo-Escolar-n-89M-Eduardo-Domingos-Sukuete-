alert("ÁREA DO ALUNO DF CARREGADA ✅");

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

const aluno = JSON.parse(dados);


/* =====================================================
   DADOS PRINCIPAIS
===================================================== */

const nomeElemento =
    document.getElementById("nomeAluno");

const codigoElemento =
    document.getElementById("codigo");

const turmaElemento =
    document.getElementById("turma");

const estadoElemento =
    document.getElementById("estado");


if (nomeElemento) {
    nomeElemento.textContent =
        aluno.nome || "Aluno";
}

if (codigoElemento) {
    codigoElemento.textContent =
        "Código: " + (aluno.codigoAluno || "—");
}

if (turmaElemento) {
    turmaElemento.textContent =
        "Turma: " + (aluno.turmaNome || "—");
}

if (estadoElemento) {
    estadoElemento.textContent =
        "Estado: " + (aluno.estado || "ativo");
}


/* =====================================================
   VER NOTAS
===================================================== */

window.verNotas = async function () {

    try {

        const turmaId =
            String(aluno.turmaId || "").trim();

        const numeroAluno =
            String(aluno.numero || "").trim();

        const nomeAluno =
            String(aluno.nome || "").trim();


        if (!turmaId) {

            alert(
                "Erro: a sessão do aluno não possui o ID da turma."
            );

            console.log("Aluno:", aluno);

            return;
        }


        /* ==========================================
           CARREGAR TODOS OS DOCUMENTOS DE NOTAS
        ========================================== */

        const notasSnapshot =
            await getDocs(
                collection(db, "notas")
            );


        const notasAluno = {};


        /*
        Estrutura:

        notasAluno[
            disciplina
        ][
            trimestre
        ]
        */


        for (
            const notaDoc
            of notasSnapshot.docs
        ) {

            const dadosNota =
                notaDoc.data();


            /*
            Só interessa a turma do aluno
            */

            if (
                String(
                    dadosNota.turmaId || ""
                ).trim()
                !== turmaId
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


            if (!disciplina || !trimestre) {

                continue;
            }


            const listaAlunos =
                Array.isArray(
                    dadosNota.alunos
                )
                ? dadosNota.alunos
                : [];


            /*
            ======================================
            PROCURAR O ALUNO
            ======================================
            */

            let registroAluno = null;


            /*
            PRIMEIRO PELO NÚMERO
            */

            if (numeroAluno) {

                registroAluno =
                    listaAlunos.find(
                        item =>
                            String(
                                item.numero || ""
                            ).trim()
                            ===
                            numeroAluno
                    );

            }


            /*
            SE NÃO ACHOU, PROCURAR PELO NOME
            */

            if (!registroAluno && nomeAluno) {

                registroAluno =
                    listaAlunos.find(
                        item =>
                            String(
                                item.nome || ""
                            ).trim()
                            ===
                            nomeAluno
                    );

            }


            /*
            SE O ALUNO FOI ENCONTRADO
            */

            if (registroAluno) {

                if (!notasAluno[disciplina]) {

                    notasAluno[disciplina] = {};

                }


                notasAluno[disciplina][trimestre] = {

                    MAC:
                        registroAluno.MAC ?? "",

                    NPT:
                        registroAluno.NPT ?? "",

                    MF:
                        registroAluno.MF ?? "",

                    classificacao:
                        registroAluno.classificacao || ""

                };

            }

        }


        console.log(
            "Notas encontradas:",
            notasAluno
        );


        /* ==========================================
           VERIFICAR SE EXISTEM NOTAS
        ========================================== */

        const disciplinas =
            Object.keys(notasAluno);


        if (disciplinas.length === 0) {

            alert(
                "Ainda não existem notas para este aluno."
            );

            return;

        }


        /* ==========================================
           ORDEM DOS TRIMESTRES
        ========================================== */

        function ordenarTrimestre(a, b) {

            const ordem = {

                "1": 1,
                "1º": 1,
                "1º Trimestre": 1,
                "1° Trimestre": 1,
                "2": 2,
                "2º": 2,
                "2º Trimestre": 2,
                "2° Trimestre": 2,
                "3": 3,
                "3º": 3,
                "3º Trimestre": 3,
                "3° Trimestre": 3

            };


            return (
                (ordem[a] || 99)
                -
                (ordem[b] || 99)
            );

        }


        /* ==========================================
           CRIAR JANELA
        ========================================== */

        let html = `

        <div
            id="janelaNotas"
            style="
                position:fixed;
                inset:0;
                z-index:99999;
                background:#f1f5f9;
                overflow-y:auto;
            "
        >

            <div
                style="
                    width:95%;
                    max-width:900px;
                    margin:auto;
                    padding:20px 0 40px;
                "
            >

                <!-- CABEÇALHO -->

                <div
                    style="
                        background:#1e3a8a;
                        color:white;
                        padding:22px;
                        border-radius:15px;
                        text-align:center;
                        box-shadow:0 3px 10px rgba(0,0,0,.15);
                    "
                >

                    <div style="font-size:42px;">
                        📊
                    </div>

                    <h2 style="margin:5px 0;">
                        Minhas Notas
                    </h2>

                    <div>
                        ${aluno.nome || ""}
                    </div>

                    <small>
                        ${aluno.turmaNome || ""}
                    </small>

                </div>

        `;


        /* ==========================================
           DISCIPLINAS
        ========================================== */

        disciplinas.forEach(
            disciplina => {

                html += `

                <div
                    style="
                        background:white;
                        margin-top:18px;
                        border-radius:15px;
                        padding:18px;
                        box-shadow:0 3px 10px rgba(0,0,0,.08);
                    "
                >

                    <h3
                        style="
                            margin:0 0 15px;
                            color:#1e3a8a;
                            border-bottom:2px solid #e2e8f0;
                            padding-bottom:10px;
                        "
                    >

                        📚 ${disciplina}

                    </h3>

                `;


                const trimestres =
                    Object.keys(
                        notasAluno[disciplina]
                    ).sort(
                        ordenarTrimestre
                    );


                trimestres.forEach(
                    trimestre => {

                        const nota =
                            notasAluno
                            [disciplina]
                            [trimestre];


                        html += `

                        <div
                            style="
                                margin-bottom:15px;
                                border:1px solid #e2e8f0;
                                border-radius:10px;
                                overflow:hidden;
                            "
                        >

                            <div
                                style="
                                    background:#e0f2fe;
                                    color:#1e3a8a;
                                    padding:12px;
                                    font-weight:bold;
                                "
                            >

                                📝 ${formatarTrimestre(trimestre)}

                            </div>


                            <div
                                style="
                                    display:grid;
                                    grid-template-columns:
                                    repeat(4,1fr);
                                    gap:8px;
                                    padding:12px;
                                    text-align:center;
                                "
                            >

                                <div>

                                    <small>MAC</small>

                                    <strong
                                        style="
                                            display:block;
                                            font-size:20px;
                                        "
                                    >
                                        ${nota.MAC}
                                    </strong>

                                </div>


                                <div>

                                    <small>NPT</small>

                                    <strong
                                        style="
                                            display:block;
                                            font-size:20px;
                                        "
                                    >
                                        ${nota.NPT}
                                    </strong>

                                </div>


                                <div>

                                    <small>MF</small>

                                    <strong
                                        style="
                                            display:block;
                                            font-size:20px;
                                        "
                                    >
                                        ${nota.MF}
                                    </strong>

                                </div>


                                <div>

                                    <small>
                                        Classificação
                                    </small>

                                    <strong
                                        style="
                                            display:block;
                                            margin-top:4px;
                                        "
                                    >
                                        ${nota.classificacao || "—"}
                                    </strong>

                                </div>

                            </div>

                        </div>

                        `;

                    }
                );


                /*
                Se a disciplina só tiver um trimestre,
                mostrar aviso dos restantes
                */

                html += `

                </div>

                `;

            }
        );


        /* ==========================================
           BOTÃO VOLTAR
        ========================================== */

        html += `

                <button
                    id="fecharNotas"
                    style="
                        width:100%;
                        padding:15px;
                        margin-top:20px;
                        background:#dc2626;
                        color:white;
                        border:none;
                        border-radius:10px;
                        font-size:16px;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >

                    ← Voltar

                </button>


            </div>

        </div>

        `;


        document.body.insertAdjacentHTML(
            "beforeend",
            html
        );


        document
        .getElementById("fecharNotas")
        .onclick = function () {

            const janela =
                document.getElementById(
                    "janelaNotas"
                );


            if (janela) {

                janela.remove();

            }

        };


    }

    catch (error) {

        console.error(
            "Erro ao carregar notas:",
            error
        );


        alert(
            "Erro ao carregar notas:\n\n" +
            error.message
        );

    }

};


/* ==========================================
   FORMATAR TRIMESTRE
========================================== */

function formatarTrimestre(valor) {

    const v =
        String(valor)
        .trim()
        .toLowerCase();


    if (
        v === "1" ||
        v === "1º" ||
        v === "1°" ||
        v.includes("1º trimestre") ||
        v.includes("1° trimestre")
    ) {

        return "1.º Trimestre";

    }


    if (
        v === "2" ||
        v === "2º" ||
        v === "2°" ||
        v.includes("2º trimestre") ||
        v.includes("2° trimestre")
    ) {

        return "2.º Trimestre";

    }


    if (
        v === "3" ||
        v === "3º" ||
        v === "3°" ||
        v.includes("3º trimestre") ||
        v.includes("3° trimestre")
    ) {

        return "3.º Trimestre";

    }


    return valor;

}

/* =====================================================
   VER BOLETIM
===================================================== */

window.verBoletim = function () {

    alert(
        "📄 BOLETIM\n\n" +
        "O módulo de boletim será ligado depois."
    );

};


/* =====================================================
   DADOS PESSOAIS
===================================================== */

window.verDados = function () {

    alert(

        "👤 DADOS DO ALUNO\n\n" +

        "Nome: " +
        (aluno.nome || "—") +

        "\n\nCódigo: " +
        (aluno.codigoAluno || "—") +

        "\n\nNúmero: " +
        (aluno.numero || "—") +

        "\n\nSexo: " +
        (aluno.sexo || "—") +

        "\n\nTurma: " +
        (aluno.turmaNome || "—") +

        "\n\nEstado: " +
        (aluno.estado || "—")

    );

};


/* =====================================================
   ALTERAR SENHA
===================================================== */

window.alterarSenha = function () {

    alert(
        "🔐 Alterar senha\n\n" +
        "Esta função será ligada ao Firestore."
    );

};


/* =====================================================
   SAIR
===================================================== */

window.sairAluno = function () {

    const confirmar =
        confirm(
            "Deseja realmente sair da sua conta?"
        );


    if (!confirmar) {
        return;
    }


    localStorage.removeItem(
        "alunoLogado"
    );


    window.location.href =
        "student-login.html";

};
