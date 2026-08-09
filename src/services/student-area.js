alert("ÁREA DO ALUNO CARREGADA ✅");

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    updateDoc
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
   FINANCEIRO DO ALUNO
===================================================== */

async function carregarEstadoFinanceiro() {

    try {

        const turmaId =
            String(aluno.turmaId || "").trim();

        const alunoId =
            String(
                aluno.alunoId ||
                aluno.id ||
                aluno.numero ||
                ""
            ).trim();


        if (!turmaId || !alunoId) {

            console.warn(
                "Não foi possível identificar turma/aluno para o financeiro."
            );

            return {};

        }


        const referencia =
            doc(
                db,
                "turmas",
                turmaId,
                "alunos",
                alunoId,
                "financeiro",
                "estado"
            );


        const resultado =
            await getDoc(referencia);


        if (!resultado.exists()) {

            return {};

        }


        return resultado.data();


    } catch (error) {

        console.error(
            "Erro ao carregar financeiro:",
            error
        );

        return {};

    }

}


/* =====================================================
   VERIFICAR PAGAMENTO DO TRIMESTRE
===================================================== */

function trimestreNumerico(valor) {

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

        return 1;

    }


    if (
        v === "2" ||
        v === "2º" ||
        v === "2°" ||
        v.includes("2º trimestre") ||
        v.includes("2° trimestre")
    ) {

        return 2;

    }


    if (
        v === "3" ||
        v === "3º" ||
        v === "3°" ||
        v.includes("3º trimestre") ||
        v.includes("3° trimestre")
    ) {

        return 3;

    }


    return 0;

}


function chaveFinanceiro(trimestre) {

    const numero =
        trimestreNumerico(trimestre);


    if (numero === 1) {

        return "1trimestre";

    }


    if (numero === 2) {

        return "2trimestre";

    }


    if (numero === 3) {

        return "3trimestre";

    }


    return "";

}


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
   CARREGAR ESTADO FINANCEIRO
========================================== */

let financeiroAluno = {};

