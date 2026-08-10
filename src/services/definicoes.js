// =====================================================
// DEFINIÇÕES — SIGEA
// =====================================================

import { db } from "./firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// =====================================================
// CONFIGURAÇÃO
// =====================================================

const CONFIG_ID = "escola";

const configRef = doc(
    db,
    "config",
    CONFIG_ID
);


// =====================================================
// ELEMENTOS
// =====================================================

const mensagem =
    document.getElementById("mensagem");


// =====================================================
// UTILITÁRIOS
// =====================================================

function mostrarMensagem(
    texto,
    tipo = "sucesso"
){

    if(!mensagem) return;

    mensagem.textContent = texto;

    mensagem.className = "";

    mensagem.id = "mensagem";

    mensagem.classList.add(tipo);

    clearTimeout(
        window._mensagemTimer
    );

    window._mensagemTimer =
        setTimeout(()=>{

            mensagem.className = "";

            mensagem.textContent = "";

        },4000);

}


// =====================================================
// LER ELEMENTO
// =====================================================

function valor(id){

    const elemento =
        document.getElementById(id);

    if(!elemento) return "";

    return elemento.value;

}


function marcado(id){

    const elemento =
        document.getElementById(id);

    return elemento
        ? elemento.checked
        : false;

}


// =====================================================
// DEFINIR ELEMENTO
// =====================================================

function preencher(id, valorRecebido){

    const elemento =
        document.getElementById(id);

    if(!elemento) return;

    if(elemento.type === "checkbox"){

        elemento.checked =
            Boolean(valorRecebido);

        return;

    }

    if(
        elemento.type === "color"
    ){

        if(valorRecebido){

            elemento.value =
                valorRecebido;

        }

        return;

    }

    elemento.value =
        valorRecebido ?? "";

}


// =====================================================
// ATIVIDADES
// =====================================================

async function registrarAtividade(
    descricao,
    tipo = "configuracao"
){

    try{

        const utilizador =
            localStorage.getItem(
                "usuarioLogado"
            ) ||
            localStorage.getItem(
                "professorLogado"
            ) ||
            "Administrador";

        await addDoc(
            collection(
                db,
                "atividades"
            ),
            {

                tipo,

                descricao,

                utilizador,

                data:
                    serverTimestamp()

            }
        );

    }
    catch(erro){

        console.error(
            "Erro ao registrar atividade:",
            erro
        );

    }

}


// =====================================================
// MENU DAS DEFINIÇÕES
// =====================================================

function iniciarMenu(){

    const botoes =
        document.querySelectorAll(
            ".menu-btn"
        );

    const paineis =
        document.querySelectorAll(
            ".painel"
        );


    botoes.forEach(botao => {

        botao.addEventListener(
            "click",
            ()=>{

                const nome =
                    botao.dataset.painel;


                botoes.forEach(b=>{
                    b.classList.remove(
                        "ativo"
                    );
                });


                paineis.forEach(p=>{
                    p.classList.remove(
                        "ativo"
                    );
                });


                botao.classList.add(
                    "ativo"
                );


                const painel =
                    document.getElementById(
                        "painel-" + nome
                    );


                if(painel){

                    painel.classList.add(
                        "ativo"
                    );

                }

            }
        );

    });

}


// =====================================================
// CARREGAR CONFIGURAÇÕES
// =====================================================

