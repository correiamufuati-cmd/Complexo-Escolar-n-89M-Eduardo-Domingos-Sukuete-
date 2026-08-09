// ============================================================
// GRADES.JS — MINI-PAUTA DO PROFESSOR
// SGE - SISTEMA DE GESTÃO ESCOLAR
// ============================================================

alert("GRADES.JS PROFESSOR — NOVA VERSÃO CARREGADA ✅");

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

    window.location.href = "login.html";

    throw new Error(
        "Professor não autenticado."
    );

}


// ============================================================
// ELEMENTOS DO HTML
// ============================================================

const classSelect =
    document.getElementById("classSelect");

const subject =
    document.getElementById("subject");

const pautaBody =
    document.getElementById("pautaBody");

const saveGrades =
    document.getElementById("saveGrades");

const excelInput =
    document.getElementById("excelInput");

const importExcel =
    document.getElementById("importExcel");

const gradesList =
    document.getElementById("gradesList");


// ============================================================
// VERIFICAR ELEMENTOS
// ============================================================

if (!classSelect) {

    throw new Error(
        "Elemento #classSelect não encontrado."
    );

}

if (!subject) {

    throw new Error(
        "Elemento #subject não encontrado."
    );

}

if (!pautaBody) {

    throw new Error(
        "Elemento #pautaBody não encontrado."
    );

}


// ============================================================
// ESTADO
// ============================================================

let turmaSelecionada = "";

let disciplinaSelecionada = "";

let trimestreSelecionado = 1;

let alunos = [];

let notasAtuais = {};

let turmaDados = {};


// ============================================================
// CICLO / CLASSE
// ============================================================

let ensinoAtual = "";

let classeAtual = "";


// ============================================================
// CONFIGURAÇÃO DOS TRIMESTRES
// ============================================================

const TRIMESTRES = [

    {
        numero: 1,
        nome: "1.º Trimestre"
    },

    {
        numero: 2,
        nome: "2.º Trimestre"
    },

    {
        numero: 3,
        nome: "3.º Trimestre"
    }

];


// ============================================================
// INICIALIZAÇÃO
// ============================================================

async function iniciar() {

    try {

        prepararInterface();

        await carregarTurmasProfessor();

        console.log(
            "Mini-pauta iniciada com sucesso."
        );

    }
    catch (erro) {

        console.error(
            "Erro ao iniciar mini-pauta:",
            erro
        );

        alert(
            "Erro ao iniciar a Mini-Pauta:\n\n" +
            erro.message
        );

    }

}


// ============================================================
// PREPARAR INTERFACE
// ============================================================

function prepararInterface() {

    criarSeletorTrimestre();

    criarBotoesExportacao();

    if (saveGrades) {

        saveGrades.textContent =
            "💾 Guardar Mini-Pauta";

    }

}


// ============================================================
// CRIAR SELETOR DE TRIMESTRE
// ============================================================

function criarSeletorTrimestre() {

    const bloco =
        document.createElement("div");

    bloco.id =
        "blocoTrimestre";

    bloco.style.marginTop =
        "10px";

    bloco.innerHTML = `

        <label
            for="trimestreSelect"
            style="
                display:block;
                font-weight:bold;
                margin-bottom:5px;
            "
        >
            Trimestre
        </label>

        <select
            id="trimestreSelect"
            style="
                width:100%;
                padding:10px;
            "
        >

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

    `;


    /*
    Colocar depois do campo disciplina.
    */

    if (subject.parentElement) {

        subject.parentElement.appendChild(
            bloco
        );

    }
    else {

        subject.insertAdjacentElement(
            "afterend",
            bloco
        );

    }


    const trimestreSelect =
        document.getElementById(
            "trimestreSelect"
        );


    trimestreSelect.addEventListener(
        "change",
        async function () {

            trimestreSelecionado =
                Number(
                    this.value
                );


            if (
                turmaSelecionada &&
                disciplinaSelecionada
            ) {

                await carregarNotas();

            }

        }
    );

}


// ============================================================
// CARREGAR TURMAS DO PROFESSOR
// ============================================================

