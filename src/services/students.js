import { addStudent, getStudentsBySchool } from "./students.service.js";

// 👉 pegar utilizador atual (vem do authGuard)
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

  alert("Aluno adicionado!");

  loadStudents();
});

// 📋 carregar alunos
async function loadStudents() {

  const students = await getStudentsBySchool(user.schoolId);

  const list = document.getElementById("studentsList");

  list.innerHTML = "";

  students.forEach(s => {
    list.innerHTML += `
      <div style="padding:10px; border:1px solid #ccc; margin:5px;">
        <b>${s.name}</b> - ${s.age} anos - Turma ${s.classId}
      </div>
    `;
  });
}

// 🚀 iniciar
loadStudents();
