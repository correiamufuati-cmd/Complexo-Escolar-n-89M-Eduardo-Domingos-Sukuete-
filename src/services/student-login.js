alert("LOGIN ALUNO JS CARREGADO ✅");


import { db } from "./firebase.js";


import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";



const form =
document.getElementById("loginAluno");



if(!form){

    alert("Formulário não encontrado");

    throw new Error(
        "loginAluno inexistente"
    );

}





form.addEventListener(
"submit",
async (e)=>{


e.preventDefault();



const codigoAluno =
document
.getElementById("codigoAluno")
.value
.trim();



const senha =
document
.getElementById("senhaAluno")
.value
.trim();





if(!codigoAluno || !senha){

    alert(
    "Preencha todos os campos."
    );

    return;

}





try{


alert(
"Procurando aluno..."
);




// Buscar todas as turmas

const turmasSnap =
await getDocs(
    collection(db,"turmas")
);





let alunoEncontrado = null;





// Procurar aluno dentro das turmas

for(const turma of turmasSnap.docs){



const alunosSnap =
await getDocs(

    collection(
        db,
        "turmas",
        turma.id,
        "alunos"
    )

);





for(const aluno of alunosSnap.docs){



const dados =
aluno.data();





if(
String(dados.codigoAluno).trim()
===
codigoAluno
){


alunoEncontrado = {


id: aluno.id,


turmaId:
turma.id,


turmaNome:
turma.data().nome || "",


...dados


};



break;


}



}




if(alunoEncontrado){

    break;

}


}






if(!alunoEncontrado){


    alert(
    "Aluno não encontrado."
    );


    return;


}







// verificar senha

if(

String(alunoEncontrado.senhaAcesso)
.trim()

!==

senha.trim()

){


    alert(
    "Senha incorreta."
    );


    return;


}






// guardar sessão

localStorage.setItem(

"alunoLogado",

JSON.stringify(alunoEncontrado)

);





alert(
"Login realizado com sucesso ✅"
);





// abrir área do aluno

window.location.href =

"../pages/student-area.html";





}

catch(error){


console.error(
"Erro:",
error
);


alert(
"Erro ao procurar aluno."
);



}



});
