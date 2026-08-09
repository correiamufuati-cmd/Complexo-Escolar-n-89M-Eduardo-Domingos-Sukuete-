// =====================================================
// NOTAS.JS — PAINEL DO ADMINISTRADOR
// SGE — SUPERVISÃO E CONTROLO DE LANÇAMENTO DE NOTAS
// BLOCO 1/4
// =====================================================

alert("NOTAS.JS ADMINISTRADOR CARREGADO ✅");

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
// ELEMENTOS
// =====================================================

const tabela =
    document.getElementById("notasLista");

const filtroProfessor =
    document.getElementById("filtroProfessor");

const filtroClasse =
    document.getElementById("filtroClasse");

const filtroTurma =
    document.getElementById("filtroTurma");

const filtroTrimestre =
    document.getElementById("filtroTrimestre");


// =====================================================
// ESTADO
// =====================================================

let professores = [];
let turmas = [];
let atribuicoes = [];


// =====================================================
// CONFIGURAÇÃO DOS TRIMESTRES
// =====================================================

const TRIMESTRES = {

    1: "1.º Trimestre",

    2: "2.º Trimestre",

    3: "3.º Trimestre"

};


// =====================================================
// INICIALIZAÇÃO
// =====================================================

async function iniciarNotas() {

    try {

        mostrarCarregando();

        await carregarProfessores();

        await carregarTurmas();

        await carregarAtribuicoes();

        preencherFiltros();

        mostrarAtribuicoes();

    }
    catch (erro) {

        console.error(
            "Erro ao iniciar painel de notas:",
            erro
        );

        mostrarErro(
            "Não foi possível carregar o painel de notas."
        );

    }

}


// =====================================================
// CARREGAR PROFESSORES
// =====================================================

