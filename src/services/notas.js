// =====================================================
// NOTAS.JS — ADMINISTRADOR
// SGE
// BLOCO 1 — FILTROS EM CASCATA
// Professor → Classe → Turma → Disciplina → Trimestre
// =====================================================

alert("🔥 NOTAS.JS — BLOCO CARREGADO!");

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// =====================================================
// ELEMENTOS
// =====================================================

filtroProfessor.addEventListener("change", function () {

    const professorId = this.value;

    filtroClasse.innerHTML = `
        <option value="">
            Selecionar classe
        </option>
    `;

    filtroTurma.innerHTML = `
        <option value="">
            Selecione primeiro a classe
        </option>
    `;

    if (!professorId) {
        return;
    }

    const professor = professores.find(
        p => p.id === professorId
    );

    if (!professor) {
        alert("❌ Professor não encontrado.");
        return;
    }

    const atribuicoes =
        Array.isArray(professor.atribuicoes)
            ? professor.atribuicoes
            : [];

    if (!atribuicoes.length) {
        alert(
            "⚠️ Este professor não possui atribuições."
        );
        return;
    }

    // ============================================
    // PEGAR AS CLASSES
    // ============================================

    const classes = [];

    atribuicoes.forEach(item => {

        const classe =
            String(
                item.classe ?? ""
            ).trim();

        if (
            classe &&
            !classes.includes(classe)
        ) {
            classes.push(classe);
        }

    });

    // ============================================
    // COLOCAR NO SELECT
    // ============================================

    classes.forEach(classe => {

        const option =
            document.createElement("option");

        option.value = classe;

        option.textContent = classe;

        filtroClasse.appendChild(option);

    });

    // ============================================
    // TESTE
    // ============================================

    alert(
        "👨‍🏫 Professor:\n" +
        (professor.nome || "Sem nome") +

        "\n\n" +

        "📚 Classes encontradas:\n" +

        (
            classes.length
                ? classes.join("\n")
                : "NENHUMA"
        ) +

        "\n\n" +

        "Quantidade: " +
        classes.length +

        "\n\n" +

        "Opções no SELECT: " +
        filtroClasse.options.length
    );

});

// ====================================================
// ELEMENTOS DA CLASSE 
// =====================================================

filtroClasse.addEventListener("change", function () {

    const professorId =
        filtroProfessor.value;

    const classeSelecionada =
        this.value;


    filtroTurma.innerHTML = `
        <option value="">
            Selecionar turma
        </option>
    `;

    filtroDisciplina.innerHTML = `
        <option value="">
            Selecione primeiro a turma
        </option>
    `;


    filtroTurma.disabled = true;
    filtroDisciplina.disabled = true;


    if (
        !professorId ||
        !classeSelecionada
    ) {

        return;

    }


    const professor =
        professores.find(
            p => p.id === professorId
        );


    if (!professor) {

        return;

    }


    const atribuicoes =
        Array.isArray(
            professor.atribuicoes
        )
            ? professor.atribuicoes
            : [];


    // =================================================
    // TURMAS DA CLASSE SELECIONADA
    // =================================================

    const turmasClasse =
        [
            ...new Map(

                atribuicoes
                    .filter(
                        item =>
                            String(
                                item.classe
                            ).trim() ===
                            String(
                                classeSelecionada
                            ).trim()
                    )
                    .map(
                        item => [

                            item.turmaId,

                            item

                        ]
                    )

            ).values()

        ];


    turmasClasse.forEach(
        item => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                item.turmaId;


            option.textContent =
                item.turmaNome ||
                "Turma";


            filtroTurma.appendChild(
                option
            );

        }
    );


    filtroTurma.disabled =
        turmasClasse.length === 0;


    alert(
        "📚 CLASSE SELECIONADA\n\n" +

        "Classe: " +
        classeSelecionada +

        "\n\n" +

        "Turmas encontradas: " +
        turmasClasse.length
    );

});

// =====================================================
// DADOS
// =====================================================

let professores = [];

let turmas = [];


// =====================================================
// INICIALIZAR
// =====================================================

