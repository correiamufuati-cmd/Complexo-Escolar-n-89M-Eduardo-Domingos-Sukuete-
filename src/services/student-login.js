import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const form = document.getElementById("loginAluno");


if(form){


form.addEventListener("submit", async(e)=>{


e.preventDefault();


const codigoAluno =
document.getElementById("codigoAluno").value.trim();


const senha =
document.getElementById("senhaAluno").value.trim();



if(!codigoAluno || !senha){

alert("Preencha todos os campos");

return;

}



try{


const turmasSnapshot =
await getDocs(collection(db,"turmas"));



let alunoEncontrado = null;



for(const turmaDoc of turmasSnapshot.docs){



const alunosSnapshot =
await getDocs(
collection(
db,
"turmas",
turmaDoc.id,
"alunos"
)
);



for(const alunoDoc of alunosSnapshot.docs){



const aluno = alunoDoc.data();



if(
aluno.codigoAluno === codigoAluno &&
aluno.senhaAcesso === senha
){


alunoEncontrado = {


id: alunoDoc.id,

turmaId: turmaDoc.id,

nome: aluno.nome,

codigoAluno: aluno.codigoAluno,

turmaNome: aluno.turmaNome,

estado: aluno.estado || "ativo",

boletimUrl: aluno.boletimUrl || ""


};


break;


}



}



if(alunoEncontrado){

break;

}



}



if(!alunoEncontrado){


alert("Código ou senha incorretos");

return;


}



localStorage.setItem(
"alunoLogado",
JSON.stringify(alunoEncontrado)
);



window.location.href =
"student-area.html";



}catch(error){


alert(
"Erro no login: " + error.message
);


}



});


      }
