/* ================= IMPORTS FIREBASE v9 ================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= CONFIG FIREBASE ================= */
const firebaseConfig = {
    apiKey: "AIzaSyC0NRCbPalAC3Yrfpc8qYdJVU6DxuEOyTw",
    authDomain: "sac-escolar.firebaseapp.com",
    projectId: "sac-escolar",
    storageBucket: "sac-escolar.appspot.com",
    messagingSenderId: "507793955855",
    appId: "1:507793955855:web:405579f5e01b3f90cc577a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= VARIÁVEIS GLOBAIS ================= */
let dadosPauta = [];
let classeAtual = "";

/* ================= FUNÇÕES GERAIS ================= */
function mostrar(id){
    document.querySelectorAll('section').forEach(s => s.style.display = 'none');
    const sec = document.getElementById(id);
    if(sec) sec.style.display = 'block';
}
window.mostrar = mostrar;

/* ================= ADMINISTRADOR ================= */
window.entrarAdmin = async function(){
    const senha = document.getElementById("adminSenha").value.trim();
    if(senha !== "Admin123"){ alert("Senha incorreta"); return; }
    mostrar("adminPainel");
    carregarPublicacoes();
}

/* ================= PUBLICAR ================= */
window.adicionarPublicacao = async function(isAdmin){
    const titulo = isAdmin ? document.getElementById("publicacaoTitulo").value.trim() :
                             document.getElementById("publicacaoTituloUsuario").value.trim();
    const texto = isAdmin ? document.getElementById("publicacaoTexto").value.trim() :
                            document.getElementById("publicacaoTextoUsuario").value.trim();

    if(!titulo || !texto){ alert("Preencha título e texto"); return; }

    await addDoc(collection(db,"publicacoes"), {titulo, texto, data:new Date()});
    alert("Publicação criada com sucesso");
    carregarPublicacoes();
}

/* ================= CARREGAR PUBLICAÇÕES ================= */
async function carregarPublicacoes(){
    const listaAdmin = document.getElementById("listaPublicacoes") || document.getElementById("publicacoesContainer");
    listaAdmin.innerHTML = "";
    const snap = await getDocs(collection(db,"publicacoes"));
    snap.forEach(d => {
        const dados = d.data();
        listaAdmin.innerHTML += `<li><b>${dados.titulo}</b>: ${dados.texto}</li>`;
    });
}

/* ================= REGISTAR PAUTA (EXCEL) ================= */
window.registarPauta = function(){
    const fileInput = document.getElementById("excelUpload");
    const classe = document.getElementById("classeNome").value.trim();
    const senha = document.getElementById("senhaClasse").value.trim();

    if(!fileInput.files[0] || !classe || !senha){
        alert("Preencha todos os campos e escolha o ficheiro Excel");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e)=>{
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type:"array"});
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const json = XLSX.utils.sheet_to_json(ws, {defval:""});

        dadosPauta = json; // guarda os dados temporariamente
        classeAtual = classe;

        // Guarda no Firebase
        await setDoc(doc(db,"pautas",classe), {senha:senha, dados:dadosPauta});
        alert("Pauta registada com sucesso");
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

async function carregarClassesProfessor() {
    const select = document.getElementById("classeProfessor");
    select.innerHTML = "<option value=''>-- Selecionar Classe --</option>";

    try {
        const snap = await getDocs(collection(db,"pautas"));
        snap.forEach(docu => {
            select.innerHTML += `<option value="${docu.id}">${docu.id}</option>`;
        });
    } catch(err){
        console.error("Erro ao carregar classes:", err);
    }
}
window.carregarClassesProfessor = carregarClassesProfessor;

// Chamar esta função quando o menu Lançamento abrir
document.querySelector("button[onclick=\"mostrar('professorArea')\"]")
    .addEventListener("click", carregarClassesProfessor);

/* ================= ACESSAR PAUTA ================= */
window.acessarPauta = async function(){
    const classe = document.getElementById("classeProfessor").value.trim();
    const senha = document.getElementById("senhaProfessor").value.trim();
    if(!classe || !senha){ alert("Preencha classe e senha"); return; }

    const docRef = doc(db,"pautas",classe);
    const docSnap = await getDoc(docRef);
    if(!docSnap.exists()){ alert("Classe não encontrada"); return; }
    const dados = docSnap.data();
    if(dados.senha !== senha){ alert("Senha incorreta"); return; }

    // Mostrar tabela
    dadosPauta = dados.dados;
    renderizarTabelaNotas(dadosPauta);
    mostrar("professorArea");
}

/* ================= RENDERIZAR TABELA NOTAS ================= */
function renderizarTabelaNotas(dados){
    const container = document.getElementById("tabelaContainer");
    container.innerHTML = "";
    if(!dados || dados.length===0){ container.innerHTML="<p>Nenhuma nota encontrada.</p>"; return; }

    let html = "<table><tr>";
    Object.keys(dados[0]).forEach(k => html += `<th>${k}</th>`);
    html += "</tr>";

    dados.forEach((row,rowIndex)=>{
        html += "<tr>";
        Object.keys(row).forEach(col=>{
            const val = row[col];
            const editable = isNota(col) ? `contenteditable oninput="editar(${rowIndex},'${col}',this.innerText)"` : "";
            html += `<td ${editable}>${val}</td>`;
        });
        html += "</tr>";
    });
    html += "</table>";
    container.innerHTML = html;
}
window.renderizarTabelaNotas = renderizarTabelaNotas;

/* ================= FUNÇÃO EDITAR ================= */
window.editar = function(rowIndex,col,val){
    dadosPauta[rowIndex][col] = val;
}

/* ================= CONFIRMAR GUARDAR ================= */
window.confirmarGuardar = async function(){
    if(!classeAtual){ alert("Nenhuma pauta selecionada"); return; }
    await updateDoc(doc(db,"pautas",classeAtual), {dados:dadosPauta});
    alert("Alterações guardadas com sucesso");
}

/* ================= ESTATÍSTICA ================= */
window.gerarEstatistica = async function(){
    const statsContainer = document.getElementById("tabelaEstatistica");
    if(!classeAtual){ statsContainer.innerHTML="<p>Nenhuma turma selecionada</p>"; return; }
    const docSnap = await getDoc(doc(db,"pautas",classeAtual));
    if(!docSnap.exists()){ statsContainer.innerHTML="<p>Erro ao buscar dados</p>"; return; }

    const dados = docSnap.data().dados;
    const disciplinas = Object.keys(dados[0]).filter(k=>k.toLowerCase().includes("nota"));

    let html = "<table><tr><th>Disciplina</th><th>Média</th><th>Maior Nota</th><th>Menor Nota</th></tr>";
    disciplinas.forEach(d=>{
        const notas = dados.map(a=>parseFloat(a[d])||0);
        const media = (notas.reduce((a,b)=>a+b,0)/notas.length).toFixed(2);
        const maior = Math.max(...notas);
        const menor = Math.min(...notas);
        html += `<tr><td>${d}</td><td>${media}</td><td>${maior}</td><td>${menor}</td></tr>`;
    });
    html += "</table>";
    statsContainer.innerHTML = html;
  }

// Tornar funções acessíveis aos botões HTML
window.mostrar = mostrar;
window.registarPauta = registarPauta;
window.publicar = publicar;
window.entrarAdmin = entrarAdmin;
window.carregarClassesProfessor = carregarClassesProfessor;
