alert("ÁREA FINANCEIRA df CARREGADA ✅");

import { app } from "./firebase.js";

import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const db = getFirestore(app);


/* =====================================================
   ELEMENTOS
===================================================== */

const turmaSelect =
    document.getElementById("turmaSelect");

const lista =
    document.getElementById("financeiroLista");


/* =====================================================
   CARREGAR TURMAS
===================================================== */

async function carregarTurmas() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "turmas")
            );


        turmaSelect.innerHTML = `

            <option value="">
                -- Selecione uma turma --
            </option>

        `;


        snapshot.forEach(
            documento => {

                const turma =
                    documento.data();


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    documento.id;


                option.textContent =
                    `${turma.nome || "Turma"} - ${
                        turma.classe || ""
                    }`;


                turmaSelect.appendChild(
                    option
                );

            }
        );


    }
    catch (error) {

        console.error(
            "Erro ao carregar turmas:",
            error
        );


        alert(
            "Erro ao carregar turmas:\n\n" +
            error.message
        );

    }

}


/* =====================================================
   CARREGAR ALUNOS DA TURMA
===================================================== */

/* =====================================================
   CARREGAR ALUNOS DA TURMA
===================================================== */

async function carregarAlunos(
    turmaId
) {

    if (!turmaId) {

        lista.innerHTML = `

            <tr>

                <td colspan="7">

                    Selecione uma turma.

                </td>

            </tr>

        `;

        return;

    }


    try {

        lista.innerHTML = `

            <tr>

                <td colspan="7">

                    A carregar alunos...

                </td>

            </tr>

        `;


        /*
        A estrutura atual do sistema usa
        a subcoleção "alunos" dentro da turma.
        */

        const alunosRef =
            collection(
                db,
                "turmas",
                turmaId,
                "alunos"
            );


        const snapshot =
            await getDocs(
                alunosRef
            );


        lista.innerHTML = "";


        if (snapshot.empty) {

            lista.innerHTML = `

                <tr>

                    <td colspan="7">

                        Nenhum aluno encontrado
                        nesta turma.

                    </td>

                </tr>

            `;

            return;

        }


        /* =================================================
           ORGANIZAR ALUNOS
           Primeiro pelo número do aluno
        ================================================= */

        const alunos =
            snapshot.docs.map(
                documento => ({

                    id:
                        documento.id,

                    dados:
                        documento.data()

                })
            );


        /* =================================================
           ORDENAR PELO NÚMERO
        ================================================= */

        alunos.sort(
            (a, b) => {

                const numeroA =
                    parseInt(
                        a.dados.numero,
                        10
                    );

                const numeroB =
                    parseInt(
                        b.dados.numero,
                        10
                    );


                /*
                Se os dois não tiverem número,
                ordenar pelo nome.
                */

                if (
                    Number.isNaN(numeroA) &&
                    Number.isNaN(numeroB)
                ) {

                    return String(
                        a.dados.nome || ""
                    ).localeCompare(
                        String(
                            b.dados.nome || ""
                        ),
                        "pt"
                    );

                }


                /*
                Aluno sem número vai para o fim.
                */

                if (
                    Number.isNaN(numeroA)
                ) {

                    return 1;

                }


                if (
                    Number.isNaN(numeroB)
                ) {

                    return -1;

                }


                /*
                Ordem crescente:
                1, 2, 3, 4...
                */

                return numeroA - numeroB;

            }
        );


        /* =================================================
           CRIAR LINHAS
        ================================================= */

        let numeroSequencial = 1;


        for (
            const alunoItem
            of alunos
        ) {

            await criarLinhaAluno(

                alunoItem.id,

                alunoItem.dados,

                numeroSequencial

            );


            numeroSequencial++;

        }


    }
    catch (error) {

        console.error(
            "Erro ao carregar alunos:",
            error
        );


        lista.innerHTML = `

            <tr>

                <td colspan="7">

                    Erro ao carregar alunos:

                    ${error.message}

                </td>

            </tr>

        `;

    }

}


 // =====================================================
// ORGANIZAR ALUNOS POR NÚMERO
// =====================================================

const alunos = snapshot.docs.map(
    documento => ({

        id: documento.id,

        dados: documento.data()

    })
);


// =====================================================
// ORDENAR DO Nº MENOR PARA O MAIOR
// =====================================================

alunos.sort(
    (a, b) => {

        const numeroA =
            parseInt(
                a.dados.numero,
                10
            );

        const numeroB =
            parseInt(
                b.dados.numero,
                10
            );


        // Se ambos não tiverem número,
        // ordenar pelo nome

        if (
            Number.isNaN(numeroA) &&
            Number.isNaN(numeroB)
        ) {

            return String(
                a.dados.nome || ""
            ).localeCompare(
                String(
                    b.dados.nome || ""
                ),
                "pt"
            );

        }


        // Sem número vai para o fim

        if (
            Number.isNaN(numeroA)
        ) {

            return 1;

        }


        if (
            Number.isNaN(numeroB)
        ) {

            return -1;

        }


        return numeroA - numeroB;

    }
);


// =====================================================
// CRIAR AS LINHAS NA ORDEM CORRETA
// =====================================================

let numeroSequencial = 1;


