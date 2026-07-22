import {
  addClass,
  getClassesBySchool,
  deleteClass,
  updateClass
} from "./classes.service.js";

const user = window.currentUser;

// ➕ adicionar turma
document.getElementById("addBtn").addEventListener("click", async () => {

  const name = document.getElementById("name").value;
  const level = document.getElementById("level").value;

  await addClass({
    name,
    level,
    schoolId: user.schoolId
  });

  loadClasses();
});

// 📋 listar turmas
async function loadClasses() {

  const classes = await getClassesBySchool(user.schoolId);

  const list = document.getElementById("classesList");

  list.innerHTML = "";

  classes.forEach(c => {

    list.innerHTML += `
      <div style="padding:10px; border:1px solid #ccc; margin:5px;">
        
        <b>${c.name}</b> - ${c.level}

        <br><br>

        <button onclick="openClass('${c.id}')">
          Ver alunos
        </button>

        <button onclick="removeClass('${c.id}')">
          Eliminar
        </button>

      </div>
    `;
  });
}

// ❌ eliminar turma
window.removeClass = async (id) => {
  await deleteClass(id);
  loadClasses();
};

// 🔗 abrir alunos da turma
window.openClass = (id) => {
  window.location.href = `/src/pages/class-students.html?classId=${id}`;
};

loadClasses();
