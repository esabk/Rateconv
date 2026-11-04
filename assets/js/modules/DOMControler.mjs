// ==========================================
// 1. ELEMENTOS DEL DOM Y CONFIGURACIÓN
// ==========================================
const ContenedorCampoBusqueda = document.getElementById('campoBusqueda');
const busquedaCuadro = document.getElementById("busqueda_cuadro");
const contenedorSugerencias = document.getElementById('sugerencias');
export const filterResults = document.getElementById('filter_results');
export const listRateTypes = document.getElementById('button_list_rates_types');

export let tasa_input;
let indiceSeleccionado = -1; // Control del índice para navegación por flechas

// ==========================================
// 2. FUNCIONES UTILITARIAS / HELPERS
// ==========================================

/**
 * Crea un elemento HTML dinámico con texto, clase e ID opcionales.
 */
export function newElement(type, txtContent, className, idName) {
    const element = document.createElement(type);
    element.textContent = txtContent;
    element.className = className;
    if (idName) element.setAttribute("id", idName);
    return element;
}

/**
 * Posiciona un elemento flotante exactamente debajo de un elemento de referencia.
 */
export function posicionarElementoFlotante(elementoPadre, elementoFlotante) {
    if (!elementoPadre || !elementoFlotante) return;

    const rectPadre = elementoPadre.getBoundingClientRect();

    
    elementoFlotante.style.width = `${rectPadre.width}px`;
    elementoFlotante.style.left = `${elementoPadre.offsetLeft}px`;
    elementoFlotante.style.top = `${elementoPadre.offsetTop + rectPadre.height}px`;
    if(elementoFlotante.id=="sugerencias"){
      elementoFlotante.style.display="flex";
    }

    console.log(` ${elementoFlotante.id}  debajo de: ${elementoPadre.id} : ${rectPadre.width}px`);
}

/**
 * Gestiona los estilos visuales de foco y selección en la lista de sugerencias.
 */
function actualizarSeleccion(items) {
    items.forEach((item, index) => {
        if (index === indiceSeleccionado) {
            item.classList.add('sugerencia-item-active');
            item.focus(); 
        } else {
            item.classList.remove('sugerencia-item-active');
        }
    });
    ContenedorCampoBusqueda.focus(); 
}

// ==========================================
// 3. LOGICA PRINCIPAL / COMPONENTES CORE
// ==========================================

/**
 * Activa la "Alerta pop", permitiendo personalizar el contenido, duración y color de fondo.
 */
export function popAlerta(element, txtContent, duration = 3000, color = "#342E37") {
    const __MIN_OPACITY = 0;
    const __MAX_OPACITY = 1;
    const __ANIMATE_DURATION = 200;

    element.innerHTML = txtContent;
    element.style.backgroundColor = color;

    const keyframesIn = [
        { opacity: __MIN_OPACITY, display: "none" },
        { opacity: __MAX_OPACITY, display: "block" }
    ];

    const keyframesOut = [
        { opacity: __MAX_OPACITY, display: "block" },
        { opacity: __MIN_OPACITY, display: "none" }
    ];

    const options = {
        duration: __ANIMATE_DURATION,
        iterations: 1,
        easing: "ease-in-out",
        fill: 'forwards'
    };

    // Reproduce animación de entrada
    element.animate(keyframesIn, options);
    
    // Cierre manual al hacer clic
    element.addEventListener("click", () => {
        element.animate(keyframesOut, options);
    });

    // Cierre automático por tiempo
    setTimeout(() => {
        element.animate(keyframesOut, options);
    }, duration);
}

/**
 * Renderiza y gestiona el cuadro flotante de sugerencias predictivas.
 */
export function sugerencias(element, campoBusqueda, input, sugerenciasData, hide, tasaSeleccion) {
    element.innerHTML = '';
    
    if (hide) {
        element.style.display = 'none';
        return; // Detiene la ejecución si se debe ocultar
    }

    // Usamos el helper genérico pasando los elementos correctos
    posicionarElementoFlotante(busquedaCuadro, contenedorSugerencias);

    sugerenciasData.forEach((item) => {
        let elementChild = newElement("div", `${input}% ${item}`, 'sugerencia-item', "");
        
        elementChild.onclick = function() {
            const porcentajeInput = `${input}%`;
            campoBusqueda.value = porcentajeInput;
             
            // Sincroniza la sugerencia seleccionada con el <select> nativo
            for (let i = 0; i < tasaSeleccion.options.length; i++) {
                if (item === tasaSeleccion.options[i].text) {
                    tasaSeleccion.selectedIndex = i;
                    break; // Detiene el bucle al encontrar coincidencia
                }
            }
            element.style.display = 'none';
        };
        
        element.appendChild(elementChild);
    });
}

// ==========================================
// 4. EVENT LISTENERS (INTERACCIONES)
// ==========================================

// Manejo de navegación por teclado en el input de búsqueda
ContenedorCampoBusqueda.addEventListener('keydown', (e) => {
    
    const items = contenedorSugerencias.querySelectorAll('.sugerencia-item'); 
    if (items.length === 0) return;

   if(contenedorSugerencias.style.display == "flex") {
     if (e.key === 'ArrowDown') {
        e.preventDefault(); 
        indiceSeleccionado++;
        if (indiceSeleccionado >= items.length) indiceSeleccionado = 0; 
        actualizarSeleccion(items);
    } 
    else if (e.key === 'ArrowUp') {
        e.preventDefault(); 
        indiceSeleccionado--;
        if (indiceSeleccionado < 0) indiceSeleccionado = items.length - 1; 
        actualizarSeleccion(items);
    } 
    else if (e.key === 'Enter') {
        if (indiceSeleccionado >= 0 && items[indiceSeleccionado]) {
            e.preventDefault();
            items[indiceSeleccionado].click();
        }
    }}
});

// Resetea el índice de selección cada vez que el usuario escribe algo nuevo
ContenedorCampoBusqueda.addEventListener('input', () => {
    indiceSeleccionado = -1;
});

listRateTypes.addEventListener('click',()=>{
  posicionarElementoFlotante(listRateTypes, filterResults);

})




// Recalcular posición si el usuario cambia el tamaño de la ventana (Responsive)
window.addEventListener('resize', () => {
    if (contenedorSugerencias && contenedorSugerencias.style.display === 'flex') {
        posicionarElementoFlotante(busquedaCuadro, contenedorSugerencias);
        posicionarElementoFlotante(listRateTypes, filterResults);
    }
});
