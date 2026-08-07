import { db } from "./firebase.js";


import {

collection,
getDocs

} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";



// ==========================
// DADOS RECEBIDOS
// ==========================


const turmaId =
localStorage.getItem("turmaId");


const turmaNome =
localStorage.getItem("turmaNome");


const disciplina =
localStorage.getItem("disciplina");


const trimestre =
localStorage.getItem("trimestre");


const ensino =
localStorage.getItem("ensino");




// ==========================
// ELEMENTOS
// ==========================


const info =
document.getElementById("info");


const lista =
document.getElementById("listaAlunos");





// ==========================
// INFORMAÇÕES
// ==========================


info.innerHTML = `

Turma: ${turmaNome}

<br>

Disciplina: ${disciplina}

<br>

Trimestre: ${trimestre}º

`;






// ==========================
// CLASSIFICAÇÃO
// ==========================


function classificarNota(valor){


valor = Number(valor);



if(ensino === "ensinoPrimario"){


    if(valor <= 2)
        return "Mau";


    if(valor <= 4)
        return "Medíocre";


    if(valor <= 6)
        return "Suficiente";


    if(valor <= 8)
        return "Bom";


    return "Muito Bom";


}




if(ensino === "primeiroCiclo"){


    if(valor <= 4)
        return "Mau";


    if(valor <= 9)
        return "Medíocre";


    if(valor <= 13)
        return "Suficiente";


    if(valor <= 16)
        return "Bom";


    return "Muito Bom";


}



return "";

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
Number(macInput.value) || 0;


const npt =
Number(nptInput.value) || 0;




const media =
((mac+npt)/2).toFixed(1);



mf.value = media;



const resultado =
classificarNota(media);



classificacao.value =
resultado;





// limpar cores

macInput.style.color="";
nptInput.style.color="";
mf.style.color="";
classificacao.style.color="";





// negativas

if(resultado==="Mau" || resultado==="Medíocre"){


mf.style.color="red";

classificacao.style.color="red";


}
else{


mf.style.color="blue";

classificacao.style.color="blue";


}




// notas abaixo do mínimo

const limite =
ensino==="ensinoPrimario" ? 5 : 10;



if(mac < limite && macInput.value !== ""){

macInput.style.color="red";

}



if(npt < limite && nptInput.value !== ""){

nptInput.style.color="red";

}



};







// ==========================
// CARREGAR ALUNOS
// ==========================


async function carregarAlunos(){



try{


const alunosRef =
collection(
db,
"turmas",
turmaId,
"alunos"
);



const resultado =
await getDocs(alunosRef);




if(resultado.empty){


lista.innerHTML = `

<tr>

<td colspan="7">

Nenhum aluno encontrado

</td>

</tr>

`;


return;


}




const alunos=[];




resultado.forEach(doc=>{


alunos.push(doc.data());


});





// ordenar número

alunos.sort(
(a,b)=>
Number(a.numero)-Number(b.numero)
);






alunos.forEach(aluno=>{



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

type="number"

class="mac"

min="0"

max="20"

oninput="calcularMF(this)"

>

</td>




<td>

<input

type="number"

class="npt"

min="0"

max="20"

oninput="calcularMF(this)"

>

</td>




<td>

<input

type="text"

class="mf"

readonly

>

</td>




<td>

<input

type="text"

class="classificacao"

readonly

>

</td>



</tr>


`;



});




}

catch(e){


console.error(e);


alert(
"Erro ao carregar alunos"
);


}



}




carregarAlunos();
