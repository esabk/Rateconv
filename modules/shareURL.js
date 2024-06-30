//Este Script lee y escribe la url
let UrlParams = new URLSearchParams(window.location.search);

//Esta función sirve para obtener valores desde la URL
export function getVariableFromURL(UrlVariable){
    return  UrlParams.get(UrlVariable);
}