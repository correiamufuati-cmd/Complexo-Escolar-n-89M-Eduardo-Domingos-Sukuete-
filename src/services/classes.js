import { app } from "./firebase.js";


import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const db = getFirestore(app);



// Elementos

const btnCriar =
document.getElementById("saveClass");


const listaTurmas =
document.getElementById("classList");


const nomeInput =
document.getElementById("className");


const classeInput =
document.getElementById("classe");


const ensinoInput =
document.getElementById("ensino");


const anoInput =
document.getElementById("anoLetivo");




// ID da escola (temporário)
// depois virá do login do gestor

const escolaId = "SIGEA";





// carregar turmas

async function carregarTurmas(){


try{


listaTurmas.innerHTML =
"A carregar...";



const dados =
await getDocs(
collection(db,"turmas")
);



listaTurmas.innerHTML="";



if(dados.empty){

listaTurmas.innerHTML =
"Nenhuma turma criada";

return;

}




dados.forEach((doc)=>{


const turma =
doc.data();



listaTurmas.innerHTML += `

<div class="turma-card">

<strong>
${turma.nome}
</strong>

<br>

Classe:
${turma.classe}

<br>

Ensino:
${turma.ensino}

<br>

Ano:
${turma.anoLetivo}

<br>

Disciplinas:
${turma.disciplinas?.length || 0}

</div>

`;



});



}catch(error){


listaTurmas.innerHTML =
"Erro: "+error.message;


}


}







// criar turma


btnCriar.addEventListener(
"click",
async()=>{


const nome =
nomeInput.value.trim();


const classe =
classeInput.value.trim();


const ensino =
ensinoInput.value;


const ano =
anoInput.value.trim();





if(
nome==="" ||
classe==="" ||
ano===""
){

alert(
"Preencha todos os campos"
);

return;

}




try{



const turma = {


nome:nome,

classe:classe,

ensino:ensino,

anoLetivo:ano,

escolaId:escolaId,

disciplinas:[],


criadoEm:
serverTimestamp()


};





await addDoc(
collection(db,"turmas"),
turma
);



alert(
"Turma criada com sucesso"
);



nomeInput.value="";

classeInput.value="";

anoInput.value="";



carregarTurmas();



}catch(error){


alert(
"Erro: "+error.message
);


}



});






carregarTurmas();