async function carregarTurmasProfessor() {

    try {

        const professorRef =
            doc(
                db,
                "professores",
                professor.id
            );


        const professorSnap =
            await getDoc(
                professorRef
            );


        if (
            !professorSnap.exists()
        ) {

            alert(
                "O professor não existe no sistema."
            );

            return;

        }


        const dados =
            professorSnap.data();


        const turmasProfessor =
            Array.isArray(
                dados.turmas
            )
                ? dados.turmas
                : [];


        classSelect.innerHTML = `

            <option value="">
                Selecionar turma
            </option>

        `;


        for (
            const turmaId
            of turmasProfessor
        ) {

            const turmaRef =
                doc(
                    db,
                    "turmas",
                    turmaId
                );


            const turmaSnap =
                await getDoc(
                    turmaRef
                );


            if (
                !turmaSnap.exists()
            ) {

                continue;

            }


            const turma =
                turmaSnap.data();


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                turmaId;


            option.textContent =
                `${turma.nome || "Turma"}${
                    turma.classe
                        ? " — " + turma.classe
                        : ""
                }`;


            classSelect.appendChild(
                option
            );

        }


        if (
            !turmasProfessor.length
        ) {

            pautaBody.innerHTML = `

                <tr>

                    <td colspan="5">

                        ⚠️ Nenhuma turma foi
                        atribuída a este professor.

                    </td>

                </tr>

            `;

        }

    }
    catch (erro) {

        console.error(
            "Erro ao carregar turmas:",
            erro
        );

        throw erro;

    }

    }

// ============================================================
// ESCOLHER TURMA
// ============================================================

classSelect.addEventListener(
    "change",
    async function () {

        turmaSelecionada =
            this.value;

        disciplinaSelecionada =
            "";

        alunos = [];

        notasAtuais = {};

        pautaBody.innerHTML = "";

        subject.innerHTML = `

            <option value="">
                Selecionar disciplina
            </option>

        `;


        if (!turmaSelecionada) {

            return;

        }


        await carregarDadosTurma();

        await carregarDisciplinasProfessor();

        await carregarAlunos();

    }
);


// ============================================================
// CARREGAR DADOS DA TURMA
// ============================================================

async function carregarDadosTurma() {

    const turmaRef =
        doc(
            db,
            "turmas",
            turmaSelecionada
        );


    const turmaSnap =
        await getDoc(
            turmaRef
        );


    if (
        !turmaSnap.exists()
    ) {

        return;

    }


    turmaDados =
        turmaSnap.data();


    classeAtual =
        turmaDados.classe ||
        "";


    ensinoAtual =
        turmaDados.ensino ||
        turmaDados.ciclo ||
        "";


    console.log(
        "Turma:",
        turmaDados
    );

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


    const professorRef =
        doc(
            db,
            "professores",
            professor.id
        );


    const professorSnap =
        await getDoc(
            professorRef
        );


    if (
        !professorSnap.exists()
    ) {

        return;

    }


    const dados =
        professorSnap.data();


    let disciplinas =
        Array.isArray(
            dados.disciplinas
        )
            ? dados.disciplinas
            : [];


    /*
    Remover duplicadas.
    */

    disciplinas =
        [...new Set(
            disciplinas
                .map(
                    item =>
                        String(item).trim()
                )
                .filter(Boolean)
        )];


    disciplinas.sort(
        (a, b) =>
            a.localeCompare(
                b,
                "pt"
            )
    );


    disciplinas.forEach(
        nomeDisciplina => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                nomeDisciplina;


            option.textContent =
                nomeDisciplina;


            subject.appendChild(
                option
            );

        }
    );

}


// ============================================================
// ESCOLHER DISCIPLINA
// ============================================================

subject.addEventListener(
    "change",
    async function () {

        disciplinaSelecionada =
            this.value;


        notasAtuais = {};


        if (
            !turmaSelecionada ||
            !disciplinaSelecionada
        ) {

            return;

        }


        await carregarNotas();

    }
);


// ============================================================
// CARREGAR ALUNOS
// ============================================================

