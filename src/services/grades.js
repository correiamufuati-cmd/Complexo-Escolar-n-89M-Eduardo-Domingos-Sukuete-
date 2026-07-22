import {
    addGrade,
    getGradesBySchool
} from "./grades.service.js";

import {
    getClassesBySchool
} from "./classes.service.js";

import {
    getStudentsBySchool
} from "./students.service.js";


const user = window.currentUser;


const classSelect = document.getElementById("classSelect");
const studentSelect = document.getElementById("studentSelect");
const subjectInput = document.getElementById("subject");
const gradeValue = document.getElementById("gradeValue");
const saveButton = document.getElementById("saveGrade");
const gradesList = document.getElementById("gradesList");


let students = [];


// 🚀 iniciar página

async function init(){

    await loadClasses();

    await loadGrades();

}


// 📚 carregar turmas

async function loadClasses(){

    const classes = await getClassesBySchool(user.schoolId);


    classSelect.innerHTML =
    `<option value="">Selecionar turma</option>`;


    classes.forEach(c=>{

        classSelect.innerHTML +=
        `
        <option value="${c.id}">
            ${c.name} - ${c.level}
        </option>
        `;

    });


}



// 👨‍🎓 quando escolher turma

classSelect.addEventListener(
"change",
async()=>{


    const classId = classSelect.value;


    studentSelect.innerHTML =
    `<option value="">Selecionar aluno</option>`;


    if(!classId) return;


    const allStudents =
    await getStudentsBySchool(user.schoolId);



    students =
    allStudents.filter(
        s=>s.classId === classId
    );



    students.forEach(s=>{


        studentSelect.innerHTML +=
        `
        <option value="${s.id}">
            ${s.name}
        </option>
        `;


    });


});




// 💾 guardar nota


saveButton.addEventListener(
"click",
async()=>{


    const studentId =
    studentSelect.value;


    const student =
    students.find(
        s=>s.id === studentId
    );


    const subject =
    subjectInput.value;


    const value =
    Number(gradeValue.value);



    if(!studentId || !subject || !value){

        alert("Preencha todos os campos");

        return;
    }



    await addGrade({

        studentId,

        studentName:
        student.name,

        classId:
        classSelect.value,

        subject,

        value,

        schoolId:
        user.schoolId

    });



    alert("Nota guardada com sucesso");


    gradeValue.value="";


    await loadGrades();



});




// 📋 listar notas


async function loadGrades(){


    const grades =
    await getGradesBySchool(
        user.schoolId
    );


    gradesList.innerHTML="";



    grades.forEach(g=>{


        gradesList.innerHTML +=
        `
        <div style="
        padding:10px;
        border:1px solid #ccc;
        margin:5px;
        ">

        <b>${g.studentName}</b>

        <br>

        Disciplina:
        ${g.subject}

        <br>

        Nota:
        ${g.value}

        </div>
        `;


    });


}



init();
