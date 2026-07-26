export async function lerPDF(file){


    const dados = await file.arrayBuffer();


    const pdf = await pdfjsLib.getDocument({
        data:dados
    }).promise;



    let todosAlunos = [];



    for(let pagina = 1; pagina <= pdf.numPages; pagina++){


        const page = await pdf.getPage(pagina);

function extrairAlunosPorLinha(items){

    let linhas = [];

    items.forEach(item=>{

        let y = item.transform[5];

        let linhaExistente = linhas.find(l => Math.abs(l.y - y) < 5);


        if(!linhaExistente){

            linhaExistente = {
                y:y,
                itens:[]
            };

            linhas.push(linhaExistente);

        }


        linhaExistente.itens.push({

            texto:item.str.trim(),
            x:item.transform[4]

        });


    });



    let alunos = [];



    linhas.forEach(linha=>{


        linha.itens.sort((a,b)=>a.x-b.x);



        let textos = linha.itens
            .map(i=>i.texto)
            .filter(t=>t);

        console.log(textos);


        if(textos.length < 2) return;



        let numero = textos[0];



        if(!/^\d+$/.test(numero)) return;



        let sexo = textos.find(t=>t==="M" || t==="F");



        if(!sexo) return;



        textos.shift();



        let nome = "";
        let data = "";
        let idade = "";



        textos.forEach(campo=>{


            if(campo==="M" || campo==="F")
                return;



            if(/\d{1,2}\s*[-/]\s*\d{1,2}\s*[-/]\s*\d{4}/.test(campo)){

                data = campo;
                return;

            }



            if(/\d+\s*(anos|ano)/i.test(campo)){

                idade = campo;
                return;

            }



            nome += campo + " ";


        });



        if(nome.trim()){


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
        
        const content = await page.getTextContent();



        const alunos = extrairAlunosPorLinha(content.items);



        todosAlunos.push(...alunos);


    }



    return todosAlunos;


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
