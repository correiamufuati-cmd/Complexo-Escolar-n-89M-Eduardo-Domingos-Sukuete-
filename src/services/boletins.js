// =====================================================
// BOLETINS.JS
// =====================================================

alert("✅ BOLETINS.JS CARREGOU!");

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

import { db } from "./firebase.js";


// =====================================================
// ELEMENTOS
// =====================================================

const classeSelect =
    document.getElementById("classeSelect");

const turmaSelect =
    document.getElementById("turmaSelect");

const trimestreSelect =
    document.getElementById("trimestreSelect");

const pesquisaAluno =
    document.getElementById("pesquisaAluno");

const boletinsContainer =
    document.getElementById("boletinsContainer");

const contadorBoletins =
    document.getElementById("contadorBoletins");

if(
    !classeSelect ||
    !turmaSelect ||
    !trimestreSelect ||
    !pesquisaAluno
){

    alert(
        "❌ ERRO: algum campo dos filtros não foi encontrado."
    );

}
else{

    alert(
        "✅ OS 4 CAMPOS DOS FILTROS FORAM ENCONTRADOS!"
    );

}


// =====================================================
// TESTAR TURMA
// =====================================================




// =====================================================
// TESTAR TRIMESTRE
// =====================================================

trimestreSelect?.addEventListener(
    "change",
    function(){

        alert(
            "Trimestre selecionado: " +
            this.value
        );

    }
);


// =====================================================
// TESTAR PESQUISA
// =====================================================

pesquisaAluno?.addEventListener(
    "input",
    function(){

        console.log(
            "Pesquisa:",
            this.value
        );

    }
);

// =====================================================
// ETAPA 4 — TESTAR TRIMESTRE
// =====================================================

trimestreSelect.addEventListener(
    "change",
    function(){

        alert(
            "✅ TRIMESTRE FUNCIONOU!\n\n" +
            "Valor selecionado: " +
            this.value
        );

    }
);


// =====================================================
// EVENTO CLASSE
// =====================================================

classeSelect.addEventListener(
    "change",
    function(){

        alert(
            "✅ CLASSE FUNCIONOU!\n\n" +
            "Classe selecionada: " +
            this.value
        );

    }
);


// =====================================================
// EVENTO TURMA
// =====================================================

turmaSelect.addEventListener(
    "change",
    function(){

        alert(
            "✅ TURMA FUNCIONOU!\n\n" +
            "Turma selecionada: " +
            this.value
        );

    }
);

// =====================================================
// ETAPA 6 — LER TURMAS DO FIREBASE
// =====================================================

// =====================================================
// CARREGAR TURMAS
// =====================================================

async function carregarTurmas(){

    try{

        const resultado =
            await getDocs(
                collection(
                    db,
                    "turmas"
                )
            );


        alert(
            "✅ FIREBASE RESPONDEU!\n\n" +
            "Turmas encontradas: " +
            resultado.size
        );


        if(resultado.empty){

            alert(
                "⚠️ A coleção turmas está vazia."
            );

            return;

        }


        // Limpar opções de teste

        turmaSelect.innerHTML = `

            <option value="">
                Selecionar turma
            </option>

        `;


        resultado.forEach(
            documento => {

                const turma =
                    documento.data();


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    documento.id;


                option.textContent =
                    turma.nome ||
                    turma.turma ||
                    "Turma sem nome";


                turmaSelect.appendChild(
                    option
                );

            }
        );


        alert(
            "✅ TURMAS COLOCADAS NO SELECT!"
        );


    }
    catch(erro){

        console.error(
            "Erro ao carregar turmas:",
            erro
        );


        alert(
            "❌ ERRO AO LER TURMAS!\n\n" +
            erro.message
        );

    }

}


// =====================================================
// EXECUTAR
// =====================================================

carregarTurmas();

// =====================================================
// ETAPA 6 — CARREGAR CLASSES REAIS DO FIREBASE
// =====================================================

