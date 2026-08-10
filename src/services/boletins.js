// =====================================================
// BOLETINS.JS
// ETAPA 3 — TESTE DOS FILTROS
// =====================================================

alert("✅ BOLETINS.JS 1 CARREGOU!");


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
// TESTAR CLASSE
// =====================================================

classeSelect?.addEventListener(
    "change",
    function(){

        alert(
            "Classe selecionada: " +
            this.value
        );

    }
);


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
// ETAPA 5 — TESTAR CLASSE E TURMA
// =====================================================


// TESTE DAS CLASSES

classeSelect.innerHTML = `

    <option value="">
        Selecionar classe
    </option>

    <option value="7">
        7.ª Classe
    </option>

    <option value="8">
        8.ª Classe
    </option>

    <option value="9">
        9.ª Classe
    </option>

`;


// TESTE DAS TURMAS

turmaSelect.innerHTML = `

    <option value="">
        Selecionar turma
    </option>

    <option value="A">
        Turma A
    </option>

    <option value="B">
        Turma B
    </option>

    <option value="C">
        Turma C
    </option>

`;


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
