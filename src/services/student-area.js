alert("Seja Bem-vindo a Sua Área");

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


/* =====================================================
   SESSÃO DO ALUNO
===================================================== */

const dados =
    localStorage.getItem("alunoLogado");


if (!dados) {

    alert(
        "Sessão expirada. Faça login novamente."
    );

    window.location.href =
        "student-login.html";

    throw new Error("Aluno não autenticado.");

}


const aluno =
    JSON.parse(dados);


/* =====================================================
   DADOS PRINCIPAIS
===================================================== */

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
        (aluno.turmaNome || "—");

}


if (estadoElemento) {

    estadoElemento.textContent =
        "Estado: " +
        (aluno.estado || "ativo");

}


/* =====================================================
   VER NOTAS
===================================================== */

window.verNotas = async function () {

    try {

        /* ---------------------------------------------
           DADOS DO ALUNO
        --------------------------------------------- */

        const turmaId =
            String(
                aluno.turmaId || ""
            ).trim();


        const numeroAluno =
            String(
                aluno.numero || ""
            ).trim();


        const codigoAluno =
            String(
                aluno.codigoAluno || ""
            ).trim();


        if (!turmaId) {

            alert(
                "Erro: o aluno não possui turmaId."
            );

            console.log(
                "Aluno guardado:",
                aluno
            );

            return;

        }


        if (!numeroAluno && !codigoAluno) {

            alert(
                "Erro: o aluno não possui número nem código."
            );

            console.log(
                "Aluno guardado:",
                aluno
            );

            return;

        }


        /* ---------------------------------------------
           CARREGAR NOTAS
        --------------------------------------------- */

        const notasSnapshot =
            await getDocs(
                collection(
                    db,
                    "notas"
                )
            );


        console.log(
            "turmaId do aluno:",
            turmaId
        );


        console.log(
            "Documentos encontrados em notas:",
            notasSnapshot.docs.map(
                doc => doc.id
            )
        );


        let alunoNotas = null;

        let documentoEncontrado = null;


        /* ---------------------------------------------
           PROCURAR DOCUMENTO DA TURMA
        --------------------------------------------- */

        for (
            const notaDoc
            of notasSnapshot.docs
        ) {

            const id =
                String(
                    notaDoc.id
                ).trim();


            /*
             Formatos aceites:

             9J72ODfrMBWnkOG3rkIo

             ou

             9J72ODfrMBWnkOG3rkIo_qualquer-coisa
            */

            const pertenceATurma =
                id === turmaId ||
                id.startsWith(
                    turmaId + "_"
                );


            if (!pertenceATurma) {

                continue;

            }


            documentoEncontrado =
                notaDoc;


            const dadosNotas =
                notaDoc.data();


            const listaAlunos =
                Array.isArray(
                    dadosNotas.alunos
                )
                ? dadosNotas.alunos
                : [];


            console.log(
                "Lista de alunos encontrada:",
                listaAlunos
            );


            /* -----------------------------------------
               PROCURAR PELO NÚMERO
            ----------------------------------------- */

            if (numeroAluno) {

                alunoNotas =
                    listaAlunos.find(
                        item =>
                            String(
                                item.numero || ""
                            ).trim()
                            ===
                            numeroAluno
                    );

            }


            /* -----------------------------------------
               SE NÃO ENCONTRAR, PROCURAR PELO CÓDIGO
            ----------------------------------------- */

            if (!alunoNotas && codigoAluno) {

                alunoNotas =
                    listaAlunos.find(
                        item =>
                            String(
                                item.codigoAluno || ""
                            ).trim()
                            ===
                            codigoAluno
                    );

            }


            /* -----------------------------------------
               SE ENCONTROU, PARAR
            ----------------------------------------- */

            if (alunoNotas) {

                break;

            }

        }


        /* ---------------------------------------------
           TURMA NÃO ENCONTRADA
        --------------------------------------------- */

        if (!documentoEncontrado) {

            alert(
                "Não foi encontrado o documento de notas desta turma.\n\n" +

                "turmaId do aluno:\n" +

                turmaId
            );

            return;

        }


        /* ---------------------------------------------
           ALUNO NÃO ENCONTRADO
        --------------------------------------------- */

        if (!alunoNotas) {

            alert(
                "A turma possui notas, mas o aluno não foi encontrado.\n\n" +

                "Número procurado: " +
                numeroAluno +

                "\nCódigo procurado: " +
                codigoAluno
            );

            return;

        }


        console.log(
            "Notas do aluno:",
            alunoNotas
        );


        /* ---------------------------------------------
           IDENTIFICAR DISCIPLINAS
        --------------------------------------------- */

        const disciplinas = [];


        for (
            const chave
            of Object.keys(
                alunoNotas
            )
        ) {


            /*
             Campos pessoais não são disciplinas
            */

            if (
                chave === "nome" ||
                chave === "numero" ||
                chave === "codigoAluno" ||
                chave === "senhaAcesso" ||
                chave === "sexo" ||
                chave === "estado"
            ) {

                continue;

            }


            const nota =
                alunoNotas[chave];


            /*
             Uma disciplina precisa possuir
             pelo menos MAC, NPT ou MF
            */

            if (
                nota &&
                typeof nota === "object" &&
                (
                    Object.prototype.hasOwnProperty.call(
                        nota,
                        "MAC"
                    )
                    ||
                    Object.prototype.hasOwnProperty.call(
                        nota,
                        "NPT"
                    )
                    ||
                    Object.prototype.hasOwnProperty.call(
                        nota,
                        "MF"
                    )
                )
            ) {


                disciplinas.push({

                    nome:
                        chave,

                    MAC:
                        nota.MAC ?? "",

                    NPT:
                        nota.NPT ?? "",

                    MF:
                        nota.MF ?? "",

                    classificacao:
                        nota.classificacao ?? ""

                });

            }

        }


        /* ---------------------------------------------
           NENHUMA DISCIPLINA
        --------------------------------------------- */

        if (
            disciplinas.length === 0
        ) {

            alert(
                "O aluno foi encontrado, mas nenhuma disciplina com notas foi encontrada."
            );

            console.log(
                "Registro do aluno:",
                alunoNotas
            );

            return;

        }


        /* =================================================
           JANELA DE NOTAS
        ================================================= */

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
                    max-width:900px;
                    margin:0 auto;
                    padding:20px 0 40px;
                "
            >


                <!-- CABEÇALHO -->

                <div
                    style="
                        background:#1e3a8a;
                        color:white;
                        padding:20px;
                        border-radius:15px;
                        text-align:center;
                        box-shadow:0 3px 10px rgba(0,0,0,.15);
                    "
                >

                    <div
                        style="
                            font-size:40px;
                            margin-bottom:5px;
                        "
                    >
                        📊
                    </div>

                    <h2
                        style="
                            margin:0;
                        "
                    >
                        Minhas Notas
                    </h2>

                    <p
                        style="
                            margin:8px 0 0;
                        "
                    >
                        ${aluno.nome || ""}
                    </p>

                </div>


                <!-- INFORMAÇÕES -->

                <div
                    style="
                        background:white;
                        margin-top:15px;
                        padding:15px;
                        border-radius:12px;
                        box-shadow:0 3px 10px rgba(0,0,0,.08);
                    "
                >

                    <strong>
                        Código:
                    </strong>

                    ${aluno.codigoAluno || "—"}

                    <br>

                    <strong>
                        Turma:
                    </strong>

                    ${aluno.turmaNome || "—"}

                </div>


                <!-- TABELA -->

                <div
                    style="
                        background:white;
                        margin-top:15px;
                        padding:15px;
                        border-radius:12px;
                        box-shadow:0 3px 10px rgba(0,0,0,.08);
                        overflow-x:auto;
                    "
                >

                    <table
                        style="
                            width:100%;
                            min-width:650px;
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
                                        padding:12px;
                                        text-align:left;
                                    "
                                >
                                    Disciplina
                                </th>

                                <th
                                    style="
                                        padding:12px;
                                    "
                                >
                                    MAC
                                </th>

                                <th
                                    style="
                                        padding:12px;
                                    "
                                >
                                    NPT
                                </th>

                                <th
                                    style="
                                        padding:12px;
                                    "
                                >
                                    MF
                                </th>

                                <th
                                    style="
                                        padding:12px;
                                    "
                                >
                                    Classificação
                                </th>

                            </tr>

                        </thead>


                        <tbody>
        `;


        /* ---------------------------------------------
           LINHAS
        --------------------------------------------- */

        disciplinas.forEach(
            disciplina => {

                html += `

                    <tr>

                        <td
                            style="
                                padding:12px;
                                border-bottom:1px solid #e2e8f0;
                                font-weight:bold;
                            "
                        >
                            ${disciplina.nome}
                        </td>


                        <td
                            style="
                                padding:12px;
                                text-align:center;
                                border-bottom:1px solid #e2e8f0;
                            "
                        >
                            ${disciplina.MAC}
                        </td>


                        <td
                            style="
                                padding:12px;
                                text-align:center;
                                border-bottom:1px solid #e2e8f0;
                            "
                        >
                            ${disciplina.NPT}
                        </td>


                        <td
                            style="
                                padding:12px;
                                text-align:center;
                                border-bottom:1px solid #e2e8f0;
                                font-weight:bold;
                            "
                        >
                            ${disciplina.MF}
                        </td>


                        <td
                            style="
                                padding:12px;
                                text-align:center;
                                border-bottom:1px solid #e2e8f0;
                                font-weight:bold;
                            "
                        >
                            ${disciplina.classificacao}
                        </td>

                    </tr>

                `;

            }
        );


        html += `

                        </tbody>

                    </table>

                </div>


                <!-- VOLTAR -->

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
                        cursor:pointer;
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
            "Erro ao carregar notas:",
            error
        );


        alert(
            "Erro ao carregar notas:\n\n" +
            error.message
        );

    }

};


/* =====================================================
   VER BOLETIM
===================================================== */

window.verBoletim =
function () {

    alert(
        "📄 Boletim\n\n" +
        "O módulo de boletim será ligado depois."
    );

};


/* =====================================================
   DADOS PESSOAIS
===================================================== */

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
        (aluno.turmaNome || "—") +

        "\n\nEstado: " +
        (aluno.estado || "—")

    );

};


/* =====================================================
   ALTERAR SENHA
===================================================== */

window.alterarSenha =
function () {

    alert(
        "🔐 Alterar senha\n\n" +
        "Esta função será ligada ao Firestore."
    );

};


/* =====================================================
   SAIR
===================================================== */

window.sairAluno =
function () {

    const confirmar =
        confirm(
            "Deseja realmente sair da sua conta?"
        );


    if (!confirmar) {

        return;

    }


    localStorage.removeItem(
        "alunoLogado"
    );


    window.location.href =
        "student-login.html";

};