async function carregarClasses(){

    try{

        alert("🔵 A PROCURAR CLASSES NO FIREBASE...");


        const resultado =
            await getDocs(
                collection(
                    db,
                    "turmas"
                )
            );


        // =============================================
        // LIMPAR CLASSES DE TESTE
        // =============================================

        classeSelect.innerHTML = `

            <option value="">
                Selecionar classe
            </option>

        `;


        // =============================================
        // VERIFICAR SE EXISTEM TURMAS
        // =============================================

        if(resultado.empty){

            alert(
                "⚠️ NÃO EXISTEM TURMAS NO FIREBASE."
            );

            return;

        }


        // =============================================
        // GUARDAR CLASSES SEM REPETIR
        // =============================================

        const classes =
            new Map();


        resultado.forEach(
            documento => {

                const turma =
                    documento.data();


                const classe =
                    turma.classe ||
                    turma.nomeClasse ||
                    turma.classeNome ||
                    "";


                if(!classe){

                    return;

                }


                const chave =
                    String(
                        classe
                    )
                    .trim()
                    .toLowerCase();


                if(!classes.has(chave)){

                    classes.set(
                        chave,
                        classe
                    );

                }

            }
        );


        // =============================================
        // COLOCAR CLASSES NO SELECT
        // =============================================

        classes.forEach(
            (nomeClasse) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    nomeClasse;


                option.textContent =
                    nomeClasse;


                classeSelect.appendChild(
                    option
                );

            }
        );


        alert(
            "✅ CLASSES CARREGADAS!\n\n" +
            "Total de classes: " +
            classes.size
        );


    }
    catch(erro){

        console.error(
            "Erro ao carregar classes:",
            erro
        );


        alert(
            "❌ ERRO AO CARREGAR CLASSES!\n\n" +
            erro.message
        );

    }

}


// =====================================================
// INICIAR
// =====================================================

carregarClasses();

// =====================================================
// ETAPA 7 — CLASSE → TURMAS REAIS
// =====================================================

classeSelect.addEventListener(
    "change",
    async function(){

        const classeSelecionada =
            this.value;


        // =============================================
        // LIMPAR TURMAS
        // =============================================

        turmaSelect.innerHTML = `

            <option value="">
                Selecionar turma
            </option>

        `;


        if(!classeSelecionada){

            return;

        }


        alert(
            "🔵 CLASSE SELECIONADA:\n\n" +
            classeSelecionada +
            "\n\nA procurar as turmas..."
        );


        try{

            // =========================================
            // LER TURMAS
            // =========================================

            const resultado =
                await getDocs(
                    collection(
                        db,
                        "turmas"
                    )
                );


            let total = 0;


            // =========================================
            // FILTRAR PELA CLASSE
            // =========================================

            resultado.forEach(
                documento => {

                    const turma =
                        documento.data();


                    if(
                        String(
                            turma.classe
                        ).trim() !==
                        String(
                            classeSelecionada
                        ).trim()
                    ){

                        return;

                    }


                    // =================================
                    // CRIAR OPÇÃO
                    // =================================

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        documento.id;


                    option.textContent =
                        turma.nome ||
                        "Turma sem nome";


                    turmaSelect.appendChild(
                        option
                    );


                    total++;

                }
            );


            // =========================================
            // RESULTADO
            // =========================================

            if(total === 0){

                alert(
                    "⚠️ Nenhuma turma encontrada " +
                    "para esta classe."
                );

            }
            else{

                alert(
                    "✅ TURMAS CARREGADAS!\n\n" +
                    "Classe: " +
                    classeSelecionada +
                    "\n\n" +
                    "Total de turmas: " +
                    total
                );

            }


        }
        catch(erro){

            console.error(
                "Erro ao carregar turmas:",
                erro
            );


            alert(
                "❌ ERRO AO CARREGAR TURMAS!\n\n" +
                erro.message
            );

        }

    }
);

// =====================================================
// ETAPA 8/9 — TURMA → ALUNOS
// =====================================================