async function iniciarNotas() {

    try {

        console.log(
            "🔵 A iniciar painel de notas..."
        );


        await carregarProfessores();

        await carregarTurmas();


        preencherProfessores();

        prepararFiltros();


        mostrarMensagem(
            "Selecione um professor para começar."
        );


        console.log(
            "✅ BLOCO 1 TERMINADO"
        );

    }
    catch (erro) {

        console.error(
            "Erro ao iniciar notas:",
            erro
        );


        mostrarMensagem(
            "❌ Erro ao carregar os dados."
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
        "👨‍🏫 Professores:",
        professores
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
        "🏫 Turmas:",
        turmas
    );

}


// =====================================================
// PROFESSORES
// =====================================================

function preencherProfessores() {

    if (!filtroProfessor) {

        console.error(
            "filtroProfessor não encontrado."
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

    }


    if (filtroTurma) {

        filtroTurma.innerHTML = `

            <option value="">
                Selecione primeiro a classe
            </option>

        `;

    }


    if (filtroDisciplina) {

        filtroDisciplina.innerHTML = `

            <option value="">
                Selecione primeiro a turma
            </option>

        `;

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


    if (!professorId) {

        prepararFiltros();

        return;

    }


    const professor =
        professores.find(
            item =>
                item.id === professorId
        );


    if (!professor) {

        return;

    }


    // -----------------------------------------------
    // TURMAS ASSOCIADAS AO PROFESSOR
    // -----------------------------------------------

    const idsTurmas =
        Array.isArray(
            professor.turmas
        )
            ? professor.turmas
            : [];


    const turmasProfessor =
        turmas.filter(
            turma =>
                idsTurmas.includes(
                    turma.id
                )
        );


    // -----------------------------------------------
    // CLASSES SEM REPETIÇÃO
    // -----------------------------------------------

    const classes =
        new Map();


    turmasProfessor.forEach(
        turma => {

            const classe =
                turma.classe;


            if (!classe) {

                return;

            }


            const chave =
                String(
                    classe
                )
                .trim()
                .toLowerCase();


            if (!classes.has(chave)) {

                classes.set(
                    chave,
                    classe
                );

            }

        }
    );


    // -----------------------------------------------
    // COLOCAR NO SELECT
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


    console.log(
        "📚 Classes do professor:",
        [...classes.values()]
    );


    if (!classes.size) {

        filtroClasse.innerHTML = `

            <option value="">
                Nenhuma classe associada
            </option>

        `;

    }

}


// =====================================================
// CLASSE → TURMAS
// =====================================================

function carregarTurmasDaClasse(
    classe
) {

    if (!filtroTurma) return;


    filtroTurma.innerHTML = `

        <option value="">
            Selecionar turma
        </option>

    `;


    const professorId =
        filtroProfessor?.value;


    if (!professorId || !classe) {

        return;

    }


    const professor =
        professores.find(
            item =>
                item.id === professorId
        );


    if (!professor) {

        return;

    }


    const idsTurmas =
        Array.isArray(
            professor.turmas
        )
            ? professor.turmas
            : [];


    const turmasEncontradas =
        turmas.filter(
            turma =>

                idsTurmas.includes(
                    turma.id
                )

                &&

                String(
                    turma.classe || ""
                ).trim() ===
                String(
                    classe
                ).trim()
        );


    turmasEncontradas.forEach(
        turma => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                turma.id;


            option.textContent =
                turma.nome ||
                turma.turma ||
                "Turma";


            filtroTurma.appendChild(
                option
            );

        }
    );


    console.log(
        "🏫 Turmas da classe:",
        turmasEncontradas
    );


    if (!turmasEncontradas.length) {

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


    const professorId =
        filtroProfessor?.value;


    if (!professorId || !turmaId) {

        return;

    }


    const professor =
        professores.find(
            item =>
                item.id === professorId
        );


    if (!professor) {

        return;

    }


    let disciplinas = [];


    // =================================================
    // DISCIPLINAS DO PROFESSOR
    // =================================================

    if (
        Array.isArray(
            professor.disciplinas
        )
    ) {

        disciplinas =
            [...professor.disciplinas];

    }


    // =================================================
    // EVITAR REPETIÇÕES
    // =================================================

    disciplinas =
        [
            ...new Set(
                disciplinas
                    .map(
                        item =>
                            String(
                                item
                            ).trim()
                    )
                    .filter(Boolean)
            )
        ];


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


    console.log(
        "📚 Disciplinas:",
        disciplinas
    );


    if (!disciplinas.length) {

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


        carregarClassesDoProfessor(
            professorId
        );


        if (filtroTurma) {

            filtroTurma.innerHTML = `

                <option value="">
                    Selecione primeiro a classe
                </option>

            `;

        }


        if (filtroDisciplina) {

            filtroDisciplina.innerHTML = `

                <option value="">
                    Selecione primeiro a turma
                </option>

            `;

        }


        mostrarMensagem(
            professorId
                ? "Selecione agora a classe."
                : "Selecione um professor para começar."
        );

    }
);


// =====================================================
// EVENTO — CLASSE
// =====================================================

filtroClasse?.addEventListener(
    "change",
    function () {

        carregarTurmasDaClasse(
            this.value
        );


        if (filtroDisciplina) {

            filtroDisciplina.innerHTML = `

                <option value="">
                    Selecione primeiro a turma
                </option>

            `;

        }

    }
);


// =====================================================
// EVENTO — TURMA
// =====================================================

filtroTurma?.addEventListener(
    "change",
    function () {

        carregarDisciplinasDaTurma(
            this.value
        );

    }
);


// =====================================================
// EVENTO — DISCIPLINA
// =====================================================

filtroDisciplina?.addEventListener(
    "change",
    function () {

        console.log(
            "Disciplina selecionada:",
            this.value
        );

    }
);


// =====================================================
// EVENTO — TRIMESTRE
// =====================================================

filtroTrimestre?.addEventListener(
    "change",
    function () {

        console.log(
            "Trimestre selecionado:",
            this.value
        );

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
