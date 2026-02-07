// ir a la página de registro (version-a)
document.getElementById('btn-registrarse').addEventListener('click', function () {
  window.location.href = 'version-a.html';
});

// Después de un login exitoso y validación de correo
function handleSuccessfulLogin(usuario) {
    localStorage.setItem('usuarioActual', usuario);
    
    // Verificar si hay datos de compra pendientes
    const compraRaw = sessionStorage.getItem('compraPasoFinal') || sessionStorage.getItem('compraPaso1');
    
    if (compraRaw) {
        try {
            const compra = JSON.parse(compraRaw);
            
            // Guardar la compra en el perfil del usuario
            sessionStorage.setItem('reservation', compraRaw);
            const purchasesKey = 'purchases_' + usuario;
            const existing = localStorage.getItem(purchasesKey);
            const arr = existing ? JSON.parse(existing) : [];
            arr.push(Object.assign({fecha: new Date().toISOString()}, compra));
            localStorage.setItem(purchasesKey, JSON.stringify(arr));
            
            // Limpiar sessionStorage después de mover los datos
            sessionStorage.removeItem('compraPasoFinal');
            sessionStorage.removeItem('compraPaso1');
            
            // Redirigir a info-compra.html para mostrar la confirmación
            window.location.href = 'info-compra.html';
            return;
        } catch (err) {
            console.warn('Error procesando compra pendiente:', err);
        }
    }
    
    // Si no hay compra pendiente, redirigir a perfil
    window.location.href = 'perfil.html';
}

// Guardar usuario en localStorage al enviar el formulario
document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const usuario = document.getElementById('usuario').value.trim();
  const contrasena = document.getElementById('contrasena').value;

  if (!usuario) {
    return;
  }

  try {
    const existing = localStorage.getItem(usuario);
    if (existing) {
      // Usuario registrado previamente
      localStorage.setItem('usuarioActual', usuario);
    } else {
      // Usuario no registrado: crear un registro mínimo
      const userData = {
        usuario: usuario,
        email: usuario + '@ejemplo.com',
        imagen: 'imagenes/usuario.png',
        favoritos: 0
      };
      localStorage.setItem(usuario, JSON.stringify(userData));
      localStorage.setItem('usuarioActual', usuario);
    }
  } catch (err) {
    console.error('Error accediendo a localStorage', err);
  }

  // Comprobar si hay una compra pendiente y validar email
  try {
    const compraRaw = sessionStorage.getItem('compraPasoFinal') || sessionStorage.getItem('compraPaso1');
    if (compraRaw) {
      const compra = JSON.parse(compraRaw);
      
      // obtener email del usuario logueado
      let userEmail = null;
      try {
        const rawUser = localStorage.getItem(usuario);
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          userEmail = parsed.email || null;
        }
      } catch (e) {}

      // si hay email en compra y email de usuario y no coinciden
      if (compra && compra.correo && userEmail && compra.correo.toLowerCase() !== userEmail.toLowerCase()) {
        try {
          sessionStorage.setItem('compraEmailMismatch', '1');
        } catch (e) {
          console.warn('No se pudo marcar mismatch en sessionStorage', e);
        }
        // redirigir a confirmación para que el usuario revise
        //window.location.href = 'confirmacion-c.html';
        window.location.href = 'seguros.html';
        return;
      }
    }
  } catch (err) {
    console.warn('Error validando compra pendiente', err);
  }

  // Si llegamos aquí, procesar el login exitoso
  handleSuccessfulLogin(usuario);
});
