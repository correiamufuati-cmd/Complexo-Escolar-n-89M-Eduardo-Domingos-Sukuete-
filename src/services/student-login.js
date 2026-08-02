import { app } from "./firebase.js";

import {
    getFirestore,
    collection,
    getDocs,
    updateDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const db = getFirestore(app);


// Campos

const codigoAluno = document.getElementById("codigoAluno");

const senhaAluno = document.getElementById("senhaAluno");

const entrarAluno = document.getElementById("entrarAluno");



// Login

entrarAluno.addEventListener("click", async()=>{


    const codigo = codigoAluno.value
    .trim()
    .toUpperCase();


    const senha = senhaAluno.value
    .trim();



    if(!codigo || !senha){

        alert("Preencha o código e a senha");

        return;

    }



    try{


        const turmas = await getDocs(
            collection(db,"turmas")
        );



        for(const turma of turmas.docs){



            const alunos = await getDocs(

                collection(
                    db,
                    "turmas",
                    turma.id,
                    "alunos"
                )

            );



            for(const aluno of alunos.docs){



                const dados = aluno.data();



                if(

                    dados.codigoAluno
                    &&
                    dados.codigoAluno.toUpperCase()
                    === codigo

                    &&

                    dados.senhaAcesso
                    === senha

                ){



                    // Atualizar acesso

                    await updateDoc(

                        doc(
                            db,
                            "turmas",
                            turma.id,
                            "alunos",
                            aluno.id
                        ),

                        {

                            ultimoAcesso:
                            serverTimestamp(),

                            online:true

                        }

                    );





                    // Guardar sessão


                    localStorage.setItem(

                        "alunoLogado",

                        JSON.stringify({

                            id: aluno.id,

                            turmaId: turma.id,

                            ...dados

                        })

                    );





                    alert(
                        "Bem-vindo, " + dados.nome
                    );



                    window.location.href =
                    "student-area.html";



                    return;


                }



            }



        }



        alert(
            "Código ou senha inválidos"
        );



    }
    catch(erro){


        alert(
            "Erro no login: "
            +
            erro.message
        );


    }



});
