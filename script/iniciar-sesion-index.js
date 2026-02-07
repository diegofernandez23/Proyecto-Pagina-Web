//cuando el documento este cargado
document.addEventListener("DOMContentLoaded", function () {

  //si habia un usuario anterior, al volver al index se borra
  localStorage.removeItem("usuarioActual");

  //seleccion del formulario de inicio de sesion
  const form = document.querySelector(".formulario-acceso");

 
  form.addEventListener("submit", function (event) {
    event.preventDefault(); //evita que se recargue la pagina

    //obtener los valores de los campos
    const usuario = document.getElementById("usuario").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();

    //se recupera el usuario guardado en localStorage (clave= nombre)
    const data = JSON.parse(localStorage.getItem(usuario));

    //se comprueba que existe y que la contraseña coincide
    if (data && data.contrasena === contrasena) {

      //se guarda que es el usuario actual
      localStorage.setItem("usuarioActual", usuario);

      //se redirige a la la version b
      window.location.href = "index.html";
    } else {

      //si no coincide se lanza un alert
      alert("Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.");
    }
  });
});
