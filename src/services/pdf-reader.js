export async function lerPDF(file){


    const dados = await file.arrayBuffer();


    const pdf = await pdfjsLib.getDocument({
        data:dados
    }).promise;



    let texto = "";



    for(let pagina = 1; pagina <= pdf.numPages; pagina++){


        const page = await pdf.getPage(pagina);


        const content = await page.getTextContent();



        content.items.forEach(item=>{


            texto += item.str + " | ";


        });


        texto += "\n";


    }



    return texto;


        }