async function carregarAlunos() {

    pautaBody.innerHTML = `

        <tr>

            <td colspan="5">

                ⏳ A carregar alunos...

            </td>

        </tr>

    `;


    alunos = [];


    const alunosRef =
        collection(
            db,
            "turmas",
            turmaSelecionada,
            "alunos"
        );


    const snapshot =
        await getDocs(
            alunosRef
        );


    snapshot.forEach(
        documento => {

            alunos.push({

                id:
                    documento.id,

                ...documento.data()

            });

        }
    );


    /*
    Ordenar pelo número.
    */

    alunos.sort(
        (a, b) => {

            const numeroA =
                Number(a.numero);

            const numeroB =
                Number(b.numero);


            if (
                Number.isNaN(numeroA) &&
                Number.isNaN(numeroB)
            ) {

                return String(
                    a.nome || ""
                ).localeCompare(
                    String(
                        b.nome || ""
                    ),
                    "pt"
                );

            }


            if (
                Number.isNaN(numeroA)
            ) {

                return 1;

            }


            if (
                Number.isNaN(numeroB)
            ) {

                return -1;

            }


            return numeroA - numeroB;

        }
    );


    if (!alunos.length) {

        pautaBody.innerHTML = `

            <tr>

                <td colspan="5">

                    ⚠️ Nenhum aluno encontrado
                    nesta turma.

                </td>

            </tr>

        `;

        return;

    }


    mostrarPauta();

            }

                // ============================================================
// CARREGAR NOTAS EXISTENTES
// ============================================================

async function carregarNotas() {

    if (
        !turmaSelecionada ||
        !disciplinaSelecionada
    ) {

        return;

    }


    pautaBody.innerHTML = `

        <tr>

            <td colspan="5">

                ⏳ A carregar notas...

            </td>

        </tr>

    `;


    notasAtuais = {};


    /*
    Estrutura única da mini-pauta:

    notas/
        turma_disciplina_trimestre
    */

    const idPauta =
        criarIdPauta();


    const pautaRef =
        doc(
            db,
            "notas",
            idPauta
        );


    const pautaSnap =
        await getDoc(
            pautaRef
        );


    if (
        pautaSnap.exists()
    ) {

        const dados =
            pautaSnap.data();


        if (
            Array.isArray(
                dados.alunos
            )
        ) {

            dados.alunos.forEach(
                aluno => {

                    notasAtuais[
                        String(aluno.alunoId)
                    ] = aluno;

                }
            );

        }

    }


    mostrarPauta();

}


// ============================================================
// ID DA PAUTA
// ============================================================

function criarIdPauta() {

    return (

        String(turmaSelecionada)
        + "_"
        +
        limparId(
            disciplinaSelecionada
        )
        + "_"
        +
        String(trimestreSelecionado)

    );

}


// ============================================================
// LIMPAR TEXTO PARA ID
// ============================================================

function limparId(texto) {

    return String(texto)
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-zA-Z0-9]/g,
            "_"
        )
        .toLowerCase();

}


// ============================================================
// MOSTRAR PAUTA
// ============================================================

