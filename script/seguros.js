//enlazado con window.location.href = 'confirmacion-c.html';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-seguro');
    const volverBtn = document.getElementById('volver-seguro');
    // Elementos de la ventana modal
    const enlacePoliza = document.querySelector('.enlace-poliza');
    const modal = document.getElementById('modal-terminos');
    const checkboxTerminos = document.getElementById('acepto_terminos_seguro');

    // lógica de la ventana modal 
    function cerrarModalYDesbloquear() {
        if (modal) {
            modal.classList.add('hidden');
        }
        if (checkboxTerminos) {
            // Desbloquea el checkbox y lo marca automáticamente (indicación del profesor)
            checkboxTerminos.disabled = false;
            checkboxTerminos.checked = true;
        }
    }

    // A. Abrir Modal al hacer clic en el enlace
    if (enlacePoliza) {
        enlacePoliza.addEventListener('click', function(e) {
            e.preventDefault(); 
            if (modal) {
                modal.classList.remove('hidden');
                // Opcional: para que el scroll empiece arriba
                const modalContent = document.querySelector('#modal-terminos .modal-content');
                if (modalContent) modalContent.scrollTop = 0;
            }
        });
    }

    
    // Opcional: Cierre al hacer clic fuera (en el overlay)
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target.id === 'modal-terminos') {
                cerrarModalYDesbloquear();
            }
        });
    }

    // C. Revertir la validación: Si el usuario desmarca el checkbox, volver a deshabilitarlo.
    // Esto es para que no puedan desmarcarlo y luego volver a marcarlo sin leer.
    if (checkboxTerminos) {
        checkboxTerminos.addEventListener('change', function() {
            if (!this.checked && !this.disabled) {
                // Si el usuario desmarca y NO está deshabilitado (lo cual significa que ya leyó),
                // no lo deshabilitamos de nuevo para que sea fácil desmarcar/marcar si ya leyó.
            }
        });
    }

    // 1. Manejar el botón Siguiente/Enviar
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Siempre prevenimos el envío automático

            // aseguramos que se seleccione si o no 
            const seguroSeleccionado = document.querySelector('input[name="seguro_contratado"]:checked');

            if (!seguroSeleccionado) {
                alert('Por favor, selecciona si deseas contratar el seguro de viaje (Sí o No) antes de continuar.');
                return; // Detiene la ejecución
            }


            // validación de términos 
            if (checkboxTerminos.disabled) {
                alert('Debes abrir y aceptar los términos y condiciones de la póliza para habilitar la casilla.');
                return;
            }

            // Obtener el valor del seguro seleccionado
            const costoSeguro = parseInt(seguroSeleccionado.value);
            
            // 2. Guardar el costo del seguro
            // Usamos sessionStorage para que el valor esté disponible en la página de confirmación.
            sessionStorage.setItem('costoSeguro', costoSeguro); 

            // 3. Redirigir al siguiente paso
            window.location.href = 'pago.html';
        });
    }

    // 4. Manejar el botón Volver (redirige al paso anterior: acompañantes)
    if (volverBtn) {
        volverBtn.addEventListener('click', function() {
            window.location.href = 'NUEVO-ampliacion-c.html';
        });
    }
});