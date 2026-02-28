// script.js

// 🔹 Inicialização do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, setDoc, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// 🔹 Variáveis globais
let sistemaAberto = false;

// 🔹 Funções

function mostrar(id) {
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  const sec = document.getElementById(id);
  if(sec) sec.classList.add('active');
}

function entrarAdmin() {
  const senha = document.getElementById("adminSenha").value;
  if (senha === "Admin123") {
    mostrar('adminPainel');
    alert("Bem-vindo, administrador!");
  } else {
    alert("Senha incorreta!");
  }
}

function toggleSistema() {
  sistemaAberto = !sistemaAberto;
  document.getElementById("estadoSistema").innerText = sistemaAberto ? "Aberto" : "Fechado";
  alert(`Sistema agora ${sistemaAberto ? "Aberto" : "Fechado"}`);
}

// 🔹 Registrar pauta (Excel)
async function registarPauta() {
    const classe = document.getElementById("classeNome").value.trim();
    const senha = document.getElementById("senhaClasse").value.trim();
    const arquivo = document.getElementById("excelUpload").files[0];

    if (!classe || !senha || !arquivo) {
        alert("Preencha todos os campos e selecione um arquivo Excel.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            alert("Arquivo lido com sucesso!");
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            alert("Arquivo Excel processado!");

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Aqui transformamos o Excel em objetos simples
            const dados = XLSX.utils.sheet_to_json(worksheet); 
            alert("Dados do Excel extraídos com sucesso!");

            // Salvar no Firebase
            await setDoc(doc(db, "pautas", classe), { senha: senha, dados: dados });
            alert(`Pauta da classe ${classe} registrada com sucesso!`);

            // Limpar campos
            document.getElementById("excelUpload").value = "";
            document.getElementById("classeNome").value = "";
            document.getElementById("senhaClasse").value = "";

        } catch (err) {
            alert("Erro ao registrar a pauta: " + err.message);
            console.error(err);
        }
    };

    reader.readAsArrayBuffer(arquivo);
}

window.registarPauta = registarPauta;

// 🔹 Publicações
 função  assíncrona adicionarPublicacao ( isAdmin )  {
  const  titulo = isAdmin ? document.getElementById ( " publicacaoTitulo " ) . value : document.getElementById ( " publicacaoTituloUsuario " ) . value ;
  const  texto = isAdmin ? document.getElementById ( " publicacaoTexto " ) . value : document.getElementById ( " publicacaoTextoUsuario " ) . value ;

  se  ( ! título || ! texto )  {
    alerta ( "Preencha título e texto da publicação." ) ;
    retornar ;
  }

  tentar  {
    await  addDoc ( coleção ( db , "publicacoes" ) , {  título , texto , dados : nova  Data ( )  } ) ;
    alert ( "Publicação criada!" ) ;
    carregadoPublicações ( ) ;
  }  catch  ( err )  {
    console.error ( err ) ;​​
    alert ( "Erro ao criar publicação." ) ;
  }
}

// 🔹 Carregar publicações no início e painel admin
async function carregarPublicacoes() {
  const containerInicio = document.getElementById("publicacoesInicio");
  const containerAdmin = document.getElementById("listaPublicacoes");
  containerInicio.innerHTML = "";
  containerAdmin.innerHTML = "";

  const snap = await getDocs(collection(db, "publicacoes"));
  snap.forEach(d => {
    const pub = d.data();
    // Exibir no início
    containerInicio.innerHTML += `<div class="card"><h4>${pub.titulo}</h4><p>${pub.texto}</p></div>`;
    // Exibir no admin
    containerAdmin.innerHTML += `<li>${pub.titulo} <button onclick="apagarPublicacao('${d.id}')">Eliminar</button></li>`;
  });
}

// 🔹 Apagar publicação
async function apagarPublicacao(id) {
  await deleteDoc(doc(db, "publicacoes", id));
  carregarPublicacoes();
}

// 🔹 Inicialização ao carregar página
window.onload = () => {
  carregarPublicacoes();
};

// 🔹 Tornar funções acessíveis aos botões do HTML
window.mostrar = mostrar;
window.entrarAdmin = entrarAdmin;
window.toggleSistema = toggleSistema;
window.registarPauta = registarPauta;
window.adicionarPublicacao = adicionarPublicacao;
window.carregarPublicacoes = carregarPublicacoes;
window.apagarPublicacao = apagarPublicacao;
