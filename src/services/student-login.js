alert("Dário Franco");

const dados = alunoDoc.data();

console.log("================================");
console.log("DADOS COMPLETOS DO ALUNO");
console.log(dados);
console.log("NÚMERO:", dados.numero);
console.log("================================");


if (
    String(dados.codigoAluno || "").trim() === codigoAluno &&
    String(dados.senhaAcesso || "").trim() === senha
) {

    alert(
        "ALUNO ENCONTRADO ✅\n\n" +
        "Nome: " + (dados.nome || "") +
        "\nCódigo: " + (dados.codigoAluno || "") +
        "\nNúmero: " + (dados.numero || "VAZIO") +
        "\nTurma: " + (turmaDados.nome || "")
    );


    alunoEncontrado = {

        id: alunoDoc.id,

        turmaId: turmaDoc.id,

        nome: dados.nome || "",

        codigoAluno: dados.codigoAluno || "",

        numero: String(
            dados.numero || ""
        ).trim(),

        turmaNome:
            dados.turmaNome ||
            turmaDados.nome ||
            "",

        classe:
            dados.classe ||
            turmaDados.classe ||
            "",

        sexo:
            dados.sexo || "",

        estado:
            dados.estado ||
            "ativo",

        anoLetivo:
            dados.anoLetivo ||
            turmaDados.anoLetivo ||
            "",

        ensino:
            dados.ensino ||
            turmaDados.ensino ||
            "",

        boletimUrl:
            dados.boletimUrl ||
            ""

    };

    break;
    }
