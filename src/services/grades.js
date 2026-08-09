// ============================================================
// GRADES.JS
// MINI-PAUTA DO PROFESSOR - SGE
// ============================================================

alert("GRADES.JS - MINI-PAUTA CARREGADO ✅");

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// ============================================================
// PROFESSOR LOGADO
// ============================================================

const professor =
    JSON.parse(
        localStorage.getItem("professorLogado")
    );


if (!professor) {

    alert("Professor não encontrado.");

    window.location.href =
        "login.html";

    throw new Error(
        "Professor não autenticado."
    );
}


// ============================================================
// ELEMENTOS HTML
// ============================================================

const classSelect =
    document.getElementById("classSelect");

const subject =
    document.getElementById("subject");

const trimestreSelect =
    document.getElementById("trimestre");

const pautaBody =
    document.getElementById("pautaBody");

const saveGrades =
    document.getElementById("saveGrades");

const limparNotas =
    document.getElementById("limparNotas");

const mensagem =
    document.getElementById("mensagem");

const estadoTexto =
    document.getElementById("estadoTexto");

const estadoIcone =
    document.getElementById("estadoIcone");

const professorInfo =
    document.getElementById("professorInfo");

const classeInfo =
    document.getElementById("classeInfo");

const turmaInfo =
    document.getElementById("turmaInfo");


// ============================================================
// VERIFICAR ELEMENTOS
// ============================================================

if (!classSelect ||
    !subject ||
    !trimestreSelect ||
    !pautaBody ||
    !saveGrades) {

    console.error(
        "Elementos necessários não encontrados."
    );

    alert(
        "Erro na estrutura da Mini-Pauta."
    );

    throw new Error(
        "Elementos HTML ausentes."
    );
}


// ============================================================
// ESTADO
// ============================================================

let turmaSelecionada = "";

let disciplinaSelecionada = "";

let trimestreSelecionado = "";

let alunos = [];

let ensinoAtual =
    "ensinoPrimario";

let pautaAtual = null;

let pautaBloqueada = false;

let trimestreFechado = false;


// ============================================================
// INFORMAÇÃO DO PROFESSOR
// ============================================================

if (professorInfo) {

    professorInfo.textContent =
        "Professor: " +
        (
            professor.nome ||
            professor.nomeCompleto ||
            professor.name ||
            "—"
        );

}


// ============================================================
// MENSAGEM
// ============================================================

function mostrarMensagem(
    texto,
    tipo = "aviso"
) {

    if (!mensagem) return;

    mensagem.className =
        "mensagem " + tipo;

    mensagem.textContent =
        texto;

}


// ============================================================
// LIMPAR MENSAGEM
// ============================================================

function limparMensagem() {

    if (!mensagem) return;

    mensagem.className =
        "mensagem";

    mensagem.textContent =
        "";

}


// ============================================================
// ESTADO DA PAUTA
// ============================================================

function atualizarEstado() {

    if (!estadoTexto ||
        !estadoIcone) {

        return;

    }


    if (!turmaSelecionada) {

        estadoTexto.textContent =
            "Selecione uma turma.";

        estadoIcone.textContent =
            "⏳";

        return;

    }


    if (!disciplinaSelecionada) {

        estadoTexto.textContent =
            "Selecione uma disciplina.";

        estadoIcone.textContent =
            "⏳";

        return;

    }


    if (!trimestreSelecionado) {

        estadoTexto.textContent =
            "Selecione o trimestre.";

        estadoIcone.textContent =
            "⏳";

        return;

    }


    if (trimestreFechado) {

        estadoTexto.textContent =
            "Este trimestre está fechado.";

        estadoIcone.textContent =
            "🔒";

        return;

    }


    if (pautaBloqueada) {

        estadoTexto.textContent =
            "Lançamento de notas desligado pelo administrador.";

        estadoIcone.textContent =
            "🚫";

        return;

    }


    estadoTexto.textContent =
        "Lançamento disponível.";

    estadoIcone.textContent =
        "🟢";

}


// ============================================================
// OBTER DADOS DO PROFESSOR
// ============================================================

async function obterProfessor() {

    const ref =
        doc(
            db,
            "professores",
            professor.id
        );


    const snap =
        await getDoc(ref);


    if (!snap.exists()) {

        throw new Error(
            "Professor não encontrado no Firestore."
        );

    }


    return snap.data();

}


// ============================================================
// CARREGAR TURMAS
// ============================================================