async function carregarAlunosDaTurma(turmaId){

    if(!turmaId){

        boletinsContainer.innerHTML = "";

        contadorBoletins.textContent = "0 alunos";

        return;

    }


    alert(
        "🔵 A PROCURAR ALUNOS...\n\n" +
        "Turma: " +
        turmaId
    );


    try{

        const resultado =
            await getDocs(
                collection(
                    db,
                    "turmas",
                    turmaId,
                    "alunos"
                )
            );


        alert(
            "✅ FIREBASE RESPONDEU!\n\n" +
            "Alunos encontrados: " +
            resultado.size
        );


        boletinsContainer.innerHTML = "";


        // =============================================
        // NENHUM ALUNO
        // =============================================

        if(resultado.empty){

            contadorBoletins.textContent =
                "0 alunos";


            boletinsContainer.innerHTML = `

                <div style="
                    padding:25px;
                    text-align:center;
                    color:#64748b;
                ">

                    ⚠️ Esta turma não possui
                    alunos cadastrados.

                </div>

            `;

            return;

        }


        // =============================================
        // MOSTRAR ALUNOS
        // =============================================

        resultado.forEach(
            documento => {

                const aluno =
                    documento.data();


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "boletim-card";


                card.innerHTML = `

                    <div class="boletim-info">

                        <div class="boletim-avatar">
                            👨‍🎓
                        </div>


                        <div>

                            <h3>
                                ${
                                    aluno.nome ||
                                    "Aluno sem nome"
                                }
                            </h3>


                            <p>
                                Nº:
                                ${
                                    aluno.numero ||
                                    "—"
                                }
                            </p>


                            <p>
                                Matrícula:
                                ${
                                    aluno.matricula ||
                                    "—"
                                }
                            </p>

                        </div>

                    </div>


<div class="boletim-estado">

    📋 Boletim disponível para geração

</div>

<div class="boletim-acoes">

    <button
        type="button"
        class="botao-ver"
        data-aluno-id="${documento.id}"
    >
        👁️ Ver
    </button>


    <button
        type="button"
        class="botao-imprimir"
        data-aluno-id="${documento.id}"
    >
        🖨️ Imprimir
    </button>


    <button
        type="button"
        class="botao-pdf"
        data-aluno-id="${documento.id}"
    >
        📄 PDF
    </button>


    <button
        type="button"
        class="botao-excel"
        data-aluno-id="${documento.id}"
    >
        📊 Excel
    </button>

</div>

                `;


                boletinsContainer.appendChild(
                    card
                );

            }
        );


        // =============================================
        // CONTADOR
        // =============================================

        contadorBoletins.textContent =

            resultado.size +

            (
                resultado.size === 1
                    ? " aluno"
                    : " alunos"
            );


    }
    catch(erro){

        console.error(
            "Erro ao carregar alunos:",
            erro
        );


        alert(
            "❌ ERRO AO CARREGAR ALUNOS!\n\n" +
            erro.message
        );

    }

}


// =====================================================
// TURMA → ALUNOS
// =====================================================

turmaSelect.addEventListener(
    "change",
    function(){

        const turmaId =
            this.value;


        if(!turmaId){

            return;

        }


        alert(
            "✅ TURMA SELECIONADA!\n\n" +
            "ID:\n" +
            turmaId +

            "\n\nClasse:\n" +
            classeSelect.value
        );


        carregarAlunosDaTurma(
            turmaId
        );

    }
);


// =====================================================
// ETAPA 10 — CLASSE + TURMA + TRIMESTRE
// =====================================================

trimestreSelect.addEventListener(
    "change",
    function(){

        const classe =
            classeSelect.value;

        const turma =
            turmaSelect.value;

        const trimestre =
            this.value;


        if(
            !classe ||
            !turma ||
            !trimestre
        ){

            return;

        }


        const turmaNome =
            turmaSelect.options[
                turmaSelect.selectedIndex
            ]?.textContent;


        alert(
            "✅ DADOS DA PAUTA IDENTIFICADOS!\n\n" +

            "Classe: " +
            classe +

            "\n\nTurma: " +
            turmaNome +

            "\n\nID da turma: " +
            turma +

            "\n\nTrimestre: " +
            trimestre
        );

    }
);

// =====================================================
// ETAPA 11 — TESTAR NOTAS DO PRIMEIRO ALUNO
// =====================================================

async function testarNotasDoAluno(){

    const turmaId =
        turmaSelect.value;


    if(!turmaId){

        alert(
            "⚠️ Primeiro selecione uma turma."
        );

        return;

    }


    try{

        // =============================================
        // BUSCAR ALUNOS
        // =============================================

        const alunosSnapshot =
            await getDocs(
                collection(
                    db,
                    "turmas",
                    turmaId,
                    "alunos"
                )
            );


        if(alunosSnapshot.empty){

            alert(
                "⚠️ Esta turma não possui alunos."
            );

            return;

        }


        // =============================================
        // PRIMEIRO ALUNO
        // =============================================

        const primeiroAluno =
            alunosSnapshot.docs[0];


        const aluno =
            primeiroAluno.data();


        const alunoId =
            primeiroAluno.id;


        // =============================================
        // BUSCAR NOTAS
        // =============================================

        const notasSnapshot =
            await getDocs(
                collection(
                    db,
                    "turmas",
                    turmaId,
                    "alunos",
                    alunoId,
                    "notas"
                )
            );


        // =============================================
        // RESULTADO
        // =============================================

        alert(

            "📝 TESTE DAS NOTAS\n\n" +

            "Aluno:\n" +
            (
                aluno.nome ||
                "Sem nome"
            ) +

            "\n\nID do aluno:\n" +
            alunoId +

            "\n\nNotas encontradas:\n" +
            notasSnapshot.size

        );


        // =============================================
        // MOSTRAR DADOS DA PRIMEIRA NOTA
        // =============================================

        if(
            !notasSnapshot.empty
        ){

            const primeiraNota =
                notasSnapshot.docs[0]
                    .data();


            console.log(
                "PRIMEIRA NOTA:",
                primeiraNota
            );


            alert(

                "✅ PRIMEIRA NOTA ENCONTRADA!\n\n" +

                JSON.stringify(
                    primeiraNota,
                    null,
                    2
                )

            );

        }

    }
    catch(erro){

        console.error(
            "Erro ao testar notas:",
            erro
        );


        alert(

            "❌ ERRO AO PROCURAR NOTAS!\n\n" +
            erro.message

        );

    }

                }

