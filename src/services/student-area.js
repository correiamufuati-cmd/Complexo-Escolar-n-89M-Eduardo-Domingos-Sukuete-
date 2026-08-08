// =====================================================
// ÁREA DO ALUNO - SGE
// =====================================================

alert("ÁREA DO ALUNO CARREGADA ✅");


import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// =====================================================
// SESSÃO
// =====================================================

const dados =
    localStorage.getItem("alunoLogado");


if (!dados) {

    alert(
        "Sessão expirada. Faça login novamente."
    );

    window.location.href =
        "student-login.html";

    throw new Error(
        "Aluno não autenticado."
    );

}


const aluno =
    JSON.parse(dados);


console.log(
    "ALUNO LOGADO:",
    aluno
);


// =====================================================
// DADOS PRINCIPAIS
// =====================================================

const nomeElemento =
    document.getElementById("nomeAluno");

const codigoElemento =
    document.getElementById("codigo");

const turmaElemento =
    document.getElementById("turma");

const estadoElemento =
    document.getElementById("estado");


if (nomeElemento) {

    nomeElemento.textContent =
        aluno.nome || "Aluno";

}


if (codigoElemento) {

    codigoElemento.textContent =
        "Código: " +
        (aluno.codigoAluno || "—");

}


if (turmaElemento) {

    turmaElemento.textContent =
        "Turma: " +
        (
            aluno.turmaNome ||
            aluno.turmaId ||
            "—"
        );

}


if (estadoElemento) {

    estadoElemento.textContent =
        "Estado: " +
        (aluno.estado || "ativo");

}


// =====================================================
// VER NOTAS
// =====================================================

