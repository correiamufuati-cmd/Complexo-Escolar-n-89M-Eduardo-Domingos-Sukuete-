const aluno = JSON.parse(
    localStorage.getItem("alunoLogado")
);


if(aluno){

    document.getElementById("nomeAluno").innerHTML =
    "👨‍🎓 " + aluno.nome;

}


window.voltar = function(){

    window.location.href =
    "student-area.html";

};
