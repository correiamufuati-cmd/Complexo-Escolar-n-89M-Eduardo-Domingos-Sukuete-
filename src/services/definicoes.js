alert("DEFINIÇÕES CARREGADAS ✅");

import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// =====================================================
// ELEMENTOS
// =====================================================

const nomeEscola =
    document.getElementById("nomeEscola");

const anoLetivo =
    document.getElementById("anoLetivo");

const provincia =
    document.getElementById("provincia");

const municipio =
    document.getElementById("municipio");

const telefone =
    document.getElementById("telefone");

const email =
    document.getElementById("email");

const ciclo =
    document.getElementById("ciclo");

const classe =
    document.getElementById("classe");

const disciplina =
    document.getElementById("disciplina");

const classeDisciplina =
    document.getElementById("classeDisciplina");

const listaClasses =
    document.getElementById("listaClasses");

const listaDisciplinas =
    document.getElementById("listaDisciplinas");

const mensagem =
    document.getElementById("mensagem");


// =====================================================
// CONFIGURAÇÃO
// =====================================================

const CONFIG_ID =
"escola";


// =====================================================
// ESTRUTURA INICIAL
// =====================================================

let configuracao = {

    escola: {

        nome: "",

        anoLetivo: "",

        provincia: "",

        municipio: "",

        telefone: "",

        email: ""

    },

    classes: [],

    disciplinas: {}

};


// =====================================================
// MENSAGEM
// =====================================================

function mostrarMensagem(
    texto,
    tipo="sucesso"
){

    mensagem.className =
        "mensagem " + tipo;

    mensagem.textContent =
        texto;


    setTimeout(
        ()=>{

            mensagem.className =
                "mensagem";

        },
        3000
    );

}


// =====================================================
// CARREGAR CONFIGURAÇÃO
// =====================================================

async function carregarConfiguracao(){

    try{

        const referencia =
            doc(
                db,
                "config",
                CONFIG_ID
            );


        const resultado =
            await getDoc(
                referencia
            );


        if(
            resultado.exists()
        ){

            configuracao = {

                ...configuracao,

                ...resultado.data()

            };

        }


        preencherDados();

        mostrarClasses();

        atualizarSelectClasses();

        mostrarDisciplinas();

    }
    catch(erro){

        console.error(
            erro
        );

        mostrarMensagem(
            "Erro ao carregar definições.",
            "erro"
        );

    }

}


// =====================================================
// PREENCHER DADOS
// =====================================================

function preencherDados(){

    nomeEscola.value =
        configuracao.escola?.nome || "";

    anoLetivo.value =
        configuracao.escola?.anoLetivo || "";

    provincia.value =
        configuracao.escola?.provincia || "";

    municipio.value =
        configuracao.escola?.municipio || "";

    telefone.value =
        configuracao.escola?.telefone || "";

    email.value =
        configuracao.escola?.email || "";

}


// =====================================================
// GUARDAR TUDO
// =====================================================

async function guardarConfiguracao(){

    try{

        await setDoc(

            doc(
                db,
                "config",
                CONFIG_ID
            ),

            configuracao,

            {
                merge:true
            }

        );


        mostrarMensagem(
            "Configurações guardadas com sucesso ✅"
        );

    }
    catch(erro){

        console.error(
            erro
        );

        mostrarMensagem(
            "Erro ao guardar configurações.",
            "erro"
        );

    }

}


// =====================================================
// GUARDAR DADOS DA ESCOLA
// =====================================================

document
.getElementById("guardarEscola")
.addEventListener(
"click",
async()=>{

    configuracao.escola = {

        nome:
            nomeEscola.value.trim(),

        anoLetivo:
            anoLetivo.value.trim(),

        provincia:
            provincia.value.trim(),

        municipio:
            municipio.value.trim(),

        telefone:
            telefone.value.trim(),

        email:
            email.value.trim()

    };


    await guardarConfiguracao();

});


// =====================================================
// ADICIONAR CLASSE
// =====================================================

document
.getElementById("guardarClasse")
.addEventListener(
"click",
async()=>{

    const cicloValor =
        ciclo.value.trim();

    const classeValor =
        classe.value.trim();


    if(
        !cicloValor ||
        !classeValor
    ){

        mostrarMensagem(
            "Selecione o ciclo e indique a classe.",
            "erro"
        );

        return;

    }


    /*
    Evitar classe duplicada
    */

    const existe =
        configuracao.classes.some(
            item =>

            item.nome
                .toLowerCase() ===
            classeValor
                .toLowerCase()

        );


    if(existe){

        mostrarMensagem(
            "Esta classe já está cadastrada.",
            "erro"
        );

        return;

    }


    configuracao.classes.push({

        id:
            Date.now().toString(),

        nome:
            classeValor,

        ciclo:
            cicloValor

    });


    configuracao.disciplinas[
        classeValor
    ] ||= [];


    await guardarConfiguracao();


    classe.value = "";

    ciclo.value = "";


    mostrarClasses();

    atualizarSelectClasses();

    mostrarDisciplinas();

});


// =====================================================
// MOSTRAR CLASSES
// =====================================================