try {

    const turmaIdFinanceiro =
        String(aluno.turmaId || "").trim();

    const alunoIdFinanceiro =
        String(
            aluno.alunoId ||
            aluno.id ||
            aluno.numero ||
            ""
        ).trim();


    if (
        turmaIdFinanceiro &&
        alunoIdFinanceiro
    ) {

        const financeiroRef =
            doc(
                db,
                "turmas",
                turmaIdFinanceiro,
                "alunos",
                alunoIdFinanceiro,
                "financeiro",
                "estado"
            );


        const financeiroDoc =
            await getDoc(
                financeiroRef
            );


        if (
            financeiroDoc.exists()
        ) {

            financeiroAluno =
                financeiroDoc.data();

        }

    }

}
catch (erroFinanceiro) {

    console.warn(
        "Não foi possível carregar o estado financeiro:",
        erroFinanceiro
    );

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

                        const numeroTrimestre =
    trimestreNumerico(trimestre);

const chavePagamento =
    numeroTrimestre === 1
        ? "1trimestre"
        : numeroTrimestre === 2
            ? "2trimestre"
            : numeroTrimestre === 3
                ? "3trimestre"
                : "";

const dadosPagamento =
    financeiroAluno[chavePagamento] || {};

const pago =
    dadosPagamento.pago === true;

const comunicado =
    dadosPagamento.comunicado || "";

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

        📝 ${formatarTrimestre(trimestre)}

    </div>


    ${
        pago

        ?

        `
        <div
            style="
                display:grid;
                grid-template-columns:repeat(4,1fr);
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
                    ${nota.MAC || "—"}
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
                    ${nota.NPT || "—"}
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
                    ${nota.classificacao || "—"}
                </strong>

            </div>

        </div>
        `

        :

        `
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
                    margin-bottom:8px;
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
                    📢 ${comunicado}
                </div>
                `
                :
                ""
            }

        </div>
        `

    }

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

function trimestreNumerico(valor) {

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
        return 1;
    }


    if (
        v === "2" ||
        v === "2º" ||
        v === "2°" ||
        v.includes("2º trimestre") ||
        v.includes("2° trimestre")
    ) {
        return 2;
    }


    if (
        v === "3" ||
        v === "3º" ||
        v === "3°" ||
        v.includes("3º trimestre") ||
        v.includes("3° trimestre")
    ) {
        return 3;
    }


    return 0;

                   }


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

window.verBoletim = async function () {

    try {

        const turmaId =
            String(aluno.turmaId || "").trim();

        const numeroAluno =
            String(aluno.numero || "").trim();

        const nomeAluno =
            String(aluno.nome || "").trim();


        if (!turmaId) {

            alert(
                "Não foi possível identificar a turma do aluno."
            );

            return;
        }


        /* ==========================================
           BUSCAR NOTAS
        ========================================== */

        const notasSnapshot =
            await getDocs(
                collection(db, "notas")
            );


        const boletim = {};


        for (
            const notaDoc
            of notasSnapshot.docs
        ) {

            const dadosNota =
                notaDoc.data();


            /* Somente notas desta turma */

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


            let registro = null;


            /* Procurar pelo número */

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


            /* Se não encontrar, procurar pelo nome */

            if (!registro && nomeAluno) {

                registro =
                    listaAlunos.find(
                        item =>
                            String(
                                item.nome || ""
                            ).trim()
                            ===
                            nomeAluno
                    );

            }


            if (!registro) {

                continue;

            }


            if (!boletim[disciplina]) {

                boletim[disciplina] = {};

            }


            boletim[disciplina][trimestre] = {

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


        const disciplinas =
            Object.keys(boletim);


        if (disciplinas.length === 0) {

            alert(
                "Ainda não existem notas suficientes para gerar o boletim."
            );

            return;

        }


        /* ==========================================
           FUNÇÃO TRIMESTRE
        ========================================== */

        function obterTrimestre(numero) {

            const valor =
                String(numero)
                .trim()
                .toLowerCase();


            if (
                valor === "1" ||
                valor === "1º" ||
                valor === "1°" ||
                valor.includes("1º trimestre") ||
                valor.includes("1° trimestre")
            ) {

                return 1;

            }


            if (
                valor === "2" ||
                valor === "2º" ||
                valor === "2°" ||
                valor.includes("2º trimestre") ||
                valor.includes("2° trimestre")
            ) {

                return 2;

            }


            if (
                valor === "3" ||
                valor === "3º" ||
                valor === "3°" ||
                valor.includes("3º trimestre") ||
                valor.includes("3° trimestre")
            ) {

                return 3;

            }


            return 99;

        }


        /* ==========================================
           CALCULAR MÉDIA ANUAL
        ========================================== */

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


        function calcularMediaAnual(notas) {

            const valores = [];


            Object.values(notas)
            .forEach(nota => {

                const mf =
                    numeroMF(nota.MF);


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


        /* ==========================================
           JANELA DO BOLETIM
        ========================================== */

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
                    max-width:1000px;
                    margin:auto;
                    padding:20px 0 40px;
                "
            >


                <!-- CABEÇALHO -->

                <div
                    style="
                        background:#1e3a8a;
                        color:white;
                        padding:25px 15px;
                        border-radius:15px;
                        text-align:center;
                        box-shadow:0 3px 10px rgba(0,0,0,.15);
                    "
                >

                    <div
                        style="
                            font-size:42px;
                        "
                    >
                        📄
                    </div>


                    <h2
                        style="
                            margin:5px 0;
                        "
                    >
                        BOLETIM ESCOLAR
                    </h2>


                    <div
                        style="
                            font-size:16px;
                        "
                    >
                        ${aluno.nome || "—"}
                    </div>

                </div>


                <!-- DADOS DO ALUNO -->

                <div
                    style="
                        background:white;
                        margin-top:15px;
                        padding:18px;
                        border-radius:12px;
                        box-shadow:0 3px 10px rgba(0,0,0,.08);
                        line-height:1.8;
                    "
                >

                    <strong>Nome:</strong>
                    ${aluno.nome || "—"}

                    <br>

                    <strong>Código:</strong>
                    ${aluno.codigoAluno || "—"}

                    <br>

                    <strong>Número:</strong>
                    ${aluno.numero || "—"}

                    <br>

                    <strong>Classe:</strong>
                    ${aluno.classe || "—"}

                    <br>

                    <strong>Turma:</strong>
                    ${aluno.turmaNome || "—"}

                    <br>

                    <strong>Ano Letivo:</strong>
                    ${aluno.anoLetivo || "—"}

                </div>


                <!-- TABELA -->

                <div
                    style="
                        background:white;
                        margin-top:15px;
                        padding:10px;
                        border-radius:12px;
                        box-shadow:0 3px 10px rgba(0,0,0,.08);
                        overflow-x:auto;
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

                                <th
                                    rowspan="2"
                                    style="padding:10px;"
                                >
                                    Média
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


        /* ==========================================
           LINHAS DAS DISCIPLINAS
        ========================================== */

        disciplinas.forEach(
            disciplina => {

                const notas =
                    boletim[disciplina];


                const trimestres = {

                    1: null,
                    2: null,
                    3: null

                };


                Object.keys(notas)
                .forEach(chave => {

                    const numero =
                        obterTrimestre(chave);


                    if (
                        numero >= 1 &&
                        numero <= 3
                    ) {

                        trimestres[numero] =
                            notas[chave];

                    }

                });


                const t1 =
                    trimestres[1] || {};

                const t2 =
                    trimestres[2] || {};

                const t3 =
                    trimestres[3] || {};


                const media =
                    calcularMediaAnual(
                        notas
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
    ${t1.MAC ?? "—"}
</td>

<td
    style="
        border:1px solid #cbd5e1;
        text-align:center;
    "
>
    ${t1.NPT ?? "—"}
</td>

<td
    style="
        border:1px solid #cbd5e1;
        text-align:center;
        font-weight:bold;
    "
>
    ${t1.MF ?? "—"}
</td>


<td
    style="
        border:1px solid #cbd5e1;
        text-align:center;
    "
>
    ${t2.MAC ?? "—"}
</td>

<td
    style="
        border:1px solid #cbd5e1;
        text-align:center;
    "
>
    ${t2.NPT ?? "—"}
</td>

<td
    style="
        border:1px solid #cbd5e1;
        text-align:center;
        font-weight:bold;
    "
>
    ${t2.MF ?? "—"}
</td>


<td
    style="
        border:1px solid #cbd5e1;
        text-align:center;
    "
>
    ${t3.MAC ?? "—"}
</td>

<td
    style="
        border:1px solid #cbd5e1;
        text-align:center;
    "
>
    ${t3.NPT ?? "—"}
</td>

<td
    style="
        border:1px solid #cbd5e1;
        text-align:center;
        font-weight:bold;
    "
>
    ${t3.MF ?? "—"}
</td>


<td
    style="
        border:1px solid #cbd5e1;
        text-align:center;
        font-weight:bold;
    "
>
    ${media || "—"}
</td>

                </tr>

                `;

            }
        );


        html += `

                        </tbody>

                    </table>

                </div>


                <!-- OBSERVAÇÃO -->

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

                    <strong>Nota:</strong>

                    A média apresentada corresponde à média das
                    MF dos trimestres que possuem notas.

                </div>


                <!-- BOTÃO -->

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

/* =====================================================
   DADOS PESSOAIS
===================================================== */

window.verDados = function () {

    const antigo =
        document.getElementById("janelaDadosAluno");

    if (antigo) {
        antigo.remove();
    }


    const html = `

    <div
        id="janelaDadosAluno"
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
                width:92%;
                max-width:650px;
                margin:0 auto;
                padding:20px 0 40px;
            "
        >

            <!-- CABEÇALHO -->

            <div
                style="
                    background:#1e3a8a;
                    color:white;
                    padding:25px 20px;
                    border-radius:16px;
                    text-align:center;
                    box-shadow:0 3px 10px rgba(0,0,0,.15);
                "
            >

                <div
                    style="
                        font-size:45px;
                        margin-bottom:8px;
                    "
                >
                    👤
                </div>

                <h2 style="margin:0;">
                    Dados Pessoais
                </h2>

                <p style="margin:8px 0 0;">
                    ${aluno.nome || "Aluno"}
                </p>

            </div>


            <!-- DADOS -->

            <div
                style="
                    background:white;
                    margin-top:15px;
                    border-radius:14px;
                    box-shadow:0 3px 10px rgba(0,0,0,.08);
                    overflow:hidden;
                "
            >

                <div style="
                    padding:16px;
                    border-bottom:1px solid #e2e8f0;
                ">
                    <strong>Nome</strong>
                    <br>
                    ${aluno.nome || "—"}
                </div>


                <div style="
                    padding:16px;
                    border-bottom:1px solid #e2e8f0;
                ">
                    <strong>Código do aluno</strong>
                    <br>
                    ${aluno.codigoAluno || "—"}
                </div>


                <div style="
                    padding:16px;
                    border-bottom:1px solid #e2e8f0;
                ">
                    <strong>Número</strong>
                    <br>
                    ${aluno.numero || "—"}
                </div>


                <div style="
                    padding:16px;
                    border-bottom:1px solid #e2e8f0;
                ">
                    <strong>Sexo</strong>
                    <br>
                    ${aluno.sexo || "—"}
                </div>


                <div style="
                    padding:16px;
                    border-bottom:1px solid #e2e8f0;
                ">
                    <strong>Classe</strong>
                    <br>
                    ${aluno.classe || "—"}
                </div>


                <div style="
                    padding:16px;
                    border-bottom:1px solid #e2e8f0;
                ">
                    <strong>Turma</strong>
                    <br>
                    ${aluno.turmaNome || "—"}
                </div>


                <div style="
                    padding:16px;
                    border-bottom:1px solid #e2e8f0;
                ">
                    <strong>Ano letivo</strong>
                    <br>
                    ${aluno.anoLetivo || "—"}
                </div>


                <div style="
                    padding:16px;
                    border-bottom:1px solid #e2e8f0;
                ">
                    <strong>Ensino</strong>
                    <br>
                    ${aluno.ensino || "—"}
                </div>


                <div style="
                    padding:16px;
                ">
                    <strong>Estado</strong>
                    <br>
                    ${aluno.estado || "—"}
                </div>

            </div>


            <!-- VOLTAR -->

            <button
                id="fecharDadosAluno"
                style="
                    width:100%;
                    padding:15px;
                    margin-top:15px;
                    background:#dc2626;
                    color:white;
                    border:none;
                    border-radius:10px;
                    font-size:16px;
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


    const fechar =
        document.getElementById(
            "fecharDadosAluno"
        );


    if (fechar) {

        fechar.onclick = function () {

            const janela =
                document.getElementById(
                    "janelaDadosAluno"
                );

            if (janela) {
                janela.remove();
            }

        };

    }

};


