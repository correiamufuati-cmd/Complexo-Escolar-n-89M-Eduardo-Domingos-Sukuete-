import { db } from "./firebase.js";


import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";



// ==========================
// DADOS DA TURMA
// ==========================

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



// ==========================
// BUSCAR ALUNOS
// ==========================


async function carregarAlunos(){


try{


const alunosRef = collection(
db,
"turmas",
turmaId,
"alunos"
);



const dados =
await getDocs(alunosRef);



if(dados.empty){

lista.innerHTML =
`
<tr>
<td colspan="6">
Nenhum aluno encontrado.
</td>
</tr>
`;

return;

}




dados.forEach(doc=>{


const aluno = doc.data();



lista.innerHTML +=
`
<tr>

<td>
${aluno.numero || ""}
</td>


<td>
${aluno.nome || ""}
</td>


<td>
${aluno.sexo || ""}
</td>


<td>
<input type="number" class="mac">
</td>


<td>
<input type="number" class="npt">
</td>


<td>
<input type="number" class="mf" readonly>
</td>


</tr>
`;



});



}

catch(erro){

console.error(erro);

alert("Erro ao carregar alunos.");

}


}



carregarAlunos();
