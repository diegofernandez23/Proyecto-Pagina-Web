document.addEventListener("DOMContentLoaded", function () {
    const inputCorreo = document.getElementById('correo');
    const boton = document.getElementById('btn-suscribir');

    boton.addEventListener('click', function () {

        if (!inputCorreo.checkValidity()) {
            inputCorreo.reportValidity();
            return;
        }

        alert("¡Gracias! Te has suscrito a la newsletter");
        inputCorreo.value = "";
    });
});
