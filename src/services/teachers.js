alert("TEACHERS.JS CARREGADO Dav");

import { db } from "./firebase.js";

import {
collection,
getDocs,
getDoc,
addDoc,
updateDoc,
deleteDoc,
doc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// =====================================
// CAMPOS
// =====================================

const nomeProfessor =
document.getElementById("nomeProfessor");

const emailProfessor =
document.getElementById("emailProfessor");

const nivelEnsino =
document.getElementById("nivelEnsino");

const listaTurmas =
document.getElementById("listaTurmas");

const listaAtribuicoes =
document.getElementById("listaAtribuicoes");

const guardarProfessor =
document.getElementById("guardarProfessor");

const tabelaProfessores =
document.getElementById("tabelaProfessores");


// =====================================
// VARIÁVEIS
// =====================================

let turmas = [];

let atribuicoes = [];

// =====================================
// GERAR CÓDIGO PROFESSOR
// =====================================

function gerarCodigoProfessor(numero){

return "PROF-" +
String(numero).padStart(3,"0");

}

// =====================================
// GERAR SENHA
// =====================================

function gerarSenha(){

const caracteres =
"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

let senha = "";

for(let i=0;i<6;i++){

senha += caracteres.charAt(

Math.floor(
Math.random()*caracteres.length
)

);

}

return senha;

}

// =====================================
// LIMPAR FORMULÁRIO
// =====================================

function limparFormulario(){

nomeProfessor.value = "";

emailProfessor.value = "";

nivelEnsino.value = "";

listaTurmas.innerHTML =
"Selecione o nível";

listaAtribuicoes.innerHTML =
"Selecione uma turma";

atribuicoes = [];

}

// =====================================
// CARREGAR TURMAS
// =====================================

nivelEnsino.addEventListener(
"change",
async()=>{

await carregarTurmas();

});


async function carregarTurmas(){

listaTurmas.innerHTML =
"A carregar turmas...";

listaAtribuicoes.innerHTML =
"Selecione uma turma";

turmas = [];

atribuicoes = [];

    
const snapshot =
await getDocs(
collection(db,"turmas")
);



listaTurmas.innerHTML = "";



snapshot.forEach(docSnap=>{

const turma = {

id:docSnap.id,

...docSnap.data()

};



if(
turma.ensino ===
nivelEnsino.value
){

turmas.push(turma);

}

});



if(turmas.length===0){

listaTurmas.innerHTML =
"Nenhuma turma encontrada.";

return;

}



turmas.forEach(turma=>{

listaTurmas.innerHTML +=
`

<div class="checkBox">

<label>

<input
type="checkbox"
class="turmaCheck"
value="${turma.id}">

<b>${turma.nome}</b>

(${turma.classe})

</label>

</div>

`;

});



document
.querySelectorAll(".turmaCheck")
.forEach(check=>{

check.addEventListener(
"change",
carregarAtribuicoes
);

});

    }


// =====================================
// CARREGAR ATRIBUIÇÕES
// (TURMA + DISCIPLINAS)
// =====================================

async function carregarAtribuicoes(){

listaAtribuicoes.innerHTML="";

atribuicoes = [];

const selecionadas =
document.querySelectorAll(
".turmaCheck:checked"
);



if(selecionadas.length===0){

listaAtribuicoes.innerHTML=
"Selecione uma turma.";

return;

}



for(const check of selecionadas){


const turmaId = check.value;



const turmaRef =
doc(
db,
"turmas",
turmaId
);



const turmaSnap =
await getDoc(turmaRef);



if(!turmaSnap.exists()){

continue;

}



const turma =
turmaSnap.data();



listaAtribuicoes.innerHTML +=

`

<div class="section">

<h3>

${turma.nome}

</h3>

`;



const disciplinas =
turma.disciplinas || [];



disciplinas.forEach(disciplina=>{


listaAtribuicoes.innerHTML +=

`

<label>

<input

type="checkbox"

class="disciplinaCheck"

data-turma="${turmaId}"

data-turmaNome="${turma.nome || ""}"

data-classe="${turma.classe || ""}"

value="${disciplina}"

>

${disciplina}

</label>

<br>

`;


});



listaAtribuicoes.innerHTML +=

`

</div>

`;



}



document
.querySelectorAll(".disciplinaCheck")
.forEach(item=>{


item.addEventListener(
"change",
()=>{


atribuicoes=[];



document
.querySelectorAll(".disciplinaCheck:checked")
.forEach(d=>{


atribuicoes.push({

turmaId: d.dataset.turma,

turmaNome: d.dataset.turmaNome,

classe: d.dataset.classe,

disciplina: d.value

});


});



});


});

}


// =====================================
// GUARDAR PROFESSOR
// =====================================

guardarProfessor.addEventListener(
"click",
async()=>{


alert("Botão guardar clicado");


const nome =
nomeProfessor.value.trim();


const email =
emailProfessor.value.trim();


const ensino =
nivelEnsino.value;



if(
!nome ||
!ensino ||
atribuicoes.length === 0
){

alert(
"Preencha nome, nível e atribuições"
);

return;

}


// gerar código automático

const professores =
await getDocs(
collection(db,"professores")
);


const numero =
professores.size + 1;


const codigo =
gerarCodigoProfessor(numero);


const senha =
gerarSenha();


alert("Vai gravar no Firebase");

    alert(
"Dados:\n\n" +
"Codigo: " + codigo +
"\nSenha: " + senha +
"\nNome: " + nome +
"\nEmail: " + email +
"\nEnsino: " + ensino +
"\nAtribuições: " + JSON.stringify(atribuicoes)
);

try{

    await addDoc(

        collection(db,"professores"),

        {

            codigoProfessor: codigo,

            senhaAcesso: senha,

            nome: nome,

            email: email,

            ensino: ensino,

            atribuicoes: atribuicoes,

            ativo: true,

            criadoEm: serverTimestamp()

        }

    );


    alert(
    `Professor cadastrado!

Código:
${codigo}

Senha:
${senha}`
    );


    limparFormulario();

    carregarProfessores();


}catch(erro){

    alert(
    "Erro ao guardar professor:\n\n" 
    + erro.message
    );

    console.error(erro);

}

});

// =====================================
// LISTAR PROFESSORES
// =====================================

async function carregarProfessores(){

    const dados =
    await getDocs(
        collection(db,"professores")
    );

    tabelaProfessores.innerHTML = "";

    dados.forEach(item=>{

        const professor = item.data();

        let listaAtribuicoes = "";

        if(professor.atribuicoes){

            professor.atribuicoes.forEach(a=>{

                listaAtribuicoes +=
                `${a.turmaNome} - ${a.disciplina}<br>`;

            });

        }

        tabelaProfessores.innerHTML += `

        <tr>

            <td>${professor.codigoProfessor || ""}</td>

            <td>${professor.nome || ""}</td>

            <td>${professor.email || ""}</td>

            <td>${professor.ensino || ""}</td>

            <td>${listaAtribuicoes}</td>

            <td>${professor.senhaAcesso || ""}</td>

            <td>

                <button onclick="verProfessor('${item.id}')">
                    👁️
                </button>

                <button onclick="editarProfessor('${item.id}')">
                    ✏️
                </button>

                <button onclick="apagarProfessor('${item.id}')">
                    🗑️
                </button>

            </td>

        </tr>

        `;

    });

}



// =====================================
// VER PROFESSOR
// =====================================


window.verProfessor = async(id)=>{


const referencia =
doc(
db,
"professores",
id
);



const resultado =
await getDoc(referencia);



if(!resultado.exists()){

return;

}



const p =
resultado.data();



let texto =

`
Código:
${p.codigoProfessor}


Nome:
${p.nome}


Email:
${p.email}


Ensino:
${p.ensino}


Senha:
${p.senhaAcesso}


Atribuicoes:

`;



p.atribuicoes?.forEach(a=>{


texto +=

`
${a.turmaNome}
-
${a.disciplina}

`;



});



alert(texto);



};


// =====================================
// APAGAR PROFESSOR
// =====================================


window.apagarProfessor = async(id)=>{


const confirmar =
confirm(
"Tem certeza que deseja apagar este professor?"
);



if(!confirmar){

return;

}



await deleteDoc(

doc(
db,
"professores",
id
)

);



alert(
"Professor apagado"
);



carregarProfessores();



};






// =====================================
// EDITAR PROFESSOR
// =====================================


window.editarProfessor = async(id)=>{


const referencia =
doc(
db,
"professores",
id
);



const resultado =
await getDoc(referencia);



if(!resultado.exists()){

return;

}



const professor =
resultado.data();



const novoNome =
prompt(
"Novo nome:",
professor.nome
);



if(!novoNome){

return;

}



await updateDoc(

referencia,

{

nome:
novoNome

}

);



alert(
"Professor atualizado"
);



carregarProfessores();



};






// =====================================
// INICIAR
// =====================================


carregarProfessores();
