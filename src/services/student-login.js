import { app } from "./firebase.js";

import {

getFirestore,
collection,
getDocs

} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const db = getFirestore(app);



const codigo = document.getElementById("codigoAluno");

const senha = document.getElementById("senhaAluno");

const entrar = document.getElementById("entrarAluno");



entrar.addEventListener("click", async()=>{


const codigoDigitado = codigo.value.trim();

const senhaDigitada = senha.value.trim();



if(!codigoDigitado || !senhaDigitada){

alert("Preencha os campos");

return;

}



const turmas = await getDocs(
collection(db,"turmas")
);



let encontrado = false;



for(const turma of turmas.docs){


const alunos = await getDocs(

collection(
db,
"turmas",
turma.id,
"alunos"
)

);



for(const aluno of alunos.docs){


const dados = aluno.data();



if(

dados.codigoAluno === codigoDigitado &&

dados.senhaAcesso === senhaDigitada

){


encontrado = true;



localStorage.setItem(
"aluno",
JSON.stringify(dados)
);



window.location.href =
"student-area.html";


return;


}


}


}



if(!encontrado){

alert("Código ou senha incorretos");

}


});
