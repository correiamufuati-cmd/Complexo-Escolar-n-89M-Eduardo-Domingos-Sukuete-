alert("classes.js carregado");


import { app } from "./firebase.js";


import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";



const db = getFirestore(app);



// ELEMENTOS DA PÁGINA

const saveButton = document.getElementById("saveClass");

const classList = document.getElementById("classList");

const nomeInput = document.getElementById("className");

const classeInput = document.getElementById("classe");

const anoInput = document.getElementById("anoLetivo");





console.log("Elementos:");

console.log(saveButton);
console.log(classList);
console.log(nomeInput);
console.log(classeInput);
console.log(anoInput);





// ===============================
// CARREGAR TURMAS
// ===============================


async function carregarTurmas(){


    if(!classList){

        console.log("Elemento classList não encontrado");

        return;

    }



    classList.innerHTML = "A carregar turmas...";



    try{


        const dados = await getDocs(
            collection(db,"turmas")
        );



        classList.innerHTML = "";



        if(dados.empty){


            classList.innerHTML =
            "Nenhuma turma criada";


            return;

        }




        dados.forEach((doc)=>{


            const turma = doc.data();



            classList.innerHTML += `


            <div>


            <h3>
            ${turma.nome || ""}
            </h3>


            <p>
            Classe: ${turma.classe || ""}
            </p>


            <p>
            Ano Lectivo: ${turma.anoLetivo || ""}
            </p>


            </div>


            <hr>


            `;



        });



    }catch(error){


        classList.innerHTML =
        "Erro ao carregar turmas: "
        + error.message;


    }


}







// ===============================
// CRIAR TURMA
// ===============================


if(saveButton){



saveButton.addEventListener("click", async()=>{



    const nome = nomeInput.value.trim();

    const classe = classeInput.value.trim();

    const ano = anoInput.value.trim();




    if(!nome || !classe || !ano){


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



}else{


console.log("Botão saveClass não encontrado");


}






// iniciar lista

carregarTurmas();
