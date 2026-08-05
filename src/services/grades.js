alert("GRADES.JS PROFESSOR CARREGOU");


import { db } from "./firebase.js";


import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";



// ===============================
// PROFESSOR LOGADO
// ===============================


const professor =
JSON.parse(
localStorage.getItem("professorLogado")
);



if(!professor){

    alert("Professor não encontrado");

    window.location.href="login.html";

}



// ===============================
// ELEMENTOS
// ===============================


const classSelect =
document.getElementById("classSelect");


const subject =
document.getElementById("subject");


const pautaBody =
document.getElementById("pautaBody");


const saveGrades =
document.getElementById("saveGrades");



let turmaSelecionada = "";

let alunos = [];





// ===============================
// INICIAR
// ===============================


async function iniciar(){


    await carregarTurmasProfessor();


}




// ===============================
// CARREGAR TURMAS DO PROFESSOR
// ===============================


async function carregarTurmasProfessor(){


    const professorRef =
    doc(
        db,
        "professores",
        professor.id
    );


    const professorSnap =
    await getDoc(professorRef);



    if(!professorSnap.exists()){

        alert("Professor não encontrado no sistema");

        return;

    }



    const dados =
    professorSnap.data();



    classSelect.innerHTML =
    `
    <option value="">
    Selecionar turma
    </option>
    `;



    for(const turmaId of dados.turmas){


        const turmaRef =
        doc(
            db,
            "turmas",
            turmaId
        );


        const turmaSnap =
        await getDoc(turmaRef);



        if(turmaSnap.exists()){


            const turma =
            turmaSnap.data();



            classSelect.innerHTML +=
            `
            <option value="${turmaId}">
            ${turma.nome}
            </option>
            `;


        }


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



    await carregarDisciplinasProfessor();


    await carregarAlunos();



});








// ===============================
// CARREGAR DISCIPLINAS DO PROFESSOR
// ===============================


async function carregarDisciplinasProfessor(){



    subject.innerHTML =
    `
    <option value="">
    Selecionar disciplina
    </option>
    `;



    const professorRef =
    doc(
        db,
        "professores",
        professor.id
    );



    const professorSnap =
    await getDoc(professorRef);



    const dados =
    professorSnap.data();



    dados.disciplinas.forEach(disciplina=>{


        subject.innerHTML +=
        `
        <option value="${disciplina}">
        ${disciplina}
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

<td>${aluno.numero}</td>

<td>${aluno.nome}</td>


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
// GUARDAR NOTAS
// ===============================


saveGrades.addEventListener(
"click",
async()=>{


if(!subject.value){

alert("Selecione a disciplina");

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

disciplina:subject.value,

MAC:mac,

NPT:npt,

MF:
Math.round(
(mac+npt)/2
),


professorId:
professor.id,


criadoEm:
serverTimestamp()


}

);



}



alert("Mini-pauta guardada");


});







iniciar();
