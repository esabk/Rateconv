//Import local modules
import { ratesFromJSON } from "/modules/getData.js";  //Procesa la petición para obtener las tasas
import { newElement,popAlerta,sugerencias} from "/modules/DOMControler.js";
import { rateConverter} from "/modules/rateConverter.js";
import { limpiar,showHideSectionResultados } from "/modules/DOMButtons.js";
import { Tasa } from "/class/Tasa.js";


// DOM elementos cuadro de busqueda
  const principal = document.getElementById('principal');
  const campoBusqueda = document.getElementById('campoBusqueda');
  const sugerenciasBox = document.getElementById('sugerencias');
  const tasas_seleccion=document.getElementById("tasas_selecion");
  const alerta=document.getElementById("alerta");

//DOM Elementos resultado
  const resultado = document.getElementById("resultado");
  const resultadoTasasConvertidas=document.getElementById("resultadoTasasConvertidas");

//DOM Pop Alerta
const pop=document.getElementById("pop");

//Cargar datos de tasas desde "Data"
let tasasJSON = await ratesFromJSON();

//Expresion regular para solo dejar numeros y puntos en el campo de busqueda
const EXPRESION_REGULAR = /[^0-9.]/g;

//Funciones  ejecutadas desde botones
window.limpiar = limpiar;
window.showHideSectionResultados = showHideSectionResultados;

//Portapapeles
  const Portapapeles=document.getElementById("portapapeles");
  let tasas = [];           // Tus sugerencias

//Inicia el prototipo para la TASA INGRESADA (id,value,type,periods,anticipated)
const TASA_INPUT = new Tasa(0,0,"efectiva",1,false);

//Inicia el prototipo para la TASA DE SALIDA (id,value,type,periods,anticipated)
const TASA_OUTPUT = new Tasa(0,0,"efectiva",1,false);

//Se usa para los titulos de las secciones en los resultados
let titulosSeccionesResultados = ["Efectiva anual","Tasas periodicas","Tasas periodicas anticipadas","Tasas nominales","Tasas nominales anticipadas"];

//Proporciona sugerencias basadas en las opciones en html
for (var i = 0; i < tasas_seleccion.options.length; i++){
    tasas.push(tasas_seleccion.options[i].text);
    tasas_seleccion.options[i].value=tasas_seleccion.options[i].text;
}

//Muestra sugerencia cuando se escribe en el campo de busqueda
campoBusqueda.oninput= function() {
  let campoBusquedaOnlyNumber= campoBusqueda.value.replace(EXPRESION_REGULAR,"");

  if((campoBusquedaOnlyNumber/1) >0 ){
    //Reinicia las sugerencias
    sugerenciasBox.innerHTML = '';

    //Verifica si se esta escribiendo en el campo de busqueda
    sugerencias(sugerenciasBox,campoBusqueda,campoBusquedaOnlyNumber,tasas,"",tasas_seleccion);
}
}

//Refresca resultados al hacer click 
principal.onclick = function(e) {

  //Evita que haya una tasa"Efectiva anual anticipada" porque esto no existe
  if (tasas_seleccion.value=="Efectiva anual") {   anticipadaCheck.checked = false;  }

    //Muestra sugerencias solo si el campo de busqueda es el target
    if (e.target !== campoBusqueda || e.target !== tasas_seleccion) { 
      sugerenciasBox.style.display = 'none';
    }
    mostrarResultados();
  };

//Funcion para ejecutar la conversion de tasas y mouestra los resultados
function mostrarResultados(){
  
  const VALUE_CAMPO_BUSQUEDA = campoBusqueda.value.replace(EXPRESION_REGULAR,"");
  const TASA_CAMPO_BUSQUEDA  = tasas_seleccion.value;
  const ANTICIPATED_CAMPO_BUSQUEDA = document.getElementById("anticipadaCheck").checked;

  //Muestra u oculta la sección de resultado dependiendo si hay o no valores en el cuadro de busqueda
  if (Number(campoBusqueda.value.replace(EXPRESION_REGULAR,""))>0) {
    resultado.style.display="block";
    campoBusqueda.value = VALUE_CAMPO_BUSQUEDA + "%";
  }else{
    resultado.style.display="none";
  }
  //ID del boton (titulo) y ul (resultados) de cada seccion sin el ultimo numero
  const TITULO_SeccionesResultados_id ="titulo_seccion_resultadoTasasConvertidas_";
  const RESULTADO_SeccionesResultados_id ="resultados_seccion_resultadoTasasConvertidas_";
  const ANTICIPATED ="anticipada";

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
    let button_Resultado;
    let p_Resultado;
    let copy_Resultado;

    //periodos para conversion de tasas
    let periodsInput = 1;
    let periodsOutput = 1;

    
    for (let i = 0; i < titulosSeccionesResultados.length; i++) {
    //Limpia todos los resultados anteriores
    const TITULO_SECCION_RESULTADO = document.getElementById(TITULO_SeccionesResultados_id+i);
    const SECCION_RESULTADOS = document.getElementById(RESULTADO_SeccionesResultados_id+i);
    SECCION_RESULTADOS.innerHTML = "";
    
    //Asigna titulos a la pagina
    TITULO_SECCION_RESULTADO.textContent=titulosSeccionesResultados[i];   //Titulo de esta seccion
    TITULO_SECCION_RESULTADO.onclick = function() {showHideSectionResultados(SECCION_RESULTADOS)};

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

        value = rateConverter(VALUE_CAMPO_BUSQUEDA,fromTasa,toTasa,periodsInput,periodsOutput,2);

          //Se muestra en el DOM el resultado de cada conversion
          button_Resultado = newElement("button",`${value}%`,"value_reultado");
          copy_Resultado =newElement("button","copiar","btn_copiar_tasa_convertida")

          //Agrega las funciones de copiado
          button_Resultado.onclick = function() {copyToClipboard(button_Resultado.textContent)};
          copy_Resultado.onclick =function() {copyToClipboard(`${button_Resultado.textContent} ${p_Resultado.textContent}`)};

          sectionRateOutputAncicipated ? p_Resultado = newElement("p",`${element.nombre} ${ANTICIPATED}`) : p_Resultado = newElement("p",`${element.nombre}`);

          li_Resultado = newElement("li","");
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


  if (anticipated) {
    RESULTADO_TITULO.textContent = `${value}% ${tasa} anticipada`;
  }else{
    RESULTADO_TITULO.textContent = `${value}% ${tasa}`;
  }

  RESULTADO_INFO.textContent = INFO_TASA.definicion + INFO_TASA_EQUIVALE;
  
}

function copyToClipboard(value) {
  //Copia value en textbox (Portapapeles) 
  Portapapeles.value=value;
  Portapapeles.select();
  document.execCommand('copy'); //Copiar
  Portapapeles.disabled = true;
  Portapapeles.disabled = false;

  popAlerta(pop,value + " Se ha copiado",1000,"#1B998B");

}

//ATAJOS
document.addEventListener("keyup", ({key}) => {
  //Escribe la linea al presionar enter (O aceptar en moviles).
  if (key === "Enter") {
    sugerenciasBox.style.display = 'none';
    mostrarResultados();
  }
})




//EJECUCION INICIAL
popAlerta(pop,"Hola, 👋.",5000,"#0075C4");
