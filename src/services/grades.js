// =====================================================
// GRADES.JS — MINI-PAUTA DO PROFESSOR
// BLOCO 1/4
// =====================================================

alert("GRADES.JS — MINI-PAUTA CARREGADA ✅");

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// =====================================================
// PROFESSOR LOGADO
// =====================================================

const professor =
    JSON.parse(
        localStorage.getItem("professorLogado")
    );

if (!professor) {

    alert("Sessão do professor não encontrada.");

    window.location.href = "login-professor.html";

    throw new Error(
        "Professor não autenticado."
    );
}


// =====================================================
// ELEMENTOS HTML
// =====================================================

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

const professorInfo =
    document.getElementById("professorInfo");

const classeInfo =
    document.getElementById("classeInfo");

const turmaInfo =
    document.getElementById("turmaInfo");

const estadoTexto =
    document.getElementById("estadoTexto");

const estadoIcone =
    document.getElementById("estadoIcone");

const mensagem =
    document.getElementById("mensagem");


// =====================================================
// ESTADO
// =====================================================

let turmaSelecionada = "";

let disciplinaSelecionada = "";

let trimestreSelecionado = "";

let alunos = [];

let dadosProfessor = {};

let dadosTurma = {};

let pautaAtual = null;


// =====================================================
// MOSTRAR INFORMAÇÕES DO PROFESSOR
// =====================================================

professorInfo.textContent =
    `Professor: ${
        professor.nome ||
        professor.nomeCompleto ||
        "—"
    }`;


// =====================================================
// FUNÇÃO DE MENSAGEM
// =====================================================

function mostrarMensagem(
    texto,
    tipo = "aviso"
) {

    mensagem.textContent = texto;

    mensagem.className =
        `mensagem ${tipo}`;

}


// =====================================================
// LIMPAR MENSAGEM
// =====================================================

function limparMensagem() {

    mensagem.textContent = "";

    mensagem.className =
        "mensagem";

}


// =====================================================
// ESTADO DA PAUTA
// =====================================================

function atualizarEstado(
    texto,
    icone = "⏳",
    classe = ""
) {

    estadoTexto.textContent =
        texto;

    estadoIcone.textContent =
        icone;

    estadoTexto.className =
        `estado-texto ${classe}`;

}


// =====================================================
// INICIAR
// =====================================================

async function iniciar() {

    try {

        limparMensagem();

        atualizarEstado(
            "A carregar as atribuições do professor...",
            "⏳"
        );

        await carregarProfessor();

        await carregarTurmasProfessor();

        bloquearSelecoesIniciais();

        atualizarEstado(
            "Selecione a turma, disciplina e trimestre.",
            "⏳"
        );

    }
    catch (erro) {

        console.error(
            "Erro ao iniciar Mini-Pauta:",
            erro
        );

        mostrarMensagem(
            "Erro ao iniciar a Mini-Pauta: " +
            erro.message,
            "erro"
        );

    }

}


// =====================================================
// CARREGAR PROFESSOR
// =====================================================

async function carregarProfessor() {

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

    if (!professorSnap.exists()) {

        throw new Error(
            "Professor não encontrado no Firestore."
        );

    }

    dadosProfessor =
        professorSnap.data();

    console.log(
        "Professor:",
        dadosProfessor
    );

}


// =====================================================
// BLOQUEAR SELEÇÕES
// =====================================================

function bloquearSelecoesIniciais() {

    subject.disabled = true;

    trimestreSelect.disabled = true;

}


// =====================================================
// CARREGAR TURMAS DO PROFESSOR
// =====================================================

