import * as pdfjsLib from 
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";


pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";



export async function lerPDF(file){


const dados = await file.arrayBuffer();


const pdf = await pdfjsLib.getDocument({
    data:dados
}).promise;



let todosAlunos = [];

let turmaInfo = {};



for(let pagina = 1; pagina <= pdf.numPages; pagina++){


    const page = await pdf.getPage(pagina);


    const content = await page.getTextContent();



    // Ler dados da turma
    const dadosTurma = extrairDadosTurma(content.items);


    if(dadosTurma.classe || dadosTurma.turma){

        turmaInfo = dadosTurma;

    }



    // Ler alunos
    const alunosPagina = extrairAlunos(content.items);


    todosAlunos.push(...alunosPagina);



}



// TESTE
console.log("TURMA ENCONTRADA:", turmaInfo);
console.log("TOTAL ALUNOS:", todosAlunos.length);



return {


    turma: turmaInfo,


    alunos: todosAlunos,


    quantidade: todosAlunos.length


};



}







function extrairDadosTurma(items){


const texto = items
.map(item=>item.str.trim())
.join(" ");



let classe = "";
let turma = "";
let ano = "";



// Classe

let c = texto.match(/Classe\s*[:\-]?\s*(\d+)/i);


if(c){

    classe = c[1] + "ª";

}




// Turma

let t = texto.match(/Turma\s*[:\-]?\s*([A-Z])/i);


if(t){

    turma = t[1].toUpperCase();

}




// Ano lectivo

let a = texto.match(/20\d{2}\s*\/\s*20\d{2}/);


if(a){

    ano = a[0];

}




return {

    classe,

    turma,

    ano

};


}









function extrairAlunos(items){


let alunos = [];


let iniciar = false;



for(let i = 0; i < items.length; i++){


let valor = items[i].str.trim();



if(valor === "N°" || valor === "Nº"){


    iniciar = true;

    continue;

}




if(!iniciar){

    continue;

}





if(/^\d+$/.test(valor)){


    let numero = valor;


    let nome = "";

    let sexo = "";



    i++;



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




    if(nome.trim() !== ""){


        alunos.push({

            numero: numero,

            nome: nome.trim(),

            sexo: sexo


        });


    }



}



}



return alunos;



    }
