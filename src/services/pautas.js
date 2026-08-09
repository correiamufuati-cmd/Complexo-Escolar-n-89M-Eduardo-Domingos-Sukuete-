import { db } from "./firebase.js";

import {
collection,
getDocs,
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

/* ============================================================
ELEMENTOS
============================================================ */

const classeSelect =
document.getElementById("classeSelect");

const turmaSelect =
document.getElementById("turmaSelect");

const pautaLista =
document.getElementById("pautaLista");

const estadoPauta =
document.getElementById("estadoPauta");

const nomePauta =
document.getElementById("nomePauta");

/* ============================================================
DADOS
============================================================ */

let todasTurmas = [];

let turmaSelecionada = null;

let alunos = [];

let notasDaTurma = [];

let disciplinas = [];

let cicloSelecionado = "";

/* ============================================================
TRIMESTRES
============================================================ */

const trimestres = [1, 2, 3];

/* ============================================================
CONFIGURAÇÃO DAS DISCIPLINAS
============================================================ */

let disciplinasConfig = {

ensinoPrimario: [],

primeiroCiclo: []

};

/* ============================================================
INICIAR
============================================================ */

document.addEventListener(
"DOMContentLoaded",
iniciar
);

async function iniciar(){

try{

    estadoPauta.textContent =
        "A carregar...";


    await carregarConfiguracaoDisciplinas();

    await carregarTurmas();


    estadoPauta.textContent =
        "Aguardando seleção";


}
catch(error){

    console.error(
        "Erro ao iniciar Pauta Geral:",
        error
    );


    estadoPauta.textContent =
        "Erro ao carregar";

}

}

/* ============================================================
CARREGAR CONFIGURAÇÃO DAS DISCIPLINAS
============================================================ */

async function carregarConfiguracaoDisciplinas(){

try{

    /*
     * Documento esperado:
     *
     * config/disciplinas
     *
     * contendo:
     *
     * ensinoPrimario: [...]
     * primeiroCiclo: [...]
     */

    const ref =
        doc(
            db,
            "config",
            "disciplinas"
        );


    const snap =
        await getDoc(ref);


    if(!snap.exists()){

        console.warn(
            "Documento config/disciplinas não encontrado."
        );


        return;

    }


    const dados =
        snap.data();


    disciplinasConfig.ensinoPrimario =
        Array.isArray(
            dados.ensinoPrimario
        )
            ? dados.ensinoPrimario
            : [];


    disciplinasConfig.primeiroCiclo =
        Array.isArray(
            dados.primeiroCiclo
        )
            ? dados.primeiroCiclo
            : [];


    /*
     * Caso a configuração use objetos
     * em vez de strings.
     */

    disciplinasConfig.ensinoPrimario =
        normalizarListaDisciplinas(
            disciplinasConfig.ensinoPrimario
        );


    disciplinasConfig.primeiroCiclo =
        normalizarListaDisciplinas(
            disciplinasConfig.primeiroCiclo
        );


    console.log(
        "DISCIPLINAS ENSINO PRIMÁRIO:",
        disciplinasConfig.ensinoPrimario
    );


    console.log(
        "DISCIPLINAS 1.º CICLO:",
        disciplinasConfig.primeiroCiclo
    );

}
catch(error){

    console.error(
        "Erro ao carregar disciplinas:",
        error
    );

}

}

/* ============================================================
NORMALIZAR LISTA DE DISCIPLINAS
============================================================ */

function normalizarListaDisciplinas(lista){

return lista
    .map(item => {

        if(
            typeof item === "string"
        ){

            return item.trim();

        }


        if(
            item &&
            typeof item === "object"
        ){

            return (

                item.nome ||

                item.disciplina ||

                item.name ||

                ""

            ).trim();

        }


        return "";

    })
    .filter(Boolean);

}

/* ============================================================
CARREGAR TURMAS
============================================================ */

async function carregarTurmas(){

const snap =
    await getDocs(
        collection(
            db,
            "turmas"
        )
    );


todasTurmas = [];


snap.forEach(item => {

    todasTurmas.push({

        id: item.id,

        ...item.data()

    });

});


console.log(
    "TURMAS:",
    todasTurmas
);


preencherClasses();

}

/* ============================================================
OBTER CLASSE
============================================================ */

function obterClasse(turma){

return (

    turma.classe ||

    turma.nomeClasse ||

    turma.classeNome ||

    turma.nivel ||

    ""

);

}

/* ============================================================
OBTER NOME DA TURMA
============================================================ */

function obterNomeTurma(turma){

return (

    turma.turma ||

    turma.nomeTurma ||

    turma.nome ||

    turma.designacao ||

    ""

);

}

/* ============================================================
DETERMINAR CICLO
============================================================ */

function determinarCiclo(classe){

const texto =
    normalizar(classe);


/*
 * 1ª até 6ª
 * Ensino Primário
 */

const numero =
    extrairNumeroClasse(
        texto
    );


if(
    numero >= 1 &&
    numero <= 6
){

    return "ensinoPrimario";

}


/*
 * 7ª até 9ª
 * Primeiro Ciclo
 */

if(
    numero >= 7 &&
    numero <= 9
){

    return "primeiroCiclo";

}


/*
 * Caso a classe esteja escrita
 * por extenso.
 */

if(
    texto.includes("primeir") &&
    texto.includes("ciclo")
){

    return "primeiroCiclo";

}


return "ensinoPrimario";

}

/* ============================================================
EXTRAIR NÚMERO DA CLASSE
============================================================ */

function extrairNumeroClasse(valor){

const texto =
    String(valor || "")
        .toLowerCase();


const numero =
    texto.match(
        /\d+/
    );


if(numero){

    return Number(
        numero[0]
    );

}


const mapa = {

    "primeira": 1,
    "segunda": 2,
    "terceira": 3,
    "quarta": 4,
    "quinta": 5,
    "sexta": 6,
    "setima": 7,
    "sétima": 7,
    "oitava": 8,
    "nona": 9

};


for(
    const palavra in mapa
){

    if(
        texto.includes(
            palavra
        )
    ){

        return mapa[palavra];

    }

}


return 0;

}

/* ============================================================
PREENCHER CLASSES
============================================================ */

function preencherClasses(){

classeSelect.innerHTML = `

    <option value="">
        -- Selecione a classe --
    </option>

`;


const classes = [];


todasTurmas.forEach(
    turma => {

        const classe =
            obterClasse(turma);


        if(
            classe &&
            !classes.includes(classe)
        ){

            classes.push(
                classe
            );

        }

    }
);


classes.sort(
    (a,b) => {

        return (
            extrairNumeroClasse(a) -
            extrairNumeroClasse(b)
        );

    }
);


classes.forEach(
    classe => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            classe;


        option.textContent =
            classe;


        classeSelect.appendChild(
            option
        );

    }
);

}

