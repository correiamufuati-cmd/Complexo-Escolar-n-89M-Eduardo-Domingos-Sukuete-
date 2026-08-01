alert("classes.js iniciou");

import { app } from "../config/firebase.js";

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


const nomeInput = document.getElementById("className");
const classeInput = document.getElementById("classe");
const anoInput = document.getElementById("anoLetivo");



console.log("classes.js carregado");



async function carregarTurmas(){


    console.log("A procurar turmas...");


    classList.innerHTML = "A carregar turmas...";


    const dados = await getDocs(
        collection(db,"turmas")
    );


    classList.innerHTML = "";


    if(dados.empty){

        classList.innerHTML =
        "Nenhuma turma encontrada";

        return;

    }



    dados.forEach(doc=>{


        const turma = doc.data();


        classList.innerHTML += `

        <p>
        ${turma.nome} -
        ${turma.classe} -
        ${turma.anoLetivo}
        </p>

        `;


    });


}





saveButton.addEventListener("click", async()=>{


    console.log("Botão clicado");


    await addDoc(
        collection(db,"turmas"),
        {

            nome:nomeInput.value,

            classe:classeInput.value,

            anoLetivo:anoInput.value,

            criadoEm:serverTimestamp()

        }
    );


    alert("Turma guardada");


    carregarTurmas();


});




carregarTurmas();
