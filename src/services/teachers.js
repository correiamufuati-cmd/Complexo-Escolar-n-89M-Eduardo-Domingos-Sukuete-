import { db } from "./firebase.js";

import {
collection,
getDocs,
addDoc,
deleteDoc,
doc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";



// CAMPOS

const nomeProfessor =
document.getElementById("nomeProfessor");


const emailProfessor =
document.getElementById("emailProfessor");


const nivelEnsino =
document.getElementById("nivelEnsino");


const listaDisciplinas =
document.getElementById("listaDisciplinas");


const listaTurmas =
document.getElementById("listaTurmas");


const guardarProfessor =
document.getElementById("guardarProfessor");


const tabelaProfessores =
document.getElementById("tabelaProfessores");





// ==========================
// GERAR CÓDIGO
// ==========================


function gerarCodigo(numero){


return "PROF-" +
String(numero).padStart(3,"0");


}



// ==========================
// GERAR SENHA
// ==========================


function gerarSenha(){


const caracteres =
"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


let senha="";


for(let i=0;i<6;i++){


senha += caracteres.charAt(
Math.floor(
Math.random()*caracteres.length
)
);


}


return senha;


}




// ==========================
// MUDAR NÍVEL
// ==========================


nivelEnsino.addEventListener(
"change",
()=>{


carregarDisciplinas();

carregarTurmas();


});






// ==========================
// CARREGAR DISCIPLINAS
// ==========================


async function carregarDisciplinas(){


listaDisciplinas.innerHTML =
"A carregar...";



const ref =
collection(
db,
"config"
);



const dados =
await getDocs(ref);



listaDisciplinas.innerHTML="";



dados.forEach(item=>{


if(item.id==="disciplinas"){


const config =
item.data();



const nivel =
config[nivelEnsino.value];



if(!nivel){

listaDisciplinas.innerHTML =
"Nenhuma disciplina encontrada";

return;

}



nivel.disciplinas?.forEach(d=>{


listaDisciplinas.innerHTML +=
`

<div class="checkBox">

<input 
type="checkbox"
class="disciplina"
value="${d}">

${d}

</div>


`;



});



}



});


}







// ==========================
// CARREGAR TURMAS
// ==========================


async function carregarTurmas(){


listaTurmas.innerHTML =
"A carregar...";



const dados =
await getDocs(
collection(db,"turmas")
);



listaTurmas.innerHTML="";



dados.forEach(item=>{


const turma =
item.data();



if(
turma.ensino === nivelEnsino.value
){



listaTurmas.innerHTML +=
`

<div class="checkBox">

<input 
type="checkbox"
class="turma"
value="${item.id}">

${turma.nome}

</div>


`;



}



});


}







// ==========================
// GUARDAR PROFESSOR
// ==========================


guardarProfessor.addEventListener(
"click",
async()=>{


const nome =
nomeProfessor.value.trim();



const email =
emailProfessor.value.trim();



const ensino =
nivelEnsino.value;



const disciplinas =
Array.from(
document.querySelectorAll(".disciplina:checked")
)
.map(
d=>d.value
);




const turmas =
Array.from(
document.querySelectorAll(".turma:checked")
)
.map(
t=>t.value
);





if(
!nome ||
!ensino ||
disciplinas.length===0 ||
turmas.length===0
){


alert(
"Preencha todos os campos"
);


return;

}





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
gerarCodigo(numero),



nome,

email,



ensino,



disciplinas,



turmas,



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









// ==========================
// LISTAR PROFESSORES
// ==========================


async function carregarProfessores(){



const dados =
await getDocs(
collection(db,"professores")
);



tabelaProfessores.innerHTML="";



dados.forEach(item=>{


const p =
item.data();



tabelaProfessores.innerHTML +=
`

<tr>

<td>
${p.codigoProfessor || ""}
</td>


<td>
${p.nome || ""}
</td>


<td>
${p.email || ""}
</td>


<td>
${p.ensino || ""}
</td>


<td>
${p.disciplinas?.join(", ") || ""}
</td>


<td>
${p.turmas?.length || 0}
turmas
</td>


<td>
${p.ativo ? "Ativo":"Inativo"}
</td>



<td>


<button onclick="verProfessor('${item.id}')">
👁️
</button>


<button onclick="apagarProfessor('${item.id}')">
🗑️
</button>


</td>


</tr>


`;



});



}






// ==========================
// VER
// ==========================


window.verProfessor =
async(id)=>{


const dados =
await getDocs(
collection(db,"professores")
);



dados.forEach(p=>{


if(p.id===id){


const professor =
p.data();



alert(

`
Código:
${professor.codigoProfessor}


Nome:
${professor.nome}


Senha:
${professor.senhaAcesso}


Disciplinas:
${professor.disciplinas.join(", ")}


Turmas:
${professor.turmas.length}

`

);



}


});


};








// ==========================
// APAGAR
// ==========================


window.apagarProfessor =
async(id)=>{


if(
confirm("Apagar professor?")
){


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






carregarProfessores();
