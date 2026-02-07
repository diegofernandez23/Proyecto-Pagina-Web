document.addEventListener("DOMContentLoaded", function() {
    // seleccionar el enlace "Compartir Consejo"
    const enlaceCompartir = document.querySelector('.btn-compartir');

    if (enlaceCompartir) {
        enlaceCompartir.addEventListener('click', function(event) {
            // comprobar si hay un usuario logueado en localStorage
            const usuarioActual = localStorage.getItem('usuarioActual');

            if (!usuarioActual) {
                // si no hay usuario con sesión iniciada
                
                // Detener la navegación del enlace (evita que vaya a nuevo-consejo.html)
                event.preventDefault(); 
                
                // Mostrar una alerta al usuario
                alert('Debes iniciar sesión para compartir un consejo.');
            }
        });
    }
});