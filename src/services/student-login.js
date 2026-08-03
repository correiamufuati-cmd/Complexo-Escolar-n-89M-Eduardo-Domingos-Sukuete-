import { db } from "../config/firebase.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const form = document.getElementById("loginAluno");


form.addEventListener("submit", async (e)=>{

    e.preventDefault();


    const codigo = document
        .getElementById("codigoAluno")
        .value
        .trim();


    const senha = document
        .getElementById("senhaAluno")
        .value
        .trim();



    try {


        const alunosRef = collection(db,"alunos");


        const q = query(
            alunosRef,
            where("codigoAluno","==",codigo),
            where("senha","==",senha)
        );


        const resultado = await getDocs(q);



        if(resultado.empty){

            alert("Código ou senha incorretos");
            return;

        }



        const doc = resultado.docs[0];


        const aluno = {

            id: doc.id,
            ...doc.data()

        };



        localStorage.setItem(
            "alunoLogado",
            JSON.stringify(aluno)
        );



        window.location.href =
            "student-area.html";



    }catch(erro){


        console.error(erro);

        alert(
            "Erro ao entrar no sistema"
        );


    }


});