/* ============================================================
SELECIONAR CLASSE
============================================================ */

classeSelect.addEventListener(
"change",
() => {

    const classe =
        classeSelect.value;


    turmaSelect.innerHTML = `

        <option value="">
            -- Selecione a turma --
        </option>

    `;


    turmaSelecionada =
        null;

    alunos = [];

    notasDaTurma = [];


    classePauta(
        classe
    );


    if(!classe){

        disciplinas = [];

        limparPauta();

        estadoPauta.textContent =
            "Aguardando seleção";

        return;

    }


    /*
     * Determinar o ciclo
     */

    cicloSelecionado =
        determinarCiclo(
            classe
        );


    /*
     * Carregar SOMENTE as
     * disciplinas deste ciclo.
     */

    disciplinas =
        obterDisciplinasDaClasse(
            classe
        );


    console.log(
        "CLASSE:",
        classe
    );


    console.log(
        "CICLO:",
        cicloSelecionado
    );


    console.log(
        "DISCIPLINAS DA CLASSE:",
        disciplinas
    );


    /*
     * Carregar turmas
     * pertencentes à classe.
     */

    const turmas =
        todasTurmas.filter(
            turma =>
                obterClasse(turma) ===
                classe
        );


    turmas.forEach(
        turma => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                turma.id;


            option.textContent =
                obterNomeTurma(
                    turma
                );


            turmaSelect.appendChild(
                option
            );

        }
    );


    estadoPauta.textContent =
        turmas.length
            ? "Selecione a turma"
            : "Nenhuma turma encontrada";


    /*
     * Atualizar cabeçalho mesmo
     * antes de escolher a turma.
     */

    construirCabecalho();

}

);

/* ============================================================
DISCIPLINAS DA CLASSE
============================================================ */

function obterDisciplinasDaClasse(
classe
){

const ciclo =
    determinarCiclo(
        classe
    );


const lista =
    disciplinasConfig[ciclo] || [];


return [...lista];

}

