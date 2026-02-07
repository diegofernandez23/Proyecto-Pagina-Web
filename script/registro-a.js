//script para el registro de usuario
document.addEventListener("DOMContentLoaded", function() {
    const formRegistro = document.querySelector(".forms-registro"); //selecciona el formulario por su clase

    // Prellenar el email si viene de una compra
    try {
        const compraRaw = sessionStorage.getItem('compraPasoFinal') || sessionStorage.getItem('compraPaso1');
        if (compraRaw) {
            const compra = JSON.parse(compraRaw);
            if (compra.correo) {
                const emailInput = document.getElementById("email");
                if (emailInput) {
                    emailInput.value = compra.correo;
                    // Hacer el campo readonly para evitar que el usuario lo cambie
                    emailInput.readOnly = true;
                    emailInput.style.backgroundColor = '#f5f5f5';
                    emailInput.style.color = '#000000';
                }
            }
        }
    } catch (err) {
        console.warn('Error prellenando email desde compra:', err);
    }

    //mostrar nombre del archivo seleccionado
    const inputImagen = document.getElementById("imagen"); //obtiene el input de tipo file
    const contenedorImagen = document.querySelector(".imagen-forms"); //contenedor del label e input

    inputImagen.addEventListener("change", function() {
        const nombreArchivo = this.files[0].name; //obtiene el nombre del archivo seleccionado

        let infoArchivo = document.querySelector(".info-archivo"); //div para mostrar el nombre del archivo

        if (!infoArchivo) {
            infoArchivo = document.createElement("div");
            infoArchivo.className = "info-archivo"; //asigna una clase al div

            contenedorImagen.style.flexDirection = "column"; //ajusta el contenedor para que el label y el div estén en columna

            contenedorImagen.appendChild(infoArchivo); //inserta el div en el contenedor
        }
        infoArchivo.textContent = `Archivo seleccionado: ${nombreArchivo}`; //muestra el nombre del archivo en el div
    });

    //evento de envio del formulario
    formRegistro.addEventListener("submit", function (event) {

    event.preventDefault(); //evita que recargue la pagina

    //se obtienen los valores del formulario (usuario, contrasena, email e imagen)
    const usuario = document.getElementById("usuario").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();
    const email = document.getElementById("email").value.trim();
    const imagenArchivo = inputImagen.files[0];

    //verifica si ya existe un usuario con ese nombre
    if (localStorage.getItem(usuario)) {
      alert("Ese nombre de usuario ya existe. Elige otro.");
      return;
    }

    //lee la imagen como base64 y guarda usuario
    const reader = new FileReader();
    reader.onload = e => {
      //valor en localStorage
      const nuevoUsuario = {
        usuario,
        contrasena,
        email: email || (usuario + '@ejemplo.com'),
        imagen: e.target.result 
      };

      localStorage.setItem(usuario, JSON.stringify(nuevoUsuario)); //clave = nombre de usuario
      localStorage.setItem("usuarioActual", usuario); //quien esta conectado

      // Variable para determinar destino
      let destinoFinal = "perfil.html";

      // mover compra pendiente (si existe) al usuario
      try {
        const compraRaw = sessionStorage.getItem('compraPasoFinal') || sessionStorage.getItem('compraPaso1');
        if (compraRaw) {
          const compra = JSON.parse(compraRaw);
          
          // Ya no necesitamos validar email porque viene prellenado y es readonly
          // Si los emails coinciden (que deberían), procesar la compra
          sessionStorage.setItem('reservation', compraRaw);
          const purchasesKey = 'purchases_' + usuario;
          const existing = localStorage.getItem(purchasesKey);
          const arr = existing ? JSON.parse(existing) : [];
          arr.push(Object.assign({fecha: new Date().toISOString()}, compra));
          localStorage.setItem(purchasesKey, JSON.stringify(arr));
          
          // Cambiar destino a info-compra si hay compra procesada
          destinoFinal = "info-compra.html";
          
          // Limpiar sessionStorage después de mover los datos
          sessionStorage.removeItem('compraPasoFinal');
          sessionStorage.removeItem('compraPaso1');
        }
      } catch (err) {
        console.warn('No se pudo mover la compra pendiente al perfil del usuario', err);
      }

      alert("Registro exitoso");
      //redirigir según si hay compra o no
      window.location.href = destinoFinal;
    };

    //inicia la lectura del archivo de imagen y cuando termine se ejecutara reader.onload
    reader.readAsDataURL(imagenArchivo);
  });

});