//Import local modules
import { ratesFromJSON } from "/modules/getData.js?v=1.1";  //Procesa la petición para obtener las tasas
import { newElement,popAlerta,sugerencias} from "/modules/DOMControler.js?v=1.1.1";
import { rateConverter} from "/modules/rateConverter.js?v=1.1.1";
import { limpiar,showHideDOMElement } from "/modules/DOMButtons.js?v=1.1.1";
import { Tasa } from "/class/Tasa.js?v=1.1.1";
import {getVariableFromURL,shareRateConvertion} from "/modules/shareURL.js?v=1.1.1";
import { saveLocalStorage, getLocalStorage, verifyLocalStorage}  from "/modules/localStorageManager.js?v=1.1.1";

//Registrar Service Worker
navigator.serviceWorker.register('sw.js');
  //Avisa si ya hay conexión a internet
  window.addEventListener('online', () => {
    console.log('¡Conexión restaurada!');
  });

// DOM elementos cuadro de busqueda
  const PRINCIPAL = document.getElementById('principal');
  const CAMPO_BUSQUEDA = document.getElementById('campoBusqueda');
  const SUGERENCIAS_BOX = document.getElementById('sugerencias');
  const TASAS_SELECCION=document.getElementById("tasas_selecion");
  const alerta=document.getElementById("alerta");

//DOM Ventana flotante
 const FLOAT_WINDOWS = document.getElementById("float_windows");
 const FLOAT_WINDOWS_TITLE = document.getElementById("float_windows_title");
 const FLOAT_WINDOWS_CONTENT = document.getElementById("float_windows_content");

//DOM Elementos resultado
  const RESULTADO = document.getElementById("resultado");
  const RESULTADO_TASAS_CONVERTIDAS=document.getElementById("resultadoTasasConvertidas");

//DOM Pop Alerta
const pop=document.getElementById("pop");

//Cargar datos de tasas desde "Data"
let tasasJSON = await ratesFromJSON();

//Variables de guardado e historial
let history = verifyLocalStorage("history",[]);
let saved = verifyLocalStorage("saved",[]);

//Expresion regular para solo dejar numeros y puntos en el campo de busqueda
const EXPRESION_REGULAR = /[^0-9.]/g;

//Funciones  ejecutadas desde botones
window.limpiar = limpiar;
window.showHideDOMElement = showHideDOMElement;

//Portapapeles
  const Portapapeles=document.getElementById("portapapeles");
  let tasas = [];           // Tus sugerencias

//Inicia el prototipo para la TASA INGRESADA (id,value,type,periods,anticipated)
const TASA_INPUT = new Tasa(0,0,"efectiva",1,false);

//Inicia el prototipo para la TASA DE SALIDA (id,value,type,periods,anticipated)
const TASA_OUTPUT = new Tasa(0,0,"efectiva",1,false);

//Se usa para los titulos de las secciones en los resultados
let titulosSeccionesResultados = ["Efectiva Anual","Tasas periodicas","Tasas periodicas anticipadas","Tasas nominales","Tasas nominales anticipadas"];

//Proporciona sugerencias basadas en las opciones en html
for (var i = 0; i < TASAS_SELECCION.options.length; i++){
    tasas.push(TASAS_SELECCION.options[i].text);
    TASAS_SELECCION.options[i].value=TASAS_SELECCION.options[i].text;
}

//Muestra sugerencia cuando se escribe en el campo de busqueda
CAMPO_BUSQUEDA.oninput= function() {
  let campoBusquedaOnlyNumber= CAMPO_BUSQUEDA.value.replace(EXPRESION_REGULAR,"");

  if((campoBusquedaOnlyNumber/1) >0 ){
    //Reinicia las sugerencias
    SUGERENCIAS_BOX.innerHTML = '';

    //Verifica si se esta escribiendo en el campo de busqueda
    sugerencias(SUGERENCIAS_BOX,CAMPO_BUSQUEDA,campoBusquedaOnlyNumber,tasas,"",TASAS_SELECCION);
}
}

//Refresca resultados al hacer click 
PRINCIPAL.onclick = function(e) {

  //Evita que haya una tasa"Efectiva Anual anticipada" porque esto no existe
  if (TASAS_SELECCION.value=="Efectiva Anual") {   anticipadaCheck.checked = false;  }

    //Muestra sugerencias solo si el campo de busqueda es el target
    if (e.target !== CAMPO_BUSQUEDA || e.target !== TASAS_SELECCION) { 
      SUGERENCIAS_BOX.style.display = 'none';
    }
    mostrarResultados();
  };

