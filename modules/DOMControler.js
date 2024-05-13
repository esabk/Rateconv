//Esta funcón crea un elementos que luego se puede agregar a HTML
export let tasa_input;
export function newElement(type,txtContent,className,idName){
    let element=document.createElement(type);
    element.textContent=txtContent;
    element.className=className;
    element.setAttribute("id", idName);
    return element;
}

//Con esta función se activa la "Alerta pop", permite personalizar el contenido y color de fondo
export function popAlerta(element,txtContent,duration,color){
  const __MIN_OPACITY = 0;
  const __MAX_OPACITY = 1;
  const __ANIMATE_DURATION = 200;
  let popDuration;

  duration ? popDuration = duration : popDuration = 3000; //Permite personalizar duracion de la alerta 
  
  element.textContent=txtContent;

    element.animate([
        { opacity: __MIN_OPACITY, offset: 0 }, // El elemento está completamente transparente al inicio
        { opacity: __MAX_OPACITY, offset: 1 }  // El elemento es completamente opaco al final
      ], {
        duration: __ANIMATE_DURATION, // Duración de 1000 milisegundos
        fill: 'forwards' // Mantiene el estado final de la animación
      })
    color ? element.style.backgroundColor=color : element.style.backgroundColor="#342E37";
    
    setTimeout(function() {
      element.animate([
        { opacity: __MAX_OPACITY, offset: 0 }, // El elemento está completamente transparente al inicio
        { opacity: __MIN_OPACITY, offset: 1 }  // El elemento es completamente opaco al final
      ], {
        duration: __ANIMATE_DURATION, // Duración de 1000 milisegundos
        fill: 'forwards' // Mantiene el estado final de la animación
      })
    }, popDuration);
}

//Cuadro de sugerencias

export function sugerencias(element,campoBusqueda,input,sugerenciasData,hide,tasaSeleccion){
    element.innerHTML = '';
    hide ? element.style.display = 'none' : element.style.display = 'block';

    sugerenciasData.forEach(function(item) {
         //Agrega sugerencias en el cuadro de sugerencias
         let elementChild = newElement("div",input +"%"+" "+ item,'sugerencia-item',"");
         elementChild.onclick=function() {
             input = input +"%";
             campoBusqueda.value=input;
             
             //Extrae de la lista desplegable del cuadro de busqueda las opciones diponibles.
             for (let i = 0; i < tasaSeleccion.options.length; i++) {

              //Las compara con la sugerencia seleccionada y selecciona la tasa correspondiente de la lista desplegable.
              item == tasaSeleccion.options[i].text ? tasaSeleccion.selectedIndex = i : console.log("Tasa de sugerencia no encontrada");

             }

             element.style.display = 'none';
           };
           element.appendChild(elementChild);
         });
      
}