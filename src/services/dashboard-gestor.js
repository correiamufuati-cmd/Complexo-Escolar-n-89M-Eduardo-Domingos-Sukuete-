import { app } from "./firebase.js";


import {
getAuth,
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";


import {
getFirestore,
collection,
getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";



const auth = getAuth(app);

const db = getFirestore(app);





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





onAuthStateChanged(auth, async(user)=>{


if(!user){


window.location.href="login.html";

return;


}



userInfo.textContent =
user.email;



await carregarEscola();


await carregarTotais();



});







async function carregarEscola(){


try{


const dados =
await getDocs(
collection(db,"escolas")
);



if(!dados.empty){


const escola =
dados.docs[0].data();



escolaNome.textContent =
escola.nome;



}



}catch(error){


console.log(error);


}


}









async function carregarTotais(){


try{



const alunos =
await getDocs(
collection(db,"alunos")
);



const professores =
await getDocs(
collection(db,"professores")
);



const turmas =
await getDocs(
collection(db,"turmas")
);





totalAlunos.textContent =
alunos.size;



totalProfessores.textContent =
professores.size;



totalTurmas.textContent =
turmas.size;





let disciplinas = 0;



turmas.forEach(doc=>{


const dados =
doc.data();



if(dados.disciplinas){


disciplinas +=
dados.disciplinas.length;


}



});



totalDisciplinas.textContent =
disciplinas;



}catch(error){


console.log(error);


}


}








document
.getElementById("logoutBtn")
.addEventListener("click",async()=>{


await signOut(auth);


window.location.href="login.html";


});