//Funcion para ejecutar la conversion de tasas y mouestra los resultados
window.mostrarResultados = function mostrarResultados(){
  
  const VALUE_CAMPO_BUSQUEDA = CAMPO_BUSQUEDA.value.replace(EXPRESION_REGULAR,"");
  const TASA_CAMPO_BUSQUEDA  = TASAS_SELECCION.value;
  const ANTICIPATED_CAMPO_BUSQUEDA = document.getElementById("anticipadaCheck").checked;


  document.getElementById("button_list_rates_types").textContent = TASAS_SELECCION.value;

  //Muestra u oculta la sección de resultado dependiendo si hay o no valores en el cuadro de busqueda
  if (Number(CAMPO_BUSQUEDA.value.replace(EXPRESION_REGULAR,""))>0) {
    RESULTADO.style.display="block";
    CAMPO_BUSQUEDA.value = VALUE_CAMPO_BUSQUEDA + "%";
  }else{
    RESULTADO.style.display="none";
  }
  //ID del boton (titulo) y ul (resultados) de cada seccion sin el ultimo numero
  const TITULO_SeccionesResultados_id ="titulo_seccion_resultadoTasasConvertidas_";
  const RESULTADO_SeccionesResultados_id ="resultados_seccion_resultadoTasasConvertidas_";
  const ANTICIPATED ="anticipada";

  //Habilita el boton de guardar
  document.getElementById("save").classList.remove("elementDisable");
  document.getElementById("save").textContent="Guardar";

  // 1. Muestra la definicion de la tasa ingresada
  infoRateInput(VALUE_CAMPO_BUSQUEDA,TASA_CAMPO_BUSQUEDA,ANTICIPATED_CAMPO_BUSQUEDA);

  //2. CONVERSION DE TASA POR SECCION
    let sectionRateOutput;
    let sectionRateOutputAncicipated;
    let valueRateOutput;
    let valueRateOutputAnticipated;

    //Estructura para mostrar cada resultado
    let value;
    let li_Resultado;
    let copy_Resultado;

    //periodos para conversion de tasas
    let periodsInput = 1;
    let periodsOutput = 1;

    
    for (let i = 0; i < titulosSeccionesResultados.length; i++) {
    //Limpia todos los resultados anteriores
    const TITULO_SECCION_RESULTADO = document.getElementById(TITULO_SeccionesResultados_id+i);
    const SECCION_RESULTADOS = document.getElementById(RESULTADO_SeccionesResultados_id+i);
    const DECIMALS_CONFIG = document.getElementById("decimal_config").value;
    SECCION_RESULTADOS.innerHTML = "";
    
    //Asigna titulos a la pagina
    TITULO_SECCION_RESULTADO.textContent=titulosSeccionesResultados[i];   //Titulo de esta seccion
    TITULO_SECCION_RESULTADO.onclick = function() {showHideDOMElement(SECCION_RESULTADOS); toggleActive(TITULO_SECCION_RESULTADO)};

    sectionRateOutput = titulosSeccionesResultados[i].toLowerCase();
    sectionRateOutputAncicipated = sectionRateOutput.includes(ANTICIPATED);
    
    //Busca en data/tasas.json
    tasasJSON.forEach(element => {

      //periodos para conversion de tasas
        periodsInput = tasasJSON.find(element => element.nombre == TASA_CAMPO_BUSQUEDA ).periodos;
        periodsOutput = element.periodos;

        let fromTasa = tasasJSON.find(element => element.nombre == TASA_CAMPO_BUSQUEDA ).tipo;
        let toTasa = sectionRateOutput.replace("tasas ","");
      
      if (sectionRateOutput.includes(element.tipo)) {

        if (ANTICIPATED_CAMPO_BUSQUEDA) {
          fromTasa = `${fromTasa} ${ANTICIPATED}s`
        }

        value = rateConverter(VALUE_CAMPO_BUSQUEDA,fromTasa,toTasa,periodsInput,periodsOutput,DECIMALS_CONFIG);

         //Crea cada bonton con el resultado y su nombre
         let button_Resultado;
         let p_Resultado;

          //Se muestra en el DOM el resultado de cada conversion
          button_Resultado = newElement("button",`${value}%`,"value_resultado button_primary");
          copy_Resultado =newElement("button","copiar","btn_copiar_tasa_convertida")

          //Agrega las funciones de copiado
          button_Resultado.onclick = function() {copyToClipboard(button_Resultado.textContent)};
          copy_Resultado.onclick =function() {copyToClipboard(`${button_Resultado.textContent} ${p_Resultado.textContent}`)};

          sectionRateOutputAncicipated ? p_Resultado = newElement("p",`${element.nombre} ${ANTICIPATED}`) : p_Resultado = newElement("p",`${element.nombre}`);

          li_Resultado = newElement("li","","li_resultado");
          li_Resultado.appendChild(button_Resultado);
          li_Resultado.appendChild(p_Resultado);
          li_Resultado.appendChild(copy_Resultado);

          document.getElementById(RESULTADO_SeccionesResultados_id+i).appendChild(li_Resultado);
          
      }

      
    }); 
    
  }
 
};



