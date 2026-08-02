alert("student-area.js carregou");


const aluno = JSON.parse(
    localStorage.getItem("alunoLogado")
);


alert(JSON.stringify(aluno));


if(!aluno){

    alert("Aluno não encontrado");

    window.location.href = "student-login.html";

}



document.getElementById("nomeAluno").innerHTML =
"👨‍🎓 " + aluno.nome;


document.getElementById("codigo").innerHTML =
"Código: " + aluno.codigoAluno;


document.getElementById("turma").innerHTML =
"Turma: " + aluno.turmaNome;


document.getElementById("estado").innerHTML =
"Estado: " + (aluno.estado || "ativo");
