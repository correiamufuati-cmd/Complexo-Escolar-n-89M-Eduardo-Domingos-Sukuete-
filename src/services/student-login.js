alert("student-login.js carregou");

const form = document.getElementById("loginAluno");

alert("Form encontrado: " + form);

form.addEventListener("submit", (e)=>{

    e.preventDefault();

    const codigo = document.getElementById("codigoAluno").value;
    const senha = document.getElementById("senhaAluno").value;

    alert(
        "Código: " + codigo +
        "\nSenha: " + senha
    );

});
