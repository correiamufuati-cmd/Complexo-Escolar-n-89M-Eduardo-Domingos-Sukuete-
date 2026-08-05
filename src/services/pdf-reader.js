alert("PDF-READER FOI CARREGADO Df");


import * as pdfjsLib from 
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";


pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";



export async function lerPDF(file){


    alert("A abrir PDF");


    const arrayBuffer = await file.arrayBuffer();


    const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer
    }).promise;



    let textoCompleto = "";



    for(let i=1;i<=pdf.numPages;i++){


        const pagina = await pdf.getPage(i);


        const conteudo = await pagina.getTextContent();



        const textoPagina = conteudo.items
        .map(item=>item.str)
        .join(" ");



        textoCompleto += textoPagina + "\n";


    }



    alert(
        "Texto extraído: " + textoCompleto.length + " caracteres"
    );



    return {

        quantidade:0,

        alunos:[],

        texto:textoCompleto

    };


        }
