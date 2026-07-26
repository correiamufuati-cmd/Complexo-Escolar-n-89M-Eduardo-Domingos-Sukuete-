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


    return extrairAlunos(textos);

}




function extrairAlunos(textos){


    let alunos = [];

    let inicio = textos.findIndex(t =>
        t === "N°" || t === "Nº"
    );


    if(inicio === -1){
        return [];
    }


    let i = inicio + 1;



    while(i < textos.length){


        if(!/^\d+$/.test(textos[i])){

            i++;
            continue;

        }



        let numero = textos[i];

        i++;


        let nome = "";

        let sexo = "";

        let data = "";

        let idade = "";



        while(i < textos.length){


            if(textos[i] === "M" || textos[i] === "F"){

                sexo = textos[i];

                i++;

                break;

            }


            nome += textos[i] + " ";

            i++;

        }



        if(!sexo){

            continue;

        }



        let partes = [];



        while(i < textos.length && partes.length < 3){


            if(/^\d+$/.test(textos[i])){

                partes.push(textos[i]);

            }


            i++;

        }



        if(partes.length === 3){

            data =
            partes[0]+"-"+
            partes[1]+"-"+
            partes[2];

        }



        while(i < textos.length){


            if(/\d+\s*(anos|Anos|ano)/i.test(textos[i])){

                idade = textos[i];

                i++;

                break;

            }
