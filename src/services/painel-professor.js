import { db } from "./firebase.js";


// =======================
// VERIFICAR LOGIN
// =======================

const professor = JSON.parse(
    localStorage.getItem("professorLogado")
);


if(!professor){

    window.location.href = "login-professor.html";

    throw new Error("Professor não autenticado");

}


// =======================
// ELEMENTOS
// =======================

const nomeProfessor =
document.getElementById("nomeProfessor");


const selectTurma =
document.getElementById("selectTurma");


const selectDisciplina =
document.getElementById("selectDisciplina");



// =======================
// MOSTRAR NOME
// =======================

nomeProfessor.textContent =
"👨‍🏫 " + professor.nome;



// =======================
// CARREGAR TURMAS
// =======================


const atribuicoes =
professor.atribuicoes || [];



let turmas = [];



atribuicoes.forEach(item=>{


    if(!turmas.includes(item.turma)){

        turmas.push(item.turma);

    }


});



turmas.forEach(turma=>{


selectTurma.innerHTML +=
`
<option value="${turma}">
${turma}
</option>
`;


});



// =======================
// MUDAR TURMA
// =======================

selectTurma.addEventListener(
"change",
()=>{


const turmaSelecionada =
selectTurma.value;



selectDisciplina.innerHTML =
`
<option>
Selecione a disciplina
</option>
`;



atribuicoes
.filter(item=>item.turma === turmaSelecionada)
.forEach(item=>{


selectDisciplina.innerHTML +=
`
<option value="${item.disciplina}">
${item.disciplina}
</option>
`;


});


});




// =======================
// MINI-PAUTA
// =======================


document
.getElementById("abrirMiniPauta")
.addEventListener(
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
