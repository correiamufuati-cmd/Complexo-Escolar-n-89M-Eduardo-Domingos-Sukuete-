alert("students.js carregou");

import { app } from "./firebase.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const db = getFirestore(app);

alert("Firebase carregado");

// Elementos

const turmaSelect = document.getElementById("turmaSelect");

if(!turmaSelect){
    alert("ERRO: Não encontrei o campo turmaSelect");
}
else{
    alert("Campo turmaSelect encontrado");
}

const nomeAluno = document.getElementById("nomeAluno");

const numeroAluno = document.getElementById("numeroAluno");

const sexoAluno = document.getElementById("sexoAluno");

const dataAluno = document.getElementById("dataAluno");

const guardarAluno = document.getElementById("guardarAluno");

const listaImportar = document.getElementById("listaImportar");

const importarAlunos = document.getElementById("importarAlunos");

const listaAlunos = document.getElementById("listaAlunos");

const pesquisarAluno = document.getElementById("pesquisarAluno");


// guardar ID da turma selecionada

let turmaSelecionada = "";

let todosAlunos = [];



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

alert("Turmas encontradas: " + dados.size);


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
// GERAR CÓDIGO DO ALUNO
// =============================

function gerarCodigoAluno(numero){

    const turmaTexto = turmaSelect.options[turmaSelect.selectedIndex].text;

    let codigoTurma = turmaTexto
    .replace("ª","")
    .replace(" ","")
    .split("-")[0];


    return codigoTurma + "-" + 
    String(numero).padStart(3,"0");

}



// =============================
// GERAR SENHA AUTOMÁTICA
// =============================

function gerarSenha(){

    const caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let senha="";


    for(let i=0;i<6;i++){

        senha += caracteres.charAt(
            Math.floor(
                Math.random()*caracteres.length
            )
        );

    }


    return senha;

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

turmaId: turmaSelecionada,

turmaNome: turmaSelect.options[turmaSelect.selectedIndex].text,

codigoAluno: gerarCodigoAluno(numeroAluno.value),

senhaAcesso: gerarSenha(),

estado: "ativo",

criadoEm: serverTimestamp()

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


function calcularIdade(data){

    if(!data){
        return "";
    }


    let partes = data.split("-");


    if(partes.length !== 3){

        return "";

    }


    let dia = Number(partes[0]);
    let mes = Number(partes[1]) - 1;
    let ano = Number(partes[2]);


    const nascimento = new Date(
        ano,
        mes,
        dia
    );


    const hoje = new Date();


    let idade = hoje.getFullYear() - nascimento.getFullYear();


    let diferencaMes =
    hoje.getMonth() - nascimento.getMonth();


    if(
        diferencaMes < 0 ||
        (
            diferencaMes === 0 &&
            hoje.getDate() < nascimento.getDate()
        )
    ){

        idade--;

    }


    return idade;

                     }


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


    let alunos = [];


dados.forEach(doc=>{

    alunos.push(doc.data());

});



alunos.sort((a,b)=>{

    return Number(a.numero) - Number(b.numero);

});


todosAlunos = alunos;
    

    listaAlunos.innerHTML = `

<table>

<thead>
<tr>
<th>Código</th>
<th>Nº</th>
<th>Nome</th>
<th>Sexo</th>
<th>Data Nascimento</th>
<th>Idade</th>
<th>Turma</th>
<th>Estado</th>
<th>Ações</th>
</tr>
</thead>

<tbody id="corpoTabela">

</tbody>

</table>

`;


const corpoTabela = document.getElementById("corpoTabela");


todosAlunos = alunos;

mostrarAlunos(todosAlunos);
    

        }

function mostrarAlunos(lista){


const corpoTabela = document.getElementById("corpoTabela");


corpoTabela.innerHTML="";


lista.forEach(aluno=>{


corpoTabela.innerHTML += `

<tr>

<td>${aluno.codigoAluno || ""}</td>

<td>${aluno.numero}</td>

<td>${aluno.nome}</td>

<td>${aluno.sexo || ""}</td>

<td>${aluno.dataNascimento || ""}</td>

<td>${calcularIdade(aluno.dataNascimento)}</td>

<td>${aluno.turmaNome || ""}</td>

<td>${aluno.estado || "ativo"}</td>

<td>

<button onclick="alterarEstado('${aluno.codigoAluno}')">
⚙️ Estado
</button>

<button onclick="verAluno('${aluno.codigoAluno}')">
👁️
</button>

<button onclick="editarAluno('${aluno.codigoAluno}')">
✏️
</button>

<button onclick="apagarAluno('${aluno.codigoAluno}')">
🗑️
</button>

</td>

</tr>

`;


});


    }
    

// =============================
// IMPORTAR ALUNOS
// =============================

