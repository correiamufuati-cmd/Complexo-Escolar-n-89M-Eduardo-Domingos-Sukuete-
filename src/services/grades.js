// =====================================================
// NOTAS.JS — PAINEL DO ADMINISTRADOR
// SGE
// BLOCO 1/4 — BASE + PROFESSORES + TURMAS + FILTROS
// =====================================================

alert("✅ NOTAS.JS — BLOCO 1 CARREGADO!");


// =====================================================
// FIREBASE
// =====================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// =====================================================
// ELEMENTOS DA PÁGINA
// =====================================================

const tabela =
    document.getElementById("notasLista");

const filtroProfessor =
    document.getElementById("filtroProfessor");

const filtroClasse =
    document.getElementById("filtroClasse");

const filtroTurma =
    document.getElementById("filtroTurma");

const filtroTrimestre =
    document.getElementById("filtroTrimestre");


// =====================================================
// DADOS
// =====================================================

let professores = [];

let turmas = [];


// =====================================================
// VERIFICAR ELEMENTOS
// =====================================================

if (!tabela) {

    console.error(
        "❌ Elemento #notasLista não encontrado."
    );

}

if (!filtroProfessor) {

    console.error(
        "❌ Elemento #filtroProfessor não encontrado."
    );

}

if (!filtroClasse) {

    console.error(
        "❌ Elemento #filtroClasse não encontrado."
    );

}

if (!filtroTurma) {

    console.error(
        "❌ Elemento #filtroTurma não encontrado."
    );

}

if (!filtroTrimestre) {

    console.error(
        "❌ Elemento #filtroTrimestre não encontrado."
    );

}


// =====================================================
// CARREGAR PROFESSORES
// =====================================================

async function carregarProfessores() {

    professores = [];


    const resultado =
        await getDocs(
            collection(
                db,
                "professores"
            )
        );


    resultado.forEach(
        documento => {

            professores.push({

                id:
                    documento.id,

                ...documento.data()

            });

        }
    );


    professores.sort(
        (a, b) => {

            return String(
                a.nome || ""
            ).localeCompare(
                String(
                    b.nome || ""
                ),
                "pt"
            );

        }
    );


    console.log(
        "👨‍🏫 PROFESSORES:",
        professores
    );


    return professores;

}


// =====================================================
// CARREGAR TURMAS
// =====================================================

async function carregarTurmas() {

    turmas = [];


    const resultado =
        await getDocs(
            collection(
                db,
                "turmas"
            )
        );


    resultado.forEach(
        documento => {

            turmas.push({

                id:
                    documento.id,

                ...documento.data()

            });

        }
    );


    turmas.sort(
        (a, b) => {

            const classeA =
                String(
                    a.classe || ""
                );

            const classeB =
                String(
                    b.classe || ""
                );


            if (
                classeA !==
                classeB
            ) {

                return classeA.localeCompare(
                    classeB,
                    "pt",
                    {
                        numeric:true
                    }
                );

            }


            return String(
                a.nome || ""
            ).localeCompare(
                String(
                    b.nome || ""
                ),
                "pt"
            );

        }
    );


    console.log(
        "🏫 TURMAS:",
        turmas
    );


    return turmas;

}


// =====================================================
// PREENCHER PROFESSORES
// =====================================================

function preencherProfessores() {

    if (!filtroProfessor) {

        return;

    }


    filtroProfessor.innerHTML = `

        <option value="">
            Todos os professores
        </option>

    `;


    professores.forEach(
        professor => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                professor.id;


            option.textContent =
                professor.nome ||
                "Professor";


            filtroProfessor.appendChild(
                option
            );

        }
    );

}


// =====================================================
// PREENCHER CLASSES
// =====================================================

function preencherClasses() {

    if (!filtroClasse) {

        return;

    }


    const classes =
        [
            ...new Set(

                turmas
                    .map(
                        turma =>
                            turma.classe
                    )
                    .filter(Boolean)

            )
        ];


    filtroClasse.innerHTML = `

        <option value="">
            Todas as classes
        </option>

    `;


    classes.forEach(
        classe => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                classe;


            option.textContent =
                classe;


            filtroClasse.appendChild(
                option
            );

        }
    );

}


// =====================================================
// PREENCHER TURMAS
// =====================================================

function preencherTurmas() {

    if (!filtroTurma) {

        return;

    }


    filtroTurma.innerHTML = `

        <option value="">
            Todas as turmas
        </option>

    `;


    turmas.forEach(
        turma => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                turma.id;


            option.textContent =
                turma.nome ||
                "Turma";


            filtroTurma.appendChild(
                option
            );

        }
    );

}


// =====================================================
// PREENCHER TRIMESTRES
// =====================================================

function preencherTrimestres() {

    if (!filtroTrimestre) {

        return;

    }


    filtroTrimestre.innerHTML = `

        <option value="">
            Todos os trimestres
        </option>

        <option value="1">
            1.º Trimestre
        </option>

        <option value="2">
            2.º Trimestre
        </option>

        <option value="3">
            3.º Trimestre
        </option>

    `;

}


// =====================================================
// MOSTRAR MENSAGEM INICIAL
// =====================================================

function mostrarEstadoInicial() {

    if (!tabela) {

        return;

    }


    tabela.innerHTML = `

        <tr>

            <td
                colspan="9"
                style="
                    text-align:center;
                    padding:25px;
                    color:#64748b;
                "
            >

                📋 Selecione os filtros
                para consultar os lançamentos.

            </td>

        </tr>

    `;

}


// =====================================================
// EVENTOS DOS FILTROS
// =====================================================

filtroProfessor?.addEventListener(
    "change",
    function() {

        console.log(
            "Professor:",
            this.value
        );

    }
);


filtroClasse?.addEventListener(
    "change",
    function() {

        console.log(
            "Classe:",
            this.value
        );

    }
);


filtroTurma?.addEventListener(
    "change",
    function() {

        console.log(
            "Turma:",
            this.value
        );

    }
);


filtroTrimestre?.addEventListener(
    "change",
    function() {

        console.log(
            "Trimestre:",
            this.value
        );

    }
);


// =====================================================
// INICIAR
// =====================================================

async function iniciarNotas() {

    try {

        console.log(
            "🔵 INICIANDO PAINEL DE NOTAS..."
        );


        await carregarProfessores();

        await carregarTurmas();


        preencherProfessores();

        preencherClasses();

        preencherTurmas();

        preencherTrimestres();


        mostrarEstadoInicial();


        alert(
            "✅ BLOCO 1 FUNCIONOU!\n\n" +

            "Professores: " +
            professores.length +

            "\nTurmas: " +
            turmas.length
        );


        console.log(
            "✅ BLOCO 1 FINALIZADO."
        );

    }
    catch (erro) {

        console.error(
            "❌ ERRO NO BLOCO 1:",
            erro
        );


        if (tabela) {

            tabela.innerHTML = `

                <tr>

                    <td
                        colspan="9"
                        style="
                            text-align:center;
                            padding:25px;
                            color:#b91c1c;
                        "
                    >

                        ❌ Erro ao carregar
                        o painel de notas.

                    </td>

                </tr>

            `;

        }


        alert(
            "❌ ERRO AO CARREGAR NOTAS!\n\n" +
            erro.message
        );

    }

}


// =====================================================
// EXECUTAR
// =====================================================

iniciarNotas();