async function carregarTurmasProfessor() {

    try {

        classSelect.innerHTML = `
            <option value="">
                Selecionar turma
            </option>
        `;


        const dadosProfessor =
            await obterProfessor();


        const turmasProfessor =
            Array.isArray(
                dadosProfessor.turmas
            )
                ? dadosProfessor.turmas
                : [];


        if (
            turmasProfessor.length === 0
        ) {

            classSelect.innerHTML = `
                <option value="">
                    Nenhuma turma atribuída
                </option>
            `;

            return;

        }


        const turmas = [];


        for (
            const turmaId
            of turmasProfessor
        ) {

            const ref =
                doc(
                    db,
                    "turmas",
                    turmaId
                );


            const snap =
                await getDoc(ref);


            if (!snap.exists()) {
                continue;
            }


            const dados =
                snap.data();


            turmas.push({

                id:
                    turmaId,

                ...dados

            });

        }


        turmas.sort(
            (a,b) => {

                return String(
                    a.nome || ""
                ).localeCompare(
                    String(
                        b.nome || ""
                    ),
                    "pt"
                );

            }
        );


        turmas.forEach(
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
                    turma.designacao ||
                    "Turma";


                classSelect.appendChild(
                    option
                );

            }
        );

    }
    catch(error) {

        console.error(
            "Erro ao carregar turmas:",
            error
        );

        mostrarMensagem(
            "Erro ao carregar as turmas: " +
            error.message,
            "erro"
        );

    }

}


// ============================================================
// CARREGAR DISCIPLINAS DO PROFESSOR
// ============================================================

async function carregarDisciplinasProfessor() {

    subject.innerHTML = `
        <option value="">
            Selecionar disciplina
        </option>
    `;


    if (!turmaSelecionada) {
        return;
    }


    try {

        const dadosProfessor =
            await obterProfessor();


        let disciplinas = [];


        /*
        Caso normal:
        disciplinas = ["Matemática", "Português"]
        */

        if (
            Array.isArray(
                dadosProfessor.disciplinas
            )
        ) {

            disciplinas =
                dadosProfessor.disciplinas;

        }


        /*
        Caso as disciplinas estejam
        organizadas por turma.
        */

        else if (
            dadosProfessor.disciplinasPorTurma &&
            typeof dadosProfessor.disciplinasPorTurma === "object"
        ) {

            const lista =
                dadosProfessor
                    .disciplinasPorTurma[
                        turmaSelecionada
                    ];

            if (Array.isArray(lista)) {

                disciplinas = lista;

            }

        }


        /*
        Remover duplicadas.
        */

        disciplinas =
            [
                ...new Set(
                    disciplinas
                    .map(
                        d =>
                            String(d).trim()
                    )
                    .filter(
                        d => d !== ""
                    )
                )
            ];


        disciplinas.sort(
            (a,b) =>
                a.localeCompare(
                    b,
                    "pt"
                )
        );


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


                subject.appendChild(
                    option
                );

            }
        );


        if (
            disciplinas.length === 0
        ) {

            subject.innerHTML = `
                <option value="">
                    Nenhuma disciplina atribuída
                </option>
            `;

        }

    }
    catch(error) {

        console.error(
            "Erro ao carregar disciplinas:",
            error
        );

        mostrarMensagem(
            "Erro ao carregar disciplinas.",
            "erro"
        );

    }

}


// ============================================================
// DESCOBRIR CICLO DA TURMA
// ============================================================

async function carregarEnsino() {

    if (!turmaSelecionada) {
        return;
    }


    const ref =
        doc(
            db,
            "turmas",
            turmaSelecionada
        );


    const snap =
        await getDoc(ref);


    if (!snap.exists()) {
        return;
    }


    const turma =
        snap.data();


    ensinoAtual =
        turma.ensino ||
        turma.ciclo ||
        "ensinoPrimario";


    /*
    Mostrar classe.
    */

    if (classeInfo) {

        classeInfo.textContent =
            "Classe: " +
            (
                turma.classe ||
                "—"
            );

    }


    /*
    Mostrar turma.
    */

    if (turmaInfo) {

        turmaInfo.textContent =
            "Turma: " +
            (
                turma.nome ||
                turma.turma ||
                "—"
            );

    }

}


// ============================================================
// CARREGAR ALUNOS
// ============================================================