async function carregarProfessores() {

    professores = [];

    const referencia =
        collection(
            db,
            "professores"
        );

    const resultado =
        await getDocs(
            referencia
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
        (a, b) => {

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


    console.log(
        "Professores:",
        professores
    );

}


// =====================================================
// CARREGAR TURMAS
// =====================================================

async function carregarTurmas() {

    turmas = [];

    const referencia =
        collection(
            db,
            "turmas"
        );

    const resultado =
        await getDocs(
            referencia
        );


    resultado.forEach(
        documento => {

            turmas.push({

                id:
                    documento.id,

                ...documento.data()

            });

        }
    );


    turmas.sort(
        (a, b) => {

            const classeA =
                String(
                    a.classe || ""
                );

            const classeB =
                String(
                    b.classe || ""
                );


            if (
                classeA !== classeB
            ) {

                return classeA.localeCompare(
                    classeB,
                    "pt",
                    {
                        numeric:true
                    }
                );

            }


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


    console.log(
        "Turmas:",
        turmas
    );

}


// =====================================================
// CARREGAR ATRIBUIÇÕES
// =====================================================
//
// Aqui vamos descobrir quais professores possuem
// quais turmas e disciplinas.
//
// A estrutura será normalizada internamente para:
//
// professor
// professorId
// turma
// turmaId
// classe
// disciplina
//
// =====================================================

async function carregarAtribuicoes() {

    atribuicoes = [];


    for (
        const professor
        of professores
    ) {

        const turmasProfessor =
            Array.isArray(
                professor.turmas
            )
            ? professor.turmas
            : [];


        const disciplinasProfessor =
            Array.isArray(
                professor.disciplinas
            )
            ? professor.disciplinas
            : [];


        /*
        -------------------------------------------------
        MODELO ATUAL
        -------------------------------------------------
        */

        for (
            const turmaId
            of turmasProfessor
        ) {

            const turma =
                turmas.find(
                    item =>
                        item.id === turmaId
                );


            if (!turma) {

                continue;

            }


            /*
            Para cada disciplina atribuída ao professor,
            criar uma atribuição.
            */

            for (
                const disciplina
                of disciplinasProfessor
            ) {

                atribuicoes.push({

                    professorId:
                        professor.id,

                    professor:
                        professor.nome ||
                        "Professor",

                    turmaId:
                        turma.id,

                    turma:
                        turma.nome ||
                        "",

                    classe:
                        turma.classe ||
                        "",

                    disciplina:
                        disciplina

                });

            }

        }

    }


    console.log(
        "Atribuições encontradas:",
        atribuicoes
    );

}


// =====================================================
// PREENCHER FILTROS
// =====================================================

function preencherFiltros() {


    // -------------------------------------------------
    // PROFESSORES
    // -------------------------------------------------

    if (filtroProfessor) {

        filtroProfessor.innerHTML = `

            <option value="">
                Todos os professores
            </option>

        `;


        professores.forEach(
            professor => {

                filtroProfessor.innerHTML += `

                    <option
                        value="${professor.id}"
                    >
                        ${escaparHTML(
                            professor.nome ||
                            "Professor"
                        )}
                    </option>

                `;

            }
        );

    }


    // -------------------------------------------------
    // CLASSES
    // -------------------------------------------------

    if (filtroClasse) {

        const classes = [

            ...new Set(

                turmas
                    .map(
                        turma =>
                            turma.classe
                    )
                    .filter(Boolean)

            )

        ];


        filtroClasse.innerHTML = `

            <option value="">
                Todas as classes
            </option>

        `;


        classes.forEach(
            classe => {

                filtroClasse.innerHTML += `

                    <option
                        value="${escaparHTML(
                            classe
                        )}"
                    >
                        ${escaparHTML(
                            classe
                        )}
                    </option>

                `;

            }
        );

    }


    // -------------------------------------------------
    // TURMAS
    // -------------------------------------------------

    if (filtroTurma) {

        filtroTurma.innerHTML = `

            <option value="">
                Todas as turmas
            </option>

        `;


        turmas.forEach(
            turma => {

                filtroTurma.innerHTML += `

                    <option
                        value="${turma.id}"
                    >
                        ${escaparHTML(
                            turma.nome ||
                            "Turma"
                        )}
                    </option>

                `;

            }
        );

    }


    // -------------------------------------------------
    // TRIMESTRES
    // -------------------------------------------------

    if (filtroTrimestre) {

        filtroTrimestre.innerHTML = `

            <option value="">
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

        `;

    }

}


// =====================================================
// MOSTRAR ATRIBUIÇÕES
// =====================================================

function mostrarAtribuicoes() {

    if (!tabela) {

        console.error(
            "Elemento notasLista não encontrado."
        );

        return;

    }


    const lista =
        aplicarFiltros();


    if (!lista.length) {

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="estado-vazio"
                >

                    📋 Nenhuma atribuição
                    encontrada.

                </td>

            </tr>

        `;

        return;

    }


    tabela.innerHTML = "";


    lista.forEach(
        atribuicao => {

            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${escaparHTML(
                        atribuicao.professor
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        atribuicao.classe
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        atribuicao.turma
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        atribuicao.disciplina
                    )}
                </td>

                <td>
                    ${estadoTrimestre(
                        atribuicao,
                        1
                    )}
                </td>

                <td>
                    ${estadoTrimestre(
                        atribuicao,
                        2
                    )}
                </td>

                <td>
                    ${estadoTrimestre(
                        atribuicao,
                        3
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        onclick="
                            abrirControlo(
                                '${atribuicao.professorId}',
                                '${atribuicao.turmaId}',
                                '${escaparJS(
                                    atribuicao.disciplina
                                )}'
                            )
                        "
                    >

                        ⚙️ Controlar

                    </button>

                </td>

            `;


            tabela.appendChild(
                tr
            );

        }
    );

}


// =====================================================
// FILTROS
// =====================================================

function aplicarFiltros() {

    let resultado =
        [...atribuicoes];


    const professor =
        filtroProfessor?.value ||
        "";


    const classe =
        filtroClasse?.value ||
        "";


    const turma =
        filtroTurma?.value ||
        "";


    if (professor) {

        resultado =
            resultado.filter(
                item =>
                    item.professorId ===
                    professor
            );

    }


    if (classe) {

        resultado =
            resultado.filter(
                item =>
                    item.classe ===
                    classe
            );

    }


    if (turma) {

        resultado =
            resultado.filter(
                item =>
                    item.turmaId ===
                    turma
            );

    }


    return resultado;

}


// =====================================================
// ESTADO DO TRIMESTRE
// =====================================================

function estadoTrimestre(
    atribuicao,
    trimestre
) {

    /*
    Nesta primeira fase mostramos o estado padrão.
    No próximo bloco vamos buscar ao Firestore
    o estado REAL do lançamento.
    */

    return `

        <span
            class="estado-nota pendente"
        >
            ⏳ Não lançado
        </span>

    `;

}


// =====================================================
// UTILITÁRIOS
// =====================================================

function escaparHTML(valor) {

    return String(
        valor ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );

}


function escaparJS(valor) {

    return String(
        valor ?? ""
    )
    .replaceAll(
        "\\",
        "\\\\"
    )
    .replaceAll(
        "'",
        "\\'"
    )
    .replaceAll(
        "\n",
        "\\n"
    )
    .replaceAll(
        "\r",
        "\\r"
    );

}


// =====================================================
// ESTADOS VISUAIS
// =====================================================

function mostrarCarregando() {

    if (!tabela) return;


    tabela.innerHTML = `

        <tr>

            <td
                colspan="9"
                class="estado-vazio"
            >

                ⏳ A carregar
                professores e atribuições...

            </td>

        </tr>

    `;

}


function mostrarErro(
    mensagem
) {

    if (!tabela) return;


    tabela.innerHTML = `

        <tr>

            <td
                colspan="9"
                class="estado-vazio"
            >

                ❌ ${escaparHTML(
                    mensagem
                )}

            </td>

        </tr>

    `;

}


// =====================================================
// EVENTOS DOS FILTROS
// =====================================================

if (filtroProfessor) {

    filtroProfessor.addEventListener(
        "change",
        mostrarAtribuicoes
    );

}


if (filtroClasse) {

    filtroClasse.addEventListener(
        "change",
        mostrarAtribuicoes
    );

}


if (filtroTurma) {

    filtroTurma.addEventListener(
        "change",
        mostrarAtribuicoes
    );

}


if (filtroTrimestre) {

    filtroTrimestre.addEventListener(
        "change",
        mostrarAtribuicoes
    );

}


// =====================================================
// CONTROLO — SERÁ COMPLETADO NO BLOCO 2
// =====================================================

window.abrirControlo =
function (
    professorId,
    turmaId,
    disciplina
) {

    console.log(
        "Controlar:",
        {
            professorId,
            turmaId,
            disciplina
        }
    );

};


// =====================================================
// INICIAR
// =====================================================

iniciarNotas();

// =====================================================
// NOTAS.JS — PAINEL DO ADMINISTRADOR
// BLOCO 2/4
// CONTROLO REAL DOS TRIMESTRES
// =====================================================


// =====================================================
// OBTER ID ÚNICO DA ATRIBUIÇÃO
// =====================================================

function obterIdAtribuicao(
    professorId,
    turmaId,
    disciplina
) {

    const texto =
        `${professorId}_${turmaId}_${disciplina}`;

    return texto
        .replace(/\//g, "_")
        .replace(/\s+/g, "_")
        .replace(/[.#$[\]]/g, "_");

}


// =====================================================
// REFERÊNCIA DO CONTROLO
// =====================================================

function obterReferenciaControle(
    professorId,
    turmaId,
    disciplina
) {

    const id =
        obterIdAtribuicao(
            professorId,
            turmaId,
            disciplina
        );

    return doc(
        db,
        "controleNotas",
        id
    );

}


// =====================================================
// ESTADO PADRÃO
// =====================================================

function estadoPadrao() {

    return {

        trimestre1: {

            aberto: false,

            fechado: false,

            iniciado: false,

            concluido: false,

            atualizadoEm: null

        },

        trimestre2: {

            aberto: false,

            fechado: false,

            iniciado: false,

            concluido: false,

            atualizadoEm: null

        },

        trimestre3: {

            aberto: false,

            fechado: false,

            iniciado: false,

            concluido: false,

            atualizadoEm: null

        }

    };

}


// =====================================================
// OBTER CONTROLE
// =====================================================

async function obterControle(
    atribuicao
) {

    try {

        const referencia =
            obterReferenciaControle(

                atribuicao.professorId,

                atribuicao.turmaId,

                atribuicao.disciplina

            );


        const resultado =
            await getDoc(
                referencia
            );


        const padrao =
            estadoPadrao();


        if (!resultado.exists()) {

            return padrao;

        }


        const dados =
            resultado.data();


        return {

            ...padrao,

            ...dados,

            trimestre1: {

                ...padrao.trimestre1,

                ...(dados.trimestre1 || {})

            },

            trimestre2: {

                ...padrao.trimestre2,

                ...(dados.trimestre2 || {})

            },

            trimestre3: {

                ...padrao.trimestre3,

                ...(dados.trimestre3 || {})

            }

        };

    }
    catch (erro) {

        console.error(
            "Erro ao obter controle:",
            erro
        );

        return estadoPadrao();

    }

}


// =====================================================
// VERIFICAR ESTADO DE UM TRIMESTRE
// =====================================================

async function obterEstadoTrimestre(
    atribuicao,
    trimestre
) {

    const controle =
        await obterControle(
            atribuicao
        );


    const chave =
        `trimestre${trimestre}`;


    return controle[
        chave
    ] || {

        aberto: false,

        fechado: false,

        iniciado: false,

        concluido: false

    };

}


// =====================================================
// TEXTO DO ESTADO
// =====================================================

function gerarEstadoVisual(
    estado
) {

    if (!estado) {

        return `

            <span
                class="estado-nota pendente"
            >
                ⚪ Não aberto
            </span>

        `;

    }


    if (estado.fechado === true) {

        return `

            <span
                class="estado-nota fechado"
            >
                🔒 Fechado
            </span>

        `;

    }


    if (estado.aberto !== true) {

        return `

            <span
                class="estado-nota bloqueado"
            >
                🔴 Bloqueado
            </span>

        `;

    }


    if (estado.concluido === true) {

        return `

            <span
                class="estado-nota concluido"
            >
                ✅ Concluído
            </span>

        `;

    }


    if (estado.iniciado === true) {

        return `

            <span
                class="estado-nota andamento"
            >
                🟠 Em andamento
            </span>

        `;

    }


    return `

        <span
            class="estado-nota aberto"
        >
            🟢 Aberto
        </span>

    `;

}


// =====================================================
// ATUALIZAR ESTADOS DA TABELA
// =====================================================

async function atualizarEstadosTabela() {

    if (!tabela) return;


    const linhas =
        tabela.querySelectorAll(
            "tr[data-professor-id]"
        );


    for (
        const linha
        of linhas
    ) {

        const professorId =
            linha.dataset.professorId;


        const turmaId =
            linha.dataset.turmaId;


        const disciplina =
            linha.dataset.disciplina;


        const atribuicao = {

            professorId,

            turmaId,

            disciplina

        };


        const controle =
            await obterControle(
                atribuicao
            );


        for (
            let trimestre = 1;
            trimestre <= 3;
            trimestre++
        ) {

            const celula =
                linha.querySelector(
                    `.trimestre-${trimestre}`
                );


            if (!celula) {
                continue;
            }


            const estado =
                controle[
                    `trimestre${trimestre}`
                ];


            celula.innerHTML =
                gerarEstadoVisual(
                    estado
                );

        }

    }

}


// =====================================================
// VERIFICAR LANÇAMENTO DAS NOTAS
// =====================================================

async function verificarNotasLancadas(
    atribuicao,
    trimestre
) {

    try {

        const alunosRef =
            collection(

                db,

                "turmas",

                atribuicao.turmaId,

                "alunos"

            );


        const resultado =
            await getDocs(
                alunosRef
            );


        if (resultado.empty) {

            return {

                total: 0,

                lancados: 0,

                percentual: 0,

                concluido: false

            };

        }


        let total = 0;

        let lancados = 0;


        for (
            const alunoDoc
            of resultado.docs
        ) {

            total++;


            const notasRef =
                collection(

                    db,

                    "turmas",

                    atribuicao.turmaId,

                    "alunos",

                    alunoDoc.id,

                    "notas"

                );


            const notas =
                await getDocs(
                    notasRef
                );


            let encontrou =
                false;


            notas.forEach(
                notaDoc => {

                    const nota =
                        notaDoc.data();


                    if (

                        nota.disciplina ===
                        atribuicao.disciplina &&

                        String(
                            nota.trimestre
                        ) ===
                        String(
                            trimestre
                        )

                    ) {

                        encontrou = true;

                    }

                }
            );


            if (encontrou) {

                lancados++;

            }

        }


        const percentual =
            total > 0

                ? Math.round(
                    (
                        lancados /
                        total
                    ) * 100
                )

                : 0;


        return {

            total,

            lancados,

            percentual,

            concluido:
                total > 0 &&
                lancados === total

        };

    }
    catch (erro) {

        console.error(
            "Erro ao verificar notas:",
            erro
        );


        return {

            total: 0,

            lancados: 0,

            percentual: 0,

            concluido: false

        };

    }

}


// =====================================================
// ATUALIZAR CONCLUSÃO AUTOMATICAMENTE
// =====================================================

async function atualizarConclusao(
    atribuicao,
    trimestre
) {

    const progresso =
        await verificarNotasLancadas(

            atribuicao,

            trimestre

        );


    const referencia =
        obterReferenciaControle(

            atribuicao.professorId,

            atribuicao.turmaId,

            atribuicao.disciplina

        );


    const chave =
        `trimestre${trimestre}`;


    if (
        progresso.concluido
    ) {

        await setDoc(

            referencia,

            {

                [chave]: {

                    concluido: true,

                    percentual:
                        progresso.percentual,

                    totalAlunos:
                        progresso.total,

                    alunosLancados:
                        progresso.lancados,

                    atualizadoEm:
                        serverTimestamp()

                }

            },

            {
                merge: true
            }

        );

    }


    return progresso;

}


// =====================================================
// ABRIR LANÇAMENTO
// =====================================================

async function abrirLancamento(
    atribuicao,
    trimestre
) {

    const referencia =
        obterReferenciaControle(

            atribuicao.professorId,

            atribuicao.turmaId,

            atribuicao.disciplina

        );


    const controle =
        await obterControle(
            atribuicao
        );


    const chave =
        `trimestre${trimestre}`;


    const atual =
        controle[chave];


    if (
        atual.fechado === true
    ) {

        alert(
            "🔒 Este trimestre já está fechado e não pode ser reaberto."
        );

        return false;

    }


    await setDoc(

        referencia,

        {

            [chave]: {

                aberto: true,

                fechado: false,

                iniciado:
                    atual.iniciado || false,

                concluido:
                    atual.concluido || false,

                abertoEm:
                    serverTimestamp(),

                atualizadoEm:
                    serverTimestamp()

            }

        },

        {
            merge: true
        }

    );


    alert(
        `🟢 ${TRIMESTRES[trimestre]} aberto para lançamento.`
    );


    return true;

}


// =====================================================
// BLOQUEAR LANÇAMENTO
// =====================================================

async function bloquearLancamento(
    atribuicao,
    trimestre
) {

    const referencia =
        obterReferenciaControle(

            atribuicao.professorId,

            atribuicao.turmaId,

            atribuicao.disciplina

        );


    const controle =
        await obterControle(
            atribuicao
        );


    const chave =
        `trimestre${trimestre}`;


    const atual =
        controle[chave];


    if (
        atual.fechado === true
    ) {

        alert(
            "🔒 Este trimestre já está fechado."
        );

        return false;

    }


    await setDoc(

        referencia,

        {

            [chave]: {

                aberto: false,

                fechado: false,

                iniciado:
                    atual.iniciado || false,

                concluido:
                    atual.concluido || false,

                bloqueadoEm:
                    serverTimestamp(),

                atualizadoEm:
                    serverTimestamp()

            }

        },

        {
            merge: true
        }

    );


    alert(
        `🔴 Lançamento do ${TRIMESTRES[trimestre]} bloqueado.`
    );


    return true;

}


// =====================================================
// FECHAR TRIMESTRE
// =====================================================

async function fecharTrimestre(
    atribuicao,
    trimestre
) {

    const confirmado =
        confirm(

            `⚠️ ATENÇÃO\n\n` +

            `Você está prestes a fechar ` +
            `${TRIMESTRES[trimestre]}.\n\n` +

            `Depois de fechado, ` +
            `o professor não poderá ` +
            `alterar as notas.\n\n` +

            `Deseja realmente continuar?`

        );


    if (!confirmado) {

        return false;

    }


    const referencia =
        obterReferenciaControle(

            atribuicao.professorId,

            atribuicao.turmaId,

            atribuicao.disciplina

        );


    await setDoc(

        referencia,

        {

            [`trimestre${trimestre}`]: {

                aberto: false,

                fechado: true,

                fechadoEm:
                    serverTimestamp(),

                atualizadoEm:
                    serverTimestamp()

            }

        },

        {
            merge: true
        }

    );


    alert(
        `🔒 ${TRIMESTRES[trimestre]} fechado com sucesso.`
    );


    return true;

}


// =====================================================
// CONTROLE GLOBAL
// =====================================================

window.abrirLancamento =
abrirLancamento;

window.bloquearLancamento =
bloquearLancamento;

window.fecharTrimestre =
fecharTrimestre;


// =====================================================
// FIM DO BLOCO 2
// =====================================================

alert(
    "BLOCO 2 — Controlo dos trimestres carregado ✅"
);

// =====================================================
// NOTAS.JS — PAINEL DO ADMINISTRADOR
// BLOCO 3/4
// INTERFACE DE CONTROLO DAS MINI-PAUTAS
// =====================================================


// =====================================================
// CRIAR PAINEL DE CONTROLO
// =====================================================

function criarPainelControle() {

    if (document.getElementById("painelControleNotas")) {
        return;
    }


    const painel =
        document.createElement("div");

    painel.id =
        "painelControleNotas";


    painel.innerHTML = `

        <div class="controle-overlay">

            <div class="controle-modal">

                <div class="controle-cabecalho">

                    <div>

                        <h2>
                            📝 Controlo da Mini-Pauta
                        </h2>

                        <p id="controleInformacao">
                            —
                        </p>

                    </div>

                    <button
                        type="button"
                        id="fecharPainelControle"
                        class="btn-fechar"
                    >
                        ✕
                    </button>

                </div>


                <div
                    id="controleMensagem"
                    class="controle-mensagem"
                >
                    Selecione um trimestre.
                </div>


                <div class="trimestres-controle">


                    <!-- =========================
                         1.º TRIMESTRE
                    ========================== -->

                    <div
                        class="trimestre-card"
                        data-trimestre="1"
                    >

                        <div class="trimestre-titulo">

                            <strong>
                                1.º Trimestre
                            </strong>

                            <span
                                id="estadoTrimestre1"
                            >
                                ⚪ Não aberto
                            </span>

                        </div>


                        <div
                            id="progressoTrimestre1"
                            class="progresso"
                        >
                            0% — 0/0 alunos
                        </div>


                        <div class="barra">

                            <div
                                id="barraTrimestre1"
                                class="barra-preenchimento"
                                style="width:0%"
                            ></div>

                        </div>


                        <div class="botoes-controle">

                            <button
                                type="button"
                                class="btn-abrir"
                                data-acao="abrir"
                                data-trimestre="1"
                            >
                                🟢 Abrir lançamento
                            </button>


                            <button
                                type="button"
                                class="btn-bloquear"
                                data-acao="bloquear"
                                data-trimestre="1"
                            >
                                🔴 Bloquear
                            </button>


                            <button
                                type="button"
                                class="btn-fechar-trimestre"
                                data-acao="fechar"
                                data-trimestre="1"
                            >
                                🔒 Fechar trimestre
                            </button>

                        </div>

                    </div>



                    <!-- =========================
                         2.º TRIMESTRE
                    ========================== -->

                    <div
                        class="trimestre-card"
                        data-trimestre="2"
                    >

                        <div class="trimestre-titulo">

                            <strong>
                                2.º Trimestre
                            </strong>

                            <span
                                id="estadoTrimestre2"
                            >
                                ⚪ Não aberto
                            </span>

                        </div>


                        <div
                            id="progressoTrimestre2"
                            class="progresso"
                        >
                            0% — 0/0 alunos
                        </div>


                        <div class="barra">

                            <div
                                id="barraTrimestre2"
                                class="barra-preenchimento"
                                style="width:0%"
                            ></div>

                        </div>


                        <div class="botoes-controle">

                            <button
                                type="button"
                                class="btn-abrir"
                                data-acao="abrir"
                                data-trimestre="2"
                            >
                                🟢 Abrir lançamento
                            </button>


                            <button
                                type="button"
                                class="btn-bloquear"
                                data-acao="bloquear"
                                data-trimestre="2"
                            >
                                🔴 Bloquear
                            </button>


                            <button
                                type="button"
                                class="btn-fechar-trimestre"
                                data-acao="fechar"
                                data-trimestre="2"
                            >
                                🔒 Fechar trimestre
                            </button>

                        </div>

                    </div>



                    <!-- =========================
                         3.º TRIMESTRE
                    ========================== -->

                    <div
                        class="trimestre-card"
                        data-trimestre="3"
                    >

                        <div class="trimestre-titulo">

                            <strong>
                                3.º Trimestre
                            </strong>

                            <span
                                id="estadoTrimestre3"
                            >
                                ⚪ Não aberto
                            </span>

                        </div>


                        <div
                            id="progressoTrimestre3"
                            class="progresso"
                        >
                            0% — 0/0 alunos
                        </div>


                        <div class="barra">

                            <div
                                id="barraTrimestre3"
                                class="barra-preenchimento"
                                style="width:0%"
                            ></div>

                        </div>


                        <div class="botoes-controle">

                            <button
                                type="button"
                                class="btn-abrir"
                                data-acao="abrir"
                                data-trimestre="3"
                            >
                                🟢 Abrir lançamento
                            </button>


                            <button
                                type="button"
                                class="btn-bloquear"
                                data-acao="bloquear"
                                data-trimestre="3"
                            >
                                🔴 Bloquear
                            </button>


                            <button
                                type="button"
                                class="btn-fechar-trimestre"
                                data-acao="fechar"
                                data-trimestre="3"
                            >
                                🔒 Fechar trimestre
                            </button>

                        </div>

                    </div>

                </div>


                <div class="controle-rodape">

                    <button
                        type="button"
                        id="atualizarControleNotas"
                    >
                        🔄 Atualizar
                    </button>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        painel
    );


    adicionarEstiloControle();


    document
        .getElementById(
            "fecharPainelControle"
        )
        .addEventListener(
            "click",
            fecharPainelControle
        );


    document
        .getElementById(
            "atualizarControleNotas"
        )
        .addEventListener(
            "click",
            async function () {

                if (
                    !atribuicaoAtual
                ) {
                    return;
                }


                await atualizarPainelControle(
                    atribuicaoAtual
                );

            }
        );


    painel
        .querySelectorAll(
            "[data-acao]"
        )
        .forEach(
            botao => {

                botao.addEventListener(
                    "click",
                    executarAcaoControle
                );

            }
        );

}


// =====================================================
// VARIÁVEL DA ATRIBUIÇÃO ATUAL
// =====================================================

let atribuicaoAtual =
    null;


// =====================================================
// ABRIR PAINEL
// =====================================================

async function abrirPainelControle(
    atribuicao
) {

    criarPainelControle();


    atribuicaoAtual =
        atribuicao;


    const painel =
        document.getElementById(
            "painelControleNotas"
        );


    painel.style.display =
        "flex";


    const informacao =
        document.getElementById(
            "controleInformacao"
        );


    informacao.innerHTML = `

        <strong>
            Professor:
        </strong>
        ${atribuicao.professorNome || "—"}

        &nbsp; | &nbsp;

        <strong>
            Turma:
        </strong>
        ${atribuicao.turmaNome || "—"}

        &nbsp; | &nbsp;

        <strong>
            Disciplina:
        </strong>
        ${atribuicao.disciplina || "—"}

    `;


    await atualizarPainelControle(
        atribuicao
    );

}


// =====================================================
// FECHAR PAINEL
// =====================================================

function fecharPainelControle() {

    const painel =
        document.getElementById(
            "painelControleNotas"
        );


    if (painel) {

        painel.style.display =
            "none";

    }


    atribuicaoAtual =
        null;

}


// =====================================================
// ATUALIZAR PAINEL
// =====================================================

async function atualizarPainelControle(
    atribuicao
) {

    if (!atribuicao) {
        return;
    }


    const controle =
        await obterControle(
            atribuicao
        );


    for (
        let trimestre = 1;
        trimestre <= 3;
        trimestre++
    ) {

        const estado =
            controle[
                `trimestre${trimestre}`
            ];


        const progresso =
            await verificarNotasLancadas(

                atribuicao,

                trimestre

            );


        atualizarVisualTrimestre(

            trimestre,

            estado,

            progresso

        );

    }

}


// =====================================================
// ATUALIZAR VISUAL DO TRIMESTRE
// =====================================================

function atualizarVisualTrimestre(
    trimestre,
    estado,
    progresso
) {

    const estadoElemento =
        document.getElementById(
            `estadoTrimestre${trimestre}`
        );


    const progressoElemento =
        document.getElementById(
            `progressoTrimestre${trimestre}`
        );


    const barra =
        document.getElementById(
            `barraTrimestre${trimestre}`
        );


    if (
        !estadoElemento ||
        !progressoElemento ||
        !barra
    ) {

        return;

    }


    // =========================
    // ESTADO
    // =========================

    estadoElemento.innerHTML =
        obterTextoEstado(
            estado
        );


    // =========================
    // PROGRESSO
    // =========================

    progressoElemento.textContent =

        `${progresso.percentual}% — ` +

        `${progresso.lancados}/` +

        `${progresso.total} alunos`;


    barra.style.width =
        `${progresso.percentual}%`;


    // =========================
    // BOTÕES
    // =========================

    const card =
        document.querySelector(
            `.trimestre-card[data-trimestre="${trimestre}"]`
        );


    if (!card) {
        return;
    }


    const botaoAbrir =
        card.querySelector(
            '[data-acao="abrir"]'
        );


    const botaoBloquear =
        card.querySelector(
            '[data-acao="bloquear"]'
        );


    const botaoFechar =
        card.querySelector(
            '[data-acao="fechar"]'
        );


    if (
        estado.fechado === true
    ) {

        botaoAbrir.disabled =
            true;

        botaoBloquear.disabled =
            true;

        botaoFechar.disabled =
            true;

        card.classList.add(
            "trimestre-fechado"
        );

        return;

    }


    card.classList.remove(
        "trimestre-fechado"
    );


    botaoAbrir.disabled =
        estado.aberto === true;


    botaoBloquear.disabled =
        estado.aberto !== true;


    botaoFechar.disabled =
        estado.aberto !== true;

}


// =====================================================
// TEXTO DO ESTADO
// =====================================================

function obterTextoEstado(
    estado
) {

    if (!estado) {

        return "⚪ Não aberto";

    }


    if (
        estado.fechado === true
    ) {

        return "🔒 Fechado";

    }


    if (
        estado.aberto === true &&
        estado.concluido === true
    ) {

        return "✅ Concluído";

    }


    if (
        estado.aberto === true &&
        estado.iniciado === true
    ) {

        return "🟠 Em andamento";

    }


    if (
        estado.aberto === true
    ) {

        return "🟢 Aberto";

    }


    return "🔴 Bloqueado";

}


// =====================================================
// EXECUTAR AÇÃO
// =====================================================

async function executarAcaoControle(
    evento
) {

    if (!atribuicaoAtual) {

        alert(
            "Nenhuma mini-pauta selecionada."
        );

        return;

    }


    const botao =
        evento.currentTarget;


    const acao =
        botao.dataset.acao;


    const trimestre =
        Number(
            botao.dataset.trimestre
        );


    botao.disabled =
        true;


    try {

        let resultado =
            false;


        if (
            acao === "abrir"
        ) {

            resultado =
                await abrirLancamento(

                    atribuicaoAtual,

                    trimestre

                );

        }


        else if (
            acao === "bloquear"
        ) {

            resultado =
                await bloquearLancamento(

                    atribuicaoAtual,

                    trimestre

                );

        }


        else if (
            acao === "fechar"
        ) {

            resultado =
                await fecharTrimestre(

                    atribuicaoAtual,

                    trimestre

                );

        }


        if (resultado) {

            await atualizarPainelControle(

                atribuicaoAtual

            );


            await atualizarEstadosTabela();

        }

    }
    catch (erro) {

        console.error(
            "Erro no controlo:",
            erro
        );


        alert(
            "Erro ao executar a operação:\n\n" +
            erro.message
        );

    }
    finally {

        botao.disabled =
            false;

    }

}


// =====================================================
// CSS DO PAINEL
// =====================================================

function adicionarEstiloControle() {

    if (
        document.getElementById(
            "estiloControleNotas"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "estiloControleNotas";


    style.textContent = `

        #painelControleNotas{

            position:fixed;

            inset:0;

            background:
                rgba(15,23,42,.65);

            display:none;

            align-items:center;

            justify-content:center;

            z-index:99999;

            padding:20px;

        }


        .controle-overlay{

            width:100%;

            height:100%;

            display:flex;

            align-items:center;

            justify-content:center;

        }


        .controle-modal{

            background:white;

            width:100%;

            max-width:900px;

            max-height:90vh;

            overflow:auto;

            border-radius:18px;

            box-shadow:
                0 20px 60px
                rgba(0,0,0,.25);

        }


        .controle-cabecalho{

            display:flex;

            justify-content:space-between;

            gap:15px;

            padding:20px;

            border-bottom:
                1px solid #e2e8f0;

        }


        .controle-cabecalho h2{

            margin:0 0 7px;

async function executarAcaoControle(
    evento
) {

    if (!atribuicaoAtual) {

        alert(
            "Nenhuma mini-pauta selecionada."
        );

        return;

    }


    const botao =
        evento.currentTarget;


    const acao =
        botao.dataset.acao;


    const trimestre =
        Number(
            botao.dataset.trimestre
        );


    botao.disabled =
        true;


    try {

        let resultado =
            false;


        if (
            acao === "abrir"
        ) {

            resultado =
                await abrirLancamento(

                    atribuicaoAtual,

                    trimestre

                );

        }


        else if (
            acao === "bloquear"
        ) {

            resultado =
                await bloquearLancamento(

                    atribuicaoAtual,

                    trimestre

                );

        }


        else if (
            acao === "fechar"
        ) {

            resultado =
                await fecharTrimestre(

                    atribuicaoAtual,

                    trimestre

                );

        }


        if (resultado) {

            await atualizarPainelControle(

                atribuicaoAtual

            );


            await atualizarEstadosTabela();

        }

    }
    catch (erro) {

        console.error(
            "Erro no controlo:",
            erro
        );


        alert(
            "Erro ao executar a operação:\n\n" +
            erro.message
        );

    }
    finally {

        botao.disabled =
            false;

    }

}


// =====================================================
// CSS DO PAINEL
// =====================================================

function adicionarEstiloControle() {

    if (
        document.getElementById(
            "estiloControleNotas"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "estiloControleNotas";


    style.textContent = `

        #painelControleNotas{

            position:fixed;

            inset:0;

            background:
                rgba(15,23,42,.65);

            display:none;

            align-items:center;

            justify-content:center;

            z-index:99999;

            padding:20px;

        }


        .controle-overlay{

            width:100%;

            height:100%;

            display:flex;

            align-items:center;

            justify-content:center;

        }


        .controle-modal{

            background:white;

            width:100%;

            max-width:900px;

            max-height:90vh;

            overflow:auto;

            border-radius:18px;

            box-shadow:
                0 20px 60px
                rgba(0,0,0,.25);

        }


        .controle-cabecalho{

            display:flex;

            justify-content:space-between;

            gap:15px;

            padding:20px;

            border-bottom:
                1px solid #e2e8f0;

        }


        .controle-cabecalho h2{

            margin:0 0 7px;

            color:#1e3a8a;

        }


        .controle-cabecalho p{

            margin:0;

            color:#64748b;

        }


        .btn-fechar{

            width:42px;

            height:42px;

            padding:0;

            background:#f1f5f9;

            color:#334155;

            font-size:18px;

        }


        .controle-mensagem{

            margin:15px 20px;

            padding:12px;

            border-radius:9px;

            background:#f8fafc;

            color:#475569;

        }


        .trimestres-controle{

            padding:0 20px 20px;

            display:grid;

            gap:15px;

        }


        .trimestre-card{

            border:
                1px solid #e2e8f0;

            border-radius:14px;

            padding:16px;

            background:#fff;

        }


        .trimestre-card.trimestre-fechado{

            background:#f8fafc;

            opacity:.8;

        }


        .trimestre-titulo{

            display:flex;

            justify-content:space-between;

            align-items:center;

            gap:10px;

            margin-bottom:12px;

        }


        .trimestre-titulo strong{

            font-size:17px;

            color:#1e293b;

        }


        .progresso{

            font-size:14px;

            font-weight:bold;

            color:#475569;

            margin-bottom:7px;

        }


        .barra{

            width:100%;

            height:9px;

            background:#e2e8f0;

            border-radius:20px;

            overflow:hidden;

            margin-bottom:14px;

        }


        .barra-preenchimento{

            height:100%;

            background:#2563eb;

            transition:width .3s ease;

        }


        .botoes-controle{

            display:flex;

            flex-wrap:wrap;

            gap:8px;

        }


        .botoes-controle button{

            border:0;

            border-radius:8px;

            padding:9px 12px;

            cursor:pointer;

            font-weight:bold;

        }


        .btn-abrir{

            background:#dcfce7;

            color:#166534;

        }


        .btn-bloquear{

            background:#fee2e2;

            color:#991b1b;

        }


        .btn-fechar-trimestre{

            background:#ede9fe;

            color:#6d28d9;

        }


        .botoes-controle button:disabled{

            opacity:.45;

            cursor:not-allowed;

        }


        .controle-rodape{

            padding:15px 20px;

            border-top:
                1px solid #e2e8f0;

            text-align:right;

        }


        #atualizarControleNotas{

            background:#2563eb;

            color:white;

        }


        @media(max-width:650px){

            .controle-modal{

                max-height:95vh;

            }


            .trimestre-titulo{

                flex-direction:column;

                align-items:flex-start;

            }


            .botoes-controle{

                flex-direction:column;

            }


            .botoes-controle button{

                width:100%;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


// =====================================================
// EXPOR FUNÇÃO PARA A TABELA
// =====================================================

window.abrirPainelControle =
    abrirPainelControle;


// =====================================================
// CRIAR PAINEL QUANDO O JS CARREGAR
// =====================================================

criarPainelControle();


alert(
    "BLOCO 3 — Painel de controlo carregado ✅"
);
          
// =====================================================
// NOTAS.JS — PAINEL DO ADMINISTRADOR
// BLOCO 4/4 — LISTAGEM + MINI-PAUTA + AÇÕES
// =====================================================


// =====================================================
// VARIÁVEIS DE SEGURANÇA
// =====================================================

let atribuicoesNotas = [];


// =====================================================
// CARREGAR PROFESSORES E ATRIBUIÇÕES
// =====================================================

async function carregarAtribuicoesNotas() {

    try {

        mostrarCarregandoTabela();


        const professoresSnapshot =
            await getDocs(
                collection(
                    db,
                    "professores"
                )
            );


        atribuicoesNotas = [];


        for (
            const professorDoc
            of professoresSnapshot.docs
        ) {

            const professor =
                professorDoc.data();


            const professorId =
                professorDoc.id;


            const turmas =
                Array.isArray(
                    professor.turmas
                )
                    ? professor.turmas
                    : [];


            const disciplinas =
                Array.isArray(
                    professor.disciplinas
                )
                    ? professor.disciplinas
                    : [];


            /*
            Professor sem atribuições
            */

            if (
                turmas.length === 0 ||
                disciplinas.length === 0
            ) {

                continue;

            }


            /*
            Buscar cada turma
            */

            for (
                const turmaId
                of turmas
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


                /*
                Criar uma atribuição
                para cada disciplina
                */

                for (
                    const disciplina
                    of disciplinas
                ) {

                    atribuicoesNotas.push({

                        professorId,

                        professorNome:
                            professor.nome ||
                            professor.nomeCompleto ||
                            "Professor",

                        turmaId,

                        turmaNome:
                            turma.nome ||
                            turma.turma ||
                            "Turma",

                        classe:
                            turma.classe ||
                            "",

                        disciplina

                    });

                }

            }

        }


        /*
        Ordenar
        */

        atribuicoesNotas.sort(
            (a, b) => {

                const professorA =
                    String(
                        a.professorNome
                    );


                const professorB =
                    String(
                        b.professorNome
                    );


                return professorA.localeCompare(
                    professorB,
                    "pt"
                );

            }
        );


        await renderizarTabelaNotas();


    }
    catch (erro) {

        console.error(
            "Erro ao carregar atribuições:",
            erro
        );


        mostrarErroTabela(
            erro.message
        );

    }

}


// =====================================================
// MOSTRAR CARREGANDO
// =====================================================

function mostrarCarregandoTabela() {

    if (!tabela) {
        return;
    }


    tabela.innerHTML = `

        <tr>

            <td
                colspan="9"
                style="text-align:center;padding:30px"
            >

                ⏳ A carregar
                professores e atribuições...

            </td>

        </tr>

    `;

}


// =====================================================
// MOSTRAR ERRO
// =====================================================

function mostrarErroTabela(
    mensagem
) {

    if (!tabela) {
        return;
    }


    tabela.innerHTML = `

        <tr>

            <td
                colspan="9"
                style="
                    text-align:center;
                    padding:30px;
                    color:#b91c1c;
                "
            >

                ❌ Erro ao carregar:

                <br><br>

                ${escaparHTML(
                    mensagem
                )}

            </td>

        </tr>

    `;

}


// =====================================================
// RENDERIZAR TABELA
// =====================================================

async function renderizarTabelaNotas() {

    if (!tabela) {
        return;
    }


    if (
        atribuicoesNotas.length === 0
    ) {

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >

                    📭 Nenhuma atribuição
                    encontrada.

                </td>

            </tr>

        `;

        return;

    }


    tabela.innerHTML = "";


    for (
        const atribuicao
        of atribuicoesNotas
    ) {

        const tr =
            document.createElement(
                "tr"
            );


        tr.dataset.professorId =
            atribuicao.professorId;


        tr.dataset.turmaId =
            atribuicao.turmaId;


        tr.dataset.disciplina =
            atribuicao.disciplina;


        const controle =
            await obterControle(
                atribuicao
            );


        /*
        Verificar progresso
        */

        const progresso1 =
            await verificarNotasLancadas(
                atribuicao,
                1
            );


        const progresso2 =
            await verificarNotasLancadas(
                atribuicao,
                2
            );


        const progresso3 =
            await verificarNotasLancadas(
                atribuicao,
                3
            );


        /*
        Estado geral
        */

        const geral =
            obterEstadoGeral(

                controle,

                progresso1,

                progresso2,

                progresso3

            );


        tr.innerHTML = `

            <td>

                ${escaparHTML(
                    atribuicao.professorNome
                )}

            </td>


            <td>

                ${escaparHTML(
                    atribuicao.classe
                )}

            </td>


            <td>

                ${escaparHTML(
                    atribuicao.turmaNome
                )}

            </td>


            <td>

                ${escaparHTML(
                    atribuicao.disciplina
                )}

            </td>


            <td class="trimestre-1">

                ${gerarEstadoVisual(
                    controle.trimestre1
                )}

                <small>

                    ${progresso1.lancados}/
                    ${progresso1.total}

                </small>

            </td>


            <td class="trimestre-2">

                ${gerarEstadoVisual(
                    controle.trimestre2
                )}

                <small>

                    ${progresso2.lancados}/
                    ${progresso2.total}

                </small>

            </td>


            <td class="trimestre-3">

                ${gerarEstadoVisual(
                    controle.trimestre3
                )}

                <small>

                    ${progresso3.lancados}/
                    ${progresso3.total}

                </small>

            </td>


            <td>

                ${geral}

            </td>


            <td>

                <div class="acoes-notas">

                    <button
                        type="button"
                        class="btn-ver-pauta"
                        data-acao-pauta="ver"
                    >

                        👁️ Ver

                    </button>


                    <button
                        type="button"
                        class="btn-controlar-pauta"
                        data-acao-pauta="controlar"
                    >

                        ⚙️ Controlar

                    </button>

                </div>

            </td>

        `;


        /*
        Botão VER
        */

        const botaoVer =
            tr.querySelector(
                '[data-acao-pauta="ver"]'
            );


        botaoVer.addEventListener(
            "click",
            function () {

                abrirVisualizacaoPauta(
                    atribuicao
                );

            }
        );


        /*
        Botão CONTROLAR
        */

        const botaoControlar =
            tr.querySelector(
                '[data-acao-pauta="controlar"]'
            );


        botaoControlar.addEventListener(
            "click",
            function () {

                abrirPainelControle(
                    atribuicao
                );

            }
        );


        tabela.appendChild(
            tr
        );

    }

}


// =====================================================
// ESTADO GERAL
// =====================================================

function obterEstadoGeral(
    controle,
    p1,
    p2,
    p3
) {

    if (
        controle.trimestre3?.fechado === true
    ) {

        return `
            <span class="estado-geral fechado">
                🔒 Ano encerrado
            </span>
        `;

    }


    if (
        controle.trimestre2?.fechado === true &&
        controle.trimestre3?.aberto !== true
    ) {

        return `
            <span class="estado-geral concluido">
                🟣 2.º trimestre encerrado
            </span>
        `;

    }


    if (
        controle.trimestre1?.fechado === true &&
        controle.trimestre2?.aberto !== true
    ) {

        return `
            <span class="estado-geral concluido">
                🟣 1.º trimestre encerrado
            </span>
        `;

    }


    if (
        p1.concluido &&
        p2.concluido &&
        p3.concluido
    ) {

        return `
            <span class="estado-geral concluido">
                ✅ Completo
            </span>
        `;

    }


    if (
        p1.lancados > 0 ||
        p2.lancados > 0 ||
        p3.lancados > 0
    ) {

        return `
            <span class="estado-geral andamento">
                🟠 Em andamento
            </span>
        `;

    }


    return `
        <span class="estado-geral pendente">
            ⚪ Não iniciado
        </span>
    `;

}


// =====================================================
// ESCAPAR HTML
// =====================================================

function escaparHTML(
    valor
) {

    return String(
        valor ?? ""
    )
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
// VISUALIZAR MINI-PAUTA
// =====================================================

async function abrirVisualizacaoPauta(
    atribuicao
) {

    try {

        const alunosSnapshot =
            await getDocs(

                collection(

                    db,

                    "turmas",

                    atribuicao.turmaId,

                    "alunos"

                )

            );


        const alunos =
            alunosSnapshot.docs.map(
                documento => ({

                    id:
                        documento.id,

                    ...documento.data()

                })
            );


        alunos.sort(
            (a, b) =>
                Number(a.numero || 0) -
                Number(b.numero || 0)
        );


        const modal =
            criarModalVisualizacao();


        const corpo =
            modal.querySelector(
                "#corpoVisualizacaoPauta"
            );


        corpo.innerHTML = `

            <div class="pauta-info">

                <strong>
                    Professor:
                </strong>

                ${escaparHTML(
                    atribuicao.professorNome
                )}

                <br>

                <strong>
                    Classe:
                </strong>

                ${escaparHTML(
                    atribuicao.classe
                )}

                <br>

                <strong>
                    Turma:
                </strong>

                ${escaparHTML(
                    atribuicao.turmaNome
                )}

                <br>

                <strong>
                    Disciplina:
                </strong>

                ${escaparHTML(
                    atribuicao.disciplina
                )}

            </div>


            <div class="visualizacao-tabela">

                <table>

                    <thead>

                        <tr>

                            <th>Nº</th>

                            <th>Nome</th>

                            <th>Sexo</th>

                            <th>1.º Trim.</th>

                            <th>2.º Trim.</th>

                            <th>3.º Trim.</th>

                        </tr>

                    </thead>

                    <tbody id="corpoAlunosVisualizacao">

                    </tbody>

                </table>

            </div>

        `;


        const corpoAlunos =
            modal.querySelector(
                "#corpoAlunosVisualizacao"
            );


        for (
            const aluno
            of alunos
        ) {

            const notas =
                await obterNotasAluno(

                    atribuicao,

                    aluno.id

                );


            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${escaparHTML(
                        aluno.numero
                    )}
                </td>

                <td class="nome-aluno">
                    ${escaparHTML(
                        aluno.nome
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        aluno.sexo ||
                        ""
                    )}
                </td>

                <td>
                    ${formatarNota(
                        notas[1]
                    )}
                </td>

                <td>
                    ${formatarNota(
                        notas[2]
                    )}
                </td>

                <td>
                    ${formatarNota(
                        notas[3]
                    )}
                </td>

            `;


            corpoAlunos.appendChild(
                tr
            );

        }

    }
    catch (erro) {

        console.error(
            "Erro ao visualizar pauta:",
            erro
        );


        alert(
            "Erro ao abrir mini-pauta:\n\n" +
            erro.message
        );

    }

}


// =====================================================
// OBTER NOTAS DO ALUNO
// =====================================================

async function obterNotasAluno(
    atribuicao,
    alunoId
) {

    const resultado = {

        1: null,

        2: null,

        3: null

    };


    try {

        const notasSnapshot =
            await getDocs(

                collection(

                    db,

                    "turmas",

                    atribuicao.turmaId,

                    "alunos",

                    alunoId,

                    "notas"

                )

            );


        notasSnapshot.forEach(
            documento => {

                const nota =
                    documento.data();


                if (
                    nota.disciplina ===
                    atribuicao.disciplina
                ) {

                    const trimestre =
                        Number(
                            nota.trimestre
                        );


                    if (
                        trimestre >= 1 &&
                        trimestre <= 3
                    ) {

                        resultado[
                            trimestre
                        ] = nota;

                    }

                }

            }
        );

    }
    catch (erro) {

        console.error(
            "Erro ao obter notas do aluno:",
            erro
        );

    }


    return resultado;

}


// =====================================================
// FORMATAR NOTA
// =====================================================

function formatarNota(
    nota
) {

    if (!nota) {

        return "—";

    }


    if (
        nota.MF !== undefined &&
        nota.MF !== null
    ) {

        return String(
            nota.MF
        );

    }


    if (
        nota.MAC !== undefined
    ) {

        return String(
            nota.MAC
        );

    }


    return "—";

}


// =====================================================
// CRIAR MODAL DE VISUALIZAÇÃO
// =====================================================

function criarModalVisualizacao() {

    const antigo =
        document.getElementById(
            "modalVisualizacaoPauta"
        );


    if (antigo) {

        antigo.remove();

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "modalVisualizacaoPauta";


    modal.innerHTML = `

        <div class="visualizacao-overlay">

            <div class="visualizacao-modal">

                <div class="visualizacao-cabecalho">

                    <h2>
                        👁️ Mini-Pauta
                    </h2>

                    <button
                        type="button"
                        id="fecharVisualizacaoPauta"
                    >
                        ✕
                    </button>

                </div>


                <div
                    id="corpoVisualizacaoPauta"
                >
                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    adicionarEstiloVisualizacao();


    modal
        .querySelector(
            "#fecharVisualizacaoPauta"
        )
        .addEventListener(
            "click",
            function () {

                modal.remove();

            }
        );


    return modal;

}


// =====================================================
// CSS DA VISUALIZAÇÃO
// =====================================================

function adicionarEstiloVisualizacao() {

    if (
        document.getElementById(
            "estiloVisualizacaoPauta"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "estiloVisualizacaoPauta";


    style.textContent = `

        #modalVisualizacaoPauta{

            position:fixed;

            inset:0;

            z-index:100000;

        }


        .visualizacao-overlay{

            position:absolute;

            inset:0;

            background:
                rgba(15,23,42,.7);

            display:flex;

            align-items:center;

            justify-content:center;

            padding:20px;

        }


        .visualizacao-modal{

            width:100%;

            max-width:1100px;

            max-height:92vh;

            overflow:auto;

            background:white;

            border-radius:16px;

            box-shadow:
                0 20px 60px
                rgba(0,0,0,.3);

        }


        .visualizacao-cabecalho{

            display:flex;

            justify-content:space-between;

            align-items:center;

            padding:18px 20px;

            border-bottom:
                1px solid #e2e8f0;

        }


        .visualizacao-cabecalho h2{

            margin:0;

            color:#1e3a8a;

        }


        #fecharVisualizacaoPauta{

            width:40px;

            height:40px;

            padding:0;

            background:#f1f5f9;

            color:#334155;

        }


        .pauta-info{

            padding:20px;

            line-height:1.8;

            background:#f8fafc;

        }


        .visualizacao-tabela{

            overflow-x:auto;

            padding:20px;

        }


        .visualizacao-tabela table{

            width:100%;

            border-collapse:collapse;

            min-width:700px;

        }


        .visualizacao-tabela th{

            background:#1e3a8a;

            color:white;

            padding:10px;

        }


        .visualizacao-tabela td{

            border:
                1px solid #cbd5e1;

            padding:9px;

            text-align:center;

        }


        .visualizacao-tabela .nome-aluno{

            text-align:left;

            font-weight:bold;

        }


        .acoes-notas{

            display:flex;

            gap:6px;

            justify-content:center;

            flex-wrap:wrap;

        }


        .btn-ver-pauta{

            background:#dbeafe;

            color:#1d4ed8;

            border:0;

            border-radius:7px;

            padding:8px 10px;

            cursor:pointer;

            font-weight:bold;

        }


        .btn-controlar-pauta{

            background:#ede9fe;

            color:#6d28d9;

            border:0;

            border-radius:7px;

            padding:8px 10px;

            cursor:pointer;

            font-weight:bold;

        }


        .btn-ver-pauta:hover,
        .btn-controlar-pauta:hover{

            filter:brightness(.95);

        }


        .estado-nota{

            display:inline-block;

            padding:4px 8px;

            border-radius:20px;

            font-size:12px;

            font-weight:bold;

        }


        .estado-nota.aberto{

            background:#dcfce7;

            color:#166534;

        }


        .estado-nota.bloqueado{

            background:#fee2e2;

            color:#991b1b;

        }


        .estado-nota.fechado{

            background:#ede9fe;

            color:#6d28d9;

        }


        .estado-nota.andamento{

            background:#ffedd5;

            color:#9a3412;

        }


        .estado-nota.concluido{

            background:#dcfce7;

            color:#166534;

        }


        .estado-geral{

            display:inline-block;

            padding:5px 8px;

            border-radius:20px;

            font-size:12px;

            font-weight:bold;

        }


        .estado-geral.pendente{

            background:#f1f5f9;

            color:#475569;

        }


        .estado-geral.andamento{

            background:#ffedd5;

            color:#9a3412;

        }


        .estado-geral.concluido{

            background:#dcfce7;

            color:#166534;

        }


        .estado-geral.fechado{

            background:#ede9fe;

            color:#6d28d9;

        }


        .trimestre-1 small,
        .trimestre-2 small,
        .trimestre-3 small{

            display:block;

            margin-top:4px;

            color:#64748b;

            font-size:11px;

        }

    `;


    document.head.appendChild(
        style
    );

}


// =====================================================
// INICIAR PAINEL DE NOTAS
// =====================================================

async function iniciarNotasAdministrador() {

    criarPainelControle();


    await carregarAtribuicoesNotas();

}


// =====================================================
// EVENTO DE ATUALIZAÇÃO
// =====================================================

window.recarregarNotasAdministrador =
async function () {

    await carregarAtribuicoesNotas();

};


// =====================================================
// INICIAR
// =====================================================

iniciarNotasAdministrador();


// =====================================================
// FIM DO NOTAS.JS
// =====================================================

alert(
    "NOTAS.JS ADMINISTRADOR CARREGADO COMPLETAMENTE ✅"
);
