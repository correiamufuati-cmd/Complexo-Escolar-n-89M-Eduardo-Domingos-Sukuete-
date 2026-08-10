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
