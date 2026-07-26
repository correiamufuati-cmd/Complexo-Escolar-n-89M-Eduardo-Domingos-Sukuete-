import * as pdfjsLib from 
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";


pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";



export async function lerPDF(file){


const dados = await file.arrayBuffer();


const pdf = await pdfjsLib.getDocument({
data:dados
}).promise;



let textoCompleto = "";



for(let p=1; p<=pdf.numPages; p++){


const pagina = await pdf.getPage(p);


const conteudo = await pagina.getTextContent();



let texto = conteudo.items
.map(i=>i.str)
.join(" ");



textoCompleto += texto + "\n";


}



console.log(textoCompleto);



let alunos = extrairAlunos(textoCompleto);



let turma = extrairTurma(textoCompleto);



return {

turma: turma,

alunos: alunos,

quantidade: alunos.length

};


}




function extrairTurma(texto){


let t = texto.match(/Turma\s*[:\-]?\s*([A-Za-z0-9ªº]+)/i);


return t ? t[1] : "Sem turma";


}





function extrairAlunos(texto){


let alunos=[];



let linhas = texto
.split("\n")
.map(l=>l.trim())
.filter(l=>l.length>0);



for(let i=0;i<linhas.length;i++){



let linha = linhas[i];



let matricula =
linha.match(/\b\d{1,5}\b/);



let sexo =
linha.match(/\b(M|F)\b/i);



if(matricula && sexo){



let nome = linha
.replace(matricula[0],"")
.replace(sexo[0],"")
.trim();



if(nome.length>3){


alunos.push({

matricula:matricula[0],

nome:nome,

sexo:sexo[0].toUpperCase()

});


}


}



}



return alunos;


    }
