import { login } from "./auth.js";

const form = document.getElementById("loginForm");


form.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
    document.getElementById("email").value;


    const password =
    document.getElementById("password").value;



    const result =
    await login(email, password);



    if(result.success){


        alert("Login efetuado com sucesso!");
        

window.location.href = "../pages/dashboard-gestor.html";


    }else{


        alert(
        "Erro no login: " + result.message
        );


    }


});