function mostrarPauta() {

    pautaBody.innerHTML = "";


    if (
        !alunos.length
    ) {

        return;

    }


    alunos.forEach(
        aluno => {

            const nota =
                notasAtuais[
                    String(aluno.id)
                ] || {};


            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${aluno.numero || ""}
                </td>

                <td>
                    ${aluno.nome || ""}
                </td>

                <td>

                    <input
                        class="mac"
                        data-id="${aluno.id}"
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value="${
                            nota.MAC ?? ""
                        }"
                    >

                </td>

                <td>

                    <input
                        class="npt"
                        data-id="${aluno.id}"
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value="${
                            nota.NPT ?? ""
                        }"
                    >

                </td>

                <td
                    id="mf-${aluno.id}"
                >

                    ${nota.MF ?? ""}

                </td>

            `;


            pautaBody.appendChild(
                tr
            );

        }
    );


    ativarCalculoMF();

}


// ============================================================
// CALCULAR MF
// ============================================================

function ativarCalculoMF() {

    document
        .querySelectorAll(
            "#pautaBody .mac, #pautaBody .npt"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "input",
                    function () {

                        calcularMF(
                            this.dataset.id
                        );

                    }
                );

            }
        );


    /*
    Calcular as notas já existentes.
    */

    alunos.forEach(
        aluno => {

            calcularMF(
                aluno.id
            );

        }
    );

}


// ============================================================
// CÁLCULO DA MF
// ============================================================

function calcularMF(alunoId) {

    const macInput =
        document.querySelector(
            `.mac[data-id="${alunoId}"]`
        );


    const nptInput =
        document.querySelector(
            `.npt[data-id="${alunoId}"]`
        );


    const mfCell =
        document.getElementById(
            `mf-${alunoId}`
        );


    if (
        !macInput ||
        !nptInput ||
        !mfCell
    ) {

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


    if (
        mac === null ||
        npt === null
    ) {

        mfCell.textContent = "";

        return;

    }


    const mf =
        Number(
            (
                (mac + npt) / 2
            ).toFixed(1)
        );


    mfCell.textContent =
        mf;

}


// ============================================================
// CLASSIFICAÇÃO
// ============================================================

function classificarNota(nota) {

    if (
        nota === null ||
        nota === undefined ||
        nota === ""
    ) {

        return "";

    }


    const valor =
        Number(nota);


    /*
    Ensino Primário
    */

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
// GUARDAR MINI-PAUTA
// ============================================================

if (saveGrades) {

    saveGrades.addEventListener(
        "click",
        guardarMiniPauta
    );

}


async function guardarMiniPauta() {

    if (
        !turmaSelecionada
    ) {

        alert(
            "Selecione uma turma."
        );

        return;

    }


    if (
        !disciplinaSelecionada
    ) {

        alert(
            "Selecione uma disciplina."
        );

        return;

    }


    /*
    Verificar se o trimestre está fechado.
    */

    const trimestreAberto =
        await verificarTrimestreAberto();


    if (!trimestreAberto) {

        alert(
            "🔒 Este trimestre está fechado pelo administrador."
        );

        return;

    }


    const alunosNotas = [];


    for (
        const aluno
        of alunos
    ) {

        const macInput =
            document.querySelector(
                `.mac[data-id="${aluno.id}"]`
            );


        const nptInput =
            document.querySelector(
                `.npt[data-id="${aluno.id}"]`
            );


        const mfCell =
            document.getElementById(
                `mf-${aluno.id}`
            );


        const MAC =
            macInput?.value === ""
                ? null
                : Number(
                    macInput.value
                );


        const NPT =
            nptInput?.value === ""
                ? null
                : Number(
                    nptInput.value
                );


        const MF =
            mfCell?.textContent === ""
                ? null
                : Number(
                    mfCell.textContent
                );


        alunosNotas.push({

            alunoId:
                aluno.id,

            numero:
                aluno.numero || "",

            nome:
                aluno.nome || "",

            sexo:
                aluno.sexo || "",

            idade:
                aluno.idade || "",

            MAC,

            NPT,

            MF,

            classificacao:
                classificarNota(MF)

        });

    }


    try {

        const idPauta =
            criarIdPauta();


        await setDoc(

            doc(
                db,
                "notas",
                idPauta
            ),

            {

                turmaId:
                    turmaSelecionada,

                turmaNome:
                    turmaDados.nome || "",

                classe:
                    classeAtual,

                ensino:
                    ensinoAtual,

                disciplina:
                    disciplinaSelecionada,

                trimestre:
                    trimestreSelecionado,

                professorId:
                    professor.id,

                professorNome:
                    professor.nome || "",

                alunos:
                    alunosNotas,

                atualizadoEm:
                    serverTimestamp()

            },

            {
                merge: true
            }

        );


        /*
        Atualizar memória local.
        */

        notasAtuais = {};


        alunosNotas.forEach(
            aluno => {

                notasAtuais[
                    String(
                        aluno.alunoId
                    )
                ] = aluno;

            }
        );


        alert(
            "✅ Mini-pauta guardada com sucesso."
        );

    }
    catch (erro) {

        console.error(
            "Erro ao guardar mini-pauta:",
            erro
        );


        alert(
            "❌ Erro ao guardar mini-pauta:\n\n" +
            erro.message
        );

    }

}


// ============================================================
// VERIFICAR TRIMESTRE ABERTO
// ============================================================

async function verificarTrimestreAberto() {

    /*
    Por enquanto, se ainda não existir
    configuração de fecho, fica aberto.

    Depois o painel do administrador
    vai controlar estes campos.
    */

    try {

        const ref =
            doc(
                db,
                "config",
                "notas"
            );


        const snap =
            await getDoc(ref);


        if (
            !snap.exists()
        ) {

            return true;

        }


        const dados =
            snap.data();


        const chave =
            `trimestre${trimestreSelecionado}Fechado`;


        if (
            dados[chave] === true
        ) {

            return false;

        }


        return true;

    }
    catch (erro) {

        console.warn(
            "Não foi possível verificar o fecho:",
            erro
        );


        /*
        Não bloquear o professor
        enquanto a configuração
        ainda não existir.
        */

        return true;

    }

    }

// ============================================================
// EXPORTAÇÃO
// ============================================================

function criarBotoesExportacao() {

    const area =
        document.createElement(
            "div"
        );


    area.id =
        "areaExportacao";


    area.style.display =
        "flex";

    area.style.flexWrap =
        "wrap";

    area.style.gap =
        "10px";

    area.style.margin =
        "15px 0";


    area.innerHTML = `

        <button
            type="button"
            id="exportExcel"
        >
            📊 Exportar Excel
        </button>

        <button
            type="button"
            id="exportPDF"
        >
            📄 Exportar PDF
        </button>

        <button
            type="button"
            id="printPauta"
        >
            🖨️ Imprimir
        </button>

    `;


    if (saveGrades) {

        saveGrades.parentElement
            .insertBefore(
                area,
                saveGrades
            );

    }
    else {

        document
            .querySelector(".main")
            ?.prepend(area);

    }


    document
        .getElementById("exportExcel")
        .addEventListener(
            "click",
            exportarExcel
        );


    document
        .getElementById("exportPDF")
        .addEventListener(
            "click",
            exportarPDF
        );


    document
        .getElementById("printPauta")
        .addEventListener(
            "click",
            imprimirPauta
        );

}


// ============================================================
// CARREGAR XLSX
// ============================================================

async function carregarXLSX() {

    if (
        window.XLSX
    ) {

        return window.XLSX;

    }


    await carregarScript(
        "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
    );


    return window.XLSX;

}


// ============================================================
// CARREGAR JSPDF
// ============================================================

async function carregarJsPDF() {

    if (
        window.jspdf
    ) {

        return window.jspdf;

    }


    await carregarScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
    );


    return window.jspdf;

}


// ============================================================
// CARREGAR SCRIPT EXTERNO
// ============================================================

function carregarScript(url) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const script =
                document.createElement(
                    "script"
                );


            script.src =
                url;


            script.onload =
                resolve;


            script.onerror =
                reject;


            document.head.appendChild(
                script
            );

        }
    );

}


// ============================================================
// EXPORTAR EXCEL
// ============================================================

async function exportarExcel() {

    if (
        !alunos.length
    ) {

        alert(
            "Não existem alunos para exportar."
        );

        return;

    }


    if (
        !disciplinaSelecionada
    ) {

        alert(
            "Selecione primeiro a disciplina."
        );

        return;

    }


    try {

        const XLSX =
            await carregarXLSX();


        const dados = [];


        dados.push([
            "ESCOLA",
            turmaDados.escola ||
            turmaDados.nomeEscola ||
            ""
        ]);


        dados.push([
            "CLASSE",
            classeAtual
        ]);


        dados.push([
            "TURMA",
            turmaDados.nome || ""
        ]);


        dados.push([
            "DISCIPLINA",
            disciplinaSelecionada
        ]);


        dados.push([
            "TRIMESTRE",
            `${trimestreSelecionado}.º Trimestre`
        ]);


        dados.push([]);


        dados.push([
            "Nº",
            "Nome",
            "Sexo",
            "Idade",
            "MAC",
            "NPT",
            "MF",
            "Classificação"
        ]);


        alunos.forEach(
            aluno => {

                const nota =
                    notasAtuais[
                        String(aluno.id)
                    ] || {};


                dados.push([

                    aluno.numero || "",

                    aluno.nome || "",

                    aluno.sexo || "",

                    aluno.idade || "",

                    nota.MAC ?? "",

                    nota.NPT ?? "",

                    nota.MF ?? "",

                    classificarNota(
                        nota.MF
                    )

                ]);

            }
        );


        const worksheet =
            XLSX.utils.aoa_to_sheet(
                dados
            );


        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Mini-Pauta"
        );


        const nomeArquivo =
            `Mini-Pauta_${classeAtual}_${turmaDados.nome || "Turma"}_${disciplinaSelecionada}_${trimestreSelecionado}T.xlsx`;


        XLSX.writeFile(
            workbook,
            nomeArquivo
        );


    }
    catch (erro) {

        console.error(
            erro
        );


        alert(
            "Erro ao exportar Excel:\n\n" +
            erro.message
        );

    }

}


// ============================================================
// EXPORTAR PDF
// ============================================================

async function exportarPDF() {

    if (
        !alunos.length
    ) {

        alert(
            "Não existem alunos para exportar."
        );

        return;

    }


    if (
        !disciplinaSelecionada
    ) {

        alert(
            "Selecione primeiro a disciplina."
        );

        return;

    }


    try {

        const jsPDF =
            await carregarJsPDF();


        const {
            jsPDF: PDF
        } = jsPDF;


        const pdf =
            new PDF({
                orientation:
                    "landscape",

                unit:
                    "mm",

                format:
                    "a4"
            });


        pdf.setFontSize(
            16
        );


        pdf.text(
            turmaDados.escola ||
            turmaDados.nomeEscola ||
            "SGE — Gestão Escolar",
            148,
            12,
            {
                align:
                    "center"
            }
        );


        pdf.setFontSize(
            11
        );


        pdf.text(
            `Classe: ${classeAtual}    Turma: ${turmaDados.nome || ""}`,
            148,
            20,
            {
                align:
                    "center"
            }
        );


        pdf.text(
            `Disciplina: ${disciplinaSelecionada}    ${trimestreSelecionado}.º Trimestre`,
            148,
            27,
            {
                align:
                    "center"
            }
        );


        let y =
            38;


        const colunas = [
            {
                texto:"Nº",
                x:10,
                largura:12
            },
            {
                texto:"Nome",
                x:22,
                largura:70
            },
            {
                texto:"Sexo",
                x:92,
                largura:15
            },
            {
                texto:"Idade",
                x:107,
                largura:15
            },
            {
                texto:"MAC",
                x:122,
                largura:20
            },
            {
                texto:"NPT",
                x:142,
                largura:20
            },
            {
                texto:"MF",
                x:162,
                largura:20
            },
            {
                texto:"Classificação",
                x:182,
                largura:35
            }
        ];


        pdf.setFontSize(
            9
        );


        colunas.forEach(
            coluna => {

                pdf.rect(
                    coluna.x,
                    y - 5,
                    coluna.largura,
                    8
                );


                pdf.text(
                    coluna.texto,
                    coluna.x + 2,
                    y
                );

            }
        );


        y += 8;


        alunos.forEach(
            aluno => {

                if (
                    y > 190
                ) {

                    pdf.addPage();

                    y = 15;

                }


                const nota =
                    notasAtuais[
                        String(aluno.id)
                    ] || {};


                const valores = [

                    aluno.numero || "",

                    aluno.nome || "",

                    aluno.sexo || "",

                    String(
                        aluno.idade || ""
                    ),

                    String(
                        nota.MAC ?? ""
                    ),

                    String(
                        nota.NPT ?? ""
                    ),

                    String(
                        nota.MF ?? ""
                    ),

                    classificarNota(
                        nota.MF
                    )

                ];


                valores.forEach(
                    (
                        valor,
                        indice
                    ) => {

                        const coluna =
                            colunas[indice];


                        pdf.rect(
                            coluna.x,
                            y - 5,
                            coluna.largura,
                            7
                        );


                        pdf.text(
                            String(valor)
                                .substring(
                                    0,
                                    indice === 1
                                        ? 38
                                        : 18
                                ),
                            coluna.x + 2,
                            y
                        );

                    }
                );


                y += 7;

            }
        );


        const nomeArquivo =
            `Mini-Pauta_${classeAtual}_${turmaDados.nome || "Turma"}_${disciplinaSelecionada}_${trimestreSelecionado}T.pdf`;


        pdf.save(
            nomeArquivo
        );

    }
    catch (erro) {

        console.error(
            "Erro PDF:",
            erro
        );


        alert(
            "Erro ao exportar PDF:\n\n" +
            erro.message
        );

    }

}


// ============================================================
// IMPRIMIR
// ============================================================

function imprimirPauta() {

    if (
        !alunos.length
    ) {

        alert(
            "Não existem alunos para imprimir."
        );

        return;

    }


    const janela =
        window.open(
            "",
            "_blank"
        );


    if (!janela) {

        alert(
            "O navegador bloqueou a janela de impressão."
        );

        return;

    }


    let linhas = "";


    alunos.forEach(
        aluno => {

            const nota =
                notasAtuais[
                    String(aluno.id)
                ] || {};


            linhas += `

                <tr>

                    <td>
                        ${aluno.numero || ""}
                    </td>

                    <td>
                        ${aluno.nome || ""}
                    </td>

                    <td>
                        ${aluno.sexo || ""}
                    </td>

                    <td>
                        ${aluno.idade || ""}
                    </td>

                    <td>
                        ${nota.MAC ?? ""}
                    </td>

                    <td>
                        ${nota.NPT ?? ""}
                    </td>

                    <td>
                        ${nota.MF ?? ""}
                    </td>

                    <td>
                        ${classificarNota(
                            nota.MF
                        )}
                    </td>

                </tr>

            `;

        }
    );


    janela.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                Mini-Pauta
            </title>

            <style>

                body{
                    font-family:Arial;
                    padding:20px;
                }

                h1{
                    text-align:center;
                    margin:0;
                }

                h2{
                    text-align:center;
                    margin:6px 0;
                }

                table{
                    width:100%;
                    border-collapse:collapse;
                    margin-top:20px;
                }

                th,
                td{
                    border:1px solid #000;
                    padding:6px;
                    text-align:center;
                }

                th{
                    background:#ddd;
                }

                td:nth-child(2){
                    text-align:left;
                }

                @media print{

                    body{
                        margin:0;
                    }

                }

            </style>

        </head>

        <body>

            <h1>
                ${
                    turmaDados.escola ||
                    turmaDados.nomeEscola ||
                    "SGE — Gestão Escolar"
                }
            </h1>

            <h2>
                Classe: ${classeAtual}
                |
                Turma: ${turmaDados.nome || ""}
            </h2>

            <h2>
                Disciplina:
                ${disciplinaSelecionada}
                |
                ${trimestreSelecionado}.º Trimestre
            </h2>

            <table>

                <thead>

                    <tr>

                        <th>Nº</th>

                        <th>Nome</th>

                        <th>Sexo</th>

                        <th>Idade</th>

                        <th>MAC</th>

                        <th>NPT</th>

                        <th>MF</th>

                        <th>Classificação</th>

                    </tr>

                </thead>

                <tbody>

                    ${linhas}

                </tbody>

            </table>

        </body>

        </html>

    `);


    janela.document.close();


    janela.focus();


    setTimeout(
        () => {

            janela.print();

        },
        500
    );

}


