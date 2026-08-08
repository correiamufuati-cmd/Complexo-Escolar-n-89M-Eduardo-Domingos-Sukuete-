alert("PAINEL PROFESSOR CARREGADO ✅");

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// =====================================================
// PROFESSOR LOGADO
// =====================================================

const dadosProfessor =
    localStorage.getItem("professorLogado");


if (!dadosProfessor) {

    alert("Sessão do professor não encontrada.");

    window.location.href =
        "login-professor.html";

    throw new Error(
        "Professor não autenticado."
    );

}


const professor =
    JSON.parse(dadosProfessor);


console.log(
    "PROFESSOR LOGADO:",
    professor
);


// =====================================================
// ELEMENTOS
// =====================================================

const nomeProfessor =
    document.getElementById("nomeProfessor");

const selectTurma =
    document.getElementById("selectTurma");

const selectDisciplina =
    document.getElementById("selectDisciplina");

const selectTrimestre =
    document.getElementById("selectTrimestre");

const abrirMiniPauta =
    document.getElementById("abrirMiniPauta");


// =====================================================
// VERIFICAR ELEMENTOS
// =====================================================

if (!selectTurma) {

    alert(
        "Erro: selectTurma não encontrado no HTML."
    );

    throw new Error(
        "selectTurma inexistente."
    );

}


if (!selectDisciplina) {

    alert(
        "Erro: selectDisciplina não encontrado no HTML."
    );

    throw new Error(
        "selectDisciplina inexistente."
    );

}


if (!selectTrimestre) {

    alert(
        "Erro: selectTrimestre não encontrado no HTML."
    );

    throw new Error(
        "selectTrimestre inexistente."
    );

}


// =====================================================
// NOME DO PROFESSOR
// =====================================================

if (nomeProfessor) {

    nomeProfessor.textContent =
        "👨‍🏫 " +
        (professor.nome || "Professor");

}


// =====================================================
// ATRIBUIÇÕES
// =====================================================

const atribuicoes =
    Array.isArray(professor.atribuicoes)
        ? professor.atribuicoes
        : [];


console.log(
    "ATRIBUIÇÕES:",
    atribuicoes
);


if (atribuicoes.length === 0) {

    alert(
        "Este professor não possui atribuições cadastradas."
    );

}


// =====================================================
// TURMAS
// =====================================================

selectTurma.innerHTML = `

<option value="">
Selecione a turma
</option>

`;


// Guardar turmas sem duplicação

const mapaTurmas =
    new Map();


atribuicoes.forEach(
    atribuicao => {

        const turmaId =
            String(
                atribuicao.turmaId || ""
            ).trim();


        const turmaNome =
            String(
                atribuicao.turmaNome || ""
            ).trim();


        const classe =
            String(
                atribuicao.classe || ""
            ).trim();


        if (!turmaId) {

            console.warn(
                "Atribuição sem turmaId:",
                atribuicao
            );

            return;

        }


        // Nome que será mostrado

        const nomeExibicao =
            turmaNome ||
            classe ||
            turmaId;


        if (!mapaTurmas.has(turmaId)) {

            mapaTurmas.set(
                turmaId,
                {
                    id: turmaId,
                    nome: nomeExibicao,
                    classe: classe
                }
            );

        }

    }
);


// =====================================================
// MOSTRAR TURMAS
// =====================================================

mapaTurmas.forEach(
    turma => {

        selectTurma.innerHTML += `

<option value="${turma.id}">
${turma.nome}
${turma.classe && turma.nome !== turma.classe
    ? " - " + turma.classe
    : ""}
</option>

`;

    }
);


console.log(
    "TURMAS DO PROFESSOR:",
    Array.from(mapaTurmas.values())
);


// =====================================================
// SE NÃO EXISTIR TURMA
// =====================================================

if (mapaTurmas.size === 0) {

    selectTurma.innerHTML = `

<option value="">
Nenhuma turma atribuída
</option>

`;

}


// =====================================================
// SELECIONAR TURMA
// =====================================================

selectTurma.addEventListener(
    "change",
    () => {

        const turmaId =
            selectTurma.value;


        console.log(
            "TURMA SELECIONADA:",
            turmaId
        );


        // Limpar disciplinas

        selectDisciplina.innerHTML = `

<option value="">
Selecione a disciplina
</option>

`;


        if (!turmaId) {

            return;

        }


        const disciplinas =
            [];


        // Procurar disciplinas
        // pertencentes à turma

        atribuicoes.forEach(
            atribuicao => {

                const id =
                    String(
                        atribuicao.turmaId || ""
                    ).trim();


                if (
                    id === turmaId
                ) {

                    const disciplina =
                        String(
                            atribuicao.disciplina || ""
                        ).trim();


                    if (
                        disciplina &&
                        !disciplinas.includes(
                            disciplina
                        )
                    ) {

                        disciplinas.push(
                            disciplina
                        );

                    }

                }

            }
        );


        console.log(
            "DISCIPLINAS:",
            disciplinas
        );


        disciplinas.forEach(
            disciplina => {

                selectDisciplina.innerHTML += `

<option value="${disciplina}">
${disciplina}
</option>

`;

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


            console.log(
                "DADOS PARA MINI-PAUTA:",
                {
                    turmaId,
                    disciplina,
                    trimestre
                }
            );


            // -------------------------------
            // VALIDAR TURMA
            // -------------------------------

            if (!turmaId) {

                alert(
                    "Selecione uma turma."
                );

                return;

            }


            // -------------------------------
            // VALIDAR DISCIPLINA
            // -------------------------------

            if (!disciplina) {

                alert(
                    "Selecione uma disciplina."
                );

                return;

            }


            // -------------------------------
            // VALIDAR TRIMESTRE
            // -------------------------------

            if (!trimestre) {

                alert(
                    "Selecione o trimestre."
                );

                return;

            }


            // =================================================
            // ENCONTRAR ATRIBUIÇÃO
            // =================================================

            const atribuicao =
                atribuicoes.find(
                    item => {

                        const id =
                            String(
                                item.turmaId || ""
                            ).trim();


                        const disc =
                            String(
                                item.disciplina || ""
                            ).trim();


                        return (
                            id === turmaId &&
                            disc === disciplina
                        );

                    }
                );


            if (!atribuicao) {

                alert(
                    "Atribuição não encontrada."
                );

                console.error(
                    "Atribuições:",
                    atribuicoes
                );

                return;

            }


            // =================================================
            // GUARDAR DADOS
            // =================================================

            localStorage.setItem(
                "turmaId",
                turmaId
            );


            localStorage.setItem(
                "turmaNome",
                atribuicao.turmaNome || ""
            );


            localStorage.setItem(
                "disciplina",
                disciplina
            );


            localStorage.setItem(
                "trimestre",
                trimestre
            );


            localStorage.setItem(
                "ensino",
                professor.ensino || ""
            );


            localStorage.setItem(
                "classe",
                atribuicao.classe || ""
            );


            console.log(
                "DADOS GUARDADOS:",
                {
                    turmaId,
                    turmaNome:
                        atribuicao.turmaNome,
                    disciplina,
                    trimestre,
                    ensino:
                        professor.ensino,
                    classe:
                        atribuicao.classe
                }
            );


            // =================================================
            // ABRIR MINI-PAUTA
            // =================================================

            window.location.href =
                "mini-pauta.html";

        }
    );

}


console.log(
    "PAINEL PROFESSOR PRONTO ✅"
);
