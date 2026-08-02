const aluno = JSON.parse(
    localStorage.getItem("alunoLogado")
);


if(!aluno){

    alert("Nenhum aluno autenticado");

    window.location.href = "student-login.html";

}



// Mostrar dados

document.getElementById("nomeAluno").innerHTML =
"👨‍🎓 " + aluno.nome;


document.getElementById("codigo").innerHTML =
"Código: " + aluno.codigoAluno;


document.getElementById("turma").innerHTML =
"Turma: " + aluno.turmaNome;


document.getElementById("estado").innerHTML =
"Estado: " + (aluno.estado || "ativo");
