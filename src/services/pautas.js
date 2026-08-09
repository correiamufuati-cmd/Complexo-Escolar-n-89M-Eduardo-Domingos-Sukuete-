import { db } from "./firebase.js";

import {
collection,
getDocs,
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

alert("PAUTAS.JS df CARREGADO ✅");

// =====================================================
// ELEMENTOS DO HTML
// =====================================================

const classeSelect =
document.getElementById("classeSelect");

const turmaSelect =
document.getElementById("turmaSelect");

const pautaLista =
document.getElementById("pautaLista");

const estadoPauta =
document.getElementById("estadoPauta");

const nomeEscola =
document.getElementById("nomeEscola");

const anoLetivo =
document.getElementById("anoLetivo");

const classeInfo =
document.getElementById("classeInfo");

const turmaInfo =
document.getElementById("turmaInfo");

// =====================================================
// DADOS
// =====================================================

let todasTurmas = [];

let turmaAtual = null;

let alunosAtuais = [];

let notasAtuais = [];

// =====================================================
// CONFIGURAÇÃO DAS DISCIPLINAS
// =====================================================

const disciplinasPorCiclo = {

ensinoPrimario: [

    "Língua Portuguesa",
    "Matemática",
    "Estudo do Meio",
    "Educação Física",
    "Educação Musical",
    "Educação Manual e Plástica",
    "Educação Moral e Cívica"

],

primeiroCiclo: [

    "Língua Portuguesa",
    "Matemática",
    "História",
    "Geografia",
    "Biologia",
    "Física",
    "Química",
    "Língua Inglesa",
    "Educação Física",
    "Educação Moral e Cívica"

]

};

// =====================================================
// NORMALIZAR TEXTO
// =====================================================

function normalizarTexto(texto){

return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"");

}

// =====================================================
// IDENTIFICAR CICLO
// =====================================================

function identificarCiclo(classe){

const texto =
    normalizarTexto(classe);


const numero =
    parseInt(
        texto.replace(/\D/g,""),
        10
    );


if(
    !Number.isNaN(numero) &&
    numero >= 1 &&
    numero <= 6
){

    return "ensinoPrimario";

}


return "primeiroCiclo";

}

// =====================================================
// CARREGAR TURMAS
// =====================================================

async function carregarTurmas(){

try{

    const snapshot =
        await getDocs(
            collection(
                db,
                "turmas"
            )
        );


    todasTurmas =
        snapshot.docs.map(
            documento => ({

                id:
                    documento.id,

                ...documento.data()

            })
        );


    todasTurmas.sort(
        (a,b) => {

            return String(
                a.nome || ""
            ).localeCompare(
                String(
                    b.nome || ""
                ),
                "pt"
            );

        }
    );


    preencherClasses();


}
catch(error){

    console.error(
        "Erro ao carregar turmas:",
        error
    );


    pautaLista.innerHTML = `

        <tr>

            <td
                colspan="100"
                class="estado-vazio"
            >

                ❌ Erro ao carregar turmas.

            </td>

        </tr>

    `;

}

}

// =====================================================
// PREENCHER CLASSES
// =====================================================

function preencherClasses(){

const classes = [];


todasTurmas.forEach(
    turma => {

        const classe =
            turma.classe ||
            turma.classeNome ||
            "";


        if(
            classe &&
            !classes.includes(classe)
        ){

            classes.push(classe);

        }

    }
);


classes.sort(
    (a,b) => {

        const numeroA =
            parseInt(
                String(a)
                    .replace(/\D/g,""),
                10
            );


        const numeroB =
            parseInt(
                String(b)
                    .replace(/\D/g,""),
                10
            );


        return numeroA - numeroB;

    }
);


classeSelect.innerHTML = `

    <option value="">
        -- Selecione a classe --
    </option>

`;


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

// =====================================================
// MUDAR CLASSE
// =====================================================

classeSelect.addEventListener(
"change",
function(){

    const classe =
        this.value;


    turmaSelect.innerHTML = `

        <option value="">
            -- Selecione a turma --
        </option>

    `;


    turmaAtual = null;


    if(!classe){

        atualizarInformacoes();

        return;

    }


    const turmasDaClasse =
        todasTurmas.filter(
            turma =>

                normalizarTexto(
                    turma.classe
                ) ===
                normalizarTexto(
                    classe
                )
        );


    turmasDaClasse.forEach(
        turma => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                turma.id;


            option.textContent =
                turma.nome || turma.id;


            turmaSelect.appendChild(
                option
            );

        }
    );


    atualizarInformacoes();

}

);

