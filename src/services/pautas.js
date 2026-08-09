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

let dadosEscola = {};

/* ============================================================
CONFIGURAÇÃO
============================================================ */

const trimestres = [1, 2, 3];

let disciplinasConfig = {

ensinoPrimario: [],

primeiroCiclo: []

};

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


    await carregarDadosEscola();

    await carregarConfiguracaoDisciplinas();

    await carregarTurmas();

    atualizarInformacaoPauta();


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
DADOS DA ESCOLA
============================================================ */

async function carregarDadosEscola(){

try{

    /*
     * Tentativa principal:
     *
     * config/escola
     */

    let snap =
        await getDoc(
            doc(
                db,
                "config",
                "escola"
            )
        );


    /*
     * Caso não exista, tentar config/geral
     */

    if(!snap.exists()){

        snap =
            await getDoc(
                doc(
                    db,
                    "config",
                    "geral"
                )
            );

    }


    if(snap.exists()){

        dadosEscola =
            snap.data();

    }


    /*
     * Algumas estruturas podem guardar
     * o nome da escola com nomes diferentes.
     */

    const nome =
        dadosEscola.nome ||
        dadosEscola.nomeEscola ||
        dadosEscola.escola ||
        'Complexo Escolar Nº 89M "Eduardo Domingos Sukuete"';


    const ano =
        dadosEscola.anoLetivoAtual ||
        dadosEscola.anoLectivo ||
        dadosEscola.anoLetivo ||
        new Date().getFullYear();


    const nomeEscola =
        document.getElementById(
            "nomeEscola"
        );


    const anoLetivo =
        document.getElementById(
            "anoLetivo"
        );


    if(nomeEscola){

        nomeEscola.textContent =
            nome;

    }


    if(anoLetivo){

        anoLetivo.textContent =
            `Ano Lectivo: ${ano}`;

    }


}
catch(error){

    console.error(
        "Erro ao carregar dados da escola:",
        error
    );

}

}

/* ============================================================
CONFIGURAÇÃO DAS DISCIPLINAS
============================================================ */

async function carregarConfiguracaoDisciplinas(){

try{

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
            "config/disciplinas não encontrado."
        );

        return;

    }


    const dados =
        snap.data();


    disciplinasConfig.ensinoPrimario =
        normalizarListaDisciplinas(
            dados.ensinoPrimario || []
        );


    disciplinasConfig.primeiroCiclo =
        normalizarListaDisciplinas(
            dados.primeiroCiclo || []
        );


    console.log(
        "Ensino Primário:",
        disciplinasConfig.ensinoPrimario
    );


    console.log(
        "1.º Ciclo:",
        disciplinasConfig.primeiroCiclo
    );

}
catch(error){

    console.error(
        "Erro nas disciplinas:",
        error
    );

}

}

/* ============================================================
NORMALIZAR DISCIPLINAS
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
DETERMINAR CICLO
============================================================ */

function determinarCiclo(classe){

const numero =
    extrairNumeroClasse(
        classe
    );


if(
    numero >= 1 &&
    numero <= 6
){

    return "ensinoPrimario";

}


if(
    numero >= 7 &&
    numero <= 9
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
    normalizar(
        valor
    );


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

    primeira:1,

    segunda:2,

    terceira:3,

    quarta:4,

    quinta:5,

    sexta:6,

    setima:7,

    oitava:8,

    nona:9

};


for(
    const palavra in mapa
){

    if(
        texto.includes(
            palavra
        )
    ){

        return mapa[
            palavra
        ];

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
            obterClasse(
                turma
            );


        if(
            classe &&
            !classes.includes(
                classe
            )
        ){

            classes.push(
                classe
            );

        }

    }
);


classes.sort(
    (
        a,
        b
    ) =>
        extrairNumeroClasse(a) -
        extrairNumeroClasse(b)
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


    if(!classe){

        disciplinas = [];

        limparPauta();

        atualizarInformacaoPauta();

        estadoPauta.textContent =
            "Aguardando seleção";

        return;

    }


    cicloSelecionado =
        determinarCiclo(
            classe
        );


    disciplinas =
        disciplinasConfig[
            cicloSelecionado
        ] || [];


    console.log(
        "Classe:",
        classe
    );


    console.log(
        "Ciclo:",
        cicloSelecionado
    );


    console.log(
        "Disciplinas:",
        disciplinas
    );


    const turmas =
        todasTurmas.filter(
            turma =>
                String(
                    obterClasse(
                        turma
                    )
                ) ===
                String(
                    classe
                )
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


    construirCabecalho();

    atualizarInformacaoPauta();


    estadoPauta.textContent =
        turmas.length
            ? "Selecione a turma"
            : "Nenhuma turma encontrada";

}

);

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
        "A carregar pauta...";


    await carregarAlunos();

    await carregarNotas();


    atualizarInformacaoPauta();

    montarPauta();

}

);

