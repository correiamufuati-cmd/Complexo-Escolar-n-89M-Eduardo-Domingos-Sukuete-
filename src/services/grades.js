import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";



const classSelect = document.getElementById("classSelect");
const subject = document.getElementById("subject");
const pautaBody = document.getElementById("pautaBody");
const saveGrades = document.getElementById("saveGrades");

const excelInput = document.getElementById("excelInput");
const importExcel = document.getElementById("importExcel");

const gradesList = document.getElementById("gradesList");



let alunos = [];
let turmaSelecionada = "";




// ==========================
// CARREGAR TURMAS
// ==========================


async function carregarTurmas(){


    const turmas = await getDocs(
        collection(db,"turmas")
    );


    classSelect.innerHTML =
    `<option value="">Selecionar turma</option>`;


    turmas.forEach(turma=>{


        let dados = turma.data();


        classSelect.innerHTML += `

        <option value="${turma.id}">
            ${dados.nome || turma.id}
        </option>

        `;


    });


}




// ==========================
// QUANDO ESCOLHE TURMA
// ==========================


classSelect.addEventListener(
"change",
async()=>{


    turmaSelecionada =
    classSelect.value;


    await carregarAlunos();


});




// ==========================
// CARREGAR ALUNOS DA TURMA
// ==========================


async function carregarAlunos(){


    pautaBody.innerHTML =
    "A carregar alunos...";



    alunos=[];



    const dados =
    await getDocs(

        collection(
            db,
            "turmas",
            turmaSelecionada,
            "alunos"
        )

    );



    dados.forEach(doc=>{


        alunos.push({

            id:doc.id,

            ...doc.data()

        });


    });




    alunos.sort(
        (a,b)=>
        Number(a.numero)-Number(b.numero)
    );



    mostrarPauta();


}




// ==========================
// MOSTRAR MINI PAUTA
// ==========================


function mostrarPauta(){


    pautaBody.innerHTML="";



    alunos.forEach((aluno,index)=>{


        pautaBody.innerHTML += `

<tr>


<td>
${aluno.numero || index+1}
</td>


<td>
${aluno.nome}
</td>



<td>

<input 
type="number"
min="0"
max="20"
class="mac"
data-id="${aluno.id}"
>

</td>




<td>

<input 
type="number"
min="0"
max="20"
class="npt"
data-id="${aluno.id}"
>

</td>




<td class="mf"
id="mf-${aluno.id}">
0
</td>


</tr>

`;



    });



    ativarCalculo();

}





// ==========================
// CALCULAR MF
// ==========================


function ativarCalculo(){


const campos =
document.querySelectorAll(
".mac,.npt"
);



campos.forEach(campo=>{


campo.addEventListener(
"input",
()=>{


const id =
campo.dataset.id;



const mac =
Number(
document.querySelector(
`.mac[data-id="${id}"]`
).value
)
||0;



const npt =
Number(
document.querySelector(
`.npt[data-id="${id}"]`
).value
)
||0;



const mf =
Math.round(
(mac+npt)/2
);



document.getElementById(
"mf-"+id
).innerText =
mf;



});



});


}




// ==========================
// GUARDAR MINI PAUTA
// ==========================


saveGrades.addEventListener(
"click",
async()=>{


if(!subject.value){

alert("Digite a disciplina");

return;

}




const macs =
document.querySelectorAll(".mac");


for(const campo of macs){


const id =
campo.dataset.id;



const aluno =
alunos.find(
a=>a.id===id
);



const mac =
Number(campo.value)||0;



const npt =
Number(
document.querySelector(
`.npt[data-id="${id}"]`
).value
)||0;



const mf =
Math.round(
(mac+npt)/2
);



await addDoc(

collection(
db,
"turmas",
turmaSelecionada,
"alunos",
id,
"notas"
),

{


disciplina:
subject.value,


MAC:mac,


NPT:npt,


MF:mf,


criadoEm:
serverTimestamp()


}


);



}



alert(
"Mini-pauta guardada com sucesso"
);



});







// ==========================
// IMPORTAR DO EXCEL
// ==========================


importExcel.addEventListener(
"click",
async()=>{


const texto =
excelInput.value.trim();



if(!texto){

alert("Cole os dados do Excel");

return;

}



const linhas =
texto.split("\n");



for(const linha of linhas){



const dados =
linha.split(";");



if(dados.length < 4){

continue;

}




const numero =
dados[0].trim();



const mac =
Number(dados[2]);



const npt =
Number(dados[3]);




const aluno =
alunos.find(
a=>String(a.numero)===numero
);



if(!aluno){

continue;

}




await addDoc(

collection(
db,
"turmas",
turmaSelecionada,
"alunos",
aluno.id,
"notas"
),


{


disciplina:
subject.value,


MAC:mac,


NPT:npt,


MF:
Math.round(
(mac+npt)/2
),


criadoEm:
serverTimestamp()


}


);



}



alert(
"Notas importadas!"
);



});





carregarTurmas();
