import { app } from "./firebase.js";

import {
getAuth,
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

import {
getFirestore,
collection,
getDocs,
doc,
getDoc,
setDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

// =====================================================
// ELEMENTOS
// =====================================================

const selectEnsino =
document.getElementById("selectEnsino");

const selectTurma =
document.getElementById("selectTurma");

const listaFinanceira =
document.getElementById("listaFinanceira");

const estado =
document.getElementById("estado");

const logoutBtn =
document.getElementById("logoutBtn");

// =====================================================
// DADOS
// =====================================================

let turmas = [];

let alunos = [];

// =====================================================
// TRIMESTRES
// =====================================================

const trimestres = [
"1trimestre",
"2trimestre",
"3trimestre"
];

// =====================================================
// PROFESSOR / ADMINISTRADOR AUTENTICADO
// =====================================================

onAuthStateChanged(
auth,
async (user) => {

    if (!user) {

        window.location.href =
            "login.html";

        return;

    }


    await carregarTurmas();

}

);

// =====================================================
// CARREGAR TURMAS
// =====================================================

async function carregarTurmas() {

try {

    selectTurma.innerHTML = `
        <option value="">
            Selecione a turma
        </option>
    `;


    turmas = [];


    const resultado =
        await getDocs(
            collection(
                db,
                "turmas"
            )
        );


    resultado.forEach(
        item => {

            const turma = {

                id: item.id,

                ...item.data()

            };


            turmas.push(turma);

        }
    );


    filtrarTurmas();


}

catch (error) {

    console.error(
        "Erro ao carregar turmas:",
        error
    );


    estado.textContent =
        "Erro ao carregar turmas.";

}

}

// =====================================================
// FILTRAR TURMAS POR ENSINO
// =====================================================

function filtrarTurmas() {

const ensino =
    selectEnsino.value;


selectTurma.innerHTML = `
    <option value="">
        Selecione a turma
    </option>
`;


if (!ensino) {

    listaFinanceira.innerHTML = `
        <tr>
            <td
                colspan="10"
                class="sem-alunos"
            >
                Selecione o ensino e a turma.
            </td>
        </tr>
    `;

    return;

}


const filtradas =
    turmas.filter(
        turma =>
            turma.ensino === ensino
    );


if (filtradas.length === 0) {

    selectTurma.innerHTML = `
        <option value="">
            Nenhuma turma encontrada
        </option>
    `;

    return;

}


filtradas.forEach(
    turma => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            turma.id;


        option.textContent =
            `${turma.nome || ""} - ${turma.classe || ""}`;


        selectTurma.appendChild(
            option
        );

    }
);

}

// =====================================================
// ALTERAR ENSINO
// =====================================================

selectEnsino.addEventListener(
"change",
() => {

    filtrarTurmas();

}

);

// =====================================================
// ALTERAR TURMA
// =====================================================

selectTurma.addEventListener(
"change",
async () => {

    const turmaId =
        selectTurma.value;


    if (!turmaId) {

        listaFinanceira.innerHTML = `
            <tr>
                <td
                    colspan="10"
                    class="sem-alunos"
                >
                    Selecione uma turma.
                </td>
            </tr>
        `;

        estado.textContent =
            "Selecione uma turma para visualizar os alunos.";

        return;

    }


    await carregarAlunos(
        turmaId
    );

}

);

// =====================================================
// CARREGAR ALUNOS
// =====================================================

async function carregarAlunos(
turmaId
) {

try {

    estado.textContent =
        "A carregar alunos...";


    listaFinanceira.innerHTML = `
        <tr>
            <td
                colspan="10"
                class="sem-alunos"
            >
                A carregar...
            </td>
        </tr>
    `;


    alunos = [];


    const alunosRef =
        collection(
            db,
            "turmas",
            turmaId,
            "alunos"
        );


    const resultado =
        await getDocs(
            alunosRef
        );


    resultado.forEach(
        item => {

            alunos.push({

                id: item.id,

                ...item.data()

            });

        }
    );


    alunos.sort(
        (a, b) =>
            Number(a.numero || 0) -
            Number(b.numero || 0)
    );


    if (alunos.length === 0) {

        estado.textContent =
            "Esta turma não possui alunos.";

        listaFinanceira.innerHTML = `
            <tr>
                <td
                    colspan="10"
                    class="sem-alunos"
                >
                    Nenhum aluno encontrado.
                </td>
            </tr>
        `;

        return;

    }


    estado.textContent =
        `${alunos.length} aluno(s) encontrado(s).`;


    await montarTabela(
        turmaId
    );


}

catch (error) {

    console.error(
        "Erro ao carregar alunos:",
        error
    );


    estado.textContent =
        "Erro ao carregar alunos.";


    listaFinanceira.innerHTML = `
        <tr>
            <td
                colspan="10"
                class="sem-alunos"
            >
                ${error.message}
            </td>
        </tr>
    `;

}

}

// =====================================================
// MONTAR TABELA
// =====================================================

async function montarTabela(
turmaId
) {

listaFinanceira.innerHTML = "";


for (
    const aluno of alunos
) {

    const financeiro =
        await carregarFinanceiro(
            turmaId,
            aluno.id
        );


    const tr =
        document.createElement(
            "tr"
        );


    tr.innerHTML = `

        <td>
            ${aluno.numero || "—"}
        </td>

        <td class="nome">
            ${aluno.nome || "—"}
        </td>

        <td>
            ${aluno.sexo || "—"}
        </td>

        <td>
            ${calcularIdade(aluno)}
        </td>


        ${criarCelulaTrimestre(
            turmaId,
            aluno,
            financeiro,
            "1trimestre"
        )}

        ${criarCelulaTrimestre(
            turmaId,
            aluno,
            financeiro,
            "2trimestre"
        )}

        ${criarCelulaTrimestre(
            turmaId,
            aluno,
            financeiro,
            "3trimestre"
        )}

    `;


    listaFinanceira.appendChild(
        tr
    );

}

}

// =====================================================
// CARREGAR DADOS FINANCEIROS
// =====================================================

async function carregarFinanceiro(
turmaId,
alunoId
) {

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
    await getDoc(
        referencia
    );


if (
    resultado.exists()
) {

    return resultado.data();

}


return {

    "1trimestre": {

        pago: false,

        comunicado: ""

    },

    "2trimestre": {

        pago: false,

        comunicado: ""

    },

    "3trimestre": {

        pago: false,

        comunicado: ""

    }

};

}

// =====================================================
// CRIAR CÉLULAS DOS TRIMESTRES
// =====================================================

function criarCelulaTrimestre(
turmaId,
aluno,
financeiro,
trimestre
) {

const dados =
    financeiro[trimestre] || {

        pago: false,

        comunicado: ""

    };


const estadoPagamento =
    dados.pago === true;


return `

    <td>

        <div class="pagamento">

            <button
                class="btn-pagamento ${
                    estadoPagamento
                        ? "ativo"
                        : ""
                }"
                title="Marcar como pago"
                onclick="
                    alterarPagamento(
                        '${turmaId}',
                        '${aluno.id}',
                        '${trimestre}',
                        true
                    )
                "
            >
                ✅
            </button>


            <button
                class="btn-pagamento ${
                    !estadoPagamento
                        ? "ativo"
                        : ""
                }"
                title="Marcar como não pago"
                onclick="
                    alterarPagamento(
                        '${turmaId}',
                        '${aluno.id}',
                        '${trimestre}',
                        false
                    )
                "
            >
                ❌
            </button>

        </div>

    </td>


    <td>

        <textarea
            class="comunicado"
            placeholder="Comunicado..."
            onchange="
                alterarComunicado(
                    '${turmaId}',
                    '${aluno.id}',
                    '${trimestre}',
                    this.value
                )
            "
        >${dados.comunicado || ""}</textarea>

    </td>

`;

}

// =====================================================
// ALTERAR PAGAMENTO
// =====================================================

window.alterarPagamento =
async function (
turmaId,
alunoId,
trimestre,
pago
) {

    try {

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


        const atual =
            await getDoc(
                referencia
            );


        let dados =
            atual.exists()
                ? atual.data()
                : {};


        if (!dados[trimestre]) {

            dados[trimestre] = {};

        }


        dados[trimestre].pago =
            pago;


        if (
            typeof dados[trimestre]
                .comunicado !==
            "string"
        ) {

            dados[trimestre].comunicado =
                "";

        }


        dados.atualizadoEm =
            serverTimestamp();


        await setDoc(
            referencia,
            dados,
            {
                merge: true
            }
        );


        await montarTabela(
            turmaId
        );


    }

    catch (error) {

        console.error(
            "Erro ao alterar pagamento:",
            error
        );


        alert(
            "Não foi possível atualizar o pagamento."
        );

    }

};

// =====================================================
// ALTERAR COMUNICADO
// =====================================================

window.alterarComunicado =
async function (
turmaId,
alunoId,
trimestre,
comunicado
) {

    try {

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


        const atual =
            await getDoc(
                referencia
            );


        let dados =
            atual.exists()
                ? atual.data()
                : {};


        if (!dados[trimestre]) {

            dados[trimestre] = {};

        }


        dados[trimestre].comunicado =
            comunicado;


        if (
            typeof dados[trimestre]
                .pago !==
            "boolean"
        ) {

            dados[trimestre].pago =
                false;

        }


        dados.atualizadoEm =
            serverTimestamp();


        await setDoc(
            referencia,
            dados,
            {
                merge: true
            }
        );

    }

    catch (error) {

        console.error(
            "Erro ao guardar comunicado:",
            error
        );


        alert(
            "Não foi possível guardar o comunicado."
        );

    }

};

// =====================================================
// CALCULAR IDADE
// =====================================================

function calcularIdade(
aluno
) {

if (
    aluno.idade !== undefined &&
    aluno.idade !== null &&
    aluno.idade !== ""
) {

    return aluno.idade;

}


if (
    aluno.dataNascimento
) {

    const nascimento =
        converterData(
            aluno.dataNascimento
        );


    if (
        nascimento
    ) {

        const hoje =
            new Date();


        let idade =
            hoje.getFullYear() -
            nascimento.getFullYear();


        const mes =
            hoje.getMonth() -
            nascimento.getMonth();


        if (
            mes < 0 ||
            (
                mes === 0 &&
                hoje.getDate() <
                nascimento.getDate()
            )
        ) {

            idade--;

        }


        return idade;

    }

}


return "—";

}

// =====================================================
// CONVERTER DATA
// =====================================================

function converterData(
valor
) {

if (
    valor instanceof Date
) {

    return valor;

}


if (
    typeof valor ===
    "string"
) {

    let data;


    if (
        /^\d{2}\/\d{2}\/\d{4}$/
            .test(valor)
    ) {

        const partes =
            valor.split("/");


        data =
            new Date(
                Number(partes[2]),
                Number(partes[1]) - 1,
                Number(partes[0])
            );

    }
    else {

        data =
            new Date(valor);

    }


    if (
        !isNaN(
            data.getTime()
        )
    ) {

        return data;

    }

}


if (
    valor &&
    typeof valor.toDate ===
    "function"
) {

    return valor.toDate();

}


return null;

}

// =====================================================
// SAIR
// =====================================================

logoutBtn.addEventListener(
"click",
async () => {

    await signOut(auth);

    window.location.href =
        "login.html";

}

);
