alert("ÁREA DO ALUNO DF CARREGADA ✅");

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


/* =====================================================
   SESSÃO DO ALUNO
===================================================== */

const dados = localStorage.getItem("alunoLogado");

if (!dados) {

    alert("Sessão expirada. Faça login novamente.");

    window.location.href = "student-login.html";

    throw new Error("Aluno não autenticado.");

}

const aluno = JSON.parse(dados);


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
        "Código: " + (aluno.codigoAluno || "—");
}

if (turmaElemento) {
    turmaElemento.textContent =
        "Turma: " + (aluno.turmaNome || "—");
}

if (estadoElemento) {
    estadoElemento.textContent =
        "Estado: " + (aluno.estado || "ativo");
}


/* =====================================================
   VER NOTAS
===================================================== */

window.verNotas = async function () {

    try {

        const turmaId =
            String(aluno.turmaId || "").trim();

        const numeroAluno =
            String(aluno.numero || "").trim();

        const nomeAluno =
            String(aluno.nome || "").trim();


        if (!turmaId) {

            alert(
                "Erro: não foi encontrada a turma do aluno."
            );

            console.log("Aluno:", aluno);

            return;
        }


        if (!numeroAluno && !nomeAluno) {

            alert(
                "Erro: não foi encontrado o número do aluno."
            );

            console.log("Aluno:", aluno);

            return;
        }


        /* =================================================
           CARREGAR TODOS OS DOCUMENTOS DE NOTAS
        ================================================= */

        const notasSnapshot =
            await getDocs(
                collection(db, "notas")
            );


        /*
        Estrutura final:

        disciplinas = {

            "Língua Portuguesa": {

                "1": {...},

                "2": {...},

                "3": {...}

            },

            "Matemática": {

                "1": {...},

                "2": {...}

            }

        }
        */

        const disciplinas = {};


        let encontrouDocumentoDaTurma = false;


        /* =================================================
           PERCORRER DOCUMENTOS
        ================================================= */

        for (
            const notaDoc
            of notasSnapshot.docs
        ) {

            const id =
                String(notaDoc.id).trim();


            const dadosNota =
                notaDoc.data();


            /*
            O documento precisa pertencer à turma.

            Exemplos:

            turmaId_Língua Portuguesa_1
            turmaId_Língua Portuguesa_2
            turmaId_Língua Portuguesa_3
            */

            if (
                !id.startsWith(
                    turmaId + "_"
                )
            ) {

                continue;

            }


            encontrouDocumentoDaTurma = true;


            /* =================================================
               DESCOBRIR O TRIMESTRE
            ================================================= */

            let trimestre = "";


            if (id.endsWith("_1")) {

                trimestre = "1";

            }
            else if (id.endsWith("_2")) {

                trimestre = "2";

            }
            else if (id.endsWith("_3")) {

                trimestre = "3";

            }
            else {

                /*
                Se o documento não terminar em
                _1, _2 ou _3, ignorar.
                */

                continue;

            }


            /* =================================================
               DISCIPLINA
            ================================================= */

            let disciplina =
                String(
                    dadosNota.disciplina || ""
                ).trim();


            /*
            Se o campo disciplina não existir,
            retirar turmaId e trimestre do ID.
            */

            if (!disciplina) {

                disciplina =
                    id
                    .substring(
                        (turmaId + "_").length
                    )
                    .replace(
                        new RegExp(
                            "_" + trimestre + "$"
                        ),
                        ""
                    );

            }


            if (!disciplina) {

                disciplina =
                    "Disciplina";

            }


            /* =================================================
               LISTA DE ALUNOS
            ================================================= */

            const listaAlunos =
                Array.isArray(
                    dadosNota.alunos
                )
                ? dadosNota.alunos
                : [];


            /*
            Procurar primeiro pelo número.
            */

            let alunoNotas = null;


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


            /*
            Se não encontrar pelo número,
            procurar pelo nome.
            */

            if (!alunoNotas && nomeAluno) {

                alunoNotas =
                    listaAlunos.find(
                        item =>
                            String(
                                item.nome || ""
                            ).trim()
                            .toLowerCase()
                            ===
                            nomeAluno
                            .trim()
                            .toLowerCase()
                    );

            }


            if (!alunoNotas) {

                continue;

            }


            /* =================================================
               CRIAR DISCIPLINA
            ================================================= */

            if (!disciplinas[disciplina]) {

                disciplinas[disciplina] = {};

            }


            /* =================================================
               GUARDAR NOTAS DO TRIMESTRE
            ================================================= */

            disciplinas[disciplina][trimestre] = {

                MAC:
                    alunoNotas.MAC ?? "",

                NPT:
                    alunoNotas.NPT ?? "",

                MF:
                    alunoNotas.MF ?? "",

                classificacao:
                    alunoNotas.classificacao ?? ""

            };

        }


        /* =================================================
           VERIFICAR SE EXISTEM NOTAS
        ================================================= */

        if (!encontrouDocumentoDaTurma) {

            alert(
                "Ainda não existem notas para esta turma."
            );

            return;

        }


        const nomesDisciplinas =
            Object.keys(disciplinas);


        if (
            nomesDisciplinas.length === 0
        ) {

            alert(
                "Ainda não existem notas para este aluno."
            );

            return;

        }


        /* =================================================
           CRIAR JANELA
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
                    max-width:950px;
                    margin:auto;
                    padding:20px 0 40px;
                "
            >


                <!-- CABEÇALHO -->

                <div
                    style="
                        background:#1e3a8a;
                        color:white;
                        padding:22px;
                        border-radius:15px;
                        text-align:center;
                        box-shadow:0 3px 10px rgba(0,0,0,.15);
                    "
                >

                    <div
                        style="
                            font-size:40px;
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
                            margin:5px 0;
                        "
                    >
                        ${aluno.nome || ""}
                    </p>

                    <p
                        style="
                            margin:5px 0;
                        "
                    >
                        Código:
                        ${aluno.codigoAluno || "—"}
                    </p>

                    <p
                        style="
                            margin:5px 0;
                        "
                    >
                        Turma:
                        ${aluno.turmaNome || "—"}
                    </p>

                </div>


                <!-- FILTRO -->

                <div
                    style="
                        background:white;
                        margin-top:15px;
                        padding:15px;
                        border-radius:12px;
                        box-shadow:0 3px 10px rgba(0,0,0,.08);
                    "
                >

                    <label
                        style="
                            display:block;
                            font-weight:bold;
                            margin-bottom:7px;
                            color:#334155;
                        "
                    >
                        Ver trimestre:
                    </label>


                    <select
                        id="filtroTrimestre"
                        style="
                            width:100%;
                            padding:12px;
                            border:1px solid #cbd5e1;
                            border-radius:8px;
                            font-size:16px;
                        "
                    >

                        <option value="todos">
                            Todos os trimestres
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

                    </select>

                </div>


                <!-- NOTAS -->

                <div
                    id="conteudoNotas"
                    style="
                        margin-top:15px;
                    "
                >

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


        /* =================================================
           RENDERIZAR NOTAS
        ================================================= */

        function renderizarNotas(filtro = "todos") {

            const conteudo =
                document.getElementById(
                    "conteudoNotas"
                );


            if (!conteudo) {
                return;
            }


            let resultado = "";


            for (
                const disciplina
                of nomesDisciplinas
            ) {

                const notasDisciplina =
                    disciplinas[disciplina];


                /*
                Verificar se a disciplina possui
                o trimestre selecionado.
                */

                if (
                    filtro !== "todos" &&
                    !notasDisciplina[filtro]
                ) {

                    continue;

                }


                resultado += `

                <div
                    style="
                        background:white;
                        margin-bottom:18px;
                        border-radius:14px;
                        overflow:hidden;
                        box-shadow:0 3px 10px rgba(0,0,0,.08);
                    "
                >

                    <div
                        style="
                            background:#1e3a8a;
                            color:white;
                            padding:15px;
                            font-size:18px;
                            font-weight:bold;
                        "
                    >

                        📚 ${disciplina}

                    </div>

                `;


                const trimestres =
                    filtro === "todos"
                    ? ["1","2","3"]
                    : [filtro];


                for (
                    const numeroTrimestre
                    of trimestres
                ) {

                    const nota =
                        notasDisciplina[
                            numeroTrimestre
                        ];


                    if (!nota) {

                        continue;

                    }


                    resultado += `

                    <div
                        style="
                            padding:15px;
                            border-bottom:1px solid #e2e8f0;
                        "
                    >

                        <h3
                            style="
                                margin:0 0 12px;
                                color:#1e3a8a;
                            "
                        >

                            ${numeroTrimestre}.º Trimestre

                        </h3>


                        <div
                            style="
                                display:grid;
                                grid-template-columns:
                                repeat(4,1fr);
                                gap:8px;
                            "
                        >


                            <div
                                style="
                                    background:#f8fafc;
                                    padding:10px;
                                    text-align:center;
                                    border-radius:8px;
                                "
                            >

                                <strong>
                                    MAC
                                </strong>

                                <br>

                                ${nota.MAC}

                            </div>


                            <div
                                style="
                                    background:#f8fafc;
                                    padding:10px;
                                    text-align:center;
                                    border-radius:8px;
                                "
                            >

                                <strong>
                                    NPT
                                </strong>

                                <br>

                                ${nota.NPT}

                            </div>


                            <div
                                style="
                                    background:#f8fafc;
                                    padding:10px;
                                    text-align:center;
                                    border-radius:8px;
                                "
                            >

                                <strong>
                                    MF
                                </strong>

                                <br>

                                ${nota.MF}

                            </div>


                            <div
                                style="
                                    background:#f8fafc;
                                    padding:10px;
                                    text-align:center;
                                    border-radius:8px;
                                "
                            >

                                <strong>
                                    Classificação
                                </strong>

                                <br>

                                ${nota.classificacao}

                            </div>


                        </div>

                    </div>

                    `;

                }


                resultado += `

                </div>

                `;

            }


            if (!resultado) {

                resultado = `

                <div
                    style="
                        background:white;
                        padding:25px;
                        text-align:center;
                        border-radius:12px;
                    "
                >

                    Ainda não existem notas
                    para este trimestre.

                </div>

                `;

            }


            conteudo.innerHTML =
                resultado;

        }


        /* =================================================
           MOSTRAR TODOS
        ================================================= */

        renderizarNotas("todos");


        /* =================================================
           FILTRO
        ================================================= */

        const filtro =
            document.getElementById(
                "filtroTrimestre"
            );


        if (filtro) {

            filtro.addEventListener(
                "change",
                function () {

                    renderizarNotas(
                        this.value
                    );

                }
            );

        }


        /* =================================================
           FECHAR
        ================================================= */

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

window.verBoletim = function () {

    alert(
        "📄 BOLETIM\n\n" +
        "O módulo de boletim será ligado depois."
    );

};


/* =====================================================
   DADOS PESSOAIS
===================================================== */

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


/* =====================================================
   ALTERAR SENHA
===================================================== */

window.alterarSenha = function () {

    alert(
        "🔐 Alterar senha\n\n" +
        "Esta função será ligada ao Firestore."
    );

};


/* =====================================================
   SAIR
===================================================== */

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
