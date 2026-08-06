import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// CAMPOS

const codigoInput = document.getElementById("codigo");
const senhaInput = document.getElementById("senha");
const botaoEntrar = document.getElementById("entrar");



// LOGIN

botaoEntrar.addEventListener("click", async ()=>{


const codigo = codigoInput.value.trim();

const senha = senhaInput.value.trim();



if(!codigo || !senha){

alert("Preencha o código e a senha.");

return;

}



try{


const professoresRef = collection(db,"professores");



const q = query(

professoresRef,

where("codigoProfessor","==",codigo),

where("senhaAcesso","==",senha)
    
);



const resultado = await getDocs(q);



if(resultado.empty){

alert("Código ou senha incorretos.");

return;

}




let professor;



resultado.forEach(doc=>{


professor={

id:doc.id,

...doc.data()

};


});




// guardar sessão

localStorage.setItem(

"professorLogado",

JSON.stringify(professor)

);



// ir para painel

window.location.href =
"painel-professor.html";



}

catch(erro){

console.error(erro);

alert("Erro ao entrar.");

}



});