for (
    const alunoItem
    of alunos
) {

    await criarLinhaAluno(

        alunoItem.id,

        alunoItem.dados,

        numeroSequencial

    );


    numeroSequencial++;

            }

    }
    catch (error) {

        console.error(
            "Erro ao carregar alunos:",
            error
        );


        lista.innerHTML = `

            <tr>

                <td colspan="7">

                    Erro ao carregar alunos:

                    ${error.message}

                </td>

            </tr>

        `;

    }

}


/* =====================================================
   CRIAR LINHA
===================================================== */

async function criarLinhaAluno(
    alunoId,
    aluno,
    numero
) {


    const financeiro =
        await obterFinanceiro(
            alunoId,
            aluno
        );


    const tr =
        document.createElement("tr");


    tr.innerHTML = `

        <td>

            ${
                aluno.numero
                ||
                numero
            }

        </td>


        <td class="nome">

            ${
                aluno.nome
                ||
                "Aluno sem nome"
            }

        </td>


        <td>

            ${
                aluno.idade
                ||
                "—"
            }

        </td>


        <td>

            ${botaoPagamento(
                alunoId,
                aluno,
                1,
                financeiro
            )}

        </td>


        <td>

            ${botaoPagamento(
                alunoId,
                aluno,
                2,
                financeiro
            )}

        </td>


        <td>

            ${botaoPagamento(
                alunoId,
                aluno,
                3,
                financeiro
            )}

        </td>


        <td>

            <input
                class="comunicado"
                id="comunicado-${alunoId}"
                value="${
                    financeiro.comunicado
                    || ""
                }"
                placeholder="Comunicado..."
            >

            <button
                class="pagamento-btn"
                onclick="
                    salvarComunicado(
                        '${alunoId}'
                    )
                "
            >
                💾
            </button>

        </td>

    `;


    lista.appendChild(tr);

}


/* =====================================================
   BUSCAR FINANCEIRO
===================================================== */

async function obterFinanceiro(
    alunoId,
    aluno
) {

    try {

        const ref =
            doc(
                db,
                "financeiro",
                alunoId
            );


        const resultado =
            await getDoc(ref);


        if (
            resultado.exists()
        ) {

            return resultado.data();

        }


        return {

            alunoId:
                alunoId,

            numero:
                aluno.numero
                || "",

            nome:
                aluno.nome
                || "",

            "1trimestre": {

                pago:false

            },

            "2trimestre": {

                pago:false

            },

            "3trimestre": {

                pago:false

            },

            comunicado:""

        };


    }
    catch (error) {

        console.error(
            "Erro financeiro:",
            error
        );


        return {};

    }

}


/* =====================================================
   BOTÃO PAGAMENTO
===================================================== */

function botaoPagamento(
    alunoId,
    aluno,
    trimestre,
    financeiro
) {


    const chave =
        `${trimestre}trimestre`;


    const pago =
        financeiro?.[
            chave
        ]?.pago === true;


    if (pago) {

        return `

            <button
                class="
                    pagamento-btn
                    pago
                "
                onclick="
                    alterarPagamento(
                        '${alunoId}',
                        ${trimestre}
                    )
                "
            >

                ✅ Pago

            </button>

        `;

    }


    return `

        <button
            class="
                pagamento-btn
                nao-pago
            "
            onclick="
                alterarPagamento(
                    '${alunoId}',
                    ${trimestre}
                )
            "
        >

            ❌ Não pago

        </button>

    `;

}


/* =====================================================
   ALTERAR PAGAMENTO
===================================================== */

window.alterarPagamento =
async function (
    alunoId,
    trimestre
) {


    try {

        const ref =
            doc(
                db,
                "financeiro",
                alunoId
            );


        const resultado =
            await getDoc(ref);


        let dados =
            resultado.exists()
            ? resultado.data()
            : {};


        const chave =
            `${trimestre}trimestre`;


        const estadoAtual =
            dados?.[
                chave
            ]?.pago === true;


        dados[chave] = {

            pago:
                !estadoAtual,

            atualizadoEm:
                new Date()

        };


        await setDoc(
            ref,
            dados,
            {
                merge:true
            }
        );


        /*
        Recarregar a turma
        */

        await carregarAlunos(
            turmaSelect.value
        );


    }
    catch (error) {

        console.error(
            "Erro ao alterar pagamento:",
            error
        );


        alert(
            "Erro ao alterar pagamento:\n\n" +
            error.message
        );

    }

};


/* =====================================================
   COMUNICADO
===================================================== */

window.salvarComunicado =
async function (
    alunoId
) {


    try {

        const campo =
            document.getElementById(
                `comunicado-${alunoId}`
            );


        if (!campo) {

            return;

        }


        const comunicado =
            campo.value.trim();


        const ref =
            doc(
                db,
                "financeiro",
                alunoId
            );


        await setDoc(
            ref,
            {

                comunicado:
                    comunicado

            },
            {
                merge:true
            }
        );


        alert(
            "Comunicado guardado ✅"
        );


    }
    catch (error) {

        console.error(
            "Erro ao guardar comunicado:",
            error
        );


        alert(
            "Erro ao guardar comunicado:\n\n" +
            error.message
        );

    }

};


/* =====================================================
   EVENTO TURMA
===================================================== */

turmaSelect.addEventListener(
    "change",
    function () {

        carregarAlunos(
            this.value
        );

    }
);


/* =====================================================
   INICIAR
===================================================== */

carregarTurmas();
