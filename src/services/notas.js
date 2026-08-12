// =====================================================
// NOTAS.JS — ADMINISTRADOR
// SGE
// BLOCO 1 — BASE DO PAINEL
// =====================================================

alert("🔥 BLOCO 1 — NOTAS.JS CARREGADO!");


import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// =====================================================
// ELEMENTOS
// =====================================================

const estadoSistema =
    document.getElementById(
        "estadoSistema"
    );

const ultimaAlteracao =
    document.getElementById(
        "ultimaAlteracao"
    );

const btnAbrir =
    document.getElementById(
        "btnAbrir"
    );

const btnFechar =
    document.getElementById(
        "btnFechar"
    );

const filtroProfessor =
    document.getElementById(
        "filtroProfessor"
    );

const filtroClasse =
    document.getElementById(
        "filtroClasse"
    );

const filtroTurma =
    document.getElementById(
        "filtroTurma"
    );

const filtroTrimestre =
    document.getElementById(
        "filtroTrimestre"
    );

const notasLista =
    document.getElementById(
        "notasLista"
    );


// =====================================================
// DADOS
// =====================================================

let professores = [];

let turmas = [];


// =====================================================
// VERIFICAR ELEMENTOS
// =====================================================

console.log(
    "ELEMENTOS DO PAINEL:",
    {
        estadoSistema,
        ultimaAlteracao,
        btnAbrir,
        btnFechar,
        filtroProfessor,
        filtroClasse,
        filtroTurma,
        filtroTrimestre,
        notasLista
    }
);


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


    console.log(
        "👨‍🏫 Professores encontrados:",
        professores.length
    );

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


    console.log(
        "🏫 Turmas encontradas:",
        turmas.length
    );

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
// ESTADO INICIAL DOS BOTÕES
// =====================================================

function prepararControle() {

    if (estadoSistema) {

        estadoSistema.textContent =
            "🔒 Sistema fechado";

        estadoSistema.className =
            "fechado";

    }


    if (ultimaAlteracao) {

        ultimaAlteracao.textContent =
            "Ainda não configurado";

    }


    if (btnAbrir) {

        btnAbrir.disabled =
            false;

    }


    if (btnFechar) {

        btnFechar.disabled =
            false;

    }

}


// =====================================================
// TABELA INICIAL
// =====================================================

function prepararTabela() {

    if (!notasLista) {

        return;

    }


    notasLista.innerHTML = `

        <tr>

            <td
                colspan="7"
                class="vazio"
            >

                📋 Nenhuma Mini-Pauta
                carregada ainda.

            </td>

        </tr>

    `;

}


// =====================================================
// INICIALIZAÇÃO
// =====================================================

async function iniciarNotas() {

    try {

        console.log(
            "🔵 INICIANDO PAINEL NOTAS..."
        );


        prepararControle();

        prepararTabela();


        await carregarProfessores();

        await carregarTurmas();


        preencherProfessores();

        preencherClasses();

        preencherTurmas();


        console.log(
            "✅ BLOCO 1 TERMINADO"
        );


        alert(
            "✅ BLOCO 1 FUNCIONOU!\n\n" +

            "Professores encontrados: " +
            professores.length +

            "\n\n" +

            "Turmas encontradas: " +
            turmas.length
        );

    }
    catch (erro) {

        console.error(
            "❌ ERRO NO BLOCO 1:",
            erro
        );


        alert(
            "❌ ERRO NO BLOCO 1!\n\n" +
            erro.message
        );

    }

}


// =====================================================
// INICIAR
// =====================================================

iniciarNotas();
