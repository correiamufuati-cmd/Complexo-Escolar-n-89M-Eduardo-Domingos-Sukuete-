import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


alert("student-login.js carregou");


const form = document.getElementById("loginAluno");


alert("Formulário encontrado: " + form);



if(form){


form.addEventListener("submit", async (e)=>{


    e.preventDefault();


    alert("Botão Entrar clicado");



    const codigoAluno =
    document.getElementById("codigoAluno").value.trim();



    const senha =
    document.getElementById("senha").value.trim();



    alert(
        "Código: " + codigoAluno +
        "\nSenha: " + senha
    );



    try{


        alert("A consultar Firebase...");



        const turmasSnapshot =
        await getDocs(collection(db,"turmas"));



        let encontrado = false;



        for(const turmaDoc of turmasSnapshot.docs){



            const alunosSnapshot =
            await getDocs(
                collection(
                    db,
                    "turmas",
                    turmaDoc.id,
                    "alunos"
                )
            );



            for(const alunoDoc of alunosSnapshot.docs){



                const aluno =
                alunoDoc.data();



                if(
                    aluno.codigoAluno === codigoAluno &&
                    aluno.senhaAcesso === senha
                ){



                    encontrado = true;



                    alert(
                        "Aluno encontrado: " + aluno.nome
                    );



                    localStorage.setItem(
                        "alunoLogado",
                        JSON.stringify({

                            id: alunoDoc.id,

                            nome: aluno.nome,

                            codigoAluno: aluno.codigoAluno,

                            turmaNome: aluno.turmaNome,

                            estado: aluno.estado || "ativo"

                        })
                    );



                    alert("Vai abrir a área do aluno");



                    window.location.href =
                    "../pages/student-area.html";



                    return;


                }



            }



        }



        if(!encontrado){


            alert("Código ou senha incorretos");


        }



    }catch(error){


        console.error(error);


        alert(
            "Erro no Firebase: " + error.message
        );


    }



});


        }
