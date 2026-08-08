// =====================================================
// LOGIN DO ALUNO
// SGE - Sistema de Gestão Escolar
// =====================================================

alert("STUDENT-LOGIN.JS CARREGOU ✅");


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


        // =============================================
        // VALIDAR CAMPOS
        // =============================================

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
            // COLEÇÃO PRINCIPAL DE ALUNOS
            // =========================================

            const alunosSnapshot =
                await getDocs(
                    collection(
                        db,
                        "alunos"
                    )
                );


            console.log(
                "Alunos encontrados:",
                alunosSnapshot.size
            );


            let alunoEncontrado = null;


            // =========================================
            // PROCURAR ALUNO
            // =========================================

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
                        dados.senha || ""
                    ).trim();


                console.log(
                    "Verificando:",
                    dados.nome,
                    "| Código:",
                    codigoFirestore
                );


                // =====================================
                // CONFIRMAR CÓDIGO + SENHA
                // =====================================

                if (
                    codigoFirestore === codigoAluno
                    &&
                    senhaFirestore === senha
                ) {


                    alunoEncontrado = {

                        // ID DO DOCUMENTO
                        id:
                            alunoDoc.id,


                        // DADOS DO ALUNO
                        nome:
                            dados.nome || "",


                        codigoAluno:
                            codigoFirestore,


                        senha:
                            senhaFirestore,


                        sexo:
                            dados.sexo || "",


                        estado:
                            String(
                                dados.estado || "ativo"
                            ).trim(),


                        classe:
                            dados.classe || "",


                        ensino:
                            dados.ensino || "",


                        anoLetivo:
                            dados.anoLetivo || "",


                        // =================================
                        // LIGAÇÃO COM A TURMA
                        // =================================

                        turmaId:
                            dados.turmaId || "",


                        // Guardamos também caso exista
                        turmaNome:
                            dados.turmaNome || "",


                        // Número somente se existir
                        numero:
                            dados.numero || ""

                    };


                    break;

                }

            }


            // =========================================
            // ALUNO NÃO ENCONTRADO
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
                "ALUNO LOGADO:",
                alunoEncontrado
            );


            // =========================================
            // CONFIRMAÇÃO
            // =========================================

            alert(

                "LOGIN REALIZADO ✅\n\n" +

                "Nome: " +
                alunoEncontrado.nome +

                "\nCódigo: " +
                alunoEncontrado.codigoAluno +

                "\nTurma ID: " +
                alunoEncontrado.turmaId

            );


            // =========================================
            // ABRIR ÁREA DO ALUNO
            // =========================================

            window.location.href =
                "/Complexo-Escolar-n-89M-Eduardo-Domingos-Sukuete-/src/pages/student-area.html";

        }


        catch (error) {

            console.error(
                "ERRO NO LOGIN:",
                error
            );


            alert(

                "Erro ao fazer login:\n\n" +
                error.message

            );

        }

    }

);
