alert("CLASSES.JS COMPLETO CARREGADO ✅");

import { app } from "./firebase.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const db = getFirestore(app);


// =====================================================
// ELEMENTOS
// =====================================================

const btnCriar =
    document.getElementById("saveClass");

const listaTurmas =
    document.getElementById("classList");

const nomeInput =
    document.getElementById("className");

const classeInput =
    document.getElementById("classe");

const ensinoInput =
    document.getElementById("ensino");

const anoInput =
    document.getElementById("anoLetivo");


// =====================================================
// VERIFICAR ELEMENTOS
// =====================================================

if (!btnCriar) {

    alert(
        "Erro: botão saveClass não encontrado."
    );

    throw new Error(
        "saveClass não encontrado."
    );

}


if (!listaTurmas) {

    alert(
        "Erro: classList não encontrado."
    );

    throw new Error(
        "classList não encontrado."
    );

}


// =====================================================
// CLASSES POR ENSINO
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
// ID DA ESCOLA
// =====================================================

const escolaId = "SIGEA";


// =====================================================
// ATUALIZAR CLASSES
// =====================================================

function atualizarClasses() {

    const ensino =
        ensinoInput.value;


    classeInput.innerHTML = "";


    const classes =
        classesPorEnsino[ensino] || [];


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


            classeInput.appendChild(
                option
            );

        }
    );

}


// =====================================================
// BUSCAR DISCIPLINAS
// =====================================================

async function buscarDisciplinas(
    ensino,
    classe
) {

    try {

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

            console.log(
                "Documento config/disciplinas não existe."
            );

            return [];

        }


        const dados =
            resultado.data();


        const mapaEnsino =
            dados?.[ensino];


        if (!mapaEnsino) {

            alert(
                "O ensino não foi encontrado na configuração:\n\n" +
                ensino
            );

            return [];

        }


        const chaveClasse =
            Object.keys(mapaEnsino)
            .find(
                chave =>
                    chave.trim() ===
                    classe.trim()
            );


        if (!chaveClasse) {

            alert(
                "A classe não foi encontrada na configuração:\n\n" +
                classe
            );

            return [];

        }


        const lista =
            mapaEnsino[
                chaveClasse
            ]?.disciplinas || [];


        console.log(
            "Disciplinas encontradas:",
            lista
        );


        return lista;

    }

    catch (error) {

        console.error(
            "Erro ao buscar disciplinas:",
            error
        );


        alert(
            "Erro ao buscar disciplinas:\n\n" +
            error.message
        );


        return [];

    }

}


// =====================================================
// FORMATAR ENSINO
// =====================================================

function nomeEnsino(
    ensino
) {

    if (
        ensino ===
        "ensinoPrimario"
    ) {

        return "Ensino Primário";

    }


    if (
        ensino ===
        "primeiroCiclo"
    ) {

        return "Primeiro Ciclo";

    }


    return ensino || "—";

}


// =====================================================
// APAGAR TURMA
// =====================================================

async function apagarTurma(
    turmaId
) {

    try {

        const confirmar =
            confirm(

                "⚠️ ATENÇÃO!\n\n" +

                "Deseja realmente apagar esta turma?\n\n" +

                "Todos os alunos desta turma também serão apagados.\n\n" +

                "Esta ação não pode ser desfeita."

            );


        if (!confirmar) {

            return;

        }


        // =================================================
        // BUSCAR ALUNOS
        // =================================================

        const alunosReferencia =
            collection(
                db,
                "turmas",
                turmaId,
                "alunos"
            );


        const alunosSnapshot =
            await getDocs(
                alunosReferencia
            );


        // =================================================
        // APAGAR ALUNOS
        // =================================================

        for (
            const aluno
            of alunosSnapshot.docs
        ) {

            await deleteDoc(

                doc(
                    db,
                    "turmas",
                    turmaId,
                    "alunos",
                    aluno.id
                )

            );

        }


        // =================================================
        // APAGAR TURMA
        // =================================================

        await deleteDoc(

            doc(
                db,
                "turmas",
                turmaId
            )

        );


        alert(
            "✅ Turma apagada com sucesso!"
        );


        await carregarTurmas();

    }

    catch (error) {

        console.error(
            "Erro ao apagar turma:",
            error
        );


        alert(
            "❌ Erro ao apagar turma:\n\n" +
            error.message
        );

    }

}


// =====================================================
// VER TURMA
// =====================================================

