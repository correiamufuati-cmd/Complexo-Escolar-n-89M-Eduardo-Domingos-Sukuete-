// =====================================================

                Disciplina:
                    disciplina,

                Nota:
                    valor

            })
        );

    }


    if(!linhas.length){

        alert(
            "Este boletim não possui notas para exportar."
        );

        return;

    }


    const cabecalhos =
        Object.keys(
            linhas[0]
        );


    const csv = [

        cabecalhos.join(";"),

        ...linhas.map(
            linha =>
                cabecalhos
                    .map(
                        coluna =>
                            `"${String(
                                linha[coluna] ?? ""
                            )
                            .replace(
                                /"/g,
                                '""'
                            )}"`
                    )
                    .join(";")
        )

    ].join("\n");


    const blob =
        new Blob(
            ["\ufeff" + csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `Boletim-${boletim.alunoNome || boletim.alunoId || "aluno"}.csv`;


    link.click();


    URL.revokeObjectURL(
        url
    );

}


// =====================================================
// ESCAPAR HTML
// =====================================================

function escapar(
    valor
){

    return String(
        valor ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


// =====================================================
// ERRO
// =====================================================

function mostrarErro(
    texto
){

    if(!boletinsContainer) return;


    boletinsContainer.innerHTML = `

        <div class="boletim-erro">

            ⚠️

            ${escapar(texto)}

        </div>

    `;

}


// =====================================================
// EXECUTAR
// =====================================================

iniciar();
