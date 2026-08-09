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

alert(
    "student-area.js inicializado corretamente ✅"
);

/* =====================================================
   CARREGAR PAGAMENTOS DO ALUNO
===================================================== */

async function carregarPagamentos() {

    try {

        const alunoId =
            String(
                aluno.id || ""
            ).trim();


        if (!alunoId) {

            console.error(
                "ID do aluno não encontrado:",
                aluno
            );

            return {};

        }


        const financeiroRef =
            doc(
                db,
                "financeiro",
                alunoId
            );


        const financeiroSnapshot =
            await getDoc(
                financeiroRef
            );


        if (
            !financeiroSnapshot.exists()
        ) {

            console.log(
                "Nenhum registro financeiro encontrado."
            );

            return {};

        }


        const pagamentoAluno =
            financeiroSnapshot.data();


        console.log(
            "FINANCEIRO DO ALUNO:",
            pagamentoAluno
        );


        return pagamentoAluno;

    }

    catch (error) {

        console.error(
            "Erro ao carregar pagamentos:",
            error
        );


        return {};

    }

}


/* =====================================================
   VER NOTAS
===================================================== */

window.verNotas = async function () {

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
                "Erro: não foi possível identificar a turma do aluno."
            );

            return;

        }


        /* ==============================================
           BUSCAR NOTAS
        ============================================== */

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


            /* Somente notas da turma */

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


            let registroAluno = null;


            /* ==========================================
               PROCURAR PELO NÚMERO
            ========================================== */

            if (numeroAluno) {

                registroAluno =
                    listaAlunos.find(
                        item =>
                            String(
                                item.numero || ""
                            ).trim()
                            === numeroAluno
                    );

            }


            /* ==========================================
               SE NÃO ENCONTRAR → PROCURAR PELO NOME
            ========================================== */

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


            if (!registroAluno) {

                continue;

            }


            if (
                !notasAluno[disciplina]
            ) {

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
                    registroAluno.classificacao ||
                    ""

            };

        }


        console.log(
            "NOTAS DO ALUNO:",
            notasAluno
        );


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


        /* ==============================================
           CRIAR JANELA
        ============================================== */

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
                    "
                >

                    <div style="font-size:40px;">
                        📊
                    </div>

                    <h2>
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


        /* ==============================================
           DISCIPLINAS
        ============================================== */

        disciplinas.forEach(
            disciplina => {

                html += `

                <div
                    style="
                        background:white;
                        margin-top:18px;
                        border-radius:15px;
                        padding:18px;
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


                const notas =
                    notasAluno[
                        disciplina
                    ];


                Object.keys(notas)
                .sort(
                    (
                        a,
                        b
                    ) =>
                        obterTrimestre(a)
                        -
                        obterTrimestre(b)
                )
                .forEach(
                    trimestre => {

                        const nota =
                            notas[
                                trimestre
                            ];


                        const numeroTrimestre =
                            obterTrimestre(
                                trimestre
                            );


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
                                ${
                                    formatarTrimestre(
                                        numeroTrimestre
                                    )
                                }

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
                                            nota.MAC ||
                                            "—"
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
                                            nota.NPT ||
                                            "—"
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
                                            nota.MF ||
                                            "—"
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
                                            nota.classificacao ||
                                            "—"
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


        /* ==============================================
           BOTÃO VOLTAR
        ============================================== */

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
            "ERRO AO CARREGAR NOTAS:",
            error
        );


        alert(
            "Erro ao carregar notas:\n\n" +
            error.message
        );

    }

};
