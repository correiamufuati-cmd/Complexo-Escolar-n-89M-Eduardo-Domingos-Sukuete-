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

// 📋 listar
async function loadClasses() {

  const classes = await getClassesBySchool(user.schoolId);

  const list = document.getElementById("classesList");

  list.innerHTML = "";

  classes.forEach(c => {

    list.innerHTML += `
      <div style="padding:10px; border:1px solid #ccc; margin:5px;">
        
        <b>${c.name}</b> - ${c.level}

        <br><br>

        <button onclick="editClass('${c.id}', '${c.name}', '${c.level}')">
          Editar
        </button>

        <button onclick="removeClass('${c.id}')">
          Eliminar
        </button>

      </div>
    `;
  });
}

// ❌ eliminar
window.removeClass = async (id) => {
  await deleteClass(id);
  loadClasses();
};

// ✏️ editar
window.editClass = async (id, name, level) => {

  const newName = prompt("Novo nome da turma:", name);
  const newLevel = prompt("Nova classe:", level);

  if (newName) {
    await updateClass(id, {
      name: newName,
      level: newLevel
    });

    loadClasses();
  }
};

// iniciar
loadClasses();
