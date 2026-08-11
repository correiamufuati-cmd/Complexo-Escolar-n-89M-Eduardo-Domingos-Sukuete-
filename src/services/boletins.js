// =====================================================
// BOLETINS.JS
// ETAPA 3 — TESTE DOS FILTROS
// =====================================================

alert("✅ BOLETINS.JS CARREGOU!");


const classeSelect =
    document.getElementById("classeSelect");


const turmaSelect =
    document.getElementById("turmaSelect");


const trimestreSelect =
    document.getElementById("trimestreSelect");


const pesquisaAluno =
    document.getElementById("pesquisaAluno");

const boletinsContainer =
    document.getElementById(
        "boletinsContainer"
    );


const contadorBoletins =
    document.getElementById(
        "contadorBoletins"
    );

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

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

import { db } from "./firebase.js";


alert("🔵 INICIANDO LEITURA DAS TURMAS...");


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

                        ⚠️ Boletim ainda não
                        carregado

                    </div>


                    <div class="boletim-acoes">

                        <button
                            type="button"
                            disabled
                            class="botao-desativado"
                        >
                            👁️ Ver
                        </button>


                        <button
                            type="button"
                            disabled
                            class="botao-desativado"
                        >
                            🖨️ Imprimir
                        </button>


                        <button
                            type="button"
                            disabled
                            class="botao-desativado"
                        >
                            📄 PDF
                        </button>


                        <button
                            type="button"
                            disabled
                            class="botao-desativado"
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