/* ============================================================
INFORMAÇÃO DA PAUTA
============================================================ */

function atualizarInformacaoPauta(){

const escola =
    document.getElementById(
        "nomeEscola"
    );


const ano =
    document.getElementById(
        "anoLetivo"
    );


const classe =
    document.getElementById(
        "classeInfo"
    );


const turma =
    document.getElementById(
        "turmaInfo"
    );


if(escola){

    escola.textContent =
        dadosEscola.nome ||
        dadosEscola.nomeEscola ||
        dadosEscola.escola ||
        'Complexo Escolar Nº 89M "Eduardo Domingos Sukuete"';

}


if(ano){

    ano.textContent =
        `Ano Lectivo: ${
            dadosEscola.anoLetivoAtual ||
            dadosEscola.anoLectivo ||
            dadosEscola.anoLetivo ||
            new Date().getFullYear()
        }`;

}


if(classe){

    classe.textContent =
        `Classe: ${
            classeSelect.value || "—"
        }`;

}


if(turma){

    turma.textContent =
        `Turma: ${
            turmaSelecionada
                ? obterNomeTurma(
                    turmaSelecionada
                )
                : "—"
        }`;

}


if(nomePauta){

    if(
        turmaSelecionada
    ){

        nomePauta.textContent =
            `${classeSelect.value} — ${
                obterNomeTurma(
                    turmaSelecionada
                )
            }`;

    }
    else{

        nomePauta.textContent =
            "Nenhuma turma selecionada";

    }

}

}

/* ============================================================
CARREGAR ALUNOS
============================================================ */

async function carregarAlunos(){

alunos = [];


try{

    const snap =
        await getDocs(
            collection(
                db,
                "turmas",
                turmaSelecionada.id,
                "alunos"
            )
        );


    snap.forEach(
        item => {

            alunos.push({

                id:item.id,

                ...item.data()

            });

        }
    );


    alunos.sort(
        (
            a,
            b
        ) =>
            Number(
                a.numero || 0
            ) -
            Number(
                b.numero || 0
            )
    );


}
catch(error){

    console.error(
        "Erro alunos:",
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

                id:item.id,

                ...dados

            });

        }
    );

}
catch(error){

    console.error(
        "Erro notas:",
        error
    );

}

}

