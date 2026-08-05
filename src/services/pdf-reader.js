alert("PDF-READER CARREGADO Df");

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

    let alunos = [];

    const linhas = texto.split("\n");


    let iniciouTabela = false;


    linhas.forEach(linha => {

        linha = linha.trim();


        // Procurar início da tabela
        if(
            linha.toLowerCase().includes("nome") &&
            (
             linha.toLowerCase().includes("sexo") ||
             linha.toLowerCase().includes("nº") ||
             linha.toLowerCase().includes("numero")
            )
        ){

            iniciouTabela = true;
            return;

        }



        if(!iniciouTabela){
            return;
        }



        /*
        Procurar linhas que começam com número
        */

        const numero = linha.match(/^(\d+)/);


        if(!numero){
            return;
        }



        let partes = linha.split(/\s+/);



        let num = partes.shift();



        let sexo = "";

        let data = "";



        // Procurar sexo

        let posSexo = partes.findIndex(
            p => p==="M" || p==="F"
        );



        if(posSexo !== -1){

            sexo = partes[posSexo];

        }



        // Procurar data

        let posData = partes.findIndex(
            p => /\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(p)
        );



        if(posData !== -1){

            data = partes[posData];

        }



        // Nome fica antes do sexo/data

        let fimNome = partes.length;


        if(posSexo !== -1){
            fimNome = posSexo;
        }


        if(posData !== -1 && posData < fimNome){
            fimNome = posData;
        }



        let nome = partes
        .slice(0,fimNome)
        .join(" ")
        .trim();



        if(nome.length > 2){


            alunos.push({

                numero:num,

                nome:nome,

                sexo:sexo,

                dataNascimento:data

            });


        }



    });



    return alunos;

}
