import {
addTeacher,
getTeachersBySchool,
deleteTeacher,
updateTeacher
} from "./teachers.service.js";


import { db } from "./firebase.js";


import {

collection,
getDocs

} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";



const user = window.currentUser;



const nameInput =
document.getElementById("name");


const emailInput =
document.getElementById("email");


const disciplinasSelect =
document.getElementById("disciplinas");


const turmasSelect =
document.getElementById("turmas");


const addBtn =
document.getElementById("addBtn");



const teachersList =
document.getElementById("teachersList");






// ===============================
// CARREGAR TURMAS
// ===============================


async function carregarTurmas(){


const dados =
await getDocs(
collection(db,"turmas")
);



turmasSelect.innerHTML="";



dados.forEach(doc=>{


const turma =
doc.data();



turmasSelect.innerHTML +=
`

<option value="${doc.id}">

${turma.nome}

</option>

`;



});


}







// ===============================
// CARREGAR DISCIPLINAS
// ===============================


async function carregarDisciplinas(){


const ref =
await getDocs(
collection(db,"config")
);



disciplinasSelect.innerHTML="";


// procura documento disciplinas

ref.forEach(doc=>{


if(doc.id==="disciplinas"){


const dados =
doc.data();



Object.values(dados).forEach(ensino=>{


Object.values(ensino).forEach(classe=>{


if(classe.disciplinas){


classe.disciplinas.forEach(d=>{


disciplinasSelect.innerHTML +=
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
// ADICIONAR PROFESSOR
// ===============================


addBtn.addEventListener(
"click",
async()=>{


const disciplinas =
Array.from(
disciplinasSelect.selectedOptions
)
.map(o=>o.value);



const turmas =
Array.from(
turmasSelect.selectedOptions
)
.map(o=>o.value);




await addTeacher({


name:
nameInput.value,


email:
emailInput.value,


disciplinas,


turmas,


ativo:true,


schoolId:
user.schoolId


});



alert("Professor criado");



loadTeachers();



});







// ===============================
// LISTAR
// ===============================


async function loadTeachers(){



const teachers =
await getTeachersBySchool(
user.schoolId
);



teachersList.innerHTML="";



teachers.forEach(t=>{


teachersList.innerHTML +=
`

<div style="
padding:10px;
border:1px solid #ccc;
margin:5px;
">


<b>${t.name}</b>


<br>

Email:
${t.email || ""}


<br>

Disciplinas:
${(t.disciplinas || []).join(", ")}


<br>

Turmas:
${(t.turmas || []).length}


<br><br>



<button onclick="removeTeacher('${t.id}')">

Eliminar

</button>


</div>

`;



});


}







window.removeTeacher =
async(id)=>{


await deleteTeacher(id);


loadTeachers();


};







carregarTurmas();

carregarDisciplinas();

loadTeachers();
