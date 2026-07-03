import {
  addTeacher,
  getTeachersBySchool,
  deleteTeacher,
  updateTeacher
} from "./teachers.service.js";

const user = window.currentUser;

// ➕ adicionar professor
document.getElementById("addBtn").addEventListener("click", async () => {

  const name = document.getElementById("name").value;
  const subjects = document.getElementById("subjects").value;

  await addTeacher({
    name,
    subjects,
    schoolId: user.schoolId
  });

  loadTeachers();
});

// 📋 listar
async function loadTeachers() {

  const teachers = await getTeachersBySchool(user.schoolId);

  const list = document.getElementById("teachersList");

  list.innerHTML = "";

  teachers.forEach(t => {

    list.innerHTML += `
      <div style="padding:10px; border:1px solid #ccc; margin:5px;">
        
        <b>${t.name}</b> - ${t.subjects}

        <br><br>

        <button onclick="editTeacher('${t.id}', '${t.name}', '${t.subjects}')">
          Editar
        </button>

        <button onclick="removeTeacher('${t.id}')">
          Eliminar
        </button>

      </div>
    `;
  });
}

// ❌ eliminar
window.removeTeacher = async (id) => {
  await deleteTeacher(id);
  loadTeachers();
};

// ✏️ editar
window.editTeacher = async (id, name, subjects) => {

  const newName = prompt("Novo nome:", name);
  const newSubjects = prompt("Novas disciplinas:", subjects);

  if (newName) {
    await updateTeacher(id, {
      name: newName,
      subjects: newSubjects
    });

    loadTeachers();
  }
};

// iniciar
loadTeachers();
