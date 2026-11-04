// Guardar un valor en localStorage

export function saveLocalStorage(variable,value){
    localStorage.setItem(variable, JSON.stringify(value));
    console.log(variable + "  Save in local storegE")
}

// Obtener el valor de localStorage
export function getLocalStorage(variable){
    console.log(variable + "  get from LoacalStorage"); // Esto mostrará: 'Este es el valor guardado'
    return JSON.parse(localStorage.getItem(variable));
}

//Verifica si esta guardada la variable, en caso contrario la crea
export function verifyLocalStorage(variable,defaultValue){
    if (!Array.isArray(getLocalStorage(variable))) {
        saveLocalStorage(variable,defaultValue);
      }
    
    return getLocalStorage(variable);
      
}