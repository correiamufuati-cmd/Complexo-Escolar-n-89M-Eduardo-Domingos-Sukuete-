alert("ÁREA DO ALUNO JS CARREGADA ✅");



const dados =
localStorage.getItem("alunoLogado");



if(!dados){

    alert(
        "Sessão expirada. Faça login novamente."
    );

    window.location.href =
        "student-login.html";

    throw new Error(
        "Aluno não encontrado no localStorage."
    );

}



let aluno;



try{

    aluno = JSON.parse(dados);

}catch(error){

    alert(
        "Erro ao ler os dados do aluno."
    );

    localStorage.removeItem(
        "alunoLogado"
    );

    window.location.href =
        "student-login.html";

    throw error;

}



alert(
    "Aluno carregado ✅\n\n" +
    "Nome: " +
    (aluno.nome || "") +
    "\nCódigo: " +
    (aluno.codigoAluno || "")
);




/* ==========================
   DADOS DO ALUNO
========================== */


const nomeAluno =
document.getElementById("nomeAluno");


const codigo =
document.getElementById("codigo");


const turma =
document.getElementById("turma");


const estado =
document.getElementById("estado");



if(nomeAluno){

    nomeAluno.textContent =
        aluno.nome || "Aluno";

}



if(codigo){

    codigo.textContent =
        "Código: " +
        (aluno.codigoAluno || "");

}



if(turma){

    turma.textContent =
        "Turma: " +
        (aluno.turmaNome || "Não definida");

}



if(estado){

    estado.textContent =
        "Estado: " +
        (aluno.estado || "ativo");

}



/* ==========================
   VER NOTAS
========================== */


window.verNotas = function(){

    alert(
        "📊 Notas\n\n" +
        "O módulo de notas será carregado aqui."
    );

};



/* ==========================
   VER BOLETIM
========================== */


window.verBoletim = function(){

    if(aluno.boletimUrl){

        window.open(
            aluno.boletimUrl,
            "_blank"
        );

        return;

    }


    alert(
        "📄 Boletim\n\n" +
        "O boletim deste aluno ainda não está disponível."
    );

};



/* ==========================
   DADOS PESSOAIS
========================== */


window.verDados = function(){

    alert(

        "👤 DADOS DO ALUNO\n\n" +

        "Nome: " +
        (aluno.nome || "") +

        "\n\nCódigo: " +
        (aluno.codigoAluno || "") +

        "\n\nSexo: " +
        (aluno.sexo || "") +

        "\n\nTurma: " +
        (aluno.turmaNome || "") +

        "\n\nEstado: " +
        (aluno.estado || "")

    );

};



/* ==========================
   ALTERAR SENHA
========================== */


window.alterarSenha = function(){

    alert(
        "🔐 Alterar senha\n\n" +
        "Esta função será implementada na próxima etapa."
    );

};



/* ==========================
   SAIR
========================== */


window.sairAluno = function(){

    const confirmar =
        confirm(
            "Deseja realmente sair da sua conta?"
        );


    if(!confirmar){

        return;

    }


    localStorage.removeItem(
        "alunoLogado"
    );


    window.location.href =
        "student-login.html";

};
