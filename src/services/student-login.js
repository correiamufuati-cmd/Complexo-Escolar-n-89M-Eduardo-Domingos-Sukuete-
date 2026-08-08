// =====================================================
// LOGIN DO ALUNO - SGE
// Procura primeiro em "alunos"
// Depois procura dentro de "turmas/{turmaId}/alunos"
// =====================================================

alert("STUDENT-LOGIN.JS sCgARREGOU ✅");


import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// =====================================================
// FORMULÁRIO
// =====================================================

const form =
    document.getElementById("loginAluno");


if (!form) {

    alert("Formulário loginAluno não encontrado.");

    throw new Error(
        "loginAluno não encontrado."
    );

}


// =====================================================
// SUBMIT
// =====================================================

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const codigoAluno =
            document
                .getElementById("codigoAluno")
                .value
                .trim();


        const senha =
            document
                .getElementById("senhaAluno")
                .value
                .trim();


        if (!codigoAluno || !senha) {

            alert(
                "Preencha o código e a senha."
            );

            return;

        }


        try {

            alert("Procurando aluno...");


            let alunoEncontrado = null;


            // =================================================
            // 1. PROCURAR NA COLEÇÃO PRINCIPAL "alunos"
            // =================================================

            const alunosSnapshot =
                await getDocs(
                    collection(
                        db,
                        "alunos"
                    )
                );


            for (
                const alunoDoc
                of alunosSnapshot.docs
            ) {

                const dados =
                    alunoDoc.data();


                const codigo =
                    String(
                        dados.codigoAluno || ""
                    ).trim();


                const senhaFirebase =
                    String(
                        dados.senha || ""
                    ).trim();


                if (
                    codigo === codigoAluno &&
                    senhaFirebase === senha
                ) {

                    alunoEncontrado = {

                        id:
                            alunoDoc.id,

                        nome:
                            dados.nome || "",

                        codigoAluno:
                            codigo,

                        numero:
                            dados.numero || "",

                        sexo:
                            dados.sexo || "",

                        estado:
                            String(
                                dados.estado ||
                                "ativo"
                            ).trim(),

                        classe:
                            dados.classe || "",

                        ensino:
                            dados.ensino || "",

                        anoLetivo:
                            dados.anoLetivo || "",

                        turmaId:
                            dados.turmaId || "",

                        turmaNome:
                            dados.turmaNome || "",

                        origem:
                            "alunos"

                    };


                    break;

                }

            }


            // =================================================
            // 2. SE NÃO ENCONTROU, PROCURAR NAS TURMAS
            // =================================================

            if (!alunoEncontrado) {


                console.log(
                    "Aluno não encontrado em alunos. Procurando nas turmas..."
                );


                const turmasSnapshot =
                    await getDocs(
                        collection(
                            db,
                            "turmas"
                        )
                    );


                for (
                    const turmaDoc
                    of turmasSnapshot.docs
                ) {


                    const turmaDados =
                        turmaDoc.data();


                    const alunosTurmaSnapshot =
                        await getDocs(

                            collection(
                                db,
                                "turmas",
                                turmaDoc.id,
                                "alunos"
                            )

                        );


                    for (
                        const alunoDoc
                        of alunosTurmaSnapshot.docs
                    ) {


                        const dados =
                            alunoDoc.data();


                        const codigo =
                            String(
                                dados.codigoAluno || ""
                            ).trim();


                        const senhaFirebase =
                            String(
                                dados.senhaAcesso || ""
                            ).trim();


                        if (
                            codigo === codigoAluno &&
                            senhaFirebase === senha
                        ) {


                            alunoEncontrado = {

                                id:
                                    alunoDoc.id,

                                turmaId:
                                    turmaDoc.id,

                                nome:
                                    dados.nome || "",

                                codigoAluno:
                                    codigo,

                                numero:
                                    dados.numero || "",

                                senhaAcesso:
                                    senhaFirebase,

                                sexo:
                                    dados.sexo || "",

                                estado:
                                    String(
                                        dados.estado ||
                                        "ativo"
                                    ).trim(),

                                classe:
                                    dados.classe ||
                                    turmaDados.classe ||
                                    "",

                                ensino:
                                    dados.ensino ||
                                    turmaDados.ensino ||
                                    "",

                                anoLetivo:
                                    dados.anoLetivo ||
                                    turmaDados.anoLetivo ||
                                    "",

                                turmaNome:
                                    dados.turmaNome ||
                                    turmaDados.nome ||
                                    "",

                                origem:
                                    "turma"

                            };


                            break;

                        }

                    }


                    if (alunoEncontrado) {

                        break;

                    }

                }

            }


            // =================================================
            // 3. NÃO ENCONTROU
            // =================================================

            if (!alunoEncontrado) {

                alert(
                    "Código ou senha incorretos."
                );

                return;

            }


            // =================================================
            // 4. GUARDAR SESSÃO
            // =================================================

            localStorage.setItem(
                "alunoLogado",
                JSON.stringify(
                    alunoEncontrado
                )
            );


            console.log(
                "ALUNO ENCONTRADO:",
                alunoEncontrado
            );


            // =================================================
            // 5. CONFIRMAÇÃO
            // =================================================

            alert(

                "LOGIN REALIZADO COM SUCESSO ✅\n\n" +

                "Nome: " +
                alunoEncontrado.nome +

                "\nCódigo: " +
                alunoEncontrado.codigoAluno +

                "\nNúmero: " +
                (
                    alunoEncontrado.numero ||
                    "não informado"
                ) +

                "\nTurma ID: " +
                alunoEncontrado.turmaId

            );


            // =================================================
            // 6. ÁREA DO ALUNO
            // =================================================

            window.location.href =
                "/Complexo-Escolar-n-89M-Eduardo-Domingos-Sukuete-/src/pages/student-area.html";

        }


        catch (error) {

            console.error(
                "ERRO NO LOGIN:",
                error
            );


            alert(
                "Erro no login:\n\n" +
                error.message
            );

        }

    }

);
