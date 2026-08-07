alert("LOGIN ALUNO JS df CARREGADO ✅");


import { db } from "../config/firebase.js";


import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";



console.log("PASSOU DO IMPORT FIREBASE");



const form =
document.getElementById("loginAluno");



console.log(
"FORMULÁRIO:",
form
);



if(!form){

alert(
"Erro: formulário de login não encontrado"
);

throw new Error(
"Elemento loginAluno inexistente"
);

}





form.addEventListener(
"submit",
async (e)=>{


console.log(
"BOTÃO ENTRAR FOI CLICADO"
);



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




console.log(
"Dados:",
codigoAluno,
senha
);





if(!codigoAluno || !senha){


alert(
"Preencha todos os campos."
);


return;


}




try{



alert(
"A procurar aluno..."
);




const alunosRef =
collection(
db,
"alunos"
);





const busca =
query(

alunosRef,

where(
"codigoAluno",
"==",
codigoAluno
)

);





const resultado =
await getDocs(busca);





console.log(
"Resultado:",
resultado.size
);





if(resultado.empty){


alert(
"Aluno não encontrado."
);


return;


}







const documento =
resultado.docs[0];



const dadosAluno =
documento.data();





console.log(
"DADOS ALUNO:",
dadosAluno
);





if(
dadosAluno.senha !== senha
){


alert(
"Senha incorreta."
);


return;


}






const alunoLogado = {


id:
documento.id,


nome:
dadosAluno.nome || "",



codigoAluno:
dadosAluno.codigoAluno || "",



turmaId:
dadosAluno.turmaId || "",



classe:
dadosAluno.classe || "",



ensino:
dadosAluno.ensino || "",



anoLetivo:
dadosAluno.anoLetivo || "",



sexo:
dadosAluno.sexo || "",



estado:
dadosAluno.estado || ""


};






localStorage.setItem(

"alunoLogado",

JSON.stringify(alunoLogado)

);





console.log(
"ALUNO GUARDADO:",
alunoLogado
);





alert(
"Login realizado com sucesso ✅"
);





window.location.href =
"student-area.html";




}



catch(error){



console.error(
"ERRO LOGIN:",
error
);



alert(
"Erro ao ligar ao sistema."
);



}



});
