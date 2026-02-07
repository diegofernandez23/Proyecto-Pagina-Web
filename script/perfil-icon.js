document.addEventListener("DOMContentLoaded", function() {

    const iconoCabecera = document.getElementById("foto-perfil-cabecera");


    // Solo continuamos si encontramos el icono en el DOM
    if (iconoCabecera) {
        // 2. Obtener el usuario actual y sus datos de localStorage
        const usuarioActual = localStorage.getItem("usuarioActual");
        
        // Si no hay sesión iniciada, simplemente salimos y se queda el icono por defecto.
        if (!usuarioActual) {
            return;
        }

        const userData = JSON.parse(localStorage.getItem(usuarioActual));

        // 3. Comprobar que los datos del usuario y la URL de la imagen existen
        if (userData && userData.imagen) {
            // 4. Aplicar la imagen de perfil
            iconoCabecera.src = userData.imagen;
            iconoCabecera.alt = `Foto de perfil de ${userData.usuario}`;
            
            // Opcional: Asegurar el estilo si es necesario (ej. hacerlo circular)
            iconoCabecera.style.width = '30px'; 
            iconoCabecera.style.height = '30px';
            iconoCabecera.style.borderRadius = '50%'; 
            iconoCabecera.style.objectFit = 'cover';
        }
    }
});