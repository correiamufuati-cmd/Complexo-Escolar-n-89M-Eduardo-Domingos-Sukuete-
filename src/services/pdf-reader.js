// pdf-reader.js

import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";


// ================================
// LER PDF
// ================================
export async function lerPDF(file){

    const dados = await file.arrayBuffer();

    const pdf = await pdfjsLib
        .getDocument({data:dados})
        .promise;


    let todasLinhas = [];


    // Ler todas páginas
    for(let pagina = 1; pagina <= pdf.numPages; pagina++){

        const page = await pdf.getPage(pagina);

        const conteudo = await page.getTextContent();


        let itens = conteudo.items.map(item=>({
            texto:item.str.trim(),
            x:item.transform[4],
            y:item.transform[5]
        }));


        // organizar por linhas
        let linhas = juntarLinhas(itens);


        todasLinhas.push(...linhas);
    }



    console.log("LINHAS ENCONTRADAS:");
    console.log(todasLinhas);


    const turma = extrairTurma(todasLinhas);

    const alunos = extrairAlunos(todasLinhas);


    console.log("Turma:", turma);
    console.log("Alunos:", alunos);



    return {
        turma,
        alunos
    };

}



// ================================
// JUNTAR TEXTO POR LINHA
// ================================
function juntarLinhas(itens){


    let linhas = [];


    itens.sort((a,b)=> b.y - a.y);


    itens.forEach(item=>{


        let linha = linhas.find(l=>
            Math.abs(l.y - item.y) < 5
        );


        if(!linha){

            linha={
                y:item.y,
                textos:[]
            };

            linhas.push(linha);

        }


        linha.textos.push(item);

    });



    return linhas.map(l=>{

        l.textos.sort((a,b)=>a.x-b.x);


        return l.textos
        .map(t=>t.texto)
        .join(" ")
        .replace(/\s+/g," ")
        .trim();

    });

}



// ================================
// EXTRAIR TURMA
// ================================
function extrairTurma(linhas){


    let texto = linhas.join(" ");


    let resultado =
    texto.match(
        /(Turma|Classe)\s*[:\-]?\s*([0-9A-Za-zªº]+)/i
    );


    if(resultado){

        return resultado[2];

    }


    return "Sem turma";

}




// ================================
// EXTRAIR ALUNOS
// ================================
function extrairAlunos(linhas){


    let alunos=[];


    for(let linha of linhas){


        /*
        Procura linhas que tenham:
        - número de matrícula
        - nome
        - sexo M/F
        */


        let encontrado =
        linha.match(
        /^(\d{1,5})\s+(.+?)\s+([MF])$/i
        );


        if(encontrado){


            alunos.push({

                matricula: encontrado[1],

                nome: encontrado[2]
                    .replace(/\d+/g,"")
                    .trim(),

                sexo:
                encontrado[3]
                .toUpperCase()

            });


        }


    }



    return alunos;

                      }
