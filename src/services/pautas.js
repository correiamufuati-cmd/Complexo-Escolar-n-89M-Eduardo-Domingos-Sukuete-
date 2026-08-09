/* ============================================================
PAUTAS.JS
PAUTA GERAL - SGE

Lê diretamente as notas gravadas pelo MINI-PAUTA.JS

Estrutura utilizada:

notas/
turmaId_disciplina_trimestre
turmaId
turmaNome
disciplina
trimestre
alunos: [
{
numero,
nome,
MAC,
NPT,
MF,
classificacao
}
]

============================================================ */

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

const nomeEscola =
document.getElementById("nomeEscola");

const anoLectivo =
document.getElementById("anoLectivo");

const classePauta =
document.getElementById("classePauta");

const turmaPauta =
document.getElementById("turmaPauta");

const estadoPauta =
document.getElementById("estadoPauta");

/* ============================================================
DADOS
============================================================ */

let todasTurmas = [];

let turmaSelecionada = null;

let alunos = [];

let notasDaTurma = [];

let disciplinas = [];

/* ============================================================
TRIMESTRES
============================================================ */

const trimestres = [1, 2, 3];

/* ============================================================
INICIALIZAÇÃO
============================================================ */

document.addEventListener(
"DOMContentLoaded",
iniciar
);

async function iniciar(){

try{

    estadoPauta.textContent =
        "A carregar...";


    await carregarConfiguracao();

    await carregarTurmas();


    estadoPauta.textContent =
        "Aguardando seleção";


}
catch(error){

    console.error(
        "Erro ao iniciar Pautas:",
        error
    );


    estadoPauta.textContent =
        "Erro ao carregar";

}

}

/* ============================================================
CONFIGURAÇÃO DA ESCOLA
============================================================ */