async function carregarAlunos() {

    if (!turmaSelecionada) {

        pautaBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Selecione uma turma.
                </td>
            </tr>
        `;

        return;

    }


    try {

        pautaBody.innerHTML = `
            <tr>
                <td colspan="5">
                    A carregar alunos...
                </td>
            </tr>
        `;


        const ref =
            collection(
                db,
                "turmas",
                turmaSelecionada,
                "alunos"
            );


        const snap =
            await getDocs(ref);


        alunos = [];


        snap.forEach(
            documento => {

                alunos.push({

                    id:
                        documento.id,

                    ...documento.data()

                });

            }
        );


        alunos.sort(
            (a,b) => {

                const numeroA =
                    Number(a.numero);

                const numeroB =
                    Number(b.numero);


                if (
                    Number.isNaN(numeroA)
                ) return 1;


                if (
                    Number.isNaN(numeroB)
                ) return -1;


                return numeroA -
                    numeroB;

            }
        );


        mostrarPauta();

    }
    catch(error) {

        console.error(
            "Erro ao carregar alunos:",
            error
        );

        pautaBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Erro ao carregar alunos.
                </td>
            </tr>
        `;

    }

}


// ============================================================
// ID ÚNICO DA MINI-PAUTA
// ============================================================

function obterIdPauta() {

    return (
        turmaSelecionada +
        "_" +
        disciplinaSelecionada +
        "_" +
        trimestreSelecionado
    );

}


// ============================================================
// CARREGAR CONFIGURAÇÃO DA PAUTA
// ============================================================

async function carregarEstadoPauta() {

    pautaBloqueada = false;

    trimestreFechado = false;


    /*
    Configuração global de notas.
    */

    try {

        const configRef =
            doc(
                db,
                "config",
                "notas"
            );


        const configSnap =
            await getDoc(configRef);


        if (configSnap.exists()) {

            const config =
                configSnap.data();


            /*
            Lançamento global.
            */

            if (
                config.lancamentoAtivo === false
            ) {

                pautaBloqueada =
                    true;

            }


            /*
            Fecho por trimestre.
            */

            if (
                config.trimestresFechados &&
                config.trimestresFechados[
                    trimestreSelecionado
                ] === true
            ) {

                trimestreFechado =
                    true;

            }

        }

    }
    catch(error) {

        console.warn(
            "Configuração de notas não encontrada.",
            error
        );

    }


    /*
    Configuração específica da pauta.
    */

    try {

        const pautaRef =
            doc(
                db,
                "notas",
                obterIdPauta()
            );


        const pautaSnap =
            await getDoc(pautaRef);


        pautaAtual =
            pautaSnap.exists()
                ? pautaSnap.data()
                : null;

    }
    catch(error) {

        console.error(error);

        pautaAtual = null;

    }


    atualizarEstado();

}


// ============================================================
// CLASSIFICAÇÃO
// ============================================================

function classificarNota(
    nota
) {

    const valor =
        Number(nota);


    if (
        Number.isNaN(valor)
    ) {
        return "";
    }


    if (
        ensinoAtual ===
        "ensinoPrimario"
    ) {

        if (valor <= 2)
            return "Mau";

        if (valor <= 4)
            return "Medíocre";

        if (valor <= 6)
            return "Suficiente";

        if (valor <= 8)
            return "Bom";

        return "Muito Bom";

    }


    /*
    Primeiro Ciclo
    */

    if (valor <= 4)
        return "Mau";

    if (valor <= 9)
        return "Medíocre";

    if (valor <= 13)
        return "Suficiente";

    if (valor <= 16)
        return "Bom";

    return "Muito Bom";

}


// ============================================================
// LIMITE MÁXIMO
// ============================================================

function notaMaxima() {

    return (
        ensinoAtual ===
        "ensinoPrimario"
    )
        ? 10
        : 20;

}


// ============================================================
// LIMITE DE APROVAÇÃO
// ============================================================

function notaMinima() {

    return (
        ensinoAtual ===
        "ensinoPrimario"
    )
        ? 5
        : 10;

}


// ============================================================
// MOSTRAR PAUTA
// ============================================================

function mostrarPauta() {

    pautaBody.innerHTML = "";


    if (alunos.length === 0) {

        pautaBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Nenhum aluno encontrado.
                </td>
            </tr>
        `;

        return;

    }


    /*
    Notas já guardadas.
    */

    const notas =
        pautaAtual?.alunos || [];


    alunos.forEach(
        aluno => {

            const nota =
                notas.find(
                    n =>
                        String(n.alunoId) ===
                        String(aluno.id)
                ) || {};


            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${aluno.numero || ""}
                </td>

                <td class="nome">
                    ${aluno.nome || ""}
                </td>

                <td>

                    <input
                        class="nota mac"
                        data-id="${aluno.id}"
                        type="number"
                        min="0"
                        max="${notaMaxima()}"
                        step="0.1"
                        value="${
                            nota.MAC ??
                            ""
                        }"
                    >

                </td>

                <td>

                    <input
                        class="nota npt"
                        data-id="${aluno.id}"
                        type="number"
                        min="0"
                        max="${notaMaxima()}"
                        step="0.1"
                        value="${
                            nota.NPT ??
                            ""
                        }"
                    >

                </td>

                <td
                    class="mf"
                    id="mf-${aluno.id}"
                >
                    ${
                        nota.MF ??
                        ""
                    }
                </td>

            `;


            pautaBody.appendChild(tr);


            calcularLinha(aluno.id);

        }
    );


    /*
    Bloquear campos se necessário.
    */

    aplicarBloqueio();

}


