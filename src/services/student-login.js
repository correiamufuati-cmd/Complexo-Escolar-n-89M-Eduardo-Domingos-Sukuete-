import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const form = document.getElementById("loginAluno");

if (form) {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const codigoAluno = document
            .getElementById("codigoAluno")
            .value
            .trim();

        const senha = document
            .getElementById("senha")
            .value
            .trim();

        try {

            const turmasSnapshot = await getDocs(
                collection(db, "turmas")
            );

            let alunoEncontrado = null;

            for (const turmaDoc of turmasSnapshot.docs) {

                const alunosSnapshot = await getDocs(
                    collection(db, "turmas", turmaDoc.id, "alunos")
                );

                for (const alunoDoc of alunosSnapshot.docs) {

                    const aluno = alunoDoc.data();

                    if (
                        aluno.codigoAluno === codigoAluno &&
                        aluno.senha === senha
                    ) {

                        alunoEncontrado = {
                            id: alunoDoc.id,
                            nome: aluno.nome,
                            codigoAluno: aluno.codigoAluno,
                            turmaNome: aluno.turma || turmaDoc.id,
                            estado: aluno.estado || "ativo"
                        };

                        break;
                    }
                }

                if (alunoEncontrado) break;
            }

            if (!alunoEncontrado) {
                alert("Código ou senha incorretos.");
                return;
            }

            localStorage.setItem(
                "alunoLogado",
                JSON.stringify(alunoEncontrado)
            );

            window.location.href = "student-area.html";

        } catch (erro) {

            console.error(erro);

            alert("Erro ao fazer login.");

        }

    });

        }
