// =====================================================
// ÁREA FINANCEIRA - SGE
// Gestão de propinas por trimestre
// Proteção por senha
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
// CONFIGURAÇÃO DA SENHA
// =====================================================

// Senha utilizada apenas na primeira configuração.
// Depois de alterar, a nova senha ficará no Firestore.

const SENHA_INICIAL =
"123456";

const DOCUMENTO_SENHA =
"config/financeiro";

// =====================================================
// ELEMENTOS
// =====================================================

const turmaSelect =
document.getElementById("turmaSelect");

const lista =
document.getElementById("financeiroLista");

const alterarSenhaBtn =
document.getElementById("alterarSenhaBtn");

const painelSenha =
document.getElementById("painelSenha");

const senhaAtual =
document.getElementById("senhaAtual");

const novaSenha =
document.getElementById("novaSenha");

const confirmarSenha =
document.getElementById("confirmarSenha");

const guardarSenhaBtn =
document.getElementById("guardarSenhaBtn");

const cancelarSenhaBtn =
document.getElementById("cancelarSenhaBtn");

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
// ESTADO DE AUTENTICAÇÃO
// =====================================================

let financeiroAutorizado = false;

// =====================================================
// BUSCAR SENHA FINANCEIRA
// =====================================================

async function obterSenhaFinanceira() {

try {

    const ref =
        doc(
            db,
            "config",
            "financeiro"
        );


    const resultado =
        await getDoc(ref);


    /*
    Se ainda não existe configuração,
    usar senha inicial e criar documento.
    */

    if (!resultado.exists()) {

        await setDoc(
            ref,
            {
                senha:
                    SENHA_INICIAL,

                criadoEm:
                    new Date()
            }
        );


        return SENHA_INICIAL;

    }


    const dados =
        resultado.data();


    return String(
        dados.senha ||
        SENHA_INICIAL
    ).trim();

}
catch (error) {

    console.error(
        "Erro ao obter senha financeira:",
        error
    );

    throw error;

}

}

// =====================================================
// PEDIR SENHA
// =====================================================

async function solicitarSenhaFinanceira() {

try {

    const senhaCorreta =
        await obterSenhaFinanceira();


    const senhaDigitada =
        prompt(
            "🔐 ÁREA FINANCEIRA\n\n" +
            "Digite a senha para continuar:"
        );


    /*
    Cancelou
    */

    if (senhaDigitada === null) {

        alert(
            "Acesso cancelado."
        );

        return false;

    }


    /*
    Verificar senha
    */

    if (
        senhaDigitada.trim() !==
        senhaCorreta
    ) {

        alert(
            "❌ Senha incorreta."
        );

        return false;

    }


    financeiroAutorizado =
        true;


    alert(
        "✅ Acesso à Área Financeira autorizado."
    );


    return true;

}
catch (error) {

    console.error(
        "Erro na autenticação financeira:",
        error
    );


    alert(
        "Erro ao verificar senha:\n\n" +
        error.message
    );


    return false;

}

}

// =====================================================
// PROTEGER A ÁREA
// =====================================================

