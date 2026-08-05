import * as pdfjsLib from 
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs";


pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.mjs";


export async function lerPDF(file){

    alert("ENTROU NO LEITOR PDF");


    const dados = await file.arrayBuffer();


    const pdf = await pdfjsLib.getDocument({
        data:dados
    }).promise;


    alert("PDF ABERTO");


    let textoCompleto = "";


    for(let pagina = 1; pagina <= pdf.numPages; pagina++){

        const page = await pdf.getPage(pagina);

        const conteudo = await page.getTextContent();


        conteudo.items.forEach(item=>{

            textoCompleto += item.str + " ";

        });

    }


    alert("Texto extraído");


    return {

        quantidade:0,

        alunos:[],

        texto:textoCompleto

    };


}
