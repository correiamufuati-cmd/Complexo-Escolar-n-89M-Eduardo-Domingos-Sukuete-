import {
  addStudent,
  getStudentsBySchool,
  deleteStudent,
  updateStudent
} from "./students.service.js";

import { getClassesBySchool } from "./classes.service.js";

const user = window.currentUser;

let classesMap = {};

// 🚀 inicialização
async function init() {
  await loadClasses();
  await loadStudents();
}

// 📚 carregar turmas
async function loadClasses() {
  const classes = await getClassesBySchool(user.schoolId);

  classesMap = {};

  classes.forEach(c => {
    classesMap[c.id] = c.name;
  });
}

// ➕ adicionar aluno
document.getElementById("addBtn").addEventListener("click", async () => {

  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const classId = document.getElementById("classId").value;

  await addStudent({
    name,
    age,
    classId,
    schoolId: user.schoolId
  });

  await loadStudents();
});

// 📋 listar alunos
async function loadStudents() {

  const students = await getStudentsBySchool(user.schoolId);

  const list = document.getElementById("studentsList");

  list.innerHTML = "";

  students.forEach(s => {

    const className = classesMap[s.classId] || "Sem turma";

    list.innerHTML += `
      <div style="padding:10px; border:1px solid #ccc; margin:5px;">
        
        <b>${s.name}</b> - ${s.age} anos  
        <br>
        Turma: ${className}

        <br><br>

        <button onclick="editStudent('${s.id}', '${s.name}', '${s.age}', '${s.classId}')">
          Editar
        </button>

        <button onclick="removeStudent('${s.id}')">
          Eliminar
        </button>

      </div>
    `;
  });
}

// ❌ eliminar
window.removeStudent = async (id) => {
  await deleteStudent(id);
  await loadStudents();
};

// ✏️ editar
window.editStudent = async (id, name, age, classId) => {

  const newName = prompt("Nome:", name);
  const newAge = prompt("Idade:", age);
  const newClass = prompt("ID da turma:", classId);

  if (newName) {
    await updateStudent(id, {
      name: newName,
      age: newAge,
      classId: newClass
    });

    await loadStudents();
  }
};

init();