/* ============================================================
SELECIONAR TURMA
============================================================ */

turmaSelect.addEventListener(
"change",
async () => {

    const id =
        turmaSelect.value;


    if(!id){

        limparPauta();

        return;

    }


    turmaSelecionada =
        todasTurmas.find(
            turma =>
                turma.id === id
        );


    if(!turmaSelecionada){

        return;

    }


    estadoPauta.textContent =
        "A carregar alunos e notas...";


    await carregarAlunos();

    await carregarNotas();

    montarPauta();

}

);

/* ============================================================
INFORMAÇÃO DA PAUTA
============================================================ */

function classePauta(classe){

if(!classe){

    nomePauta.textContent =
        "Nenhuma turma selecionada";

    return;

}


nomePauta.innerHTML = `

    Classe:
    <strong>
        ${escaparHTML(classe)}
    </strong>

`;

}

/* ============================================================
CARREGAR ALUNOS
============================================================ */

async function carregarAlunos(){

alunos = [];


try{

    const ref =
        collection(
            db,
            "turmas",
            turmaSelecionada.id,
            "alunos"
        );


    const snap =
        await getDocs(ref);


    snap.forEach(
        item => {

            alunos.push({

                id: item.id,

                ...item.data()

            });

        }
    );


    alunos.sort(
        (a,b) =>
            Number(
                a.numero || 0
            ) -
            Number(
                b.numero || 0
            )
    );


    console.log(
        "ALUNOS:",
        alunos
    );

}
catch(error){

    console.error(
        "Erro ao carregar alunos:",
        error
    );

}

}

/* ============================================================
CARREGAR NOTAS
============================================================ */

async function carregarNotas(){

notasDaTurma = [];


try{

    const snap =
        await getDocs(
            collection(
                db,
                "notas"
            )
        );


    snap.forEach(
        item => {

            const dados =
                item.data();


            if(
                String(
                    dados.turmaId
                ) !==
                String(
                    turmaSelecionada.id
                )
            ){

                return;

            }


            notasDaTurma.push({

                id: item.id,

                ...dados

            });

        }
    );


    console.log(
        "NOTAS DA TURMA:",
        notasDaTurma
    );

}
catch(error){

    console.error(
        "Erro ao carregar notas:",
        error
    );

}

}

/* ============================================================
MONTAR PAUTA
============================================================ */

function montarPauta(){

construirCabecalho();


if(
    alunos.length === 0
){

    pautaLista.innerHTML = `

        <tr>

            <td
                colspan="100"
                class="estado-vazio"
            >

                📋
                Esta turma não possui alunos.

            </td>

        </tr>

    `;


    estadoPauta.textContent =
        "Sem alunos";


    return;

}


construirLinhas();


estadoPauta.textContent =
    `${alunos.length} aluno(s) • ${disciplinas.length} disciplina(s)`;

}

/* ============================================================
CABEÇALHO
============================================================ */

function construirCabecalho(){

const tabela =
    document.querySelector(
        ".tabela-pauta"
    );


if(!tabela){

    return;

}


const thead =
    tabela.querySelector(
        "thead"
    );


if(!thead){

    return;

}


thead.innerHTML = "";


/* ========================================================
   LINHA 1
======================================================== */

const linha1 =
    document.createElement(
        "tr"
    );


linha1.innerHTML = `

    <th
        rowspan="3"
        class="numero"
    >
        Nº
    </th>

    <th
        rowspan="3"
        class="nome-aluno"
    >
        Nome Completo
    </th>

    <th
        rowspan="3"
        class="sexo"
    >
        Sexo
    </th>

    <th
        rowspan="3"
        class="idade"
    >
        Idade
    </th>

`;


disciplinas.forEach(
    disciplina => {

        linha1.innerHTML += `

            <th
                colspan="9"
                class="disciplina"
            >
                ${escaparHTML(
                    disciplina
                )}
            </th>

        `;

    }
);


linha1.innerHTML += `

    <th
        rowspan="3"
        class="resultado"
    >
        Média Final
    </th>

    <th
        rowspan="3"
        class="resultado"
    >
        Resultado
    </th>

`;


thead.appendChild(
    linha1
);


/* ========================================================
   LINHA 2
======================================================== */

const linha2 =
    document.createElement(
        "tr"
    );


disciplinas.forEach(
    () => {

        linha2.innerHTML += `

            <th
                colspan="3"
                class="trimestre"
            >
                1.º Trimestre
            </th>

            <th
                colspan="3"
                class="trimestre"
            >
                2.º Trimestre
            </th>

            <th
                colspan="3"
                class="trimestre"
            >
                3.º Trimestre
            </th>

        `;

    }
);


thead.appendChild(
    linha2
);


/* ========================================================
   LINHA 3
======================================================== */

const linha3 =
    document.createElement(
        "tr"
    );


disciplinas.forEach(
    () => {

        trimestres.forEach(
            () => {

                linha3.innerHTML += `

                    <th class="subcoluna">
                        MAC
                    </th>

                    <th class="subcoluna">
                        NPT
                    </th>

                    <th class="subcoluna">
                        MF
                    </th>

                `;

            }
        );

    }
);


thead.appendChild(
    linha3
);

}

