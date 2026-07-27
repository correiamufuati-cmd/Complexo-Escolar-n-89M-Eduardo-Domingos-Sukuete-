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



for(let pagina=1; pagina<=pdf.numPages; pagina++){


const page = await pdf.getPage(pagina);


const content = await page.getTextContent();



turmaInfo = extrairDadosTurma(content.items);



const alunos = extrairAlunos(content.items);



todosAlunos.push(...alunos);



}



return {

turma: turmaInfo,

alunos: todosAlunos,

quantidade: todosAlunos.length

};



}




function extrairDadosTurma(items){
function extrairDadosTurma(items){


const texto = items
.map(item=>item.str)
.join(" ")
.replace(/\s+/g," ");



let classe="";
let turma="";
let ano="";



// procura classe
let c = texto.match(/(\d+)\s*[ªa]?\s*Classe/i);

if(c){

classe = c[1]+"ª";

}



// procura turma
let t = texto.match(/Turma\s*[:\-]?\s*([A-Z])/i);

if(t){

turma = t[1].toUpperCase();

}



// procura ano letivo
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


let alunos=[];


let iniciar=false;


let i=0;



while(i < items.length){


let valor=items[i].str.trim();



if(valor==="N°"){


iniciar=true;

i++;

continue;

}



if(!iniciar){

i++;

continue;

}





if(/^\d+$/.test(valor)){



let numero=valor;


i++;


let nome="";

let sexo="";



while(i<items.length){


let campo=items[i].str.trim();



if(campo==="M" || campo==="F"){


sexo=campo;

break;

}



if(campo!==""){

nome+=campo+" ";

}



i++;


}



alunos.push({

numero,

nome:nome.trim(),

sexo


});



}



i++;



}



return alunos;


}
