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

selectTurma.innerHTML = `
<option value="">
Selecione a turma
</option>
`;


atribuicoes.forEach(item=>{


    if(item.turmaNome){


        selectTurma.innerHTML +=
        `
        <option value="${item.turmaNome}">
        ${item.turmaNome}
        </option>
        `;


    }


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

document
.getElementById("abrirMiniPauta")
.addEventListener(
"click",
()=>{


const turmaNome =
selectTurma.value;


const disciplina =
selectDisciplina.value;



if(!turmaNome || !disciplina){

alert("Selecione a turma e a disciplina.");

return;

}


// encontrar turmaId

const atribuicao =
atribuicoes.find(
item => 
item.turmaNome === turmaNome &&
item.disciplina === disciplina
);



if(!atribuicao){

alert("Atribuição não encontrada.");

return;

}



localStorage.setItem(
"turmaId",
atribuicao.turmaId
);



localStorage.setItem(
"turmaNome",
turmaNome
);



localStorage.setItem(
"disciplina",
disciplina
);



window.location.href =
"mini-pauta.html";


});


}
