async function buscarDisciplinas(ensino, classe){

    const referencia = doc(
        db,
        "config",
        "disciplinas"
    );

    const resultado = await getDoc(referencia);


    if(!resultado.exists()){

        return [];

    }


    const dados = resultado.data();


    console.log(dados);


    if(
        dados[ensino] &&
        dados[ensino][classe]
    ){

        return dados[ensino][classe].disciplinas || [];

    }


    alert(
        "Não encontrado: "
        + ensino +
        " / "
        + classe
    );


    return [];

}
