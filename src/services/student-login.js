// =====================================================
// LOGIN DO ALUNO
// SGE - Sistema de Gestão Escolar
// =====================================================

alert("STUDENT-LOGIN.JS Df CARREGOU ✅");


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

    alert(
        "ERRO: formulário loginAluno não encontrado."
    );

    throw new Error(
        "Elemento #loginAluno não encontrado."
    );

}


// =====================================================
// LOGIN
// =====================================================

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // ---------------------------------------------
        // CAMPOS
        // ---------------------------------------------

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


        // ---------------------------------------------
        // VALIDAR
        // ---------------------------------------------

        if (!codigoAluno || !senha) {

            alert(
                "Preencha o código do aluno e a senha."
            );

            return;

        }


        try {

            alert(
                "Procurando aluno..."
            );


            // =========================================
            // BUSCAR TURMAS
            // =========================================

            const turmasSnapshot =
                await getDocs(
                    collection(
                        db,
                        "turmas"
                    )
                );


            console.log(
                "Turmas encontradas:",
                turmasSnapshot.size
            );


            let alunoEncontrado = null;


            // =========================================
            // PERCORRER TURMAS
            // =========================================

            for (
                const turmaDoc
                of turmasSnapshot.docs
            ) {


                const turmaDados =
                    turmaDoc.data();


                console.log(
                    "Procurando na turma:",
                    turmaDoc.id
                );


                // =====================================
                // BUSCAR ALUNOS DA TURMA
                // =====================================

                const alunosSnapshot =
                    await getDocs(

                        collection(
                            db,
                            "turmas",
                            turmaDoc.id,
                            "alunos"
                        )

                    );


                console.log(
                    "Alunos encontrados:",
                    alunosSnapshot.size
                );


                // =====================================
                // PERCORRER ALUNOS
                // =====================================

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


                    console.log(
                        "Aluno:",
                        dados.nome,
                        "Código:",
                        codigoFirestore
                    );


                    // =================================
                    // VERIFICAR LOGIN
                    // =================================

                    if (
                        codigoFirestore ===
                            codigoAluno
                        &&
                        senhaFirestore ===
                            senha
                    ) {


                        // =============================
                        // ALUNO ENCONTRADO
                        // =============================

                        alunoEncontrado = {

                            id:
                                alunoDoc.id,

                            turmaId:
                                turmaDoc.id,

                            nome:
                                dados.nome || "",

                            codigoAluno:
                                String(
                                    dados.codigoAluno || ""
                                ).trim(),

                            numero:
                                String(
                                    dados.numero || ""
                                ).trim(),

                            turmaNome:
                                dados.turmaNome ||
                                turmaDados.nome ||
                                turmaDoc.id,

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


                // =====================================
                // PARAR SE ENCONTROU
                // =====================================

                if (alunoEncontrado) {

                    break;

                }

            }


            // =========================================
            // NÃO ENCONTROU
            // =========================================

            if (!alunoEncontrado) {

                alert(
                    "Código ou senha incorretos."
                );

                return;

            }


            // =========================================
            // GUARDAR SESSÃO
            // =========================================

            localStorage.setItem(

                "alunoLogado",

                JSON.stringify(
                    alunoEncontrado
                )

            );


            console.log(
                "ALUNO GUARDADO:",
                alunoEncontrado
            );


            // =========================================
            // CONFIRMAÇÃO
            // =========================================

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


            // =========================================
            // ABRIR ÁREA DO ALUNO
            // =========================================

            window.location.href =
                "/Complexo-Escolar-n-89M-Eduardo-Domingos-Sukuete-/src/pages/student-area.html";


        }

        catch (error) {

            console.error(
                "ERRO COMPLETO:",
                error
            );


            alert(

                "ERRO NO LOGIN\n\n" +
                error.message

            );

        }

    }

);