async function carregarConfiguracoes(){

    try{

        const snapshot =
            await getDoc(
                configRef
            );


        if(!snapshot.exists()){

            return;

        }


        const dados =
            snapshot.data();


        // =============================================
        // ESCOLA
        // =============================================

        preencher(
            "escolaNome",
            dados.escola?.nome
        );

        preencher(
            "escolaNumero",
            dados.escola?.numero
        );

        preencher(
            "escolaProvincia",
            dados.escola?.provincia
        );

        preencher(
            "escolaMunicipio",
            dados.escola?.municipio
        );

        preencher(
            "escolaTelefone",
            dados.escola?.telefone
        );

        preencher(
            "escolaEmail",
            dados.escola?.email
        );

        preencher(
            "escolaGestor",
            dados.escola?.gestor
        );

        preencher(
            "escolaEndereco",
            dados.escola?.endereco
        );


        // =============================================
        // ANO
        // =============================================

        preencher(
            "anoLetivo",
            dados.anoLetivo?.ano
        );

        preencher(
            "dataInicio",
            dados.anoLetivo?.inicio
        );

        preencher(
            "dataFim",
            dados.anoLetivo?.fim
        );


        // =============================================
        // NOTAS
        // =============================================

        preencher(
            "notaMinima",
            dados.notas?.minima
        );

        preencher(
            "notaMaxima",
            dados.notas?.maxima
        );

        preencher(
            "pesoMAC",
            dados.notas?.pesoMAC
        );

        preencher(
            "pesoNPT",
            dados.notas?.pesoNPT
        );

        preencher(
            "lancamentoNotas",
            dados.notas?.lancamento
        );

        preencher(
            "alteracaoNotas",
            dados.notas?.alteracao
        );


        // =============================================
        // PROFESSORES
        // =============================================

        preencher(
            "professorLancamento",
            dados.professores?.lancamento
        );

        preencher(
            "professorEdicao",
            dados.professores?.edicao
        );

        preencher(
            "professorImpressao",
            dados.professores?.impressao
        );


        // =============================================
        // ALUNOS
        // =============================================

        preencher(
            "matriculaAutomatica",
            dados.alunos?.matriculaAutomatica
        );

        preencher(
            "exigirSexo",
            dados.alunos?.exigirSexo
        );

        preencher(
            "exigirNascimento",
            dados.alunos?.exigirNascimento
        );


        // =============================================
        // FINANCEIRO
        // =============================================

        preencher(
            "valorPropina",
            dados.financeiro?.propina
        );

        preencher(
            "moeda",
            dados.financeiro?.moeda
        );

        preencher(
            "financeiroAtivo",
            dados.financeiro?.ativo
        );


        // =============================================
        // DOCUMENTOS
        // =============================================

        preencher(
            "cabecalhoDocumento",
            dados.documentos?.cabecalho
        );

        preencher(
            "assinaturaDiretor",
            dados.documentos?.diretor
        );

        preencher(
            "mostrarLogo",
            dados.documentos?.mostrarLogo
        );


        // =============================================
        // NOTIFICAÇÕES
        // =============================================

        preencher(
            "notificarProfessores",
            dados.notificacoes?.professores
        );

        preencher(
            "notificarTrimestre",
            dados.notificacoes?.trimestre
        );


        // =============================================
        // SEGURANÇA
        // =============================================

        preencher(
            "acessoProfessores",
            dados.seguranca?.professores
        );

        preencher(
            "acessoAlunos",
            dados.seguranca?.alunos
        );

        preencher(
            "acessoEncarregados",
            dados.seguranca?.encarregados
        );


        // =============================================
        // APARÊNCIA
        // =============================================

        preencher(
            "corPrincipal",
            dados.aparencia?.cor
        );

        preencher(
            "tema",
            dados.aparencia?.tema
        );


        // =============================================
        // MANUTENÇÃO
        // =============================================

        preencher(
            "historicoAtivo",
            dados.manutencao?.historico
        );


    }
    catch(erro){

        console.error(
            "Erro ao carregar configurações:",
            erro
        );

        mostrarMensagem(
            "Erro ao carregar as configurações.",
            "erro"
        );

    }

}


// =====================================================
// GUARDAR CONFIGURAÇÃO
// =====================================================

async function guardarConfiguracao(
    dados,
    descricao
){

    try{

        await setDoc(
            configRef,
            dados,
            {
                merge:true
            }
        );


        await registrarAtividade(
            descricao
        );


        mostrarMensagem(
            "Configuração guardada com sucesso.",
            "sucesso"
        );

    }
    catch(erro){

        console.error(
            erro
        );

        mostrarMensagem(
            "Não foi possível guardar a configuração.",
            "erro"
        );

    }

}


// =====================================================
// ESCOLA
// =====================================================

