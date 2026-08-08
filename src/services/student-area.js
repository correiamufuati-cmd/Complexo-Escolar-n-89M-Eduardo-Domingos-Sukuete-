alert("Seja Bem-vindo");

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


/* =====================================================
   ÁREA DO ALUNO
===================================================== */

alert("Seja Bem-vindo a Sua Área");


/* =====================================================
   RECUPERAR SESSÃO
===================================================== */

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


/* =====================================================
   MOSTRAR DADOS DO ALUNO
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


        /* =============================================
           DADOS PARA LOCALIZAR O ALUNO
        ============================================= */

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
                "Aluno:",
                aluno
            );

            return;

        }


        if (!numeroAluno && !codigoAluno) {

            alert(
                "Erro: o aluno não possui número nem código."
            );

            return;

        }


        /* =============================================
           MENSAGEM DE CARREGAMENTO
        ============================================= */

        alert(
            "A carregar as suas notas..."
        );


        /* =============================================
           BUSCAR DOCUMENTOS DA COLEÇÃO NOTAS
        ============================================= */

        const notasSnapshot =
            await getDocs(
                collection(
                    db,
                    "notas"
                )
            );


        console.log(
            "ID DA TURMA:",
            turmaId
        );


        console.log(
            "DOCUMENTOS DE NOTAS:",
            notasSnapshot.docs.map(
                doc => doc.id
            )
        );


        /* =============================================
           ARRAY FINAL DE NOTAS
        ============================================= */

        const minhasNotas = [];


        /* =============================================
           PERCORRER TODOS OS DOCUMENTOS DE NOTAS
        ============================================= */

        for (
            const notaDoc
            of notasSnapshot.docs
        ) {


            const documentoId =
                String(
                    notaDoc.id
                ).trim();


            /*
            Exemplo:

            9J72ODfrMBWnkOG3rkIo_Língua Portuguesa_1

            Portanto verificamos se começa
            pelo ID da turma.
            */

            if (
                !documentoId.startsWith(
                    turmaId + "_"
                )
            ) {

                continue;

            }


            const dadosNotas =
                notaDoc.data();


            /* =========================================
               DESCOBRIR O NOME DA DISCIPLINA
            ========================================= */

            let disciplina =
                documentoId.substring(
                    turmaId.length + 1
                );


            /*
            Se existir "_1", "_2", etc.,
            retiramos apenas esse número final.
            */

            disciplina =
                disciplina.replace(
                    /_\d+$/,
                    ""
                );


            /* =========================================
               LISTA DE ALUNOS DO DOCUMENTO
            ========================================= */

            const listaAlunos =
                Array.isArray(
                    dadosNotas.alunos
                )
                ? dadosNotas.alunos
                : [];


            /* =========================================
               PROCURAR O ALUNO
            ========================================= */

            let alunoEncontrado =
                null;


            /*
            Primeiro pelo número
            */

            if (numeroAluno) {

                alunoEncontrado =
                    listaAlunos.find(
                        item =>
                            String(
                                item.numero || ""
                            ).trim()
                            ===
                            numeroAluno
                    );

            }


            /*
            Se não encontrou pelo número,
            tenta pelo código.
            */

            if (
                !alunoEncontrado &&
                codigoAluno
            ) {

                alunoEncontrado =
                    listaAlunos.find(
                        item =>
                            String(
                                item.codigoAluno || ""
                            ).trim()
                            ===
                            codigoAluno
                    );

            }


            /* =========================================
               SE ENCONTROU, GUARDAR NOTA
            ========================================= */

            if (alunoEncontrado) {


                minhasNotas.push({

                    disciplina:
                        disciplina,

                    MAC:
                        alunoEncontrado.MAC ?? "",

                    NPT:
                        alunoEncontrado.NPT ?? "",

                    MF:
                        alunoEncontrado.MF ?? "",

                    classificacao:
                        alunoEncontrado.classificacao || ""

                });


            }


        }


        /* =============================================
           VERIFICAR SE ENCONTROU NOTAS
        ============================================= */

        if (
            minhasNotas.length === 0
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
            "NOTAS DO ALUNO:",
            minhasNotas
        );


        /* =============================================
           CRIAR JANELA
        ============================================= */

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
                    margin:auto;
                    padding:20px 0 40px;
                "
            >


                <!-- CABEÇALHO -->

                <div
                    style="
                        background:#1e3a8a;
                        color:white;
                        padding:25px;
                        border-radius:15px;
                        text-align:center;
                        box-shadow:0 4px 12px rgba(0,0,0,.15);
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


                    <p
                        style="
                            margin:5px 0 0;
                        "
                    >
                        ${aluno.nome || ""}
                    </p>

                </div>


                <!-- INFORMAÇÕES -->

                <div
                    style="
                        background:white;
                        padding:15px;
                        margin-top:15px;
                        border-radius:12px;
                        box-shadow:0 3px 10px rgba(0,0,0,.08);
                    "
                >

                    <strong>
                        Código:
                    </strong>

                    ${aluno.codigoAluno || "—"}

                    <br><br>

                    <strong>
                        Turma:
                    </strong>

                    ${aluno.turmaNome || "—"}

                </div>


                <!-- TABELA -->

                <div
                    style="
                        background:white;
                        padding:15px;
                        margin-top:15px;
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


        /* =============================================
           ADICIONAR DISCIPLINAS
        ============================================= */

        minhasNotas.forEach(
            nota => {


                html += `

                <tr>


                    <td
                        style="
                            padding:12px;
                            border-bottom:1px solid #e2e8f0;
                            font-weight:bold;
                        "
                    >
                        ${nota.disciplina}
                    </td>


                    <td
                        style="
                            padding:12px;
                            text-align:center;
                            border-bottom:1px solid #e2e8f0;
                        "
                    >
                        ${nota.MAC}
                    </td>


                    <td
                        style="
                            padding:12px;
                            text-align:center;
                            border-bottom:1px solid #e2e8f0;
                        "
                    >
                        ${nota.NPT}
                    </td>


                    <td
                        style="
                            padding:12px;
                            text-align:center;
                            border-bottom:1px solid #e2e8f0;
                            font-weight:bold;
                        "
                    >
                        ${nota.MF}
                    </td>


                    <td
                        style="
                            padding:12px;
                            text-align:center;
                            border-bottom:1px solid #e2e8f0;
                        "
                    >
                        ${nota.classificacao}
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


        /* =============================================
           BOTÃO VOLTAR
        ============================================= */

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
            "Erro ao carregar as notas:\n\n" +
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
        "📄 O boletim será apresentado aqui."
    );

};


/* =====================================================
   VER DADOS
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
        "🔐 A alteração de senha será implementada aqui."
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