async function verTurma(
    turmaId
) {

    try {

        const referencia =
            doc(
                db,
                "turmas",
                turmaId
            );


        const resultado =
            await getDoc(
                referencia
            );


        if (!resultado.exists()) {

            alert(
                "Turma não encontrada."
            );

            return;

        }


        const turma =
            resultado.data();


        const disciplinas =
            Array.isArray(
                turma.disciplinas
            )
            ?
            turma.disciplinas
            :
            [];


        alert(

            "🏫 DADOS DA TURMA\n\n" +

            "Turma: " +
            (turma.nome || "—") +

            "\n\nClasse: " +
            (turma.classe || "—") +

            "\n\nEnsino: " +
            nomeEnsino(
                turma.ensino
            ) +

            "\n\nAno Letivo: " +
            (turma.anoLetivo || "—") +

            "\n\nNúmero de disciplinas: " +
            disciplinas.length +

            "\n\nDisciplinas:\n" +
            (
                disciplinas.length
                ?
                disciplinas.join(
                    "\n"
                )
                :
                "Nenhuma"
            )

        );

    }

    catch (error) {

        console.error(
            error
        );


        alert(
            "Erro ao visualizar turma:\n\n" +
            error.message
        );

    }

}


// =====================================================
// LISTAR TURMAS EM TABELA
// =====================================================

async function carregarTurmas() {

    try {

        listaTurmas.innerHTML = `

            <div
                style="
                    padding:20px;
                    text-align:center;
                "
            >
                ⏳ A carregar turmas...
            </div>

        `;


        const resultado =
            await getDocs(
                collection(
                    db,
                    "turmas"
                )
            );


        // =================================================
        // NENHUMA TURMA
        // =================================================

        if (resultado.empty) {

            listaTurmas.innerHTML = `

                <div
                    style="
                        background:white;
                        padding:25px;
                        text-align:center;
                        border-radius:12px;
                        box-shadow:
                        0 3px 10px
                        rgba(0,0,0,.08);
                    "
                >

                    🏫

                    <br><br>

                    Nenhuma turma criada.

                </div>

            `;

            return;

        }


        // =================================================
        // CONSTRUIR TABELA
        // =================================================

        let html = `

        <div
            style="
                width:100%;
                overflow-x:auto;
                background:white;
                border-radius:12px;
                box-shadow:
                    0 3px 10px
                    rgba(0,0,0,.08);
            "
        >

            <table
                style="
                    width:100%;
                    min-width:850px;
                    border-collapse:collapse;
                    font-size:14px;
                "
            >

                <thead>

                    <tr
                        style="
                            background:#1e3a8a;
                            color:white;
                        "
                    >

                        <th
                            style="
                                padding:13px;
                                text-align:left;
                            "
                        >
                            Turma
                        </th>


                        <th
                            style="
                                padding:13px;
                            "
                        >
                            Classe
                        </th>


                        <th
                            style="
                                padding:13px;
                            "
                        >
                            Ensino
                        </th>


                        <th
                            style="
                                padding:13px;
                            "
                        >
                            Ano Letivo
                        </th>


                        <th
                            style="
                                padding:13px;
                            "
                        >
                            Disciplinas
                        </th>


                        <th
                            style="
                                padding:13px;
                            "
                        >
                            Ações
                        </th>

                    </tr>

                </thead>


                <tbody>

        `;


        // =================================================
        // LINHAS
        // =================================================

        resultado.forEach(
            item => {

                const turma =
                    item.data();


                const turmaId =
                    item.id;


                const disciplinas =
                    Array.isArray(
                        turma.disciplinas
                    )
                    ?
                    turma.disciplinas.length
                    :
                    0;


                html += `

                    <tr
                        style="
                            border-bottom:
                            1px solid #e2e8f0;
                        "
                    >

                        <td
                            style="
                                padding:12px;
                                font-weight:bold;
                            "
                        >

                            ${turma.nome || "—"}

                        </td>


                        <td
                            style="
                                padding:12px;
                                text-align:center;
                            "
                        >

                            ${turma.classe || "—"}

                        </td>


                        <td
                            style="
                                padding:12px;
                                text-align:center;
                            "
                        >

                            ${nomeEnsino(
                                turma.ensino
                            )}

                        </td>


                        <td
                            style="
                                padding:12px;
                                text-align:center;
                            "
                        >

                            ${turma.anoLetivo || "—"}

                        </td>


                        <td
                            style="
                                padding:12px;
                                text-align:center;
                            "
                        >

                            ${disciplinas}

                        </td>


                        <td
                            style="
                                padding:12px;
                                text-align:center;
                                white-space:nowrap;
                            "
                        >

                            <button
                                class="btnVerTurma"
                                data-id="${turmaId}"
                                title="Ver turma"
                                style="
                                    background:#2563eb;
                                    color:white;
                                    border:none;
                                    padding:8px 11px;
                                    border-radius:7px;
                                    cursor:pointer;
                                    margin-right:5px;
                                "
                            >
                                👁️
                            </button>


                            <button
                                class="btnApagarTurma"
                                data-id="${turmaId}"
                                title="Apagar turma"
                                style="
                                    background:#dc2626;
                                    color:white;
                                    border:none;
                                    padding:8px 11px;
                                    border-radius:7px;
                                    cursor:pointer;
                                "
                            >
                                🗑️
                            </button>

                        </td>

                    </tr>

                `;

            }
        );


        html += `

                </tbody>

            </table>

        </div>

        `;


        listaTurmas.innerHTML =
            html;


        // =================================================
        // BOTÕES VER
        // =================================================

        document
            .querySelectorAll(
                ".btnVerTurma"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        function () {

                            const turmaId =
                                this.dataset.id;


                            verTurma(
                                turmaId
                            );

                        }
                    );

                }
            );


        // =================================================
        // BOTÕES APAGAR
        // =================================================

        document
            .querySelectorAll(
                ".btnApagarTurma"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        function () {

                            const turmaId =
                                this.dataset.id;


                            apagarTurma(
                                turmaId
                            );

                        }
                    );

                }
            );

    }

    catch (error) {

        console.error(
            "Erro ao carregar turmas:",
            error
        );


        listaTurmas.innerHTML = `

            <div
                style="
                    color:#dc2626;
                    background:#fee2e2;
                    padding:15px;
                    border-radius:10px;
                "
            >

                ❌ Erro ao carregar turmas:

                <br><br>

                ${error.message}

            </div>

        `;

    }

}