/* ============================================================
CONSTRUIR LINHAS
============================================================ */

function construirLinhas(){

pautaLista.innerHTML = "";


alunos.forEach(
    (aluno,index) => {

        const tr =
            document.createElement(
                "tr"
            );


        const numero =
            aluno.numero ??
            index + 1;


        const nome =
            aluno.nome ||
            aluno.nomeCompleto ||
            "";


        const sexo =
            aluno.sexo ||
            aluno.Sexo ||
            "—";


        const idade =
            obterIdade(
                aluno
            );


        tr.innerHTML = `

            <td class="numero">
                ${escaparHTML(numero)}
            </td>

            <td class="nome-aluno">
                ${escaparHTML(nome)}
            </td>

            <td class="sexo">
                ${escaparHTML(sexo)}
            </td>

            <td class="idade">
                ${escaparHTML(idade)}
            </td>

        `;


        /*
         * DISCIPLINAS
         */

        disciplinas.forEach(
            disciplina => {

                trimestres.forEach(
                    trimestre => {

                        const nota =
                            procurarNota(
                                aluno.numero,
                                disciplina,
                                trimestre
                            );


                        tr.innerHTML += `

                            <td class="nota">
                                ${mostrarNota(
                                    nota?.MAC
                                )}
                            </td>

                            <td class="nota">
                                ${mostrarNota(
                                    nota?.NPT
                                )}
                            </td>

                            <td class="nota mf">
                                ${mostrarNota(
                                    nota?.MF
                                )}
                            </td>

                        `;

                    }
                );

            }
        );


        /*
         * MÉDIA FINAL
         */

        const mediaFinal =
            calcularMediaFinal(
                aluno.numero
            );


        tr.innerHTML += `

            <td class="resultado">
                ${mediaFinal}
            </td>

        `;


        /*
         * RESULTADO
         */

        const resultado =
            determinarResultado(
                mediaFinal
            );


        tr.innerHTML += `

            <td class="resultado">
                ${resultado}
            </td>

        `;


        pautaLista.appendChild(
            tr
        );

    }
);

}

/* ============================================================
PROCURAR NOTA
============================================================ */

