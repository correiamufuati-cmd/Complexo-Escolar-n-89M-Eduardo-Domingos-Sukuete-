import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";



const form = document.getElementById("loginAluno");


alert("student-login.js carregado");



if(form){


form.addEventListener("submit", async (e)=>{


    e.preventDefault();


    alert("Botão entrou no processo");



    const codigoAluno =
    document.getElementById("codigoAluno").value.trim();



    const senha =
    document.getElementById("senhaAluno").value.trim();



    alert(
        "Código: " + codigoAluno +
        "\nSenha: " + senha
    );



    if(!codigoAluno || !senha){


        alert("Preencha todos os campos");

        return;

    }



    try{


        alert("A procurar turmas no Firebase");



        const turmasSnapshot =
        await getDocs(collection(db,"turmas"));



        let alunoEncontrado = null;



        for(const turmaDoc of turmasSnapshot.docs){



            alert(
                "Analisando turma: " + turmaDoc.id
            );



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



                alert(
                    "Aluno encontrado na lista: " + aluno.nome
                );



                if(

                    aluno.codigoAluno === codigoAluno &&

                    aluno.senhaAcesso === senha

                ){



                    alert(
                        "Login confirmado: " + aluno.nome
                    );



                    alunoEncontrado = {


                        id: alunoDoc.id,


                        nome: aluno.nome,


                        codigoAluno: aluno.codigoAluno,


                        turmaNome: aluno.turmaNome,


                        estado: aluno.estado || "ativo"


                    };



                    break;


                }


            }



            if(alunoEncontrado){

                break;

            }


        }



        if(!alunoEncontrado){


            alert(
                "Código ou senha incorretos"
            );


            return;


        }



        localStorage.setItem(

            "alunoLogado",

            JSON.stringify(alunoEncontrado)

        );



        alert(
    "Dados guardados. Abrindo área do aluno"
);


window.location.href =
"/Complexo-Escolar-n-89M-Eduardo-Domingos-Sukuete-/src/pages/student-area.html";";



    }catch(error){


        console.error(error);



        alert(
            "Erro: " + error.message
        );


    }



});


}else{


alert(
"Formulário loginAluno não encontrado"
);


                      }
