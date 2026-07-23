import * as pdfjsLib from 
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs";


// Ler PDF
export async function lerPDF(file) {

    const arrayBuffer = await file.arrayBuffer();


    const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer
    }).promise;


    let textoCompleto = "";


    for(let i = 1; i <= pdf.numPages; i++){

        const pagina = await pdf.getPage(i);

        const conteudo = await pagina.getTextContent();


        const textos = conteudo.items.map(
            item => item.str
        );


        textoCompleto += textos.join(" ") + "\n";

    }


    return textoCompleto;

      }
