import { db } from "../config/firebase.js";

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



    let encontrado = false;



    try{


        const turmasSnapshot =
        await getDocs(collection(db,"turmas"));



        for(const turmaDoc of turmasSnapshot.docs){


            const alunosRef =
            collection(db,"turmas",turmaDoc.id,"alunos");



            const alunosSnapshot =
            await getDocs(alunosRef);



            for(const alunoDoc of alunosSnapshot.docs){


                const aluno =
                alunoDoc.data();



                if(
                    aluno.codigoAluno === codigoAluno &&
                    aluno.senha === senha
                ){


                    encontrado = true;



                    localStorage.setItem(
                        "alunoLogado",
                        JSON.stringify({

                            id: alunoDoc.id,

                            nome: aluno.nome,

                            codigoAluno: aluno.codigoAluno,

                            turmaNome: aluno.turma,

                            estado: aluno.estado || "ativo"

                        })
                    );



                    window.location.href =
                    "student-area.html";



                    return;

                }


            }


        }



        if(!encontrado){

            alert("Código ou senha incorretos");

        }



    }catch(error){

        console.error(error);

        alert("Erro ao fazer login");

    }


});
