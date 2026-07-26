export async function lerPDF(file){

    const dados = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
        data:dados
    }).promise;


    let todosAlunos = [];


    for(let pagina = 1; pagina <= pdf.numPages; pagina++){

        const page = await pdf.getPage(pagina);

        const content = await page.getTextContent();


        const alunos = extrairPorLinha(content.items);


        todosAlunos.push(...alunos);

    }


    todosAlunos.sort((a,b)=>Number(a.numero)-Number(b.numero));


    return todosAlunos;

}





function extrairPorLinha(items){


    let linhas = [];



    // juntar textos pela mesma linha visual

    items.forEach(item=>{


        let y = Math.round(item.transform[5]);


        let linha = linhas.find(
            l => Math.abs(l.y - y) <= 3
        );


        if(!linha){

            linha = {
                y:y,
                itens:[]
            };

            linhas.push(linha);

        }



        linha.itens.push({

            texto:item.str.trim(),

            x:item.transform[4]

        });


    });





    let alunos = [];



    linhas.forEach(linha=>{


        linha.itens.sort((a,b)=>a.x-b.x);



        let textos = linha.itens
        .map(i=>i.texto)
        .filter(t=>t);



        // procurar linhas que começam com número

        if(!/^\d+$/.test(textos[0])){

            return;

        }



        let numero = textos[0];



        let sexoIndex = textos.findIndex(
            t=>t==="M" || t==="F"
        );


        if(sexoIndex === -1){

            return;

        }



        let sexo = textos[sexoIndex];



        let nome = textos
        .slice(1,sexoIndex)
        .join(" ");




        let numeros = textos
        .slice(sexoIndex+1)
        .filter(t=>/^\d+$/.test(t));



        let data = "";

        let idade = "";



        if(numeros.length >= 3){


            data =
            numeros[0]+"-"+
            numeros[1]+"-"+
            numeros[2];


        }




        let idadeTexto = textos.find(
            t=>/\d+\s*(anos|Anos|ano)/i.test(t)
        );


        if(idadeTexto){

            idade = idadeTexto;

        }




        alunos.push({

            numero,

            nome,

            sexo,

            data,

            idade

        });



    });



    return alunos;


        }
