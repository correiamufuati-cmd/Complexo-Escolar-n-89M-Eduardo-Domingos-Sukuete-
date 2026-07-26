export async function lerPDF(file){

    const dados = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
        data: dados
    }).promise;

    const page = await pdf.getPage(1);

    const content = await page.getTextContent();

    let resultado = "";

    content.items.forEach(item => {

        resultado +=
            "X=" + Math.round(item.transform[4]) +
            " | Y=" + Math.round(item.transform[5]) +
            " | " + item.str + "\n";

    });

    alert(resultado.substring(0, 3500));

    return [];

}