async function carregarConfiguracao(){

try{

    /*
     * Documento:
     * config/escola
     */

    const ref =
        doc(
            db,
            "config",
            "escola"
        );


    const snap =
        await getDoc(ref);


    if(snap.exists()){

        const dados =
            snap.data();


        const nome =
            dados.nomeEscola ||
            dados.nome ||
            dados.nomeDaEscola;


        const ano =
            dados.anoLectivo ||
            dados.anoLetivo ||
            dados.anoLetivoAtual;


        if(nome){

            nomeEscola.textContent =
                nome;

        }


        if(ano){

            anoLectivo.textContent =
                ano;

        }

    }


}
catch(error){

    console.warn(
        "Configuração não encontrada:",
        error
    );

}

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
OBTER TURMA
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
CLASSES
============================================================ */

function preencherClasses(){

classeSelect.innerHTML = `

    <option value="">
        -- Selecione a classe --
    </option>

`;


const classes = [];


todasTurmas.forEach(turma => {

    const classe =
        obterClasse(turma);


    if(
        classe &&
        !classes.includes(classe)
    ){

        classes.push(classe);

    }

});


classes.sort(
    ordenarClasses
);


classes.forEach(classe => {

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

});

}

/* ============================================================
ORDENAR CLASSES
============================================================ */

function ordenarClasses(a,b){

const numeroA =
    parseInt(
        String(a)
            .replace(/\D/g,"")
    ) || 999;


const numeroB =
    parseInt(
        String(b)
            .replace(/\D/g,"")
    ) || 999;


return numeroA - numeroB;

}

/* ============================================================
SELEÇÃO DA CLASSE
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

    disciplinas = [];


    classePauta.textContent =
        classe || "—";


    turmaPauta.textContent =
        "—";


    limparPauta();


    if(!classe){

        estadoPauta.textContent =
            "Aguardando seleção";

        return;

    }


    const turmas =
        todasTurmas.filter(
            turma =>
                obterClasse(turma) ===
                classe
        );


    turmas.forEach(turma => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            turma.id;


        option.textContent =
            obterNomeTurma(turma);


        turmaSelect.appendChild(
            option
        );

    });


    estadoPauta.textContent =
        turmas.length
            ? "Selecione a turma"
            : "Nenhuma turma encontrada";

}

);

/* ============================================================
SELEÇÃO DA TURMA
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


    classePauta.textContent =
        obterClasse(
            turmaSelecionada
        );


    turmaPauta.textContent =
        obterNomeTurma(
            turmaSelecionada
        );


    estadoPauta.textContent =
        "A carregar alunos e notas...";


    await carregarAlunos();


    await carregarNotas();


    montarPauta();

}

);

/* ============================================================
CARREGAR ALUNOS
============================================================ */

async function carregarAlunos(){

alunos = [];


try{

    /*
     * Os alunos estão exatamente aqui,
     * conforme o mini-pauta.js:
     *
     * turmas/{turmaId}/alunos
     */

    const ref =
        collection(
            db,
            "turmas",
            turmaSelecionada.id,
            "alunos"
        );


    const snap =
        await getDocs(ref);


    snap.forEach(item => {

        alunos.push({

            id: item.id,

            ...item.data()

        });

    });


    alunos.sort(
        (a,b) =>
            Number(a.numero || 0) -
            Number(b.numero || 0)
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
CARREGAR TODAS AS NOTAS DA TURMA
============================================================ */

async function carregarNotas(){

notasDaTurma = [];


disciplinas = [];


try{

    const snap =
        await getDocs(
            collection(
                db,
                "notas"
            )
        );


    snap.forEach(item => {

        const dados =
            item.data();


        /*
         * IMPORTANTE:
         *
         * Só queremos notas desta turma.
         */

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


        /*
         * Descobrir disciplinas
         * automaticamente.
         */

        const disciplina =
            dados.disciplina;


        if(
            disciplina &&
            !disciplinas.includes(
                disciplina
            )
        ){

            disciplinas.push(
                disciplina
            );

        }

    });


    console.log(
        "NOTAS DA TURMA:",
        notasDaTurma
    );


    console.log(
        "DISCIPLINAS:",
        disciplinas
    );


    disciplinas.sort(
        ordenarTexto
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
ORDENAR TEXTO
============================================================ */

function ordenarTexto(a,b){

return String(a)
    .localeCompare(
        String(b),
        "pt"
    );

}

/* ============================================================
MONTAR PAUTA
============================================================ */

function montarPauta(){

/*
 * Se não existem alunos
 */

if(alunos.length === 0){

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


/*
 * Se ainda não existem notas
 */

if(disciplinas.length === 0){

    construirCabecalho([]);


    pautaLista.innerHTML = `

        <tr>

            <td
                colspan="100"
                class="estado-vazio"
            >

                📝
                Os alunos já estão carregados,
                mas ainda não existem notas
                lançadas para esta turma.

            </td>

        </tr>

    `;


    estadoPauta.textContent =
        "Sem notas lançadas";


    return;

}


construirCabecalho(
    disciplinas
);


construirLinhas();


estadoPauta.textContent =
    `${alunos.length} aluno(s) • ${disciplinas.length} disciplina(s)`;

}

/* ============================================================
CABEÇALHO DINÂMICO
============================================================ */

function construirCabecalho(
listaDisciplinas
){

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


/*
 * ========================================================
 * LINHA 1
 * ========================================================
 */

const linha1 =
    document.createElement("tr");


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
        Nome do Aluno
    </th>

`;


listaDisciplinas.forEach(
    disciplina => {

        linha1.innerHTML += `

            <th
                colspan="9"
                class="disciplina"
            >
                ${escaparHTML(disciplina)}
            </th>

        `;

    }
);


linha1.innerHTML += `

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


/*
 * ========================================================
 * LINHA 2
 * ========================================================
 */

const linha2 =
    document.createElement("tr");


/*
 * Como Nº e Nome têm rowspan=3,
 * não criamos células para eles.
 */

listaDisciplinas.forEach(
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


/*
 * ========================================================
 * LINHA 3
 * ========================================================
 */

const linha3 =
    document.createElement("tr");


listaDisciplinas.forEach(
    () => {

        for(
            let i = 0;
            i < 3;
            i++
        ){

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

    }
);


thead.appendChild(
    linha3
);

}

/* ============================================================
CONSTRUIR LINHAS DOS ALUNOS
============================================================ */

function construirLinhas(){

pautaLista.innerHTML = "";


alunos.forEach(
    (aluno,index) => {

        const tr =
            document.createElement(
                "tr"
            );


        /*
         * Nº
         */

        const numero =
            aluno.numero ??
            index + 1;


        tr.innerHTML += `

            <td class="numero">
                ${escaparHTML(numero)}
            </td>

            <td class="nome-aluno">
                ${escaparHTML(
                    aluno.nome || ""
                )}
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


                        /*
                         * MAC
                         */

                        tr.innerHTML += `

                            <td class="nota">
                                ${mostrarNota(
                                    nota?.MAC
                                )}
                            </td>

                        `;


                        /*
                         * NPT
                         */

                        tr.innerHTML += `

                            <td class="nota">
                                ${mostrarNota(
                                    nota?.NPT
                                )}
                            </td>

                        `;


                        /*
                         * MF
                         */

                        tr.innerHTML += `

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
         * RESULTADO FINAL
         */

        const resultado =
            calcularResultado(
                aluno.numero
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

function procurarNota(
numeroAluno,
disciplina,
trimestre
){

/*
 * Encontrar o lançamento correto:
 *
 * mesma turma
 * mesma disciplina
 * mesmo trimestre
 */

const lancamento =
    notasDaTurma.find(
        nota => {

            const mesmaDisciplina =
                normalizar(
                    nota.disciplina
                ) ===
                normalizar(
                    disciplina
                );


            const mesmoTrimestre =
                String(
                    nota.trimestre
                ) ===
                String(
                    trimestre
                );


            return (
                mesmaDisciplina &&
                mesmoTrimestre
            );

        }
    );


if(!lancamento){

    return null;

}


/*
 * Encontrar aluno
 * dentro do array alunos[]
 */

const alunoNota =
    (lancamento.alunos || [])
        .find(
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

/* ============================================================
RESULTADO FINAL
============================================================ */

function calcularResultado(
numeroAluno
){

const medias = [];


disciplinas.forEach(
    disciplina => {

        /*
         * Aqui usamos apenas os trimestres
         * que realmente têm MF.
         */

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

                    const mf =
                        Number(
                            nota.MF
                        );


                    if(
                        Number.isFinite(
                            mf
                        )
                    ){

                        medias.push(
                            mf
                        );

                    }

                }

            }
        );

    }
);


if(medias.length === 0){

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


const resultado =
    soma / medias.length;


return formatarNumero(
    resultado
);

}

/* ============================================================
MOSTRAR NOTA
============================================================ */

function mostrarNota(
valor
){

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
function formatarNumero( valor ){
const numero =
    Number(
        String(valor)
            .replace(",",".")
    );


if(
    !Number.isFinite(numero)
){

    return "—";

}


return Number.isInteger(numero)
    ? String(numero)
    : numero.toFixed(1);
}
/* ============================================================ NORMALIZAR TEXTO ============================================================ */
function normalizar( texto ){
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
function escaparHTML( valor ){
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
/* ============================================================ DISPONIBILIZAR PARA DEBUG ============================================================ */
window.pautasSGE = {
carregarTurmas,

carregarAlunos,

carregarNotas,

montarPauta,

procurarNota
};
alert( "PAUTAS.JS CARREGADO ✅" );
