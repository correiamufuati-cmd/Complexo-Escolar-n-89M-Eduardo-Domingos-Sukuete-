export async function lerPDF(file) {

    const dados = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
        data: dados
    }).promise;


    let itens = [];


    for (let pagina = 1; pagina <= pdf.numPages; pagina++) {

        const page = await pdf.getPage(pagina);

        const content = await page.getTextContent();

        itens.push(...content.items);

    }


    return extrairAlunos(itens);

}





function extrairAlunos(itens) {


    let alunos = [];

    let inicio = false;



    for (let i = 0; i < itens.length; i++) {


        let valor = itens[i].str.trim();



        if (valor === "N°" || valor === "Nº") {

            inicio = true;

            continue;

        }



        if (!inicio) {

            continue;

        }



        if (/^\d+$/.test(valor)) {


            let aluno = {

                numero: valor,

                nome: "",

                sexo: "",

                data: "",

                idade: ""

            };


            i++;


            while (i < itens.length) {


                let campo = itens[i].str.trim();


                if (campo === "M" || campo === "F") {

                    aluno.sexo = campo;

                    break;

                }


                aluno.nome += campo + " ";

                i++;


            }



            if (aluno.nome !== "" && aluno.sexo !== "") {

                alunos.push(aluno);

            }


        }


    }


    return alunos;

            }
