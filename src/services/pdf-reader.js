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


    let inicioTabela = false;


    let i = 0;



    while(i < textos.length){



        // Encontrar início da lista de alunos

        if(
            textos[i] === "N°" ||
            textos[i] === "Nº"
        ){

            inicioTabela = true;

            i++;

            continue;

        }



        if(!inicioTabela){

            i++;

            continue;

        }





        // Ignorar cabeçalhos repetidos das páginas

        if(
            textos[i] === "N°" ||
            textos[i] === "Nº" ||
            textos[i] === "Nome" ||
            textos[i] === "Completo" ||
            textos[i] === "Sexo" ||
            textos[i] === "Data" ||
            textos[i] === "Idade"
        ){

            i++;

            continue;

        }






        // Encontrou número do aluno

        if(/^\d+$/.test(textos[i])){


            let numero = textos[i];

            i++;


            let nome = "";

            let sexo = "";

            let data = "";

            let idade = "";





            // Ler nome até encontrar sexo

            while(i < textos.length){



                if(
                    textos[i] === "M" ||
                    textos[i] === "F"
                ){


                    sexo = textos[i];

                    i++;

                    break;

                }



                nome += textos[i] + " ";

                i++;


            }





            // Ler data nascimento

            let partesData = [];



            while(
                i < textos.length &&
                partesData.length < 3
            ){



                let valor = textos[i];



                if(/^\d+$/.test(valor)){


                    partesData.push(valor);


                }


                i++;


            }




            if(partesData.length === 3){


                data =
                partesData[0] +
                "-" +
                partesData[1] +
                "-" +
                partesData[2];


            }







            // Ler idade

            while(i < textos.length){



                if(
                    /\d+\s*(anos|Anos|ano)/i
                    .test(textos[i])
                ){


                    idade = textos[i];

                    i++;

                    break;


                }


                i++;


            }






            // Guardar aluno

            if(
                numero &&
                nome.trim() &&
                sexo
            ){



                alunos.push({


                    numero: numero,


                    nome: nome.trim(),


                    sexo: sexo,


                    data: data,


                    idade: idade



                });



            }





        }else{


            i++;


        }



    }




    return alunos;


            }
