
// Variables
const TEMPERATURA = document.getElementById('temperaturaId')
const AVISO = document.getElementById('avisoId')
const TIEMPO_10 = document.getElementById('tiempoLimite10Id')
const TIEMPO_20 = document.getElementById('tiempoLimite20Id')
const TEMPERATURA_LIMITE = document.getElementById('temperaturaLimiteId')

// Textos
const LIMITE_10 = 'La temperatura superó el 10% de la temperatura establecida'
const LIMITE_20 = 'La temperatura superó el 20% de la temperatura establecida'
const AVISO_LIMITE = 'La temperatura pasó el rango'
const TIEMPO_LIMITE_10 = 'Tiempo en límites de 10%:'
const TIEMPO_LIMITE_20 = 'Tiempo en límites de 20%:'
const SIN_CONEXION = 'No hay conexión'
const GRADOS = '°C' 
const IS_DISCONNECTED = 2000

document.addEventListener('DOMContentLoaded', function() {
  validarConexion();
});

// Validamos que el raspberry pi este conectado
const validarConexion = async () => {
  
  try {
    
    const response = await fetch('https://us-east-1.aws.data.mongodb-api.com/app/application-0-lgljv/endpoint/obtenerUltimaTemperatura');
    if (!response.ok) throw new Error('Network response was not ok');

    const data = await response.json();
    const { temperatura, date } = data[0]
    // const toNumber = Number(temperatura).toFixed(2)
    const inicio = new Date(date)
    const result = calcularDiferenciaTiempo(inicio, new Date())
    const { minutos } = result
    const isDisconnected = minutos > IS_DISCONNECTED
    
    // Si no detecta un cambio en el ultimo registro muestra aviso
    // Se ejecuta una sola vez al cargar la pagina
    TEMPERATURA.classList.toggle('text-danger', isDisconnected)
    if(isDisconnected) {
      TEMPERATURA.textContent = SIN_CONEXION
    } else {
      TEMPERATURA.textContent = `${temperatura} ${GRADOS}`
      obtenerTemperatura()
    }

  } catch (error) {
    
  }
}


const obtenerTemperatura = async () => {

  // Ejecutamos la consulta cada 15 segundos
  setInterval(() => {

    (async () => {
      try {
        const TEMPERATURA_LIMITE_ACTUAL = Number(TEMPERATURA_LIMITE.value).toFixed(2)

        // Realizamos la peticion para obtener la ultima temperatura registrada
        const response = await fetch('https://us-east-1.aws.data.mongodb-api.com/app/application-0-lgljv/endpoint/obtenerUltimaTemperatura');

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        // Aquí puedes trabajar con los datos recibidos
        const { temperatura, date } = data[0]

        const toNumber = Number(temperatura).toFixed(2)
        TEMPERATURA.textContent = toNumber
        
        // Validamos si la temperatura supero el 10% de la temperatura limite establecida
        if(toNumber >= (TEMPERATURA_LIMITE_ACTUAL * 1.10)) {
          AVISO.textContent = LIMITE_10
          const inicio = new Date(date)

          // Si no ha sido guardada, se almacena para guardar la referencia
          if(localStorage.getItem('inicio_10') !== undefined) {
            localStorage.setItem('inicio_10', inicio)
          }
          
        } else {
          AVISO.textContent = ''

          // Calculamos la diferencia de tiempo entre la fecha guardada y la fecha en la que la temperatura bajo del limite del 10%
          // Borramos la temperatura guardada y mostramos el tiempo en minutos y segundos
          if(localStorage.getItem('inicio_10')) {
            const inicio = localStorage.getItem('inicio_10')
            const result = calcularDiferenciaTiempo(new Date(inicio), new Date())
            const { minutos, segundos } = result

            TIEMPO_10.textContent = `${TIEMPO_LIMITE_10} ${minutos} minutos, ${segundos} segundos`
            localStorage.clear()
          }
        }

        // Validamos si la temperatura supero el 20% de la temperatura limite establecida
        if(toNumber >= TEMPERATURA_LIMITE_ACTUAL * 1.20) {
          AVISO.textContent = LIMITE_20
          const inicio = new Date(date)

          // Si no ha sido guardada, se almacena para guardar la referencia
          if(localStorage.getItem('inicio_20') !== undefined) {
            localStorage.setItem('inicio_20', inicio)
          }
          
        } else {
          AVISO.textContent = ''

          // Calculamos la diferencia de tiempo entre la fecha guardada y la fecha en la que la temperatura bajo del limite del 20%
          // Borramos la temperatura guardada y mostramos el tiempo en minutos y segundos
          if(localStorage.getItem('inicio_20')) {
            const inicio = localStorage.getItem('inicio_20')
            const result = calcularDiferenciaTiempo(new Date(inicio), new Date())
            const { minutos, segundos } = result

            TIEMPO_20.textContent = `${TIEMPO_LIMITE_20} ${minutos} minutos, ${segundos} segundos`
            localStorage.clear()
          }
        }

      } catch (error) {
        console.error('Ha ocurrido un error:', error);
      }
    })();

  }, 10000)

} 

const calcularDiferenciaTiempo = (fechaInicio, fechaFin) => {
  // Calcula la diferencia en milisegundos
  const diferencia = fechaFin.getTime() - fechaInicio.getTime();

  // Convierte la diferencia a minutos y segundos
  const minutos = Math.floor(diferencia / 60000); // 60 segundos * 1000 milisegundos
  const segundos = Math.floor((diferencia % 60000) / 1000); // Resto de los minutos convertido a segundos
  return { minutos, segundos };
}