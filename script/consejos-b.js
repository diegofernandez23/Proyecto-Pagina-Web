document.addEventListener("DOMContentLoaded", function () {

  //busca la query
  const listaConsejos = document.querySelector(".lista-consejos");
  
  //recuperar el array de consejos desde localStorage, si no lista vacia
  let consejos = JSON.parse(localStorage.getItem("consejos")) || [];
  
  // recuperar valoraciones desde localStorage
  // estructura: { "consejo_0": { "usuario1": 5, "usuario2": 4 }, "consejo_1": {...} }
  let valoraciones = JSON.parse(localStorage.getItem("consejoValoraciones")) || {};
  
  // control de paginación
  let consejosVisibles = 15;

  //funcion para mostrar los consejos
  // acepta un array filtrado opcional (filtroArray). Si se pasa, se muestran TODOS los elementos del filtro (sin paginación)
  function mostrarConsejos(mostrarTodos = false, filtroArray = null) {
    if(!listaConsejos) return;
    listaConsejos.innerHTML = ""; //limpiar los <li> de ejemplo

    const sourceArray = Array.isArray(filtroArray) ? filtroArray : consejos;

    const limite = Array.isArray(filtroArray) ? sourceArray.length : (mostrarTodos ? consejos.length : consejosVisibles);
    const ultimos = sourceArray.slice(0, limite); //mostrar según el límite

    //si no hay ninguno pone que no hay consejos
    if (ultimos.length === 0) {
      const li = document.createElement("li");
      li.className = 'no-consejos';
      li.textContent = "No hay consejos todavía";
      listaConsejos.appendChild(li);

      // Asegurar que no quede el botón "Cargar más" cuando no hay consejos
      const botonExistente = document.querySelector('.btn-cargar-mas');
      if (botonExistente) botonExistente.remove();

      return;
    }

    const usuarioActual = localStorage.getItem('usuarioActual') || '';

    //para cada consejo crear un item de lista mostrando toda la información
    ultimos.forEach((c, indice) => {
      const consejoIndex = consejos.indexOf(c);
      const consejoId = `consejo_${consejoIndex}`;
      
      // crear contenedor general para el consejo completo
      const contenedorConsejo = document.createElement("li");
      contenedorConsejo.className = "consejo-wrapper";
      
      // crear contenedor para autor con foto de perfil (fuera del recuadro)
      const autorDiv = document.createElement("div");
      autorDiv.className = "consejo-autor";
      
      // crear imagen de perfil
      const autorImg = document.createElement("img");
      autorImg.alt = "Perfil";
      autorImg.className = "consejo-autor-img";
      
      // Obtener la foto de perfil del usuario desde localStorage
      try {
        const userData = JSON.parse(localStorage.getItem(c.autor) || '{}');
        autorImg.src = userData.imagen || "imagenes/icono-cab.png";
      } catch (err) {
        autorImg.src = "imagenes/icono-cab.png";
      }
      
      // crear span para el nombre
      const autorNombre = document.createElement("span");
      autorNombre.textContent = c.autor || 'Usuario';
      
      autorDiv.appendChild(autorImg);
      autorDiv.appendChild(autorNombre);
      
      // crear recuadro del consejo
      const consejoBox = document.createElement("div");
      consejoBox.className = "consejo-box";
      
      // crear elemento para el título
      const tituloH3 = document.createElement("h3");
      tituloH3.className = "consejo-titulo";
      tituloH3.textContent = c.titulo;
      
      // crear elemento para la descripción
      const descripcionP = document.createElement("p");
      descripcionP.className = "consejo-descripcion";
      descripcionP.textContent = c.descripcion;
      
      // crear contenedor de valoración
      const valoracionDiv = document.createElement("div");
      valoracionDiv.className = "consejo-valoracion";
      valoracionDiv.id = `valoracion-${consejoId}`;

      consejoBox.appendChild(tituloH3);
      consejoBox.appendChild(descripcionP);
      consejoBox.appendChild(valoracionDiv);
      // Mostrar tags si existen
      if (c.tags && Array.isArray(c.tags) && c.tags.length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'tags-container';
        c.tags.forEach(t => {
          const span = document.createElement('span');
          span.className = 'tag-chip';
          span.textContent = t;
          tagsContainer.appendChild(span);
        });
        consejoBox.appendChild(tagsContainer);
      }
      
      contenedorConsejo.appendChild(autorDiv);
      contenedorConsejo.appendChild(consejoBox);

      listaConsejos.appendChild(contenedorConsejo);
      
      // Renderizar valoración inmediatamente después de crear el elemento
      if (typeof ValoracionConsejo !== 'undefined') {
        ValoracionConsejo.renderizarValoracion(`valoracion-${consejoId}`, consejoId, usuarioActual);
      }
    });
    
    // Gestión del botón "Cargar más"
    let botonCargarMas = document.querySelector(".btn-cargar-mas");

    // Sólo mostrar botón "Cargar más" cuando no hay filtro (paginación sólo para la vista completa)
    if (!Array.isArray(filtroArray) && consejos.length > limite) {
      // Hay más consejos por mostrar
      if (!botonCargarMas) {
        // Crear el botón si no existe
        botonCargarMas = document.createElement("button");
        botonCargarMas.className = "btn-cargar-mas";
        botonCargarMas.textContent = "Cargar más";
        listaConsejos.parentElement.appendChild(botonCargarMas);
        
        // Añadir evento al botón
        botonCargarMas.addEventListener("click", function() {
          consejosVisibles += 15;
          mostrarConsejos();
        });
      }
    } else {
      // No hay más consejos, eliminar el botón si existe
      if (botonCargarMas) {
        botonCargarMas.remove();
      }
    }
  }

  //mostrar los consejos (inicio sin filtro)
  if (listaConsejos) {
    mostrarConsejos();
}

  // --- lógica del buscador por tags ---
  const btnBuscarTags = document.getElementById('btn-buscar-tags');
  const btnLimpiarTags = document.getElementById('btn-limpiar-tags');

  if (btnBuscarTags) {
    btnBuscarTags.addEventListener('click', function () {
      const seleccionadas = Array.from(document.querySelectorAll('.buscador-tag-checkbox:checked')).map(cb => cb.value);
      if (!seleccionadas.length) {
        // si no hay tags seleccionados, mostramos todo
        mostrarConsejos();
        return;
      }

      // Filtrar: consejo que tenga al menos uno de los tags seleccionados
      const filtrado = consejos.filter(c => {
        if (!c.tags || !Array.isArray(c.tags) || c.tags.length === 0) return false;
        return seleccionadas.some(t => c.tags.includes(t));
      });

      mostrarConsejos(true, filtrado);
    });
  }

  if (btnLimpiarTags) {
    btnLimpiarTags.addEventListener('click', function () {
      // desmarcar checkboxes
      Array.from(document.querySelectorAll('.buscador-tag-checkbox')).forEach(cb => cb.checked = false);
      // volver a la vista normal
      mostrarConsejos();
    });
  }

  // Obtener elementos del formulario por id
  const tituloInput = document.getElementById('titulo-consejo');
  const textoInput = document.getElementById('descripcion-consejo');
  const botonEnviar = document.getElementById('btn-enviar-consejo');

  if (tituloInput && textoInput && botonEnviar) {

    //al pulsar el boton de enviar
    botonEnviar.addEventListener("click", function () {
      const titulo = (tituloInput.value || '').trim();
      const descripcion = (textoInput.value || '').trim();

      //titulo no puede tener menos de 15 caracteres
      if (titulo.length < 15) {
        alert("El título debe tener al menos 15 caracteres.");
        return;
      }

      //descripcion no puede tener menos de 30 caracteres 
      if (descripcion.length < 30) {
        alert("La descripción debe tener al menos 30 caracteres.");
        return;
      }

      //creacion de un nuevo consejo
      // exigir sesión: no permitir consejos anónimos
      const usuarioActual = localStorage.getItem('usuarioActual');
      if (!usuarioActual) {
        alert('Debes iniciar sesión para publicar un consejo.');
        return;
      }
      let autorName = usuarioActual;
      try {
        const u = JSON.parse(localStorage.getItem(usuarioActual) || '{}');
        autorName = u.usuario || usuarioActual;
      } catch (err) {
        autorName = usuarioActual;
      }

      const nuevo = {
        titulo,
        descripcion,
        autor: autorName,
        tags: []
      };

      // leer tags seleccionados (solo checkboxes predefinidos)
      try {
        const checked = Array.from(document.querySelectorAll('.tag-checkbox:checked')).map(cb => cb.value);
        nuevo.tags = checked;
      } catch (e) {
        // ignore
      }

      // Validar que al menos un tag esté seleccionado
      if (!nuevo.tags || nuevo.tags.length === 0) {
        alert('Debes seleccionar al menos un tag antes de enviar el consejo.');
        return;
      }

      //inserta al principio y guarda
      consejos.unshift(nuevo);
      localStorage.setItem("consejos", JSON.stringify(consejos));

      //actualizar consejos
      mostrarConsejos();

      // (no se usan tags personalizados)

      //limpia campos
      tituloInput.value = "";
      textoInput.value = "";

      // desmarcar checkboxes de tags del formulario
      Array.from(document.querySelectorAll('.tag-checkbox')).forEach(cb => cb.checked = false);

      alert("Consejo añadido correctamente");
    });
  }
});