/* ============================================================
CONSTRUIR PAUTA
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

                📋 Nenhum aluno encontrado.

            </td>

        </tr>

    `;

    return;

}


pautaLista.innerHTML = "";


alunos.forEach(
    (
        aluno,
        index
    ) => {

        const linha =
            document.createElement(
                "tr"
            );


        const numero =
            aluno.numero ??
            index + 1;


        const nome =
            aluno.nome ||
            aluno.nomeCompleto ||
            aluno.Nome ||
            "";


        const sexo =
            aluno.sexo ||
            aluno.Sexo ||
            "—";


        const idade =
            obterIdade(
                aluno
            );


        linha.innerHTML = `

            <td class="numero">
                ${escaparHTML(numero)}
            </td>

            <td class="nome-aluno">
                ${escaparHTML(nome)}
            </td>

            <td>
                ${escaparHTML(sexo)}
            </td>

            <td>
                ${escaparHTML(idade)}
            </td>

        `;


        disciplinas.forEach(
            disciplina => {

                trimestres.forEach(
                    trimestre => {

                        const nota =
                            procurarNota(
                                numero,
                                disciplina,
                                trimestre
                            );


                        linha.innerHTML += `

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


        const mediaFinal =
            calcularMediaFinal(
                numero
            );


        const observacao =
            determinarResultado(
                mediaFinal
            );


        linha.innerHTML += `

            <td class="resultado">
                ${mediaFinal}
            </td>

            <td class="resultado">
                ${observacao}
            </td>

        `;


        pautaLista.appendChild(
            linha
        );

    }
);


estadoPauta.textContent =
    `${alunos.length} aluno(s) • ${disciplinas.length} disciplina(s)`;

}

/* ============================================================
CONSTRUIR CABEÇALHO
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


/* -------------------------------
   LINHA 1
-------------------------------- */

const linha1 =
    document.createElement(
        "tr"
    );


linha1.innerHTML = `

    <th rowspan="3">
        Nº
    </th>

    <th
        rowspan="3"
        class="nome-aluno"
    >
        Nome Completo
    </th>

    <th rowspan="3">
        Sexo
    </th>

    <th rowspan="3">
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
        Observação
    </th>

`;


thead.appendChild(
    linha1
);


/* -------------------------------
   LINHA 2
-------------------------------- */

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


