document.addEventListener("DOMContentLoaded", function() {
    //validar el campo nombre
    const nombreInput = document.getElementById("nombre"); //obtiene el input del nombre

    nombreInput.addEventListener("input", function() {
        const valor = this.value.trim(); //elimina espacios en blanco

        //si el nombre tiene entre 1 y 2 caracteres, muestra un mensaje de error
        if (valor.length > 0 && valor.length < 3) {
            this.setCustomValidity("El nombre debe tener al menos 3 caracteres"); //mensaje de error
        } 
        //restablece el mensaje de error
        else {
            this.setCustomValidity("");
        }
    });

    //validar el campo apellidos
    const apellidosInput = document.getElementById("apellidos"); //obtiene el input de los apellidos

    apellidosInput.addEventListener("input", function() {
        const valor = this.value.trim(); //elimina espacios en blanco

        if (valor.length > 0) {
            const palabras = valor.split(/\s+/).filter(palabra => palabra.length > 0); //divide el valor en palabras y filtra las vacias

            //al menos 2 cadenas
            if (palabras.length < 2) {
                this.setCustomValidity("Debe ingresar al menos dos apellidos"); //mensaje de error
            }
            //cada cadena al menos 3 caracteres
            else if (palabras.some(palabra => palabra.length < 3)) {
                this.setCustomValidity("Cada apellido debe tener al menos 3 caracteres"); //mensaje de error
            }
            //restablece el mensaje de error
            else {
                this.setCustomValidity("");
            }
        }
    });

    //validar el campo correo
    const emailInput = document.getElementById("email"); //obtiene el input del correo

    emailInput.addEventListener("input", function() {
        const valor = this.value.trim(); //elimina espacios en blanco

        //valida solo si hay algo escrito
        if (valor.length > 0) {
            const partesEmail = valor.split("@"); //divide el valor en partes usando @ como separador

            //debe contener una sola @
            if (partesEmail.length !== 2) {
                this.setCustomValidity("El correo debe contener una sola @"); //mensaje de error
            }
            //debe contener un dominio valido
            else {
                const nombre = partesEmail[0]; //parte antes de @
                const dominio = partesEmail[1]; //parte despues de @
                const partesDominio = dominio.split("."); //divide el dominio en partes usando . como separador

                //valida el nombre
                if (nombre.length < 1) {
                    this.setCustomValidity("Debe haber un nombre antes del @"); //mensaje de error
                }
                //valida el dominio
                else if (partesDominio.length < 2) {
                    this.setCustomValidity("El dominio debe contener al menos una extensión: .es, .com, .org"); //mensaje de error
                }
                else if (partesDominio.some(parte => parte.length < 1)) {
                    this.setCustomValidity("El dominio no puede tener partes vacías"); //mensaje de error
                }
                //restablece el mensaje de error
                else {
                    this.setCustomValidity("");
                }
            }
        }
        else {
            this.setCustomValidity(""); //restablece el mensaje de error --> se maneja con required
        }
    });

    //validar el campo repetir correo
    const repetirEmailInput = document.getElementById("repetir-email"); //obtiene el input de repetir correo

    repetirEmailInput.addEventListener("input", function() {
        const valor = this.value.trim(); //elimina espacios en blanco
        const emailOriginal = document.getElementById("email").value.trim(); //obtiene el valor del correo original

        //valida solo si hay algo escrito
        if (valor.length > 0) {
            //compara con el correo original
            if (valor !== emailOriginal) {
                this.setCustomValidity("Los correos no coinciden"); //mensaje de error
            }
            //restablece el mensaje de error
            else {
                this.setCustomValidity("");
            }
        }
        else {
            this.setCustomValidity(""); //restablece el mensaje de error --> se maneja con required
        }
    });

    //validar el campo fecha de nacimiento
    const fechaNacimientoInput = document.getElementById("fecha-nacimiento"); //obtiene el input de fecha de nacimiento

    fechaNacimientoInput.addEventListener("input", function() {
        const fechaSeleccionada = new Date(this.value); //convierte el valor a un objeto Date
        const fechaActual = new Date(); //obtiene la fecha actual
        const AnoActual = fechaActual.getFullYear(); //obtiene el año actual
        const anoSeleccionado = fechaSeleccionada.getFullYear(); //obtiene el año seleccionado

        //calcular la edad
        let edad = AnoActual - anoSeleccionado; //diferencia de años
        const mesActual = fechaActual.getMonth(); //obtiene el mes actual
        const diaActual = fechaActual.getDate(); //obtiene el dia actual
        const mesNacimiento = fechaSeleccionada.getMonth(); //obtiene el mes de nacimiento
        const diaNacimiento = fechaSeleccionada.getDate(); //obtiene el dia de nacimiento

        //ajusta la edad si no ha cumplido años este año
        if (mesNacimiento > mesActual || (mesNacimiento === mesActual && diaNacimiento > diaActual)) {
            edad--; //si no ha cumplido años --> resta 1
        }

        //valida la edad
        if (fechaSeleccionada > fechaActual) {
            this.setCustomValidity("La fecha de nacimiento no puede ser futura"); //mensaje de error
        }
        else if (edad < 16) {
            this.setCustomValidity("Debes tener al menos 16 años"); //mensaje de error
        }
        else if (edad > 150) {
            this.setCustomValidity("La edad no puede ser mayor de 150 años"); //mensaje de error
        }
        //restablece el mensaje de error
        else {
            this.setCustomValidity("");
        }
    });

    //validar el campo usuario (login)
    const usuarioInput = document.getElementById("usuario"); //obtiene el input del usuario

    usuarioInput.addEventListener("input", function() {
        const valor = this.value; //obtiene el valor del usuario
        
        //valida que no contenga espacios
        if (/\s/.test(valor)) {
            this.setCustomValidity("El usuario no puede contener espacios"); //mensaje de error
            return;
        }
        //valida la longitud minima de 5 caracteres
        else if (valor.length > 0 && valor.length < 5) {
            this.setCustomValidity("El usuario debe tener al menos 5 caracteres"); //mensaje de error
            return;
        }
        //restablece el mensaje de error
        this.setCustomValidity("");
    });

    //validar el campo contraseña
    const contrasenaInput = document.getElementById("contrasena"); //obtiene el input de la contraseña

    contrasenaInput.addEventListener("input", function() {
        const valor = this.value; //obtiene el valor de la contraseña

        //valida que no contenga espacios
        if (/\s/.test(valor)) {
            this.setCustomValidity("La contraseña no puede contener espacios"); //mensaje de error
            return;
        }
        //valida la longitud minima de 8 caracteres
        if (valor.length < 8) {
            this.setCustomValidity("La contraseña debe tener al menos 8 caracteres"); //mensaje de error
            return;
        }
        //valida que contenga al menos 2 numeros
        const numeros = valor.match(/\d/g) || []; //busca todos los digitos
        if (numeros.length < 2) {
            this.setCustomValidity("La contraseña debe contener al menos 2 números"); //mensaje de error
            return;
        }
        //valida que contenga al menos 1 caracter especial
        if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]=+;'/`~]/.test(valor)) {
            this.setCustomValidity("La contraseña debe contener al menos 1 carácter especial"); //mensaje de error
            return;
        }
        //valida que contenga al menos 1 letra mayuscula
        if (!/[A-Z]/.test(valor)) {
            this.setCustomValidity("La contraseña debe contener al menos 1 letra mayúscula"); //mensaje de error
            return;
        }
        //valida que contenga al menos 1 letra minuscula
        if (!/[a-z]/.test(valor)) {
            this.setCustomValidity("La contraseña debe contener al menos 1 letra minúscula"); //mensaje de error
            return;
        }
        //restablece el mensaje de error
        this.setCustomValidity("");
    });

    //validar campo imagen de perfil
    const imagenInput = document.getElementById("imagen"); //obtiene el input de la imagen

    imagenInput.addEventListener("change", function() {
        const archivo = this.files[0]; //obtiene el archivo seleccionado

        //valida que se haya seleccionado un archivo
        if (!archivo) {
            this.setCustomValidity("Completa este campo"); // mensaje si no hay archivo
        }
        //valida el tipo de archivo
        else {
            const tiposPermitidos = ["image/webp", "image/png", "image/jpg"]; //tipos de imagen permitidos
            if (!tiposPermitidos.includes(archivo.type)) {
                this.value = ""; //limpia el campo
                this.setCustomValidity("Tipo de archivo no permitido. Solo se permiten: .webp, .png y .jpg"); //mensaje de error
            } else {
                this.setCustomValidity(""); // limpia el error si es válido
            }
        }
    });

    //validar campo politica de privacidad
    const terminosInput = document.getElementById("terminos"); //obtiene el input de terminos y condiciones
    const botonGuardar = document.querySelector(".btn-datos"); //obtiene el boton de guardar

    //funcion para habilitar/deshabilitar el boton de guardar
    function actualizarBotonGuardar() {
        if (terminosInput.checked) {
            botonGuardar.disabled = false; //habilita el boton
        } else {
            botonGuardar.disabled = true; //deshabilita el boton
        }
    }

    //inicializa el estado del boton
    actualizarBotonGuardar();

    //actualiza el estado del boton al cambiar el checkbox
    terminosInput.addEventListener("change", actualizarBotonGuardar);
});

