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

const classesPorEnsino = {

    ensinoPrimario: [
        "1classe",
        "2classe",
        "3classe",
        "4classe",
        "5classe",
        "6classe",
        "1etapa",
        "2etapa",
        "3etapa"
    ],

    primeiroCiclo: [
        "7classe",
        "8classe",
        "9classe",
        "Eja1",
        "Eja2"
    ]

};


function atualizarClasses(){

    const ensino = ensinoInput.value;

    classeInput.innerHTML = "";

    classesPorEnsino[ensino].forEach(classe=>{

        const option = document.createElement("option");

        option.value = classe;

        option.textContent = classe;

        classeInput.appendChild(option);

    });

}


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

alert(
JSON.stringify(dados, null, 2)
);

        console.log(
            "Config disciplinas:",
            dados
        );

alert(
"Classe recebida: " + classe +
"\n\nClasses reais no Firebase:\n" +
Object.keys(dados[ensino]).join("\n")
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

alert(
"Ensino = " + ensino +
"\nClasse = " + classe
);


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


ensinoInput.addEventListener(
    "change",
    atualizarClasses
);

atualizarClasses();




// ===============================
// INICIAR
// ===============================

carregarTurmas();