// =====================================================
// MUDAR TURMA
// =====================================================

turmaSelect.addEventListener(
"change",
async function(){

    const turmaId =
        this.value;


    if(!turmaId){

        turmaAtual = null;

        atualizarInformacoes();

        return;

    }


    turmaAtual =
        todasTurmas.find(
            turma =>
                turma.id === turmaId
        );


    atualizarInformacoes();


    await carregarPauta(
        turmaId
    );

}

);

// =====================================================
// ATUALIZAR INFORMAÇÕES
// =====================================================

function atualizarInformacoes(){

if(!turmaAtual){

    classeInfo.textContent =
        "Classe: —";

    turmaInfo.textContent =
        "Turma: —";

    estadoPauta.textContent =
        "Aguardando seleção";

    return;

}


const classe =
    turmaAtual.classe || "—";


const turma =
    turmaAtual.nome || "—";


classeInfo.textContent =
    `Classe: ${classe}`;


turmaInfo.textContent =
    `Turma: ${turma}`;


estadoPauta.textContent =
    "A carregar pauta...";

}

// =====================================================
// INICIAR
// =====================================================

carregarTurmas();

        // =====================================================
// BLOCO 2 — CARREGAR ALUNOS E NOTAS
// =====================================================

// =====================================================
// CARREGAR PAUTA DA TURMA
// =====================================================

async function carregarPauta(turmaId){

try{

    estadoPauta.textContent =
        "A carregar alunos...";


    pautaLista.innerHTML = `

        <tr>

            <td
                colspan="100"
                class="estado-vazio"
            >

                ⏳ A carregar pauta...

            </td>

        </tr>

    `;


    // =================================================
    // BUSCAR ALUNOS
    // =================================================

    const alunosSnapshot =
        await getDocs(

            collection(
                db,
                "turmas",
                turmaId,
                "alunos"
            )

        );


    alunosAtuais =
        alunosSnapshot.docs.map(
            documento => ({

                id:
                    documento.id,

                ...documento.data()

            })
        );


    // =================================================
    // ORDENAR ALUNOS PELO NÚMERO
    // =================================================

    alunosAtuais.sort(
        (a,b) => {

            const numeroA =
                parseInt(
                    a.numero,
                    10
                );


            const numeroB =
                parseInt(
                    b.numero,
                    10
                );


            if(
                Number.isNaN(numeroA) &&
                Number.isNaN(numeroB)
            ){

                return String(
                    a.nome || ""
                ).localeCompare(
                    String(
                        b.nome || ""
                    ),
                    "pt"
                );

            }


            if(
                Number.isNaN(numeroA)
            ){

                return 1;

            }


            if(
                Number.isNaN(numeroB)
            ){

                return -1;

            }


            return numeroA - numeroB;

        }
    );


    // =================================================
    // BUSCAR NOTAS DA TURMA
    // =================================================

    notasAtuais = [];


    const notasSnapshot =
        await getDocs(
            collection(
                db,
                "notas"
            )
        );


    notasSnapshot.forEach(
        documento => {

            const dados =
                documento.data();


            if(
                dados.turmaId ===
                turmaId
            ){

                notasAtuais.push({

                    id:
                        documento.id,

                    ...dados

                });

            }

        }
    );


    // =================================================
    // MOSTRAR RESULTADO
    // =================================================

    if(
        alunosAtuais.length === 0
    ){

        pautaLista.innerHTML = `

            <tr>

                <td
                    colspan="100"
                    class="estado-vazio"
                >

                    📋 Nenhum aluno encontrado
                    nesta turma.

                </td>

            </tr>

        `;


        estadoPauta.textContent =
            "Sem alunos";


        return;

    }


    // =================================================
    // CONSTRUIR TABELA
    // =================================================

    construirCabecalho();


    construirLinhas();


    estadoPauta.textContent =
        `${alunosAtuais.length} aluno(s)`;

}
catch(error){

    console.error(
        "Erro ao carregar pauta:",
        error
    );


    pautaLista.innerHTML = `

        <tr>

            <td
                colspan="100"
                class="estado-vazio"
            >

                ❌ Erro ao carregar pauta.

                <br><br>

                ${error.message}

            </td>

        </tr>

    `;


    estadoPauta.textContent =
        "Erro ao carregar";

}

}

