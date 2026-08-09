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

// =====================================================
// ATIVIDADES RECENTES
// =====================================================

import {
    collection,
    query,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// =====================================================
// ELEMENTO
// =====================================================

const activity =
    document.getElementById("activity");


// =====================================================
// CARREGAR ATIVIDADES
// =====================================================

async function carregarAtividadesRecentes() {

    if (!activity) return;

    try {

        const referencia =
            collection(db, "atividades");

        const consulta =
            query(
                referencia,
                orderBy("data", "desc"),
                limit(10)
            );

        const resultado =
            await getDocs(consulta);


        // =============================================
        // NENHUMA ATIVIDADE
        // =============================================

        if (resultado.empty) {

            activity.innerHTML = `
                <div style="
                    padding:15px;
                    text-align:center;
                    color:#64748b;
                ">
                    Nenhuma atividade ainda.
                </div>
            `;

            return;
        }


        // =============================================
        // LIMPAR
        // =============================================

        activity.innerHTML = "";


        // =============================================
        // MOSTRAR
        // =============================================

        resultado.forEach(documento => {

            const dados =
                documento.data();


            const item =
                document.createElement("div");


            item.style.padding =
                "12px 0";

            item.style.borderBottom =
                "1px solid #e2e8f0";


            const icone =
                obterIconeAtividade(
                    dados.tipo
                );


            const descricao =
                dados.descricao ||
                "Atividade realizada";


            const utilizador =
                dados.utilizador ||
                "Sistema";


            const data =
                formatarDataAtividade(
                    dados.data
                );


            item.innerHTML = `

                <div style="
                    display:flex;
                    gap:12px;
                    align-items:flex-start;
                ">

                    <div style="
                        font-size:22px;
                    ">
                        ${icone}
                    </div>

                    <div style="
                        flex:1;
                    ">

                        <div style="
                            font-weight:bold;
                            color:#1e293b;
                        ">
                            ${descricao}
                        </div>

                        <div style="
                            font-size:13px;
                            color:#64748b;
                            margin-top:4px;
                        ">
                            👤 ${utilizador}
                            ${data ? " • " + data : ""}
                        </div>

                    </div>

                </div>

            `;


            activity.appendChild(item);

        });


    }
    catch (erro) {

        console.error(
            "Erro ao carregar atividades:",
            erro
        );


        activity.innerHTML = `

            <div style="
                padding:15px;
                color:#b91c1c;
            ">

                ⚠️ Não foi possível
                carregar as atividades.

            </div>

        `;

    }

}


// =====================================================
// ÍCONE DA ATIVIDADE
// =====================================================

function obterIconeAtividade(tipo) {

    switch (tipo) {

        case "aluno":
            return "👨‍🎓";

        case "professor":
            return "👨‍🏫";

        case "turma":
            return "🏫";

        case "disciplina":
            return "📚";

        case "nota":
            return "📝";

        case "financeiro":
            return "💰";

        case "pauta":
            return "📑";

        case "configuracao":
            return "⚙️";

        case "sistema":
            return "🔧";

        default:
            return "📌";
    }

}


// =====================================================
// FORMATAR DATA
// =====================================================

function formatarDataAtividade(timestamp) {

    if (!timestamp) {
        return "";
    }


    try {

        const data =
            timestamp.toDate();


        return data.toLocaleString(
            "pt-PT",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }
    catch {

        return "";

    }

}


// =====================================================
// INICIAR
// =====================================================

carregarAtividadesRecentes();
