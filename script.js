const loginBox = document.getElementById("login");
const sistema = document.getElementById("sistema");

/* LOGIN */
document.getElementById("btnLogin").addEventListener("click",()=>{

const tipo = document.getElementById("tipoLogin").value;
const senha = document.getElementById("senhaLogin").value;

/* senha simples (fase 1) */
if(senha === "1234"){
loginBox.classList.add("hidden");
sistema.classList.remove("hidden");
}else{
alert("Senha incorreta");
}

});

/* NAVEGAÇÃO */
function mostrar(id){
document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
document.getElementById(id).classList.add("active");
}

/* BOTÕES MENU */
document.getElementById("btnDashboard").addEventListener("click",()=>mostrar("dashboard"));
document.getElementById("btnPautas").addEventListener("click",()=>mostrar("pautas"));
document.getElementById("btnAlunos").addEventListener("click",()=>mostrar("alunos"));
document.getElementById("btnProfessores").addEventListener("click",()=>mostrar("professores"));
document.getElementById("btnBoletins").addEventListener("click",()=>mostrar("boletins"));

/* SAIR */
document.getElementById("btnLogout").addEventListener("click",()=>{
location.reload();
});
