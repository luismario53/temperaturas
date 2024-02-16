


const obtenerTemperatura = async () => {

  setInterval(() => {

    (async () => {
      try {
        const response = await fetch('https://us-east-1.aws.data.mongodb-api.com/app/application-0-lgljv/endpoint/obtenerUltimaTemperatura');

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        // Aquí puedes trabajar con los datos recibidos
        const { temperatura, date } = data[0]
        
        const label = document.getElementById('temperaturaId')
        label.textContent = temperatura
        
        const toNumber = Number(temperatura)
        
        if(toNumber >= 25) {
          const aviso = document.getElementById('avisoId')
          aviso.textContent = 'Esta caliente'
          const inicio = new Date(date)

          if(!localStorage.getItem('inicio')) {
            localStorage.setItem('inicio', inicio)
          }
          
        } else {
          const aviso = document.getElementById('avisoId')
          aviso.textContent = ''

          if(localStorage.getItem('inicio')) {
            const inicio = localStorage.getItem('inicio')
            const result = calcularDiferenciaEnMinutosYSegundos(new Date(inicio), new Date(date))
            const { minutos, segundos } = result

            const tiempo = document.getElementById('tiempoId')
            tiempo.textContent = `Ultimo Tiempo caliente: ${minutos} minutos, ${segundos} segundos`
            localStorage.clear()
          }
        }

      } catch (error) {
        console.error('Ha ocurrido un error:', error);
      }
    })();

  }, 2500)

} 


const calcularDiferenciaEnMinutosYSegundos = (fechaInicio, fechaFin) => {
  // Calcula la diferencia en milisegundos
  const diferencia = fechaFin.getTime() - fechaInicio.getTime();

  // Convierte la diferencia a minutos y segundos
  const minutos = Math.floor(diferencia / 60000); // 60 segundos * 1000 milisegundos
  const segundos = Math.floor((diferencia % 60000) / 1000); // Resto de los minutos convertido a segundos
  console.log(minutos)
  console.log(segundos)
  return { minutos, segundos };
}