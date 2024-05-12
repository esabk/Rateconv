
export function limpiar(){
    campoBusqueda.value = "";
    campoBusqueda.focus();
    }
    
export function showHideSectionResultados(i) {
    let secccionResultado = document.getElementById(`ulResultados${i}`);
    
    if (secccionResultado.style.display=="none") {
        secccionResultado.style.display="block";
    } else {
        secccionResultado.style.display="none";
    }
}