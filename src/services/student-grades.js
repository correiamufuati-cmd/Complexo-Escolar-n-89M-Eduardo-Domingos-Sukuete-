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



            if(alunoDoc.id === alunoLogado.id){


                encontrado = true;



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



let observacao = "";
let cor = "";

if(nota.MF >= 10){

    observacao = "Aprovado";
    cor = "green";

}
else{

    observacao = "Reprovado";
    cor = "red";

}



                    tabela.innerHTML += `

                    <tr>

                    <td>${notaDoc.id}</td>

                    <td>${nota.MAC ?? "-"}</td>

                    <td>${nota.NPT ?? "-"}</td>

                    <td>${nota.MF ?? "-"}</td>

                    <td style="color:${cor}; font-weight:bold;">
${situacao}
</td>


                    </tr>

                    `;



                });



            }



        }



    }



    if(!encontrado){

        alert("Aluno não encontrado no sistema");

    }



}catch(error){


    console.error(error);

    alert("Erro ao carregar notas");


}


}



carregarNotas();



window.voltar=function(){

    history.back();

};
