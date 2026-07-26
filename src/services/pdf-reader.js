alert("ENTROU NO LEITOR");

export async function lerPDF(file){

    const dados = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
        data:dados
    }).promise;


    alert("Páginas: " + pdf.numPages);


    const page = await pdf.getPage(1);


    const content = await page.getTextContent();


    alert("Elementos página 1: " + content.items.length);


    let texto = content.items
    .map(i=>i.str)
    .join(" | ");


    alert(texto.substring(0,1000));


    return [];

}
