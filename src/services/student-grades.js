import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const tabela = document.getElementById("listaNotas");


const alunoLogado = JSON.parse(
    localStorage.getItem("alunoLogado")
);



if(!alunoLogado){

    alert("Aluno não encontrado");

    window.location.href="../login-aluno.html";

}



async function carregarNotas(){


try{


    const turmasSnapshot =
    await getDocs(collection(db,"turmas"));



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


            if(alunoDoc.id === alunoLogado.id){



                const notasSnapshot =
                await getDocs(
                    collection(
                        db,
                        "turmas",
                        turmaDoc.id,
                        "alunos",
                        alunoDoc.id,
                        "notas"
                    )
                );



                notasSnapshot.forEach((notaDoc)=>{


                    const nota = notaDoc.data();



                    let MF =
                    Number(nota.MF);



                    let situacao = "";
                    let cor = "";



                    if(MF >= 10){

                        situacao = "Aprovado";
                        cor = "green";

                    }
                    else{

                        situacao = "Reprovado";
                        cor = "red";

                    }



                    tabela.innerHTML += `

                    <tr>

                    <td>${notaDoc.id}</td>

                    <td>${nota.MAC ?? "-"}</td>

                    <td>${nota.NPT ?? "-"}</td>

                    <td>${nota.MF ?? "-"}</td>

                    <td style="color:${cor};font-weight:bold">
                    ${situacao}
                    </td>

                    </tr>

                    `;


                });



                return;


            }


        }


    }


catch(error){

    console.error(error);


    if(error.message.includes("permission")){

        alert(
        "Erro: Sem permissão para acessar as notas. Verifique as regras do Firebase."
        );

    }

    else if(error.message.includes("notas")){

        alert(
        "Erro: A coleção de notas não foi encontrada. Verifique se o aluno possui a pasta notas."
        );

    }

    else if(error.message.includes("turmas")){

        alert(
        "Erro: Não foi possível encontrar as turmas no Firebase."
        );

    }

    else{

        alert(
        "Erro ao carregar notas.\nMotivo: " + error.message
        );

    }


}
