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

// ➕ criar professor
export async function addTeacher(teacher) {
  return await addDoc(collection(db, "teachers"), teacher);
}

// 📋 listar por escola
export async function getTeachersBySchool(schoolId) {
  const q = query(
    collection(db, "teachers"),
    where("schoolId", "==", schoolId)
  );

  const snapshot = await getDocs(q);

  let teachers = [];

  snapshot.forEach(docSnap => {
    teachers.push({ id: docSnap.id, ...docSnap.data() });
  });

  return teachers;
}

// ❌ eliminar
export async function deleteTeacher(id) {
  return await deleteDoc(doc(db, "teachers", id));
}

// ✏️ editar
export async function updateTeacher(id, data) {
  return await updateDoc(doc(db, "teachers", id), data);
}
