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

// =====================================================
// NOTAS.JS — ADMINISTRADOR
// BLOCO 2 — VISUALIZAÇÃO DAS NOTAS LANÇADAS
// =====================================================


// =====================================================
// EVENTO — TRIMESTRE
// =====================================================

filtroTrimestre?.addEventListener(
    "change",
    async function () {

        const professorId =
            filtroProfessor?.value || "";

        const classe =
            filtroClasse?.value || "";

        const turmaId =
            filtroTurma?.value || "";

        const disciplina =
            filtroDisciplina?.value || "";

        const trimestre =
            this.value;


        // ---------------------------------------------
        // VERIFICAR SE TUDO FOI SELECIONADO
        // ---------------------------------------------

        if (
            !professorId ||
            !classe ||
            !turmaId ||
            !disciplina ||
            !trimestre
        ) {

            mostrarMensagem(
                "Selecione professor, classe, turma, disciplina e trimestre."
            );

            return;

        }


        // ---------------------------------------------
        // MOSTRAR CARREGAMENTO
        // ---------------------------------------------

        mostrarMensagem(
            "⏳ A procurar as notas lançadas..."
        );


        try {

            await mostrarNotasLancadas({

                professorId,
                classe,
                turmaId,
                disciplina,
                trimestre

            });

        }
        catch (erro) {

            console.error(
                "Erro ao carregar notas:",
                erro
            );


            mostrarMensagem(
                "❌ Erro ao carregar as notas."
            );

        }

    }
);


// =====================================================
// BUSCAR NOTAS
// =====================================================

async function mostrarNotasLancadas(
    dadosFiltro
) {

    const {

        professorId,
        classe,
        turmaId,
        disciplina,
        trimestre

    } = dadosFiltro;


    console.log(
        "🔎 PROCURANDO NOTAS:",
        dadosFiltro
    );


    // =================================================
    // BUSCAR COLEÇÃO NOTAS
    // =================================================

    const resultado =
        await getDocs(
            collection(
                db,
                "notas"
            )
        );


    console.log(
        "📚 DOCUMENTOS NA COLEÇÃO NOTAS:",
        resultado.size
    );


    if (resultado.empty) {

        mostrarMensagem(
            "⚠️ Ainda não existem notas lançadas."
        );

        return;

    }


    // =================================================
    // FILTRAR
    // =================================================

    const notasEncontradas = [];


    resultado.forEach(
        documento => {

            const dados =
                documento.data();


            console.log(
                "📄 NOTA:",
                documento.id,
                dados
            );


            // -----------------------------------------
            // ACEITAR VÁRIAS FORMAS DE ID
            // -----------------------------------------

            const notaProfessor =
                String(
                    dados.professorId ||
                    dados.professor ||
                    ""
                ).trim();


            const notaTurma =
                String(
                    dados.turmaId ||
                    dados.turma ||
                    ""
                ).trim();


            const notaDisciplina =
                String(
                    dados.disciplina ||
                    dados.subject ||
                    ""
                ).trim();


            const notaTrimestre =
                String(
                    dados.trimestre ||
                    dados.periodo ||
                    ""
                ).trim();


            // -----------------------------------------
            // COMPARAR
            // -----------------------------------------

            const correspondeProfessor =
                !notaProfessor ||
                notaProfessor ===
                String(professorId);


            const correspondeTurma =
                !notaTurma ||
                notaTurma ===
                String(turmaId);


            const correspondeDisciplina =
                !notaDisciplina ||
                notaDisciplina.toLowerCase() ===
                disciplina.toLowerCase();


            const correspondeTrimestre =
                !notaTrimestre ||
                notaTrimestre ===
                String(trimestre);


            if (

                correspondeProfessor &&
                correspondeTurma &&
                correspondeDisciplina &&
                correspondeTrimestre

            ) {

                notasEncontradas.push({

                    id:
                        documento.id,

                    ...dados

                });

            }

        }
    );


    console.log(
        "✅ NOTAS ENCONTRADAS:",
        notasEncontradas
    );


    // =================================================
    // NENHUMA NOTA
    // =================================================

    if (!notasEncontradas.length) {

        mostrarMensagem(`

            <div style="
                padding:20px;
                text-align:center;
            ">

                <div style="
                    font-size:35px;
                    margin-bottom:10px;
                ">
                    📋
                </div>

                <strong>
                    Nenhuma nota encontrada
                </strong>

                <div style="
                    margin-top:8px;
                    color:#64748b;
                ">

                    Ainda não foram encontradas
                    notas lançadas para esta seleção.

                </div>

            </div>

        `);

        return;

    }


    // =================================================
    // MOSTRAR TABELA
    // =================================================

    mostrarTabelaNotas(
        notasEncontradas,
        dadosFiltro
    );

}


