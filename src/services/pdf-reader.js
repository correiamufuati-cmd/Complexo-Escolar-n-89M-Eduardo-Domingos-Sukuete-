alert("PDF READER REAL CARREGADO");


window.lerPDF = async function(file){

    const dados = await file.arrayBuffer();


    const pdfjsLib = await import(
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs"
    );


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


        texto += "\n\n";

    }


    return texto;

};
