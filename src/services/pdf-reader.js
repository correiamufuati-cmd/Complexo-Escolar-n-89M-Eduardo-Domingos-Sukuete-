
alert("PDF READER ATUALIZADO");

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



    // MOSTRAR COMO O PDF ENTREGA OS DADOS

    alert(
        "Total de elementos: " + textos.length +
        "\n\n" +
        textos.slice(0,250).join(" | ")
    );



    return [];

            }
