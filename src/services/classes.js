async function buscarDisciplinas(ensino, classe){

    try{

        const referencia = doc(
            db,
            "config",
            "disciplinas"
        );


        const resultado = await getDoc(referencia);



        if(!resultado.exists()){

            alert("Documento config/disciplinas não existe");

            return [];

        }



        const dados = resultado.data();



        alert(
            "Dados recebidos:\n\n" +
            JSON.stringify(dados)
        );



        return [];



    }catch(error){


        alert(
            "Erro ao ler disciplinas: " 
            + error.message
        );


        return [];

    }

                }
