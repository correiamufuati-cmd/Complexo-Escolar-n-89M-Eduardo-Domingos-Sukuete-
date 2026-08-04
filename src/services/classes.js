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
// temporário

const escolaId = "SIGEA";




// ===============================
// BUSCAR DISCIPLINAS
// ===============================

async function buscarDisciplinas(ensino, classe){


    try{


        const referencia = doc(
            db,
            "config",
            "disciplinas"
        );



        const resultado = await getDoc(referencia);



        if(!resultado.exists()){

            alert(
                "Documento disciplinas não encontrado"
            );

            return [];

        }



        const dados = resultado.data();



        const disciplinas =
        dados[ensino]?.[classe]?.disciplinas;



        if(disciplinas){

            return disciplinas;

        }



        alert(
            "Não encontrou disciplinas para: "
            + ensino +
            " - " +
            classe
        );


        return [];



    }catch(error){


        alert(
            "Erro ao buscar disciplinas: "
            + error.message
        );


        return [];

    }


}







// ===============================
// CARREGAR TURMAS
// ===============================

async function buscarDisciplinas(ensino, classe){

    const referencia = doc(
        db,
        "config",
        "disciplinas"
    );

    const resultado = await getDoc(referencia);


    if(!resultado.exists()){

        return [];

    }


    const dados = resultado.data();


    console.log(dados);


    if(
        dados[ensino] &&
        dados[ensino][classe]
    ){

        return dados[ensino][classe].disciplinas || [];

    }


    alert(
        "Não encontrado: "
        + ensino +
        " / "
        + classe
    );


    return [];

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


        const disciplinas =
        await buscarDisciplinas(
            ensino,
            classe
        );




        alert(
            "Vou guardar:\n\n"
            +
            JSON.stringify(disciplinas)
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




        nomeInput.value = "";

        classeInput.value = "";

        anoInput.value = "";



        carregarTurmas();



    }catch(error){


        alert(
            "Erro ao criar turma: "
            +
            error.message
        );


    }


});






// iniciar

carregarTurmas();
