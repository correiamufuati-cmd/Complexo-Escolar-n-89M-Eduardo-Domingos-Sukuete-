document.getElementById("btnCriarEscola").addEventListener("click", async () => {

const nome = document.getElementById("nomeEscola").value.trim();
const provincia = document.getElementById("provincia").value.trim();
const municipio = document.getElementById("municipio").value.trim();
const anoLetivo = document.getElementById("anoLetivo").value.trim();

if(!nome || !provincia || !municipio || !anoLetivo){
alert("Preenche todos os campos!");
return;
}

try{

const ref = await addDoc(collection(db, "escolas"), {
nome,
provincia,
municipio,
anoLetivo,
criadoEm: Date.now()
});

alert("Escola criada com sucesso! ID: " + ref.id);

carregarEscolas();

}catch(error){
console.error(error);
alert("Erro ao criar escola: " + error.message);
}

});
