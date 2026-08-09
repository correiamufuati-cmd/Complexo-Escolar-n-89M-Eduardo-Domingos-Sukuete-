alert("DISCIPLINAS.JS CARREGADO ✅");

import { app } from "./firebase.js";

import {
getFirestore,
doc,
getDoc,
setDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const db = getFirestore(app);

// =====================================================
// ELEMENTOS
// =====================================================

const ensinoInput =
document.getElementById("ensino");

const classeInput =
document.getElementById("classe");

const disciplinaInput =
document.getElementById("disciplina");

const btnAdicionar =
document.getElementById("btnAdicionar");

const listaDisciplinas =
document.getElementById("listaDisciplinas");

// =====================================================
// CLASSES
// =====================================================

const classesPorEnsino = {

ensinoPrimario: [

    "1classe",
    "2classe",
    "3classe",
    "4classe",
    "5classe",
    "6classe",
    "1etapa",
    "2etapa",
    "3etapa"

],

primeiroCiclo: [

    "7classe",
    "8classe",
    "9classe",
    "Eja1",
    "Eja2"

]

};

// =====================================================
// ATUALIZAR CLASSES
// =====================================================

function atualizarClasses() {

const ensino =
    ensinoInput.value;


classeInput.innerHTML = "";


const lista =
    classesPorEnsino[ensino] || [];


lista.forEach(
    classe => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            classe;


        option.textContent =
            classe;


        classeInput.appendChild(
            option
        );

    }
);


carregarDisciplinas();

}

// =====================================================
// LER CONFIGURAÇÃO
// =====================================================

async function lerConfiguracao() {

const referencia =
    doc(
        db,
        "config",
        "disciplinas"
    );


const resultado =
    await getDoc(
        referencia
    );


if (!resultado.exists()) {

    return {

        ensinoPrimario: {},

        primeiroCiclo: {}

    };

}


return resultado.data();

}

// =====================================================
// GUARDAR CONFIGURAÇÃO
// =====================================================

async function guardarConfiguracao(
dados
) {

const referencia =
    doc(
        db,
        "config",
        "disciplinas"
    );


await setDoc(
    referencia,
    dados
);

}

// =====================================================
// GARANTIR ESTRUTURA DA CLASSE
// =====================================================

function garantirClasse(
dados,
ensino,
classe
) {

if (!dados[ensino]) {

    dados[ensino] = {};

}


if (!dados[ensino][classe]) {

    dados[ensino][classe] = {

        disciplinas: []

    };

}


if (
    !Array.isArray(
        dados[ensino][classe]
            .disciplinas
    )
) {

    dados[ensino][classe]
        .disciplinas = [];

}

}

// =====================================================
// ADICIONAR DISCIPLINA
// =====================================================

btnAdicionar.addEventListener(
"click",
async () => {

    const ensino =
        ensinoInput.value;


    const classe =
        classeInput.value;


    const disciplina =
        disciplinaInput.value
            .trim();


    if (!ensino) {

        alert(
            "Selecione o ensino."
        );

        return;

    }


    if (!classe) {

        alert(
            "Selecione a classe."
        );

        return;

    }


    if (!disciplina) {

        alert(
            "Digite o nome da disciplina."
        );

        disciplinaInput.focus();

        return;

    }


    try {

        btnAdicionar.disabled =
            true;


        btnAdicionar.textContent =
            "A guardar...";


        const dados =
            await lerConfiguracao();


        garantirClasse(
            dados,
            ensino,
            classe
        );


        const disciplinas =
            dados[ensino][classe]
                .disciplinas;


        // =========================================
        // VERIFICAR DUPLICADO
        // =========================================

        const existe =
            disciplinas.some(
                item =>
                    String(item)
                        .trim()
                        .toLowerCase()
                    ===
                    disciplina
                        .trim()
                        .toLowerCase()
            );


        if (existe) {

            alert(
                "Esta disciplina já existe nesta classe."
            );

            return;

        }


        // =========================================
        // ADICIONAR
        // =========================================

        disciplinas.push(
            disciplina
        );


        await guardarConfiguracao(
            dados
        );


        alert(
            "✅ Disciplina adicionada!"
        );


        disciplinaInput.value =
            "";


        await carregarDisciplinas();

    }

    catch (error) {

        console.error(
            "Erro ao adicionar:",
            error
        );


        alert(
            "❌ Erro ao guardar disciplina:\n\n" +
            error.message
        );

    }

    finally {

        btnAdicionar.disabled =
            false;


        btnAdicionar.textContent =
            "➕ Adicionar Disciplina";

    }

}

);

// =====================================================
// CARREGAR DISCIPLINAS
// =====================================================

