import { db } from "../config/firebase.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const form = document.getElementById("loginAluno");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const codigo = document.getElementById("codigoAluno").value.trim();
  const senha = document.getElementById("senhaAluno").value.trim();

  try {
    const alunosRef = collection(db, "alunos");

    const q = query(
      alunosRef,
      where("codigoAluno", "==", codigo)
    );

    const resultado = await getDocs(q);

    if (resultado.empty) {
      alert("Código do aluno não encontrado.");
      return;
    }

    const doc = resultado.docs[0];
    const aluno = doc.data();

    if (aluno.senha !== senha) {
      alert("Senha incorreta.");
      return;
    }

    localStorage.setItem("alunoLogado", JSON.stringify({
      id: doc.id,
      ...aluno
    }));

    window.location.href = "student-area.html";

  } catch (erro) {
    console.error(erro);
    alert("Erro ao iniciar sessão.");
  }
});
