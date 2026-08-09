/* ============================================================
PAUTAS GERAIS - SGE

Funções:

- Carregar classes
- Carregar turmas
- Carregar alunos
- Mostrar escola
- Mostrar ano lectivo
- Mostrar classe
- Mostrar turma
- Construir pauta
- MAC / NPT / MF
- 3 trimestres
- Preparado para várias disciplinas
  ============================================================ */

import { app } from "./firebase.js";

import {
getFirestore,
collection,
getDocs,
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

/* ============================================================
FIRESTORE
============================================================ */

const db = getFirestore(app);

/* ============================================================
ELEMENTOS HTML
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

let disciplinas = [];

/* ============================================================
CONFIGURAÇÃO PADRÃO
============================================================ */

const disciplinasPadrao = [

"Matemática",

"Língua Portuguesa",

"Estudo do Meio",

"Educação Física",

"Educação Moral e Cívica",

"Educação Visual e Plástica",

"Língua Inglesa",

"Ciências da Natureza",

"História",

"Geografia"

];

/* ============================================================
INICIALIZAÇÃO
============================================================ */

document.addEventListener(
"DOMContentLoaded",
iniciarPautas
);

async function iniciarPautas(){

try{

    estadoPauta.textContent =
        "A carregar...";


    await carregarConfiguracao();


    await carregarTurmas();


    estadoPauta.textContent =
        "Aguardando seleção";


}catch(error){

    console.error(
        "Erro ao iniciar pautas:",
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
     * Primeiro tenta a coleção config
     */

    const configRef =
        doc(db, "config", "escola");

    const configSnap =
        await getDoc(configRef);


    if(configSnap.exists()){

        const dados =
            configSnap.data();


        if(
            dados.nomeEscola ||
            dados.nome
        ){

            nomeEscola.textContent =
                dados.nomeEscola ||
                dados.nome;

        }


        if(
            dados.anoLectivo ||
            dados.anoLetivo ||
            dados.anoLetivoAtual
        ){

            anoLectivo.textContent =
                dados.anoLectivo ||
                dados.anoLetivo ||
                dados.anoLetivoAtual;

        }

    }


    /*
     * Caso a configuração tenha outro documento,
     * tenta também "geral".
     */

    const geralRef =
        doc(db, "config", "geral");

    const geralSnap =
        await getDoc(geralRef);


    if(geralSnap.exists()){

        const dados =
            geralSnap.data();


        if(
            nomeEscola.textContent ===
            "COMPLEXO ESCOLAR Nº 89M \"EDUARDO DOMINGOS SUKUETE\"" &&
            (
                dados.nomeEscola ||
                dados.nome
            )
        ){

            nomeEscola.textContent =
                dados.nomeEscola ||
                dados.nome;

        }


        if(
            (
                !anoLectivo.textContent ||
                anoLectivo.textContent === "2026"
            ) &&
            (
                dados.anoLectivo ||
                dados.anoLetivo ||
                dados.anoLetivoAtual
            )
        ){

            anoLectivo.textContent =
                dados.anoLectivo ||
                dados.anoLetivo ||
                dados.anoLetivoAtual;

        }

    }


}catch(error){

    console.warn(
        "Não foi possível carregar configuração:",
        error
    );

}

}

/* ============================================================
CARREGAR TURMAS
============================================================ */

async function carregarTurmas(){

const snapshot =
    await getDocs(
        collection(db, "turmas")
    );


todasTurmas = [];


snapshot.forEach(item => {

    const dados =
        item.data();


    todasTurmas.push({

        id: item.id,

        ...dados

    });

});


console.log(
    "Turmas encontradas:",
    todasTurmas
);


preencherClasses();

}

/* ============================================================
IDENTIFICAR CLASSE
============================================================ */

function obterClasse(turma){

return (

    turma.classe ||

    turma.nomeClasse ||

    turma.classeNome ||

    turma.nivel ||

    turma.curso ||

    ""

);

}

/* ============================================================
IDENTIFICAR NOME DA TURMA
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
PREENCHER CLASSES
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


/*
 * Ordenação natural
 */

classes.sort(
    ordenarClasses
);


/*
 * Caso ainda não existam turmas,
 * deixa algumas classes disponíveis.
 */

if(classes.length === 0){

    const classesPadrao = [

        "1.ª Classe",
        "2.ª Classe",
        "3.ª Classe",
        "4.ª Classe",
        "5.ª Classe",
        "6.ª Classe",
        "7.ª Classe",
        "8.ª Classe",
        "9.ª Classe"

    ];


    classesPadrao.forEach(classe => {

        const option =
            document.createElement("option");


        option.value =
            classe;


        option.textContent =
            classe;


        classeSelect.appendChild(
            option
        );

    });


    return;

}


classes.forEach(classe => {

    const option =
        document.createElement("option");


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

function ordenarClasses(a, b){

const numeroA =
    parseInt(
        String(a).replace(/\D/g, "")
    ) || 999;


const numeroB =
    parseInt(
        String(b).replace(/\D/g, "")
    ) || 999;


return numeroA - numeroB;

}

/* ============================================================
EVENTO CLASSE
============================================================ */

classeSelect.addEventListener(
"change",
async () => {

    const classe =
        classeSelect.value;


    turmaSelect.innerHTML = `

        <option value="">
            -- Selecione a turma --
        </option>

    `;


    turmaSelecionada = null;

    alunos = [];


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


    const turmasDaClasse =
        todasTurmas.filter(
            turma =>
                obterClasse(turma) === classe
        );


    turmasDaClasse.forEach(turma => {

        const option =
            document.createElement("option");


        option.value =
            turma.id;


        option.textContent =
            obterNomeTurma(turma);


        turmaSelect.appendChild(
            option
        );

    });


    estadoPauta.textContent =
        turmasDaClasse.length
            ? "Selecione a turma"
            : "Nenhuma turma encontrada";

}

);

/* ============================================================
EVENTO TURMA
============================================================ */

turmaSelect.addEventListener(
"change",
async () => {

    const id =
        turmaSelect.value;


    if(!id){

        turmaSelecionada =
            null;


        turmaPauta.textContent =
            "—";


        limparPauta();


        estadoPauta.textContent =
            "Aguardando seleção";


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


    const classe =
        obterClasse(
            turmaSelecionada
        );


    const turma =
        obterNomeTurma(
            turmaSelecionada
        );


    classePauta.textContent =
        classe || "—";


    turmaPauta.textContent =
        turma || "—";


    estadoPauta.textContent =
        "A carregar pauta...";


    await carregarAlunos(
        turmaSelecionada
    );

}

);

/* ============================================================
CARREGAR ALUNOS
============================================================ */

async function carregarAlunos(turma){

try{

    alunos = [];


    /*
     * 1. Tenta alunos dentro da própria turma
     */

    const alunosSub =
        await getDocs(
            collection(
                db,
                "turmas",
                turma.id,
                "alunos"
            )
        );


    alunosSub.forEach(item => {

        alunos.push({

            id: item.id,

            ...item.data()

        });

    });


    /*
     * 2. Se não encontrou,
     * tenta coleção global "alunos"
     */

    if(alunos.length === 0){

        const alunosGlobal =
            await getDocs(
                collection(
                    db,
                    "alunos"
                )
            );


        alunosGlobal.forEach(item => {

            const dados =
                item.data();


            const turmaId =
                dados.turmaId ||
                dados.idTurma;


            const turmaNome =
                dados.turma ||
                dados.nomeTurma;


            const pertencePorId =
                turmaId === turma.id;


            const pertencePorNome =
                turmaNome ===
                obterNomeTurma(turma);


            if(
                pertencePorId ||
                pertencePorNome
            ){

                alunos.push({

                    id: item.id,

                    ...dados

                });

            }

        });

    }


    /*
     * 3. Ordenar alunos
     */

    alunos.sort(
        ordenarAlunos
    );


    console.log(
        "Alunos da turma:",
        alunos
    );


    construirPauta();


}catch(error){

    console.error(
        "Erro ao carregar alunos:",
        error
    );


    estadoPauta.textContent =
        "Erro ao carregar alunos";


    mostrarMensagem(
        "Não foi possível carregar os alunos."
    );

}

}

/* ============================================================
ORDENAR ALUNOS
============================================================ */

function ordenarAlunos(a, b){

const nomeA =
    obterNomeAluno(a)
        .toUpperCase();


const nomeB =
    obterNomeAluno(b)
        .toUpperCase();


return nomeA.localeCompare(
    nomeB,
    "pt"
);

}

/* ============================================================
NOME DO ALUNO
============================================================ */

function obterNomeAluno(aluno){

return (

    aluno.nome ||

    aluno.nomeAluno ||

    aluno.nomeCompleto ||

    aluno.aluno ||

    "Aluno sem nome"

);

}

/* ============================================================
CONSTRUIR PAUTA
============================================================ */

function construirPauta(){

if(!turmaSelecionada){

    limparPauta();

    return;

}


if(alunos.length === 0){

    mostrarMensagem(
        "Esta turma ainda não possui alunos cadastrados."
    );


    estadoPauta.textContent =
        "Sem alunos";


    return;

}


/*
 * Neste primeiro núcleo usamos as disciplinas
 * configuradas ou as disciplinas padrão.
 *
 * Posteriormente o sistema poderá substituir
 * automaticamente pelas disciplinas da classe.
 */

if(
    !disciplinas ||
    disciplinas.length === 0
){

    disciplinas =
        [...disciplinasPadrao];

}


construirCabecalho();


construirAlunos();


estadoPauta.textContent =
    `${alunos.length} aluno(s)`;

}

/* ============================================================
CONSTRUIR CABEÇALHO DINÂMICO
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


/*
 * LINHA 1
 */

const linha1 =
    document.createElement("tr");


const thNumero =
    criarTH(
        "Nº",
        3,
        1,
        "numero"
    );


const thNome =
    criarTH(
        "Nome do Aluno",
        3,
        1,
        "nome-aluno"
    );


linha1.appendChild(
    thNumero
);


linha1.appendChild(
    thNome
);


disciplinas.forEach(
    disciplina => {

        const th =
            criarTH(
                disciplina,
                1,
                9,
                "disciplina"
            );


        linha1.appendChild(
            th
        );

    }
);


const thResultado =
    criarTH(
        "Resultado",
        3,
        1,
        "resultado"
    );


linha1.appendChild(
    thResultado
);


thead.appendChild(
    linha1
);


/*
 * LINHA 2
 */

const linha2 =
    document.createElement("tr");


disciplinas.forEach(
    () => {

        [
            "1.º Trimestre",
            "2.º Trimestre",
            "3.º Trimestre"
        ].forEach(
            trimestre => {

                const th =
                    criarTH(
                        trimestre,
                        1,
                        3,
                        "trimestre"
                    );


                linha2.appendChild(
                    th
                );

            }
        );

    }
);


/*
 * Como Nº e Nome ocupam rowspan,
 * precisamos de células vazias
 * somente estruturalmente.
 */


linha2.insertBefore(
    document.createElement("th"),
    linha2.firstChild
);


linha2.insertBefore(
    document.createElement("th"),
    linha2.firstChild
);


linha2.appendChild(
    document.createElement("th")
);


thead.appendChild(
    linha2
);


/*
 * LINHA 3
 */

const linha3 =
    document.createElement("tr");


/*
 * duas células correspondentes
 * a Nº e Nome
 */

linha3.appendChild(
    document.createElement("th")
);


linha3.appendChild(
    document.createElement("th")
);


disciplinas.forEach(
    () => {

        for(
            let trimestre = 0;
            trimestre < 3;
            trimestre++
        ){

            [
                "MAC",
                "NPT",
                "MF"
            ].forEach(
                sub => {

                    const th =
                        criarTH(
                            sub,
                            1,
                            1,
                            "subcoluna"
                        );


                    linha3.appendChild(
                        th
                    );

                }
            );

        }

    }
);


linha3.appendChild(
    document.createElement("th")
);


thead.appendChild(
    linha3
);

}

/* ============================================================
CRIAR TH
============================================================ */

function criarTH(
texto,
rowspan,
colspan,
classe
){

const th =
    document.createElement("th");


th.textContent =
    texto;


if(rowspan > 1){

    th.rowSpan =
        rowspan;

}


if(colspan > 1){

    th.colSpan =
        colspan;

}


if(classe){

    th.className =
        classe;

}


return th;

}

/* ============================================================
CONSTRUIR ALUNOS
============================================================ */

function construirAlunos(){

pautaLista.innerHTML = "";


alunos.forEach(
    (aluno, index) => {

        const tr =
            document.createElement("tr");


        /*
         * Nº
         */

        const tdNumero =
            document.createElement("td");


        tdNumero.className =
            "numero";


        tdNumero.textContent =
            index + 1;


        tr.appendChild(
            tdNumero
        );


        /*
         * Nome
         */

        const tdNome =
            document.createElement("td");


        tdNome.className =
            "nome-aluno";


        tdNome.textContent =
            obterNomeAluno(aluno);


        tr.appendChild(
            tdNome
        );


        /*
         * Disciplinas
         */

        disciplinas.forEach(
            disciplina => {

                for(
                    let trimestre = 1;
                    trimestre <= 3;
                    trimestre++
                ){

                    const notas =
                        obterNotas(
                            aluno,
                            disciplina,
                            trimestre
                        );


                    /*
                     * MAC
                     */

                    tr.appendChild(
                        criarNotaCelula(
                            notas.mac,
                            "nota"
                        )
                    );


                    /*
                     * NPT
                     */

                    tr.appendChild(
                        criarNotaCelula(
                            notas.npt,
                            "nota"
                        )
                    );


                    /*
                     * MF
                     */

                    const mf =
                        calcularMF(
                            notas.mac,
                            notas.npt
                        );


                    tr.appendChild(
                        criarNotaCelula(
                            mf,
                            "nota mf"
                        )
                    );

                }

            }
        );


        /*
         * RESULTADO
         */

        const resultado =
            calcularResultadoAluno(
                aluno
            );


        const tdResultado =
            document.createElement("td");


        tdResultado.className =
            "resultado";


        tdResultado.textContent =
            resultado;


        tr.appendChild(
            tdResultado
        );


        pautaLista.appendChild(
            tr
        );

    }
);

}

/* ============================================================
CRIAR CÉLULA DE NOTA
============================================================ */

function criarNotaCelula( valor, classe ){
const td =
    document.createElement("td");


td.className =
    classe;


if(
    valor === null ||
    valor === undefined ||
    valor === ""
){

    td.textContent =
        "—";

}else{

    td.textContent =
        formatarNota(valor);

}


return td;
}
/* ============================================================ OBTER NOTAS ============================================================ */
function obterNotas( aluno, disciplina, trimestre ){
/*
 * Estrutura possível:
 *
 * notas: {
 *   Matemática: {
 *      trimestre1: {
 *          mac: 12,
 *          npt: 14
 *      }
 *   }
 * }
 */


const notas =
    aluno.notas || {};


let disciplinaDados =
    notas[disciplina];


/*
 * Tenta também pelo nome normalizado
 */

if(!disciplinaDados){

    const chave =
        Object.keys(notas)
            .find(
                key =>
                    normalizar(key) ===
                    normalizar(disciplina)
            );


    if(chave){

        disciplinaDados =
            notas[chave];

    }

}


if(!disciplinaDados){

    return {
        mac:null,
        npt:null
    };

}


const trimestreDados =

    disciplinaDados[
        `trimestre${trimestre}`
    ] ||

    disciplinaDados[
        `${trimestre}Trimestre`
    ] ||

    disciplinaDados[
        `T${trimestre}`
    ] ||

    {};


return {

    mac:
        trimestreDados.mac ??
        trimestreDados.MAC ??
        null,

    npt:
        trimestreDados.npt ??
        trimestreDados.NPT ??
        null

};
}
/* ============================================================ CALCULAR MF ============================================================ */
function calcularMF( mac, npt ){
const valorMAC =
    converterNumero(mac);


const valorNPT =
    converterNumero(npt);


/*
 * Se não houver notas,
 * trimestre ainda não concluído.
 */

if(
    valorMAC === null ||
    valorNPT === null
){

    return null;

}


/*
 * MF = (MAC + NPT) / 2
 */

return arredondar(
    (
        valorMAC +
        valorNPT
    ) / 2
);
}
/* ============================================================ RESULTADO FINAL DO ALUNO ============================================================ */
function calcularResultadoAluno( aluno ){
const medias = [];


disciplinas.forEach(
    disciplina => {

        for(
            let trimestre = 1;
            trimestre <= 3;
            trimestre++
        ){

            const notas =
                obterNotas(
                    aluno,
                    disciplina,
                    trimestre
                );


            const mf =
                calcularMF(
                    notas.mac,
                    notas.npt
                );


            if(mf !== null){

                medias.push(
                    mf
                );

            }

        }

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


const mediaFinal =
    soma / medias.length;


return arredondar(
    mediaFinal
);
}
/* ============================================================ CONVERTER NÚMERO ============================================================ */
function converterNumero(valor){
if(
    valor === null ||
    valor === undefined ||
    valor === ""
){

    return null;

}


if(
    typeof valor === "number"
){

    return valor;

}


const numero =
    Number(
        String(valor)
            .replace(",", ".")
            .trim()
    );


return Number.isFinite(numero)
    ? numero
    : null;
}
/* ============================================================ ARREDONDAR ============================================================ */
function arredondar(valor){
return Math.round(
    valor * 10
) / 10;
}
/* ============================================================ FORMATAR NOTA ============================================================ */
function formatarNota(valor){
const numero =
    converterNumero(valor);


if(numero === null){

    return "—";

}


return Number.isInteger(numero)
    ? String(numero)
    : numero.toFixed(1);
}
/* ============================================================ NORMALIZAR TEXTO ============================================================ */
function normalizar(texto){
return String(texto || "")
    .normalize("NFD")
    .replace(
        /[\u0300-\u036f]/g,
        ""
    )
    .toLowerCase()
    .trim();
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
/* ============================================================ MENSAGEM ============================================================ */
function mostrarMensagem( mensagem ){
pautaLista.innerHTML = `

    <tr>

        <td
            colspan="100"
            class="estado-vazio"
        >

            📋
            ${mensagem}

        </td>

    </tr>

`;
}
/* ============================================================ EXPORTAÇÃO ============================================================ */
window.pautasSGE = {
carregarTurmas,

carregarAlunos,

construirPauta
  
};