//validar que todos los campos requeridos esten completos al enviar el formulario
document.querySelector(".forms-registro").addEventListener("submit", function(event) {
    //obtiene todos los campos requeridos
    const camposEspecificos = [
        document.getElementById("nombre"),
        document.getElementById("apellidos"),
        document.getElementById("email"),
        document.getElementById("repetir-email"),
        document.getElementById("usuario"),
        document.getElementById("contrasena"),
        document.getElementById("imagen"),
    ]

    let incompleto = false; //bandera para campos incompletos

    //verifica cada campo
    camposEspecificos.forEach(function(campo) {
        if (!campo) return; //si el campo no existe --> salta al siguiente

        //si el campo es de tipo archivo
        if (campo.type === "file") {
            if (!campo.files || campo.files.length === 0) {
                campo.setCustomValidity("Completa este campo"); //mensaje de error
                incompleto = true; //marca como incompleto
                // Forzar que se muestre el mensaje
                campo.reportValidity(); //muestra el mensaje de error
            }
            else {
                campo.setCustomValidity(""); //restablece el mensaje de error
            }
        }
        //si el campo es de otro tipo
        else {
            if (!campo.value.trim()) { //elimina espacios en blanco
                campo.setCustomValidity("Completa este campo"); //mensaje de error
                incompleto = true; //marca como incompleto
            }
            else {
                campo.setCustomValidity(""); //restablece el mensaje de error
            }
        }
    });

    //si hay campos incompletos --> evita el envio y muestra los mensajes de error
    if (incompleto) {
        event.preventDefault(); //evita el envio del formulario
        this.reportValidity(); //muestra los mensajes de error
    }
});