window.verNotas = async function () {

    try {

        // =============================================
        // DADOS DO ALUNO
        // =============================================

        const turmaId =
            String(
                aluno.turmaId || ""
            ).trim();


        const numeroAluno =
            String(
                aluno.numero || ""
            ).trim();


        if (!turmaId) {

            alert(
                "O aluno não possui turmaId."
            );

            return;

        }


        if (!numeroAluno) {

            alert(
                "O aluno não possui número cadastrado."
            );

            return;

        }


        console.log(
            "================================="
        );

        console.log(
            "PROCURANDO NOTAS"
        );

        console.log(
            "Turma ID:",
            turmaId
        );

        console.log(
            "Número do aluno:",
            numeroAluno
        );

        console.log(
            "================================="
        );


        // =============================================
        // BUSCAR DOCUMENTOS DE NOTAS
        // =============================================

        const notasSnapshot =
            await getDocs(
                collection(
                    db,
                    "notas"
                )
            );


        console.log(
            "Documentos de notas:",
            notasSnapshot.docs.map(
                doc => doc.id
            )
        );


        // =============================================
        // ARRAY FINAL DE DISCIPLINAS
        // =============================================

        const disciplinas = [];


        // =============================================
        // PERCORRER DOCUMENTOS
        // =============================================

        for (
            const notaDoc
            of notasSnapshot.docs
        ) {


            const documentoId =
                String(
                    notaDoc.id
                ).trim();


            // -----------------------------------------
            // VERIFICAR SE PERTENCE À TURMA
            // -----------------------------------------

            if (
                !(
                    documentoId === turmaId
                    ||
                    documentoId.startsWith(
                        turmaId + "_"
                    )
                )
            ) {

                continue;

            }


            console.log(
                "Documento de notas encontrado:",
                documentoId
            );


            const dadosNotas =
                notaDoc.data();


            const listaAlunos =
                Array.isArray(
                    dadosNotas.alunos
                )
                ?
                dadosNotas.alunos
                :
                [];


            console.log(
                "Quantidade de alunos:",
                listaAlunos.length
            );


            // =========================================
            // PROCURAR O ALUNO PELO NÚMERO
            // =========================================

            const registroAluno =
                listaAlunos.find(
                    item => {

                        const numero =
                            String(
                                item.numero || ""
                            ).trim();

                        return (
                            numero ===
                            numeroAluno
                        );

                    }
                );


            // =========================================
            // ALUNO ENCONTRADO
            // =========================================

            if (registroAluno) {

                console.log(
                    "ALUNO ENCONTRADO NAS NOTAS:",
                    registroAluno
                );


                // -------------------------------------
                // NOME DA DISCIPLINA
                // -------------------------------------

                let disciplina =
                    documentoId
                        .substring(
                            turmaId.length
                        )
                        .replace(
                            /^_/,
                            ""
                        );


                // -------------------------------------
                // REMOVER _1, _2, ETC.
                // -------------------------------------

                disciplina =
                    disciplina.replace(
                        /_\d+$/,
                        ""
                    );


                // -------------------------------------
                // GUARDAR NOTA
                // -------------------------------------

                disciplinas.push({

                    disciplina:
                        disciplina,

                    MAC:
                        registroAluno.MAC ?? "",

                    NPT:
                        registroAluno.NPT ?? "",

                    MF:
                        registroAluno.MF ?? "",

                    classificacao:
                        registroAluno.classificacao ||
                        ""

                });

            }

        }


        // =============================================
        // NENHUMA NOTA
        // =============================================

        if (
            disciplinas.length === 0
        ) {

            alert(

                "Ainda não existem notas para este aluno.\n\n" +

                "Turma: " +
                turmaId +

                "\nNúmero: " +
                numeroAluno

            );

            return;

        }


        console.log(
            "DISCIPLINAS:",
            disciplinas
        );


        // =================================================
        // CRIAR JANELA
        // =================================================

        let html = `

        <div
            id="janelaNotas"

            style="
                position:fixed;
                inset:0;
                z-index:99999;
                background:#f1f5f9;
                overflow-y:auto;
            "
        >

            <div
                style="
                    width:95%;
                    max-width:1000px;
                    margin:auto;
                    padding:20px 0 40px;
                "
            >

                <div
                    style="
                        background:#1e3a8a;
                        color:white;
                        padding:25px;
                        border-radius:15px;
                        text-align:center;
                        box-shadow:0 3px 10px rgba(0,0,0,.15);
                    "
                >

                    <div
                        style="
                            font-size:45px;
                        "
                    >
                        📊
                    </div>

                    <h2
                        style="
                            margin:5px 0;
                        "
                    >
                        Minhas Notas
                    </h2>

                    <p>
                        ${aluno.nome || ""}
                    </p>

                </div>


                <div
                    style="
                        background:white;
                        margin-top:15px;
                        padding:18px;
                        border-radius:12px;
                    "
                >

                    <strong>
                        Código:
                    </strong>

                    ${aluno.codigoAluno || "—"}

                    <br><br>

                    <strong>
                        Número:
                    </strong>

                    ${numeroAluno}

                    <br><br>

                    <strong>
                        Turma:
                    </strong>

                    ${aluno.turmaNome || turmaId}

                </div>


                <div
                    style="
                        background:white;
                        margin-top:15px;
                        padding:15px;
                        border-radius:12px;
                        overflow-x:auto;
                    "
                >

                    <table
                        style="
                            width:100%;
                            min-width:700px;
                            border-collapse:collapse;
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
                                    Disciplina
                                </th>

                                <th
                                    style="padding:13px;"
                                >
                                    MAC
                                </th>

                                <th
                                    style="padding:13px;"
                                >
                                    NPT
                                </th>

                                <th
                                    style="padding:13px;"
                                >
                                    MF
                                </th>

                                <th
                                    style="padding:13px;"
                                >
                                    Classificação
                                </th>

                            </tr>

                        </thead>


                        <tbody>
        `;


        // =============================================
        // LINHAS
        // =============================================

        disciplinas.forEach(
            item => {

                html += `

                    <tr>

                        <td
                            style="
                                padding:13px;
                                border-bottom:1px solid #e2e8f0;
                                font-weight:bold;
                            "
                        >
                            ${item.disciplina}
                        </td>


                        <td
                            style="
                                padding:13px;
                                text-align:center;
                                border-bottom:1px solid #e2e8f0;
                            "
                        >
                            ${item.MAC}
                        </td>


                        <td
                            style="
                                padding:13px;
                                text-align:center;
                                border-bottom:1px solid #e2e8f0;
                            "
                        >
                            ${item.NPT}
                        </td>


                        <td
                            style="
                                padding:13px;
                                text-align:center;
                                border-bottom:1px solid #e2e8f0;
                                font-weight:bold;
                            "
                        >
                            ${item.MF}
                        </td>


                        <td
                            style="
                                padding:13px;
                                text-align:center;
                                border-bottom:1px solid #e2e8f0;
                                font-weight:bold;
                            "
                        >
                            ${item.classificacao}
                        </td>

                    </tr>

                `;

            }
        );


        html += `

                        </tbody>

                    </table>

                </div>


                <button
                    id="fecharNotas"

                    style="
                        width:100%;
                        padding:14px;
                        margin-top:15px;
                        background:#dc2626;
                        color:white;
                        border:none;
                        border-radius:8px;
                        font-size:16px;
                    "
                >

                    ← Voltar

                </button>

            </div>

        </div>

        `;


        document.body.insertAdjacentHTML(
            "beforeend",
            html
        );


        const fechar =
            document.getElementById(
                "fecharNotas"
            );


        if (fechar) {

            fechar.onclick =
                function () {

                    const janela =
                        document.getElementById(
                            "janelaNotas"
                        );


                    if (janela) {

                        janela.remove();

                    }

                };

        }

    }


    catch (error) {

        console.error(
            "ERRO AO CARREGAR NOTAS:",
            error
        );


        alert(

            "Erro ao carregar notas:\n\n" +
            error.message

        );

    }

};


// =====================================================
// BOLETIM
// =====================================================

window.verBoletim =
function () {

    alert(
        "📄 O módulo de boletim será ligado depois."
    );

};


// =====================================================
// DADOS PESSOAIS
// =====================================================

window.verDados =
function () {

    alert(

        "👤 DADOS DO ALUNO\n\n" +

        "Nome: " +
        (aluno.nome || "—") +

        "\n\nCódigo: " +
        (aluno.codigoAluno || "—") +

        "\n\nNúmero: " +
        (aluno.numero || "—") +

        "\n\nSexo: " +
        (aluno.sexo || "—") +

        "\n\nTurma: " +
        (
            aluno.turmaNome ||
            aluno.turmaId ||
            "—"
        ) +

        "\n\nEstado: " +
        (aluno.estado || "—")

    );

};


// =====================================================
// ALTERAR SENHA
// =====================================================

window.alterarSenha =
function () {

    alert(
        "🔐 Alteração de senha será adicionada depois."
    );

};


// =====================================================
// SAIR
// =====================================================

window.sairAluno =
function () {

    if (
        !confirm(
            "Deseja realmente sair?"
        )
    ) {

        return;

    }


    localStorage.removeItem(
        "alunoLogado"
    );


    window.location.href =
        "student-login.html";

};