importarAlunos.addEventListener("click", async()=>{


    if(!turmaSelecionada){

        alert("Selecione uma turma");

        return;

    }


    const texto = listaImportar.value.trim();


    if(texto===""){

        alert("Cole a lista de alunos");

        return;

    }



    const linhas = texto.split("\n");



    for(let linha of linhas){


        const dados = linha.split(";");



        if(dados.length < 4){

            continue;

        }



        await addDoc(

            collection(
                db,
                "turmas",
                turmaSelecionada,
                "alunos"
            ),

            {

numero:dados[0].trim(),

nome:dados[1].trim(),

sexo:dados[2].trim(),

dataNascimento:dados[3].trim(),

turmaId:turmaSelecionada,

turmaNome: turmaSelect.options[turmaSelect.selectedIndex].text,

codigoAluno: gerarCodigoAluno(dados[0].trim()),

senhaAcesso: gerarSenha(),

estado: "ativo",

criadoEm: serverTimestamp()
        }

        );


    }



    alert("Alunos importados com sucesso");


    listaImportar.value="";


    carregarAlunos();


});



// PESQUISAR ALUNOS
pesquisarAluno.addEventListener("input",()=>{

    const texto = pesquisarAluno.value.toLowerCase();

    const resultado = todosAlunos.filter(aluno=>

        (aluno.nome || "").toLowerCase().includes(texto) ||

        String(aluno.numero).includes(texto) ||

        (aluno.codigoAluno || "").toLowerCase().includes(texto)

    );

    mostrarAlunos(resultado);

});


window.alterarEstado = async function(codigo){

    const opcao = prompt(
        "Digite o novo estado:\n\n1 - ativo\n2 - transferido\n3 - desistiu\n4 - removido"
    );


    let novoEstado = "";


    if(opcao === "1"){
        novoEstado = "ativo";
    }

    else if(opcao === "2"){
        novoEstado = "transferido";
    }

    else if(opcao === "3"){
        novoEstado = "desistiu";
    }

    else if(opcao === "4"){
        novoEstado = "removido";
    }

    else{
        return;
    }



    const turmas = await getDocs(
        collection(db,"turmas")
    );


    for(const turma of turmas.docs){


        const alunos = await getDocs(
            collection(
                db,
                "turmas",
                turma.id,
                "alunos"
            )
        );


        for(const aluno of alunos.docs){


            if(aluno.data().codigoAluno === codigo){


                const motivo = prompt(
    "Digite o motivo da alteração:"
);


await updateDoc(

    doc(
        db,
        "turmas",
        turma.id,
        "alunos",
        aluno.id
    ),

    {
        estado: novoEstado,

        motivoEstado: motivo || "",

        dataEstado: serverTimestamp()
    }

);


                alert("Estado atualizado");


                carregarAlunos();


                return;

            }

        }

    }


};

// =============================
// VER DETALHES DO ALUNO
// =============================

window.verAluno = async function(codigo){

    const turmas = await getDocs(
        collection(db,"turmas")
    );


    for(const turma of turmas.docs){


        const alunos = await getDocs(
            collection(
                db,
                "turmas",
                turma.id,
                "alunos"
            )
        );


        for(const aluno of alunos.docs){


            const dados = aluno.data();


            if(dados.codigoAluno === codigo){


                alert(
`Código: ${dados.codigoAluno}

Nome: ${dados.nome}

Número: ${dados.numero}

Sexo: ${dados.sexo || ""}

Data nascimento: ${dados.dataNascimento || ""}

Turma: ${dados.turmaNome}

Estado: ${dados.estado || "ativo"}

Senha: ${dados.senhaAcesso || ""}`
                );


                return;

            }

        }

    }


};

// =============================
// EDITAR ALUNO
// =============================

window.editarAluno = async function(codigo){

    const turmas = await getDocs(
        collection(db,"turmas")
    );


    for(const turma of turmas.docs){


        const alunos = await getDocs(
            collection(
                db,
                "turmas",
                turma.id,
                "alunos"
            )
        );


        for(const aluno of alunos.docs){


            const dados = aluno.data();


            if(dados.codigoAluno === codigo){


                const novoNome = prompt(
                    "Nome do aluno:",
                    dados.nome
                );


                const novoNumero = prompt(
                    "Número do aluno:",
                    dados.numero
                );


                const novoSexo = prompt(
                    "Sexo:",
                    dados.sexo || ""
                );


                const novaData = prompt(
                    "Data de nascimento:",
                    dados.dataNascimento || ""
                );


                await updateDoc(

                    doc(
                        db,
                        "turmas",
                        turma.id,
                        "alunos",
                        aluno.id
                    ),

                    {

                        nome: novoNome,

                        numero: novoNumero,

                        sexo: novoSexo,

                        dataNascimento: novaData

                    }

                );


                alert("Aluno atualizado com sucesso");


                carregarAlunos();


                return;

            }

        }

    }

};

        alert("CHEGUEI AO FINAL DO FICHEIRO");

carregarTurmas();
