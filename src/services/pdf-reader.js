import * as pdfjsLib from 
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";


pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";



export async function lerPDF(file){


    const dados = await file.arrayBuffer();


    const pdf = await pdfjsLib.getDocument({
        data:dados
    }).promise;



    let todasLinhas = [];



    for(let pagina = 1; pagina <= pdf.numPages; pagina++){


        const page = await pdf.getPage(pagina);


        const conteudo = await page.getTextContent();



        let linhasPagina = organizarLinhas(conteudo.items);



        todasLinhas.push(...linhasPagina);



    }



    let textoCompleto = todasLinhas.join("\n");



    console.log("TEXTO ORGANIZADO:");
    console.log(textoCompleto);



    const alunos = extrairAlunos(textoCompleto);



    console.log("TOTAL ALUNOS:", alunos.length);



    return {

        quantidade: alunos.length,

        alunos: alunos,

        texto: textoCompleto

    };

}





function organizarLinhas(items){


    let linhas = {};



    items.forEach(item=>{


        let y = Math.round(item.transform[5]);



        if(!linhas[y]){

            linhas[y] = [];

        }



        linhas[y].push(item.str);



    });



    return Object.keys(linhas)

        .sort((a,b)=> b-a)

        .map(y=> linhas[y].join(" "));

}





function extrairAlunos(texto){


    const linhas = texto
        .split("\n")
        .map(l=>l.trim())
        .filter(l=>l);



    let alunos=[];



    linhas.forEach(linha=>{


        /*
        Procura linhas como:

        1 12345 JOÃO MANUEL M

        ou

        1 JOÃO MANUEL M
        */


        if(/^\d+\s+/.test(linha)){


            let partes = linha.split(/\s+/);



            let numero = partes.shift();



            let nome = partes.join(" ");



            alunos.push({

                numero: numero,

                nome: nome,

                sexo:""

            });


        }


    });



    return alunos;


        }
