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



// Criar turma
saveButton.addEventListener("click", async () => {

    const name = document.getElementById("className").value;
    const level = document.getElementById("classLevel").value;
    const year = document.getElementById("schoolYear").value;


    if(!name || !level || !year){

        alert("Preencha todos os campos");
        return;

    }


    await addDoc(collection(db, "turmas"), {

        nome: name,
        classe: level,
        anoLetivo: year,
        criadoEm: serverTimestamp()

    });


    alert("Turma criada com sucesso!");


    document.getElementById("className").value="";
    document.getElementById("classLevel").value="";
    document.getElementById("schoolYear").value="";


    carregarTurmas();

});





// Listar turmas
async function carregarTurmas(){

    classList.innerHTML="";


    const snapshot = await getDocs(collection(db,"turmas"));


    snapshot.forEach(doc=>{

        const turma = doc.data();


        classList.innerHTML += `

        <div class="card">

            <h3>${turma.nome}</h3>

            <p>
            Classe: ${turma.classe}
            </p>

            <p>
            Ano Letivo: ${turma.anoLetivo}
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


}




// Importar PDF
window.importarPDF = async function(idTurma){


    const input = document.getElementById(
        `pdf-${idTurma}`
    );


    const file = input.files[0];


    if(!file){

        alert("Selecione um PDF primeiro");
        return;

    }


    const texto = await lerPDF(file);


    console.log("Texto encontrado no PDF:");

    console.log(texto);


    alert(
        "PDF lido com sucesso! Verifique a consola."
    );


};





carregarTurmas();