// =====================================================
// OBTER NOTA DE UM ALUNO
// =====================================================

function obterNota(
alunoId,
disciplina,
trimestre
){

const registro =
    notasAtuais.find(
        nota => {

            if(
                nota.disciplina !==
                disciplina
            ){

                return false;

            }


            if(
                nota.trimestre !=
                trimestre
            ){

                return false;

            }


            return nota.alunos?.some(
                aluno =>

                    String(
                        aluno.id ||
                        aluno.alunoId ||
                        aluno.numero
                    ) ===
                    String(
                        alunoId
                    )
            );

        }
    );


if(!registro){

    return {};

}


const alunoNota =
    registro.alunos?.find(
        aluno =>

            String(
                aluno.id ||
                aluno.alunoId ||
                aluno.numero
            ) ===
            String(
                alunoId
            )
    );


return alunoNota || {};

}

// =====================================================
// OBTER NOTA PELO NÚMERO DO ALUNO
// =====================================================

function obterNotaAluno(
aluno,
disciplina,
trimestre
){

const registro =
    notasAtuais.find(
        nota => {

            if(
                normalizarTexto(
                    nota.disciplina
                ) !==
                normalizarTexto(
                    disciplina
                )
            ){

                return false;

            }


            if(
                String(
                    nota.trimestre
                ) !==
                String(
                    trimestre
                )
            ){

                return false;

            }


            return true;

        }
    );


if(!registro){

    return {};

}


const encontrado =
    registro.alunos?.find(
        item => {

            if(
                aluno.numero &&
                item.numero
            ){

                return String(
                    item.numero
                ) ===
                String(
                    aluno.numero
                );

            }


            return normalizarTexto(
                item.nome
            ) ===
            normalizarTexto(
                aluno.nome
            );

        }
    );


return encontrado || {};

}

// =====================================================
// CONVERTER NOTA
// =====================================================

function valorNota(valor){

if(
    valor === undefined ||
    valor === null ||
    valor === ""
){

    return "";

}


const numero =
    Number(valor);


if(
    Number.isNaN(numero)
){

    return "";

}


return numero;

}

// =====================================================
// CALCULAR MF DO TRIMESTRE
// =====================================================

function calcularMF(
mac,
npt
){

if(
    mac === "" ||
    npt === ""
){

    return "";

}


return Number(
    (
        (
            Number(mac) +
            Number(npt)
        ) / 2
    ).toFixed(1)
);

}

// =====================================================
// CLASSIFICAÇÃO
// =====================================================

function classificarNota(
nota,
ciclo
){

if(
    nota === "" ||
    nota === null ||
    nota === undefined
){

    return "";

}


const valor =
    Number(nota);


if(
    Number.isNaN(valor)
){

    return "";

}


if(
    ciclo ===
    "ensinoPrimario"
){

    if(valor <= 2)
        return "Mau";

    if(valor <= 4)
        return "Medíocre";

    if(valor <= 6)
        return "Suficiente";

    if(valor <= 8)
        return "Bom";

    return "Muito Bom";

}


if(valor <= 4)
    return "Mau";

if(valor <= 9)
    return "Medíocre";

if(valor <= 13)
    return "Suficiente";

if(valor <= 16)
    return "Bom";

return "Muito Bom";

}