// =====================================================
// BOTÃO DE TESTE DAS NOTAS
// =====================================================

alert("🔵 A CRIAR BOTÃO TESTAR NOTAS...");


const botaoTesteNotas =
    document.createElement("button");


botaoTesteNotas.id =
    "botaoTesteNotas";


botaoTesteNotas.type =
    "button";


botaoTesteNotas.textContent =
    "📝 Testar notas";


botaoTesteNotas.style.display =
    "block";

botaoTesteNotas.style.margin =
    "20px";

botaoTesteNotas.style.padding =
    "12px 20px";

botaoTesteNotas.style.background =
    "#2563eb";

botaoTesteNotas.style.color =
    "white";

botaoTesteNotas.style.border =
    "none";

botaoTesteNotas.style.borderRadius =
    "8px";

botaoTesteNotas.style.cursor =
    "pointer";


botaoTesteNotas.addEventListener(
    "click",
    testarNotasDoAluno
);


document.body.appendChild(
    botaoTesteNotas
);


alert(
    "✅ BOTÃO TESTAR NOTAS CRIADO!"
);

// =====================================================
// ETAPA 12 — TESTAR COLEÇÃO PRINCIPAL "notas"
// =====================================================

async function testarColecaoNotas(){

    try{

        alert(
            "🔵 A PROCURAR NA COLEÇÃO PRINCIPAL 'notas'..."
        );


        const resultado =
            await getDocs(
                collection(
                    db,
                    "notas"
                )
            );


        alert(
            "📝 DOCUMENTOS NA COLEÇÃO NOTAS:\n\n" +
            resultado.size
        );


        if(resultado.empty){

            alert(
                "⚠️ A COLEÇÃO 'notas' ESTÁ VAZIA."
            );

            return;

        }


        // =============================================
        // MOSTRAR PRIMEIRO DOCUMENTO
        // =============================================

        const documento =
            resultado.docs[0];


        const dados =
            documento.data();


        console.log(
            "PRIMEIRO DOCUMENTO DA COLEÇÃO NOTAS:",
            dados
        );


        alert(
            "✅ ENCONTRAMOS UMA NOTA!\n\n" +
            "ID:\n" +
            documento.id +
            "\n\nDADOS:\n" +
            JSON.stringify(
                dados,
                null,
                2
            )
        );

    }
    catch(erro){

        console.error(
            "Erro ao procurar coleção notas:",
            erro
        );


        alert(
            "❌ ERRO:\n\n" +
            erro.message
        );

    }

}


// =====================================================
// BOTÃO TESTAR COLEÇÃO NOTAS
// =====================================================

const botaoColecaoNotas =
    document.createElement("button");


botaoColecaoNotas.type =
    "button";


botaoColecaoNotas.textContent =
    "🔎 Ver estrutura das notas";


botaoColecaoNotas.style.display =
    "block";


botaoColecaoNotas.style.margin =
    "20px";


botaoColecaoNotas.style.padding =
    "12px 20px";


botaoColecaoNotas.style.background =
    "#16a34a";


botaoColecaoNotas.style.color =
    "white";


botaoColecaoNotas.style.border =
    "none";


botaoColecaoNotas.style.borderRadius =
    "8px";


botaoColecaoNotas.style.cursor =
    "pointer";


botaoColecaoNotas.addEventListener(
    "click",
    testarColecaoNotas
);


document.body.appendChild(
    botaoColecaoNotas
);

// =====================================================
// ETAPA 13 — TODOS OS BOLETINS DA TURMA
// =====================================================

