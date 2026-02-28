// ==========================
// SISTEMA COMPLEXO ESCOLAR
// ==========================

// -------- PUBLICAÇÕES --------

function adicionarPublicacao() {
    const texto = document.getElementById("textoPublicacao").value.trim();
    if (!texto) {
        alert("Escreva algo para publicar.");
        return;
    }

    let publicacoes = JSON.parse(localStorage.getItem("publicacoes")) || [];
    publicacoes.unshift(texto);
    localStorage.setItem("publicacoes", JSON.stringify(publicacoes));

    document.getElementById("textoPublicacao").value = "";
    carregarPublicacoes();
}

function carregarPublicacoes() {
    const container = document.getElementById("listaPublicacoes");
    if (!container) return;

    container.innerHTML = "";
    let publicacoes = JSON.parse(localStorage.getItem("publicacoes")) || [];

    publicacoes.forEach(pub => {
        const div = document.createElement("div");
        div.className = "publicacao";
        div.innerText = pub;
        container.appendChild(div);
    });
}

// -------- REGISTAR PAUTA --------

function registarPauta() {
    const classe = document.getElementById("classeNome").value.trim();
    const senha = document.getElementById("senhaClasse").value.trim();
    const file = document.getElementById("excelUpload").files[0];

    if (!classe || !senha || !file) {
        alert("Preencha todos os campos.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const dados = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const pauta = {
            senha: senha,
            dados: dados
        };

        localStorage.setItem("pauta_" + classe, JSON.stringify(pauta));

        alert("Pauta registada com sucesso!");
    };

    reader.readAsArrayBuffer(file);
}

// -------- ENTRAR NA PAUTA --------

function entrarAdmin() {
    const classe = document.getElementById("classeAcesso").value.trim();
    const senha = document.getElementById("senhaAcesso").value.trim();

    const pauta = JSON.parse(localStorage.getItem("pauta_" + classe));

    if (!pauta) {
        alert("Classe não encontrada.");
        return;
    }

    if (pauta.senha !== senha) {
        alert("Senha incorreta.");
        return;
    }

    mostrarPauta(pauta.dados);
}

function mostrarPauta(dados) {
    const container = document.getElementById("areaPauta");
    if (!container) return;

    container.innerHTML = "";

    const tabela = document.createElement("table");
    tabela.border = "1";

    dados.forEach(linha => {
        const tr = document.createElement("tr");

        linha.forEach(coluna => {
            const td = document.createElement("td");
            td.innerText = coluna;
            tr.appendChild(td);
        });

        tabela.appendChild(tr);
    });

    container.appendChild(tabela);
}

// -------- CARREGAMENTO --------

window.onload = function () {
    carregarPublicacoes();
};