// =====================================================
// CALCULAR UMA LINHA
// =====================================================

function calcularLinha(linha) {

    if (!linha) return;

    const macInput =
        linha.querySelector(".mac");

    const nptInput =
        linha.querySelector(".npt");

    const mfCell =
        linha.querySelector(".mf");

    const classificacaoCell =
        linha.querySelector(".classificacao");

    if (!macInput || !nptInput || !mfCell) {
        return;
    }

    const mac =
        macInput.value === ""
            ? null
            : Number(macInput.value);

    const npt =
        nptInput.value === ""
            ? null
            : Number(nptInput.value);

    // -----------------------------------------------
    // SEM NOTAS COMPLETAS
    // -----------------------------------------------

    if (
        mac === null ||
        npt === null ||
        Number.isNaN(mac) ||
        Number.isNaN(npt)
    ) {

        mfCell.textContent = "—";

        if (classificacaoCell) {
            classificacaoCell.textContent = "—";
            classificacaoCell.className =
                "classificacao";
        }

        mfCell.classList.remove(
            "mf-reprovado"
        );

        return;
    }

    // -----------------------------------------------
    // CALCULAR MÉDIA FINAL
    // -----------------------------------------------

    const mf =
        Number(
            ((mac + npt) / 2).toFixed(1)
        );

    mfCell.textContent = mf;

    // -----------------------------------------------
    // LIMITE DE APROVAÇÃO
    // -----------------------------------------------

    const limite =
        ensinoAtual === "ensinoPrimario"
            ? 10
            : 10;

    // -----------------------------------------------
    // CLASSIFICAÇÃO
    // -----------------------------------------------

    let classificacao = "";

    if (mf < 5) {

        classificacao = "Mau";

    }
    else if (mf < 10) {

        classificacao = "Medíocre";

    }
    else if (mf <= 13) {

        classificacao = "Suficiente";

    }
    else if (mf <= 16) {

        classificacao = "Bom";

    }
    else {

        classificacao = "Muito Bom";

    }

    if (classificacaoCell) {

        classificacaoCell.textContent =
            classificacao;

        classificacaoCell.className =
            "classificacao";

        if (mf < limite) {

            classificacaoCell.classList.add(
                "classificacao-reprovado"
            );

        }
        else {

            classificacaoCell.classList.add(
                "classificacao-aprovado"
            );

        }

    }

    // -----------------------------------------------
    // DESTAQUE DA MF
    // -----------------------------------------------

    mfCell.classList.remove(
        "mf-reprovado"
    );

    if (mf < limite) {

        mfCell.classList.add(
            "mf-reprovado"
        );

    }

    // -----------------------------------------------
    // DESTAQUE DAS NOTAS ABAIXO DO LIMITE
    // -----------------------------------------------

    macInput.classList.remove(
        "nota-reprovada"
    );

    nptInput.classList.remove(
        "nota-reprovada"
    );

    if (mac < limite) {

        macInput.classList.add(
            "nota-reprovada"
        );

    }

    if (npt < limite) {

        nptInput.classList.add(
            "nota-reprovada"
        );

    }

}


// =====================================================
// ATIVAR CÁLCULO AUTOMÁTICO DAS LINHAS
// =====================================================

function ativarCalculoNotas() {

    const linhas =
        document.querySelectorAll(
            "#pautaBody tr.aluno-linha"
        );

    linhas.forEach(linha => {

        const campos =
            linha.querySelectorAll(
                ".mac, .npt"
            );

        campos.forEach(campo => {

            campo.addEventListener(
                "input",
                function () {

                    validarNota(this);

                    calcularLinha(
                        linha
                    );

                }
            );

        });

        // Calcular imediatamente
        calcularLinha(linha);

    });

}


// =====================================================
// VALIDAR NOTA
// =====================================================

function validarNota(input) {

    if (!input) return;

    let valor =
        input.value;

    if (valor === "") {
        return;
    }

    valor =
        Number(valor);

    const maximo =
        ensinoAtual === "ensinoPrimario"
            ? 20
            : 20;

    if (Number.isNaN(valor)) {

        input.value = "";

        return;
    }

    if (valor < 0) {

        input.value = 0;

    }

    if (valor > maximo) {

        input.value = maximo;

    }

}