async function carregarTurmasProfessor() {

    classSelect.innerHTML = `
        <option value="">
            Selecionar turma
        </option>
    `;

    const turmasProfessor =
        Array.isArray(
            dadosProfessor.turmas
        )
            ? dadosProfessor.turmas
            : [];

    if (
        turmasProfessor.length === 0
    ) {

        mostrarMensagem(
            "Nenhuma turma foi atribuída a este professor.",
            "aviso"
        );

        return;

    }


    for (
        const turmaId
        of turmasProfessor
    ) {

        try {

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

            if (!turmaSnap.exists()) {
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
                turma.nome ||
                turma.turma ||
                turmaId;

            option.dataset.classe =
                turma.classe ||
                "";

            classSelect.appendChild(
                option
            );

        }
        catch (erro) {

            console.error(
                "Erro ao carregar turma:",
                turmaId,
                erro
            );

        }

    }

}


// =====================================================
// EVENTO — ESCOLHER TURMA
// =====================================================

classSelect.addEventListener(
    "change",
    async function () {

        turmaSelecionada =
            this.value;

        disciplinaSelecionada = "";

        trimestreSelecionado = "";

        pautaAtual = null;

        subject.innerHTML = `
            <option value="">
                Selecionar disciplina
            </option>
        `;

        subject.disabled = true;

        trimestreSelect.value = "";

        trimestreSelect.disabled = true;

        pautaBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Selecione a disciplina e o trimestre.
                </td>
            </tr>
        `;

        limparMensagem();

        if (!turmaSelecionada) {

            turmaInfo.textContent =
                "Turma: —";

            classeInfo.textContent =
                "Classe: —";

            atualizarEstado(
                "Selecione uma turma.",
                "⏳"
            );

            return;

        }


        try {

            await carregarDadosTurma();

            await carregarDisciplinasProfessor();

            atualizarEstado(
                "Agora selecione a disciplina.",
                "📚"
            );

        }
        catch (erro) {

            console.error(
                erro
            );

            mostrarMensagem(
                erro.message,
                "erro"
            );

        }

    }
);


// =====================================================
// CARREGAR DADOS DA TURMA
// =====================================================

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

    if (!turmaSnap.exists()) {

        throw new Error(
            "A turma selecionada não foi encontrada."
        );

    }

    dadosTurma =
        turmaSnap.data();

    turmaInfo.textContent =
        `Turma: ${
            dadosTurma.nome ||
            dadosTurma.turma ||
            "—"
        }`;

    classeInfo.textContent =
        `Classe: ${
            dadosTurma.classe ||
            "—"
        }`;

}


// =====================================================
// CARREGAR DISCIPLINAS DO PROFESSOR
// =====================================================

async function carregarDisciplinasProfessor() {

    subject.innerHTML = `
        <option value="">
            Selecionar disciplina
        </option>
    `;


    /*
    As disciplinas continuam a vir
    das atribuições do professor.
    */

    let disciplinas =
        Array.isArray(
            dadosProfessor.disciplinas
        )
            ? [...dadosProfessor.disciplinas]
            : [];


    /*
    Remover duplicadas.
    */

    disciplinas =
        [
            ...new Set(
                disciplinas
                    .map(
                        d => String(d).trim()
                    )
                    .filter(Boolean)
            )
        ];


    if (
        disciplinas.length === 0
    ) {

        mostrarMensagem(
            "Nenhuma disciplina foi atribuída a este professor.",
            "aviso"
        );

        return;

    }


    disciplinas
        .sort(
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


    subject.disabled = false;

}


// =====================================================
// EVENTO — ESCOLHER DISCIPLINA
// =====================================================

subject.addEventListener(
    "change",
    async function () {

        disciplinaSelecionada =
            this.value;

        trimestreSelecionado = "";

        trimestreSelect.value = "";

        pautaBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Selecione o trimestre.
                </td>
            </tr>
        `;

        limparMensagem();

        if (!disciplinaSelecionada) {

            trimestreSelect.disabled = true;

            atualizarEstado(
                "Selecione a disciplina.",
                "📚"
            );

            return;

        }


        /*
        IMPORTANTE:
        existe apenas UM seletor de trimestre.
        */

        trimestreSelect.disabled = false;

        atualizarEstado(
            "Agora selecione o trimestre.",
            "📅"
        );

    }
);


// =====================================================
// EVENTO — ESCOLHER TRIMESTRE
// =====================================================

trimestreSelect.addEventListener(
    "change",
    async function () {

        trimestreSelecionado =
            this.value;

        pautaAtual = null;

        pautaBody.innerHTML = `
            <tr>
                <td colspan="5">
                    A preparar pauta...
                </td>
            </tr>
        `;

        limparMensagem();

        if (
            !turmaSelecionada ||
            !disciplinaSelecionada ||
            !trimestreSelecionado
        ) {

            atualizarEstado(
                "Selecione turma, disciplina e trimestre.",
                "⏳"
            );

            return;

        }


        try {

            await carregarPauta();

        }
        catch (erro) {

            console.error(
                erro
            );

            mostrarMensagem(
                "Erro ao carregar pauta: " +
                erro.message,
                "erro"
            );

        }

    }
);


// =====================================================
// INICIAR SISTEMA
// =====================================================

iniciar();

// =====================================================
// GRADES.JS — MINI-PAUTA DO PROFESSOR
// BLOCO 2/4
// ALUNOS + NOTAS + MF
// =====================================================


// =====================================================
// CARREGAR PAUTA
// =====================================================

async function carregarPauta() {

    pautaBody.innerHTML = `
        <tr>
            <td colspan="5">
                ⏳ A carregar alunos...
            </td>
        </tr>
    `;


    atualizarEstado(
        "A carregar a Mini-Pauta...",
        "⏳"
    );


    // -----------------------------------------------
    // CARREGAR ALUNOS
    // -----------------------------------------------

    const alunosSnapshot =
        await getDocs(
            collection(
                db,
                "turmas",
                turmaSelecionada,
                "alunos"
            )
        );


    alunos = [];


    alunosSnapshot.forEach(
        documento => {

            alunos.push({

                id:
                    documento.id,

                ...documento.data()

            });

        }
    );


    // -----------------------------------------------
    // ORDENAR ALUNOS
    // -----------------------------------------------

    alunos.sort(
        (a,b) => {

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


    if (
        alunos.length === 0
    ) {

        pautaBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Nenhum aluno encontrado nesta turma.
                </td>
            </tr>
        `;

        atualizarEstado(
            "A turma não possui alunos.",
            "⚠️"
        );

        return;

    }


    // -----------------------------------------------
    // BUSCAR NOTAS JÁ LANÇADAS
    // -----------------------------------------------

    pautaAtual =
        await obterNotasDaPauta();


    // -----------------------------------------------
    // MOSTRAR TABELA
    // -----------------------------------------------

    mostrarPauta();


    atualizarEstado(
        "Mini-Pauta pronta para lançamento.",
        "📝",
        "estado-aberto"
    );

}


// =====================================================
// OBTER NOTAS DA PAUTA
// =====================================================

async function obterNotasDaPauta() {

    /*
    Documento único para cada:

    TURMA + DISCIPLINA + TRIMESTRE

    Isso evita criar vários lançamentos
    duplicados para o mesmo período.
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
        !pautaSnap.exists()
    ) {

        return {

            existe: false,

            alunos: {}

        };

    }


    const dados =
        pautaSnap.data();


    const mapaAlunos = {};


    /*
    O documento pode guardar
    alunos como array.
    */

    if (
        Array.isArray(
            dados.alunos
        )
    ) {

        dados.alunos.forEach(
            aluno => {

                if (
                    aluno.alunoId
                ) {

                    mapaAlunos[
                        aluno.alunoId
                    ] = aluno;

                }

            }
        );

    }


    /*
    Compatibilidade com estrutura
    antiga, caso exista.
    */

    if (
        Array.isArray(
            dados.notas
        )
    ) {

        dados.notas.forEach(
            aluno => {

                if (
                    aluno.alunoId
                ) {

                    mapaAlunos[
                        aluno.alunoId
                    ] = aluno;

                }

            }
        );

    }


    return {

        existe: true,

        alunos:
            mapaAlunos,

        dados

    };

}


// =====================================================
// CRIAR ID ÚNICO DA PAUTA
// =====================================================

function criarIdPauta() {

    return (

        String(turmaSelecionada)
        .trim()
        .replace(
            /\s+/g,
            "_"
        )

        + "_"

        +

        String(disciplinaSelecionada)
        .trim()
        .replace(
            /\s+/g,
            "_"
        )

        + "_"

        +

        String(trimestreSelecionado)
        .trim()

    );

}


// =====================================================
// MOSTRAR PAUTA
// =====================================================

function mostrarPauta() {

    pautaBody.innerHTML = "";


    alunos.forEach(
        aluno => {

            const nota =
                pautaAtual?.alunos?.[
                    aluno.id
                ] || {};


            const mac =
                nota.MAC !== undefined
                    ? nota.MAC
                    : "";


            const npt =
                nota.NPT !== undefined
                    ? nota.NPT
                    : "";


            let mf =
                nota.MF !== undefined
                    ? nota.MF
                    : "";


            /*
            Se MAC e NPT existirem,
            recalcular MF.
            */

            if (
                mac !== "" &&
                npt !== ""
            ) {

                mf =
                    calcularMedia(
                        mac,
                        npt
                    );

            }


            const tr =
                document.createElement(
                    "tr"
                );


            tr.dataset.alunoId =
                aluno.id;


            tr.innerHTML = `

                <td>
                    ${
                        aluno.numero ||
                        ""
                    }
                </td>

                <td class="nome">
                    ${
                        escaparHTML(
                            aluno.nome ||
                            "Aluno sem nome"
                        )
                    }
                </td>

                <td>

                    <input
                        class="nota mac"
                        data-id="${aluno.id}"
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value="${mac}"
                        placeholder="—"
                    >

                </td>

                <td>

                    <input
                        class="nota npt"
                        data-id="${aluno.id}"
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value="${npt}"
                        placeholder="—"
                    >

                </td>

                <td
                    class="mf"
                    id="mf-${aluno.id}"
                >

                    ${mf === "" ? "—" : mf}

                </td>

            `;


            pautaBody.appendChild(
                tr
            );

        }
    );


    ativarCalculoNotas();

}


// =====================================================
// ESCAPAR HTML
// =====================================================

function escaparHTML(valor) {

    return String(valor)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// CALCULAR MÉDIA
// =====================================================

function calcularMedia(
    mac,
    npt
) {

    const valorMAC =
        Number(mac);

    const valorNPT =
        Number(npt);


    if (
        Number.isNaN(valorMAC) ||
        Number.isNaN(valorNPT)
    ) {

        return "";

    }


    return Number(
        (
            (valorMAC + valorNPT) /
            2
        ).toFixed(1)
    );

}


// =====================================================
// ATIVAR CÁLCULO AUTOMÁTICO
// =====================================================

function ativarCalculoNotas() {

    const inputs =
        pautaBody.querySelectorAll(
            ".nota"
        );


    inputs.forEach(
        input => {

            input.addEventListener(
                "input",
                function () {

                    const alunoId =
                        this.dataset.id;


                    const linha =
                        pautaBody.querySelector(
                            `tr[data-aluno-id="${alunoId}"]`
                        );


                    if (!linha) {
                        return;
                    }


                    const macInput =
                        linha.querySelector(
                            ".mac"
                        );


                    const nptInput =
                        linha.querySelector(
                            ".npt"
                        );


                    const mfElemento =
                        linha.querySelector(
                            ".mf"
                        );


                    const mac =
                        macInput.value;


                    const npt =
                        nptInput.value;


                    /*
                    Se um dos campos estiver vazio,
                    não mostrar MF.
                    */

                    if (
                        mac === "" ||
                        npt === ""
                    ) {

                        mfElemento.textContent =
                            "—";

                        mfElemento.classList
                            .remove(
                                "mf-reprovado"
                            );

                        return;

                    }


                    const mf =
                        calcularMedia(
                            mac,
                            npt
                        );


                    mfElemento.textContent =
                        mf;


                    /*
                    Classificação visual.
                    */

                    const limite =
                        obterLimiteAprovacao();


                    if (
                        Number(mf) < limite
                    ) {

                        mfElemento.classList
                            .add(
                                "mf-reprovado"
                            );

                    }
                    else {

                        mfElemento.classList
                            .remove(
                                "mf-reprovado"
                            );

                    }

                }
            );

        }
    );

}


// =====================================================
// LIMITE DE APROVAÇÃO
// =====================================================

function obterLimiteAprovacao() {

    /*
    Ensino Primário:
    escala 0–10 e aprovação a partir de 5.

    Primeiro Ciclo:
    escala 0–20 e aprovação a partir de 10.
    */


    const ensino =
        String(
            dadosTurma.ensino ||
            ""
        ).toLowerCase();


    if (
        ensino.includes(
            "prim"
        )
    ) {

        return 5;

    }


    return 10;

}


// =====================================================
// LIMPAR NOTAS DA TELA
// =====================================================

limparNotas.addEventListener(
    "click",
    function () {

        if (
            !turmaSelecionada ||
            !disciplinaSelecionada ||
            !trimestreSelecionado
        ) {

            mostrarMensagem(
                "Selecione primeiro a turma, disciplina e trimestre.",
                "aviso"
            );

            return;

        }


        const confirmar =
            confirm(
                "Tem certeza que deseja limpar as notas que estão preenchidas na tela?"
            );


        if (!confirmar) {
            return;
        }


        pautaBody
            .querySelectorAll(
                "input.nota"
            )
            .forEach(
                input => {

                    input.value = "";

                }
            );


        pautaBody
            .querySelectorAll(
                ".mf"
            )
            .forEach(
                elemento => {

                    elemento.textContent =
                        "—";

                    elemento.classList
                        .remove(
                            "mf-reprovado"
                        );

                }
            );


        limparMensagem();


        atualizarEstado(
            "Notas limpas apenas da tela.",
            "🧹"
        );

    }
);

// =====================================================
// GRADES.JS — MINI-PAUTA DO PROFESSOR
// BLOCO 3/4
// GUARDAR NOTAS + CONTROLO DE LANÇAMENTO
// =====================================================


// =====================================================
// VERIFICAR CONFIGURAÇÃO DO LANÇAMENTO
// =====================================================

async function verificarEstadoLancamento() {

    /*
    Configuração global:

    config/notas

    Exemplo:

    {
        lancamentoAtivo: true,

        trimestres: {
            "1": {
                aberto: true,
                fechado: false
            },
            "2": {
                aberto: false,
                fechado: false
            },
            "3": {
                aberto: false,
                fechado: false
            }
        }
    }
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


        /*
        Se ainda não existe configuração,
        permitir o primeiro trimestre.
        */

        if (!snap.exists()) {

            return {

                lancamentoAtivo: true,

                trimestreAberto: true,

                trimestreFechado: false

            };

        }


        const config =
            snap.data();


        /*
        Lançamento global.
        */

        const lancamentoAtivo =
            config.lancamentoAtivo !== false;


        /*
        Configuração do trimestre.
        */

        const trimestreConfig =
            config?.trimestres?.[
                String(
                    trimestreSelecionado
                )
            ] || {};


        /*
        Compatibilidade com nomes
        diferentes usados no sistema.
        */

        const fechado =
            trimestreConfig.fechado === true;


        const aberto =
            trimestreConfig.aberto !== false &&
            !fechado;


        return {

            lancamentoAtivo,

            trimestreAberto:
                aberto,

            trimestreFechado:
                fechado

        };

    }
    catch (erro) {

        console.error(
            "Erro ao verificar estado do lançamento:",
            erro
        );


        /*
        Em caso de erro,
        bloquear por segurança.
        */

        return {

            lancamentoAtivo: false,

            trimestreAberto: false,

            trimestreFechado: false

        };

    }

}


// =====================================================
// APLICAR BLOQUEIO NA TELA
// =====================================================

async function atualizarPermissaoPauta() {

    if (
        !turmaSelecionada ||
        !disciplinaSelecionada ||
        !trimestreSelecionado
    ) {

        return;

    }


    const estado =
        await verificarEstadoLancamento();


    const inputs =
        pautaBody.querySelectorAll(
            "input.nota"
        );


    const podeEditar =
        estado.lancamentoAtivo &&
        estado.trimestreAberto;


    inputs.forEach(
        input => {

            input.disabled =
                !podeEditar;

        }
    );


    saveGrades.disabled =
        !podeEditar;


    if (!podeEditar) {

        saveGrades.classList.add(
            "botao-bloqueado"
        );

    }
    else {

        saveGrades.classList.remove(
            "botao-bloqueado"
        );

    }


    /*
    Mensagem correspondente.
    */

    if (
        estado.trimestreFechado
    ) {

        atualizarEstado(
            "Este trimestre está fechado. Não é possível alterar notas.",
            "🔒",
            "estado-fechado"
        );

        mostrarMensagem(
            "O administrador fechou este trimestre. O lançamento está bloqueado.",
            "aviso"
        );

        return;

    }


    if (
        !estado.lancamentoAtivo
    ) {

        atualizarEstado(
            "O lançamento de notas está desligado.",
            "🔒",
            "estado-bloqueado"
        );

        mostrarMensagem(
            "O administrador desligou o lançamento de notas.",
            "aviso"
        );

        return;

    }


    if (
        estado.trimestreAberto
    ) {

        atualizarEstado(
            "Lançamento aberto. Pode introduzir ou alterar notas.",
            "🟢",
            "estado-aberto"
        );

        limparMensagem();

    }

}


// =====================================================
// VERIFICAR ANTES DE GUARDAR
// =====================================================

async function podeGuardar() {

    const estado =
        await verificarEstadoLancamento();


    if (
        estado.trimestreFechado
    ) {

        mostrarMensagem(
            "Este trimestre já foi fechado pelo administrador. Não é possível guardar alterações.",
            "erro"
        );

        return false;

    }


    if (
        !estado.lancamentoAtivo
    ) {

        mostrarMensagem(
            "O lançamento de notas está desligado pelo administrador.",
            "erro"
        );

        return false;

    }


    if (
        !estado.trimestreAberto
    ) {

        mostrarMensagem(
            "Este trimestre não está aberto para lançamento.",
            "erro"
        );

        return false;

    }


    return true;

}


// =====================================================
// VALIDAR NOTAS
// =====================================================

function validarNotas() {

    const linhas =
        pautaBody.querySelectorAll(
            "tr[data-aluno-id]"
        );


    const limiteMaximo =
        obterLimiteMaximo();


    for (
        const linha
        of linhas
    ) {

        const macInput =
            linha.querySelector(
                ".mac"
            );


        const nptInput =
            linha.querySelector(
                ".npt"
            );


        if (
            !macInput ||
            !nptInput
        ) {

            continue;

        }


        const mac =
            macInput.value.trim();


        const npt =
            nptInput.value.trim();


        /*
        Permitir aluno ainda sem nota.
        */

        if (
            mac === "" &&
            npt === ""
        ) {

            continue;

        }


        /*
        Não permitir apenas uma nota.
        */

        if (
            mac === "" ||
            npt === ""
        ) {

            const nome =
                linha.children[1]
                    ?.textContent
                    ?.trim() ||
                "Aluno";


            return {

                valido: false,

                mensagem:
                    `Preencha MAC e NPT do aluno: ${nome}.`

            };

        }


        const valorMAC =
            Number(mac);


        const valorNPT =
            Number(npt);


        if (
            Number.isNaN(valorMAC) ||
            Number.isNaN(valorNPT)
        ) {

            return {

                valido: false,

                mensagem:
                    "Existem notas inválidas na pauta."

            };

        }


        if (
            valorMAC < 0 ||
            valorMAC > limiteMaximo
        ) {

            const nome =
                linha.children[1]
                    ?.textContent
                    ?.trim() ||
                "Aluno";


            return {

                valido: false,

                mensagem:
                    `A nota MAC do aluno ${nome} deve estar entre 0 e ${limiteMaximo}.`

            };

        }


        if (
            valorNPT < 0 ||
            valorNPT > limiteMaximo
        ) {

            const nome =
                linha.children[1]
                    ?.textContent
                    ?.trim() ||
                "Aluno";


            return {

                valido: false,

                mensagem:
                    `A nota NPT do aluno ${nome} deve estar entre 0 e ${limiteMaximo}.`

            };

        }

    }


    return {

        valido: true,

        mensagem: ""

    };

}


// =====================================================
// LIMITE MÁXIMO DA NOTA
// =====================================================

function obterLimiteMaximo() {

    const ensino =
        String(
            dadosTurma.ensino ||
            ""
        ).toLowerCase();


    if (
        ensino.includes(
            "prim"
        )
    ) {

        return 10;

    }


    return 20;

}


// =====================================================
// GUARDAR MINI-PAUTA
// =====================================================

saveGrades.addEventListener(
    "click",
    async function () {

        /*
        Evitar duplo clique.
        */

        if (
            saveGrades.disabled
        ) {

            return;

        }


        if (
            !turmaSelecionada ||
            !disciplinaSelecionada ||
            !trimestreSelecionado
        ) {

            mostrarMensagem(
                "Selecione turma, disciplina e trimestre.",
                "aviso"
            );

            return;

        }


        /*
        Verificar se o administrador
        permite o lançamento.
        */

        const permitido =
            await podeGuardar();


        if (!permitido) {

            return;

        }


        /*
        Validar notas.
        */

        const validacao =
            validarNotas();


        if (
            !validacao.valido
        ) {

            mostrarMensagem(
                validacao.mensagem,
                "erro"
            );

            return;

        }


        /*
        Evitar múltiplos cliques.
        */

        const textoOriginal =
            saveGrades.textContent;


        saveGrades.disabled =
            true;


        saveGrades.textContent =
            "⏳ A guardar...";


        try {

            const idPauta =
                criarIdPauta();


            const alunosNotas = [];


            const linhas =
                pautaBody.querySelectorAll(
                    "tr[data-aluno-id]"
                );


            linhas.forEach(
                linha => {

                    const alunoId =
                        linha.dataset.alunoId;


                    const aluno =
                        alunos.find(
                            item =>
                                item.id ===
                                alunoId
                        );


                    if (!aluno) {
                        return;
                    }


                    const macInput =
                        linha.querySelector(
                            ".mac"
                        );


                    const nptInput =
                        linha.querySelector(
                            ".npt"
                        );


                    const mfElemento =
                        linha.querySelector(
                            ".mf"
                        );


                    const mac =
                        macInput.value === ""
                            ? null
                            : Number(
                                macInput.value
                            );


                    const npt =
                        nptInput.value === ""
                            ? null
                            : Number(
                                nptInput.value
                            );


                    const mf =
                        (
                            mac !== null &&
                            npt !== null
                        )
                            ? calcularMedia(
                                mac,
                                npt
                            )
                            : null;


                    /*
                    Guardar somente
                    alunos identificados.
                    */

                    alunosNotas.push({

                        alunoId,

                        numero:
                            aluno.numero ||
                            "",

                        nome:
                            aluno.nome ||
                            "",

                        sexo:
                            aluno.sexo ||
                            "",

                        idade:
                            aluno.idade ||
                            "",

                        MAC:
                            mac,

                        NPT:
                            npt,

                        MF:
                            mf

                    });

                }
            );


            /*
            Guardar documento único.
            */

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
                        dadosTurma.nome ||
                        dadosTurma.turma ||
                        "",

                    classe:
                        dadosTurma.classe ||
                        "",

                    disciplina:
                        disciplinaSelecionada,

                    trimestre:
                        trimestreSelecionado,

                    professorId:
                        professor.id,

                    professorNome:
                        dadosProfessor.nome ||
                        dadosProfessor.nomeCompleto ||
                        professor.nome ||
                        "",

                    alunos:
                        alunosNotas,

                    atualizadoEm:
                        serverTimestamp(),

                    criadoEm:
                        pautaAtual?.dados?.criadoEm ||
                        serverTimestamp()

                },

                {
                    merge: true
                }

            );


            /*
            Atualizar memória local.
            */

            pautaAtual = {

                existe: true,

                alunos:
                    Object.fromEntries(
                        alunosNotas.map(
                            aluno => [
                                aluno.alunoId,
                                aluno
                            ]
                        )
                    ),

                dados: {

                    turmaId:
                        turmaSelecionada,

                    disciplina:
                        disciplinaSelecionada,

                    trimestre:
                        trimestreSelecionado

                }

            };


            mostrarMensagem(
                "Mini-Pauta guardada com sucesso ✅",
                "sucesso"
            );


            atualizarEstado(
                "Notas guardadas. Pode continuar a editar enquanto o lançamento estiver aberto.",
                "✅",
                "estado-aberto"
            );


        }
        catch (erro) {

            console.error(
                "Erro ao guardar Mini-Pauta:",
                erro
            );


            mostrarMensagem(
                "Erro ao guardar notas: " +
                erro.message,
                "erro"
            );

        }
        finally {

            saveGrades.disabled =
                false;


            saveGrades.textContent =
                textoOriginal;


            /*
            Reaplicar a permissão,
            pois o administrador pode
            ter alterado o estado.
            */

            await atualizarPermissaoPauta();

        }

    }
);


// =====================================================
// ATUALIZAR PERMISSÃO APÓS CARREGAR PAUTA
// =====================================================

const atualizarPermissaoOriginal =
    atualizarPermissaoPauta;


// Substituir comportamento do carregamento
// para verificar o estado administrativo.

const observerPauta =
    new MutationObserver(
        async function () {

            if (
                turmaSelecionada &&
                disciplinaSelecionada &&
                trimestreSelecionado
            ) {

                await atualizarPermissaoOriginal();

            }

        }
    );


observerPauta.observe(
    pautaBody,
    {
        childList: true
    }
);


// =====================================================
// GRADES.JS — MINI-PAUTA DO PROFESSOR
// BLOCO 4/4
// CLASSIFICAÇÃO + EXPORTAÇÃO + IMPRESSÃO + FINALIZAÇÃO
// =====================================================


// =====================================================
// CLASSIFICAÇÃO
// =====================================================

function classificarNota(nota) {

    const valor =
        Number(nota);

    const ensino =
        String(
            dadosTurma.ensino ||
            ""
        ).toLowerCase();


    if (
        ensino.includes("prim")
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


    // =============================================
    // PRIMEIRO CICLO
    // =============================================

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


// =====================================================
// ATUALIZAR CLASSIFICAÇÃO VISUAL
// =====================================================

function atualizarClassificacoes() {

    pautaBody
        .querySelectorAll(
            "tr[data-aluno-id]"
        )
        .forEach(
            linha => {

                const mfElemento =
                    linha.querySelector(
                        ".mf"
                    );


                if (!mfElemento) {
                    return;
                }


                const valor =
                    Number(
                        mfElemento.textContent
                    );


                if (
                    Number.isNaN(valor)
                ) {

                    return;

                }


                mfElemento.title =
                    classificarNota(
                        valor
                    );

            }
        );

}


// =====================================================
// ATUALIZAR PERMISSÃO PERIODICAMENTE
// =====================================================

setInterval(
    async function () {

        if (
            turmaSelecionada &&
            disciplinaSelecionada &&
            trimestreSelecionado
        ) {

            try {

                await atualizarPermissaoPauta();

            }
            catch (erro) {

                console.error(
                    "Erro ao atualizar estado:",
                    erro
                );

            }

        }

    },
    30000
);


// =====================================================
// CRIAR BOTÕES DE EXPORTAÇÃO
// =====================================================

function criarBotoesExportacao() {

    const acoes =
        document.querySelector(
            ".acoes"
        );


    if (!acoes) {
        return;
    }


    /*
    Evitar criar duas vezes.
    */

    if (
        document.getElementById(
            "exportarExcel"
        )
    ) {

        return;

    }


    // =============================================
    // BOTÃO EXCEL
    // =============================================

    const excel =
        document.createElement(
            "button"
        );

    excel.id =
        "exportarExcel";

    excel.type =
        "button";

    excel.textContent =
        "📊 Excel";


    // =============================================
    // BOTÃO PDF
    // =============================================

    const pdf =
        document.createElement(
            "button"
        );

    pdf.id =
        "exportarPDF";

    pdf.type =
        "button";

    pdf.textContent =
        "📄 PDF";


    // =============================================
    // BOTÃO IMPRIMIR
    // =============================================

    const imprimir =
        document.createElement(
            "button"
        );

    imprimir.id =
        "imprimirPauta";

    imprimir.type =
        "button";

    imprimir.textContent =
        "🖨️ Imprimir";


    acoes.appendChild(
        excel
    );

    acoes.appendChild(
        pdf
    );

    acoes.appendChild(
        imprimir
    );


    excel.addEventListener(
        "click",
        exportarExcel
    );


    pdf.addEventListener(
        "click",
        exportarPDF
    );


    imprimir.addEventListener(
        "click",
        imprimirPauta
    );

}


// =====================================================
// VERIFICAR PAUTA PARA EXPORTAÇÃO
// =====================================================

function verificarPautaExportacao() {

    if (
        !turmaSelecionada ||
        !disciplinaSelecionada ||
        !trimestreSelecionado
    ) {

        mostrarMensagem(
            "Selecione turma, disciplina e trimestre antes de exportar.",
            "aviso"
        );

        return false;

    }


    if (
        !alunos.length
    ) {

        mostrarMensagem(
            "Não existem alunos para exportar.",
            "aviso"
        );

        return false;

    }


    return true;

}


// =====================================================
// OBTER DADOS DA TABELA
// =====================================================

function obterDadosTabela() {

    const dados = [];


    const linhas =
        pautaBody.querySelectorAll(
            "tr[data-aluno-id]"
        );


    linhas.forEach(
        linha => {

            const numero =
                linha.children[0]
                    ?.textContent
                    ?.trim() || "";


            const nome =
                linha.children[1]
                    ?.textContent
                    ?.trim() || "";


            const macInput =
                linha.querySelector(
                    ".mac"
                );


            const nptInput =
                linha.querySelector(
                    ".npt"
                );


            const mf =
                linha.querySelector(
                    ".mf"
                )
                ?.textContent
                ?.trim() || "";


            const aluno =
                alunos.find(
                    item =>
                        item.id ===
                        linha.dataset.alunoId
                );


            dados.push({

                numero,

                nome,

                sexo:
                    aluno?.sexo ||
                    "",

                idade:
                    aluno?.idade ||
                    "",

                MAC:
                    macInput?.value ||
                    "",

                NPT:
                    nptInput?.value ||
                    "",

                MF:
                    mf === "—"
                        ? ""
                        : mf,

                classificacao:
                    mf !== "" &&
                    mf !== "—"
                        ? classificarNota(
                            mf
                        )
                        : ""

            });

        }
    );


    return dados;

}


// =====================================================
// EXPORTAR EXCEL
// =====================================================

function exportarExcel() {

    if (
        !verificarPautaExportacao()
    ) {

        return;

    }


    const dados =
        obterDadosTabela();


    if (
        !dados.length
    ) {

        return;

    }


    /*
    Carregar SheetJS automaticamente.
    */

    if (
        typeof XLSX ===
        "undefined"
    ) {

        const script =
            document.createElement(
                "script"
            );

        script.src =
            "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";


        script.onload =
            function () {

                gerarExcel();

            };


        script.onerror =
            function () {

                alert(
                    "Não foi possível carregar o exportador Excel."
                );

            };


        document.head.appendChild(
            script
        );

        return;

    }


    gerarExcel();


    function gerarExcel() {

        const dados =
            obterDadosTabela();


        const linhas = [

            [
                "MINI-PAUTA"
            ],

            [
                "Professor",
                dadosProfessor.nome ||
                dadosProfessor.nomeCompleto ||
                professor.nome ||
                ""
            ],

            [
                "Classe",
                dadosTurma.classe ||
                ""
            ],

            [
                "Turma",
                dadosTurma.nome ||
                dadosTurma.turma ||
                ""
            ],

            [
                "Disciplina",
                disciplinaSelecionada
            ],

            [
                "Trimestre",
                `${trimestreSelecionado}º Trimestre`
            ],

            [],

            [
                "Nº",
                "Nome Completo",
                "Sexo",
                "Idade",
                "MAC",
                "NPT",
                "MF",
                "Classificação"
            ]

        ];


        dados.forEach(
            aluno => {

                linhas.push([

                    aluno.numero,

                    aluno.nome,

                    aluno.sexo,

                    aluno.idade,

                    aluno.MAC,

                    aluno.NPT,

                    aluno.MF,

                    aluno.classificacao

                ]);

            }
        );


        const worksheet =
            XLSX.utils.aoa_to_sheet(
                linhas
            );


        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Mini-Pauta"
        );


        const nomeArquivo =
            `Mini-Pauta-${limparNomeArquivo(
                dadosTurma.nome ||
                "Turma"
            )}-${limparNomeArquivo(
                disciplinaSelecionada
            )}-${trimestreSelecionado}T.xlsx`;


        XLSX.writeFile(
            workbook,
            nomeArquivo
        );


        mostrarMensagem(
            "Excel exportado com sucesso ✅",
            "sucesso"
        );

    }

}


// =====================================================
// EXPORTAR PDF
// =====================================================

function exportarPDF() {

    if (
        !verificarPautaExportacao()
    ) {

        return;

    }


    /*
    Carregar jsPDF automaticamente.
    */

    if (
        typeof window.jspdf ===
        "undefined"
    ) {

        const script =
            document.createElement(
                "script"
            );


        script.src =
            "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";


        script.onload =
            function () {

                carregarAutoTable();

            };


        script.onerror =
            function () {

                alert(
                    "Não foi possível carregar o exportador PDF."
                );

            };


        document.head.appendChild(
            script
        );


        return;

    }


    carregarAutoTable();


    function carregarAutoTable() {

        if (
            typeof window.jspdf
                .jsPDF
                === "undefined"
        ) {

            alert(
                "Biblioteca PDF não disponível."
            );

            return;

        }


        if (
            typeof window.jspdf
                .jsPDF
                .prototype
                .autoTable
                !== "function"
        ) {

            const script =
                document.createElement(
                    "script"
                );


            script.src =
                "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js";


            script.onload =
                function () {

                    gerarPDF();

                };


            document.head.appendChild(
                script
            );

        }
        else {

            gerarPDF();

        }

    }


    function gerarPDF() {

        const {
            jsPDF
        } = window.jspdf;


        const pdf =
            new jsPDF(
                "l",
                "mm",
                "a4"
            );


        const dados =
            obterDadosTabela();


        pdf.setFontSize(
            16
        );


        pdf.text(
            "MINI-PAUTA",
            14,
            15
        );


        pdf.setFontSize(
            10
        );


        pdf.text(
            `Professor: ${
                dadosProfessor.nome ||
                dadosProfessor.nomeCompleto ||
                professor.nome ||
                ""
            }`,
            14,
            23
        );


        pdf.text(
            `Classe: ${
                dadosTurma.classe ||
                ""
            }`,
            14,
            29
        );


        pdf.text(
            `Turma: ${
                dadosTurma.nome ||
                dadosTurma.turma ||
                ""
            }`,
            14,
            35
        );


        pdf.text(
            `Disciplina: ${
                disciplinaSelecionada
            }`,
            80,
            23
        );


        pdf.text(
            `Trimestre: ${
                trimestreSelecionado
            }º`,
            80,
            29
        );


        const corpo =
            dados.map(
                aluno => [

                    aluno.numero,

                    aluno.nome,

                    aluno.sexo,

                    aluno.idade,

                    aluno.MAC,

                    aluno.NPT,

                    aluno.MF,

                    aluno.classificacao

                ]
            );


        pdf.autoTable({

            startY: 42,

            head: [[

                "Nº",
                "Nome Completo",
                "Sexo",
                "Idade",
                "MAC",
                "NPT",
                "MF",
                "Classificação"

            ]],

            body: corpo,

            styles: {

                fontSize: 8,

                cellPadding: 3

            },

            headStyles: {

                fillColor: [
                    30,
                    58,
                    138
                ],

                textColor: 255

            },

            alternateRowStyles: {

                fillColor: [
                    248,
                    250,
                    252
                ]

            }

        });


        const nomeArquivo =
            `Mini-Pauta-${limparNomeArquivo(
                dadosTurma.nome ||
                "Turma"
            )}-${limparNomeArquivo(
                disciplinaSelecionada
            )}-${trimestreSelecionado}T.pdf`;


        pdf.save(
            nomeArquivo
        );


        mostrarMensagem(
            "PDF exportado com sucesso ✅",
            "sucesso"
        );

    }

}


// =====================================================
// IMPRIMIR
// =====================================================

function imprimirPauta() {

    if (
        !verificarPautaExportacao()
    ) {

        return;

    }


    window.print();

}


// =====================================================
// LIMPAR NOME DO ARQUIVO
// =====================================================

function limparNomeArquivo(
    nome
) {

    return String(
        nome || ""
    )
        .replace(
            /[\\/:*?"<>|]/g,
            ""
        )
        .replace(
            /\s+/g,
            "_"
        );

}


// =====================================================
// ATUALIZAR CLASSIFICAÇÃO QUANDO NOTAS MUDAM
// =====================================================

pautaBody.addEventListener(
    "input",
    function () {

        atualizarClassificacoes();

    }
);


// =====================================================
// CRIAR BOTÕES
// =====================================================

criarBotoesExportacao();


// =====================================================
// EXPORTAR TAMBÉM PELO TECLADO
// =====================================================

document.addEventListener(
    "keydown",
    function (evento) {

        /*
        Ctrl + P
        */

        if (
            evento.ctrlKey &&
            evento.key.toLowerCase() === "p"
        ) {

            evento.preventDefault();

            imprimirPauta();

        }

    }
);


// =====================================================
// ESTADO INICIAL
// =====================================================

pautaBody.innerHTML = `
    <tr>
        <td colspan="5">
            Selecione os dados acima para carregar os alunos.
        </td>
    </tr>
`;


atualizarEstado(
    "Selecione a turma, disciplina e trimestre.",
    "⏳"
);


console.log(
    "GRADES.JS — BLOCO 4/4 CARREGADO ✅"
);


// =====================================================
// FINAL
// =====================================================

/*
O sistema agora possui:

✔ Professor autenticado
✔ Turmas atribuídas
✔ Disciplinas atribuídas
✔ Um único seletor de trimestre
✔ Alunos da turma
✔ MAC
✔ NPT
✔ MF automática
✔ Classificação
✔ Guardar/atualizar Mini-Pauta
✔ Bloqueio administrativo
✔ Fecho de trimestre
✔ Exportação Excel
✔ Exportação PDF
✔ Impressão
✔ Sexo e idade preparados para exportação
*/
