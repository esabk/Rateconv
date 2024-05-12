console.log("RateConv");

//Devuelve un valor % (0,10 => 10%)

//Palabras Claves:
let ea = "efectiva anual";
let pv ="periodica";
let pa = "periodica anticipada";
let nv = "nominal";
let na = "nominal anticipada";

const FLOAT_PRECISION = 10;


// Para un valor (value) en un tipo de tasa dada (fromTasa) la convierte a una tasa efectiva anual.
function toEfectiva(value,fromTasa,fromPeriods,noDecimales) {
    noDecimales == null ? noDecimales = FLOAT_PRECISION: noDecimales;  //cantidad de decimales del resultado
    value = value/100 ;  //Pasa el valor a decimales para la formula 

    let intermedioPeriodica;  //Se usa para pasos intermedios en conversiones desde tasas periodicas
    let intermedioNominal;    //Se usa para pasos intermedios en conversiones desde tasas nominales

    let result; //Guarda el resultado en cada conversion

    switch (fromTasa) {

        //Devuelve la tasa de entrada convertida en %
        case ea:{
            result = value * 100;
            return result.toFixed(noDecimales);
            break;
        }

        //Devuelve una tasa EA partiendo de una periodica vencida (Mensual, trimestral...)
        case pv:{
            intermedioPeriodica = 1 + value ;
            result = ((intermedioPeriodica ** fromPeriods) - 1 )*100;
            return result.toFixed(noDecimales);
            break;
        }

        //Devuelve una tasa EA partiendo de una periodica anticipada (Mensual anticipada, trimestral anticipada ...)
        case pa:{
            intermedioPeriodica = value / (1-value);                                           // 1. Se pasa de PERIODICA ANTICIPADA a PERIODICA VENCIDA
            result = Number(toEfectiva((intermedioPeriodica*100),pv,fromPeriods));         // 2. Se pasa de PERIODICA VENCIDA A EFECTIVA ANUAL
            return result.toFixed(noDecimales);
            break;
        }

        //Devuelve una tasa EA partiendo de una nominal vencida (Mes (MV), Trimestre (TV)...)
        case nv:{ 

            intermedioNominal = 1 + (value/fromPeriods);
            result = ((intermedioNominal ** fromPeriods) - 1 )*100;

            return result.toFixed(noDecimales);
            break;
        }

        //Devuelve una tasa EA partiendo de una nominal anticipada (Mes anticipada (MA), Trimestre anticipada (TA)...)
        case na:{
            intermedioNominal = 1 - (value/fromPeriods);
            result = ((intermedioNominal ** -fromPeriods) - 1 )*100;

            return result.toFixed(2);
            break;
        }

    }
}

// Convierte una tasa efectiva anual a un tipo tasa dada (To tasa) dependiendo sus periodos año (toPeriods)
function fromEfectiva(value,toTasa,toPeriods,noDecimales) {
    noDecimales == null ? noDecimales = FLOAT_PRECISION: noDecimales;  //cantidad de decimales del resultado
    value = value/100   //Pasa el valor a decimales para la formula

    let intermedioPeriodica;  //Se usa para pasos intermedios en conversiones hacia tasas periodicas
    let intermedioNominal;    //Se usa para pasos intermedios en conversiones hacia tasas nominales

    let result; //Guarda el resultado en cada conversion


    switch (toTasa) {

        //Devuelve la tasa de entrada convertida en %
        case ea:{ 
            result = value * 100;
            return result.toFixed(noDecimales);
            break;
        }

        //Devuelve una tasa periodica vencida (mensual,trimestral, semestral...)
        case pv:{ 
            intermedioPeriodica =(1 + value) ** (1/toPeriods);
            result = (intermedioPeriodica - 1 ) *100;
            return result.toFixed(noDecimales);
            break;
        }

        //Devuelve una tasa periodica anticipada (mensual anticipada, trimestral anticiapada...)
        case pa:{
            intermedioPeriodica = fromEfectiva((value*100),pv,toPeriods,FLOAT_PRECISION);                 // 1. Pasa la tasa EA a PERIODICA VENCIDA   
            intermedioPeriodica = (intermedioPeriodica/100)/(1+(intermedioPeriodica/100))   // 2. Pasa la tasa PERIODICA VENCIDA a PERIODICA ANTICIPADA
            result = intermedioPeriodica * 100;
            return result.toFixed(noDecimales);
            break;
        }

        //Devuelve una tasa nominal vencida (Mes (MV), Trimestre (TV)...)
        case nv:{
            intermedioNominal = fromEfectiva((value*100),pv,toPeriods,FLOAT_PRECISION);  //1. Pasa la tasa EA a PERIODICA VENCIDA 
            result = toPeriods*intermedioNominal;                          //2. Pasa la tasa PERIODICA VENCIDA a NOMINAL VENCIDA

            return result.toFixed(noDecimales);
            break;
        }

        //Devuelve una tasa nominal anticipada (Mes anticipada (MA), Trimestre anticipada (TA)...)
        case na:{
            intermedioNominal = fromEfectiva((value*100),pa,toPeriods,FLOAT_PRECISION);  // 1. Pasa la EA a PERIODICA ANTICIPADA
            result = (intermedioNominal * toPeriods);                      // 2. Pasa la PERIODICA ANTICIPADA a NOMINAL ANTICIPADA
            return result.toFixed(noDecimales);
            break;
        }
    }

}

/*
    Esta función gestiona las conversiones, dependiendo la tasa de entrada
    hace la conversión a la tasa de salida.
*/

export function rateConverter(value,fromTasa,toTasa,fromPeriods,toPeriods,noDecimales) {

    noDecimales == null ? noDecimales = FLOAT_PRECISION: noDecimales;  //cantidad de decimales del resultado

    //console.warn(`Covertir ${value}% ${fromTasa} (${fromPeriods}) a ${toTasa} (${toPeriods})`)
    console.log(value+"% Tasa convertida")

    //Convierte la tasa ingresada en EA con una precisión de 5 decimales

    let valueEA = toEfectiva(value,fromTasa,fromPeriods); 
    let result = Number(fromEfectiva(valueEA,toTasa,toPeriods));
    return result.toFixed(noDecimales);

}

//RATE CONVERTER CHEATSHEET
/*
    value            --- valor de la tasa a convertir

    fromTasa         --- pv (Periodica vencida) , pa (periodica anticipada)
                         nv (Nominal Vencida)   , va (nominal Anticipada)
                         ea (Efectiva Anual)
    
    toTasa           --- pv (Periodica vencida) , pa (periodica anticipada)
                         nv (Nominal Vencida)   , va (nominal Anticipada)
                         ea (Efectiva Anual)
    
    fromPeriods      --- Número de periodos año de la tasa a convertir
    
    toPeriods        --- Número de periodos año de la tasa final (o destino)
    
    
*/