// =====================================================
// LER NOTAS DE UMA LINHA
// =====================================================

function obterDadosDaLinha(linha) {

    if (!linha) return null;

    const numero =
        linha.dataset.numero || "";

    const alunoId =
        linha.dataset.alunoId || "";

    const nome =
        linha.dataset.nome || "";

    const macInput =
        linha.querySelector(".mac");

    const nptInput =
        linha.querySelector(".npt");

    const mfCell =
        linha.querySelector(".mf");

    const classificacaoCell =
        linha.querySelector(".classificacao");

    const mac =
        macInput &&
        macInput.value !== ""
            ? Number(macInput.value)
            : null;

    const npt =
        nptInput &&
        nptInput.value !== ""
            ? Number(nptInput.value)
            : null;

    const mf =
        mfCell &&
        mfCell.textContent !== "—"
            ? Number(mfCell.textContent)
            : null;

    const classificacao =
        classificacaoCell
            ? classificacaoCell.textContent
            : "";

    return {

        alunoId,

        numero,

        nome,

        MAC: mac,

        NPT: npt,

        MF: mf,

        classificacao

    };

}


// =====================================================
// LER TODA A MINI-PAUTA
// =====================================================

function obterNotasDaPauta() {

    const linhas =
        document.querySelectorAll(
            "#pautaBody tr.aluno-linha"
        );

    const notas = [];

    linhas.forEach(linha => {

        const dados =
            obterDadosDaLinha(linha);

        if (dados) {

            notas.push(dados);

        }

    });

    return notas;

}


// =====================================================
// VERIFICAR SE EXISTEM NOTAS PREENCHIDAS
// =====================================================

function existemNotas() {

    const notas =
        obterNotasDaPauta();

    return notas.some(
        aluno =>
            aluno.MAC !== null ||
            aluno.NPT !== null
    );

}


// =====================================================
// LIMPAR NOTAS
// =====================================================

function limparNotasDaPauta() {

    const linhas =
        document.querySelectorAll(
            "#pautaBody tr.aluno-linha"
        );

    linhas.forEach(linha => {

        const mac =
            linha.querySelector(".mac");

        const npt =
            linha.querySelector(".npt");

        const mf =
            linha.querySelector(".mf");

        const classificacao =
            linha.querySelector(
                ".classificacao"
            );

        if (mac) {
            mac.value = "";
            mac.classList.remove(
                "nota-reprovada"
            );
        }

        if (npt) {
            npt.value = "";
            npt.classList.remove(
                "nota-reprovada"
            );
        }

        if (mf) {

            mf.textContent = "—";

            mf.classList.remove(
                "mf-reprovado"
            );

        }

        if (classificacao) {

            classificacao.textContent =
                "—";

            classificacao.className =
                "classificacao";

        }

    });

}


// =====================================================
// BOTÃO LIMPAR
// =====================================================

const limparNotas =
    document.getElementById(
        "limparNotas"
    );

if (limparNotas) {

    limparNotas.addEventListener(
        "click",
        function () {

            if (!existemNotas()) {

                limparNotasDaPauta();

                return;

            }

            const confirmar =
                confirm(
                    "Tem certeza que deseja limpar as notas desta mini-pauta?"
                );

            if (!confirmar) {
                return;
            }

            limparNotasDaPauta();

            mostrarMensagem(
                "Notas limpas da tela.",
                "aviso"
            );

        }
    );

}


// =====================================================
// MENSAGEM
// =====================================================

function mostrarMensagem(
    texto,
    tipo = "aviso"
) {

    const mensagem =
        document.getElementById(
            "mensagem"
        );

    if (!mensagem) return;

    mensagem.textContent =
        texto;

    mensagem.className =
        "mensagem " + tipo;

    mensagem.style.display =
        "block";

}


// =====================================================
// ESCONDER MENSAGEM
// =====================================================

function esconderMensagem() {

    const mensagem =
        document.getElementById(
            "mensagem"
        );

    if (!mensagem) return;

    mensagem.textContent = "";

    mensagem.className =
        "mensagem";

    mensagem.style.display =
        "none";

}


// =====================================================
// ATIVAR EVENTOS DA PAUTA
// =====================================================

function prepararPauta() {

    ativarCalculoNotas();

    esconderMensagem();

}


// =====================================================
// EXPORTAR DADOS ATUAIS
// =====================================================

function prepararDadosExportacao() {

    return obterNotasDaPauta();

}


// =====================================================
// FINAL DO BLOCO
// =====================================================

alert(
    "Bloco de cálculo da Mini-Pauta carregado ✅"
);
