import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// ==========================
// DADOS RECEBIDOS
// ==========================

const turmaId = localStorage.getItem("turmaId");
const turmaNome = localStorage.getItem("turmaNome");
const disciplina = localStorage.getItem("disciplina");
const trimestre = localStorage.getItem("trimestre");



const info = document.getElementById("info");
const lista = document.getElementById("listaAlunos");



info.innerHTML = `
Turma: ${turmaNome}<br>
Disciplina: ${disciplina}<br>
Trimestre: ${trimestre}º
`;



// ==========================
// DESCOBRIR ENSINO
// ==========================

let ensino = "ensinoPrimario";


async function carregarEnsino(){


const turmaRef =
doc(db,"turmas",turmaId);


const turmaSnap =
await getDoc(turmaRef);



if(turmaSnap.exists()){

    ensino =
    turmaSnap.data().ensino || "ensinoPrimario";

}


}



// ==========================
// CLASSIFICAÇÃO
// ==========================


function classificarNota(nota){


nota = Number(nota);



if(ensino === "ensinoPrimario"){


    if(nota <=2)
        return "Mau";


    if(nota <=4)
        return "Medíocre";


    if(nota <=6)
        return "Suficiente";


    if(nota <=8)
        return "Bom";


    return "Muito Bom";



}else{


    if(nota <=4)
        return "Mau";


    if(nota <=9)
        return "Medíocre";


    if(nota <=13)
        return "Suficiente";


    if(nota <=16)
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



if(isNaN(mac) || isNaN(npt)){

mf.value="";
classificacao.innerHTML="";

return;

}



const media =
((mac+npt)/2).toFixed(1);



mf.value = media;



const resultado =
classificarNota(media);



classificacao.innerHTML =
resultado;



// limpar

mf.style.color="";
classificacao.style.color="";



// negativas

if(resultado==="Mau" || resultado==="Medíocre"){

    mf.style.color="red";
    classificacao.style.color="red";

}



if(mac < (ensino==="ensinoPrimario"?5:10)){

    macInput.style.color="red";

}else{

    macInput.style.color="";

}



if(npt < (ensino==="ensinoPrimario"?5:10)){

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
oninput="calcularMF(this)"
>

</td>



<td>

<input
class="npt"
type="number"
min="0"
max="${ensino==="ensinoPrimario"?10:20}"
oninput="calcularMF(this)"
>

</td>



<td>

<input
class="mf"
readonly
>

</td>



<td class="classificacao">

</td>



</tr>

`;


});


}



carregarAlunos();
