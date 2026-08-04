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


// ===============================
// ELEMENTOS DA PÁGINA
// ===============================

const btnCriar = document.getElementById("saveClass");

const listaTurmas = document.getElementById("classList");

const nomeInput = document.getElementById("className");

const classeInput = document.getElementById("classe");

const ensinoInput = document.getElementById("ensino");

const anoInput = document.getElementById("anoLetivo");


// ID DA ESCOLA
// depois será substituído pelo ID vindo do login

const escolaId = "SIGEA";




// ===============================
// BUSCAR DISCIPLINAS
// ===============================

async function buscarDisciplinas(ensino, classe){

    try{


        const ref = doc(
            db,
            "config",
            "disciplinas"
        );


        const resultado = await getDoc(ref);



        if(!resultado.exists()){

            console.log(
                "Documento disciplinas não existe"
            );

            return [];

        }



        const dados = resultado.data();



        console.log(
            "Config disciplinas:",
            dados
        );



        const lista =
        dados?.[ensino]?.[classe]?.disciplinas;



        if(Array.isArray(lista)){

            return lista;

        }



        console.log(
            "Disciplina não encontrada:",
            ensino,
            classe
        );


        return [];



    }catch(error){


        console.log(
            "Erro disciplinas:",
            error
        );


        return [];

    }

}







// ===============================
// LISTAR TURMAS
// ===============================

async function carregarTurmas(){


    try{


        listaTurmas.innerHTML =
        "A carregar turmas...";



        const resultado =
        await getDocs(
            collection(db,"turmas")
        );



        listaTurmas.innerHTML = "";



        if(resultado.empty){


            listaTurmas.innerHTML =
            "Nenhuma turma criada";


            return;

        }





        resultado.forEach((item)=>{


            const turma =
            item.data();



            listaTurmas.innerHTML += `


            <div class="turma-card">


                <strong>
                    ${turma.nome || ""}
                </strong>


                <br>

                Classe:
                ${turma.classe || ""}


                <br>

                Ensino:
                ${turma.ensino || ""}


                <br>

                Ano:
                ${turma.anoLetivo || ""}


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
        "Erro ao carregar: "
        + error.message;


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
    ensinoInput.value.trim();


    const ano =
    anoInput.value.trim();




    if(
        nome === "" ||
        classe === "" ||
        ensino === "" ||
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



        alert(
            "Disciplinas encontradas: "
            +
            disciplinas.length
        );




        const novaTurma =
        {

            nome:nome,

            classe:classe,

            ensino:ensino,

            anoLetivo:ano,

            escolaId:escolaId,

            disciplinas:disciplinas,

            criadoEm:
            serverTimestamp()

        };





        await addDoc(
            collection(db,"turmas"),
            novaTurma
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






// ===============================
// INICIAR
// ===============================

carregarTurmas();
