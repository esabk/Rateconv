//Estructura para una tasa

export class Tasa{
    id=0;
    value=0;
    type="";
    periods=1;
    anticipated=false;


    constructor(id,value,type,periods,anticipated){
        this.id=id;
        this.value=value;
        this.type=type;
        this.periods=periods
        this.anticipated=anticipated;
    } 
}