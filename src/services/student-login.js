alert("LOGIN ALUNO JS df CARREGADO ✅");


import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


/* =====================================================
   FORMULÁRIO
===================================================== */

const form =
    document.getElementById("loginAluno");


if (!form) {

    alert(
        "Formulário de login não encontrado."
    );

    throw new Error(
        "loginAluno não encontrado."
    );

}


/* =====================================================
   LOGIN
===================================================== */

form.addEventListener(
    "submit",
    async (e) => {

        e.preventDefault();


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


            /* =========================================
               BUSCAR TURMAS
            ========================================= */

            const turmasSnapshot =
                await getDocs(
                    collection(
                        db,
                        "turmas"
                    )
                );


            let alunoEncontrado =
                null;


            /* =========================================
               PERCORRER TURMAS
            ========================================= */

            for (
                const turmaDoc
                of turmasSnapshot.docs
            ) {


                const turmaDados =
                    turmaDoc.data();


                /* =====================================
                   ALUNOS DA TURMA
                ===================================== */

                const alunosSnapshot =
                    await getDocs(

                        collection(
                            db,
                            "turmas",
                            turmaDoc.id,
                            "alunos"
                        )

                    );


                /* =====================================
                   PROCURAR ALUNO
                ===================================== */

                for (
                    const alunoDoc
                    of alunosSnapshot.docs
                ) {


                    const dados =
                        alunoDoc.data();


                    const codigoFirestore =
                        String(
                            dados.codigoAluno || ""
                        ).trim();


                    const senhaFirestore =
                        String(
                            dados.senhaAcesso || ""
                        ).trim();


                    /* =================================
                       COMPARAR LOGIN
                    ================================= */

                    if (
                        codigoFirestore ===
                        codigoAluno
                        &&
                        senhaFirestore ===
                        senha
                    ) {


                        alunoEncontrado = {

                            id:
                                alunoDoc.id,


                            turmaId:
                                turmaDoc.id,


                            nome:
                                dados.nome || "",


                            codigoAluno:
                                dados.codigoAluno || "",


                            /*
                             IMPORTANTE:
                             número usado também
                             no sistema de notas
                            */

                            numero:
                                String(
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

                }


                if (alunoEncontrado) {

                    break;

                }

            }


            /* =========================================
               LOGIN INVÁLIDO
            ========================================= */

            if (!alunoEncontrado) {

                alert(
                    "Código ou senha incorretos."
                );

                return;

            }


            /* =========================================
               GUARDAR SESSÃO
            ========================================= */

            localStorage.setItem(

                "alunoLogado",

                JSON.stringify(
                    alunoEncontrado
                )

            );


            /* =========================================
               CONFIRMAÇÃO
            ========================================= */

            alert(

                "LOGIN OK ✅\n\n" +

                "Nome: " +
                alunoEncontrado.nome +

                "\nCódigo: " +
                alunoEncontrado.codigoAluno +

                "\nNúmero: " +
                alunoEncontrado.numero +

                "\nTurma: " +
                alunoEncontrado.turmaNome

            );


            /* =========================================
               ABRIR ÁREA DO ALUNO
            ========================================= */

            window.location.href =
                "/Complexo-Escolar-n-89M-Eduardo-Domingos-Sukuete-/src/pages/student-area.html";


        }

        catch (error) {


            console.error(
                "Erro no login:",
                error
            );


            alert(

                "Erro no login:\n\n" +
                error.message

            );

        }

    }

);
