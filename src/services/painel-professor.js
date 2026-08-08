alert("PAINEL PROFESSORES ATUALIZADO ✅");

import { db } from "./firebase.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// =====================================================
// PROFESSOR LOGADO
// =====================================================

let professor =
    JSON.parse(
        localStorage.getItem("professorLogado")
    );


if (!professor) {

    window.location.href =
        "login-professor.html";

    throw new Error(
        "Professor não autenticado."
    );

}


// =====================================================
// ELEMENTOS
// =====================================================

const nomeProfessor =
    document.getElementById(
        "nomeProfessor"
    );

const selectTurma =
    document.getElementById(
        "selectTurma"
    );

const selectDisciplina =
    document.getElementById(
        "selectDisciplina"
    );

const selectTrimestre =
    document.getElementById(
        "selectTrimestre"
    );

const abrirMiniPauta =
    document.getElementById(
        "abrirMiniPauta"
    );


// =====================================================
// VERIFICAR ELEMENTOS
// =====================================================

if (!selectTurma) {

    alert(
        "Erro: campo selectTurma não encontrado."
    );

    throw new Error(
        "selectTurma inexistente."
    );

}


if (!selectDisciplina) {

    alert(
        "Erro: campo selectDisciplina não encontrado."
    );

    throw new Error(
        "selectDisciplina inexistente."
    );

}


if (!selectTrimestre) {

    alert(
        "Erro: campo selectTrimestre não encontrado."
    );

    throw new Error(
        "selectTrimestre inexistente."
    );

}


// =====================================================
// CARREGAR PROFESSOR ATUAL DO FIRESTORE
// =====================================================

async function carregarProfessorAtual() {

    try {

        /*
        Se o login guardou o ID do professor,
        vamos buscar os dados atuais no Firebase.
        */

        if (professor.id) {

            const professorRef =
                doc(
                    db,
                    "professores",
                    professor.id
                );


            const professorSnap =
                await getDoc(
                    professorRef
                );


            if (
                professorSnap.exists()
            ) {

                professor = {

                    id:
                        professorSnap.id,

                    ...professorSnap.data()

                };


                /*
                Atualizar sessão local
                */

                localStorage.setItem(

                    "professorLogado",

                    JSON.stringify(
                        professor
                    )

                );

            }

        }


        console.log(
            "PROFESSOR ATUAL:",
            professor
        );


    }

    catch (erro) {

        console.error(
            "Erro ao carregar professor:",
            erro
        );

        alert(
            "Não foi possível atualizar os dados do professor.\n\n" +
            erro.message
        );

    }

}


// =====================================================
// NOME DO PROFESSOR
// =====================================================

function mostrarNomeProfessor() {

    if (!nomeProfessor) {

        return;

    }


    nomeProfessor.innerHTML =
        "👨‍🏫 " +
        (
            professor.nome ||
            "Professor"
        );

}


// =====================================================
// ATRIBUIÇÕES
// =====================================================

function obterAtribuicoes() {

    if (
        !Array.isArray(
            professor.atribuicoes
        )
    ) {

        return [];

    }


    return professor.atribuicoes
        .filter(
            item =>
                item &&
                item.turmaId &&
                item.turmaNome &&
                item.disciplina
        );

}


// =====================================================
// CARREGAR TURMAS
// =====================================================

function carregarTurmas() {

    const atribuicoes =
        obterAtribuicoes();


    selectTurma.innerHTML = `

        <option value="">
            Selecione a turma
        </option>

    `;


    const mapaTurmas =
        new Map();


    atribuicoes.forEach(
        item => {

            /*
            Usamos turmaId como chave.

            Assim duas turmas com nomes iguais
            não ficam misturadas.
            */

            if (
                !mapaTurmas.has(
                    item.turmaId
                )
            ) {

                mapaTurmas.set(

                    item.turmaId,

                    {

                        id:
                            item.turmaId,

                        nome:
                            item.turmaNome,

                        classe:
                            item.classe || ""

                    }

                );

            }

        }
    );


    mapaTurmas.forEach(
        turma => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                turma.id;


            option.textContent =
                turma.nome +
                (
                    turma.classe
                    ?
                    " - " + turma.classe
                    :
                    ""
                );


            selectTurma.appendChild(
                option
            );

        }
    );


    /*
    Limpar disciplinas
    */

    selectDisciplina.innerHTML = `

        <option value="">
            Selecione primeiro a turma
        </option>

    `;

}


