import { app } from "./firebase.js";

import {
getAuth,
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

import {
getFirestore,
collection,
getDocs,
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const auth =
getAuth(app);

const db =
getFirestore(app);

// =====================================================
// ELEMENTOS
// =====================================================

const escolaNome =
document.getElementById("schoolName");

const userInfo =
document.getElementById("userInfo");

const totalAlunos =
document.getElementById("totalStudents");

const totalProfessores =
document.getElementById("totalTeachers");

const totalTurmas =
document.getElementById("totalClasses");

const totalDisciplinas =
document.getElementById("totalSubjects");

// =====================================================
// AUTENTICAÇÃO
// =====================================================

onAuthStateChanged(
auth,
async (user) => {

    if (!user) {

        window.location.href =
            "login.html";

        return;

    }


    userInfo.textContent =
        user.email;


    await carregarEscola();


    await carregarTotais();

}

);

// =====================================================
// ESCOLA
// =====================================================

async function carregarEscola() {

try {

    const dados =
        await getDocs(
            collection(
                db,
                "escolas"
            )
        );


    if (!dados.empty) {

        const escola =
            dados.docs[0].data();


        escolaNome.textContent =
            escola.nome ||
            "SIGEA";

    }
    else {

        escolaNome.textContent =
            "SIGEA";

    }

}

catch (error) {

    console.error(
        "Erro ao carregar escola:",
        error
    );

    escolaNome.textContent =
        "SIGEA";

}

}

// =====================================================
// CARREGAR TOTAIS
// =====================================================

async function carregarTotais() {

try {


    // =============================================
    // TURMAS
    // =============================================

    const turmasSnapshot =
        await getDocs(
            collection(
                db,
                "turmas"
            )
        );


    totalTurmas.textContent =
        turmasSnapshot.size;


    // =============================================
    // PROFESSORES
    // =============================================

    const professoresSnapshot =
        await getDocs(
            collection(
                db,
                "professores"
            )
        );


    totalProfessores.textContent =
        professoresSnapshot.size;


    // =============================================
    // ALUNOS
    // =============================================

    let totalAlunosEncontrados = 0;


    /*
     * Os alunos estão dentro de:
     *
     * turmas
     *   └── turmaId
     *        └── alunos
     *
     */


    for (
        const turmaDoc
        of turmasSnapshot.docs
    ) {

        const alunosRef =
            collection(
                db,
                "turmas",
                turmaDoc.id,
                "alunos"
            );


        const alunosSnapshot =
            await getDocs(
                alunosRef
            );


        totalAlunosEncontrados +=
            alunosSnapshot.size;

    }


    totalAlunos.textContent =
        totalAlunosEncontrados;


    // =============================================
    // DISCIPLINAS
    // =============================================

    const disciplinasRef =
        doc(
            db,
            "config",
            "disciplinas"
        );


    const disciplinasSnapshot =
        await getDoc(
            disciplinasRef
        );


    let totalDisciplinasEncontradas =
        0;


    if (
        disciplinasSnapshot.exists()
    ) {

        const dados =
            disciplinasSnapshot.data();


        /*
         * Estrutura:
         *
         * config
         *   disciplinas
         *      ensinoPrimario
         *          1classe
         *              disciplinas: [...]
         *
         *      primeiroCiclo
         *          7classe
         *              disciplinas: [...]
         *
         */


        const ensinos = [

            "ensinoPrimario",

            "primeiroCiclo"

        ];


        ensinos.forEach(
            ensino => {

                const classes =
                    dados[ensino];


                if (
                    !classes ||
                    typeof classes !==
                    "object"
                ) {

                    return;

                }


                Object.keys(
                    classes
                ).forEach(
                    classe => {

                        const dadosClasse =
                            classes[classe];


                        if (
                            dadosClasse &&
                            Array.isArray(
                                dadosClasse
                                    .disciplinas
                            )
                        ) {

                            totalDisciplinasEncontradas +=
                                dadosClasse
                                    .disciplinas
                                    .length;

                        }

                    }
                );

            }
        );

    }


    totalDisciplinas.textContent =
        totalDisciplinasEncontradas;


    // =============================================
    // CONSOLE PARA CONFERÊNCIA
    // =============================================

    console.log(
        "===== TOTAIS SIGEA ====="
    );


    console.log(
        "Alunos:",
        totalAlunosEncontrados
    );


    console.log(
        "Professores:",
        professoresSnapshot.size
    );


    console.log(
        "Turmas:",
        turmasSnapshot.size
    );


    console.log(
        "Disciplinas:",
        totalDisciplinasEncontradas
    );


}

catch (error) {

    console.error(
        "Erro ao carregar totais:",
        error
    );


    totalAlunos.textContent =
        "—";


    totalProfessores.textContent =
        "—";


    totalTurmas.textContent =
        "—";


    totalDisciplinas.textContent =
        "—";

}

}

// =====================================================
// SAIR
// =====================================================

document
.getElementById("logoutBtn")
.addEventListener(
"click",
async () => {

        try {

            await signOut(auth);


            window.location.href =
                "login.html";

        }

        catch (error) {

            console.error(
                "Erro ao sair:",
                error
            );

        }

    }
);
