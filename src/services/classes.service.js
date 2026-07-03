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

// ➕ criar turma
export async function addClass(cls) {
  return await addDoc(collection(db, "classes"), cls);
}

// 📋 listar turmas por escola
export async function getClassesBySchool(schoolId) {
  const q = query(
    collection(db, "classes"),
    where("schoolId", "==", schoolId)
  );

  const snapshot = await getDocs(q);

  let classes = [];

  snapshot.forEach(docSnap => {
    classes.push({ id: docSnap.id, ...docSnap.data() });
  });

  return classes;
}

// ❌ eliminar
export async function deleteClass(id) {
  return await deleteDoc(doc(db, "classes", id));
}

// ✏️ editar
export async function updateClass(id, data) {
  return await updateDoc(doc(db, "classes", id), data);
}