function mostrarClasses(){

    listaClasses.innerHTML = "";


    if(
        configuracao.classes.length === 0
    ){

        listaClasses.innerHTML = `

            <p>
                Nenhuma classe cadastrada.
            </p>

        `;

        return;

    }


    configuracao.classes.forEach(
        item => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "item";


            const nomeCiclo =
                item.ciclo ===
                "ensinoPrimario"

                ? "Ensino Primário"

                : "1.º Ciclo";


            div.innerHTML = `

                <div class="item-info">

                    <strong>
                        ${item.nome}
                    </strong>

                    <small>
                        ${nomeCiclo}
                    </small>

                </div>

                <button
                    class="btn-perigo"
                    data-id="${item.id}"
                >

                    🗑️ Eliminar

                </button>

            `;


            div
            .querySelector("button")
            .addEventListener(
                "click",
                ()=>eliminarClasse(
                    item.id
                )
            );


            listaClasses.appendChild(
                div
            );

        }
    );

}


// =====================================================
// ELIMINAR CLASSE
// =====================================================

async function eliminarClasse(
    id
){

    const confirmar =
        confirm(
            "Tem certeza que deseja eliminar esta classe?"
        );


    if(!confirmar){
        return;
    }


    const encontrada =
        configuracao.classes.find(
            item =>
                item.id === id
        );


    if(!encontrada){
        return;
    }


    configuracao.classes =
        configuracao.classes.filter(
            item =>
                item.id !== id
        );


    delete configuracao.disciplinas[
        encontrada.nome
    ];


    await guardarConfiguracao();


    mostrarClasses();

    atualizarSelectClasses();

    mostrarDisciplinas();

}


// =====================================================
// ATUALIZAR SELECT DE CLASSES
// =====================================================

function atualizarSelectClasses(){

    classeDisciplina.innerHTML = `

        <option value="">
            Selecionar classe
        </option>

    `;


    configuracao.classes.forEach(
        item => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                item.nome;


            option.textContent =
                `${item.nome} — ${
                    item.ciclo ===
                    "ensinoPrimario"
                        ? "Ensino Primário"
                        : "1.º Ciclo"
                }`;


            classeDisciplina.appendChild(
                option
            );

        }
    );

}


// =====================================================
// ADICIONAR DISCIPLINA
// =====================================================

document
.getElementById("guardarDisciplina")
.addEventListener(
"click",
async()=>{

    const classeEscolhida =
        classeDisciplina.value;

    const nomeDisciplina =
        disciplina.value.trim();


    if(
        !classeEscolhida ||
        !nomeDisciplina
    ){

        mostrarMensagem(
            "Selecione a classe e indique a disciplina.",
            "erro"
        );

        return;

    }


    if(
        !configuracao.disciplinas[
            classeEscolhida
        ]
    ){

        configuracao.disciplinas[
            classeEscolhida
        ] = [];

    }


    const existe =
        configuracao
        .disciplinas[
            classeEscolhida
        ]
        .some(
            item =>
                item.toLowerCase() ===
                nomeDisciplina.toLowerCase()
        );


    if(existe){

        mostrarMensagem(
            "Esta disciplina já existe nesta classe.",
            "erro"
        );

        return;

    }


    configuracao
        .disciplinas[
            classeEscolhida
        ]
        .push(
            nomeDisciplina
        );


    await guardarConfiguracao();


    disciplina.value = "";


    mostrarDisciplinas();

});


// =====================================================
// MOSTRAR DISCIPLINAS
// =====================================================

function mostrarDisciplinas(){

    listaDisciplinas.innerHTML = "";


    configuracao.classes.forEach(
        item => {

            const disciplinas =
                configuracao
                .disciplinas[
                    item.nome
                ] || [];


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "item";


            let html = `

                <div class="item-info">

                    <strong>
                        ${item.nome}
                    </strong>

                    <div class="disciplinas">

            `;


            if(
                disciplinas.length === 0
            ){

                html += `
                    <span>
                        Nenhuma disciplina.
                    </span>
                `;

            }
            else{

                disciplinas.forEach(
                    nome => {

                        html += `

                            <span class="disciplina">

                                ${nome}

                                <button
                                    type="button"
                                    data-classe="${item.nome}"
                                    data-disciplina="${nome}"
                                    style="
                                        padding:2px 5px;
                                        margin-left:4px;
                                        background:none;
                                        color:#b91c1c;
                                    "
                                >

                                    ×

                                </button>

                            </span>

                        `;

                    }
                );

            }


            html += `

                    </div>

                </div>

            `;


            div.innerHTML =
                html;


            div
            .querySelectorAll(
                "button[data-disciplina]"
            )
            .forEach(
                botao => {

                    botao.addEventListener(
                        "click",
                        ()=>eliminarDisciplina(

                            botao.dataset.classe,

                            botao.dataset.disciplina

                        )
                    );

                }
            );


            listaDisciplinas.appendChild(
                div
            );

        }
    );

}


// =====================================================
// ELIMINAR DISCIPLINA
// =====================================================

async function eliminarDisciplina(
    classeNome,
    disciplinaNome
){

    const confirmar =
        confirm(
            `Eliminar "${disciplinaNome}" da ${classeNome}?`
        );


    if(!confirmar){
        return;
    }


    configuracao.disciplinas[
        classeNome
    ] =
        (
            configuracao
            .disciplinas[
                classeNome
            ] || []
        )
        .filter(
            item =>
                item !== disciplinaNome
        );


    await guardarConfiguracao();


    mostrarDisciplinas();

}


// =====================================================
// INICIAR
// =====================================================

carregarConfiguracao();
