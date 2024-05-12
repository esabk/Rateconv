//Obtiene las tasas guaradas en el archivo tasas.json en la carpeta Data.
const _TASAS_JSON = () =>{
  return fetch('../data/tasas.json')
            .then(res=>res.json())
            .catch(err => console.log('Producto no encontrado'));
};

// Función Async que procesa la petición y retorna su resultado
export async function ratesFromJSON() {
  
  //Obtiene las tasas
  let tasas = await _TASAS_JSON();
  if (tasas) {
    console.log('Tasas cargadas');
    return tasas;
  }else{
    return "No se ha podido cargar las tasas";
  }
}
