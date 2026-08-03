import { app } from "./firebase.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const db = getFirestore(app);


// ELEMENTOS

const btnCriar = document.getElementById("saveClass");

const listaTurmas = document.getElementById("classList");

const nomeInput = document.getElementById("className");

const classeInput = document.getElementById("classe");

const ensinoInput = document.getElementById("ensino");

const anoInput = document.getElementById("anoLetivo");



// ID DA ESCOLA
// temporário para teste
// depois vem do login do gestor

const escolaId = "SIGEA";




// ===============================
// BUSCAR DISCIPLINAS AUTOMÁTICAS
// ===============================

async function buscarDisciplinas(ensino, classe){

    try{

        const ref = doc(
            db,
            "config"
        );


        const dados = await getDoc(ref);


        if(!dados.exists()){

            console.log("Config não encontrada");
            return [];

        }


        const config = dados.data();



        if(
            config.disciplinas &&
            config.disciplinas[ensino] &&
            config.disciplinas[ensino][classe]
        ){

            return config.disciplinas[ensino][classe].disciplinas || [];

        }


        console.log(
            "Classe não encontrada na configuração"
        );


        return [];


    }catch(error){

        console.log(error);

        return [];

    }

}





// ===============================
// CARREGAR TURMAS
// ===============================

async function carregarTurmas(){


    try{


        listaTurmas.innerHTML =
        "A carregar turmas...";



        const resultado =
        await getDocs(
            collection(db,"turmas")
        );



        listaTurmas.innerHTML="";



        if(resultado.empty){


            listaTurmas.innerHTML =
            "Nenhuma turma criada";


            return;

        }





        resultado.forEach((documento)=>{


            const turma =
            documento.data();



            listaTurmas.innerHTML += `


            <div class="turma-card">


            <strong>
            ${turma.nome}
            </strong>


            <br>

            Classe:
            ${turma.classe}


            <br>

            Ensino:
            ${turma.ensino}


            <br>

            Ano:
            ${turma.anoLetivo}


            <br>

            Disciplinas:
            ${
            turma.disciplinas
            ?
            turma.disciplinas.length
            :
            0
            }


            </div>


            `;


        });



    }catch(error){


        listaTurmas.innerHTML =
        "Erro: " + error.message;


    }


}







// ===============================
// CRIAR TURMA
// ===============================


btnCriar.addEventListener(
"click",
async()=>{



    const nome =
    nomeInput.value.trim();



    const classe =
    classeInput.value.trim();



    const ensino =
    ensinoInput.value;



    const ano =
    anoInput.value.trim();





    if(
        nome === "" ||
        classe === "" ||
        ano === ""
    ){


        alert(
        "Preencha todos os campos"
        );


        return;


    }





    try{


        // buscar disciplinas

        const disciplinas =
        await buscarDisciplinas(
            ensino,
            classe
        );





        await addDoc(
            collection(db,"turmas"),
            {


                nome:nome,


                classe:classe,


                ensino:ensino,


                anoLetivo:ano,


                escolaId:escolaId,


                disciplinas:disciplinas,


                criadoEm:
                serverTimestamp()


            }

        );





        alert(
        "Turma criada com sucesso"
        );





        nomeInput.value="";

        classeInput.value="";

        anoInput.value="";





        carregarTurmas();





    }catch(error){


        alert(
        "Erro ao criar turma: "
        +
        error.message
        );


    }



});







carregarTurmas();
