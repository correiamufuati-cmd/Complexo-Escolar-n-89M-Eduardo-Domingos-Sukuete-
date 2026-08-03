import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const tabela =
document.getElementById("listaNotas");


const aluno =
JSON.parse(
localStorage.getItem("alunoLogado")
);



if(!aluno){

alert("Sessão não encontrada");

window.location.href="student-login.html";

}



async function carregarNotas(){


try{


const notasSnapshot =
await getDocs(
collection(
db,
"turmas",
aluno.turmaId,
"alunos",
aluno.id,
"notas"
)
);



if(notasSnapshot.empty){

alert("Nenhuma nota encontrada");

return;

}



notasSnapshot.forEach((doc)=>{


const nota = doc.data();



let situacao;
let cor;



if(Number(nota.MF) >= 10){

situacao = "Aprovado";

cor = "green";


}else{


situacao = "Reprovado";

cor = "red";


}



tabela.innerHTML += `

<tr>

<td>${doc.id}</td>

<td>${nota.MAC ?? "-"}</td>

<td>${nota.NPT ?? "-"}</td>

<td>${nota.MF ?? "-"}</td>

<td style="color:${cor};font-weight:bold">
${situacao}
</td>


</tr>

`;



});



}catch(error){


alert(
"Erro ao carregar notas: " + error.message
);


}



}



carregarNotas();
