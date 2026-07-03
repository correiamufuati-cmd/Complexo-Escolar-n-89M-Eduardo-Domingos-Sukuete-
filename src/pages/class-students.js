import { getStudentsBySchool } from "./students.service.js";
import { getClassesBySchool } from "./classes.service.js";

const user = window.currentUser;

// 📌 pegar classId da URL
const params = new URLSearchParams(window.location.search);
const classId = params.get("classId");

let className = "";

// 🚀 iniciar
async function init() {

  await loadClassName();
  await loadStudents();
}

// 🏫 buscar nome da turma
async function loadClassName() {

  const classes = await getClassesBySchool(user.schoolId);

  const cls = classes.find(c => c.id === classId);

  if (cls) {
    className = cls.name;
    document.getElementById("classTitle").innerText =
      "Turma: " + className;
  }
}

// 👨‍🎓 buscar alunos da turma
async function loadStudents() {

  const students = await getStudentsBySchool(user.schoolId);

  const filtered = students.filter(s => s.classId === classId);

  const list = document.getElementById("studentsList");

  list.innerHTML = "";

  if (filtered.length === 0) {
    list.innerHTML = "<p>Sem alunos nesta turma</p>";
    return;
  }

  filtered.forEach(s => {

    list.innerHTML += `
      <div style="padding:10px; border:1px solid #ccc; margin:5px;">
        <b>${s.name}</b> - ${s.age} anos
      </div>
    `;
  });
}

init();
