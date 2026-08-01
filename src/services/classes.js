import { app } from "../config/firebase.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";



const db = getFirestore(app);



// ELEMENTOS DA PÁGINA

const saveButton = document.getElementById("saveClass");

const classList = document.getElementById("classList");

const nomeInput = document.getElementById("className");

const classeInput = document.getElementById("classe");

const anoInput = document.getElementById("anoLetivo");




// ==============================
// GUARDAR TURMA
// ==============================


saveButton.addEventListener("click", async()=>{


    const turma = {

        nome: nomeInput.value.trim(),

        classe: classeInput.value.trim(),

        anoLetivo: anoInput.value.trim(),

        criadoEm: serverTimestamp()

    };



    if(!turma.nome || !turma.classe || !turma.anoLetivo){

        alert("Preencha todos os campos");

        return;

    }



    try{


        await addDoc(

            collection(db,"turmas"),

            turma

        );



        alert("Turma criada com sucesso");


        limparCampos();


        carregarTurmas();



    }catch(error){


        alert(
            "Erro ao guardar turma: "
            + error.message
        );


    }



});





// ==============================
// LISTAR TURMAS
// ==============================


async function carregarTurmas(){


    classList.innerHTML = "A carregar...";



    try{


        const resultado = await getDocs(

            collection(db,"turmas")

        );



        classList.innerHTML = "";



        if(resultado.empty){


            classList.innerHTML =
            "<p>Nenhuma turma encontrada</p>";


            return;

        }





        resultado.forEach((item)=>{



            const turma = item.data();



            classList.innerHTML += `


            <div class="turma-card">


                <h3>
                ${turma.nome}
                </h3>


                <p>
                Classe: ${turma.classe}
                </p>


                <p>
                Ano: ${turma.anoLetivo}
                </p>



                <button 
                onclick="removerTurma('${item.id}')">

                Apagar

                </button>


            </div>



            `;



        });



    }catch(error){


        classList.innerHTML =
        "Erro: "+error.message;


    }



}





// ==============================
// APAGAR TURMA
// ==============================


window.removerTurma = async(id)=>{


    const confirmar = confirm(
        "Deseja apagar esta turma?"
    );


    if(!confirmar){

        return;

    }



    await deleteDoc(

        doc(db,"turmas",id)

    );



    carregarTurmas();


};






function limparCampos(){


    nomeInput.value="";

    classeInput.value="";

    anoInput.value="";


}





// iniciar

carregarTurmas();
