alert("MINI-PAUTA.JS CARREGADO Df ✅");


import { db } from "./firebase.js";


import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";



// ==========================
// DADOS
// ==========================

const turmaId =
localStorage.getItem("turmaId");


const turmaNome =
localStorage.getItem("turmaNome");


const disciplina =
localStorage.getItem("disciplina");


const trimestre =
localStorage.getItem("trimestre");



const info =
document.getElementById("info");


const lista =
document.getElementById("listaAlunos");



let ensino = "ensinoPrimario";


let notasGuardadas = {};




// ==========================
// INFORMAÇÃO
// ==========================

info.innerHTML = `

Turma: ${turmaNome}
<br>

Disciplina: ${disciplina}

<br>

Trimestre: ${trimestre}º

`;




// ==========================
// DESCOBRIR ENSINO
// ==========================


async function carregarEnsino(){


const turmaRef =
doc(db,"turmas",turmaId);



const turmaSnap =
await getDoc(turmaRef);



if(turmaSnap.exists()){


ensino =
turmaSnap.data().ensino ||
"ensinoPrimario";


}



}





// ==========================
// CARREGAR NOTAS EXISTENTES
// ==========================


async function carregarNotas(){


const idLancamento =
`${turmaId}_${disciplina}_${trimestre}`;



const notaRef =
doc(
db,
"notas",
idLancamento
);



const notaSnap =
await getDoc(notaRef);



if(notaSnap.exists()){


const dados =
notaSnap.data();



dados.alunos.forEach(aluno=>{


notasGuardadas[aluno.numero] = aluno;


});


}



}




// ==========================
// CLASSIFICAÇÃO
// ==========================


function classificarNota(nota){


nota = Number(nota);



if(ensino==="ensinoPrimario"){



if(nota<=2)
return "Mau";


if(nota<=4)
return "Medíocre";


if(nota<=6)
return "Suficiente";


if(nota<=8)
return "Bom";


return "Muito Bom";



}else{



if(nota<=4)
return "Mau";


if(nota<=9)
return "Medíocre";


if(nota<=13)
return "Suficiente";


if(nota<=16)
return "Bom";


return "Muito Bom";



}



}




// ==========================
// CALCULAR MF
// ==========================


window.calcularMF = function(input){



const linha =
input.closest("tr");



const macInput =
linha.querySelector(".mac");



const nptInput =
linha.querySelector(".npt");



const mf =
linha.querySelector(".mf");



const classificacao =
linha.querySelector(".classificacao");




const mac =
Number(macInput.value);



const npt =
Number(nptInput.value);




if(
macInput.value==="" ||
nptInput.value===""

){


mf.value="";

classificacao.innerHTML="";

return;


}





const media =
((mac+npt)/2)
.toFixed(1);



mf.value =
media;




const resultado =
classificarNota(media);



classificacao.innerHTML =
resultado;



mf.style.color="";
classificacao.style.color="";



const limite =
ensino==="ensinoPrimario"
?5
:10;



if(Number(media)<limite){


mf.style.color="red";

classificacao.style.color="red";


}



if(mac<limite){

macInput.style.color="red";

}else{

macInput.style.color="";

}




if(npt<limite){

nptInput.style.color="red";

}else{

nptInput.style.color="";

}



};






// ==========================
// CARREGAR ALUNOS
// ==========================


async function carregarAlunos(){



await carregarEnsino();


await carregarNotas();




const alunosRef =
collection(
db,
"turmas",
turmaId,
"alunos"
);



const resultado =
await getDocs(alunosRef);



const alunos=[];



resultado.forEach(doc=>{


alunos.push({

id:doc.id,

...doc.data()

});


});




// ordenar número


alunos.sort((a,b)=>{


return Number(a.numero)-Number(b.numero);


});



lista.innerHTML="";



alunos.forEach(aluno=>{


const nota =
notasGuardadas[aluno.numero] || {};



lista.innerHTML += `


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

class="mac"

type="number"

min="0"

max="${ensino==="ensinoPrimario"?10:20}"

value="${nota.MAC || ""}"

oninput="calcularMF(this)"

>


</td>




<td>


<input

class="npt"

type="number"

min="0"

max="${ensino==="ensinoPrimario"?10:20}"

value="${nota.NPT || ""}"

oninput="calcularMF(this)"

>


</td>




<td>


<input

class="mf"

readonly

value="${nota.MF || ""}"

>


</td>




<td class="classificacao">


${nota.classificacao || ""}


</td>



</tr>



`;



});



}




// ==========================
// GUARDAR NOTAS
// ==========================


document
.getElementById("guardarNotas")
.addEventListener(
"click",
async ()=>{


try{


const professor =
JSON.parse(
localStorage.getItem("professorLogado")
);



const alunos=[];



document
.querySelectorAll("#listaAlunos tr")
.forEach(linha=>{



alunos.push({


nome:
linha.children[1].innerText,


numero:
linha.children[0].innerText,


MAC:
Number(
linha.querySelector(".mac").value
),


NPT:
Number(
linha.querySelector(".npt").value
),


MF:
Number(
linha.querySelector(".mf").value
),


classificacao:
linha.querySelector(".classificacao").innerText



});



});




const idLancamento =
`${turmaId}_${disciplina}_${trimestre}`;



await setDoc(

doc(
db,
"notas",
idLancamento
),

{


turmaId,

turmaNome,

disciplina,

trimestre,


professorId:
professor?.id || "",



criadoEm:
serverTimestamp(),


alunos


}



);



alert(
"Notas guardadas com sucesso ✅"
);



}


catch(e){


console.error(e);


alert(
"Erro ao guardar notas"
);



}



});





carregarAlunos();
