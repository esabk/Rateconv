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
  const anticipadaCheck =document.getElementById("anticipadaCheck");
//DOM Elementos resultado
  const resultado = document.getElementById("resultado");
  const resultado_titulo=document.getElementById("resultado_titulo");
  const resultado_info=document.getElementById("resultado_info");
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
let titulosSeccionesResultados = ["Efectiva anual","Tasas  periodicas ","Tasas  periodicas  anticipadas ","Tasas  nominales ","Tasas  nominales  anticipadas "];
let resultadoTituloActivo;

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


//Funcion para ejejecutar la conversion de tasas y mouestra los resultados
function mostrarResultados(){
  resultadoTasasConvertidas.innerHTML="";

  let fromRate = tasas_seleccion.value;

  //Muestra u oculta la sección de resultado dependiendo si hay o no valores en el cuadro de busqueda
  if (Number(campoBusqueda.value.replace(EXPRESION_REGULAR,""))>0) {
    resultado.style.display="block";
    
  //Datos para crear TASA_INPUT dependiendo lo ingresado
  TASA_INPUT.value = campoBusqueda.value.replace(EXPRESION_REGULAR,"");  //Tasa a convertir ingresada
  TASA_INPUT.anticipated = anticipadaCheck.checked;

  
  //Cambia el titulo del resultado basado en la tasa elegida
  //Comprueba si es una tasa Anticipada para adaptar el titulo
  TASA_INPUT.anticipated ? resultado_titulo.textContent=`${TASA_INPUT.value}% ${fromRate} acticipada` : resultado_titulo.textContent=`${TASA_INPUT.value}% ${fromRate}` ;

  //Muestra los resultados de la conversión
  resultadoTasasConvertidas.innerHTML="";

  
  //Secciones de resultados
  for (let i = 0; i < titulosSeccionesResultados.length; i++) {
    resultadoTituloActivo = titulosSeccionesResultados[i];

    //1. Se crea un boton para ocultar o mostrar un determinado seccion de resultado de tasas --- También es el titulo de cada seccion
    let btn_grupo_tasa=newElement("button",resultadoTituloActivo,"btn_resultado_seccion","");  

      //Funcionalidad boton de seccion resultado
      btn_grupo_tasa.setAttribute("onclick", `showHideSectionResultados(${i})`);

      

    //2. Crea la secciones para cada tipo de tasa (Inlcuye un boton con el titulo del tipo y la seccion donde se colocan los resultados)
    let seccionTipoTasa = newElement("section","",`section_id_${i}`,"tipo_tasa"); //Crea una nueva sección de resultados
    
    
    //3. Crea una <ul> donde se agregarán las li con cada resultado de tasa de esta seccion
    let tasa_de_interes_ul=newElement("ul","","",`ulResultados${i}`); //Crea la lista de resultados O Contenido de la sección de resultados

    //--- Añade cada titulo y seccion a los resultados
      //Añade el boton como titullo de esta sección
      seccionTipoTasa.appendChild(btn_grupo_tasa);

      //Añade la sección a la lista de resultados
      resultadoTasasConvertidas.appendChild(seccionTipoTasa);

    let elementIdCode = 0;        // ID para la lista de conversion
    let resultadoDefinicion;      // Descripción de la tasa ingresada

    // 4. Calcula las conversiones de tasas por seccion  
    tasasJSON.forEach(element => {  

      //Encuentra el tipo de tasa y periodo de la tasa ingresada en tasasJSON
      if (element.nombre == fromRate) {
        
        // Verifica si se activo la opcion de tasa seleccionada
        if (TASA_INPUT.anticipated) { 
          TASA_INPUT.type = element.tipo + " anticipada";
        }else{
          TASA_INPUT.type = element.tipo;
        }

        TASA_INPUT.periods = element.periodos;

        //También busca y muestra la definicio de la tasa seleccionada
        resultadoDefinicion = element.definicion;
        resultado_info.textContent=`${resultadoDefinicion} Esta tasa equivale a las siguientes tasas: `;
      }

      //--- Va creando los elemento li donde se mostra los resultados correspondientes a la seccion
      let tasa_de_interes_li=document.createElement('li',"","",);

//*** Cada resultado por seccion
      //Verifica si el elemento de tasasJSON pertenece a la seccion del resultado
      if (resultadoTituloActivo.toLowerCase().includes(element.tipo)) {
        

        TASA_OUTPUT.type = resultadoTituloActivo.toLowerCase().includes("anticipada") ?  element.tipo + " anticipada": element.tipo;
        TASA_OUTPUT.periods = element.periodos; 
        TASA_OUTPUT.value = rateConverter(TASA_INPUT.value,TASA_INPUT.type,TASA_OUTPUT.type,TASA_INPUT.periods,TASA_OUTPUT.periods,2);
        
        let btn_valor_tasa_convertida=newElement("button",TASA_OUTPUT.value + "%","btn_valor_tasa_convertida",`btn_valor_tasa_convertida_${elementIdCode}`);
        let nombre_tasa_p = resultadoTituloActivo.toLowerCase().includes("anticipada") ? newElement("p",element.nombre + " anticipada") : newElement("p",element.nombre);
        let btn_copiar_tasa_convertida=newElement("button","Copiar","btn_copiar_tasa_convertida"); 


        btn_valor_tasa_convertida.onclick = function() { //Copia la tasa del boton
            Portapapeles.value=this.textContent;
            Portapapeles.select();
            document.execCommand('copy'); //Copiar

            popAlerta(pop,this.textContent + " Se ha copiado",1000,"#1B998B")

          };

          //Añade elementos a la lista de resultados
          tasa_de_interes_li.appendChild(btn_valor_tasa_convertida)       // Valor tasa convertida
          tasa_de_interes_li.appendChild(nombre_tasa_p);                  // Nombre tasa convertida
          tasa_de_interes_li.appendChild(btn_copiar_tasa_convertida)      // Boton de copiar
          tasa_de_interes_ul.appendChild(tasa_de_interes_li);             //Añade cada tasa a la lista
          //Añade los valores y secciones al de resultados al DOM
          resultadoTasasConvertidas.appendChild(tasa_de_interes_ul); 
        
        
      }

                     

      })
     
  }
  }else{
    resultado.style.display="none";
  }


  
};

popAlerta(pop,"Hola, empieza gratis, rápido y sin anuncios.",5000)

setInterval(() => {
  if ( Number(campoBusqueda.value.replace("%","")) >= 0) {
  }else{
    popAlerta(pop,"Ingresa solo números o porcentajes",2000,"red");
  }
}, 3000);

//ATAJOS
document.addEventListener("keyup", function(event) {
  if (event.code === 'Enter') {                           //Presionar enter

    campoBusqueda.value=campoBusqueda.value.replace(EXPRESION_REGULAR,"");
    campoBusqueda.value+="%";
    sugerenciasBox.style.display = 'none';
    mostrarResultados();
  }
});

//EJECUCION INICIAL
campoBusqueda.value=2;
tasas_seleccion.value="Mensual";
mostrarResultados();
campoBusqueda.value="";
mostrarResultados();

