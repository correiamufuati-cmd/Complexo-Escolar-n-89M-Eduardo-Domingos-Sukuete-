export async function lerPDF(file){


    const dados = await file.arrayBuffer();


    const pdf = await pdfjsLib.getDocument({
        data:dados
    }).promise;



    let todosTextos = [];



    for(let pagina = 1; pagina <= pdf.numPages; pagina++){


        const page = await pdf.getPage(pagina);


        const content = await page.getTextContent();



        content.items.forEach(item=>{


            let texto = item.str.trim();


            if(texto){

                todosTextos.push(texto);

            }


        });


    }



    return extrairAlunos(todosTextos);


}





function extrairAlunos(textos){


    let alunos = [];



    let inicio = false;



    let i = 0;



    while(i < textos.length){



        // Procurar início da tabela

        if(
            textos[i] === "N°" ||
            textos[i] === "Nº"
        ){

            inicio = true;

        }



        if(!inicio){

            i++;

            continue;

        }



        // Ignorar cabeçalhos repetidos

        if(
            textos[i] === "N°" ||
            textos[i] === "Nº" ||
            textos[i] === "Nome" ||
            textos[i] === "Completo" ||
            textos[i] === "Sexo"
        ){

            i++;

            continue;

        }





        // Encontrar número do aluno

        if(/^\d+$/.test(textos[i])){


            let numero = textos[i];


            i++;



            let nome = "";

            let sexo = "";

            let data = "";

            let idade = "";




            // Nome até M ou F

            while(i < textos.length){


                if(textos[i] === "M" || textos[i] === "F"){


                    sexo = textos[i];

                    i++;

                    break;

                }



                nome += textos[i] + " ";

                i++;


            }






            // Data nascimento

            let dataPartes = [];



            while(i < textos.length){



                if(/^\d+$/.test(textos[i])){


                    dataPartes.push(textos[i]);


                    i++;


                    if(dataPartes.length === 3){

                        break;

                    }


                }else{

                    i++;

                }


            }




            if(dataPartes.length === 3){


                data =
                dataPartes[0] +
                "-" +
                dataPartes[1] +
                "-" +
                dataPartes[2];


            }





            // Idade

            while(i < textos.length){


                if(
                    /\d+\s*(anos|Anos|ano)/i.test(textos[i])
                ){


                    idade = textos[i];

                    i++;

                    break;


                }


                i++;


            }





            if(numero && nome && sexo){


                alunos.push({

                    numero,

                    nome:nome.trim(),

                    sexo,

                    data,

                    idade


                });


            }




        }else{


            i++;


        }



    }



    return alunos;


                                       }
