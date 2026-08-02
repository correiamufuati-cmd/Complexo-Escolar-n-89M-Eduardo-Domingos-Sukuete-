alert("alunos.js carregou");

import { app } from "./firebase.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const db = getFirestore(app);


// Elementos

const turmaSelect = document.getElementById("turmaSelect");

const nomeAluno = document.getElementById("nomeAluno");

const numeroAluno = document.getElementById("numeroAluno");

const sexoAluno = document.getElementById("sexoAluno");

const dataAluno = document.getElementById("dataAluno");

const guardarAluno = document.getElementById("guardarAluno");

const listaAlunos = document.getElementById("listaAlunos");



// guardar ID da turma selecionada

let turmaSelecionada = "";




// =============================
// CARREGAR TURMAS
// =============================

async function carregarTurmas(){

    try{

        turmaSelect.innerHTML =
        "<option>A procurar turmas...</option>";


        const dados = await getDocs(
            collection(db,"turmas")
        );


        if(dados.empty){

            turmaSelect.innerHTML =
            "<option>Nenhuma turma encontrada</option>";

            return;
        }


        turmaSelect.innerHTML =
        "";


        dados.forEach(doc=>{

            const turma = doc.data();


            turmaSelect.innerHTML += `

            <option value="${doc.id}">
            ${turma.nome} - ${turma.classe}
            </option>

            `;


        });


        turmaSelecionada = turmaSelect.value;


        carregarAlunos();


    }catch(erro){


        turmaSelect.innerHTML =
        "<option>Erro: "+erro.message+"</option>";


    }

}




// =============================
// GUARDAR ALUNO
// =============================


guardarAluno.addEventListener("click",async()=>{


    if(!turmaSelecionada){

        alert("Selecione uma turma");

        return;

    }



    if(
        nomeAluno.value==="" ||
        numeroAluno.value===""
    ){

        alert("Preencha nome e número");

        return;

    }



    await addDoc(

        collection(
            db,
            "turmas",
            turmaSelecionada,
            "alunos"
        ),

        {

            nome:nomeAluno.value,

            numero:numeroAluno.value,

            sexo:sexoAluno.value,

            dataNascimento:dataAluno.value,

            criadoEm:serverTimestamp()

        }

    );



    alert("Aluno guardado");



    nomeAluno.value="";
    numeroAluno.value="";
    sexoAluno.value="";
    dataAluno.value="";


    carregarAlunos();


});





// =============================
// LISTAR ALUNOS
// =============================


async function carregarAlunos(){


    if(!turmaSelecionada){

        return;

    }



    listaAlunos.innerHTML =
    "A carregar alunos...";



    const dados = await getDocs(

        collection(
            db,
            "turmas",
            turmaSelecionada,
            "alunos"
        )

    );



    listaAlunos.innerHTML="";



    if(dados.empty){


        listaAlunos.innerHTML =
        "Nenhum aluno cadastrado";


        return;

    }




    dados.forEach(doc=>{


        const aluno = doc.data();



        listaAlunos.innerHTML += `

        <div class="aluno">

        Nº ${aluno.numero}

        <br>

        ${aluno.nome}

        <br>

        Sexo: ${aluno.sexo}

        </div>

        `;


    });



}




carregarTurmas();
