// =====================================================
// NOTAS.JS — ADMINISTRADOR
// SGE
// BLOCO 1 — FILTROS EM CASCATA
// Professor → Classe → Turma → Disciplina → Trimestre
// =====================================================

alert("🔥 NOTAS.JS ADMINISTRADOR CARREGADO!");


import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// =====================================================
// ELEMENTOS
// =====================================================

const filtroProfessor =
    document.getElementById("filtroProfessor");

const filtroClasse =
    document.getElementById("filtroClasse");

const filtroTurma =
    document.getElementById("filtroTurma");

const filtroDisciplina =
    document.getElementById("filtroDisciplina");

const filtroTrimestre =
    document.getElementById("filtroTrimestre");

const notasLista =
    document.getElementById("notasLista");


// =====================================================
// DADOS
// =====================================================

let professores = [];


// =====================================================
// INICIAR
// =====================================================

async function iniciarNotas() {

    try {

        mostrarMensagem(
            "⏳ A carregar professores..."
        );


        await carregarProfessores();


        preencherProfessores();


        prepararFiltros();


        mostrarMensagem(
            "👨‍🏫 Selecione um professor para começar."
        );


        console.log(
            "✅ NOTAS.JS INICIADO"
        );

    }
    catch (erro) {

        console.error(
            "❌ ERRO AO INICIAR:",
            erro
        );


        mostrarMensagem(
            "❌ Erro ao carregar os professores."
        );

    }

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
        (a, b) =>
            String(
                a.nome || ""
            ).localeCompare(
                String(
                    b.nome || ""
                ),
                "pt"
            )
    );


    console.log(
        "👨‍🏫 PROFESSORES:",
        professores
    );

}


// =====================================================
// PREENCHER PROFESSORES
// =====================================================

function preencherProfessores() {

    if (!filtroProfessor) {

        console.error(
            "❌ filtroProfessor não encontrado."
        );

        return;

    }


    filtroProfessor.innerHTML = `

        <option value="">
            Selecionar professor
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
                "Professor sem nome";


            filtroProfessor.appendChild(
                option
            );

        }
    );

}


// =====================================================
// PREPARAR FILTROS
// =====================================================

function prepararFiltros() {

    if (filtroClasse) {

        filtroClasse.innerHTML = `

            <option value="">
                Selecione primeiro o professor
            </option>

        `;

        filtroClasse.disabled = true;

    }


    if (filtroTurma) {

        filtroTurma.innerHTML = `

            <option value="">
                Selecione primeiro a classe
            </option>

        `;

        filtroTurma.disabled = true;

    }


    if (filtroDisciplina) {

        filtroDisciplina.innerHTML = `

            <option value="">
                Selecione primeiro a turma
            </option>

        `;

        filtroDisciplina.disabled = true;

    }


    if (filtroTrimestre) {

        filtroTrimestre.innerHTML = `

            <option value="">
                Selecionar trimestre
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

}


// =====================================================
// PROFESSOR → CLASSES
// =====================================================

function carregarClassesDoProfessor(
    professorId
) {

    if (!filtroClasse) return;


    filtroClasse.innerHTML = `

        <option value="">
            Selecionar classe
        </option>

    `;


    filtroClasse.disabled = true;


    // -----------------------------------------------
    // PROCURAR PROFESSOR
    // -----------------------------------------------

    const professor =
        professores.find(
            item =>
                item.id === professorId
        );


    if (!professor) {

        return;

    }


    // -----------------------------------------------
    // ATRIBUIÇÕES
    // -----------------------------------------------

    const atribuicoes =
        Array.isArray(
            professor.atribuicoes
        )
            ? professor.atribuicoes
            : [];


    console.log(
        "📚 ATRIBUIÇÕES DO PROFESSOR:",
        atribuicoes
    );


    if (!atribuicoes.length) {

        filtroClasse.innerHTML = `

            <option value="">
                Nenhuma classe associada
            </option>

        `;

        alert(
            "⚠️ Este professor não possui atribuições."
        );

        return;

    }


    // -----------------------------------------------
    // CLASSES ÚNICAS
    // -----------------------------------------------

    const classes =
        new Map();


    atribuicoes.forEach(
        item => {

            const classe =
                String(
                    item.classe ?? ""
                ).trim();


            if (!classe) return;


            const chave =
                classe.toLowerCase();


            if (!classes.has(chave)) {

                classes.set(
                    chave,
                    classe
                );

            }

        }
    );


    // -----------------------------------------------
    // COLOCAR CLASSES NO SELECT
    // -----------------------------------------------

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


    filtroClasse.disabled =
        classes.size === 0;


    console.log(
        "📚 CLASSES ENCONTRADAS:",
        [...classes.values()]
    );


    if (!classes.size) {

        filtroClasse.innerHTML = `

            <option value="">
                Nenhuma classe associada
            </option>

        `;

        alert(
            "⚠️ Nenhuma classe encontrada nas atribuições."
        );

    }

}


