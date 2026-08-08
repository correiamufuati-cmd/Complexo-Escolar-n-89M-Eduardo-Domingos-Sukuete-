alert("LOGIN ALUNO JS Dk CARREGADO ✅");

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


const form =
document.getElementById("loginAluno");


if (!form) {

    alert("Formulário de login não encontrado.");

    throw new Error(
        "loginAluno não encontrado."
    );

}



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


            const turmasSnapshot =
                await getDocs(
                    collection(db, "turmas")
                );



            let alunoEncontrado = null;



            for (
                const turmaDoc
                of turmasSnapshot.docs
            ) {


                const turmaDados =
                    turmaDoc.data();



                const alunosSnapshot =
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

                            numero:
                                dados.numero || "",

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



            if (!alunoEncontrado) {

                alert(
                    "Código ou senha incorretos."
                );

                return;

            }



            /*
            =================================
            GUARDA A SESSÃO
            =================================
            */


            localStorage.setItem(

                "alunoLogado",

                JSON.stringify(
                    alunoEncontrado
                )

            );



            /*
            =================================
            TESTE
            =================================
            */


            alert(

                "LOGIN OK ✅\n\n" +

                "Nome: " +
                alunoEncontrado.nome +

                "\nCódigo: " +
                alunoEncontrado.codigoAluno +

                "\nTurma: " +
                alunoEncontrado.turmaNome

            );



            /*
            =================================
            ABRIR ÁREA DO ALUNO
            =================================
            */


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
