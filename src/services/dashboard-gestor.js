// =====================================================
// DASHBOARD GESTOR - SIGEA
// =====================================================

alert("DASHBOARD-GESTOR.JS CARREGADO ✅");


// =====================================================
// FIREBASE
// =====================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// =====================================================
// ELEMENTOS
// =====================================================

const schoolName =
    document.getElementById("schoolName");

const userInfo =
    document.getElementById("userInfo");

const totalStudents =
    document.getElementById("totalStudents");

const totalTeachers =
    document.getElementById("totalTeachers");

const totalClasses =
    document.getElementById("totalClasses");

const totalSubjects =
    document.getElementById("totalSubjects");

const activity =
    document.getElementById("activity");

const logoutBtn =
    document.getElementById("logoutBtn");


// =====================================================
// CARREGAR DASHBOARD
// =====================================================

async function iniciarDashboard() {

    console.log(
        "Iniciando Dashboard do Gestor..."
    );


    await carregarInformacoesUsuario();

    await carregarEstatisticas();

    await carregarAtividadesRecentes();

}


// =====================================================
// INFORMAÇÕES DO UTILIZADOR
// =====================================================

async function carregarInformacoesUsuario() {

    try {

        const gestor =
            JSON.parse(
                localStorage.getItem(
                    "gestorLogado"
                ) || "null"
            );


        if (gestor) {

            if (userInfo) {

                userInfo.textContent =
                    `Administrador: ${
                        gestor.nome ||
                        gestor.email ||
                        "Gestor"
                    }`;

            }

        }
        else {

            if (userInfo) {

                userInfo.textContent =
                    "Administrador";

            }

        }

    }
    catch (erro) {

        console.error(
            "Erro ao carregar utilizador:",
            erro
        );

    }

}


// =====================================================
// ESTATÍSTICAS
// =====================================================

async function carregarEstatisticas() {

    // -------------------------------------------------
    // ALUNOS
    // -------------------------------------------------

    try {

        let total = 0;


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

            const alunosSnapshot =
                await getDocs(
                    collection(
                        db,
                        "turmas",
                        turmaDoc.id,
                        "alunos"
                    )
                );


            total +=
                alunosSnapshot.size;

        }


        if (totalStudents) {

            totalStudents.textContent =
                total;

        }

    }
    catch (erro) {

        console.error(
            "Erro ao contar alunos:",
            erro
        );

        if (totalStudents) {

            totalStudents.textContent =
                "0";

        }

    }


    // -------------------------------------------------
    // PROFESSORES
    // -------------------------------------------------

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "professores"
                )
            );


        if (totalTeachers) {

            totalTeachers.textContent =
                snapshot.size;

        }

    }
    catch (erro) {

        console.error(
            "Erro ao contar professores:",
            erro
        );

        if (totalTeachers) {

            totalTeachers.textContent =
                "0";

        }

    }


    // -------------------------------------------------
    // TURMAS
    // -------------------------------------------------

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "turmas"
                )
            );


        if (totalClasses) {

            totalClasses.textContent =
                snapshot.size;

        }

    }
    catch (erro) {

        console.error(
            "Erro ao contar turmas:",
            erro
        );

        if (totalClasses) {

            totalClasses.textContent =
                "0";

        }

    }


    // -------------------------------------------------
    // DISCIPLINAS
    // -------------------------------------------------

    try {

        const configRef =
            collection(
                db,
                "config"
            );


        const snapshot =
            await getDocs(
                configRef
            );


        let totalDisciplinas = 0;


        snapshot.forEach(
            documento => {

                const dados =
                    documento.data();


                if (
                    dados.disciplinas
                ) {

                    const disciplinas =
                        dados.disciplinas;


                    Object.values(
                        disciplinas
                    ).forEach(
                        lista => {

                            if (
                                Array.isArray(
                                    lista
                                )
                            ) {

                                totalDisciplinas +=
                                    lista.length;

                            }

                        }
                    );

                }

            }
        );


        if (totalSubjects) {

            totalSubjects.textContent =
                totalDisciplinas;

        }

    }
    catch (erro) {

        console.error(
            "Erro ao contar disciplinas:",
            erro
        );

        if (totalSubjects) {

            totalSubjects.textContent =
                "0";

        }

    }

}


// =====================================================
// ATIVIDADES RECENTES
// =====================================================

async function carregarAtividadesRecentes() {

    if (!activity) {

        console.warn(
            "Elemento #activity não encontrado."
        );

        return;

    }


    try {

        const referencia =
            collection(
                db,
                "atividades"
            );


        const consulta =
            query(
                referencia,
                orderBy(
                    "data",
                    "desc"
                ),
                limit(10)
            );


        const resultado =
            await getDocs(
                consulta
            );


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

                    📭 Nenhuma atividade
                    registada ainda.

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

        resultado.forEach(
            documento => {

                const dados =
                    documento.data();


                const item =
                    document.createElement(
                        "div"
                    );


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

                                ${
                                    data
                                    ? " • " + data
                                    : ""
                                }

                            </div>

                        </div>

                    </div>

                `;


                activity.appendChild(
                    item
                );

            }
        );

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

function obterIconeAtividade(
    tipo
) {

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

function formatarDataAtividade(
    timestamp
) {

    if (!timestamp) {

        return "";

    }


    try {

        if (
            typeof timestamp.toDate ===
            "function"
        ) {

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


        return "";

    }
    catch (erro) {

        console.error(
            "Erro ao formatar data:",
            erro
        );

        return "";

    }

}


// =====================================================
// SAIR
// =====================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            const confirmar =
                confirm(
                    "Deseja realmente sair?"
                );


            if (!confirmar) {

                return;

            }


            localStorage.removeItem(
                "gestorLogado"
            );


            localStorage.removeItem(
                "professorLogado"
            );


            window.location.href =
                "login.html";

        }
    );

}


// =====================================================
// INICIAR
// =====================================================

iniciarDashboard();


// =====================================================
// FIM
// =====================================================

alert(
    "DASHBOARD-GESTOR.JS CARREGADO COMPLETAMENTE ✅"
);