// =====================================================
// INICIALIZAR ARRAY DE DISCIPLINAS
// =====================================================

function obterDisciplinasDaTurma(){

if(!turmaAtual){

    return [];

}


const ciclo =
    identificarCiclo(
        turmaAtual.classe
    );


return [
    ...disciplinasPorCiclo[
        ciclo
    ]
];

}

    // =====================================================
// BLOCO 3 — CABEÇALHO DA PAUTA
// =====================================================

function construirCabecalho(){

const tabela =
    document.querySelector(
        ".tabela-pauta"
    );


if(!tabela){

    console.error(
        "Tabela da pauta não encontrada."
    );

    return;

}


const thead =
    tabela.querySelector("thead");


if(!thead){

    return;

}


const disciplinas =
    obterDisciplinasDaTurma();


const totalColunas =
    disciplinas.length * 9;


// =================================================
// LINHA 1
// =================================================

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
                ${disciplina}
            </th>

        `;

    }
);


// =================================================
// COLUNAS FINAIS
// =================================================

linha1.innerHTML += `

    <th
        rowspan="3"
        class="media-final"
    >
        Média Final
    </th>

    <th
        rowspan="3"
        class="classificacao"
    >
        Classificação
    </th>

    <th
        rowspan="3"
        class="observacao"
    >
        Observação
    </th>

`;


// =================================================
// LINHA 2
// =================================================

const linha2 =
    document.createElement("tr");


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


// =================================================
// LINHA 3
// =================================================

const linha3 =
    document.createElement("tr");


disciplinas.forEach(
    () => {

        // 1.º TRIMESTRE

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


        // 2.º TRIMESTRE

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


        // 3.º TRIMESTRE

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


// =================================================
// SUBSTITUIR CABEÇALHO ANTIGO
// =================================================

thead.innerHTML = "";

thead.appendChild(
    linha1
);

thead.appendChild(
    linha2
);

thead.appendChild(
    linha3
);


// =================================================
// ATUALIZAR LARGURA
// =================================================

tabela.style.minWidth =
    `${Math.max(
        1800,
        400 +
        (
            disciplinas.length *
            9 *
            65
        )
    )}px`;

}

// =====================================================
// ATUALIZAR CABEÇALHO DA ESCOLA
// =====================================================

function atualizarCabecalhoEscola(){

if(!turmaAtual){

    nomeEscola.textContent =
        'Complexo Escolar Nº 89M "Eduardo Domingos Sukuete"';

    anoLetivo.textContent =
        "Ano Lectivo: —";

    return;

}


/*
Nome da escola.
Se existir no documento da turma,
utiliza o valor guardado.
*/

const escola =
    turmaAtual.nomeEscola ||
    turmaAtual.escolaNome ||
    localStorage.getItem(
        "nomeEscola"
    ) ||
    'Complexo Escolar Nº 89M "Eduardo Domingos Sukuete"';


nomeEscola.textContent =
    escola;


/*
Ano lectivo.
*/

const ano =
    turmaAtual.anoLetivo ||
    turmaAtual.anoLectivo ||
    turmaAtual.ano ||
    localStorage.getItem(
        "anoLetivo"
    ) ||
    "2026";


anoLetivo.textContent =
    `Ano Lectivo: ${ano}`;


classeInfo.textContent =
    `Classe: ${
        turmaAtual.classe || "—"
    }`;


turmaInfo.textContent =
    `Turma: ${
        turmaAtual.nome || "—"
    }`;

}

    // =====================================================
// BLOCO 4 — CONSTRUIR LINHAS DOS ALUNOS
// =====================================================

function construirLinhas(){

pautaLista.innerHTML = "";


const disciplinas =
    obterDisciplinasDaTurma();


if(
    !alunosAtuais ||
    alunosAtuais.length === 0
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


const ciclo =
    identificarCiclo(
        turmaAtual.classe
    );


alunosAtuais.forEach(
    (aluno, indice) => {

        const tr =
            document.createElement(
                "tr"
            );


        // =================================================
        // DADOS DO ALUNO
        // =================================================

        const numero =
            aluno.numero ||
            (indice + 1);


        const nome =
            aluno.nome ||
            "—";


        const sexo =
            aluno.sexo ||
            aluno.Sexo ||
            "—";


        const idade =
            aluno.idade ||
            aluno.Idade ||
            "—";


        let html = `

            <td class="numero">
                ${numero}
            </td>

            <td class="nome-aluno">
                ${nome}
            </td>

            <td class="sexo">
                ${sexo}
            </td>

            <td class="idade">
                ${idade}
            </td>

        `;


        // =================================================
        // MÉDIAS FINAIS DAS DISCIPLINAS
        // =================================================

        const mediasDisciplinas = [];


        // =================================================
        // DISCIPLINAS
        // =================================================

        disciplinas.forEach(
            disciplina => {


                let media1 = "";

                let media2 = "";

                let media3 = "";


                // =============================================
                // TRIMESTRE 1
                // =============================================

                const nota1 =
                    obterNotaAluno(
                        aluno,
                        disciplina,
                        1
                    );


                const mac1 =
                    valorNota(
                        nota1.MAC
                    );


                const npt1 =
                    valorNota(
                        nota1.NPT
                    );


                const mf1 =
                    nota1.MF !== undefined &&
                    nota1.MF !== ""
                        ? valorNota(
                            nota1.MF
                        )
                        : calcularMF(
                            mac1,
                            npt1
                        );


                media1 = mf1;


                // =============================================
                // TRIMESTRE 2
                // =============================================

                const nota2 =
                    obterNotaAluno(
                        aluno,
                        disciplina,
                        2
                    );


                const mac2 =
                    valorNota(
                        nota2.MAC
                    );


                const npt2 =
                    valorNota(
                        nota2.NPT
                    );


                const mf2 =
                    nota2.MF !== undefined &&
                    nota2.MF !== ""
                        ? valorNota(
                            nota2.MF
                        )
                        : calcularMF(
                            mac2,
                            npt2
                        );


                media2 = mf2;


                // =============================================
                // TRIMESTRE 3
                // =============================================

                const nota3 =
                    obterNotaAluno(
                        aluno,
                        disciplina,
                        3
                    );


                const mac3 =
                    valorNota(
                        nota3.MAC
                    );


                const npt3 =
                    valorNota(
                        nota3.NPT
                    );


                const mf3 =
                    nota3.MF !== undefined &&
                    nota3.MF !== ""
                        ? valorNota(
                            nota3.MF
                        )
                        : calcularMF(
                            mac3,
                            npt3
                        );


                media3 = mf3;


                // =============================================
                // MÉDIA FINAL DA DISCIPLINA
                // =============================================

                const medias = [

                    media1,

                    media2,

                    media3

                ].filter(
                    valor =>
                        valor !== "" &&
                        valor !== null &&
                        valor !== undefined
                );


                let mediaFinalDisciplina =
                    "";


                if(
                    medias.length > 0
                ){

                    const soma =
                        medias.reduce(
                            (
                                total,
                                valor
                            ) =>
                                total +
                                Number(valor),
                            0
                        );


                    mediaFinalDisciplina =
                        Number(
                            (
                                soma /
                                medias.length
                            ).toFixed(1)
                        );


                    mediasDisciplinas.push(
                        mediaFinalDisciplina
                    );

                }


                // =============================================
                // ADICIONAR À TABELA
                // =============================================

                html += `

                    <!-- 1.º TRIMESTRE -->

                    <td class="nota">
                        ${
                            mac1 === ""
                                ? "—"
                                : mac1
                        }
                    </td>

                    <td class="nota">
                        ${
                            npt1 === ""
                                ? "—"
                                : npt1
                        }
                    </td>

                    <td class="nota mf">
                        ${
                            mf1 === ""
                                ? "—"
                                : mf1
                        }
                    </td>


                    <!-- 2.º TRIMESTRE -->

                    <td class="nota">
                        ${
                            mac2 === ""
                                ? "—"
                                : mac2
                        }
                    </td>

                    <td class="nota">
                        ${
                            npt2 === ""
                                ? "—"
                                : npt2
                        }
                    </td>

                    <td class="nota mf">
                        ${
                            mf2 === ""
                                ? "—"
                                : mf2
                        }
                    </td>


                    <!-- 3.º TRIMESTRE -->

                    <td class="nota">
                        ${
                            mac3 === ""
                                ? "—"
                                : mac3
                        }
                    </td>

                    <td class="nota">
                        ${
                            npt3 === ""
                                ? "—"
                                : npt3
                        }
                    </td>

                    <td class="nota mf">
                        ${
                            mf3 === ""
                                ? "—"
                                : mf3
                        }
                    </td>

                `;

            }
        );


        // =================================================
        // MÉDIA FINAL GERAL DO ALUNO
        // =================================================

        let mediaFinalGeral =
            "";


        if(
            mediasDisciplinas.length > 0
        ){

            const soma =
                mediasDisciplinas.reduce(
                    (
                        total,
                        valor
                    ) =>
                        total +
                        Number(valor),
                    0
                );


            mediaFinalGeral =
                Number(
                    (
                        soma /
                        mediasDisciplinas.length
                    ).toFixed(1)
                );

        }


        // =================================================
        // CLASSIFICAÇÃO GERAL
        // =================================================

        const classificacao =
            classificarNota(
                mediaFinalGeral,
                ciclo
            );


        // =================================================
        // RESULTADO
        // =================================================

        let observacao =
            "—";


        let classeObservacao =
            "";


        if(
            mediaFinalGeral !== ""
        ){

            const limite =
                ciclo ===
                "ensinoPrimario"
                    ? 5
                    : 10;


            if(
                mediaFinalGeral >=
                limite
            ){

                observacao =
                    "Aprovado";

                classeObservacao =
                    "aprovado";

            }
            else{

                observacao =
                    "Reprovado";

                classeObservacao =
                    "reprovado";

            }

        }


        // =================================================
        // COLUNAS FINAIS
        // =================================================

        html += `

            <td class="media-final">

                ${
                    mediaFinalGeral === ""
                        ? "—"
                        : mediaFinalGeral
                }

            </td>


            <td class="classificacao">

                ${
                    classificacao ||
                    "—"
                }

            </td>


            <td
                class="
                    observacao
                    ${classeObservacao}
                "
            >

                ${observacao}

            </td>

        `;


        tr.innerHTML =
            html;


        pautaLista.appendChild(
            tr
        );

    }
);

}

    // =====================================================
// BLOCO 5 — CABEÇALHO + EXPORTAÇÃO + IMPRESSÃO
// =====================================================

// =====================================================
// ATUALIZAR CABEÇALHO QUANDO A TURMA FOR SELECIONADA
// =====================================================

const observerTurma =
new MutationObserver(
() => {

        if(turmaAtual){

            atualizarCabecalhoEscola();

        }

    }
);

observerTurma.observe(
turmaSelect,
{
childList:true,
subtree:true
}
);

// =====================================================
// ATUALIZAR CABEÇALHO APÓS SELEÇÃO
// =====================================================

turmaSelect.addEventListener(
"change",
function(){

    if(turmaAtual){

        atualizarCabecalhoEscola();

    }

}

);

// =====================================================
// EXPORTAR EXCEL
// =====================================================

const exportarExcel =
document.getElementById(
"exportarExcel"
);

if(exportarExcel){

exportarExcel.addEventListener(
    "click",
    function(){

        if(!turmaAtual){

            alert(
                "Selecione primeiro uma turma."
            );

            return;

        }


        const tabela =
            document.querySelector(
                ".tabela-pauta"
            );


        if(!tabela){

            alert(
                "Tabela não encontrada."
            );

            return;

        }


        /*
        Verificar se XLSX já está disponível.
        */

        if(
            typeof XLSX ===
            "undefined"
        ){

            alert(
                "A biblioteca Excel não está carregada."
            );

            return;

        }


        const workbook =
            XLSX.utils.table_to_book(
                tabela,
                {
                    sheet:
                        "Pauta"
                }
            );


        const nomeClasse =
            turmaAtual.classe ||
            "Classe";


        const nomeTurma =
            turmaAtual.nome ||
            "Turma";


        const nomeArquivo =
            `Pauta_${nomeClasse}_${nomeTurma}.xlsx`;


        XLSX.writeFile(
            workbook,
            nomeArquivo
        );

    }
);

}

// =====================================================
// EXPORTAR PDF
// =====================================================

const exportarPDF =
document.getElementById(
"exportarPDF"
);

if(exportarPDF){

exportarPDF.addEventListener(
    "click",
    async function(){

        if(!turmaAtual){

            alert(
                "Selecione primeiro uma turma."
            );

            return;

        }


        /*
        jsPDF precisa estar carregado.
        */

        if(
            typeof window.jspdf ===
            "undefined"
        ){

            alert(
                "A biblioteca PDF não está carregada."
            );

            return;

        }


        const {
            jsPDF
        } =
            window.jspdf;


        const tabela =
            document.querySelector(
                ".tabela-pauta"
            );


        if(!tabela){

            alert(
                "Tabela não encontrada."
            );

            return;

        }


        const pdf =
            new jsPDF({

                orientation:
                    "landscape",

                unit:
                    "mm",

                format:
                    "a3"

            });


        const nome =
            nomeEscola.textContent ||
            "Pauta Geral";


        const ano =
            anoLetivo.textContent ||
            "";


        const classe =
            classeInfo.textContent ||
            "";


        const turma =
            turmaInfo.textContent ||
            "";


        pdf.setFontSize(16);


        pdf.text(
            nome,
            15,
            15
        );


        pdf.setFontSize(10);


        pdf.text(
            `${ano} | ${classe} | ${turma}`,
            15,
            22
        );


        /*
        Utilizar autoTable se estiver disponível.
        */

        if(
            typeof pdf.autoTable ===
            "function"
        ){

            pdf.autoTable({

                html:
                    tabela,

                startY:
                    27,

                theme:
                    "grid",

                styles:{

                    fontSize:
                        6,

                    cellPadding:
                        1.5,

                    overflow:
                        "linebreak"

                },

                headStyles:{

                    fontSize:
                        6

                },

                margin:{

                    left:
                        8,

                    right:
                        8

                }

            });

        }
        else{

            alert(
                "A extensão AutoTable do PDF não está carregada."
            );

            return;

        }


        const nomeClasse =
            turmaAtual.classe ||
            "Classe";


        const nomeTurma =
            turmaAtual.nome ||
            "Turma";


        pdf.save(
            `Pauta_${nomeClasse}_${nomeTurma}.pdf`
        );

    }
);

}

// =====================================================
// IMPRIMIR PAUTA
// =====================================================

const imprimirPauta =
document.getElementById(
"imprimirPauta"
);

if(imprimirPauta){

imprimirPauta.addEventListener(
    "click",
    function(){

        if(!turmaAtual){

            alert(
                "Selecione primeiro uma turma."
            );

            return;

        }


        window.print();

    }
);

}

// =====================================================
// ATUALIZAR CABEÇALHO QUANDO A TURMA
// FOR SELECIONADA
// =====================================================

const eventoOriginal =
turmaSelect;

turmaSelect.addEventListener(
"change",
function(){

    setTimeout(
        () => {

            atualizarCabecalhoEscola();

        },
        50
    );

}

);

// =====================================================
// MENSAGEM INICIAL
// =====================================================

console.log(
"Pautas Gerais SGE inicializada ✅"
);

// =====================================================
// FIM DO PAUTAS.JS
// =====================================================
