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
