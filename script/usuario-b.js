document.addEventListener("DOMContentLoaded", function() {

    //obtener el usario actual que ha inicado sesion
    const usuarioActual = localStorage.getItem("usuarioActual"); 

    //si no hay niguno se redirige a la pagina principal
    if (!usuarioActual) {
        window.location.href = "index.html";
        return;
    }

    //se obtienen los datos del usuario
    const userData = JSON.parse(localStorage.getItem(usuarioActual)); 

    //se muestra el nombre de usuario
    const nombreUsuarioElemento = document.querySelector(".usuario-nombre");
    if (nombreUsuarioElemento && userData) {
        nombreUsuarioElemento.textContent = userData.usuario;
    }

    //se muestra la imagen de perfil
    const iconoPerfilElemento = document.querySelector(".icono-usuario");
    if (iconoPerfilElemento && userData?.imagen) {
        iconoPerfilElemento.src = userData.imagen;   
        iconoPerfilElemento.style.display = "block"; //se hace visible
    }

    //boton de cerra sesion
    const botonCerrar = document.querySelector(".cerrar-sesion");
    if (botonCerrar) {
        $(botonCerrar).on("click", function () {
            //overlay + modal
            const $overlay = $('<div class="modal-overlay"></div>');
            const $modal   = $('<div class="modal-confirm"></div>');

            $modal.append(`
                <p>¿Desea cerrar sesión?</p>
                <div class="modal-actions">
                    <button class="modal-confirmar">Confirmar</button>
                    <button class="modal-cancelar">Cancelar</button>
                </div>
            `);

            $overlay.append($modal);
            $("body").append($overlay);

            //cerrar por boton "Cancelar"
            $overlay.on("click", ".modal-cancelar", function () {
                $overlay.remove();
            });

            //confirmar: limpiar sesión y redirigir
            $overlay.on("click", ".modal-confirmar", function () {
                try {
                    localStorage.removeItem("usuarioActual");
                } catch (e) {
                    console.error("Error al cerrar sesión:", e);
                }
                $overlay.remove();
                window.location.href = "index.html";
            });

            //cerrar al hacer clic fuera del cuadro
            $overlay.on("click", function (e) {
                if (e.target === $overlay[0]) {
                    $overlay.remove();
                }
            });
        });
    }
});