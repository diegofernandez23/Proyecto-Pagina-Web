// logica del buscador de destinos: filtros, renderizado y almacenamiento en localStorage
(function () {
  const STORAGE_FILTERS = 'buscador_lastFilters';
  const STORAGE_FAVS = 'buscador_favorites';
  const STORAGE_RATINGS = 'buscador_ratings';
  const $ = id => document.getElementById(id);

  // --- 1. NUEVA FUNCIÓN: Obtener idioma sincronizado con traductor.js ---
  function getCurrentLang() {
    // Intentamos leer lo que guardó traductor.js
    const guardado = localStorage.getItem('idioma_seleccionado');
    if (guardado) return guardado;

    // Si no hay nada guardado, miramos el selector
    const selector = document.querySelector('.selector-idioma');
    if (selector) return selector.value;
    
    return 'ES'; // Por defecto
  }

  // Diccionario interno para palabras propias del buscador (botones, etiquetas...)
  const traduccionesBuscador = {
    'ES': {
      'por_persona': 'por persona',
      'dias': 'días',
      'ver_detalles': 'Ver detalles',
      'favorito': 'Favorito ★',
      'guardar': 'Guardar',
      'sin_valorar': 'Sin valorar',
      'no_resultados': 'No hay resultados que coincidan.',
      'hasta': 'Hasta'
    },
    'EN': {
      'por_persona': 'per person',
      'dias': 'days',
      'ver_detalles': 'View details',
      'favorito': 'Favorite ★',
      'guardar': 'Save',
      'sin_valorar': 'Not rated',
      'no_resultados': 'No matching results found.',
      'hasta': 'Up to'
    },
    'FR': {
      'por_persona': 'par personne',
      'dias': 'jours',
      'ver_detalles': 'Voir détails',
      'favorito': 'Favori ★',
      'guardar': 'Enregistrer',
      'sin_valorar': 'Non évalué',
      'no_resultados': 'Aucun résultat correspondant.',
      'hasta': 'Jusqu\'à'
    }
  };

  const destinos = [
    // Nota: tituloKey debe coincidir con las claves en tu traductor.js
    { id: 1, pais: 'Italia', tipo: 'Cultural', precio: 987, duracion: 6, img: 'imagenes/italia.jpg', tituloKey: 'titulo_italia', tituloDefault: 'Descubre la Belleza de Italia' },
    { id: 2, pais: 'Japón', tipo: 'Cultural', precio: 850, duracion: 11, img: 'imagenes/japon.jpg', tituloKey: 'titulo_japon', tituloDefault: 'Japón, Tradición y Modernidad' },
    { id: 3, pais: 'Marruecos', tipo: 'Aventura', precio: 799, duracion: 8, img: 'imagenes/marruecos.jpg', tituloKey: 'titulo_marruecos', tituloDefault: 'Colores y Aromas de Marruecos' },
    { id: 4, pais: 'Noruega', tipo: 'Naturaleza', precio: 1495, duracion: 11, img: 'imagenes/noruega.jpg', tituloKey: 'titulo_noruega', tituloDefault: 'Paisajes de Ensueño en Noruega' },
    { id: 5, pais: 'Francia', tipo: 'Cultural', precio: 1099, duracion: 8, img: 'imagenes/francia.jpg', tituloKey: 'titulo_francia', tituloDefault: 'Arte por las Calles Francesas' },
    { id: 6, pais: 'Brasil', tipo: 'Aventura', precio: 899, duracion: 9, img: 'imagenes/brasil.jpg', tituloKey: 'titulo_brasil', tituloDefault: 'Ritmo y Naturaleza por Brasil' },
  ];
  
  const paginaPorPais = {
    'Italia': 'NUEVO-version-c-italia.html',
    'Japón': 'NUEVO-version-c-japon.html',
    'Marruecos': 'NUEVO-version-c-marruecos.html',
    'Noruega': 'NUEVO-version-c-noruega.html',
    'Francia': 'NUEVO-version-c-francia.html',
    'Brasil': 'NUEVO-version-c-brasil.html',
  };

  const packSlugPorPais = {
    'Italia': 'italia',
    'Japón': 'japon',
    'Marruecos': 'marruecos',
    'Noruega': 'noruega',
    'Francia': 'francia',
    'Brasil': 'brasil'
  };

  const duracionRangos = [
      { label: '1-7', min: 1, max: 7, value: '1-7' },
      { label: '8-14', min: 8, max: 14, value: '8-14' },
      { label: '15+', min: 15, max: Infinity, value: '15+' }
  ];

  function init() {
    // Es importante renderizar primero para que se vea algo
    loadSavedFiltersAndSearch();
    // Luego pintamos las opciones de filtros (checkboxes)
    populateFilterOptions(); 
    bindEvents();
    
    // --- 2. ESCUCHAR EL CAMBIO DE IDIOMA ---
    // Esto es lo que faltaba: cuando cambias el select, el buscador se repinta
    const selector = document.querySelector('.selector-idioma');
    if (selector) {
        selector.addEventListener('change', () => {
            // Pequeño timeout para asegurar que traductor.js haya actualizado el localStorage
            setTimeout(() => {
                // Actualizar opciones de filtros (para traducir "días")
                populateFilterOptions();
                
                // Actualizar texto del slider
                const lang = getCurrentLang();
                const t = traduccionesBuscador[lang] || traduccionesBuscador['ES'];
                $('precio-max-val').textContent = `${t.hasta} $${$('f-precio-slider').value}`;

                // Volver a filtrar y pintar resultados en el nuevo idioma
                performFilterAndSave();
            }, 50);
        });
    }
  }
  
  function loadSavedFiltersAndSearch(){
    const saved = localStorage.getItem(STORAGE_FILTERS);
    if (saved) {
      try{
        const filters = JSON.parse(saved);
        
        // Restaurar checkboxes
        if (filters.selectedTipos) {
          filters.selectedTipos.forEach(t => {
            const cb = document.querySelector(`input[name="tipo"][value="${t}"]`);
            if (cb) cb.checked = true;
          });
        }
        if (filters.selectedDuraciones) {
          filters.selectedDuraciones.forEach(d => {
            const cb = document.querySelector(`input[name="duracion"][value="${d}"]`);
            if (cb) cb.checked = true;
          });
        }
        if (filters.maxPrecio) {
            $('f-precio-slider').value = filters.maxPrecio;
            const lang = getCurrentLang();
            const t = traduccionesBuscador[lang] || traduccionesBuscador['ES'];
            $('precio-max-val').textContent = `${t.hasta} $${filters.maxPrecio}`;
        }
        if (filters.selectedValoraciones) {
          filters.selectedValoraciones.forEach(v => {
            const cb = document.querySelector(`input[name="valoracion"][value="${v}"]`);
            if (cb) cb.checked = true;
          });
        }
        performFilter(filters);
      } catch(err){ performFilter(); }
    } else {
      performFilter();
    }
  }

  function bindEvents() {
    $('btn-reset').addEventListener('click', onReset);

    $('f-precio-slider').addEventListener('input', (e) => {
        const lang = getCurrentLang();
        const t = traduccionesBuscador[lang] || traduccionesBuscador['ES'];
        $('precio-max-val').textContent = `${t.hasta} $${e.target.value}`;
        performFilterAndSave(); 
    });

    $('form-buscador').addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            performFilterAndSave();
        }
    });
  }

  function calculateCounts() {
    const counts = { tipo: {}, duracion: {}, valoracion: {} };
    destinos.forEach(d => {
      counts.tipo[d.tipo] = (counts.tipo[d.tipo] || 0) + 1;
      duracionRangos.forEach(r => {
        if (d.duracion >= r.min && d.duracion <= r.max) {
          counts.duracion[r.value] = (counts.duracion[r.value] || 0) + 1;
        }
      });
      const rating = getAverageRating(d.id); 
      if (rating !== null && rating !== undefined) {
          const roundedRating = Math.round(rating); 
          if (roundedRating >= 1) counts.valoracion[1] = (counts.valoracion[1] || 0) + 1;
          if (roundedRating >= 2) counts.valoracion[2] = (counts.valoracion[2] || 0) + 1;
          if (roundedRating >= 3) counts.valoracion[3] = (counts.valoracion[3] || 0) + 1;
          if (roundedRating >= 4) counts.valoracion[4] = (counts.valoracion[4] || 0) + 1;
          if (roundedRating == 5) counts.valoracion[5] = (counts.valoracion[5] || 0) + 1;
      }
    });
    return counts;
  }

  function populateFilterOptions() {
    const counts = calculateCounts();
    const lang = getCurrentLang();
    const t = traduccionesBuscador[lang] || traduccionesBuscador['ES'];
    
    // --- IMPORTANTE: Traducir los tipos si están en el diccionario global ---
    // Si no, usaremos el valor crudo del array
    let textosGlobales = (typeof textos !== 'undefined') ? textos[lang] : null;

    const tipos = [...new Set(destinos.map(d => d.tipo))];
    $('tipo-checkboxes').innerHTML = tipos.map(tipoRaw => {
        // Intentar traducir "Cultural", "Aventura", etc si existen en traductor.js
        // Truco: convertir a minúsculas para buscar clave (ej: 'aventura')
        let label = tipoRaw;
        /* Si quisieras traducir los tipos en filtros, descomenta esto y añade 'aventura', 'cultural' a traductor.js
        const clave = tipoRaw.toLowerCase(); 
        if (textosGlobales && textosGlobales[clave]) label = textosGlobales[clave];
        */
        return `
        <div class="checkbox-item">
            <label><input type="checkbox" name="tipo" value="${tipoRaw}"> ${label}</label>
            <span class="count">(${counts.tipo[tipoRaw] || 0})</span>
        </div>`;
    }).join('');

    // Duración
    $('duracion-checkboxes').innerHTML = duracionRangos.map(r => `
        <div class="checkbox-item">
            <label><input type="checkbox" name="duracion" value="${r.value}"> ${r.label} ${t.dias}</label>
            <span class="count">(${counts.duracion[r.value] || 0})</span>
        </div>
    `).join('');

    // Valoración (Mantenemos iconos universales)
    $('valoracion-checkboxes').innerHTML = `
        <div class="checkbox-item"><label><input type="checkbox" name="valoracion" value="5"> ★★★★★ +</label><span class="count">(${counts.valoracion[5] || 0})</span></div>
        <div class="checkbox-item"><label><input type="checkbox" name="valoracion" value="4"> ★★★★ +</label><span class="count">(${counts.valoracion[4] || 0})</span></div>
        <div class="checkbox-item"><label><input type="checkbox" name="valoracion" value="3"> ★★★ +</label><span class="count">(${counts.valoracion[3] || 0})</span></div>
        <div class="checkbox-item"><label><input type="checkbox" name="valoracion" value="2"> ★★ +</label><span class="count">(${counts.valoracion[2] || 0})</span></div>
        <div class="checkbox-item"><label><input type="checkbox" name="valoracion" value="1"> ★ +</label><span class="count">(${counts.valoracion[1] || 0})</span></div>
    `;
    
    // Restaurar los checks que estaban marcados
    const saved = localStorage.getItem(STORAGE_FILTERS);
    if(saved) {
        const f = JSON.parse(saved);
        if(f.selectedTipos) f.selectedTipos.forEach(v => { const el = document.querySelector(`input[name="tipo"][value="${v}"]`); if(el) el.checked=true; });
        if(f.selectedDuraciones) f.selectedDuraciones.forEach(v => { const el = document.querySelector(`input[name="duracion"][value="${v}"]`); if(el) el.checked=true; });
        if(f.selectedValoraciones) f.selectedValoraciones.forEach(v => { const el = document.querySelector(`input[name="valoracion"][value="${v}"]`); if(el) el.checked=true; });
    }
  }
  
  function performFilterAndSave() {
    const filters = {
        selectedTipos: Array.from(document.querySelectorAll('input[name="tipo"]:checked')).map(el => el.value),
        selectedDuraciones: Array.from(document.querySelectorAll('input[name="duracion"]:checked')).map(el => el.value),
        maxPrecio: parseInt($('f-precio-slider').value),
        selectedValoraciones: Array.from(document.querySelectorAll('input[name="valoracion"]:checked')).map(el => el.value)
    };
    localStorage.setItem(STORAGE_FILTERS, JSON.stringify(filters));
    performFilter(filters);
  }

  function performFilter(filtersFromSave) {
    const filters = filtersFromSave || {
        selectedTipos: Array.from(document.querySelectorAll('input[name="tipo"]:checked')).map(el => el.value),
        selectedDuraciones: Array.from(document.querySelectorAll('input[name="duracion"]:checked')).map(el => el.value),
        maxPrecio: parseInt($('f-precio-slider').value),
        selectedValoraciones: Array.from(document.querySelectorAll('input[name="valoracion"]:checked')).map(el => el.value)
    };
    
    let filtered = destinos.filter(d => {
        if (d.precio > filters.maxPrecio) return false;
        if (filters.selectedTipos.length > 0 && !filters.selectedTipos.includes(d.tipo)) return false;
        if (filters.selectedDuraciones.length > 0) {
            const matchesDuracion = filters.selectedDuraciones.some(val => {
                const r = duracionRangos.find(range => range.value === val);
                return d.duracion >= r.min && d.duracion <= r.max;
            });
            if (!matchesDuracion) return false;
        }
        if (filters.selectedValoraciones.length > 0) {
            const rating = getAverageRating(d.id);
            if (rating === null) return false;
            const matchesValoracion = filters.selectedValoraciones.some(val => {
                const minRating = parseInt(val);
                return Math.round(rating) >= minRating;
            });
            if (!matchesValoracion) return false;
        }
        return true;
    });

    renderResults(filtered);
  }

  function getRatings(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_RATINGS)) || {}; }catch(e){ return {}; }
  }

  function getAverageRating(id){
    const pais = (destinos.find(d => d.id === id) || {}).pais;
    const slug = pais ? packSlugPorPais[pais] : null;
    const consejoId = slug ? `pack_${slug}` : null;

    if (consejoId && typeof ValoracionConsejo !== 'undefined' && ValoracionConsejo.calcularMedia) {
      const v = ValoracionConsejo.calcularMedia(consejoId);
      if (Number.isFinite(Number(v))) return Number(v);
    }
    // Fallback legacy
    const ratings = getRatings();
    const destinoRatings = ratings[String(id)];
    if (!destinoRatings || !Array.isArray(destinoRatings) || destinoRatings.length === 0) return null;
    const sum = destinoRatings.reduce((a, b) => a + Number(b || 0), 0);
    return sum / destinoRatings.length;
  }
  
  function getRatingStars(rating){
    const lang = getCurrentLang();
    const t = traduccionesBuscador[lang] || traduccionesBuscador['ES'];
    if (rating === null) return t.sin_valorar;
    
    const stars = Math.round(rating);
    const filled = '★'.repeat(stars);
    const empty = '☆'.repeat(5 - stars);
    return `${filled}${empty} (${rating.toFixed(1)})`;
  }

  function getRatingStars(ratingData) {
    // Verificar si ValoracionConsejo y sus funciones están disponibles
    if (typeof ValoracionConsejo === 'undefined' || !ValoracionConsejo.renderEstrellasDisplay) {
        return ''; // Devolver vacío si no está disponible (aunque debería estarlo)
    }
    
    const media = ratingData.media || 0;
    const count = ratingData.count || 0;
    
    const lang = getCurrentLang();
    const t = traduccionesBuscador[lang] || traduccionesBuscador['ES'];

    if (media > 0) {
        // Usar la función compartida para generar el HTML de las estrellas estáticas
        const estrellasHtml = ValoracionConsejo.renderEstrellasDisplay(media, 5);
        return `
            <span class="media-score">${media.toFixed(1)} / 5</span> 
            ${estrellasHtml} 
            <span class="media-count">(${count})</span>
        `;
    } else {
        return `<span class="sin-valorar">${t.sin_valorar}</span>`;
    }
}

  function renderResults(list) {
    const container = $('resultados-buscador');
    container.innerHTML = ''; 

    // 3. OBTENER IDIOMA ACTUAL Y TRADUCCIONES GLOBALES
    const lang = getCurrentLang();
    const t = traduccionesBuscador[lang] || traduccionesBuscador['ES'];
    
    // Intentamos acceder a la variable global 'textos' definida en traductor.js
    let textosGlobales = null;
    if (typeof textos !== 'undefined') {
        textosGlobales = textos[lang];
    }

    if(list.length === 0) {
        container.innerHTML = `<p>${t.no_resultados}</p>`;
        return;
    }

    const listaConRating = list.map(d => {
      // saca la informacion de valoración usando el ValoracionConsejo de valoracion-review.js
      let ratingData = { media: 0, count: 0 };
      if (typeof ValoracionConsejo !== 'undefined' && ValoracionConsejo.calcularMediaValoraciones) {
        // Sacar el ID del consejo basado en el país
        const consejoId = 'pack_' + (d.pais ? d.pais.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : 'desconocido');  
        ratingData = ValoracionConsejo.calcularMediaValoraciones(consejoId);
      }
        
      // Adjuntar datos de rating al objeto destino
      d.mediaValoracion = ratingData.media; 
      d.countValoracion = ratingData.count;
      return d;
    });
    
    container.innerHTML = list.map(d => {
        const ratingText = getRatingStars({ media: d.mediaValoracion, count: d.countValoracion });        const destinoPagina = paginaPorPais[d.pais] || 'version-a.html';
        const isFav = isFavorito(d.id);
        const favClass = isFav ? 'is-favorito' : '';
        const favText = isFav ? t.favorito : t.guardar;
        
        // 4. TRADUCIR EL TÍTULO
        // Si existe el diccionario global y tenemos la clave del titulo, lo usamos.
        let tituloMostrado = d.tituloDefault;
        if (textosGlobales && d.tituloKey && textosGlobales[d.tituloKey]) {
            tituloMostrado = textosGlobales[d.tituloKey];
        }
        
        return `
            <article class="resultado-destino">
                <img src="${d.img}" alt="${tituloMostrado}" style="width:100%; height:180px; object-fit:cover;">
                <div style="padding:15px;">
                    <h3 style="margin:0; font-size:1.1rem;">${tituloMostrado}</h3>
                    <p style="color:black; font-size:0.9rem;">${d.pais} • ${d.tipo}</p>
                    <p style="font-weight:bold; color:#102b12; margin:10px 0;">$${d.precio} ${t.por_persona}</p>
                    <p style="font-size:0.85rem;">${d.duracion} ${t.dias}</p>
                    <div class="destino-valoracion" style="margin: 5px 0; color:#f59e0b; font-size:0.95rem; font-weight:500;">${ratingText}</div>
                    <div class="acciones-result">
                        <a href="${destinoPagina}" class="ver-link">${t.ver_detalles}</a>
                        <button type="button" class="fav-btn ${favClass}" data-id="${d.id}">${favText}</button>
                    </div>
                </div>
            </article>
        `;
    }).join('');
    
    // Re-enlazar eventos de favoritos
    document.querySelectorAll('.fav-btn').forEach(btn => {
        const destinoId = parseInt(btn.dataset.id);
        const isIndex = (window.location.pathname.endsWith('index.html') || window.location.pathname === '/');
        
        if (isIndex) {
            btn.addEventListener('click', (e) => {
              e.preventDefault();
              window.location.href = 'iniciar-sesion.html';
            });
        } else {
            btn.addEventListener('click', () => toggleFavorito(destinoId, btn));
        }
    });
  }

  function onReset() {
    $('form-buscador').reset();
    const lang = getCurrentLang();
    const t = traduccionesBuscador[lang] || traduccionesBuscador['ES'];
    $('precio-max-val').textContent = `${t.hasta} $2000`;
    localStorage.removeItem(STORAGE_FILTERS);
    performFilter();
  }
  
  function getFavoritos(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_FAVS)) || []; }catch(e){ return []; }
  }

  function isFavorito(id){
    return getFavoritos().includes(id);
  }

  function toggleFavorito(id, btn){
    const favs = getFavoritos();
    const idx = favs.indexOf(id);
    if (idx === -1) favs.push(id); else favs.splice(idx,1);
    localStorage.setItem(STORAGE_FAVS, JSON.stringify(favs));
    
    const lang = getCurrentLang();
    const t = traduccionesBuscador[lang] || traduccionesBuscador['ES'];
    const isFav = isFavorito(id);
    btn.textContent = isFav ? t.favorito : t.guardar;
    if (isFav) btn.classList.add('is-favorito'); else btn.classList.remove('is-favorito');
  }

  init();
})();