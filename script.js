function mostrar(id) {
    const secoes = document.querySelectorAll("section");
    secoes.forEach(sec => sec.style.display = "none");

    const ativa = document.getElementById(id);
    if (ativa) {
        ativa.style.display = "block";
    }
}