/* =====================================================
   ALTERAR SENHA
===================================================== */

window.alterarSenha = async function () {

    const senhaAtual = prompt(
        "🔐 ALTERAR SENHA\n\nDigite a senha atual:"
    );

    if (senhaAtual === null) return;

    if (!senhaAtual.trim()) {
        alert("Digite a senha atual.");
        return;
    }


    const novaSenha = prompt(
        "Digite a nova senha:"
    );

    if (novaSenha === null) return;

    if (novaSenha.trim().length < 4) {

        alert(
            "A nova senha deve ter pelo menos 4 caracteres."
        );

        return;
    }


    const confirmar = prompt(
        "Digite novamente a nova senha:"
    );

    if (confirmar === null) return;


    if (novaSenha !== confirmar) {

        alert(
            "❌ As novas senhas não coincidem."
        );

        return;
    }


    try {

        /* =====================================
           LOCALIZAR TURMA
        ===================================== */

        const turmaId =
            String(aluno.turmaId || "").trim();


        const codigoAluno =
            String(aluno.codigoAluno || "").trim();


        if (!turmaId || !codigoAluno) {

            alert(
                "Não foi possível identificar o aluno."
            );

            return;
        }


        /* =====================================
           BUSCAR ALUNOS DA TURMA
        ===================================== */

        const alunosRef =
            collection(
                db,
                "turmas",
                turmaId,
                "alunos"
            );


        const snapshot =
            await getDocs(alunosRef);


        let alunoEncontrado = null;


        snapshot.forEach(alunoDoc => {

            const dados =
                alunoDoc.data();


            const codigo =
                String(
                    dados.codigoAluno || ""
                ).trim();


            if (codigo === codigoAluno) {

                alunoEncontrado = {

                    id: alunoDoc.id,

                    dados: dados

                };

            }

        });


        if (!alunoEncontrado) {

            alert(
                "❌ Aluno não encontrado na turma."
            );

            return;
        }


        /* =====================================
           VERIFICAR SENHA ATUAL
        ===================================== */

        const senhaFirebase =
            String(
                alunoEncontrado.dados.senha ||
                alunoEncontrado.dados.senhaAcesso ||
                ""
            ).trim();


        if (
            senhaAtual.trim() !==
            senhaFirebase
        ) {

            alert(
                "❌ A senha atual está incorreta."
            );

            return;
        }


        /* =====================================
           ATUALIZAR SENHA
        ===================================== */

        const alunoRef =
            doc(
                db,
                "turmas",
                turmaId,
                "alunos",
                alunoEncontrado.id
            );


        await updateDoc(

            alunoRef,

            {

                senha:
                    novaSenha.trim(),

                senhaAcesso:
                    novaSenha.trim()

            }

        );


        /* =====================================
           ATUALIZAR SESSÃO
        ===================================== */

        aluno.senha =
            novaSenha.trim();

        aluno.senhaAcesso =
            novaSenha.trim();


        localStorage.setItem(

            "alunoLogado",

            JSON.stringify(aluno)

        );


        alert(
            "✅ SENHA ALTERADA COM SUCESSO!\n\n" +
            "A nova senha já está ativa."
        );


    }

    catch (error) {

        console.error(
            "Erro ao alterar senha:",
            error
        );


        alert(
            "❌ Não foi possível alterar a senha.\n\n" +
            error.message
        );

    }

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