// =====================================================
// CLASSE → TURMAS
// =====================================================

function carregarTurmasDaClasse(
    classeSelecionada
) {

    if (!filtroTurma) return;


    filtroTurma.innerHTML = `

        <option value="">
            Selecionar turma
        </option>

    `;


    filtroTurma.disabled = true;


    const professorId =
        filtroProfessor?.value;


    if (
        !professorId ||
        !classeSelecionada
    ) {

        return;

    }


    const professor =
        professores.find(
            item =>
                item.id === professorId
        );


    if (!professor) return;


    const atribuicoes =
        Array.isArray(
            professor.atribuicoes
        )
            ? professor.atribuicoes
            : [];


    // -----------------------------------------------
    // TURMAS DA CLASSE
    // -----------------------------------------------

    const turmas =
        new Map();


    atribuicoes.forEach(
        item => {

            const classe =
                String(
                    item.classe ?? ""
                ).trim();


            if (
                classe !==
                String(
                    classeSelecionada
                ).trim()
            ) {

                return;

            }


            const turmaId =
                String(
                    item.turmaId ?? ""
                ).trim();


            if (!turmaId) return;


            const turmaNome =
                String(
                    item.turmaNome ??
                    item.turma ??
                    ""
                ).trim();


            if (!turmas.has(turmaId)) {

                turmas.set(
                    turmaId,
                    {

                        turmaId:
                            turmaId,

                        turmaNome:
                            turmaNome ||
                            "Turma"

                    }
                );

            }

        }
    );


    // -----------------------------------------------
    // COLOCAR TURMAS
    // -----------------------------------------------

    turmas.forEach(
        turma => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                turma.turmaId;


            option.textContent =
                turma.turmaNome;


            filtroTurma.appendChild(
                option
            );

        }
    );


    filtroTurma.disabled =
        turmas.size === 0;


    console.log(
        "🏫 TURMAS ENCONTRADAS:",
        [...turmas.values()]
    );


    alert(

        "📚 CLASSE SELECIONADA\n\n" +

        "Classe: " +
        classeSelecionada +

        "\n\n" +

        "Turmas encontradas: " +
        turmas.size

    );


    if (!turmas.size) {

        filtroTurma.innerHTML = `

            <option value="">
                Nenhuma turma encontrada
            </option>

        `;

    }

}


// =====================================================
// TURMA → DISCIPLINAS
// =====================================================

function carregarDisciplinasDaTurma(
    turmaId
) {

    if (!filtroDisciplina) return;


    filtroDisciplina.innerHTML = `

        <option value="">
            Selecionar disciplina
        </option>

    `;


    filtroDisciplina.disabled = true;


    const professorId =
        filtroProfessor?.value;


    if (
        !professorId ||
        !turmaId
    ) {

        return;

    }


    const professor =
        professores.find(
            item =>
                item.id === professorId
        );


    if (!professor) return;


    const atribuicoes =
        Array.isArray(
            professor.atribuicoes
        )
            ? professor.atribuicoes
            : [];


    // -----------------------------------------------
    // DISCIPLINAS DA TURMA
    // -----------------------------------------------

    const disciplinas =
        new Set();


    atribuicoes.forEach(
        item => {

            const itemTurmaId =
                String(
                    item.turmaId ?? ""
                ).trim();


            if (
                itemTurmaId !==
                String(
                    turmaId
                ).trim()
            ) {

                return;

            }


            const disciplina =
                String(
                    item.disciplina ?? ""
                ).trim();


            if (!disciplina) return;


            disciplinas.add(
                disciplina
            );

        }
    );


    // -----------------------------------------------
    // COLOCAR DISCIPLINAS
    // -----------------------------------------------

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


            filtroDisciplina.appendChild(
                option
            );

        }
    );


    filtroDisciplina.disabled =
        disciplinas.size === 0;


    console.log(
        "📖 DISCIPLINAS ENCONTRADAS:",
        [...disciplinas]
    );


    alert(

        "🏫 TURMA SELECIONADA\n\n" +

        "Turma ID: " +
        turmaId +

        "\n\n" +

        "Disciplinas encontradas: " +
        disciplinas.size

    );


    if (!disciplinas.size) {

        filtroDisciplina.innerHTML = `

            <option value="">
                Nenhuma disciplina atribuída
            </option>

        `;

    }

}


