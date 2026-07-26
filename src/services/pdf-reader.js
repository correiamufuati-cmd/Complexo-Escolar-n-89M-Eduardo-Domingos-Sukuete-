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


    items.forEach(item=>{


        let x = item.transform[4];
        let y = Math.round(item.transform[5]);


        if(!linhas[y]){

            linhas[y] = [];

        }


        linhas[y].push({

            texto:item.str.trim(),
            x:x

        });


    });



    let alunos = [];


    Object.values(linhas).forEach(linha=>{


        linha.sort((a,b)=>a.x-b.x);



        let numero = "";
        let nome = "";
        let sexo = "";
        let data = "";
        let idade = "";



        linha.forEach(campo=>{


            let texto = campo.texto;



            // Nº (primeira coluna)
            if(!numero && /^\d+$/.test(texto)){

                numero = texto;
                return;

            }



            // Sexo
            if(texto==="M" || texto==="F"){

                sexo = texto;
                return;

            }



            // Data
            if(/\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(texto)){

                data = texto;
                return;

            }



            // Idade
            if(/\d+/.test(texto) && texto.length <= 2){

                idade = texto;
                return;

            }



            // Nome
            if(numero){

                nome += texto + " ";

            }


        });



        if(numero && nome.trim()){


            alunos.push({

                numero:numero,

                nome:nome.trim(),

                sexo:sexo,

                data:data,

                idade:idade

            });


        }


    });



    return alunos;


            }