document
.getElementById("guardarEscola")
?.addEventListener(
"click",
async()=>{

    await guardarConfiguracao({

        escola:{

            nome:
                valor("escolaNome"),

            numero:
                valor("escolaNumero"),

            provincia:
                valor("escolaProvincia"),

            municipio:
                valor("escolaMunicipio"),

            telefone:
                valor("escolaTelefone"),

            email:
                valor("escolaEmail"),

            gestor:
                valor("escolaGestor"),

            endereco:
                valor("escolaEndereco")

        }

    },"Dados da escola atualizados");

});


// =====================================================
// ANO LETIVO
// =====================================================

document
.getElementById("guardarAno")
?.addEventListener(
"click",
async()=>{

    await guardarConfiguracao({

        anoLetivo:{

            ano:
                valor("anoLetivo"),

            inicio:
                valor("dataInicio"),

            fim:
                valor("dataFim"),

            encerrado:false

        }

    },"Ano letivo atualizado");

});


// =====================================================
// ENCERRAR ANO
// =====================================================

document
.getElementById("encerrarAno")
?.addEventListener(
"click",
async()=>{

    const confirmar =
        confirm(
            "Tem certeza que deseja encerrar o ano letivo?"
        );


    if(!confirmar) return;


    await guardarConfiguracao({

        anoLetivo:{

            encerrado:true

        }

    },"Ano letivo encerrado");

});


// =====================================================
// NOTAS
// =====================================================

document
.getElementById("guardarNotas")
?.addEventListener(
"click",
async()=>{

    const minima =
        Number(
            valor("notaMinima")
        );

    const maxima =
        Number(
            valor("notaMaxima")
        );

    const mac =
        Number(
            valor("pesoMAC")
        );

    const npt =
        Number(
            valor("pesoNPT")
        );


    if(minima > maxima){

        mostrarMensagem(
            "A nota mínima não pode ser maior que a máxima.",
            "erro"
        );

        return;

    }


    if(mac + npt !== 100){

        mostrarMensagem(
            "O peso MAC + NPT deve ser exatamente 100%.",
            "erro"
        );

        return;

    }


    await guardarConfiguracao({

        notas:{

            minima,

            maxima,

            pesoMAC:mac,

            pesoNPT:npt,

            lancamento:
                marcado("lancamentoNotas"),

            alteracao:
                marcado("alteracaoNotas")

        }

    },"Configuração de notas atualizada");

});


// =====================================================
// PROFESSORES
// =====================================================

document
.getElementById("guardarProfessores")
?.addEventListener(
"click",
async()=>{

    await guardarConfiguracao({

        professores:{

            lancamento:
                marcado(
                    "professorLancamento"
                ),

            edicao:
                marcado(
                    "professorEdicao"
                ),

            impressao:
                marcado(
                    "professorImpressao"
                )

        }

    },"Permissões dos professores atualizadas");

});


// =====================================================
// ALUNOS
// =====================================================

document
.getElementById("guardarAlunos")
?.addEventListener(
"click",
async()=>{

    await guardarConfiguracao({

        alunos:{

            matriculaAutomatica:
                marcado(
                    "matriculaAutomatica"
                ),

            exigirSexo:
                marcado(
                    "exigirSexo"
                ),

            exigirNascimento:
                marcado(
                    "exigirNascimento"
                )

        }

    },"Configuração dos alunos atualizada");

});


// =====================================================
// FINANCEIRO
// =====================================================

document
.getElementById("guardarFinanceiro")
?.addEventListener(
"click",
async()=>{

    await guardarConfiguracao({

        financeiro:{

            propina:
                Number(
                    valor("valorPropina")
                ) || 0,

            moeda:
                valor("moeda"),

            ativo:
                marcado("financeiroAtivo")

        }

    },"Configuração financeira atualizada");

});


// =====================================================
// DOCUMENTOS
// =====================================================

document
.getElementById("guardarDocumentos")
?.addEventListener(
"click",
async()=>{

    await guardarConfiguracao({

        documentos:{

            cabecalho:
                valor(
                    "cabecalhoDocumento"
                ),

            diretor:
                valor(
                    "assinaturaDiretor"
                ),

            mostrarLogo:
                marcado(
                    "mostrarLogo"
                )

        }

    },"Configuração dos documentos atualizada");

});


// =====================================================
// NOTIFICAÇÕES
// =====================================================