// =====================================================
// EVENTO — PROFESSOR
// =====================================================

filtroProfessor?.addEventListener(
    "change",
    function () {

        const professorId =
            this.value;


        // Resetar os campos seguintes

        if (filtroTurma) {

            filtroTurma.innerHTML = `

                <option value="">
                    Selecione primeiro a classe
                </option>

            `;

            filtroTurma.disabled = true;

        }


        if (filtroDisciplina) {

            filtroDisciplina.innerHTML = `

                <option value="">
                    Selecione primeiro a turma
                </option>

            `;

            filtroDisciplina.disabled = true;

        }


        // Carregar classes

        carregarClassesDoProfessor(
            professorId
        );


        if (professorId) {

            mostrarMensagem(
                "📚 Agora selecione a classe."
            );

        }
        else {

            mostrarMensagem(
                "👨‍🏫 Selecione um professor para começar."
            );

        }

    }
);


// =====================================================
// EVENTO — CLASSE
// =====================================================

filtroClasse?.addEventListener(
    "change",
    function () {

        const classe =
            this.value;


        if (filtroDisciplina) {

            filtroDisciplina.innerHTML = `

                <option value="">
                    Selecione primeiro a turma
                </option>

            `;

            filtroDisciplina.disabled = true;

        }


        carregarTurmasDaClasse(
            classe
        );


        if (classe) {

            mostrarMensagem(
                "🏫 Agora selecione a turma."
            );

        }

    }
);


// =====================================================
// EVENTO — TURMA
// =====================================================

filtroTurma?.addEventListener(
    "change",
    function () {

        const turmaId =
            this.value;


        carregarDisciplinasDaTurma(
            turmaId
        );


        if (turmaId) {

            mostrarMensagem(
                "📖 Agora selecione a disciplina."
            );

        }

    }
);


// =====================================================
// EVENTO — DISCIPLINA
// =====================================================

filtroDisciplina?.addEventListener(
    "change",
    function () {

        const disciplina =
            this.value;


        console.log(
            "📖 Disciplina selecionada:",
            disciplina
        );


        if (disciplina) {

            mostrarMensagem(
                "📅 Agora selecione o trimestre."
            );

        }

    }
);


// =====================================================
// EVENTO — TRIMESTRE
// =====================================================

filtroTrimestre?.addEventListener(
    "change",
    function () {

        const trimestre =
            this.value;


        console.log(
            "📅 Trimestre selecionado:",
            trimestre
        );


        if (
            trimestre &&
            filtroProfessor?.value &&
            filtroClasse?.value &&
            filtroTurma?.value &&
            filtroDisciplina?.value
        ) {

            mostrarMensagem(

                "✅ Seleção completa.\n\n" +

                "Professor: " +
                filtroProfessor.options[
                    filtroProfessor.selectedIndex
                ].text +

                "\nClasse: " +
                filtroClasse.value +

                "\nTurma: " +
                filtroTurma.options[
                    filtroTurma.selectedIndex
                ].text +

                "\nDisciplina: " +
                filtroDisciplina.value +

                "\nTrimestre: " +
                filtroTrimestre.options[
                    filtroTrimestre.selectedIndex
                ].text

            );

        }

    }
);


// =====================================================
// MENSAGEM
// =====================================================

function mostrarMensagem(
    mensagem
) {

    if (!notasLista) return;


    notasLista.innerHTML = `

        <tr>

            <td
                colspan="8"
                style="
                    text-align:center;
                    padding:25px;
                    color:#64748b;
                    white-space:pre-line;
                "
            >

                ${mensagem}

            </td>

        </tr>

    `;

}


// =====================================================
// INICIAR
// =====================================================

iniciarNotas();
