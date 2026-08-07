alert("PAINEL PROFESSOR TESTE Did");


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


const selectTrimestre =
document.getElementById("selectTrimestre");




// ==========================
// MOSTRAR NOME
// ==========================

nomeProfessor.innerHTML =
"👨‍🏫 " + professor.nome;





// ==========================
// ATRIBUIÇÕES
// ==========================

const atribuicoes =
professor.atribuicoes || [];


alert(
"Professor: " + professor.nome +
"\nTotal de atribuições: " +
atribuicoes.length +
"\nDados: " +
JSON.stringify(atribuicoes)
);





// ==========================
// CARREGAR TURMAS
// ==========================

selectTurma.innerHTML = `

<option value="">
Selecione a turma
</option>

`;


const turmas = [];


atribuicoes.forEach(item=>{


    if(
        item.turmaNome &&
        !turmas.includes(item.turmaNome)
    ){


        turmas.push(item.turmaNome);



        selectTurma.innerHTML += `

        <option value="${item.turmaNome}">
        ${item.turmaNome}
        </option>

        `;

    }


});





// ==========================
// CARREGAR DISCIPLINAS
// ==========================


selectTurma.addEventListener(
"change",
()=>{


const turmaSelecionada =
selectTurma.value;



selectDisciplina.innerHTML = `

<option value="">
Selecione a disciplina
</option>

`;



const disciplinas = [];



atribuicoes.forEach(item=>{


    if(
        item.turmaNome === turmaSelecionada &&
        !disciplinas.includes(item.disciplina)
    ){


        disciplinas.push(item.disciplina);



        selectDisciplina.innerHTML += `

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


const trimestre =
selectTrimestre.value;




if(!turmaNome || !disciplina){


alert(
"Selecione a turma e a disciplina."
);


return;


}




if(!trimestre){


alert(
"Selecione o trimestre."
);


return;


}




// encontrar atribuição correta


const atribuicao =
atribuicoes.find(
item =>

item.turmaNome === turmaNome &&

item.disciplina === disciplina

);




if(!atribuicao){


alert(
"Atribuição não encontrada."
);


return;


}





// guardar dados


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



localStorage.setItem(
"trimestre",
trimestre
);





window.location.href =
"mini-pauta.html";



});