async function carregarDisciplinas() {

try {

    listaDisciplinas.innerHTML = `

        <tr>

            <td
                colspan="4"
                style="
                    text-align:center;
                    padding:25px;
                "
            >

                ⏳ A carregar...

            </td>

        </tr>

    `;


    const dados =
        await lerConfiguracao();


    const ensinoSelecionado =
        ensinoInput.value;


    const classeSelecionada =
        classeInput.value;


    const mapaEnsino =
        dados[
            ensinoSelecionado
        ] || {};


    const dadosClasse =
        mapaEnsino[
            classeSelecionada
        ] || {};


    const disciplinas =
        Array.isArray(
            dadosClasse.disciplinas
        )
        ?
        dadosClasse.disciplinas
        :
        [];


    // =========================================
    // NENHUMA
    // =========================================

    if (
        disciplinas.length === 0
    ) {

        listaDisciplinas.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    style="
                        text-align:center;
                        padding:25px;
                        color:#64748b;
                    "
                >

                    📚 Nenhuma disciplina
                    cadastrada para esta classe.

                </td>

            </tr>

        `;

        return;

    }


    // =========================================
    // TABELA
    // =========================================

    listaDisciplinas.innerHTML =
        "";


    disciplinas.forEach(
        (disciplina, index) => {

            listaDisciplinas.innerHTML += `

                <tr>

                    <td>

                        ${
                            ensinoSelecionado
                            ===
                            "ensinoPrimario"

                            ?
                            "Ensino Primário"

                            :
                            "Primeiro Ciclo"
                        }

                    </td>


                    <td>

                        ${classeSelecionada}

                    </td>


                    <td
                        style="
                            font-weight:bold;
                        "
                    >

                        ${disciplina}

                    </td>


                    <td>

                        <button
                            class="btn-editar"
                            data-index="${index}"
                        >

                            ✏️

                        </button>


                        <button
                            class="btn-apagar"
                            data-index="${index}"
                        >

                            🗑️

                        </button>

                    </td>

                </tr>

            `;

        }
    );


    // =========================================
    // BOTÃO APAGAR
    // =========================================

    document
        .querySelectorAll(
            ".btn-apagar"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        apagarDisciplina(
                            Number(
                                botao.dataset.index
                            )
                        );

                    }
                );

            }
        );


    // =========================================
    // BOTÃO EDITAR
    // =========================================

    document
        .querySelectorAll(
            ".btn-editar"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    () => {

                        editarDisciplina(
                            Number(
                                botao.dataset.index
                            )
                        );

                    }
                );

            }
        );

}

catch (error) {

    console.error(
        "Erro ao carregar:",
        error
    );


    listaDisciplinas.innerHTML = `

        <tr>

            <td
                colspan="4"
                style="
                    text-align:center;
                    color:#dc2626;
                    padding:20px;
                "
            >

                ❌ Erro ao carregar disciplinas.

                <br><br>

                ${error.message}

            </td>

        </tr>

    `;

}

}

// =====================================================
// APAGAR DISCIPLINA
// =====================================================

async function apagarDisciplina(
index
) {

const ensino =
    ensinoInput.value;


const classe =
    classeInput.value;


try {

    const dados =
        await lerConfiguracao();


    garantirClasse(
        dados,
        ensino,
        classe
    );


    const disciplinas =
        dados[ensino][classe]
            .disciplinas;


    const disciplina =
        disciplinas[index];


    const confirmar =
        confirm(

            "Deseja apagar esta disciplina?\n\n" +
            disciplina

        );


    if (!confirmar) {

        return;

    }


    disciplinas.splice(
        index,
        1
    );


    await guardarConfiguracao(
        dados
    );


    alert(
        "✅ Disciplina apagada!"
    );


    await carregarDisciplinas();

}

catch (error) {

    console.error(
        error
    );


    alert(
        "❌ Erro ao apagar disciplina:\n\n" +
        error.message
    );

}

}

// =====================================================
// EDITAR DISCIPLINA
// =====================================================

async function editarDisciplina(
index
) {

const ensino =
    ensinoInput.value;


const classe =
    classeInput.value;


try {

    const dados =
        await lerConfiguracao();


    garantirClasse(
        dados,
        ensino,
        classe
    );


    const disciplinas =
        dados[ensino][classe]
            .disciplinas;


    const atual =
        disciplinas[index];


    const novoNome =
        prompt(
            "Novo nome da disciplina:",
            atual
        );


    if (
        novoNome === null
    ) {

        return;

    }


    const novo =
        novoNome.trim();


    if (!novo) {

        alert(
            "O nome não pode ficar vazio."
        );

        return;

    }


    disciplinas[index] =
        novo;


    await guardarConfiguracao(
        dados
    );


    alert(
        "✅ Disciplina atualizada!"
    );


    await carregarDisciplinas();

}

catch (error) {

    console.error(
        error
    );


    alert(
        "❌ Erro ao editar disciplina:\n\n" +
        error.message
    );

}

}

// =====================================================
// ALTERAR ENSINO
// =====================================================

ensinoInput.addEventListener(
"change",
atualizarClasses
);

// =====================================================
// ALTERAR CLASSE
// =====================================================

classeInput.addEventListener(
"change",
carregarDisciplinas
);

// =====================================================
// INICIAR
// =====================================================

atualizarClasses();
