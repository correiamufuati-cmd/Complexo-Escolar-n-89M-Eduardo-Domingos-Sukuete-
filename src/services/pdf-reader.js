alert("PDF-READER CARREGADO Ds");

import * as pdfjsLib from 
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";


pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";



export async function lerPDF(file){

    alert("A ler PDF do Franco...");


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

    let alunos = [];

    const linhas = texto
    .split("\n")
    .map(l=>l.trim())
    .filter(l=>l!=="");


    let iniciouTabela = false;


    for(let i=0;i<linhas.length;i++){

        let linha = linhas[i];


        if(
            linha.toLowerCase().includes("nome") &&
            (
             linha.toLowerCase().includes("sexo") ||
             linha.toLowerCase().includes("nascimento")
            )
        ){

            iniciouTabela = true;
            continue;

        }


        if(!iniciouTabela){
            continue;
        }



        // procura número do aluno
        let numeroEncontrado = linha.match(/^(\d{1,2})\b/);


        if(numeroEncontrado){


            let numero = numeroEncontrado[1];

            let bloco = linha;


            // junta próximas linhas até encontrar sexo ou data
            for(let j=1;j<=4;j++){

                if(linhas[i+j]){

                    bloco += " " + linhas[i+j];

                }


                if(
                    /\b[M|F]\b/.test(bloco) &&
                    /\d{2}[-\/]\d{2}[-\/]\d{4}/.test(bloco)
                ){

                    break;

                }

            }



            let sexo = "";

            let sexoEncontrado = bloco.match(/\b(M|F)\b/);

            if(sexoEncontrado){

                sexo = sexoEncontrado[1];

            }



            let data = "";

            let dataEncontrada = bloco.match(
                /\d{2}[-\/]\d{2}[-\/]\d{4}/
            );


            if(dataEncontrada){

                data = dataEncontrada[0];

            }



            let nome = bloco
            .replace(numero,"")
            .replace(sexo,"")
            .replace(data,"")
            .trim();



            if(nome.length>2){


                alunos.push({

                    numero:numero,

                    nome:nome,

                    sexo:sexo,

                    dataNascimento:data

                });


            }

        }

    }


    return alunos;

}
