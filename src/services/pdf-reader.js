// Leitor d0e PDF - primeira fase (teste)
console.log("PDF READER FOI CARREGADO");

import * as pdfjsLib from 
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs";


export async function lerPDF(file){

    const dados = await file.arrayBuffer();


    const pdf = await pdfjsLib.getDocument({
        data: dados
    }).promise;


    let texto = "";


    for(let pagina = 1; pagina <= pdf.numPages; pagina++){

        const page = await pdf.getPage(pagina);


        const content = await page.getTextContent();


        content.items.forEach(item => {

            texto += item.str + " ";

        });


        texto += "\n";

    }


    return texto;

}
