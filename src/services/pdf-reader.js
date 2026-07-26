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


    let i = 0;



    while(i < items.length){


        let valor = items[i].str.trim();



        if(valor === "N°"){


            iniciar = true;

            i++;

            continue;

        }



        if(!iniciar){

            i++;

            continue;

        }



        if(/^\d+$/.test(valor)){



            let numero = valor;


            i++;


            let nome = "";

            let sexo = "";




            while(i < items.length){


                let campo = items[i].str.trim();



                if(campo === "M" || campo === "F"){


                    sexo = campo;

                    break;

                }



                if(campo !== ""){


                    nome += campo + " ";

                }


                i++;


            }



            i++;


            let data = "";



            while(i < items.length){


                let campo = items[i].str.trim();



                if(/^\d{4}$/.test(campo)){


                    data += campo;


                    i++;

                    break;

                }



                if(campo !== ""){


                    data += campo + " ";

                }


                i++;


            }



            let idade = "";



            while(i < items.length){


                let campo = items[i].str.trim();



                if(/\d+\s?(anos|Anos|ano)/i.test(campo)){


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

                idade


            });



        }



        i++;


    }



    return alunos;


}
