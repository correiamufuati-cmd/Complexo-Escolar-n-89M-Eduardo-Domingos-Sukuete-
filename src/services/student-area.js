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


/* =====================================================
   ELEMENTOS PRINCIPAIS
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
        "Código: " +
        (aluno.codigoAluno || "—");

}


if (turmaElemento) {

    turmaElemento.textContent =
        "Turma: " +
        (aluno.turmaNome || "—");

}


if (estadoElemento) {

    estadoElemento.textContent =
        "Estado: " +
        (aluno.estado || "ativo");

}


/* =====================================================
   OBTER ID DO ALUNO
===================================================== */

function obterAlunoId() {

    return String(
        aluno.alunoId ||
        aluno.id ||
        aluno.numero ||
        aluno.codigoAluno ||
        ""
    ).trim();

}


/* =====================================================
   CARREGAR ESTADO FINANCEIRO
===================================================== */

async function carregarFinanceiro() {

    const turmaId =
        String(
            aluno.turmaId || ""
        ).trim();

    const alunoId =
        obterAlunoId();


    if (!turmaId || !alunoId) {

        console.warn(
            "Não foi possível identificar turma/aluno para o financeiro.",
            aluno
        );

        return {};

    }


    try {

        const financeiroRef =
            doc(
                db,
                "turmas",
                turmaId,
                "alunos",
                alunoId,
                "financeiro",
                "estado"
            );


        const financeiroDoc =
            await getDoc(
                financeiroRef
            );


        if (
            !financeiroDoc.exists()
        ) {

            console.warn(
                "Documento financeiro não encontrado."
            );

            return {};

        }


        return financeiroDoc.data() || {};

    }

    catch (error) {

        console.error(
            "Erro ao carregar financeiro:",
            error
        );

        return {};

    }

}


/* =====================================================
   VERIFICAR PAGAMENTO
===================================================== */

function trimestrePago(
    financeiro,
    numero
) {

    const chave =
        numero === 1
            ? "1trimestre"
            : numero === 2
                ? "2trimestre"
                : numero === 3
                    ? "3trimestre"
                    : "";


    if (!chave) {

        return false;

    }


    return (
        financeiro?.[chave]?.pago === true
    );

}


/* =====================================================
   COMUNICADO
===================================================== */

function comunicadoTrimestre(
    financeiro,
    numero
) {

    const chave =
        numero === 1
            ? "1trimestre"
            : numero === 2
                ? "2trimestre"
                : numero === 3
                    ? "3trimestre"
                    : "";


    if (!chave) {

        return "";

    }


    return (
        financeiro?.[chave]?.comunicado ||
        ""
    );

}


/* =====================================================
   FORMATAR TRIMESTRE
===================================================== */

function formatarTrimestre(
    valor
) {

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

        return "1.º Trimestre";

    }


    if (
        v === "2" ||
        v === "2º" ||
        v === "2°" ||
        v.includes("2º trimestre") ||
        v.includes("2° trimestre") ||
        v.includes("2 trimestre")
    ) {

        return "2.º Trimestre";

    }


    if (
        v === "3" ||
        v === "3º" ||
        v === "3°" ||
        v.includes("3º trimestre") ||
        v.includes("3° trimestre") ||
        v.includes("3 trimestre")
    ) {

        return "3.º Trimestre";

    }


    return valor;

}


/* =====================================================
   OBTER NÚMERO DO TRIMESTRE
===================================================== */

