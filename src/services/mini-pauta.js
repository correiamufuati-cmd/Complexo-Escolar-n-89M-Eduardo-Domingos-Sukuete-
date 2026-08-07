import { db } from "./firebase.js";


import {

collection,
getDocs

} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";




const turmaId =
localStorage.getItem("turmaId");


const turmaNome =
localStorage.getItem("turmaNome");


const disciplina =
localStorage.getItem("disciplina");




const info =
document.getElementById("info");


const lista =
document.getElementById("listaAlunos");




info.innerHTML =

`
Turma: ${turmaNome}
<br>
Disciplina: ${disciplina}
`;





// =====================
// CALCULAR MF
// =====================


window.calcularMF = function(input){


const linha =
input.closest("tr");



const mac =
Number(
linha.querySelector(".mac").value
) || 0;



const npt =
Number(
linha.querySelector(".npt").value
) || 0;



const mf =
linha.querySelector(".mf");



mf.value =
((mac+npt)/2).toFixed(1);



};







// =====================
// CARREGAR ALUNOS
// =====================


async function carregarAlunos(){


try{


const alunosRef =
collection(
db,
"turmas",
turmaId,
"alunos"
);


const resultado =
await getDocs(alunosRef);


if(resultado.empty){

lista.innerHTML =

`
<tr>

<td colspan="6">

Nenhum aluno encontrado

</td>

</tr>
`;

return;

}


// Colocar os alunos num array

const alunos = [];

resultado.forEach(doc=>{

alunos.push(doc.data());

});


// Ordenar pelo número do aluno

alunos.sort((a,b)=>{

return Number(a.numero || 0) - Number(b.numero || 0);

});


// Mostrar na tabela

alunos.forEach(aluno=>{

lista.innerHTML +=

`

<tr>

<td>

${aluno.numero || ""}

</td>


<td style="text-align:left">

${aluno.nome || ""}

</td>


<td>

${aluno.sexo || ""}

</td>


<td>

<input
type="number"
class="mac"
min="0"
max="20"
oninput="calcularMF(this)"
>

</td>


<td>

<input
type="number"
class="npt"
min="0"
max="20"
oninput="calcularMF(this)"
>

</td>


<td>

<input
type="text"
class="mf"
readonly
>

</td>

</tr>

`;

});


}

catch(e){


console.error(e);

alert(
"Erro ao carregar alunos"
);


}


}




carregarAlunos();
