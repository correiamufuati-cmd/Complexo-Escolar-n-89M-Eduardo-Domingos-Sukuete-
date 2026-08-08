alert("ÁREA DO ALUNO JS CARREGADA ✅");

const dados = localStorage.getItem("alunoLogado");


if (!dados) {

    window.location.href = "student-login.html";

    throw new Error("Aluno não está autenticado.");

}


const aluno = JSON.parse(dados);


/* =========================
   MOSTRAR DADOS
========================= */


document.getElementById("nomeAluno").textContent =
    aluno.nome || "Aluno";


document.getElementById("codigo").textContent =
    "Código: " + (aluno.codigoAluno || "—");


document.getElementById("turma").textContent =
    "Turma: " + (aluno.turmaNome || "—");


document.getElementById("estado").textContent =
    "Estado: " + (aluno.estado || "ativo");



/* =========================
   NOTAS
========================= */

window.verNotas = function () {

    alert(
        "📊 NOTAS\n\n" +
        "O módulo de notas será disponibilizado aqui."
    );

};



/* =========================
   BOLETIM
========================= */

window.verBoletim = function () {

    if (aluno.boletimUrl) {

        window.open(
            aluno.boletimUrl,
            "_blank"
        );

    } else {

        alert(
            "📄 O boletim ainda não está disponível."
        );

    }

};



/* =========================
   DADOS
========================= */

window.verDados = function () {

    alert(

        "👤 DADOS DO ALUNO\n\n" +

        "Nome: " +
        (aluno.nome || "—") +

        "\n\nCódigo: " +
        (aluno.codigoAluno || "—") +

        "\n\nNúmero: " +
        (aluno.numero || "—") +

        "\n\nSexo: " +
        (aluno.sexo || "—") +

        "\n\nTurma: " +
        (aluno.turmaNome || "—") +

        "\n\nEstado: " +
        (aluno.estado || "—")

    );

};



/* =========================
   ALTERAR SENHA
========================= */

window.alterarSenha = function () {

    alert(
        "🔐 Alterar senha\n\n" +
        "Vamos implementar esta função depois."
    );

};



/* =========================
   SAIR
========================= */

window.sairAluno = function () {

    localStorage.removeItem(
        "alunoLogado"
    );

    window.location.href =
        "student-login.html";

};

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
