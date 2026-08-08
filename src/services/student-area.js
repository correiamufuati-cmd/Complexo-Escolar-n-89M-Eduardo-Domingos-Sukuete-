alert("df");

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";



/* =========================================
   VERIFICAR ALUNO LOGADO
========================================= */

const dados =
    localStorage.getItem("alunoLogado");


if (!dados) {

    window.location.href =
        "student-login.html";

    throw new Error(
        "Aluno não autenticado."
    );

}


const aluno =
    JSON.parse(dados);



/* =========================================
   MOSTRAR DADOS PRINCIPAIS
========================================= */

document.getElementById("nomeAluno").textContent =
    aluno.nome || "Aluno";


document.getElementById("codigo").textContent =
    "Código: " +
    (aluno.codigoAluno || "—");


document.getElementById("turma").textContent =
    "Turma: " +
    (aluno.turmaNome || "—");


document.getElementById("estado").textContent =
    "Estado: " +
    (aluno.estado || "ativo");



/* =========================================
   VER NOTAS
========================================= */

window.verNotas = async function () {


    try {


        alert(
            "A procurar as notas do aluno..."
        );


        /* ===============================
           BUSCAR DOCUMENTO DA TURMA
        =============================== */

        const notasRef =
            collection(db, "notas");


        const notasSnapshot =
            await getDocs(notasRef);


        let encontrou = false;

        let disciplinas = [];



        /* ===============================
           PERCORRER DOCUMENTOS DE NOTAS
        =============================== */

        for (
            const notaDoc
            of notasSnapshot.docs
        ) {


            /* O ID do documento deve ser o turmaId */

            if (
                notaDoc.id !== aluno.turmaId
            ) {

                continue;

            }


            encontrou = true;


            const dadosNotas =
                notaDoc.data();


            const listaAlunos =
                dadosNotas.alunos || [];



            /* ============================
               PROCURAR O ALUNO
            ============================ */

            let alunoNotas = null;


            for (
                const item
                of listaAlunos
            ) {


                if (

                    String(item.numero)
                    .trim()

                    ===

                    String(aluno.numero)
                    .trim()

                ) {

                    alunoNotas = item;

                    break;

                }

            }



            /* ============================
               CASO NÃO ENCONTRE PELO NÚMERO
            ============================ */

            if (!alunoNotas) {


                for (
                    const item
                    of listaAlunos
                ) {


                    if (

                        String(item.codigoAluno || "")
                        .trim()

                        ===

                        String(aluno.codigoAluno || "")
                        .trim()

                    ) {

                        alunoNotas = item;

                        break;

                    }

                }

            }



            if (!alunoNotas) {

                alert(
                    "As notas da turma foram encontradas, mas o aluno não foi localizado."
                );

                return;

            }



            /* ============================
               LER DISCIPLINAS
            ============================ */

            for (
                const chave
                of Object.keys(alunoNotas)
            ) {


                /* Ignorar dados pessoais */

                if (

                    chave === "nome" ||
                    chave === "numero" ||
                    chave === "codigoAluno"

                ) {

                    continue;

                }



                const nota =
                    alunoNotas[chave];


                if (
                    nota &&
                    typeof nota === "object" &&
                    (
                        "MAC" in nota ||
                        "NPT" in nota ||
                        "MF" in nota
                    )
                ) {


                    disciplinas.push({

                        nome: chave,

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


            break;

        }



        /* =================================
           NÃO ENCONTROU DOCUMENTO
        ================================= */

        if (!encontrou) {

            alert(
                "Ainda não existem notas para esta turma."
            );

            return;

        }



        /* =================================
           NÃO EXISTEM DISCIPLINAS
        ================================= */

        if (
            disciplinas.length === 0
        ) {

            alert(
                "Não foram encontradas disciplinas para este aluno."
            );

            return;

        }



        /* =================================
           CONSTRUIR JANELA DE NOTAS
        ================================= */

        let conteudo = `

        <div id="janelaNotas"
        style="

        position:fixed;
        inset:0;
        background:#f1f5f9;
        z-index:9999;
        overflow:auto;

        ">


        <div style="

        max-width:900px;
        margin:auto;
        padding:20px;

        ">


        <div style="

        background:#1e3a8a;
        color:white;
        padding:18px;
        border-radius:12px;
        text-align:center;

        ">

        <h2 style="margin:0;">
        📊 Minhas Notas
        </h2>

        <p style="margin:8px 0 0;">
        ${aluno.nome || ""}
        </p>

        </div>



        <div style="

        background:white;
        margin-top:15px;
        padding:15px;
        border-radius:12px;
        box-shadow:0 3px 10px rgba(0,0,0,.10);
        overflow-x:auto;

        ">


        <table style="

        width:100%;
        border-collapse:collapse;
        min-width:600px;

        ">


        <thead>

        <tr style="
        background:#e2e8f0;
        ">

        <th style="padding:10px;">
        Disciplina
        </th>

        <th style="padding:10px;">
        MAC
        </th>

        <th style="padding:10px;">
        NPT
        </th>

        <th style="padding:10px;">
        MF
        </th>

        <th style="padding:10px;">
        Classificação
        </th>

        </tr>

        </thead>


        <tbody>
        `;



        disciplinas.forEach(
            disciplina => {


                let classificacao =
                    disciplina.classificacao ||
                    "";


                let cor = "#334155";


                if (
                    classificacao === "Mau" ||
                    classificacao === "Medíocre"
                ) {

                    cor = "red";

                }


                conteudo += `

                <tr>

                <td style="
                padding:10px;
                border-bottom:1px solid #e2e8f0;
                font-weight:bold;
                ">

                ${disciplina.nome}

                </td>


                <td style="
                padding:10px;
                text-align:center;
                border-bottom:1px solid #e2e8f0;
                ">

                ${disciplina.MAC}

                </td>


                <td style="
                padding:10px;
                text-align:center;
                border-bottom:1px solid #e2e8f0;
                ">

                ${disciplina.NPT}

                </td>


                <td style="
                padding:10px;
                text-align:center;
                border-bottom:1px solid #e2e8f0;
                font-weight:bold;
                ">

                ${disciplina.MF}

                </td>


                <td style="
                padding:10px;
                text-align:center;
                border-bottom:1px solid #e2e8f0;
                color:${cor};
                font-weight:bold;
                ">

                ${classificacao}

                </td>


                </tr>

                `;

            }
        );



        conteudo += `

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

        ">

        ← Voltar

        </button>


        </div>

        </div>

        `;



        document.body.insertAdjacentHTML(
            "beforeend",
            conteudo
        );



        document
        .getElementById("fecharNotas")
        .onclick = function () {

            document
            .getElementById("janelaNotas")
            .remove();

        };


    }

    catch (error) {


        console.error(
            "Erro ao carregar notas:",
            error
        );


        alert(
            "Erro ao carregar as notas:\n\n" +
            error.message
        );

    }

};



/* =========================================
   BOLETIM
========================================= */

window.verBoletim = function () {

    alert(
        "📄 Boletim\n\n" +
        "Vamos trabalhar o boletim depois das notas."
    );

};



/* =========================================
   DADOS PESSOAIS
========================================= */

window.verDados = function () {


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



/* =========================================
   ALTERAR SENHA
========================================= */

window.alterarSenha = function () {

    alert(
        "🔐 Alterar senha\n\n" +
        "Vamos implementar esta função depois."
    );

};



/* =========================================
   SAIR
========================================= */

window.sairAluno = function () {


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
