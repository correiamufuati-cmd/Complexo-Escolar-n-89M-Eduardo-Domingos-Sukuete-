import * as pdfjsLib from 
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";


pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";



export async function lerPDF(file){

    const dados = await file.arrayBuffer();


    const pdf = await pdfjsLib.getDocument({
        data:dados
    }).promise;


    let textoCompleto = "";


    for(let pagina = 1; pagina <= pdf.numPages; pagina++){

        const page = await pdf.getPage(pagina);

        const conteudo = await page.getTextContent();


        let linhas = [];

        let linhaAtual = "";
        let ultimaY = null;


        conteudo.items.forEach(item=>{
export async function lerPDF(file){

const dados = await file.arrayBuffer();

const pdf = await pdfjsLib.getDocument({
data:dados
}).promise;


let todosAlunos = [];

let turmaInfo = {};


// ... todo o teu código continua aqui


// COLOCA AQUI ANTES DO return
console.log("TURMA ENCONTRADA:", turmaInfo);
console.log("TOTAL ALUNOS:", todosAlunos.length);



return {

turma: turmaInfo,

alunos: todosAlunos,

quantidade: todosAlunos.length

};


}




function extrairAlunos(texto){


    let alunos = [];


    const linhas = texto.split("\n");


    linhas.forEach(linha=>{


        linha = linha.trim();


        /*
        Exemplo esperado:
        01 12345 JOÃO ANTÓNIO M
        */


        const regex =
        /^(\d+)\s+(\d+)\s+(.+?)\s+(M|F)$/i;



        const resultado = linha.match(regex);



        if(resultado){


            alunos.push({

                numero: resultado[1],

                matricula: resultado[2],

                nome: resultado[3].trim(),

                sexo: resultado[4].toUpperCase()

            });


        }


    });



    return alunos;


        }
