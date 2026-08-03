alert("student-login carregado");

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const form = document.getElementById("loginAluno");


form.addEventListener("submit", async (e)=>{

    e.preventDefault();


    const codigoAluno =
    document.getElementById("codigoAluno").value.trim();


    const senha =
    document.getElementById("senha").value.trim();


    try{


        const turmas =
        await getDocs(collection(db,"turmas"));


        for(const turmaDoc of turmas.docs){


            const alunos =
            await getDocs(
                collection(
                    db,
                    "turmas",
                    turmaDoc.id,
                    "alunos"
                )
            );



            for(const alunoDoc of alunos.docs){


                const aluno =
                alunoDoc.data();



                if(
                    aluno.codigoAluno === codigoAluno &&
                    aluno.senhaAcesso === senha
                ){


                    localStorage.setItem(
                        "alunoLogado",
                        JSON.stringify({

                            id: alunoDoc.id,

                            nome: aluno.nome,

                            codigoAluno: aluno.codigoAluno,

                            turmaNome: aluno.turmaNome,

                            estado: aluno.estado

                        })
                    );



                    window.location.href =
                    "src/pages/student-area.html";


                    return;

                }

            }

        }


        alert("Código ou senha incorretos");


    }catch(error){


        console.log(error);

        alert("Erro no login");


    }


});
