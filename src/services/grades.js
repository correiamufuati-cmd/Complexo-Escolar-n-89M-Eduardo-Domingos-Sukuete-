alert("GRADES.JS CARREGOU Dg");

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const classSelect = document.getElementById("classSelect");
const subject = document.getElementById("subject");
const pautaBody = document.getElementById("pautaBody");

const saveGrades = document.getElementById("saveGrades");

const excelInput = document.getElementById("excelInput");
const importExcel = document.getElementById("importExcel");



let turmaSelecionada = "";

let alunos = [];




// ===============================
// CARREGAR TURMAS
// ===============================


async function carregarTurmas(){

    try{


        classSelect.innerHTML =
        `
        <option>
        A carregar turmas...
        </option>
        `;


        const dados =
        await getDocs(
            collection(db,"turmas")
        );



        classSelect.innerHTML =
        `
        <option value="">
        Selecionar turma
        </option>
        `;



        dados.forEach(doc=>{


            const turma =
            doc.data();



            classSelect.innerHTML +=
            `
            <option value="${doc.id}">
                ${turma.nome} - ${turma.classe}
            </option>
            `;


        });



    }
    catch(erro){


        alert(
            "Erro ao carregar turmas: "
            + erro.message
        );


    }


            }




// ===============================
// ESCOLHER TURMA
// ===============================


classSelect.addEventListener(
"change",
async()=>{


    turmaSelecionada =
    classSelect.value;



    await carregarAlunos();


    await carregarDisciplinas();



});







// ===============================
// CARREGAR DISCIPLINAS
// ===============================


async function carregarDisciplinas(){


    subject.innerHTML =
    `
    <option value="">
    Selecionar disciplina
    </option>
    `;


    if(!turmaSelecionada){

        return;

    }



    // Ler dados da turma escolhida

    const turmaRef =
    doc(
        db,
        "turmas",
        turmaSelecionada
    );


    const turmaSnap =
    await getDoc(turmaRef);



    if(!turmaSnap.exists()){

        alert("Turma não encontrada");

        return;

    }



    const turma =
    turmaSnap.data();



    const ensino =
    turma.ensino;


    const classe =
    turma.classe;



    // Ler configuração das disciplinas


    const configRef =
    doc(
        db,
        "config",
        "disciplinas"
    );


    const configSnap =
    await getDoc(configRef);



    if(!configSnap.exists()){

        alert("Configuração não encontrada");

        return;

    }



    const config =
    configSnap.data();



    const disciplinas =
    config[ensino][classe].disciplinas;



    disciplinas.forEach(nome=>{


        subject.innerHTML +=
        `
        <option value="${nome}">
            ${nome}
        </option>
        `;


    });



        }


// ===============================
// CARREGAR ALUNOS
// ===============================


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







// ===============================
// MOSTRAR PAUTA
// ===============================


function mostrarPauta(){


    pautaBody.innerHTML="";



    alunos.forEach(aluno=>{


        pautaBody.innerHTML +=
        `

<tr>

<td>
${aluno.numero}
</td>


<td>
${aluno.nome}
</td>


<td>

<input 
class="mac"
data-id="${aluno.id}"
type="number"
min="0"
max="20">

</td>



<td>

<input 
class="npt"
data-id="${aluno.id}"
type="number"
min="0"
max="20">

</td>



<td id="mf-${aluno.id}">
0
</td>


</tr>

`;



    });



    calcularMF();


}






// ===============================
// CALCULAR MF
// ===============================


function calcularMF(){


document
.querySelectorAll(".mac,.npt")
.forEach(input=>{


input.addEventListener(
"input",
()=>{


const id =
input.dataset.id;



const mac =
Number(
document.querySelector(
`.mac[data-id="${id}"]`
).value
)||0;



const npt =
Number(
document.querySelector(
`.npt[data-id="${id}"]`
).value
)||0;



document.getElementById(
"mf-"+id
).innerHTML =
Math.round(
(mac+npt)/2
);



});



});


}






// ===============================
// GUARDAR PAUTA
// ===============================


saveGrades.addEventListener(
"click",
async()=>{


if(!subject.value){

alert(
"Selecione a disciplina"
);

return;

}



for(const aluno of alunos){


const mac =
Number(
document.querySelector(
`.mac[data-id="${aluno.id}"]`
)?.value
)||0;



const npt =
Number(
document.querySelector(
`.npt[data-id="${aluno.id}"]`
)?.value
)
||0;



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
"Mini-pauta guardada"
);



});






// ===============================
// IMPORTAR EXCEL
// ===============================


importExcel.addEventListener(
"click",
async()=>{


const linhas =
excelInput.value
.trim()
.split("\n");



for(const linha of linhas){



const dados =
linha.split(";");



if(dados.length < 4){

continue;

}



const numero =
dados[0].trim();



const aluno =
alunos.find(
a=>String(a.numero)===numero
);



if(!aluno){

continue;

}



const mac =
Number(dados[2]);



const npt =
Number(dados[3]);



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
"Notas importadas com sucesso"
);



});






carregarTurmas();
