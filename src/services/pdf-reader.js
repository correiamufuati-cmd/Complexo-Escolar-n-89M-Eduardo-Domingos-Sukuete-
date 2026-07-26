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



    // ordenar pelo número do aluno

    todosAlunos.sort((a,b)=>{

        return Number(a.numero) - Number(b.numero);

    });



    return todosAlunos;


}






function extrairAlunos(items){


    let linhas = {};



    items.forEach(item=>{


        let texto = item.str.trim();


        if(!texto) return;



        let y = Math.round(item.transform[5]);



        if(!linhas[y]){

            linhas[y] = [];

        }



        linhas[y].push({

            texto:texto,

            x:item.transform[4]

        });



    });




    let alunos = [];



    Object.values(linhas).forEach(linha=>{


        linha.sort((a,b)=>a.x-b.x);



        let campos = linha.map(i=>i.texto);



        // precisa começar por número

        if(!/^\d+$/.test(campos[0])) return;



        let numero = campos[0];



        // ignorar números grandes do cabeçalho

        if(Number(numero) > 100){

            return;

        }



        let posSexo = campos.findIndex(c=>c==="M" || c==="F");



        if(posSexo === -1) return;



        let nome = campos
        .slice(1,posSexo)
        .join(" ");




        if(nome.length < 5) return;



        let depoisSexo = campos.slice(posSexo+1);



        let numeros = depoisSexo.filter(c=>/^\d+$/.test(c));



        let data = "";

        let idade = "";



        if(numeros.length >= 3){


            data =
            numeros[0]+"-"+
            numeros[1]+"-"+
            numeros[2];


        }



        let idadeEncontrada = campos.find(c=>
            /\d+\s*(anos|Anos|ano)/i.test(c)
        );



        if(idadeEncontrada){

            idade = idadeEncontrada;

        }





        alunos.push({

            numero,

            nome,

            sexo: campos[posSexo],

            data,

            idade

        });



    });



    return alunos;


    }
