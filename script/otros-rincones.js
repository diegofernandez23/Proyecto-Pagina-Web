// Este objeto define los países que se mostrarán en el segundo select
const paisesPorContinente = {
    europa: [
        "Austria", "Bélgica", "Dinamarca", "Eslovenia", "España", 
        "Estonia", "Francia", "Hungría", "Italia", "Malta", 
        "Noruega", "Paises Bajos", "Portugal", "Reino Unido", 
        "República Checa", "Suiza", "Islandia"
    ],
    asia: [
        "China", "Corea del Sur", "India", "Japón", "Laos", 
        "Líbano", "Omán", "Qatar", "Tailandia", "Vietnam", "Singapur"
    ],
    africa: ["Marruecos", "Sudáfrica"],
    oceania: ["Australia", "Nueva Zelanda"],
    america_norte: ["Canadá", "Estados Unidos", "México"],
    america_sur: ["Argentina", "Brasil", "Colombia", "Ecuador", "Perú"]
};


function actualizarPaises() {
    const continenteSelect = document.getElementById('continente-select');
    const paisSelect = document.getElementById('pais-select');
    const continenteSeleccionado = continenteSelect.value;

    // Limpia las opciones anteriores del selector de país
    paisSelect.innerHTML = '<option value="">-- Todos los Países --</option>';

    if (continenteSeleccionado && paisesPorContinente[continenteSeleccionado]) {
        const paises = paisesPorContinente[continenteSeleccionado];

        // Añade los países correspondientes al selector
        paises.forEach(pais => {
            const option = document.createElement('option');
            option.value = pais;
            option.textContent = pais;
            paisSelect.appendChild(option);
        });
    }
}

function filtrarCiudades() {
    const continenteSeleccionado = document.getElementById('continente-select').value;
    const paisSeleccionado = document.getElementById('pais-select').value;
    const filtroPais = paisSeleccionado ? paisSeleccionado.toLowerCase() : '';

    // 1. Seleccionar TODOS los bloques (títulos y cuadrículas) que necesitan filtrarse
    // Usamos el selector CSS de múltiples clases:
    const todosLosBloques = document.querySelectorAll('.cuadricula-ciudades, .banner'); 

    todosLosBloques.forEach(bloque => {
        // Comprueba si el bloque tiene la clase del continente seleccionado
        const debeMostrarBloque = (continenteSeleccionado === "" || bloque.classList.contains(continenteSeleccionado));
        
        // Aplica la visibilidad al bloque completo (título o cuadrícula)
        bloque.style.display = debeMostrarBloque ? 'grid' : 'none'; 
        
        // Solo continuamos con el filtro de país si es una CUADRÍCULA DE CIUDADES
        if (bloque.classList.contains('cuadricula-ciudades') && debeMostrarBloque) {
            
            // 2. Filtrar las tarjetas individuales dentro de este bloque
            const ciudadesEnCuadricula = bloque.querySelectorAll('.ciudad');

            ciudadesEnCuadricula.forEach(ciudad => {
                const ciudadNombrePais = ciudad.querySelector('.ciudad-h5').textContent; 
                // Buscamos el nombre del país (separado por ,)
                const paisCiudadTexto = ciudadNombrePais.split(',').length > 1 ? ciudadNombrePais.split(',')[1].trim().toLowerCase() : '';
                
                let debeMostrarTarjeta = true;

                // Si hay un país seleccionado Y el país de la tarjeta NO coincide
                if (filtroPais && paisCiudadTexto !== filtroPais) {
                    debeMostrarTarjeta = false;
                }

                ciudad.style.display = debeMostrarTarjeta ? 'grid' : 'none';
            });
        }
    });
}