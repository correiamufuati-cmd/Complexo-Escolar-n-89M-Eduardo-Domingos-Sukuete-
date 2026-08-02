import { app } from "./firebase.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const db = getFirestore(app);

const codigoAluno = document.getElementById("codigoAluno");
const senhaAluno = document.getElementById("senhaAluno");
const entrarAluno = document.getElementById("entrarAluno");

entrarAluno.addEventListener("click", async () => {

    const codigo = codigoAluno.value.trim().toUpperCase();
    const senha = senhaAluno.value.trim();

    if (!codigo || !senha) {
        alert("Preencha o código e a senha.");
        return;
    }

    try {

        const turmas = await getDocs(collection(db, "turmas"));

        for (const turma of turmas.docs) {

            const alunos = await getDocs(
                collection(db, "turmas", turma.id, "alunos")
            );

            for (const aluno of alunos.docs) {

                const dados = aluno.data();

                if (
                    dados.codigoAluno === codigo &&
                    dados.senhaAcesso === senha
                ) {

                    localStorage.setItem(
                        "alunoLogado",
                        JSON.stringify({
                            id: aluno.id,
                            turmaId: turma.id,
                            ...dados
                        })
                    );

                    alert("Bem-vindo " + dados.nome);

                    window.location.href = "student-area.html";

                    return;
                }
            }
        }

        alert("Código ou senha inválidos.");

    } catch (erro) {

        alert("Erro: " + erro.message);

    }

});
