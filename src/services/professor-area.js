alert("PROFESSOR-AREA.JS CARREGADO");

import { db } from "./firebase.js";

import {
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const professor =
JSON.parse(
localStorage.getItem("professorLogado")
);


if(!professor){

window.location.href="login-professor.html";

}


// CAMPOS

const nome =
document.getElementById("nomeProfessor");


const selectTurma =
document.getElementById("selectTurma");


const selectDisciplina =
document.getElementById("selectDisciplina");




// mostrar nome

nome.innerHTML =
professor.nome;



// carregar turmas

let atribuicoes =
professor.atribuicoes || [];



let turmas = [];



atribuicoes.forEach(a=>{


if(!turmas.includes(a.turmaNome)){

turmas.push(a.turmaNome);

}


});



turmas.forEach(t=>{


selectTurma.innerHTML +=

`
<option value="${t}">
${t}
</option>

`;

});




// quando muda turma

selectTurma.addEventListener(
"change",
()=>{


selectDisciplina.innerHTML="";



const turmaSelecionada =
selectTurma.value;



atribuicoes
.filter(a=>a.turmaNome===turmaSelecionada)
.forEach(a=>{


selectDisciplina.innerHTML +=

`
<option>
${a.disciplina}
</option>

`;

});


});


// carregar primeira turma automaticamente

selectTurma.dispatchEvent(
new Event("change")
);
