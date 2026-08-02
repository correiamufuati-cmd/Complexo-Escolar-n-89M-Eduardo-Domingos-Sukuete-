const aluno = JSON.parse(
    localStorage.getItem("alunoLogado")
);


if(!aluno){

alert("Sessão não encontrada");

window.location.href="student-area.html";

}
else{


document.getElementById("nomeAluno").innerHTML =
"👨‍🎓 " + aluno.nome;


document.getElementById("turma").innerHTML =
"Turma: " + aluno.turmaNome;



}
