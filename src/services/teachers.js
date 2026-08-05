import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";



// ===============================
// CAMPOS
// ===============================


const nomeProfessor =
document.getElementById("nomeProfessor");


const emailProfessor =
document.getElementById("emailProfessor");


const turmasProfessor =
document.getElementById("turmasProfessor");


const disciplinasProfessor =
document.getElementById("disciplinasProfessor");


const guardarProfessor =
document.getElementById("guardarProfessor");


const listaProfessores =
document.getElementById("listaProfessores");



let turmas = [];





// ===============================
// GERAR CÓDIGO PROFESSOR
// ===============================


function gerarCodigoProfessor(numero){


return "PROF-" +
String(numero).padStart(3,"0");


}






// ===============================
// GERAR SENHA
// ===============================


function gerarSenha(){


const letras =
"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


let senha="";


for(let i=0;i<6;i++){


senha +=
letras.charAt(
Math.floor(
Math.random()*letras.length
)
);


}


return senha;


}






// ===============================
// CARREGAR TURMAS
// ===============================


async function carregarTurmas(){


const dados =
await getDocs(
collection(db,"turmas")
);



turmas=[];



turmasProfessor.innerHTML="";



dados.forEach(item=>{


const turma =
item.data();



turmas.push({

id:item.id,

...turma

});



turmasProfessor.innerHTML +=
`

<option value="${item.id}">

${turma.nome}

</option>

`;



});


}








// ===============================
// CARREGAR DISCIPLINAS
// ===============================


async function carregarDisciplinas(){


const config =
await getDocs(
collection(db,"config")
);



disciplinasProfessor.innerHTML="";



config.forEach(item=>{


if(item.id==="disciplinas"){


const dados =
item.data();



Object.values(dados)
.forEach(nivel=>{


Object.values(nivel)
.forEach(classe=>{


if(classe.disciplinas){


classe.disciplinas.forEach(d=>{


disciplinasProfessor.innerHTML +=
`

<option value="${d}">
${d}
</option>

`;



});


}



});


});


}


});


}








// ===============================
// GUARDAR PROFESSOR
// ===============================


guardarProfessor.addEventListener(
"click",
async()=>{


const nome =
nomeProfessor.value.trim();


const email =
emailProfessor.value.trim();



const turmasSelecionadas =
Array.from(
turmasProfessor.selectedOptions
)
.map(
op=>op.value
);



const disciplinasSelecionadas =
Array.from(
disciplinasProfessor.selectedOptions
)
.map(
op=>op.value
);




if(!nome || turmasSelecionadas.length===0){


alert(
"Preencha nome e selecione turmas"
);


return;


}




// descobrir ensino automaticamente


const primeiraTurma =
turmas.find(
t=>t.id===turmasSelecionadas[0]
);



const ensino =
primeiraTurma?.ensino || "";




// buscar quantidade de professores


const professores =
await getDocs(
collection(db,"professores")
);



const numero =
professores.size + 1;




await addDoc(

collection(db,"professores"),

{


codigoProfessor:
gerarCodigoProfessor(numero),



nome,

email,



ensino,



turmas:
turmasSelecionadas,



disciplinas:
disciplinasSelecionadas,



senhaAcesso:
gerarSenha(),



ativo:true,



criadoEm:
serverTimestamp()


}


);




alert(
"Professor cadastrado"
);



nomeProfessor.value="";

emailProfessor.value="";



carregarProfessores();



});









// ===============================
// LISTAR PROFESSORES
// ===============================


async function carregarProfessores(){


const dados =
await getDocs(
collection(db,"professores")
);



listaProfessores.innerHTML="";



dados.forEach(item=>{


const p =
item.data();



listaProfessores.innerHTML +=
`

<div style="
border:1px solid #ccc;
padding:10px;
margin:5px;
">


<b>
${p.codigoProfessor || ""}
</b>


<br>

Nome:
${p.nome}


<br>

Ensino:
${p.ensino || ""}


<br>

Turmas:
${p.turmas?.length || 0}


<br>

Disciplinas:
${p.disciplinas?.join(", ") || ""}


<br>

Senha:
${p.senhaAcesso || ""}


<br><br>


<button onclick="verProfessor('${item.id}')">

👁️ Ver

</button>


<button onclick="apagarProfessor('${item.id}')">

🗑️ Apagar

</button>


</div>

`;



});


}






// ===============================
// VER
// ===============================


window.verProfessor =
async(id)=>{


const ref =
doc(
db,
"professores",
id
);



alert(
JSON.stringify(
(await getDocs(collection(db,"professores")))
,null,2
)
);


};






// ===============================
// APAGAR
// ===============================


window.apagarProfessor =
async(id)=>{


if(confirm("Apagar professor?")){


await deleteDoc(
doc(
db,
"professores",
id
)
);



carregarProfessores();


}



};







carregarTurmas();

carregarDisciplinas();

carregarProfessores();
