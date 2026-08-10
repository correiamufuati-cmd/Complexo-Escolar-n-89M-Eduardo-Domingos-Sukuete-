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
