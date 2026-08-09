alert("ÁREA DO ALUNO d CARREGADA ✅");

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

/* =====================================================
   VER NOTAS
===================================================== */

window.verNotas = async function () {

    try {

        console.log("Abrindo notas do aluno...");


        const notasAluno =
            await carregarNotasAluno();


        const disciplinas =
            Object.keys(notasAluno);


        if (disciplinas.length === 0) {

            alert(
                "Ainda não existem notas para este aluno."
            );

            return;

        }


        /* =================================================
           CRIAR JANELA
        ================================================= */

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


                <div
                    style="
                        background:#1e3a8a;
                        color:white;
                        padding:22px;
                        border-radius:16px;
                        text-align:center;
                        box-shadow:
                            0 5px 15px
                            rgba(0,0,0,.15);
                    "
                >

                    <div
                        style="
                            font-size:40px;
                        "
                    >
                        📊
                    </div>

                    <h2
                        style="
                            margin:5px 0;
                        "
                    >
                        Minhas Notas
                    </h2>

                    <div>
                        ${aluno.nome || "Aluno"}
                    </div>

                    <small>
                        ${aluno.turmaNome || "—"}
                    </small>

                </div>

        `;


        /* =================================================
           DISCIPLINAS
        ================================================= */

        disciplinas.forEach(
            disciplina => {

                html += `

                <div
                    style="
                        background:white;
                        margin-top:18px;
                        padding:18px;
                        border-radius:15px;
                        box-shadow:
                            0 3px 10px
                            rgba(0,0,0,.08);
                    "
                >

                    <h3
                        style="
                            margin:0 0 15px;
                            color:#1e3a8a;
                            border-bottom:
                                2px solid #e2e8f0;
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
                        (a,b) =>
                            obterTrimestre(a)
                            -
                            obterTrimestre(b)
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
                                border:
                                    1px solid #e2e8f0;
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

                                📝
                                ${formatarTrimestre(
                                    trimestre
                                )}

                            </div>


                            <div
                                style="
                                    display:grid;
                                    grid-template-columns:
                                    repeat(4,1fr);
                                    gap:8px;
                                    padding:15px;
                                    text-align:center;
                                "
                            >


                                <div>

                                    <small>
                                        MAC
                                    </small>

                                    <strong
                                        style="
                                            display:block;
                                            font-size:20px;
                                        "
                                    >
                                        ${
                                            nota.MAC || "—"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <small>
                                        NPT
                                    </small>

                                    <strong
                                        style="
                                            display:block;
                                            font-size:20px;
                                        "
                                    >
                                        ${
                                            nota.NPT || "—"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <small>
                                        MF
                                    </small>

                                    <strong
                                        style="
                                            display:block;
                                            font-size:20px;
                                        "
                                    >
                                        ${
                                            nota.MF || "—"
                                        }
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
                                        ${
                                            nota.classificacao
                                            || "—"
                                        }
                                    </strong>

                                </div>


                            </div>

                        </div>

                        `;

                    }
                );


                html += `

                </div>

                `;

            }
        );


        /* =================================================
           BOTÃO VOLTAR
        ================================================= */

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
            .getElementById(
                "fecharNotas"
            )
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

/* =====================================================
   VER BOLETIM
   LIBERAÇÃO POR TRIMESTRE
===================================================== */

window.verBoletim = async function () {

    try {

        console.log("Abrindo boletim...");


        /* ================================================
           CARREGAR PAGAMENTOS DO ALUNO
        ================================================= */

        const financeiroSnapshot =
            await getDocs(
                collection(
                    db,
                    "financeiro"
                )
            );


        let pagamentoAluno = null;


        for (
            const documento
            of financeiroSnapshot.docs
        ) {

            const dadosFinanceiro =
                documento.data();


            const mesmoAluno =
                String(
                    dadosFinanceiro.alunoId || ""
                ).trim()
                ===
                String(
                    aluno.id || ""
                ).trim();


            const mesmoNumero =
                String(
                    dadosFinanceiro.numero || ""
                ).trim()
                ===
                String(
                    numeroAluno || ""
                ).trim();


            if (
                mesmoAluno ||
                mesmoNumero
            ) {

                pagamentoAluno =
                    dadosFinanceiro;

                break;

            }

        }


        /* ================================================
           PAGAMENTOS
        ================================================= */

        const pagamentos = {

            1:
                pagamentoAluno
                ?.1trimestre
                ?.pago === true,

            2:
                pagamentoAluno
                ?.2trimestre
                ?.pago === true,

            3:
                pagamentoAluno
                ?.3trimestre
                ?.pago === true

        };


        console.log(
            "Pagamentos:",
            pagamentos
        );


        /* ================================================
           BUSCAR NOTAS
        ================================================= */

        const notasAluno =
            await carregarNotasAluno();


        const disciplinas =
            Object.keys(
                notasAluno
            );


        if (
            disciplinas.length === 0
        ) {

            alert(
                "Ainda não existem notas para gerar o boletim."
            );

            return;

        }


        /* ================================================
           JANELA
        ================================================= */

        let html = `

        <div
            id="janelaBoletim"
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
                    max-width:1100px;
                    margin:auto;
                    padding:20px 0 40px;
                "
            >

                <div
                    style="
                        background:#1e3a8a;
                        color:white;
                        padding:22px;
                        border-radius:16px;
                        text-align:center;
                    "
                >

                    <div style="font-size:40px;">
                        📄
                    </div>

                    <h2>
                        Boletim Escolar
                    </h2>

                    <div>
                        ${aluno.nome || "Aluno"}
                    </div>

                    <small>
                        ${aluno.turmaNome || "—"}
                    </small>

                </div>

        `;


        /* ================================================
           CADA TRIMESTRE
        ================================================= */

        [1,2,3].forEach(
            numeroTrimestre => {

                const pago =
                    pagamentos[
                        numeroTrimestre
                    ];


                const nomeTrimestre =
                    numeroTrimestre === 1
                    ? "1.º Trimestre"
                    : numeroTrimestre === 2
                    ? "2.º Trimestre"
                    : "3.º Trimestre";


                /* ------------------------------------------
                   BOLETIM BLOQUEADO
                ------------------------------------------ */

                if (!pago) {

                    html += `

                    <div
                        style="
                            background:white;
                            margin-top:20px;
                            padding:25px;
                            border-radius:15px;
                            text-align:center;
                            border:1px solid #fecaca;
                        "
                    >

                        <div
                            style="
                                font-size:45px;
                            "
                        >
                            🔒
                        </div>

                        <h3
                            style="
                                color:#b91c1c;
                            "
                        >
                            ${nomeTrimestre}
                        </h3>

                        <p
                            style="
                                color:#64748b;
                            "
                        >
                            Boletim pendente.
                        </p>

                        <strong
                            style="
                                color:#b91c1c;
                            "
                        >
                            Consulte o administrador.
                        </strong>

                    </div>

                    `;

                    return;

                }


                /* ------------------------------------------
                   BOLETIM LIBERADO
                ------------------------------------------ */

                html += `

                <div
                    style="
                        background:white;
                        margin-top:20px;
                        padding:18px;
                        border-radius:15px;
                        box-shadow:
                            0 3px 10px
                            rgba(0,0,0,.08);
                    "
                >

                    <div
                        style="
                            background:#dcfce7;
                            color:#166534;
                            padding:12px;
                            border-radius:10px;
                            margin-bottom:15px;
                            font-weight:bold;
                        "
                    >

                        ✅ ${nomeTrimestre}
                        — BOLETIM LIBERADO

                    </div>


                    <div
                        style="
                            overflow-x:auto;
                        "
                    >

                        <table
                            style="
                                width:100%;
                                border-collapse:collapse;
                                min-width:750px;
                            "
                        >

                            <thead>

                                <tr
                                    style="
                                        background:#e0f2fe;
                                        color:#1e3a8a;
                                    "
                                >

                                    <th
                                        style="
                                            padding:10px;
                                            border:1px solid #cbd5e1;
                                        "
                                    >
                                        Disciplina
                                    </th>

                                    <th
                                        style="
                                            padding:10px;
                                            border:1px solid #cbd5e1;
                                        "
                                    >
                                        MAC
                                    </th>

                                    <th
                                        style="
                                            padding:10px;
                                            border:1px solid #cbd5e1;
                                        "
                                    >
                                        NPT
                                    </th>

                                    <th
                                        style="
                                            padding:10px;
                                            border:1px solid #cbd5e1;
                                        "
                                    >
                                        MF
                                    </th>

                                    <th
                                        style="
                                            padding:10px;
                                            border:1px solid #cbd5e1;
                                        "
                                    >
                                        Classificação
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                `;


                /* ------------------------------------------
                   DISCIPLINAS
                ------------------------------------------ */

                disciplinas.forEach(
                    disciplina => {

                        const notas =
                            notasAluno[
                                disciplina
                            ];


                        let trimestreEncontrado =
                            null;


                        Object.keys(notas)
                            .forEach(
                                chave => {

                                    if (
                                        obterTrimestre(
                                            chave
                                        )
                                        ===
                                        numeroTrimestre
                                    ) {

                                        trimestreEncontrado =
                                            notas[
                                                chave
                                            ];

                                    }

                                }
                            );


                        const nota =
                            trimestreEncontrado
                            || {};


                        html += `

                        <tr>

                            <td
                                style="
                                    padding:10px;
                                    border:1px solid #cbd5e1;
                                    font-weight:bold;
                                "
                            >
                                ${disciplina}
                            </td>

                            <td
                                style="
                                    padding:10px;
                                    border:1px solid #cbd5e1;
                                    text-align:center;
                                "
                            >
                                ${nota.MAC || "—"}
                            </td>

                            <td
                                style="
                                    padding:10px;
                                    border:1px solid #cbd5e1;
                                    text-align:center;
                                "
                            >
                                ${nota.NPT || "—"}
                            </td>

                            <td
                                style="
                                    padding:10px;
                                    border:1px solid #cbd5e1;
                                    text-align:center;
                                    font-weight:bold;
                                "
                            >
                                ${nota.MF || "—"}
                            </td>

                            <td
                                style="
                                    padding:10px;
                                    border:1px solid #cbd5e1;
                                    text-align:center;
                                "
                            >
                                ${
                                    nota.classificacao
                                    || "—"
                                }
                            </td>

                        </tr>

                        `;

                    }
                );


                html += `

                            </tbody>

                        </table>

                    </div>

                </div>

                `;

            }
        );


        /* ================================================
           BOTÃO VOLTAR
        ================================================= */

        html += `

                <button
                    id="fecharBoletim"
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
            .getElementById(
                "fecharBoletim"
            )
            .onclick = function () {

                const janela =
                    document.getElementById(
                        "janelaBoletim"
                    );


                if (janela) {

                    janela.remove();

                }

            };


    }
    catch (error) {

        console.error(
            "Erro ao abrir boletim:",
            error
        );


        alert(
            "Erro ao abrir boletim:\n\n" +
            error.message
        );

    }

};
