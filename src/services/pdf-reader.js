export async function lerPDF(file){

    const dados = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
        data:dados
    }).promise;


    let todosAlunos = [];


    for(let pagina = 1; pagina <= pdf.numPages; pagina++){

        const page = await pdf.getPage(pagina);

        const content = await page.getTextContent();


        const alunos = extrairAlunos(content.items);


        todosAlunos.push(...alunos);

    }


    return todosAlunos;

}





function extrairAlunos(items){


    let alunos = [];

    let iniciar = false;


    for(let i = 0; i < items.length; i++){


        let valor = items[i].str.trim();



        if(valor === "Nº" || valor === "N°"){

            iniciar = true;

            continue;

        }



        if(!iniciar){

            continue;

        }



        // encontra o número da linha

        if(/^\d+$/.test(valor)){


            let numero = valor;


            let nome = "";
            let sexo = "";
            let data = "";
            let idade = "";



            i++;



            // nome

            while(i < items.length){


                let campo = items[i].str.trim();



                if(campo === "M" || campo === "F"){

                    sexo = campo;

                    break;

                }



                nome += campo + " ";

                i++;

            }




            i++;



            // data nascimento

            while(i < items.length){


                let campo = items[i].str.trim();



                if(/\d{2}/.test(campo) && campo.includes("-")){


                    data = campo;

                    break;

                }



                if(campo !== ""){

                    data += campo + " ";

                }


                i++;

            }





            i++;





            // idade

            while(i < items.length){


                let campo = items[i].str.trim();



                if(/\d+\s*(anos|Anos|ano|Anos)/i.test(campo)){


                    idade = campo;

                    break;

                }


                i++;

            }



            alunos.push({

                numero,

                nome:nome.trim(),

                sexo,

                data:data.trim(),

                idade:idade.trim()

            });


        }


    }



    return alunos;

            }
