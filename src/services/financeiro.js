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


        /*
        Transformar as turmas em array
        para manter uma ordem estável.
        */

        const turmas =
            snapshot.docs.map(
                documento => ({

                    id:
                        documento.id,

                    dados:
                        documento.data()

                })
            );


        /*
        Ordenar pelo nome da turma.
        */

        turmas.sort(
            (a, b) => {

                const nomeA =
                    String(
                        a.dados.nome || ""
                    );

                const nomeB =
                    String(
                        b.dados.nome || ""
                    );


                return nomeA.localeCompare(
                    nomeB,
                    "pt"
                );

            }
        );


        /*
        Criar opções.
        */

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


        /*
        Mostrar carregamento.
        */

        lista.innerHTML = `

            <tr>

                <td colspan="7">

                    A carregar alunos...

                </td>

            </tr>

        `;


        /*
        Buscar alunos da turma.
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


        /*
        Verificar se existem alunos.
        */

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


        /*
        =================================================
        TRANSFORMAR DOCUMENTOS EM ARRAY
        =================================================
        */

        const alunos =
            snapshot.docs.map(
                documento => ({

                    id:
                        documento.id,

                    dados:
                        documento.data()

                })
            );


        /*
        =================================================
        ORDENAR ALUNOS PELO NÚMERO
        =================================================
        */

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
                Ambos sem número:
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
                A não tem número:
                vai para o fim.
                */

                if (
                    Number.isNaN(numeroA)
                ) {

                    return 1;

                }


                /*
                B não tem número:
                vai para o fim.
                */

                if (
                    Number.isNaN(numeroB)
                ) {

                    return -1;

                }


                /*
                Ordem crescente:

                1
                2
                3
                4
                ...
                */

                return numeroA - numeroB;

            }
        );


        /*
        Limpar tabela.
        */

        lista.innerHTML = "";


        /*
        =================================================
        CRIAR LINHAS
        =================================================
        */

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
            "Alunos carregados:",
            alunos.length
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


    /*
    Buscar dados financeiros.
    */

    const financeiro =
        await obterFinanceiro(
            alunoId,
            aluno
        );


    /*
    Criar linha.
    */

    const tr =
        document.createElement(
            "tr"
        );


    /*
    Número real do aluno.
    */

    const numeroAluno =
        aluno.numero ||
        numero;


    /*
    Nome.
    */

    const nomeAluno =
        aluno.nome ||
        "Aluno sem nome";


    /*
    Idade.
    */

    const idade =
        aluno.idade ||
        "—";


    tr.innerHTML = `

        <!-- NÚMERO -->

        <td>

            ${numeroAluno}

        </td>


        <!-- NOME -->

        <td class="nome">

            ${nomeAluno}

        </td>


        <!-- IDADE -->

        <td>

            ${idade}

        </td>


        <!-- 1º TRIMESTRE -->

        <td>

            ${botaoPagamento(

                alunoId,

                aluno,

                1,

                financeiro

            )}

        </td>


        <!-- 2º TRIMESTRE -->

        <td>

            ${botaoPagamento(

                alunoId,

                aluno,

                2,

                financeiro

            )}

        </td>


        <!-- 3º TRIMESTRE -->

        <td>

            ${botaoPagamento(

                alunoId,

                aluno,

                3,

                financeiro

            )}

        </td>


        <!-- COMUNICADO -->

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


        /*
        Se já existe.
        */

        if (
            resultado.exists()
        ) {

            return resultado.data();

        }


        /*
        Se ainda não existe,
        criar estrutura padrão em memória.
        */

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


    /*
    =================================================
    PAGO
    =================================================
    */

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


    /*
    =================================================
    NÃO PAGO
    =================================================
    */

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


        /*
        Chave:

        1trimestre
        2trimestre
        3trimestre
        */

        const chave =
            `${trimestre}trimestre`;


        /*
        Estado atual.
        */

        const estadoAtual =
            dados?.[
                chave
            ]?.pago === true;


        /*
        Inverter estado.
        */

        dados[chave] = {

            pago:
                !estadoAtual,

            atualizadoEm:
                new Date()

        };


        /*
        Guardar no Firestore.
        */

        await setDoc(

            ref,

            dados,

            {
                merge: true
            }

        );


        console.log(
            `Pagamento ${trimestre}º trimestre atualizado:`,
            !estadoAtual
        );


        /*
        Recarregar a lista.

        A ordenação será novamente feita
        pelo número do aluno.
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
