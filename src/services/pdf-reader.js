import * as pdfjsLib from 
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";


pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";



export async function lerPDF(file){

    const dados = await file.arrayBuffer();


    const pdf = await pdfjsLib.getDocument({
        data:dados
    }).promise;


    let textoCompleto = "";


    for(let pagina = 1; pagina <= pdf.numPages; pagina++){

        const page = await pdf.getPage(pagina);

        const conteudo = await page.getTextContent();


        let linhas = [];

        let linhaAtual = "";
        let ultimaY = null;


        conteudo.items.forEach(item=>{

            const y = item.transform[5];


            if(ultimaY === null || Math.abs(y - ultimaY) < 5){

                linhaAtual += " " + item.str;

            }else{

                linhas.push(linhaAtual);
                linhaAtual = item.str;

            }


            ultimaY = y;

        });


        if(linhaAtual){
            linhas.push(linhaAtual);
        }


        textoCompleto += linhas.join("\n") + "\n";

    }



    console.log(textoCompleto);



    const alunos = extrairAlunos(textoCompleto);



    return {

        alunos: alunos,

        quantidade: alunos.length

    };


}




function extrairAlunos(texto){


    let alunos = [];


    const linhas = texto.split("\n");


    linhas.forEach(linha=>{


        linha = linha.trim();


        /*
        Exemplo esperado:
        01 12345 JOÃO ANTÓNIO M
        */


        const regex =
        /^(\d+)\s+(\d+)\s+(.+?)\s+(M|F)$/i;



        const resultado = linha.match(regex);



        if(resultado){


            alunos.push({

                numero: resultado[1],

                matricula: resultado[2],

                nome: resultado[3].trim(),

                sexo: resultado[4].toUpperCase()

            });


        }


    });



    return alunos;


        }