async function testarBoletimCompleto(){

    const turmaId =
        turmaSelect.value;

    const trimestre =
        trimestreSelect.value;


    if(!turmaId){

        alert(
            "⚠️ Selecione primeiro uma turma."
        );

        return;

    }


    if(!trimestre){

        alert(
            "⚠️ Selecione primeiro o trimestre."
        );

        return;

    }


    try{

        alert(
            "🔵 A PREPARAR OS BOLETINS DA TURMA..."
        );


        // =================================================
        // BUSCAR ALUNOS
        // =================================================

        const alunosSnapshot =
            await getDocs(
                collection(
                    db,
                    "turmas",
                    turmaId,
                    "alunos"
                )
            );


        if(alunosSnapshot.empty){

            alert(
                "⚠️ Esta turma não possui alunos."
            );

            return;

        }


        // =================================================
        // BUSCAR NOTAS
        // =================================================

        const notasSnapshot =
            await getDocs(
                collection(
                    db,
                    "notas"
                )
            );


        if(notasSnapshot.empty){

            alert(
                "⚠️ A coleção notas está vazia."
            );

            return;

        }


        // =================================================
        // LIMPAR ÁREA
        // =================================================

        boletinsContainer.innerHTML = "";


        let totalBoletins = 0;


        // =================================================
        // PERCORRER TODOS OS ALUNOS
        // =================================================

        alunosSnapshot.forEach(
            alunoDocumento => {

                const aluno =
                    alunoDocumento.data();


                const nomeAluno =
                    String(
                        aluno.nome || ""
                    )
                    .trim();


                const numeroAluno =
                    String(
                        aluno.numero || ""
                    )
                    .trim();


                const disciplinas = [];


                // =================================================
                // PROCURAR NOTAS DO ALUNO
                // =================================================

                notasSnapshot.forEach(
                    notaDocumento => {

                        const dados =
                            notaDocumento.data();


                        if(
                            !Array.isArray(
                                dados.alunos
                            )
                        ){

                            return;

                        }


                        const registro =
                            dados.alunos.find(
                                item => {

                                    const nomeNota =
                                        String(
                                            item.nome || ""
                                        )
                                        .trim();


                                    const numeroNota =
                                        String(
                                            item.numero || ""
                                        )
                                        .trim();


                                    return (

                                        (
                                            numeroAluno &&
                                            numeroNota ===
                                            numeroAluno
                                        )

                                        ||

                                        (
                                            nomeAluno &&
                                            nomeNota ===
                                            nomeAluno
                                        )

                                    );

                                }
                            );


                        if(!registro){

                            return;

                        }


                        // =================================================
                        // IDENTIFICAR DISCIPLINA
                        // =================================================

                        let disciplina =
                            notaDocumento.id;


                        disciplina =
                            disciplina.replace(
                                /_[123]$/,
                                ""
                            );


                        if(
                            disciplina.includes("_")
                        ){

                            const partes =
                                disciplina.split("_");


                            disciplina =
                                partes
                                    .slice(1)
                                    .join("_");

                        }


                        // =================================================
                        // EVITAR DISCIPLINAS REPETIDAS
                        // =================================================

                        const jaExiste =
                            disciplinas.some(
                                item =>
                                    item.disciplina ===
                                    disciplina
                            );


                        if(jaExiste){

                            return;

                        }


                        // =================================================
                        // ADICIONAR DISCIPLINA
                        // =================================================

                        disciplinas.push({

                            disciplina:
                                disciplina,

                            MAC:
                                registro.MAC ?? "",

                            NPT:
                                registro.NPT ?? "",

                            MF:
                                registro.MF ?? "",

                            classificacao:
                                registro.classificacao ||
                                ""

                        });

                    }
                );


                // =================================================
                // CRIAR BOLETIM
                // =================================================

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "boletim-card";


                card.style.marginBottom =
                    "25px";


                card.style.padding =
                    "20px";


                card.style.background =
                    "white";


                card.style.borderRadius =
                    "12px";


                card.style.boxShadow =
                    "0 3px 12px rgba(0,0,0,.08)";


                let linhas = "";


                disciplinas.forEach(
                    item => {

                        linhas += `

                            <tr>

                                <td>
                                    ${item.disciplina}
                                </td>

                                <td>
                                    ${item.MAC}
                                </td>

                                <td>
                                    ${item.NPT}
                                </td>

                                <td>
                                    ${item.MF}
                                </td>

                                <td>
                                    ${item.classificacao || "—"}
                                </td>

                            </tr>

                        `;

                    }
                );


                if(
                    disciplinas.length === 0
                ){

                    linhas = `

                        <tr>

                            <td
                                colspan="5"
                                style="
                                    text-align:center;
                                    padding:15px;
                                    color:#b91c1c;
                                "
                            >

                                ⚠️ Nenhuma nota
                                encontrada.

                            </td>

                        </tr>

                    `;

                }


                card.innerHTML = `

    <!-- =========================================
         CABEÇALHO DO BOLETIM
    ========================================== -->

    <div style="
        text-align:center;
        margin-bottom:20px;
        border-bottom:2px solid #1e3a8a;
        padding-bottom:15px;
    ">

        <h2 style="
            margin:0;
            color:#1e3a8a;
        ">
            BOLETIM DE AVALIAÇÃO
        </h2>

        <p style="
            margin:6px 0;
            font-size:14px;
        ">
            Ano Lectivo
        </p>

    </div>


    <!-- =========================================
         DADOS DO ALUNO
    ========================================== -->

    <div style="
        display:grid;
        grid-template-columns:
            repeat(auto-fit,minmax(180px,1fr));
        gap:10px;
        margin-bottom:20px;
        background:#f8fafc;
        padding:15px;
        border-radius:8px;
    ">

        <div>
            <strong>Aluno:</strong><br>
            ${nomeAluno || "—"}
        </div>

        <div>
            <strong>Nº:</strong><br>
            ${numeroAluno || "—"}
        </div>

        <div>
            <strong>Turma:</strong><br>
            ${
                turmaSelect.options[
                    turmaSelect.selectedIndex
                ]?.textContent || "—"
            }
        </div>

        <div>
            <strong>Trimestre:</strong><br>
            ${trimestre}
        </div>

<div>
    <strong>Professor:</strong><br>
    ${"Nome do Professor"}
</div>

    </div>


    <!-- =========================================
         TABELA DE NOTAS
    ========================================== -->

    <div style="
        overflow-x:auto;
    ">

        <table style="
            width:100%;
            border-collapse:collapse;
            min-width:600px;
        ">

            <thead>

                <tr>

                    <th style="
                        padding:10px;
                        border:1px solid #cbd5e1;
                        background:#e2e8f0;
                        text-align:left;
                    ">
                        Disciplina
                    </th>

                    <th style="
                        padding:10px;
                        border:1px solid #cbd5e1;
                        background:#e2e8f0;
                    ">
                        MAC
                    </th>

                    <th style="
                        padding:10px;
                        border:1px solid #cbd5e1;
                        background:#e2e8f0;
                    ">
                        NPT
                    </th>

                    <th style="
                        padding:10px;
                        border:1px solid #cbd5e1;
                        background:#e2e8f0;
                    ">
                        MF
                    </th>

                    <th style="
                        padding:10px;
                        border:1px solid #cbd5e1;
                        background:#e2e8f0;
                    ">
                        Classificação
                    </th>

                </tr>

            </thead>


            <tbody>

                ${linhas}

            </tbody>

        </table>

    </div>

<!-- =========================================
     PROFESSOR
========================================== -->

<div class="professor-assinatura">

    <strong>Professor:</strong>

    ______________________________

</div>

    <!-- =========================================
         AÇÕES
    ========================================== -->

    <div style="
        display:flex;
        gap:10px;
        flex-wrap:wrap;
        margin-top:20px;
    ">

        <button
            type="button"
            disabled
            style="
                padding:9px 14px;
                border:0;
                border-radius:7px;
                background:#94a3b8;
                color:white;
            "
        >
            👁️ Ver
        </button>

        <button
            type="button"
            disabled
            style="
                padding:9px 14px;
                border:0;
                border-radius:7px;
                background:#94a3b8;
                color:white;
            "
        >
            🖨️ Imprimir
        </button>

        <button
            type="button"
            disabled
            style="
                padding:9px 14px;
                border:0;
                border-radius:7px;
                background:#94a3b8;
                color:white;
            "
        >
            📄 PDF
        </button>

        <button
            type="button"
            disabled
            style="
                padding:9px 14px;
                border:0;
                border-radius:7px;
                background:#94a3b8;
                color:white;
            "
        >
            📊 Excel
        </button>

    </div>

`;

                boletinsContainer.appendChild(
                    card
                );


                totalBoletins++;

            }
        );


        // =================================================
        // CONTADOR
        // =================================================

        if(contadorBoletins){

            contadorBoletins.textContent =

                totalBoletins +

                (
                    totalBoletins === 1
                        ? " boletim"
                        : " boletins"
                );

        }


        alert(
            "✅ BOLETINS GERADOS!\n\n" +
            "Total de alunos: " +
            totalBoletins
        );


    }
    catch(erro){

        console.error(
            "Erro ao gerar boletins:",
            erro
        );


        alert(
            "❌ ERRO AO GERAR BOLETINS!\n\n" +
            erro.message
        );

    }

    }