//Muestar información de la tasa ingresada
function infoRateInput(value,tasa,anticipated) {
  const RESULTADO_TITULO=document.getElementById("resultado_titulo");
  const RESULTADO_INFO=document.getElementById("resultado_info");
  const INFO_TASA = tasasJSON.find(element => element.nombre == tasa );
  const INFO_TASA_EQUIVALE =" Esta tasa equivale a:"


  if (value && anticipated) {
    RESULTADO_TITULO.innerHTML = `${value}% ${tasa} <em> anticipada <em>`;
    document.title=`${value}% ${tasa} anticipada`;
  }else if(value){
    RESULTADO_TITULO.textContent = `${value}% ${tasa}`;
    document.title=`${value}% ${tasa}`;
  }else{
    document.title="Convierte tasas de interes gratis";
  }

  RESULTADO_INFO.textContent = INFO_TASA.definicion + INFO_TASA_EQUIVALE;

  AddRateTo("history",history,value,tasa,anticipated)
  //Guardar
  const SAVE = document.getElementById("save");
  
  SAVE.onclick = function () {
    SAVE.classList.toggle("elementDisable");
    SAVE.textContent="Guardado";
    AddRateTo("saved",saved,value,tasa,anticipated)
  
  }
  
}



// Value es el valor que se copia al portapapeles
// ValueCustom en lugar de mostarr el valor copiado, muestras un mensaje personalizado.
// message es el mensaje que se coloca al lado del valor.
function copyToClipboard(value,valueCustom,message) {
  //Copia value en textbox (Portapapeles) 
  Portapapeles.value=value;
  Portapapeles.select();
  document.execCommand('copy'); //Copiar
  Portapapeles.disabled = true;
  Portapapeles.disabled = false;

  //Verifica si se personaliza o no el valor a mostrar
  valueCustom ? value=valueCustom : value=value;

  //Si hay mensaje se muestra, de lo contrario se pone el por defecto
  message? message : message = "Se ha copiado";

  popAlerta(pop,`<em>${value}</em>`+ ` ${message}`,1000,"#1B998B");

}

//ATAJOS
document.addEventListener("keyup", ({key}) => {
  //Escribe la linea al presionar enter (O aceptar en moviles).
  if (key === "Enter") {
    SUGERENCIAS_BOX.style.display = 'none';
    mostrarResultados();

    //Verifica si es una pantalla tactil para desnfocar campobusqueta y quitar el teclado virtual.
    let esPantallaTactil = 'ontouchstart' in document.documentElement;
    if(esPantallaTactil){
      CAMPO_BUSQUEDA.blur();
    }
  }
})

//Compartir URL
window.share = function share(){
  //Comparte valor de la tasa ingesada, tipo y si es anticipada.
  let shareUrl  = shareRateConvertion(CAMPO_BUSQUEDA.value,TASAS_SELECCION.value,anticipadaCheck.checked);
  copyToClipboard(shareUrl,"Enlace copiado"," ");
}

//Historial
window.floatWindowsLista = function floatWindowsLista(title,lista) {
  FLOAT_WINDOWS_TITLE.textContent = title;
  FLOAT_WINDOWS_CONTENT.innerHTML = "";

  let listaFloat = getLocalStorage(lista);

  for (let i = listaFloat.length-1; i >=0; i--) {
  
    if(listaFloat[i].value > 0){
      
      let button_float_lista = newElement("button",`${listaFloat[i].value}% ${listaFloat[i].type}`,"button_float_lista");
      let button_float_delete = newElement("button",`x`,"button_float_delete");
      let li_float_windows = newElement("li","","li_float_windows");
      li_float_windows.appendChild(button_float_lista);             //Agrega cada boton a cada lista
      li_float_windows.appendChild(button_float_delete);             //Agrega cada boton de borrar a cada lista
      FLOAT_WINDOWS_CONTENT.appendChild(li_float_windows);          //Agrega cada elemento li al contenido de la ventana flotante

      button_float_lista.onclick = function(){          //Agrga funcion a cads boton
        CAMPO_BUSQUEDA.value = listaFloat[i].value;
        TASAS_SELECCION.value = listaFloat[i].type;
        anticipadaCheck.checked =listaFloat[i].anticipated;
        mostrarResultados();
        floatWindowsUse()
      };

      button_float_delete.onclick = function(){          //Agrega funcion a cads boton
        FLOAT_WINDOWS_CONTENT.removeChild(li_float_windows);
        listaFloat.splice(i, 1);
        saveLocalStorage(lista,listaFloat);
      };

    }  
  }
  
  floatWindowsUse()
}
  
