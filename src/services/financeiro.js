// =====================================================
// ÁREA FINANCEIRA - SGE
// Gestão de propinas por trimestre
// =====================================================

alert("ÁREA FINANCEIRA CARREGADA ✅");

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

// =====================================================
// ELEMENTOS
// =====================================================

const turmaSelect =
document.getElementById("turmaSelect");

const lista =
document.getElementById("financeiroLista");

// =====================================================
// VERIFICAR ELEMENTOS
// =====================================================

if (!turmaSelect) {

alert(
    "Erro: elemento turmaSelect não encontrado."
);

throw new Error(
    "turmaSelect não encontrado."
);

}

if (!lista) {

alert(
    "Erro: elemento financeiroLista não encontrado."
);

throw new Error(
    "financeiroLista não encontrado."
);

}

// =====================================================
// CARREGAR TURMAS
// =====================================================

async function carregarTurmas() {

try {

    const snapshot =
        await getDocs(
            collection(
                db,
                "turmas"
            )
        );


    turmaSelect.innerHTML = `

        <option value="">
            -- Selecione uma turma --
        </option>

    `;


    const turmas =
        snapshot.docs.map(
            documento => ({

                id:
                    documento.id,

                dados:
                    documento.data()

            })
        );


    // =================================================
    // ORDEM FIXA DAS TURMAS
    // =================================================

    turmas.sort(
        (a, b) => {

            const nomeA =
                String(
                    a.dados.nome || ""
                ).trim();

            const nomeB =
                String(
                    b.dados.nome || ""
                ).trim();


            return nomeA.localeCompare(
                nomeB,
                "pt"
            );

        }
    );


    turmas.forEach(
        turmaItem => {

            const turma =
                turmaItem.dados;


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                turmaItem.id;


            option.textContent =
                `${turma.nome || "Turma"} - ${
                    turma.classe || ""
                }`;


            turmaSelect.appendChild(
                option
            );

        }
    );


    console.log(
        "Turmas carregadas:",
        turmas.length
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

// =====================================================
// CARREGAR ALUNOS DA TURMA
// =====================================================

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


    // =================================================
    // BUSCAR ALUNOS
    // =================================================

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


    // =================================================
    // TRANSFORMAR EM ARRAY
    // =================================================

    const alunos =
        snapshot.docs.map(
            documento => ({

                id:
                    documento.id,

                dados:
                    documento.data()

            })
        );


    // =================================================
    // ORDEM FIXA DOS ALUNOS
    // =================================================

    alunos.sort(
        (a, b) => {

            const numeroA =
                parseInt(
                    String(
                        a.dados.numero ?? ""
                    ).trim(),
                    10
                );

            const numeroB =
                parseInt(
                    String(
                        b.dados.numero ?? ""
                    ).trim(),
                    10
                );


            // -----------------------------------------
            // Ambos sem número
            // -----------------------------------------

            if (
                Number.isNaN(numeroA) &&
                Number.isNaN(numeroB)
            ) {

                return String(
                    a.dados.nome || ""
                ).trim().localeCompare(
                    String(
                        b.dados.nome || ""
                    ).trim(),
                    "pt"
                );

            }


            // -----------------------------------------
            // A sem número
            // -----------------------------------------

            if (
                Number.isNaN(numeroA)
            ) {

                return 1;

            }


            // -----------------------------------------
            // B sem número
            // -----------------------------------------

            if (
                Number.isNaN(numeroB)
            ) {

                return -1;

            }


            // -----------------------------------------
            // Número crescente
            // -----------------------------------------

            if (
                numeroA !== numeroB
            ) {

                return numeroA - numeroB;

            }


            // -----------------------------------------
            // Mesmo número:
            // usar nome como segundo critério
            // -----------------------------------------

            return String(
                a.dados.nome || ""
            ).trim().localeCompare(
                String(
                    b.dados.nome || ""
                ).trim(),
                "pt"
            );

        }
    );


    // =================================================
    // LIMPAR LISTA
    // =================================================

    lista.innerHTML = "";


    // =================================================
    // CRIAR LINHAS
    // =================================================

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


    console.log(
        "Alunos carregados em ordem fixa:",
        alunos.map(
            aluno => ({
                numero:
                    aluno.dados.numero,

                nome:
                    aluno.dados.nome
            })
        )
    );

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
// CRIAR LINHA DO ALUNO
// =====================================================

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
    document.createElement(
        "tr"
    );


// =================================================
// ID DA LINHA
// =================================================

tr.id =
    `aluno-linha-${alunoId}`;


// =================================================
// DADOS
// =================================================

const numeroAluno =
    aluno.numero ||
    numero;


const nomeAluno =
    aluno.nome ||
    "Aluno sem nome";


const idade =
    aluno.idade ||
    "—";


// =================================================
// HTML
// =================================================

tr.innerHTML = `

    <td>

        ${numeroAluno}

    </td>


    <td class="nome">

        ${nomeAluno}

    </td>


    <td>

        ${idade}

    </td>


    <td id="pagamento-${alunoId}-1">

        ${botaoPagamento(
            alunoId,
            aluno,
            1,
            financeiro
        )}

    </td>


    <td id="pagamento-${alunoId}-2">

        ${botaoPagamento(
            alunoId,
            aluno,
            2,
            financeiro
        )}

    </td>


    <td id="pagamento-${alunoId}-3">

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
                financeiro.comunicado || ""
            }"
            placeholder="Comunicado..."
        >


        <button
            type="button"
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


lista.appendChild(
    tr
);

}

// =====================================================
// BUSCAR DADOS FINANCEIROS
// =====================================================

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
        await getDoc(
            ref
        );


    if (
        resultado.exists()
    ) {

        return resultado.data();

    }


    return {

        alunoId:
            alunoId,

        numero:
            aluno.numero || "",

        nome:
            aluno.nome || "",

        "1trimestre": {

            pago: false

        },

        "2trimestre": {

            pago: false

        },

        "3trimestre": {

            pago: false

        },

        comunicado: ""

    };

}
catch (error) {

    console.error(
        "Erro ao buscar financeiro:",
        error
    );


    return {

        "1trimestre": {

            pago: false

        },

        "2trimestre": {

            pago: false

        },

        "3trimestre": {

            pago: false

        },

        comunicado: ""

    };

}

}

// =====================================================
// BOTÃO DE PAGAMENTO
// =====================================================

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
            type="button"
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
        type="button"
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

// =====================================================
// ALTERAR PAGAMENTO
// =====================================================

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
        await getDoc(
            ref
        );


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


    const novoEstado =
        !estadoAtual;


    dados[chave] = {

        pago:
            novoEstado,

        atualizadoEm:
            new Date()

    };


    // =================================================
    // GUARDAR
    // =================================================

    await setDoc(

        ref,

        dados,

        {
            merge: true
        }

    );


    console.log(
        `Aluno ${alunoId} - ${chave}:`,
        novoEstado
    );


    // =================================================
    // ATUALIZAR APENAS O BOTÃO
    // NÃO RECARREGAR A LISTA
    // =================================================

    const celula =
        document.getElementById(
            `pagamento-${alunoId}-${trimestre}`
        );


    if (celula) {

        celula.innerHTML =
            botaoPagamento(

                alunoId,

                {},

                trimestre,

                {

                    [chave]: {

                        pago:
                            novoEstado

                    }

                }

            );

    }


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

// =====================================================
// SALVAR COMUNICADO
// =====================================================

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

        alert(
            "Campo de comunicado não encontrado."
        );

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
            merge: true
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

// =====================================================
// EVENTO — MUDAR TURMA
// =====================================================

turmaSelect.addEventListener(
"change",
function () {

    carregarAlunos(
        this.value
    );

}

);

// =====================================================
// INICIAR SISTEMA
// =====================================================

carregarTurmas();
