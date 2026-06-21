import { criarAluno } from "./script.js";

export async function lerPDF(file, turma, escolaId){

const reader = new FileReader();

reader.onload = async function(){

const pdf = await pdfjsLib.getDocument({
data: new Uint8Array(this.result)
}).promise;

let texto = "";

for(let i=1;i<=pdf.numPages;i++){
const page = await pdf.getPage(i);
const content = await page.getTextContent();

texto += content.items.map(x=>x.str).join(" ") + "\n";
}

const nomes = texto.split("\n").filter(n=>n.trim().length > 3);

for(const nome of nomes){

await criarAluno({
escolaId,
nome,
turma,
matricula: "2026-"+Math.floor(Math.random()*999999),
username: nome.toLowerCase().replace(/\s/g,"").slice(0,6),
senha: Math.random().toString(36).slice(2,10).toUpperCase()
});

}

alert("PDF importado com sucesso!");
};

reader.readAsArrayBuffer(file);
}
