export async function lerPDF(file){


    const dados = await file.arrayBuffer();


    const pdf = await pdfjsLib.getDocument({
        data:dados
    }).promise;



    let textos = [];



    for(let pagina = 1; pagina <= pdf.numPages; pagina++){


        const page = await pdf.getPage(pagina);


        const content = await page.getTextContent();



        content.items.forEach(item=>{


            let t = item.str.trim();


            if(t){

                textos.push(t);

            }


        });


    }



    let alunos = extrairAlunos(textos);



    alunos.sort((a,b)=>{

        return Number(a.numero) - Number(b.numero);

    });



    return alunos;


}






function extrairAlunos(textos){


    let alunos = [];

    let iniciou = false;



    for(let i = 0; i < textos.length; i++){



        // começar depois do cabeçalho

        if(
            textos[i] === "N°" ||
            textos[i] === "Nº"
        ){

            iniciou = true;

            continue;

        }



        if(!iniciou){

            continue;

        }





        // número do aluno

        if(!/^\d+$/.test(textos[i])){

            continue;

        }



        let numero = textos[i];



        // evitar números do cabeçalho

        if(Number(numero) > 100){

            continue;

        }



        let nome = "";

        let sexo = "";

        let data = "";

        let idade = "";



        let j = i + 1;



        // nome até encontrar M ou F

        while(j < textos.length){


            if(
                textos[j] === "M" ||
                textos[j] === "F"
            ){

                sexo = textos[j];

                j++;

                break;

            }



            nome += textos[j] + " ";

            j++;


        }




        if(!sexo){

            continue;

        }





        // procurar data dia-mês-ano

        let partesData = [];



        while(j < textos.length){



            if(/^\d+$/.test(textos[j])){


                partesData.push(textos[j]);


                if(partesData.length === 3){

                    break;

                }


            }


            j++;


        }




        if(partesData.length === 3){


            data =
            partesData[0] +
            "-" +
            partesData[1] +
            "-" +
            partesData[2];


        }





        // procurar idade

        while(j < textos.length){


            if(
                /\d+\s*(anos|Anos|ano)/i
                .test(textos[j])
            ){


                idade = textos[j];

                break;


            }


            j++;


        }






        if(
            nome.trim().length > 3 &&
            sexo
        ){



            alunos.push({

                numero,

                nome:nome.trim(),

                sexo,

                data,

                idade


            });



        }



    }



    return alunos;


}