// =====================================================
// TESTE — DADOS DA TURMA E PROFESSORES
// =====================================================

async function testarDadosProfessor(){

    const turmaId =
        turmaSelect.value;


    if(!turmaId){

        alert(
            "⚠️ Primeiro selecione uma turma."
        );

        return;

    }


    try{

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


        if(!turmaSnap.exists()){

            alert(
                "❌ A turma não foi encontrada."
            );

            return;

        }


        const dados =
            turmaSnap.data();


        alert(

            "🏫 DADOS DA TURMA\n\n" +

            JSON.stringify(
                dados,
                null,
                2
            )

        );


        console.log(
            "DADOS COMPLETOS DA TURMA:",
            dados
        );

    }
    catch(erro){

        console.error(
            "Erro ao procurar dados da turma:",
            erro
        );


        alert(

            "❌ ERRO!\n\n" +
            erro.message

        );

    }

    }

// =====================================================
// BOTÃO — IMPRIMIR TODOS OS BOLETINS DA TURMA
// =====================================================

const botaoImprimirTodos =
    document.createElement("button");

botaoImprimirTodos.type =
    "button";

botaoImprimirTodos.id =
    "botaoImprimirTodos";

botaoImprimirTodos.textContent =
    "🖨️ Imprimir todos os boletins";