function procurarNota( numeroAluno, disciplina, trimestre ){
const lancamento =
    notasDaTurma.find(
        nota => {

            return (

                normalizar(
                    nota.disciplina
                ) ===
                normalizar(
                    disciplina
                )

                &&

                String(
                    nota.trimestre
                ) ===
                String(
                    trimestre
                )

            );

        }
    );


if(!lancamento){

    return null;

}


const alunoNota =
    (
        lancamento.alunos || []
    ).find(
        aluno =>

            String(
                aluno.numero
            ) ===
            String(
                numeroAluno
            )
    );


return alunoNota || null;
}
/* ============================================================ MÉDIA FINAL ============================================================ */
function calcularMediaFinal( numeroAluno ){
/*
 * Só calcula usando MF existentes.
 *
 * Trimestres ainda não concluídos
 * ficam fora do cálculo.
 */

const medias = [];


disciplinas.forEach(
    disciplina => {

        trimestres.forEach(
            trimestre => {

                const nota =
                    procurarNota(
                        numeroAluno,
                        disciplina,
                        trimestre
                    );


                if(
                    nota &&
                    nota.MF !== undefined &&
                    nota.MF !== null &&
                    nota.MF !== ""
                ){

                    const valor =
                        Number(
                            nota.MF
                        );


                    if(
                        Number.isFinite(
                            valor
                        )
                    ){

                        medias.push(
                            valor
                        );

                    }

                }

            }
        );

    }
);


if(
    medias.length === 0
){

    return "—";

}


const soma =
    medias.reduce(
        (
            total,
            valor
        ) =>
            total + valor,
        0
    );


const media =
    soma / medias.length;


return formatarNumero(
    media
);
}
/* ============================================================ RESULTADO ============================================================ */
function determinarResultado( mediaFinal ){
if(
    mediaFinal === "—"
){

    return "—";

}


const valor =
    Number(
        String(
            mediaFinal
        ).replace(",",".")
    );


if(
    !Number.isFinite(
        valor
    )
){

    return "—";

}


return valor >= 10
    ? "APTO"
    : "NÃO APTO";
}
/* ============================================================ IDADE ============================================================ */
function obterIdade(aluno){
if(
    aluno.idade !== undefined &&
    aluno.idade !== null &&
    aluno.idade !== ""
){

    return aluno.idade;

}


if(
    aluno.Idade !== undefined &&
    aluno.Idade !== null &&
    aluno.Idade !== ""
){

    return aluno.Idade;

}


const nascimento =
    aluno.dataNascimento ||
    aluno.dataNasc ||
    aluno.nascimento;


if(!nascimento){

    return "—";

}


const data =
    converterData(
        nascimento
    );


if(!data){

    return "—";

}


const hoje =
    new Date();


let idade =
    hoje.getFullYear() -
    data.getFullYear();


const mes =
    hoje.getMonth() -
    data.getMonth();


if(
    mes < 0 ||
    (
        mes === 0 &&
        hoje.getDate() <
        data.getDate()
    )
){

    idade--;

}


return idade;
}
/* ============================================================ CONVERTER DATA ============================================================ */
function converterData(valor){
if(
    valor instanceof Date
){

    return valor;

}


if(
    valor &&
    typeof valor.toDate ===
    "function"
){

    return valor.toDate();

}


const texto =
    String(valor);


const partes =
    texto.split("/");


if(
    partes.length === 3
){

    const dia =
        Number(
            partes[0]
        );


    const mes =
        Number(
            partes[1]
        ) - 1;


    const ano =
        Number(
            partes[2]
        );


    const data =
        new Date(
            ano,
            mes,
            dia
        );


    if(
        !isNaN(
            data.getTime()
        )
    ){

        return data;

    }

}


const data =
    new Date(
        valor
    );


return isNaN(
    data.getTime()
)
    ? null
    : data;
}
/* ============================================================ MOSTRAR NOTA ============================================================ */
function mostrarNota(valor){
if(
    valor === undefined ||
    valor === null ||
    valor === ""
){

    return "—";

}


return formatarNumero(
    valor
);
}
/* ============================================================ FORMATAR NÚMERO ============================================================ */
function formatarNumero(valor){
const numero =
    Number(
        String(valor)
            .replace(",",".")
    );


if(
    !Number.isFinite(
        numero
    )
){

    return "—";

}


return Number.isInteger(
    numero
)
    ? String(numero)
    : numero.toFixed(1);
}
/* ============================================================ NORMALIZAR TEXTO ============================================================ */
function normalizar(texto){
return String(
    texto || ""
)
.normalize("NFD")
.replace(
    /[\u0300-\u036f]/g,
    ""
)
.toLowerCase()
.trim();
}
/* ============================================================ ESCAPAR HTML ============================================================ */
function escaparHTML(valor){
return String(
    valor ?? ""
)
.replace(
    /&/g,
    "&amp;"
)
.replace(
    /</g,
    "&lt;"
)
.replace(
    />/g,
    "&gt;"
)
.replace(
    /"/g,
    "&quot;"
)
.replace(
    /'/g,
    "&#039;"
);
}
/* ============================================================ LIMPAR PAUTA ============================================================ */
function limparPauta(){
pautaLista.innerHTML = `

    <tr>

        <td
            colspan="100"
            class="estado-vazio"
        >

            📋

            Selecione uma classe e uma turma
            para carregar a pauta.

        </td>

    </tr>

`;
}
/* ============================================================ DEBUG ============================================================ */
window.pautasSGE = {
carregarTurmas,

carregarAlunos,

carregarNotas,

montarPauta,

procurarNota,

calcularMediaFinal,

determinarResultado
};
alert( "PAUTAS.JS CARREGADO ✅" );
