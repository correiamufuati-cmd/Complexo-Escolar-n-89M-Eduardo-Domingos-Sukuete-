export async function lerPDF(file){


    const dados = await file.arrayBuffer();


    const pdf = await pdfjsLib.getDocument({
        data:dados
    }).promise;



    let itens = [];



    for(let pagina = 1; pagina <= pdf.numPages; pagina++){


        const page = await pdf.getPage(pagina);


        const content = await page.getTextContent();


        itens.push(...content.items);


    }



    const alunos = extrairAlunos(itens);



    return alunos;

}





function extrairAlunos(items){

    let alunos = [];

    let inicio = false;


    for(let i = 0; i < items.length; i++){


        let valor = items[i].str.trim();


        if(valor === "N°"){
            inicio = true;
            continue;
        }


        if(!inicio){
            continue;
        }


        // número do aluno
        if(/^\d+$/.test(valor) && Number(valor) <= 100){


            let numero = valor;

            let nome = "";
            let sexo = "";
            let data = "";
            let idade = "";


            i++;


            // nome até encontrar sexo
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



            if(!sexo){
                continue;
            }



            i++;


            // data nascimento
            while(i < items.length){

                let campo = items[i].str.trim();


                if(/\d{4}/.test(campo)){

                    data += campo;
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


                if(/anos|Anos|ano/i.test(campo)){

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


    }


    return alunos;

}
