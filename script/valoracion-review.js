// Manejo de valoraciones y reviews para viajes comprados

const ValoracionConsejo = {
  // Estructura: { "consejo_0": { "usuario1": { valor: 5, texto: "..." }, "usuario2": {...} }, "consejo_1": {...} }

  obtenerValoraciones() {
    return JSON.parse(localStorage.getItem("consejoValoraciones")) || {};
  },

  guardarValoraciones(valoraciones) {
    localStorage.setItem("consejoValoraciones", JSON.stringify(valoraciones));
  },

  // función auxiliar para renderizar las estrellas
  renderEstrellasDisplay(score, maxStars = 5) {
    let html = '';
    const roundedScore = Math.round(score * 2) / 2; // Redondear al medio punto (ej: 4.5)
    
    for (let i = 1; i <= maxStars; i++) {
        let className = 'bi-star'; // Estrella vacía por defecto
        
        if (i <= roundedScore) {
            className = 'bi-star-fill'; // Estrella llena
        } else if (i - 0.5 === roundedScore) {
            className = 'bi-star-half'; // Media estrella
        }
        
        html += `<i class="bi ${className}" style="color: gold;"></i>`;
    }
    return `<span class="estrellas-display">${html}</span>`;
  },

  // función para calcular la media y el conteo de valoraciones de una review
  calcularMediaValoraciones(consejoId) {
    const valoraciones = this.obtenerValoraciones();
    // obtener las valoraciones para la review con ese ID
    const consejoValoraciones = valoraciones[consejoId];
    
    // Si no hay valoraciones, devolver media 0 y count 0
    if (!consejoValoraciones) {
        return { media: 0, count: 0 };
    }

    let suma = 0;
    let count = 0;

    // se recorre por cada usuario que ha valorado y se suma para hacer la media
    for (const usuario in consejoValoraciones) {
        const data = consejoValoraciones[usuario];
        // ASEGURA que el valor es un número
        const valorNum = parseFloat(data.valor); 
        
        if (!isNaN(valorNum) && valorNum > 0) {
            suma += valorNum;
            count++;
        }
    }

    // calcular la media
    const media = count > 0 ? (suma / count) : 0;
    
    return { media: media, count: count };
},

  // función para renderizar la valoración global de la review
  renderizarValoracionGlobal(contenedorId, consejoId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;
    
    // Obtener la media y el conteo
    const { media, count } = this.calcularMediaValoraciones(consejoId); 
    const mediaRedondeada = media.toFixed(1);

    // Renderizar las estrellas
    const estrellasMediaHtml = this.renderEstrellasDisplay(media, 5); 

    // Limpiar el contenedor antes de inyectar el nuevo contenido
    contenedor.innerHTML = ''; 
    
    // meter en el html la valoración global
    contenedor.innerHTML = `
        <div class="valoracion-global-display">
            <span class="media-score">${mediaRedondeada} / 5</span>
            ${estrellasMediaHtml}
            <span class="media-count">(${count} valoraciones)</span>
        </div>
    `;
  },

  // Obtener la valoración de un usuario específico para un consejo
  obtenerValoracionUsuario(consejoId, usuario) {
    const valoraciones = this.obtenerValoraciones();
    if (valoraciones[consejoId] && valoraciones[consejoId][usuario] !== undefined) {
        const data = valoraciones[consejoId][usuario];
        
        // Manejar datos antiguos (solo número)
        if (typeof data === 'number') {
            return { valor: data, texto: '' };
        }
        
        // Devolver el objeto, asegurando que las propiedades existen
        return {
            valor: data.valor || 0,
            texto: data.texto || ''
        };
    }
    // Devuelve un objeto predeterminado
    return { valor: 0, texto: '' };
  },

  // guardar valoración y texto de un usuario
  guardarValoracionUsuario(consejoId, usuario, nuevoValor, nuevoTexto) {
    const valoraciones = this.obtenerValoraciones();

    if (!valoraciones[consejoId]) {
      valoraciones[consejoId] = {};
    }

    // Obtener el estado de valoración existente
    const existente = this.obtenerValoracionUsuario(consejoId, usuario);

    let finalValor = existente.valor;
    let finalTexto = existente.texto;

    // si se proporciona un nuevo valor (estrellas) Y NO es 'undefined', se usa
    // Esto asegura que podemos pasar 0 si el usuario quisiera desmarcar (aunque i=1 en el listener)
    if (arguments.length > 2 && nuevoValor !== undefined) { 
        finalValor = nuevoValor;
    }
    
    // si se proporciona un nuevo texto (incluso si es '') Y NO es 'undefined', usa
    if (arguments.length > 3 && nuevoTexto !== undefined) { 
        finalTexto = nuevoTexto;
    }
    
    // Almacenar el objeto completo.
    valoraciones[consejoId][usuario] = {
      valor: finalValor,
      texto: finalTexto
    };
    
    this.guardarValoraciones(valoraciones);
  },
  
  // calcula la media de valoraciones
  calcularMedia(consejoId) {
    const valoraciones = this.obtenerValoraciones();
    
    if (!valoraciones[consejoId] || Object.keys(valoraciones[consejoId]).length === 0) {
      return 0;
    }
    
    const scores = Object.values(valoraciones[consejoId])
        .map(v => typeof v === 'object' ? v.valor : v) 
        .filter(v => typeof v === 'number' && v > 0); 

    if (scores.length === 0) return 0;
    
    const suma = scores.reduce((acc, val) => acc + val, 0);
    return (suma / scores.length).toFixed(1);
  },

  obtenerTotalValoraciones(consejoId) {
    const valoraciones = this.obtenerValoraciones();
    
    if (!valoraciones[consejoId]) {
      return 0;
    }
    
    return Object.values(valoraciones[consejoId])
        .filter(v => (typeof v === 'object' ? v.valor : v) > 0)
        .length;
  },

  // renderiza las estrellas y el texto de la review
  renderizarValoracion(contenedorId, consejoId, usuarioActual) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    // Obtener la valoración y el texto guardados
    const valoracionUsuarioObj = this.obtenerValoracionUsuario(consejoId, usuarioActual);
    const valoracionUsuarioNum = valoracionUsuarioObj.valor || 0;
    const textoReview = valoracionUsuarioObj.texto || '';
    
    // Elementos
    const seccionReview = document.querySelector('.seccion-review');
    const formReview = seccionReview ? seccionReview.querySelector('.review-form') : null;
    const reviewTextarea = document.getElementById('user-review-text');
    const reviewMessage = document.getElementById('review-message');

    // Limpiar reviews y mensajes anteriores antes de volver a renderizar
    if (seccionReview) {
        seccionReview.querySelectorAll('.review-usuario-display').forEach(el => el.remove());
    }
    if (reviewMessage) {
      reviewMessage.textContent = '';
    }
    contenedor.innerHTML = ''; // Limpiar el contenedor de estrellas/media

    //LÓGICA DE DISPLAY DE REVIEW
    if (textoReview && seccionReview) {
      // Ocultar el formulario
      if (formReview) formReview.style.display = 'none';

      // crear elemento html div que contiene la review a mostrar
      const displayReview = document.createElement("div");
      displayReview.className = "review-usuario-display";

      // crea elemento html indicando el usuario (con nombre) ha dejado una reseña
      const nombreUsuario = document.createElement("p");
      nombreUsuario.innerHTML = `<strong>${usuarioActual}</strong> ha dejado una reseña:`;

      // crea elemento html con la puntuación en estrellas
      const puntuacion = document.createElement("p");
      let estrellasHtml = '';
      for (let i = 1; i <= 5; i++) {
          estrellasHtml += `<i class="bi ${i <= valoracionUsuarioNum ? 'bi-star-fill' : 'bi-star'}" style="color: gold;"></i>`;
      }
      puntuacion.innerHTML = `Puntuación: ${estrellasHtml} (${valoracionUsuarioNum} de 5)`;

      // crea elemento html con el texto de la review
      const texto = document.createElement("p");
      texto.className = "review-texto";
      texto.textContent = `"${textoReview}"`;

      displayReview.appendChild(nombreUsuario);
      displayReview.appendChild(puntuacion);
      displayReview.appendChild(texto);
      
      // Insertar la reseña mostrada
      seccionReview.prepend(displayReview);

      // Asegurar que el textarea tiene el texto guardado
      if (reviewTextarea) reviewTextarea.value = textoReview;
      
    } else {
      // Si no hay review de texto, asegurar que el formulario esté visible y el textarea vacío
      if (formReview) formReview.style.display = 'block';
      if (reviewTextarea) reviewTextarea.value = '';
    }
    
    //LÓGICA DE VALORACIÓN (ESTRELLAS)
    // media de las valoraciones de la review
    const mediaGlobal = this.calcularMedia(consejoId);
    const totalValoraciones = this.obtenerTotalValoraciones(consejoId);

    // crear el contenedor html de la info de valoración
    const div = document.createElement("div");
    div.className = "info-valoracion";
    // media global de valoraciones del pack
    const mediaLabel = document.createElement("p");
    mediaLabel.className = "media-global-label";
    mediaLabel.textContent = `Media global: ${mediaGlobal} (${totalValoraciones} valoraciones)`;
    div.appendChild(mediaLabel);
    // valoración del usuario actual
    const tuValoracionDiv = document.createElement("div");
    tuValoracionDiv.className = "tu-valoracion";

    const miValoracionLabel = document.createElement("span");
    miValoracionLabel.className = "mi-valoracion-label";
    miValoracionLabel.textContent = `Tu valoración: ${valoracionUsuarioNum > 0 ? valoracionUsuarioNum : 'Sin valorar'}`;

    tuValoracionDiv.appendChild(miValoracionLabel);

    // elemento html para las estrellas interactivas
    const estrellasDiv = document.createElement("div");
    estrellasDiv.className = "estrellas-container";

    // Crear 5 estrellas
    for (let i = 1; i <= 5; i++) {
      const estrella = document.createElement("button");
      estrella.type = "button";
      estrella.className = "estrella-btn";
      estrella.dataset.valor = i;
      estrella.dataset.consejoId = consejoId;

      const iconoEstrella = document.createElement("i");
      // valoracionUsuarioNum para determinar si la estrella está rellena.
      iconoEstrella.className = i <= valoracionUsuarioNum ? "bi bi-star-fill" : "bi bi-star"; 

      estrella.appendChild(iconoEstrella);
      estrella.addEventListener("click", (e) => {
        e.preventDefault();
        // si está la sesión iniciada
        if (usuarioActual) {
          // Obtener el texto de la review 
          const textoActual = this.obtenerValoracionUsuario(consejoId, usuarioActual).texto || '';
          
          // Guardar el nuevo valor de estrella (i)
          // 4 argumentos: i (nuevo valor) y textoActual (texto existente)
          this.guardarValoracionUsuario(consejoId, usuarioActual, i, textoActual); 
          this.renderizarValoracion(contenedorId, consejoId, usuarioActual);
        } else {
          alert("Debes iniciar sesión para valorar consejos");
        }
      });

      estrellasDiv.appendChild(estrella);
    }
    // se mete la valoración en el contenedor html
    tuValoracionDiv.appendChild(estrellasDiv);
    div.appendChild(tuValoracionDiv);
    contenedor.appendChild(div);
  }
};