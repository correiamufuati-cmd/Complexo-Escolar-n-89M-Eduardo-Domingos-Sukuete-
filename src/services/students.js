import {
  addStudent,
  getStudentsBySchool,
  deleteStudent,
  updateStudent
} from "./students.service.js";

const user = window.currentUser;

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

  loadStudents();
});

// 📋 listar alunos
async function loadStudents() {

  const students = await getStudentsBySchool(user.schoolId);

  const list = document.getElementById("studentsList");

  list.innerHTML = "";

  students.forEach(s => {

    list.innerHTML += `
      <div style="padding:10px; border:1px solid #ccc; margin:5px;">
        
        <b>${s.name}</b> - ${s.age} anos - Turma ${s.classId}

        <br><br>

        <button onclick="editStudent('${s.id}', '${s.name}', ${s.age}, '${s.classId}')">
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
  loadStudents();
};

// ✏️ editar
window.editStudent = async (id, name, age, classId) => {

  const newName = prompt("Novo nome:", name);
  const newAge = prompt("Nova idade:", age);
  const newClass = prompt("Nova turma:", classId);

  if (newName) {
    await updateStudent(id, {
      name: newName,
      age: newAge,
      classId: newClass
    });

    loadStudents();
  }
};

// iniciar
loadStudents();
