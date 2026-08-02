import { app } from "./firebase.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";



const db = getFirestore(app);



// elementos da página

const btnCriar = document.getElementById("saveClass");

const listaTurmas = document.getElementById("classList");

const nomeInput = document.getElementById("className");

const classeInput = document.getElementById("classe");

const anoInput = document.getElementById("anoLetivo");





// carregar turmas existentes

async function carregarTurmas(){


    try{


        listaTurmas.innerHTML = "A carregar turmas...";



        const resultado = await getDocs(
            collection(db,"turmas")
        );



        listaTurmas.innerHTML = "";



        if(resultado.empty){


            listaTurmas.innerHTML =
            "Nenhuma turma criada";


            return;

        }




        resultado.forEach((doc)=>{


            const turma = doc.data();



            listaTurmas.innerHTML += `


            <div class="turma-card">


            <strong>
            ${turma.nome}
            </strong>


            <br>

            Classe:
            ${turma.classe}


            <br>

            Ano:
            ${turma.anoLetivo}


            </div>


            `;


        });



    }catch(error){


        listaTurmas.innerHTML =
        "Erro: " + error.message;


    }



}






// criar turma


btnCriar.addEventListener("click", async()=>{



    const nome = nomeInput.value.trim();

    const classe = classeInput.value.trim();

    const ano = anoInput.value.trim();




    if(nome === "" || classe === "" || ano === ""){


        alert("Preencha todos os campos");

        return;

    }




    try{



        await addDoc(
            collection(db,"turmas"),
            {

                nome:nome,

                classe:classe,

                anoLetivo:ano,

                criadoEm:serverTimestamp()

            }

        );




        alert("Turma criada com sucesso");



        nomeInput.value="";

        classeInput.value="";

        anoInput.value="";



        carregarTurmas();



    }catch(error){


        alert(
            "Erro ao criar turma: "
            + error.message
        );


    }




});






carregarTurmas();