// =====================================================
// CARREGAR DISCIPLINAS
// =====================================================

function carregarDisciplinas() {

    const turmaId =
        selectTurma.value;


    selectDisciplina.innerHTML = `

        <option value="">
            Selecione a disciplina
        </option>

    `;


    if (!turmaId) {

        selectDisciplina.innerHTML = `

            <option value="">
                Selecione primeiro a turma
            </option>

        `;

        return;

    }


    const atribuicoes =
        obterAtribuicoes();


    const disciplinas =
        [];


    atribuicoes.forEach(
        item => {

            if (
                item.turmaId ===
                turmaId
            ) {

                if (
                    !disciplinas.includes(
                        item.disciplina
                    )
                ) {

                    disciplinas.push(
                        item.disciplina
                    );

                }

            }

        }
    );


    /*
    Ordenar alfabeticamente
    */

    disciplinas.sort(
        (a,b) =>
            a.localeCompare(
                b,
                "pt"
            )
    );


    disciplinas.forEach(
        disciplina => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                disciplina;


            option.textContent =
                disciplina;


            selectDisciplina.appendChild(
                option
            );

        }
    );


    if (
        disciplinas.length === 0
    ) {

        selectDisciplina.innerHTML = `

            <option value="">
                Nenhuma disciplina atribuída
            </option>

        `;

    }

}


// =====================================================
// MUDANÇA DE TURMA
// =====================================================

selectTurma.addEventListener(
    "change",
    () => {

        carregarDisciplinas();

    }
);


// =====================================================
// ABRIR MINI-PAUTA
// =====================================================

if (abrirMiniPauta) {

    abrirMiniPauta.addEventListener(
        "click",
        () => {

            const turmaId =
                selectTurma.value;


            const disciplina =
                selectDisciplina.value;


            const trimestre =
                selectTrimestre.value;


            // -----------------------------------------
            // VALIDAR TURMA
            // -----------------------------------------

            if (!turmaId) {

                alert(
                    "Selecione a turma."
                );

                return;

            }


            // -----------------------------------------
            // VALIDAR DISCIPLINA
            // -----------------------------------------

            if (!disciplina) {

                alert(
                    "Selecione a disciplina."
                );

                return;

            }


            // -----------------------------------------
            // VALIDAR TRIMESTRE
            // -----------------------------------------

            if (!trimestre) {

                alert(
                    "Selecione o trimestre."
                );

                return;

            }


            // -----------------------------------------
            // PROCURAR ATRIBUIÇÃO
            // -----------------------------------------

            const atribuicao =
                obterAtribuicoes().find(
                    item =>

                        item.turmaId ===
                        turmaId

                        &&

                        item.disciplina ===
                        disciplina

                );


            if (!atribuicao) {

                alert(
                    "Atribuição não encontrada."
                );

                return;

            }


            // -----------------------------------------
            // GUARDAR DADOS
            // -----------------------------------------

            localStorage.setItem(
                "turmaId",
                atribuicao.turmaId
            );


            localStorage.setItem(
                "turmaNome",
                atribuicao.turmaNome
            );


            localStorage.setItem(
                "disciplina",
                atribuicao.disciplina
            );


            localStorage.setItem(
                "trimestre",
                trimestre
            );


            /*
            IMPORTANTE:

            Guardar o ensino atual do professor.
            */

            localStorage.setItem(
                "ensino",
                professor.ensino || ""
            );


            console.log(
                "DADOS PARA MINI-PAUTA:",
                {

                    turmaId:
                        atribuicao.turmaId,

                    turmaNome:
                        atribuicao.turmaNome,

                    disciplina:
                        atribuicao.disciplina,

                    trimestre:
                        trimestre,

                    ensino:
                        professor.ensino

                }
            );


            // -----------------------------------------
            // ABRIR MINI-PAUTA
            // -----------------------------------------

            window.location.href =
                "mini-pauta.html";

        }
    );

}


// =====================================================
// INICIAR
// =====================================================

async function iniciar() {

    await carregarProfessorAtual();

    mostrarNomeProfessor();

    carregarTurmas();


    console.log(
        "================================"
    );

    console.log(
        "PAINEL PROFESSOR PRONTO"
    );

    console.log(
        "Ensino:",
        professor.ensino
    );

    console.log(
        "Atribuições:",
        professor.atribuicoes
    );

    console.log(
        "================================"
    );

}


iniciar();
