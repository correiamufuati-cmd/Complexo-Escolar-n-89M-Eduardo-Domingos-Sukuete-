import { db } from "../config/firebase.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const form = document.getElementById("loginAluno");


if(form){

    form.addEventListener("submit", async (e)=>{

        e.preventDefault();


        const codigoAluno =
            document.getElementById("codigoAluno")
            .value
            .trim();


        const senha =
            document.getElementById("senhaAluno")
            .value
            .trim();



        if(!codigoAluno || !senha){

            alert("Preencha todos os campos.");
            return;

        }



        try{


            const alunosRef =
                collection(db,"alunos");



            const busca =
                query(
                    alunosRef,
                    where(
                        "codigoAluno",
                        "==",
                        codigoAluno
                    )
                );



            const resultado =
                await getDocs(busca);



            if(resultado.empty){

                alert(
                    "Aluno não encontrado."
                );

                return;

            }



            const documento =
                resultado.docs[0];



            const dadosAluno =
                documento.data();



            if(dadosAluno.senha !== senha){

                alert(
                    "Senha incorreta."
                );

                return;

            }



            const alunoLogado = {

                id: documento.id,

                nome:
                dadosAluno.nome,

                codigoAluno:
                dadosAluno.codigoAluno,

                turmaId:
                dadosAluno.turmaId,

                classe:
                dadosAluno.classe,

                ensino:
                dadosAluno.ensino,

                anoLetivo:
                dadosAluno.anoLetivo,

                sexo:
                dadosAluno.sexo,

                estado:
                dadosAluno.estado

            };



            localStorage.setItem(
                "alunoLogado",
                JSON.stringify(alunoLogado)
            );



            alert(
                "Login realizado com sucesso."
            );



            window.location.href =
                "student-area.html";



        }catch(error){


            console.error(
                "Erro no login:",
                error
            );


            alert(
                "Erro ao ligar ao sistema."
            );


        }


    });


                          }
