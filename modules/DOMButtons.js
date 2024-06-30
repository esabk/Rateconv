
export function limpiar(){
    campoBusqueda.value = "";
    campoBusqueda.focus();
    }
    
export function showHideDOMElement(DOMElement) {
    console.log("Toggle visibility: " + DOMElement.id)
    if (DOMElement.style.display=="none") {
        DOMElement.style.display="block";
    } else {
        DOMElement.style.display="none";
    }
}

