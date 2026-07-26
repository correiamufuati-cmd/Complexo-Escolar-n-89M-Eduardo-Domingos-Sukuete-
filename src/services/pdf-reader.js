export async function lerPDF(file){


    const dados = await file.arrayBuffer();


    const pdf = await pdfjsLib.getDocument({
        data:dados
    }).promise;



    let todosAlunos = [];



    for(let pagina = 1; pagina <= pdf.numPages; pagina++){


        const page = await pdf.getPage(pagina);


        const content = await page.getTextContent();



        const alunos = extrairAlunosPorLinha(content.items);



        todosAlunos.push(...alunos);


    }



    return todosAlunos;


}





function extrairAlunosPorLinha(items){


    let linhas = {};



    // Agrupar textos pela posição vertical

    items.forEach(item=>{


        let y = Math.round(item.transform[5]);


        if(!linhas[y]){

            linhas[y] = [];

        }


        linhas[y].push({

            texto:item.str.trim(),

            x:item.transform[4]

        });


    });





    let alunos = [];



    Object.values(linhas).forEach(linha=>{


        // ordenar da esquerda para direita

        linha.sort((a,b)=>a.x-b.x);



        let textos = linha.map(x=>x.texto);



        let numero = "";

        let nome = "";

        let sexo = "";

        let data = "";

        let idade = "";





        // número

        if(/^\d+$/.test(textos[0])){


            numero = textos[0];


        }else{

            return;

        }






        textos.shift();




        textos.forEach(campo=>{


            if(campo==="M" || campo==="F"){


                sexo = campo;

                return;

            }




            if(/\d{1,2}\s*-\s*\d{1,2}\s*-\s*\d{4}/.test(campo)){


                data = campo;

                return;

            }





            if(/\d+\s*(anos|ano)/i.test(campo)){


                idade = campo;

                return;

            }





            nome += campo + " ";



        });






        if(nome.trim() && sexo){


            alunos.push({

                numero,

                nome:nome.trim(),

                sexo,

                data,

                idade


            });


        }



    });





    return alunos;


    }
