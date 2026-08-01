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


        const linhas = conteudo.items
            .map(item => item.str)
            .join(" ");


        textoCompleto += "\n" + linhas;

    }



    console.log("TEXTO EXTRAÍDO:");
    console.log(textoCompleto);



    const alunos = extrairAlunos(textoCompleto);



    return {

        quantidade: alunos.length,

        alunos: alunos,

        texto: textoCompleto

    };

}





function extrairAlunos(texto){


    const linhas = texto
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 0);



    let alunos = [];



    for(let i = 0; i < linhas.length; i++){


        let linha = linhas[i];



        /*
        Aqui vamos procurar linhas
        que começam com número de aluno.
        Exemplo:
        1 JOÃO MANUEL M
        */


        if(/^\d+/.test(linha)){


            let partes = linha.split(" ");



            let numero = partes.shift();



            let nome = partes.join(" ");



            alunos.push({

                numero: numero,

                nome: nome,

                sexo:""

            });


        }


    }



    return alunos;


}
