export async function lerPDF(file){

    const dados = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
        data:dados
    }).promise;

    let textos = [];

    for(let pagina = 1; pagina <= pdf.numPages; pagina++){

        const page = await pdf.getPage(pagina);

        const content = await page.getTextContent();

        content.items.forEach(item=>{

            let t = item.str.trim();

            if(t){
                textos.push(t);
            }

        });

    }

    let alunos = extrairAlunos(textos);

    alunos.sort((a,b)=>{
        return Number(a.numero)-Number(b.numero);
    });

    return alunos;

}