/* -------------------------------
   LINHA 3
-------------------------------- */

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
/* ============================================================ PROCURAR NOTA ============================================================ */
function procurarNota( numero, disciplina, trimestre ){
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


return (
    lancamento.alunos || []
).find(
    aluno =>

        String(
            aluno.numero
        ) ===
        String(
            numero
        )
) || null;
}
/* ============================================================ MÉDIA FINAL ============================================================ */
function calcularMediaFinal( numero ){
const medias = [];


disciplinas.forEach(
    disciplina => {

        trimestres.forEach(
            trimestre => {

                const nota =
                    procurarNota(
                        numero,
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


return formatarNumero(
    soma / medias.length
);
}
/* ============================================================ APROVADO / REPROVADO ============================================================ */
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
    ? "APROVADO"
    : "REPROVADO";
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
    aluno.nascimento ||
    aluno.data_nascimento;


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
    String(
        valor
    );


const partes =
    texto.split("/");


if(
    partes.length === 3
){

    const data =
        new Date(

            Number(
                partes[2]
            ),

            Number(
                partes[1]
            ) - 1,

            Number(
                partes[0]
            )

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
        String(
            valor
        ).replace(
            ",",
            "."
        )
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
/* ============================================================ NORMALIZAR ============================================================ */
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
/* ============================================================ EXPORTAR EXCEL ============================================================ */
document .getElementById("exportarExcel") ?.addEventListener( "click", exportarExcel );
async function exportarExcel(){
if(!turmaSelecionada){

    alert(
        "Selecione primeiro uma classe e uma turma."
    );

    return;

}


try{

    if(!window.XLSX){

        await carregarScript(
            "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"
        );

    }


    const tabela =
        document.querySelector(
            ".tabela-pauta"
        );


    const workbook =
        XLSX.utils.table_to_book(
            tabela,
            {
                sheet:
                    "Pauta Geral"
            }
        );


    const nome =
        classeSelect.value;


    const turma =
        obterNomeTurma(
            turmaSelecionada
        );


    XLSX.writeFile(
        workbook,
        `Pauta Geral - ${nome} - ${turma}.xlsx`
    );

}
catch(error){

    console.error(error);

    alert(
        "Erro ao exportar Excel."
    );

}
}
/* ============================================================ EXPORTAR PDF ============================================================ */
document .getElementById("exportarPDF") ?.addEventListener( "click", exportarPDF );
async function exportarPDF(){
if(!turmaSelecionada){

    alert(
        "Selecione primeiro uma classe e uma turma."
    );

    return;

}


try{

    if(!window.jspdf){

        await carregarScript(
            "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
        );

    }


    await carregarScript(
        "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"
    );


    const {
        jsPDF
    } = window.jspdf;


    const pdf =
        new jsPDF({

            orientation:
                "landscape",

            unit:
                "mm",

            format:
                "a3"

        });


    const classe =
        classeSelect.value;


    const turma =
        obterNomeTurma(
            turmaSelecionada
        );


    pdf.setFontSize(16);

    pdf.text(
        dadosEscola.nome ||
        'Complexo Escolar Nº 89M "Eduardo Domingos Sukuete"',
        15,
        12
    );


    pdf.setFontSize(10);

    pdf.text(
        `Ano Lectivo: ${
            dadosEscola.anoLetivoAtual ||
            new Date().getFullYear()
        }`,
        15,
        18
    );


    pdf.text(
        `Classe: ${classe}    Turma: ${turma}`,
        15,
        24
    );


    pdf.autoTable({

        html:
            document.querySelector(
                ".tabela-pauta"
            ),

        startY:30,

        theme:"grid",

        styles:{

            fontSize:5,

            cellPadding:1,

            halign:"center"

        },

        columnStyles:{

            1:{
                cellWidth:40,
                halign:"left"
            }

        }

    });


    pdf.save(
        `Pauta Geral - ${classe} - ${turma}.pdf`
    );

}
catch(error){

    console.error(error);

    alert(
        "Erro ao exportar PDF."
    );

}
}
/* ============================================================ IMPRIMIR ============================================================ */
document .getElementById("imprimirPauta") ?.addEventListener( "click", imprimirPauta );
function imprimirPauta(){
if(!turmaSelecionada){

    alert(
        "Selecione primeiro uma classe e uma turma."
    );

    return;

}


const tabela =
    document.querySelector(
        ".tabela-pauta"
    );


const janela =
    window.open(
        "",
        "_blank"
    );


if(!janela){

    alert(
        "O navegador bloqueou a impressão."
    );

    return;

}


const classe =
    classeSelect.value;


const turma =
    obterNomeTurma(
        turmaSelecionada
    );


janela.document.write(`

    <!DOCTYPE html>

    <html lang="pt">

    <head>

        <meta charset="UTF-8">

        <title>
            Pauta Geral
        </title>

        <style>

            @page{

                size:A3 landscape;

                margin:8mm;

            }

            body{

                font-family:Arial;

            }

            h2{

                text-align:center;

                margin:0;

            }

            .info{

                text-align:center;

                margin:5px;

            }

            table{

                border-collapse:collapse;

                width:100%;

                font-size:6px;

            }

            th,
            td{

                border:1px solid #000;

                padding:2px;

                text-align:center;

            }

            td:nth-child(2){

                text-align:left;

            }

        </style>

    </head>

    <body>

        <h2>

            ${escaparHTML(
                dadosEscola.nome ||
                'Complexo Escolar Nº 89M "Eduardo Domingos Sukuete"'
            )}

        </h2>

        <div class="info">

            Ano Lectivo:
            ${
                dadosEscola.anoLetivoAtual ||
                new Date().getFullYear()
            }

            &nbsp;&nbsp;

            Classe:
            ${escaparHTML(classe)}

            &nbsp;&nbsp;

            Turma:
            ${escaparHTML(turma)}

        </div>

        ${tabela.outerHTML}

    </body>

    </html>

`);


janela.document.close();


setTimeout(
    () => {

        janela.print();

    },
    500
);
}
/* ============================================================ CARREGAR BIBLIOTECA ============================================================ */
function carregarScript(src){
return new Promise(
    (
        resolve,
        reject
    ) => {

        const script =
            document.createElement(
                "script"
            );


        script.src =
            src;


        script.onload =
            resolve;


        script.onerror =
            reject;


        document.head.appendChild(
            script
        );

    }
);
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
alert( "PAUTAS.JS COMPLETO CARREGADO ✅" );
