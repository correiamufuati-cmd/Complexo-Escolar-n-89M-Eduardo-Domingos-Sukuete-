import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

import { app } from "./firebase.js";

const db = getFirestore(app);

// ➕ criar aluno
export async function addStudent(student) {
  return await addDoc(collection(db, "students"), student);
}

// 📋 listar alunos por escola
export async function getStudentsBySchool(schoolId) {
  const q = query(
    collection(db, "students"),
    where("schoolId", "==", schoolId)
  );

  const snapshot = await getDocs(q);

  let students = [];

  snapshot.forEach(docSnap => {
    students.push({ id: docSnap.id, ...docSnap.data() });
  });

  return students;
}

// ❌ eliminar aluno
export async function deleteStudent(id) {
  return await deleteDoc(doc(db, "students", id));
}

// ✏️ editar aluno
export async function updateStudent(id, data) {
  return await updateDoc(doc(db, "students", id), data);
}
