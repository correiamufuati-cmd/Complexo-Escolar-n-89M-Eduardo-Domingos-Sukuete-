alert("PDF-READER CARREGADO");

import * as pdfjsLib from 
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";


pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";



export async function lerPDF(file){

    alert("A ler PDF...");


    const arrayBuffer = await file.arrayBuffer();


    const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer
    }).promise;



    let textoCompleto = "";



    for(let i=1;i<=pdf.numPages;i++){


        const pagina = await pdf.getPage(i);


        const conteudo = await pagina.getTextContent();



        let linhas = {};



        conteudo.items.forEach(item=>{


            const y = Math.round(item.transform[5]);


            if(!linhas[y]){

                linhas[y] = "";

            }


            linhas[y] += " " + item.str;


        });



        Object.keys(linhas)
        .sort((a,b)=>b-a)
        .forEach(y=>{


            textoCompleto += 
            linhas[y].trim()+"\n";


        });



    }



    alert(
        "Texto extraído: "+textoCompleto.length
    );



    const alunos = extrairAlunos(textoCompleto);



    alert(
        "Alunos encontrados: "+alunos.length
    );



    return {

        quantidade: alunos.length,

        alunos: alunos,

        texto:textoCompleto

    };


}




function extrairAlunos(texto){


    let alunos=[];


    const linhas = texto.split("\n");



    linhas.forEach(linha=>{


        linha = linha.trim();



        /*
        Procura linhas que começam com número
        */


        const encontrado = linha.match(
            /^(\d+)\s+(.+?)\s+([MF])\b/i
        );



        if(encontrado){


            alunos.push({

                numero:
                encontrado[1],


                nome:
                encontrado[2].trim(),


                sexo:
                encontrado[3].toUpperCase()


            });


        }


    });



    return alunos;


}