botaoImprimirTodos.style.display =
    "block";

botaoImprimirTodos.style.margin =
    "20px 0";

botaoImprimirTodos.style.padding =
    "12px 20px";

botaoImprimirTodos.style.background =
    "#1e3a8a";

botaoImprimirTodos.style.color =
    "white";

botaoImprimirTodos.style.border =
    "none";

botaoImprimirTodos.style.borderRadius =
    "8px";

botaoImprimirTodos.style.cursor =
    "pointer";

// =====================================================
// IMPRIMIR TODOS OS BOLETINS COMPLETOS
// ==========

botaoImprimirTodos.addEventListener(
    "click",
    async function(){

        // =============================================
        // ABRIR A JANELA IMEDIATAMENTE
        // =============================================

        const janela =
            window.open(
                "",
                "_blank"
            );


        if(!janela){

            alert(
                "❌ O navegador bloqueou a janela de impressão.\n\n" +
                "Permita pop-ups para este site e tente novamente."
            );

            return;

        }


        // =============================================
        // VERIFICAR TURMA
        // =============================================

        const turmaId =
            turmaSelect.value;


        if(!turmaId){

            janela.close();

            alert(
                "⚠️ Primeiro selecione uma turma."
            );

            return;

        }


        // =============================================
        // VERIFICAR TRIMESTRE
        // =============================================

        const trimestre =
            trimestreSelect.value;


        if(!trimestre){

            janela.close();

            alert(
                "⚠️ Primeiro selecione o trimestre."
            );

            return;

        }


        // =============================================
        // AVISAR NA JANELA
        // =============================================

        janela.document.write(`
            <html>
            <body style="
                font-family:Arial;
                text-align:center;
                padding:40px;
            ">
                <h3>A preparar os boletins...</h3>
                <p>Aguarde...</p>
            </body>
            </html>
        `);

        janela.document.close();


        try{

            // =========================================
            // GERAR BOLETINS COMPLETOS
            // =========================================

            await testarBoletimCompleto();


            // =========================================
            // PEGAR BOLETINS COMPLETOS
            // =========================================

            const conteudo =
                boletinsContainer.innerHTML;


            if(!conteudo.trim()){

                janela.close();

                alert(
                    "⚠️ Nenhum boletim foi gerado."
                );

                return;

            }


            // =========================================
            // ESCREVER CONTEÚDO FINAL
            // =========================================

            janela.document.open();


            janela.document.write(`

<!DOCTYPE html>

<html lang="pt">

<head>

<meta charset="UTF-8">

<title>
Boletins da Turma
</title>

<style>

*{
    box-sizing:border-box;
}

body{

    font-family:Arial,sans-serif;

    margin:0;

    padding:0;

    color:#1e293b;

    font-size:9px;

}

.boletim-card{

    height:32%;

    margin:0 0 1% 0;

    padding:7px;

    border:1px solid #94a3b8;

    border-radius:4px;

    page-break-inside:avoid;

    overflow:hidden;

}

.boletim-card h2{

    font-size:13px;

    margin:0 0 3px 0;

}

.boletim-card h3{

    font-size:11px;

    margin:0 0 3px 0;

}

.boletim-card p{

    font-size:8px;

    margin:1px 0;

}

table{

    width:100%;

    border-collapse:collapse;

    margin-top:5px;

    font-size:7.5px;

}

th,
td{

    border:1px solid #94a3b8;

    padding:3px 4px;

    line-height:1.05;

}

th{

    background:#e2e8f0;

    font-weight:bold;

}

td:first-child,
th:first-child{

    text-align:left;

}

.professor-assinatura{

    margin-top:5px;

    padding-top:3px;

    border-top:1px solid #cbd5e1;

    font-size:8px;

}

.boletim-card:nth-child(3n){

    page-break-after:always;

}

.boletim-card:last-child{

    page-break-after:auto;

}

button{

    display:none !important;

}

@media print{

    @page{

        size:A4 portrait;

        margin:6mm;

    }

    body{

        margin:0;

        padding:0;

    }

    .boletim-card{

        height:32%;

        margin-bottom:1%;

        padding:7px;

        page-break-inside:avoid;

    }

}

</style>

</head>

<body>

${conteudo}

</body>

</html>

`);


            janela.document.close();


            // =========================================
            // IMPRIMIR
            // =========================================

            janela.onload =
                function(){

                    janela.focus();

                    janela.print();

                };


        }
        catch(erro){

            console.error(
                "Erro ao preparar impressão:",
                erro
            );

            janela.close();

            alert(
                "❌ ERRO AO PREPARAR IMPRESSÃO!\n\n" +
                erro.message
            );

        }

    }
);

    
// =====================================================
// COLOCAR NA PÁGINA
// =====================================================