function obterTrimestre(
    valor
) {

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
   NÚMERO MF
===================================================== */

function numeroMF(
    valor
) {

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

function calcularMediaAnual(
    notas,
    financeiro
) {

    const valores = [];


    Object.entries(
        notas
    ).forEach(
        ([chave, nota]) => {

            const trimestre =
                obterTrimestre(
                    chave
                );


            /*
             Só entra na média o trimestre
             que está pago.
            */

            if (
                trimestre < 1 ||
                trimestre > 3
            ) {

                return;

            }


            if (
                !trimestrePago(
                    financeiro,
                    trimestre
                )
            ) {

                return;

            }


            const mf =
                numeroMF(
                    nota.MF
                );


            if (
                mf !== null
            ) {

                valores.push(mf);

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
        soma / valores.length
    ).toFixed(1);

}


/* =====================================================
   VER NOTAS
===================================================== */

window.verNotas =
async function () {

    try {

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


        if (!turmaId) {

            alert(
                "Erro: a sessão do aluno não possui o ID da turma."
            );

            console.log(
                "Aluno:",
                aluno
            );

            return;

        }


        /*
        ==========================================
        FINANCEIRO
        ==========================================
        */

        const financeiro =
            await carregarFinanceiro();


        /*
        ==========================================
        NOTAS
        ==========================================
        */

        const notasSnapshot =
            await getDocs(
                collection(
                    db,
                    "notas"
                )
            );


        const notasAluno = {};


        for (
            const notaDoc
            of notasSnapshot.docs
        ) {

            const dadosNota =
                notaDoc.data();


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


            if (
                !disciplina ||
                !trimestre
            ) {

                continue;

            }


            const listaAlunos =
                Array.isArray(
                    dadosNota.alunos
                )
                    ? dadosNota.alunos
                    : [];


            let registroAluno =
                null;


            /*
            Procurar primeiro pelo número
            */

            if (
                numeroAluno
            ) {

                registroAluno =
                    listaAlunos.find(
                        item =>
                            String(
                                item.numero || ""
                            ).trim()
                            === numeroAluno
                    );

            }


            /*
            Procurar pelo nome
            */

            if (
                !registroAluno &&
                nomeAluno
            ) {

                registroAluno =
                    listaAlunos.find(
                        item =>
                            String(
                                item.nome || ""
                            ).trim()
                            === nomeAluno
                    );

            }


            if (
                !registroAluno
            ) {

                continue;

            }


            if (
                !notasAluno[disciplina]
            ) {

                notasAluno[disciplina] =
                    {};

            }


            notasAluno[disciplina][trimestre] = {

                MAC:
                    registroAluno.MAC ?? "",

                NPT:
                    registroAluno.NPT ?? "",

                MF:
                    registroAluno.MF ?? "",

                classificacao:
                    registroAluno.classificacao ||
                    ""

            };

        }


        const disciplinas =
            Object.keys(
                notasAluno
            );


        if (
            disciplinas.length === 0
        ) {

            alert(
                "Ainda não existem notas para este aluno."
            );

            return;

        }


        /*
        ==========================================
        JANELA
        ==========================================
        */

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
                        border-radius:15px;
                        text-align:center;
                        box-shadow:0 3px 10px rgba(0,0,0,.15);
                    "
                >

                    <div
                        style="font-size:42px;"
                    >
                        📊
                    </div>

                    <h2
                        style="margin:5px 0;"
                    >
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


        /*
        ==========================================
        DISCIPLINAS
        ==========================================
        */

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
                    )
                    .sort(
                        (a,b) =>
                            obterTrimestre(a)
                            -
                            obterTrimestre(b)
                    );


                trimestres.forEach(
                    trimestre => {

                        const numero =
                            obterTrimestre(
                                trimestre
                            );


                        const nota =
                            notasAluno
                            [disciplina]
                            [trimestre];


                        const pago =
                            trimestrePago(
                                financeiro,
                                numero
                            );


                        const comunicado =
                            comunicadoTrimestre(
                                financeiro,
                                numero
                            );


                        html += `

                        <div
                            style="
                                margin-bottom:15px;
                                border:1px solid #e2e8f0;
                                border-radius:10px;
                                overflow:hidden;
                                background:white;
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
                                ${formatarTrimestre(trimestre)}

                            </div>

                        `;


                        if (
                            pago
                        ) {

                            html += `

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

                                    <small>
                                        MAC
                                    </small>

                                    <strong
                                        style="
                                            display:block;
                                            font-size:20px;
                                        "
                                    >
                                        ${nota.MAC || "—"}
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
                                        ${nota.NPT || "—"}
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
                                        ${nota.MF || "—"}
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
                                            nota.classificacao ||
                                            "—"
                                        }
                                    </strong>

                                </div>

                            </div>

                            `;

                        }

                        else {

                            html += `

                            <div
                                style="
                                    padding:25px 15px;
                                    text-align:center;
              
background:#fff7ed;
                                "
                            >

                                <div
                                    style="
                                        font-size:38px;
                                    "
                                >
                                    🔒
                                </div>


                                <strong
                                    style="
                                        display:block;
                                        color:#c2410c;
                                        font-size:17px;
                                    "
                                >
                                    Boletim pendente
                                </strong>


                                <p
                                    style="
                                        margin:8px 0;
                                        color:#64748b;
                                    "
                                >
                                    Consulte o administrador.
                                </p>


                                ${
                                    comunicado
                                    ?
                                    `
                                    <div
                                        style="
                                            margin-top:12px;
                                            padding:10px;
                                            background:white;
                                            border-radius:8px;
                                            color:#475569;
                                            font-size:13px;
                                            border:1px solid #fed7aa;
                                        "
                                    >

                                        📢
                                        ${comunicado}

                                    </div>
                                    `
                                    :
                                    ""
                                }

                            </div>

                            `;

                        }


                        html += `

                        </div>

                        `;

                    }
                );


                html += `

                </div>

                `;

            }
        );


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
===================================================== */

window.verBoletim =
async function () {

    try {

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


        if (!turmaId) {

            alert(
                "Não foi possível identificar a turma do aluno."
            );

            return;

        }


        /*

        ==========================================
        FINANCEIRO
        ==========================================
        */

        const financeiro =
            await carregarFinanceiro();


        /*
        ==========================================
        NOTAS
        ==========================================
        */

        const notasSnapshot =
            await getDocs(
                collection(
                    db,
                    "notas"
                )
            );


        const boletim = {};


        for (
            const notaDoc
            of notasSnapshot.docs
        ) {

            const dadosNota =
                notaDoc.data();


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


            if (
                !disciplina ||
                !trimestre
            ) {

                continue;

            }


            const listaAlunos =
                Array.isArray(
                    dadosNota.alunos
                )
                    ? dadosNota.alunos
                    : [];


            let registro =
                null;


            if (
                numeroAluno
            ) {

                registro =
                    listaAlunos.find(
                        item =>
                            String(
                                item.numero || ""
                            ).trim()
                            === numeroAluno
                    );

            }


            if (
                !registro &&
                nomeAluno
            ) {

                registro =
                    listaAlunos.find(
                        item =>
                            String(
                                item.nome || ""
                            ).trim()
                            === nomeAluno
                    );

            }


            if (
                !registro
            ) {

                continue;

            }


            if (
                !boletim[disciplina]
            ) {

                boletim[disciplina] =
                    {};

            }


            boletim[disciplina][trimestre] = {

                MAC:
                    registro.MAC ?? "",

                NPT:
                    registro.NPT ?? "",

                MF:
                    registro.MF ?? "",

                classificacao:
                    registro.classificacao ||
                    ""

            };

        }


        const disciplinas =
            Object.keys(
                boletim
            );


        if (
            disciplinas.length === 0
        ) {

            alert(
                "Ainda não existem notas suficientes para gerar o boletim."
            );

            return;

        }


        /*

       ==========================================
        TABELA DO BOLETIM
        ==========================================
        */

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
                    width:96%;
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
                        border-radius:15px;
                        text-align:center;
                    "
                >

                    <div
                        style="font-size:38px;"
                    >
                        📄
                    </div>

                    <h2>
                        Boletim Escolar
                    </h2>

                    <div>
                        ${aluno.nome || ""}
                    </div>

                    <small>
                        ${aluno.turmaNome || ""}
                    </small>

                </div>


                <div
                    style="
                        background:white;
                        margin-top:15px;
                        padding:10px;
                        border-radius:12px;
                        overflow-x:auto;
                        box-shadow:0 3px 10px rgba(0,0,0,.08);
                    "
                >

                    <table
                        style="
                            width:100%;
                            min-width:850px;
                            border-collapse:collapse;
                            font-size:14px;
                        "
                    >

                        <thead>

                            <tr
                                style="
                                    background:#1e3a8a;
                                    color:white;
                                "
                            >

                                <th
                                    rowspan="2"
                                    style="padding:10px;"
                                >
                                    Disciplina
                                </th>

                                <th colspan="3">
                                    1.º Trimestre
                                </th>

                                <th colspan="3">
                                    2.º Trimestre
                                </th>

                                <th colspan="3">
                                    3.º Trimestre
                                </th>

                            </tr>


                            <tr
                                style="
                                    background:#334155;
                                    color:white;
                                "
                            >

                                <th>MAC</th>
                                <th>NPT</th>
                                <th>MF</th>

                                <th>MAC</th>
                                <th>NPT</th>
                                <th>MF</th>

                                <th>MAC</th>
                                <th>NPT</th>
                                <th>MF</th>

                            </tr>

                        </thead>


                        <tbody>

        `;


        disciplinas.forEach(
            disciplina => {

                const notas =
                    boletim[disciplina];


                const trimestres = {};


                Object.keys(
                    notas
                ).forEach(
                    chave => {

                        const numero =
                            obterTrimestre(
                                chave
                            );


                        if (
                            numero >= 1 &&
                            numero <= 3
                        ) {

                            trimestres[numero] =
                                notas[chave];

                        }

                    }
                );


                const t1 =
                    trimestres[1] || {};

                const t2 =
                    trimestres[2] || {};

                const t3 =
                    trimestres[3] || {};


                const pagoT1 =
                    trimestrePago(
                        financeiro,
                        1
                    );

                const pagoT2 =
                    trimestrePago(
                        financeiro,
                        2
                    );

                const pagoT3 =
                    trimestrePago(
                        financeiro,
                        3
                    );


                html += `

                <tr>

                    <td
                        style="
                            padding:10px;
                            border:1px solid #cbd5e1;
                            font-weight:bold;
                            text-align:left;
                        "
                    >
                        ${disciplina}
                    </td>


                    <td
                        style="
                            border:1px solid #cbd5e1;
                            text-align:center;
                        "
                    >
                        ${
                            pagoT1
                            ? (t1.MAC ?? "—")
                            : "🔒"
                        }
                    </td>


                    <td
                        style="
                            border:1px solid #cbd5e1;
                            text-align:center;
                        "
                    >
                        ${
                            pagoT1
                            ? (t1.NPT ?? "—")
                            : "🔒"
                        }
                    </td>


                    <td
                        style="
                            border:1px solid #cbd5e1;
                            text-align:center;
                            font-weight:bold;
                        "
                    >
                        ${
                            pagoT1
                            ? (t1.MF ?? "—")
                            : "🔒"
                        }
                    </td>


                    <td
                        style="
                            border:1px solid #cbd5e1;
                            text-align:center;
                        "
                    >
                        ${
                            pagoT2
                            ? (t2.MAC ?? "—")
                            : "🔒"
                        }
                    </td>


                    <td
                        style="
                            border:1px solid #cbd5e1;
                            text-align:center;
                        "
                    >
                        ${
                            pagoT2
                            ? (t2.NPT ?? "—")
                            : "🔒"
                        }
                    </td>


                    <td
                        style="
                            border:1px solid #cbd5e1;
                            text-align:center;
                            font-weight:bold;
                        "
                    >
                        ${
                            pagoT2
                            ? (t2.MF ?? "—")
                            : "🔒"
                        }
                    </td>


                    <td
                        style="
                            border:1px solid #cbd5e1;
                            text-align:center;
                        "
                    >
                        ${
        pagoT3
                            ? (t3.MAC ?? "—")
                            : "🔒"
                        }
                    </td>


                    <td
                        style="
                            border:1px solid #cbd5e1;
                            text-align:center;
                        "
                    >
                        ${
                            pagoT3
                            ? (t3.NPT ?? "—")
                            : "🔒"
                        }
                    </td>


                    <td
                        style="
                            border:1px solid #cbd5e1;
                            text-align:center;
                            font-weight:bold;
                        "
                    >
                        ${
                            pagoT3
                            ? (t3.MF ?? "—")
                            : "🔒"
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


                <div
                    style="
                        background:white;
                        margin-top:15px;
                        padding:15px;
                        border-radius:12px;
                        color:#475569;
                        font-size:13px;
                    "
                >

                    <strong>
                        Informação:
                    </strong>

                    O boletim é liberado
                    trimestralmente após a confirmação
                    do pagamento.

                </div>


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
            "Erro ao gerar boletim:",
            error
        );


        alert(
            "Erro ao gerar boletim:\n\n" +
            error.message
        );

    }

};
