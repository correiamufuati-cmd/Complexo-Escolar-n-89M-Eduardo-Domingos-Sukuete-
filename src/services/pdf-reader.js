export async function lerPDF(file){

    const dados = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
        data:dados
    }).promise;


    let todosAlunos = [];


    for(let pagina = 1; pagina <= pdf.numPages; pagina++){

        const page = await pdf.getPage(pagina);

        const content = await page.getTextContent();

        const alunos = extrairAlunosPorLinha(content.items);

        todosAlunos.push(...alunos);

    }


    return todosAlunos;

}



function extrairAlunosPorLinha(items){

    let textos = items
        .map(i => i.str.trim())
        .filter(t => t);


    let alunos = [];

    let i = 0;


    while(i < textos.length){


        // procurar número do aluno
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



        // recolher nome até M ou F
        while(i < textos.length){

            if(textos[i] === "M" || textos[i] === "F"){

                sexo = textos[i];

                i++;

                break;

            }


            nome += textos[i] + " ";

            i++;

        }



        // recolher data
        while(i < textos.length){

            if(/\d{4}/.test(textos[i])){

                data = textos[i-4] + "-" + textos[i-2] + "-" + textos[i];

                i++;

                break;

            }


            i++;

        }



        // recolher idade
        while(i < textos.length){

            if(/\d+\s*(anos|Anos|ano)/.test(textos[i])){

                idade = textos[i];

                i++;

                break;

            }

            i++;

        }



        if(numero && nome && sexo){


            alunos.push({

                numero,

                nome:nome.trim(),

                sexo,

                data,

                idade

            });


        }


    }


    return alunos;

}
