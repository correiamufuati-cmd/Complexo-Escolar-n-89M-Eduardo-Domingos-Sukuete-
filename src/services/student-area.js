const aluno = JSON.parse(
    localStorage.getItem("alunoLogado")
);


if(!aluno){

    alert("Sessão não encontrada");

    window.location.href="../../login-aluno.html";

}
else{


document.getElementById("nomeAluno").innerHTML =
"👨‍🎓 " + (aluno.nome || "");


document.getElementById("codigo").innerHTML =
"Código: " + (aluno.codigoAluno || "");


document.getElementById("turma").innerHTML =
"Turma: " + (aluno.turmaNome || "");


document.getElementById("estado").innerHTML =
"Estado: " + (aluno.estado || "ativo");



document.title =
"Aluno - " + aluno.nome;



window.sairAluno=function(){

    localStorage.removeItem("alunoLogado");

    window.location.href="../../login-aluno.html";

};



window.verNotas=function(){

    window.location.href="student-grades.html";

};


    window.verBoletim = function () {

    window.location.href =
    "student-report.html";

};
    
             }