function AddRateTo(variableName,variable,value,type,anticipated){
    let tasa ={
      value : value,
      type : type,
      anticipated : anticipated
    }
    variable = getLocalStorage(variableName);
    variable.push(tasa);
    saveLocalStorage(variableName,variable);
}



//Desactivar elementos detras de la ventana flotante
function floatWindowsUse() {
  showHideDOMElement(FLOAT_WINDOWS);
  PRINCIPAL.classList.toggle("elementDisable");
  RESULTADO.classList.toggle("elementDisable");
  document.getElementById("nombre").classList.toggle("elementDisable");
  document.getElementById("header_tittle").classList.toggle("elementDisable");
  document.getElementById("config_button").classList.toggle("elementDisable");
}

//Configuración
window.showPreferences = function showPreferences() {
  FLOAT_WINDOWS_TITLE.textContent = "Configuración";
  FLOAT_WINDOWS_CONTENT.innerHTML = "No hay opciones disponibles";
  floatWindowsUse()
}

//Filtro de resultados
const FILTER_RESULT = document.getElementById("filter_results");

//Mostrar tipos de tasas
window.showRateTypes = function showRateTypes() {
  showHideDOMElement(FILTER_RESULT);
  toggleActive(document.getElementById("button_list_rates_types"));
}
window.btnSelectTasa=function btnSelectTasa(txt){
    TASAS_SELECCION.value=txt.textContent;
    showRateTypes()
}

window.toggleActive = function toggleActive(DOMElement) {
  DOMElement.classList.toggle("active");
}
showRateTypes();    //Oculta el filtro de resulatados al iniciar la app

//Agregar funcionalidad a botones del DOM
document.getElementById("close_float_windows").onclick=function() { floatWindowsUse() };




//EJECUCION INICIAL
  //Muestra una pop Alerta al iniciar.
popAlerta(pop,`Rateconv 1.3 : Diseño más amigable   <button> Ver novedades</button>`,10000,"#342E37");
  //Oculta la ventan flotante por defecto.
showHideDOMElement(FLOAT_WINDOWS);

/*Verifica si hay valores en la URL
Obtener valores de variables en la Url " ?rateValue=1.2%&rateType=Mensual&rateAnticipated=true " */
let URL_rateValue  = getVariableFromURL('rateValue');
let URL_rateType = getVariableFromURL('rateType');
let URL_rateAnticipated = getVariableFromURL('rateAnticipated')

if (URL_rateValue != null & URL_rateType != null & URL_rateAnticipated!= null ) {
  CAMPO_BUSQUEDA.value = URL_rateValue;
  TASAS_SELECCION.value = URL_rateType;
  if (TASAS_SELECCION.value=="Efectiva Anual") {
    anticipadaCheck.checked =false;
  } else {
    URL_rateAnticipated=="true" ? anticipadaCheck.checked = true : anticipadaCheck.checked =false;
  }
  
  mostrarResultados();
  console.log(`Se han cargado los valores de la URL ... ${URL_rateValue} ... ${URL_rateType}  ...  ${URL_rateAnticipated}`)
}else(
  console.log("Sin valores en URL")
)


//Eleva el campo de busqueda al hacer click en un didpositivo movil
CAMPO_BUSQUEDA.addEventListener("click", function() {
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    const offset = 80; // Ajusta este valor según el margen que desees
    const top = PRINCIPAL.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }
})

//Mostrar en moviles el boton de limpiar si hay valores ingresados
//Mostrar en moviles el boton de limpiar si hay valores ingresados
CAMPO_BUSQUEDA.addEventListener("input", function() {
  const limpiarBtn = document.getElementById("limpiar_btn");
  // Solo mostrar en móviles y si hay valor
  if ((/Mobi|Android/i.test(navigator.userAgent)) && CAMPO_BUSQUEDA.value.trim() !== "") {
    limpiarBtn.classList.add("show");
  } else {
    limpiarBtn.classList.remove("show");
  }
});