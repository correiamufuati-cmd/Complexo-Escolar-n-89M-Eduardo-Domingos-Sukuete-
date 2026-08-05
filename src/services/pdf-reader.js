alert("PDF-READER CARREGADO FINAL Dg");


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



    let itensTabela = [];



    for(let paginaNumero = 1; paginaNumero <= pdf.numPages; paginaNumero++){


        const pagina = await pdf.getPage(paginaNumero);



        const conteudo = await pagina.getTextContent();



        conteudo.items.forEach(item=>{


            itensTabela.push({

                texto:item.str.trim(),

                x:item.transform[4],

                y:item.transform[5]

            });


        });


    }



    alert(
        "Itens encontrados: " + itensTabela.length
    );



    const alunos = extrairAlunos(itensTabela);



    alert(
        "Alunos encontrados: " + alunos.length
    );



    return {

        quantidade: alunos.length,

        alunos: alunos

    };


}





function extrairAlunos(itens){



    let alunos = [];



    let linhas = {};



    // Agrupar por linha

    itens.forEach(item=>{


        let y = Math.round(item.y);



        if(!linhas[y]){

            linhas[y] = [];

        }



        linhas[y].push(item);



    });





    Object.values(linhas).forEach(linha=>{



        // ordenar esquerda para direita

        linha.sort((a,b)=>a.x-b.x);



        let numero="";
        let nome="";
        let sexo="";
        let data="";
        let idade="";




        linha.forEach(item=>{


            let texto = item.texto;



            if(!texto){

                return;

            }




            // Número

            if(item.x < 35){


                numero += texto;


            }



            // Nome

            else if(item.x >=35 && item.x <270){


                nome += " " + texto;


            }



            // Sexo

            else if(item.x >=270 && item.x <300){


                sexo += texto;


            }



            // Data nascimento

            else if(item.x >=300 && item.x <370){


                data += texto;


            }



            // Idade

            else if(item.x >=370){


                idade += " " + texto;


            }



        });





        numero = numero.trim();

        nome = nome.trim();

        sexo = sexo.trim();

        data = data.trim();

        idade = idade.trim();



function extrairAlunos(itens){

    let alunos = [];

    let linhas = {};


    // Agrupar por linha

    itens.forEach(item=>{

        let y = Math.round(item.y);

        if(!linhas[y]){

            linhas[y] = [];

        }

        linhas[y].push(item);

    });



    Object.values(linhas).forEach(linha=>{


        linha.sort((a,b)=>a.x-b.x);



        let numero="";
        let nome="";
        let sexo="";
        let data="";
        let idade="";



        linha.forEach(item=>{


            let texto = item.texto;


            if(!texto){
                return;
            }



            // Número

            if(item.x < 35){

                numero += texto;

            }



            // Nome

            else if(item.x >=35 && item.x <270){

                nome += " " + texto;

            }



            // Sexo

            else if(item.x >=270 && item.x <300){

                sexo += texto;

            }



            // Data nascimento

            else if(item.x >=300 && item.x <370){

                data += " " + texto;

            }



            // Idade

            else if(item.x >=370){

                idade += " " + texto;

            }


        });



        numero = numero.trim();

        nome = nome.trim();

        sexo = sexo.trim();

        idade = idade.trim();



        // Corrigir data separada pelo PDF

        data = data
        .replace(/\s+/g," ")
        .trim();



        // transformar:
        // 22 - 06 - 2012
        // em:
        // 22-06-2012

        data = data.replace(
            /\s*-\s*/g,
            "-"
        );



        if(
            numero &&
            nome &&
            /^\d+$/.test(numero)
        ){


            alunos.push({

                numero,

                nome,

                sexo,

                dataNascimento:data,

                idade

            });


        }



    });



    // remover duplicados pelo número

    let alunosSemDuplicados = [];

    let numeros = new Set();



    alunos.forEach(aluno=>{


        if(!numeros.has(aluno.numero)){


            numeros.add(aluno.numero);


            alunosSemDuplicados.push(aluno);


        }


    });



    return alunosSemDuplicados;


}