async function iniciarAreaFinanceira() {

/*
Esconder conteúdo inicialmente.
*/

if (turmaSelect) {

    turmaSelect.disabled =
        true;

}


lista.innerHTML = `

    <tr>

        <td colspan="7">

            🔐 Área Financeira protegida.
            Digite a senha para continuar.

        </td>

    </tr>

`;


const autorizado =
    await solicitarSenhaFinanceira();


if (!autorizado) {

    /*
    Não carregar turmas.
    */

    lista.innerHTML = `

        <tr>

            <td colspan="7">

                🔒 Acesso bloqueado.

            </td>

        </tr>

    `;

    return;

}


/*
Liberar seleção.
*/

turmaSelect.disabled =
    false;


/*
Carregar turmas.
*/

await carregarTurmas();

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
    Transformar em array.
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
    Ordenar turmas.
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
// CARREGAR ALUNOS
// =====================================================

async function carregarAlunos(
turmaId
) {

if (!financeiroAutorizado) {

    alert(
        "🔒 Área Financeira bloqueada."
    );

    return;

}


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


    /*
    Transformar documentos em array.
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
    ORDENAR PELO NÚMERO
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
            A sem número.
            */

            if (
                Number.isNaN(numeroA)
            ) {

                return 1;

            }


            /*
            B sem número.
            */

            if (
                Number.isNaN(numeroB)
            ) {

                return -1;

            }


            return numeroA - numeroB;

        }
    );


    /*
    Limpar tabela somente depois
    de ordenar os alunos.
    */

    lista.innerHTML = "";


    /*
    Criar linhas.
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
// CRIAR LINHA
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


const numeroAluno =
    aluno.numero ||
    numero;


const nomeAluno =
    aluno.nome ||
    "Aluno sem nome";


const idade =
    aluno.idade ||
    "—";


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


lista.appendChild(tr);

}

// =====================================================
// BUSCAR FINANCEIRO
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
            aluno.numero || "",

        nome:
            aluno.nome || "",

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
        "Erro ao buscar financeiro:",
        error
    );


    return {

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

}

// =====================================================
// BOTÃO PAGAMENTO
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

if (!financeiroAutorizado) {

    alert(
        "🔒 Área Financeira bloqueada."
    );

    return;

}


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


    console.log(
        `Pagamento ${trimestre}º trimestre atualizado:`,
        !estadoAtual
    );


    /*
    Recarregar mantendo
    a mesma turma.
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

if (!financeiroAutorizado) {

    alert(
        "🔒 Área Financeira bloqueada."
    );

    return;

}


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

// =====================================================
// ABRIR PAINEL DE ALTERAR SENHA
// =====================================================

if (alterarSenhaBtn) {

alterarSenhaBtn.addEventListener(
    "click",
    function () {

        if (!financeiroAutorizado) {

            alert(
                "🔒 Área Financeira bloqueada."
            );

            return;

        }


        painelSenha.style.display =
            "block";


        senhaAtual.value =
            "";

        novaSenha.value =
            "";

        confirmarSenha.value =
            "";


        senhaAtual.focus();

    }
);

}

// =====================================================
// CANCELAR ALTERAÇÃO
// =====================================================

if (cancelarSenhaBtn) {

cancelarSenhaBtn.addEventListener(
    "click",
    function () {

        painelSenha.style.display =
            "none";

    }
);

}

// =====================================================
// GUARDAR NOVA SENHA
// =====================================================

if (guardarSenhaBtn) {

guardarSenhaBtn.addEventListener(
    "click",
    async function () {

        if (!financeiroAutorizado) {

            alert(
                "🔒 Área Financeira bloqueada."
            );

            return;

        }


        const atual =
            senhaAtual.value.trim();


        const nova =
            novaSenha.value.trim();


        const confirmacao =
            confirmarSenha.value.trim();


        if (
            !atual ||
            !nova ||
            !confirmacao
        ) {

            alert(
                "Preencha todos os campos."
            );

            return;

        }


        if (nova.length < 6) {

            alert(
                "A nova senha deve ter pelo menos 6 caracteres."
            );

            return;

        }


        if (
            nova !==
            confirmacao
        ) {

            alert(
                "A confirmação da nova senha não coincide."
            );

            return;

        }


        try {

            const senhaCorreta =
                await obterSenhaFinanceira();


            if (
                atual !==
                senhaCorreta
            ) {

                alert(
                    "❌ A senha atual está incorreta."
                );

                return;

            }


            const ref =
                doc(
                    db,
                    "config",
                    "financeiro"
                );


            await setDoc(

                ref,

                {

                    senha:
                        nova,

                    atualizadoEm:
                        new Date()

                },

                {
                    merge:true
                }

            );


            alert(
                "✅ Senha alterada com sucesso."
            );


            /*
            Limpar campos.
            */

            senhaAtual.value =
                "";

            novaSenha.value =
                "";

            confirmarSenha.value =
                "";


            painelSenha.style.display =
                "none";

        }
        catch (error) {

            console.error(
                "Erro ao alterar senha:",
                error
            );


            alert(
                "Erro ao alterar senha:\n\n" +
                error.message
            );

        }

    }
);

}

// ===================================================== // EVENTO — MUDAR TURMA // =====================================================
turmaSelect.addEventListener( "change", function () {
carregarAlunos(
        this.value
    );

}
);
// ===================================================== // INICIAR // =====================================================
iniciarAreaFinanceira();