document
.getElementById("guardarNotificacoes")
?.addEventListener(
"click",
async()=>{

    await guardarConfiguracao({

        notificacoes:{

            professores:
                marcado(
                    "notificarProfessores"
                ),

            trimestre:
                marcado(
                    "notificarTrimestre"
                )

        }

    },"Configuração das notificações atualizada");

});


// =====================================================
// SEGURANÇA
// =====================================================

document
.getElementById("guardarSeguranca")
?.addEventListener(
"click",
async()=>{

    await guardarConfiguracao({

        seguranca:{

            professores:
                marcado(
                    "acessoProfessores"
                ),

            alunos:
                marcado(
                    "acessoAlunos"
                ),

            encarregados:
                marcado(
                    "acessoEncarregados"
                )

        }

    },"Permissões de acesso atualizadas");

});


// =====================================================
// APARÊNCIA
// =====================================================

document
.getElementById("guardarAparencia")
?.addEventListener(
"click",
async()=>{

    await guardarConfiguracao({

        aparencia:{

            cor:
                valor("corPrincipal"),

            tema:
                valor("tema")

        }

    },"Aparência do sistema atualizada");

});


// =====================================================
// MANUTENÇÃO
// =====================================================

document
.getElementById("exportarConfiguracoes")
?.addEventListener(
"click",
async()=>{

    try{

        const snapshot =
            await getDoc(
                configRef
            );


        if(!snapshot.exists()){

            mostrarMensagem(
                "Não existem configurações para exportar.",
                "aviso"
            );

            return;

        }


        const dados =
            snapshot.data();


        const conteudo =
            JSON.stringify(
                dados,
                null,
                2
            );


        const blob =
            new Blob(
                [conteudo],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const a =
            document.createElement(
                "a"
            );


        a.href = url;

        a.download =
            "configuracoes-sigea.json";

        a.click();


        URL.revokeObjectURL(url);


        await registrarAtividade(
            "Configurações exportadas"
        );


        mostrarMensagem(
            "Configurações exportadas.",
            "sucesso"
        );

    }
    catch(erro){

        console.error(
            erro
        );

        mostrarMensagem(
            "Erro ao exportar configurações.",
            "erro"
        );

    }

});


// =====================================================
// LIMPAR CACHE
// =====================================================

document
.getElementById("limparCache")
?.addEventListener(
"click",
()=>{

    const confirmar =
        confirm(
            "Deseja limpar os dados locais deste navegador?"
        );


    if(!confirmar) return;


    localStorage.clear();

    sessionStorage.clear();


    mostrarMensagem(
        "Cache local limpo. A página será recarregada.",
        "sucesso"
    );


    setTimeout(
        ()=>{
            location.reload();
        },
        1200
    );

});


// =====================================================
// LIMPAR ATIVIDADES
// =====================================================

document
.getElementById("limparAtividades")
?.addEventListener(
"click",
async()=>{

    const confirmar =
        confirm(
            "ATENÇÃO: deseja apagar todas as atividades registadas?"
        );


    if(!confirmar) return;


    try{

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "atividades"
                )
            );


        for(
            const item
            of snapshot.docs
        ){

            await deleteDoc(
                item.ref
            );

        }


        mostrarMensagem(
            "Histórico de atividades limpo.",
            "sucesso"
        );

    }
    catch(erro){

        console.error(
            erro
        );

        mostrarMensagem(
            "Não foi possível limpar as atividades.",
            "erro"
        );

    }

});


// =====================================================
// INTERRUPTORES — GUARDAR AUTOMATICAMENTE
// =====================================================

document
.getElementById("lancamentoNotas")
?.addEventListener(
"change",
async(e)=>{

    await guardarConfiguracao({

        notas:{

            lancamento:
                e.target.checked

        },

        professores:{

            lancamento:
                e.target.checked

        }

    },"Lançamento de notas " +
      (
        e.target.checked
        ? "ativado"
        : "bloqueado"
      )
    );

});


// =====================================================
// INICIAR
// =====================================================

async function iniciar(){

    console.log(
        "DEFINIÇÕES.JS CARREGADO ✅"
    );


    iniciarMenu();


    await carregarConfiguracoes();

}


iniciar();
