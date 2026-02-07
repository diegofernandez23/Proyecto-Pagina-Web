// Funcionalidad de valoración de consejos con almacenamiento de todas las valoraciones

const ValoracionConsejo = {
  // Estructura en localStorage: { "consejo_0": { "usuario1": 5, "usuario2": 4 }, "consejo_1": {...} }
  
  obtenerValoraciones() {
    return JSON.parse(localStorage.getItem("consejoValoraciones")) || {};
  },

  guardarValoraciones(valoraciones) {
    localStorage.setItem("consejoValoraciones", JSON.stringify(valoraciones));
  },

  // Añadir o actualizar una valoración de un usuario para un consejo
  guardarValoracionUsuario(consejoId, usuario, valor) {
    const valoraciones = this.obtenerValoraciones();
    
    if (!valoraciones[consejoId]) {
      valoraciones[consejoId] = {};
    }
    
    valoraciones[consejoId][usuario] = valor;
    this.guardarValoraciones(valoraciones);
  },

  // Obtener la valoración de un usuario específico para un consejo
  obtenerValoracionUsuario(consejoId, usuario) {
    const valoraciones = this.obtenerValoraciones();
    if (valoraciones[consejoId] && valoraciones[consejoId][usuario] !== undefined) {
      return valoraciones[consejoId][usuario];
    }
    return 0;
  },

  // Calcular la media de valoraciones de un consejo
  calcularMedia(consejoId) {
    const valoraciones = this.obtenerValoraciones();
    
    if (!valoraciones[consejoId] || Object.keys(valoraciones[consejoId]).length === 0) {
      return 0;
    }
    
    const valores = Object.values(valoraciones[consejoId]);
    const suma = valores.reduce((acc, val) => acc + val, 0);
    return (suma / valores.length).toFixed(1);
  },

  // Obtener el número total de valoraciones de un consejo
  obtenerTotalValoraciones(consejoId) {
    const valoraciones = this.obtenerValoraciones();
    
    if (!valoraciones[consejoId]) {
      return 0;
    }
    
    return Object.keys(valoraciones[consejoId]).length;
  },

  // Renderizar las estrellas y la información de valoración
  renderizarValoracion(contenedorId, consejoId, usuarioActual) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    contenedor.innerHTML = '';

    // Obtener datos
    const valoracionUsuario = this.obtenerValoracionUsuario(consejoId, usuarioActual);
    const media = this.calcularMedia(consejoId);
    const totalValoraciones = this.obtenerTotalValoraciones(consejoId);

    // Crear label con media y total
    const labelDiv = document.createElement("div");
    labelDiv.className = "valoracion-info";

    const labelValoracion = document.createElement("span");
    labelValoracion.className = "valoracion-label";

    if (totalValoraciones > 0) {
      // Texto "Media: X "
      const texto = document.createElement('span');
      texto.textContent = `Media: ${media} `;
      labelValoracion.appendChild(texto);

      // SVG estrella con relleno amarillo y borde negro
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      svg.classList.add('media-star');

      const path = document.createElementNS(svgNS, 'path');
      // path de estrella sencilla
      path.setAttribute('d', 'M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L19.335 24 12 19.897 4.665 24l1.635-8.69L.6 9.75l7.732-1.732z');
      path.setAttribute('fill', '#ffc107');
      path.setAttribute('stroke', '#000');
      path.setAttribute('stroke-width', '0.8');

      svg.appendChild(path);
      labelValoracion.appendChild(svg);

      const cuenta = document.createElement('span');
      cuenta.textContent = ` (${totalValoraciones} valoraciones)`;
      labelValoracion.appendChild(cuenta);
    } else {
      labelValoracion.textContent = 'Sin valoraciones';
    }

    labelDiv.appendChild(labelValoracion);

    // Tu valoración
    const tuValoracionDiv = document.createElement("div");
    tuValoracionDiv.className = "mi-valoracion";
    
    const miValoracionLabel = document.createElement("span");
    miValoracionLabel.className = "mi-valoracion-label";
    miValoracionLabel.textContent = `Tu valoración: ${valoracionUsuario > 0 ? valoracionUsuario : 'Sin valorar'}`;
    
    tuValoracionDiv.appendChild(miValoracionLabel);

    // Crear contenedor de estrellas
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
      iconoEstrella.className = i <= valoracionUsuario ? "bi bi-star-fill" : "bi bi-star";

      estrella.appendChild(iconoEstrella);
      estrella.addEventListener("click", (e) => {
        e.preventDefault();
        if (usuarioActual) {
          this.guardarValoracionUsuario(consejoId, usuarioActual, i);
          this.renderizarValoracion(contenedorId, consejoId, usuarioActual);
        } else {
          alert("Debes iniciar sesión para valorar consejos");
        }
      });

      estrellasDiv.appendChild(estrella);
    }

    tuValoracionDiv.appendChild(estrellasDiv);

    contenedor.appendChild(labelDiv);
    contenedor.appendChild(tuValoracionDiv);
  }
};
