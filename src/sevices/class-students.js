import { getStudentsBySchool } from "./students.service.js";
import { getClassesBySchool } from "./classes.service.js";

const user = window.currentUser;

const params = new URLSearchParams(window.location.search);
const classId = params.get("classId");

let classesMap = {};

async function init() {
  await loadClass();
  await loadStudents();
}

// 🏫 nome da turma
async function loadClass() {

  const classes = await getClassesBySchool(user.schoolId);

  classes.forEach(c => {
    classesMap[c.id] = c.name;
  });

  document.getElementById("title").innerText =
    "Turma: " + (classesMap[classId] || "Desconhecida");
}

// 👨‍🎓 alunos da turma
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
