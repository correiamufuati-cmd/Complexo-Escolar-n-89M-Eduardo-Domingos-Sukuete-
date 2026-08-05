alert("PDF-READER CARREGADO FINAL");


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



    for(
        let paginaNumero = 1;
        paginaNumero <= pdf.numPages;
        paginaNumero++
    ){


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



    // juntar itens pela posição vertical

    itens.forEach(item=>{


        let y = Math.round(item.y);



        if(!linhas[y]){

            linhas[y] = [];

        }


        linhas[y].push(item);


    });





    Object.values(linhas).forEach(linha=>{


        // ordenar pela posição horizontal

        linha.sort((a,b)=>a.x-b.x);



        let numero = "";
        let nome = "";
        let sexo = "";
        let data = "";
        let idade = "";



        // texto completo da linha

        let linhaTexto = linha
            .map(i=>i.texto)
            .join(" ");





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

            else if(
                item.x >=35 &&
                item.x <270
            ){


                nome += " " + texto;


            }



            // Sexo

            else if(
                item.x >=270 &&
                item.x <300
            ){


                sexo += texto;


            }



        });





        // Procurar data na linha completa

        let dataEncontrada = linhaTexto.match(
            /\d{2}[-\/]\d{2}[-\/]\d{4}/
        );


        if(dataEncontrada){

            data = dataEncontrada[0];

        }




        // Procurar idade na linha completa

        let idadeEncontrada = linhaTexto.match(
            /\d+\s*(Anos|anos)/
        );


        if(idadeEncontrada){

            idade = idadeEncontrada[0];

        }





        numero = numero.trim();

        nome = nome.trim();

        sexo = sexo.trim();

        data = data.trim();

        idade = idade.trim();






        if(
            numero &&
            nome &&
            /^\d+$/.test(numero)
        ){


            alunos.push({

                numero:numero,

                nome:nome,

                sexo:sexo,

                dataNascimento:data,

                idade:idade

            });


        }



    });






    // remover números repetidos

    let resultado = [];

    let usados = new Set();



    alunos.forEach(aluno=>{


        if(!usados.has(aluno.numero)){


            usados.add(aluno.numero);


            resultado.push(aluno);


        }


    });



    return resultado;


            }