// =====================================================
// MOSTRAR TABELA DE NOTAS
// =====================================================

function mostrarTabelaNotas(
    notas,
    dadosFiltro
) {

    if (!notasLista) return;


    let html = "";


    // =================================================
    // CABEÇALHO
    // =================================================

    html += `

        <tr>

            <td
                colspan="8"
                style="
                    padding:18px;
                    background:#eff6ff;
                    border-bottom:2px solid #2563eb;
                "
            >

                <strong style="
                    font-size:18px;
                    color:#1e3a8a;
                ">

                    📋 Mini-Pauta

                </strong>

                <br>

                <span style="
                    color:#475569;
                    line-height:2;
                ">

                    Professor:
                    <strong>
                        ${nomeProfessor(
                            dadosFiltro.professorId
                        )}
                    </strong>

                    &nbsp; | &nbsp;

                    Classe:
                    <strong>
                        ${escaparHTML(
                            dadosFiltro.classe
                        )}
                    </strong>

                    &nbsp; | &nbsp;

                    Turma:
                    <strong>
                        ${nomeTurma(
                            dadosFiltro.turmaId
                        )}
                    </strong>

                    &nbsp; | &nbsp;

                    Disciplina:
                    <strong>
                        ${escaparHTML(
                            dadosFiltro.disciplina
                        )}
                    </strong>

                    &nbsp; | &nbsp;

                    <strong>
                        ${dadosFiltro.trimestre}º Trimestre
                    </strong>

                </span>

            </td>

        </tr>

    `;


    // =================================================
    // CABEÇALHO DA TABELA
    // =================================================

    html += `

        <tr>

            <th>Nº</th>

            <th>Nome Completo</th>

            <th>MAC</th>

            <th>NPT</th>

            <th>MF</th>

            <th>Estado</th>

        </tr>

    `;


    let numero = 1;


    // =================================================
    // PROCESSAR DOCUMENTOS
    // =================================================

    notas.forEach(
        nota => {

            /*
            ---------------------------------------------
            POSSÍVEIS FORMATOS DE ALUNOS
            ---------------------------------------------
            */

            let alunos = [];


            if (
                Array.isArray(
                    nota.alunos
                )
            ) {

                alunos =
                    nota.alunos;

            }


            else if (
                Array.isArray(
                    nota.notas
                )
            ) {

                alunos =
                    nota.notas;

            }


            else {

                /*
                Se o próprio documento representar
                um aluno.
                */

                alunos = [

                    nota

                ];

            }


            // -----------------------------------------
            // CADA ALUNO
            // -----------------------------------------

            alunos.forEach(
                aluno => {

                    const nome =
                        aluno.nome ||
                        aluno.nomeCompleto ||
                        aluno.aluno ||
                        "Aluno";


                    const mac =
                        aluno.MAC ??
                        aluno.mac ??
                        "";


                    const npt =
                        aluno.NPT ??
                        aluno.npt ??
                        "";


                    const mf =
                        aluno.MF ??
                        aluno.mf ??
                        "";


                    html += `

                        <tr>

                            <td>
                                ${numero}
                            </td>

                            <td style="
                                text-align:left;
                                font-weight:600;
                            ">

                                ${escaparHTML(
                                    nome
                                )}

                            </td>

                            <td>

                                ${escaparHTML(
                                    mac
                                )}

                            </td>

                            <td>

                                ${escaparHTML(
                                    npt
                                )}

                            </td>

                            <td style="
                                font-weight:bold;
                            ">

                                ${escaparHTML(
                                    mf
                                )}

                            </td>

                            <td>

                                <span style="
                                    display:inline-block;
                                    padding:5px 9px;
                                    border-radius:20px;
                                    background:#dcfce7;
                                    color:#166534;
                                    font-size:12px;
                                    font-weight:bold;
                                ">

                                    ✅ Lançado

                                </span>

                            </td>

                        </tr>

                    `;


                    numero++;

                }
            );

        }
    );


    // =================================================
    // COLOCAR NA PÁGINA
    // =================================================

    notasLista.innerHTML =
        html;


    console.log(
        "📊 TABELA DE NOTAS MOSTRADA."
    );

}


// =====================================================
// NOME DO PROFESSOR
// =====================================================

function nomeProfessor(
    professorId
) {

    const professor =
        professores.find(
            item =>
                item.id ===
                professorId
        );


    return escaparHTML(

        professor?.nome ||
        "Professor"

    );

}


// =====================================================
// NOME DA TURMA
// =====================================================

function nomeTurma(
    turmaId
) {

    const turma =
        turmas.find(
            item =>
                item.id ===
                turmaId
        );


    return escaparHTML(

        turma?.nome ||
        turma?.turma ||
        "Turma"

    );

}
