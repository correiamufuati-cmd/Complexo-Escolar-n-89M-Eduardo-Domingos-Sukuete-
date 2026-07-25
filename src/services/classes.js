import { app } from "./firebase.js";

import { lerPDF } from "./pdf-reader.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const db = getFirestore(app);


const saveButton = document.getElementById("saveClass");
const classList = document.getElementById("classList");



// ===============================
// CRIAR TURMA
// ===============================

saveButton.addEventListener("click", async()=>{


    const name =
    document.getElementById("className").value.trim();


    const level =
    document.getElementById("classLevel").value.trim();


    const year =
    document.getElementById("schoolYear").value.trim();



    if(!name || !level || !year){

        alert("Preencha todos os campos.");

        return;

    }



    try{


        await addDoc(collection(db,"turmas"),{


            nome:name,

            classe:level,

            anoLetivo:year,

            criadoEm:serverTimestamp()


        });



        alert("Turma criada com sucesso!");



        document.getElementById("className").value="";

        document.getElementById("classLevel").value="";

        document.getElementById("schoolYear").value="";



        carregarTurmas();



    }catch(erro){


        alert(
        "Erro ao criar turma: "
        + erro.message
        );


    }



});





// ===============================
// LISTAR TURMAS
// ===============================

async function carregarTurmas(){


    classList.innerHTML =
    "A carregar turmas...";



    try{


        const snapshot =
        await getDocs(collection(db,"turmas"));



        classList.innerHTML="";



        if(snapshot.empty){


            classList.innerHTML =
            "Nenhuma turma cadastrada.";


            return;

        }



        snapshot.forEach(doc=>{


            const turma = doc.data();



            classList.innerHTML += `


            <div class="card">


                <h3>
                ${turma.nome}
                </h3>


                <p>
                <strong>Classe:</strong>
                ${turma.classe}
                </p>


                <p>
                <strong>Ano Letivo:</strong>
                ${turma.anoLetivo}
                </p>



                <input

                type="file"

                accept="application/pdf"

                id="pdf-${doc.id}"

                >



                <button onclick="importarPDF('${doc.id}')">

                📄 Importar Lista PDF

                </button>


            </div>


            `;


        });



    }catch(erro){


        classList.innerHTML =
        "Erro: " + erro.message;


    }



}






// ===============================
// TESTE IMPORTAR PDF
// ===============================

window.importarPDF = function(idTurma){


    const ficheiro =
    document.getElementById(`pdf-${idTurma}`);



    if(!ficheiro || !ficheiro.files[0]){


        alert(
        "Escolha primeiro o PDF."
        );


        return;

    }



try{


const texto = await lerPDF(ficheiro.files[0]);


alert(texto);


}catch(erro){


alert(
"Erro: " + erro.message
);


}


};






// ===============================
// INICIAR
// ===============================

carregarTurmas();
