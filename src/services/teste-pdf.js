import { lerPDF } from "./pdf-reader.js";


const input = document.createElement("input");

input.type = "file";
input.accept = "application/pdf";


input.onchange = async () => {

    const arquivo = input.files[0];

    const texto = await lerPDF(arquivo);


    console.log("TEXTO EXTRAÍDO DO PDF:");

    console.log(texto);


    alert("PDF lido. Verifica a consola.");
};


input.click();