// =====================================================
// CRIAR TURMA
// =====================================================

btnCriar.addEventListener(
    "click",
    async function () {

        const nome =
            nomeInput.value.trim();


        const classe =
            classeInput.value.trim();


        const ensino =
            ensinoInput.value.trim();


        const ano =
            anoInput.value.trim();


        // =================================================
        // VALIDAR
        // =================================================

        if (
            nome === "" ||
            classe === "" ||
            ensino === "" ||
            ano === ""
        ) {

            alert(
                "⚠️ Preencha todos os campos."
            );

            return;

        }


        try {

            // =================================================
            // DESATIVAR BOTÃO
            // =================================================

            btnCriar.disabled =
                true;


            btnCriar.textContent =
                "A criar...";


            // =================================================
            // BUSCAR DISCIPLINAS
            // =================================================

            const disciplinas =
                await buscarDisciplinas(
                    ensino,
                    classe
                );


            // =================================================
            // DADOS DA TURMA
            // =================================================

            const novaTurma = {

                nome:
                    nome,

                classe:
                    classe,

                ensino:
                    ensino,

                anoLetivo:
                    ano,

                escolaId:
                    escolaId,

                disciplinas:
                    disciplinas,

                criadoEm:
                    serverTimestamp()

            };


            // =================================================
            // GUARDAR
            // =================================================

            await addDoc(

                collection(
                    db,
                    "turmas"
                ),

                novaTurma

            );


            alert(
                "✅ Turma criada com sucesso!"
            );


            // =================================================
            // LIMPAR
            // =================================================

            nomeInput.value =
                "";

            anoInput.value =
                "";


            // =================================================
            // ATUALIZAR LISTA
            // =================================================

            await carregarTurmas();

        }

        catch (error) {

            console.error(
                "Erro ao criar turma:",
                error
            );


            alert(
                "❌ Erro ao criar turma:\n\n" +
                error.message
            );

        }

        finally {

            btnCriar.disabled =
                false;


            btnCriar.textContent =
                "Criar Turma";

        }

    }
);


// =====================================================
// ALTERAR ENSINO
// =====================================================

ensinoInput.addEventListener(
    "change",
    atualizarClasses
);


// =====================================================
// INICIALIZAR CLASSES
// =====================================================

atualizarClasses();


// =====================================================
// CARREGAR TURMAS
// =====================================================

carregarTurmas();