if(boletinsContainer){

    boletinsContainer.parentElement
        ?.insertBefore(
            botaoImprimirTodos,
            boletinsContainer
        );

}

// =====================================================
// BOTÃO DE TESTE
// =====================================================

const botaoBoletimCompleto =
    document.createElement(
        "button"
    );


botaoBoletimCompleto.type =
    "button";


botaoBoletimCompleto.textContent =
    "📋 Testar boletim completo";


botaoBoletimCompleto.style.display =
    "block";


botaoBoletimCompleto.style.margin =
    "20px";


botaoBoletimCompleto.style.padding =
    "12px 20px";


botaoBoletimCompleto.style.background =
    "#7c3aed";


botaoBoletimCompleto.style.color =
    "white";


botaoBoletimCompleto.style.border =
    "none";


botaoBoletimCompleto.style.borderRadius =
    "8px";


botaoBoletimCompleto.style.cursor =
    "pointer";


botaoBoletimCompleto.addEventListener(
    "click",
    testarBoletimCompleto
);


document.body.appendChild(
    botaoBoletimCompleto
);

// =====================================================
// BOTÕES DOS BOLETINS
// =====================================================

document.addEventListener(
    "click",
    async function(event){

        const botao =
            event.target.closest(
                ".botao-ver, .botao-imprimir, .botao-pdf, .botao-excel"
            );


        if(!botao){
            return;
        }


        const alunoId =
            botao.dataset.alunoId;


        const turmaId =
            turmaSelect.value;


        if(!alunoId || !turmaId){

            alert(
                "⚠️ Não foi possível identificar o aluno ou a turma."
            );

            return;

        }


        // =============================================
        // VER
        // =============================================

        if(
            botao.classList.contains(
                "botao-ver"
            )
        ){

            await abrirBoletimIndividual(
                turmaId,
                alunoId,
                false
            );

            return;

        }


        // =============================================
        // IMPRIMIR
        // =============================================

        if(
            botao.classList.contains(
                "botao-imprimir"
            )
        ){

            await abrirBoletimIndividual(
                turmaId,
                alunoId,
                true
            );

            return;

        }


        // =============================================
        // PDF
        // =============================================

        if(
            botao.classList.contains(
                "botao-pdf"
            )
        ){

            await abrirBoletimIndividual(
                turmaId,
                alunoId,
                true
            );

            return;

        }


        // =============================================
        // EXCEL
        // =============================================

        if(
            botao.classList.contains(
                "botao-excel"
            )
        ){

            await exportarBoletimExcel(
                turmaId,
                alunoId
            );

            return;

        }

    }
);

// =====================================================
// TESTE — ABRIR BOLETIM INDIVIDUAL
// =====================================================

document.addEventListener(
    "click",
    async function(event){

        const botao =
            event.target.closest(
                ".botao-ver"
            );


        if(!botao){
            return;
        }


        alert("1️⃣ CLIQUE NO BOTÃO VER");


        const alunoId =
            botao.dataset.alunoId;


        alert(
            "2️⃣ ID DO ALUNO:\n\n" +
            alunoId
        );


        const turmaId =
            turmaSelect.value;


        alert(
            "3️⃣ ID DA TURMA:\n\n" +
            turmaId
        );


        try{

            alert(
                "4️⃣ VOU CHAMAR abrirBoletimIndividual()"
            );


            await abrirBoletimIndividual(
                turmaId,
                alunoId,
                false
            );


            alert(
                "5️⃣ A FUNÇÃO TERMINOU"
            );

        }
        catch(erro){

            console.error(
                erro
            );


            alert(
                "❌ ERRO:\n\n" +
                erro.message
            );

        }

    }
);
