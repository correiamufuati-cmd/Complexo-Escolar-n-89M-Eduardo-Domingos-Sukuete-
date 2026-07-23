import { app } from "./firebase.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const db = getFirestore(app);


// Elementos
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



// Mostrar turmas
async function carregarTurmas(){

    classList.innerHTML="";


    const snapshot = await getDocs(collection(db,"turmas"));


    if(snapshot.empty){

        classList.innerHTML="Nenhuma turma cadastrada.";
        return;

    }



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

            <button>
            📄 Importar Lista PDF
            </button>

        </div>

        `;

    });


}



// iniciar
carregarTurmas();
