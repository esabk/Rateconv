//Este Script lee y escribe la url
let UrlParams = new URLSearchParams(window.location.search);

//Esta función sirve para obtener valores desde la URL
export function getVariableFromURL(UrlVariable){
    return  UrlParams.get(UrlVariable);
}

//Esta función crea una URL con la conversión actual
export function shareRateConvertion(rateValue,rateType,rateAnticipated) {

    const SHARE_URL = new URL(window.location.href.split('?')[0]);
    SHARE_URL.searchParams.append('rateValue',rateValue);
    SHARE_URL.searchParams.append('rateType', rateType);
    SHARE_URL.searchParams.append('rateAnticipated', rateAnticipated);
    console.log(SHARE_URL.href);

    return SHARE_URL.href;
}