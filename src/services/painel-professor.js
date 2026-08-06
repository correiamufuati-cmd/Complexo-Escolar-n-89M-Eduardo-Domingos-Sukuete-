alert("PAINEL Dx");

import { db } from "./firebase.js";


// ==========================
// VERIFICAR PROFESSOR LOGADO
// ==========================

const professor = JSON.parse(
    localStorage.getItem("professorLogado")
);


if(!professor){

    window.location.href = "login-professor.html";

    throw new Error("Professor não autenticado");

}


// ==========================
// ELEMENTOS DA PÁGINA
// ==========================

const nomeProfessor =
document.getElementById("nomeProfessor");


const selectTurma =
document.getElementById("selectTurma");


const selectDisciplina =
document.getElementById("selectDisciplina");




// ==========================
// MOSTRAR NOME
// ==========================

nomeProfessor.innerHTML =
"👨‍🏫 " + professor.nome;




// ==========================
// ATRIBUIÇÕES DO PROFESSOR
// ==========================

const atribuicoes =
professor.atribuicoes || [];

alert(
"Professor: " + professor.nome +
"\nTotal de atribuições: " + atribuicoes.length +
"\nDados: " + JSON.stringify(atribuicoes)
);

// TESTE (remover depois)
// alert(JSON.stringify(atribuicoes));




// ==========================
// CARREGAR TURMAS
// ==========================

// CARREGAR TURMAS

let turmas = [];


atribuicoes.forEach(item=>{

    if(item.turmaId && !turmas.includes(item.turmaId)){

        turmas.push(item.turmaId);

    }

});


turmas.forEach(turma=>{

    alert("TURMA ENCONTRADA: " + turma);

    selectTurma.innerHTML +=
    `
    <option value="${turma}">
        ${turma}
    </option>
    `;

});



// ==========================
// QUANDO ESCOLHER TURMA
// ==========================

selectTurma.addEventListener(
"change",
()=>{


const turmaSelecionada =
selectTurma.value;



selectDisciplina.innerHTML =
`
<option value="">
Selecione a disciplina
</option>
`;



atribuicoes.forEach(item=>{


    if(item.turmaNome === turmaSelecionada){


        selectDisciplina.innerHTML +=
        `
        <option value="${item.disciplina}">
            ${item.disciplina}
        </option>
        `;


    }


});


});




// ==========================
// ABRIR MINI-PAUTA
// ==========================

const botaoMiniPauta =
document.getElementById("abrirMiniPauta");



if(botaoMiniPauta){


botaoMiniPauta.addEventListener(
"click",
()=>{


const turma =
selectTurma.value;


const disciplina =
selectDisciplina.value;



if(!turma || !disciplina){

alert("Selecione a turma e a disciplina.");

return;

}



localStorage.setItem(
"turmaSelecionada",
turma
);



localStorage.setItem(
"disciplinaSelecionada",
disciplina
);



window.location.href =
"mini-pauta.html";



});


}
