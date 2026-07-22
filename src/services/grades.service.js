import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

import { app } from "./firebase.js";

const db = getFirestore(app);


// ➕ Guardar nota
export async function addGrade(grade) {

  return await addDoc(
    collection(db, "grades"),
    {
      ...grade,
      createdAt: new Date()
    }
  );

}


// 📋 Buscar notas de uma escola
export async function getGradesBySchool(schoolId) {

  const q = query(
    collection(db, "grades"),
    where("schoolId", "==", schoolId)
  );

  const snapshot = await getDocs(q);

  let grades = [];

  snapshot.forEach((docSnap) => {

    grades.push({
      id: docSnap.id,
      ...docSnap.data()
    });

  });

  return grades;

}


// 📚 Buscar notas de um aluno
export async function getGradesByStudent(studentId) {

  const q = query(
    collection(db, "grades"),
    where("studentId", "==", studentId)
  );


  const snapshot = await getDocs(q);

  let grades = [];


  snapshot.forEach((docSnap)=>{

    grades.push({
      id: docSnap.id,
      ...docSnap.data()
    });

  });


  return grades;

}


// ✏️ Atualizar nota
export async function updateGrade(id, data){

  return await updateDoc(
    doc(db,"grades",id),
    data
  );

}


// ❌ Apagar nota
export async function deleteGrade(id){

  return await deleteDoc(
    doc(db,"grades",id)
  );

    }