// ============================================================
// IMPORTAR NOTAS DO CAMPO DE TEXTO
// ============================================================

if (importExcel) {

    importExcel.addEventListener(
        "click",
        importarNotasTexto
    );

}


function importarNotasTexto() {

    if (
        !excelInput
    ) {

        return;

    }


    const texto =
        excelInput.value.trim();


    if (!texto) {

        alert(
            "Cole primeiro os dados das notas."
        );

        return;

    }


    const linhas =
        texto
            .split("\n")
            .map(
                linha =>
                    linha.trim()
            )
            .filter(Boolean);


    let importados = 0;


    linhas.forEach(
        linha => {

            const partes =
                linha.split(";");


            if (
                partes.length < 4
            ) {

                return;

            }


            const numero =
                partes[0].trim();


            const mac =
                partes[2].trim();


            const npt =
                partes[3].trim();


            const aluno =
                alunos.find(
                    item =>
                        String(
                            item.numero
                        ).trim()
                        === numero
                );


            if (!aluno) {

                return;

            }


            const macInput =
                document.querySelector(
                    `.mac[data-id="${aluno.id}"]`
                );


            const nptInput =
                document.querySelector(
                    `.npt[data-id="${aluno.id}"]`
                );


            if (
                macInput &&
                nptInput
            ) {

                macInput.value =
                    mac;

                nptInput.value =
                    npt;


                calcularMF(
                    aluno.id
                );


                importados++;

            }

        }
    );


    alert(
        `${importados} aluno(s) importado(s) com sucesso.`
    );

}


// ============================================================
// INICIAR SISTEMA
// ============================================================

iniciar();
