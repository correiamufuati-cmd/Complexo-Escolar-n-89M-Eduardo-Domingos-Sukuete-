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

turmaSelect?.addEventListener(
    "change",
    function(){

        alert(
            "Turma selecionada: " +
            this.value
        );

    }
);


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
// ETAPA 8 — TESTAR TURMA SELECIONADA
// =====================================================

turmaSelect.addEventListener(
    "change",
    function(){

        const turmaId =
            this.value;


        const turmaNome =
            this.options[
                this.selectedIndex
            ]?.textContent;


        if(!turmaId){

            return;

        }


        alert(
            "✅ TURMA SELECIONADA!\n\n" +

            "ID da turma:\n" +
            turmaId +

            "\n\nNome da turma:\n" +
            turmaNome +

            "\n\nClasse:\n" +
            classeSelect.value
        );

    }
);

// =====================================================
// ETAPA 9 — CARREGAR ALUNOS DA TURMA
// =====================================================

async function carregarAlunosDaTurma(
    turmaId
){

    if(!turmaId){

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


        if(resultado.empty){

            alert(
                "⚠️ ESTA TURMA NÃO POSSUI ALUNOS."
            );

            return;

        }


        // =============================================
// MOSTRAR OS ALUNOS NA PÁGINA
// =============================================

boletinsContainer.innerHTML = "";


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
// ATUALIZAR CONTADOR
// =============================================

contadorBoletins.textContent =

    resultado.size +

    (
        resultado.size === 1
            ? " aluno"
            : " alunos"
    );


// =====================================================
// LIGAR TURMA → ALUNOS
// =====================================================

turmaSelect.addEventListener(
    "change",
    function(){

        carregarAlunosDaTurma(
            this.value
        );

    }
);
