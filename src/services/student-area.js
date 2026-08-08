alert("TESTE 300 - NOVO STUDENT AREA JS");

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



window.sairAluno = function(){

    localStorage.removeItem("alunoLogado");

    window.location.href =
    "../login-aluno.html";

};



window.verNotas=function(){

    window.location.href="student-grades.html";

};


    window.verBoletim = function () {

    window.location.href =
    "student-report.html";

};


    window.verDados = function(){

    window.location.href =
    "student-profile.html";

};

    window.alterarSenha = function(){

    window.location.href =
    "student-password.html";

};

    window.verBoletim = function(){

    const aluno = JSON.parse(
        localStorage.getItem("alunoLogado")
    );


    if(!aluno){

        alert("Aluno não encontrado");

        return;

    }


    if(!aluno.boletimUrl){

        alert("Boletim ainda não disponível");

        return;

    }


    window.open(
        aluno.boletimUrl,
        "_blank"
    );

};
    
             }
