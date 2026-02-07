(function () {
    try {
        const usuarioActual = localStorage.getItem('usuarioActual');
        if (!usuarioActual) {
            // Si no hay sesión, redirigimos al login
            window.location.href = 'iniciar-sesion.html';
            return;
        }

        const userJson = localStorage.getItem(usuarioActual);
        if (!userJson) {
            // Si no hay datos guardados para ese usuario, redirigimos al login
            window.location.href = 'iniciar-sesion.html';
            return;
        }

        const userData = JSON.parse(userJson);

        // Elementos del DOM
        const fotoEl = document.getElementById('perfil-foto');
        const nombreEl = document.getElementById('perfil-nombre');
        const emailEl = document.getElementById('perfil-email');
        const volverEl = document.getElementById('volver-versionb');

        if (fotoEl && userData.imagen) fotoEl.src = userData.imagen;
        if (nombreEl && userData.usuario) {
            nombreEl.innerHTML = '<span class="perfil-label">Nombre de usuario:</span> ' + userData.usuario;
        }
        if (emailEl && userData.email) emailEl.textContent = userData.email;

        // Asegurar que el enlace "Inicio/Volver" lleve a version-b.html
        if (volverEl) volverEl.href = 'index.html';

        // Renderizar favoritos guardados por el buscador (buscador_favorites)
        try {
            const STORAGE_FAVS = 'buscador_favorites';
            const favContainer = document.getElementById('perfil-favoritos');

            // misma lista de destinos usada por el buscador (minimizada)
            const destinos = [
                { id: 1, pais: 'Italia', titulo: 'Descubre la Belleza de Italia', img: 'imagenes/italia.jpg' },
                { id: 2, pais: 'Japón', titulo: 'Japón, Tradición y Modernidad', img: 'imagenes/japon.jpg' },
                { id: 3, pais: 'Marruecos', titulo: 'Colores y Aromas de Marruecos', img: 'imagenes/marruecos.jpg' },
                { id: 4, pais: 'Noruega', titulo: 'Paisajes de Ensueño en Noruega', img: 'imagenes/noruega.jpg' }
            ];

            const paginaPorPais = {
                'Italia': 'NUEVO-version-c-italia.html',
                'Japón': 'NUEVO-version-c-japon.html',
                'Marruecos': 'NUEVO-version-c-marruecos.html',
                'Noruega': 'NUEVO-version-c-noruega.html'
            };

            const raw = localStorage.getItem(STORAGE_FAVS);
            const favs = raw ? JSON.parse(raw) : [];

            if (favContainer) {
                favContainer.innerHTML = '';

                if (!favs.length) {
                    favContainer.textContent = 'No tienes favoritos guardados.';
                } else {
                    const list = document.createElement('ul');
                    list.className = 'perfil-favs-list';

                    favs.forEach(id => {
                        const dest = destinos.find(d => d.id === id);
                        const li = document.createElement('li');
                        li.className = 'perfil-fav-item';

                        const leftWrap = document.createElement('div');
                        leftWrap.className = 'perfil-fav-left';

                        if (dest) {
                            const a = document.createElement('a');
                            a.href = paginaPorPais[dest.pais] || 'version-a.html';
                            a.className = 'perfil-fav-link';

                            const img = document.createElement('img');
                            img.src = dest.img;
                            img.alt = dest.titulo;
                            img.className = 'perfil-fav-img';

                            const span = document.createElement('span');
                            span.textContent = dest.titulo;
                            span.className = 'perfil-fav-title';

                            a.appendChild(img);
                            a.appendChild(span);
                            leftWrap.appendChild(a);
                        } else {
                            leftWrap.textContent = 'Destino no disponible';
                        }

                        // boton para ver destino
                        const btnVer = document.createElement('button');
                        btnVer.type = 'button';
                        btnVer.textContent = 'Ver';
                        btnVer.className = 'perfil-fav-view-btn';
                        btnVer.addEventListener('click', function () {
                            const target = dest ? (paginaPorPais[dest.pais] || 'version-a.html') : 'version-a.html';
                            window.location.href = target;
                        });

                        // boton para quitar favorito
                        const btnQuitar = document.createElement('button');
                        btnQuitar.type = 'button';
                        btnQuitar.textContent = 'Quitar';
                        btnQuitar.className = 'perfil-fav-remove-btn';

                        btnQuitar.addEventListener('click', function () {
                            try {
                                // actualizar el array de favoritos en localStorage
                                const currentRaw = localStorage.getItem(STORAGE_FAVS);
                                const current = currentRaw ? JSON.parse(currentRaw) : [];
                                const idx2 = current.indexOf(id);
                                if (idx2 !== -1) {
                                    current.splice(idx2, 1);
                                    localStorage.setItem(STORAGE_FAVS, JSON.stringify(current));
                                }

                                // eliminar elemento del DOM
                                li.remove();

                                // si ya no hay favoritos, mostrar mensaje
                                if (!current.length) {
                                    favContainer.textContent = 'No tienes favoritos guardados.';
                                }
                            } catch (err) {
                                console.error('Error quitando favorito:', err);
                            }
                        });

                        li.appendChild(leftWrap);
                        li.appendChild(btnVer);
                        li.appendChild(btnQuitar);
                        list.appendChild(li);
                    });

                    favContainer.appendChild(list);
                }
            }
        } catch (e) {
            console.error('Error renderizando favoritos:', e);
        }

        // Renderizar compras del usuario (localStorage 'purchases_<usuario>')
        try {
            const purchasesKey = 'purchases_' + usuarioActual;
            const comprasContainer = document.getElementById('perfil-compras');
            const rawCompras = localStorage.getItem(purchasesKey);
            const compras = rawCompras ? JSON.parse(rawCompras) : [];

            if (comprasContainer) {
                if (!compras.length) {
                    comprasContainer.textContent = 'No tienes compras registradas.';
                } else {
                    const ul = document.createElement('ul');
                    // styling for compras list is handled by CSS (#perfil-compras ul)

                    // pequeño mapa de packId -> título/imagen
                    const packMap = {
                        brasil: {title: 'Ritmo y Naturaleza por Brasil', img: 'imagenes/brasil.jpg'},
                        francia: {title: 'Arte por las Calles Francesas', img: 'imagenes/francia.jpg'},
                        italia: {title: 'Descubre la Belleza de Italia', img: 'imagenes/italia.jpg'},
                        japon: {title: 'Japón, Tradición y Modernidad', img: 'imagenes/japon.jpg'},
                        marruecos: {title: 'Colores y Aromas de Marruecos', img: 'imagenes/marruecos.jpg'},
                        noruega: {title: 'Paisajes de Ensueño en Noruega', img: 'imagenes/noruega.jpg'}
                    };

                    compras.slice().reverse().forEach(function(cmp, index) {
                        const li = document.createElement('li');
                        // clase semántica similar a los packs
                        li.classList.add('pack');

                        const pack = packMap[cmp.pack] || {title: cmp.pack || 'Pack', img: 'imagenes/icono.png'};

                        // imagen arriba
                        const img = document.createElement('img');
                        img.src = pack.img;
                        img.alt = pack.title;

                        // info: título y fecha
                        const info = document.createElement('div');
                        info.className = 'compra-info';
                        const title = document.createElement('strong');
                        title.textContent = pack.title;
                        const fecha = document.createElement('div');
                        fecha.className = 'compra-fecha';
                        fecha.textContent = cmp.fecha ? new Date(cmp.fecha).toLocaleString() : '';
                        info.appendChild(title);
                        info.appendChild(fecha);

                        // Mostrar solo la media de valoraciones del pack (modo lectura)
                        try {
                            const consejoId = 'pack_' + (cmp.pack || 'desconocido');
                            let mediaPack = null;
                            if (typeof ValoracionConsejo !== 'undefined' && ValoracionConsejo) {
                                mediaPack = ValoracionConsejo.calcularMedia(consejoId);
                            } else {
                                // fallback: leer localStorage directamente
                                const allVals = JSON.parse(localStorage.getItem('consejoValoraciones') || '{}');
                                if (allVals[consejoId]) {
                                    const vals = Object.values(allVals[consejoId]).map(v => Number(v) || 0);
                                    if (vals.length) mediaPack = (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1);
                                }
                            }

                            const ratingEl = document.createElement('div');
                            ratingEl.className = 'compra-valoracion-media';
                            if (mediaPack !== null && mediaPack !== undefined && mediaPack !== '' && Number(mediaPack) > 0) {
                                const texto = document.createElement('span');
                                texto.textContent = 'Media: ' + mediaPack + ' ';
                                ratingEl.appendChild(texto);

                                // SVG de estrella (inline para garantizar apariencia)
                                const svgNS = 'http://www.w3.org/2000/svg';
                                const svg = document.createElementNS(svgNS, 'svg');
                                svg.setAttribute('viewBox', '0 0 24 24');
                                svg.setAttribute('width', '16');
                                svg.setAttribute('height', '16');
                                svg.setAttribute('aria-hidden', 'true');
                                svg.style.verticalAlign = 'middle';

                                const path = document.createElementNS(svgNS, 'path');
                                path.setAttribute('d', 'M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L19.335 24 12 19.897 4.665 24l1.635-8.69L.6 9.75l7.732-1.732z');
                                path.setAttribute('fill', '#ffc107');
                                path.setAttribute('stroke', '#000');
                                path.setAttribute('stroke-width', '0.8');

                                svg.appendChild(path);
                                ratingEl.appendChild(svg);
                            } else {
                                ratingEl.textContent = 'Sin valoraciones';
                            }
                            info.appendChild(ratingEl);
                        } catch (e) {
                            console.warn('No se pudo obtener la media de valoraciones para la compra', e);
                        }

                        // botón ver detalles -> redirigir a perfil-compra.html
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.textContent = 'Ver';
                        btn.className = 'boton-comprar';
                        btn.addEventListener('click', function() {
                            // Guardar los datos de la compra en sessionStorage para mostrarlos
                            verDetalleCompra(index);
                        });

                        // ensamblar card vertical
                        li.appendChild(img);
                        li.appendChild(info);
                        li.appendChild(btn);
                        ul.appendChild(li);
                    });

                    // crear estructura de carrusel: envoltura, viewport, flechas
                    comprasContainer.innerHTML = '';
                    const wrap = document.createElement('div');
                    wrap.className = 'perfil-compras-wrap';

                    const viewport = document.createElement('div');
                    viewport.className = 'perfil-compras-viewport';
                    // permitir scroll horizontal suave
                    // scroll-behavior and flex-wrap are handled by CSS
                    // añadir la lista dentro del viewport
                    viewport.appendChild(ul);

                    // flechas
                    const btnPrev = document.createElement('button');
                    btnPrev.type = 'button';
                    btnPrev.className = 'perfil-arrow perfil-prev';
                    btnPrev.innerHTML = '‹';
                    const btnNext = document.createElement('button');
                    btnNext.type = 'button';
                    btnNext.className = 'perfil-arrow perfil-next';
                    btnNext.innerHTML = '›';

                    // añadir al DOM (agregar flechas dentro del wrap para evitar que sean recortadas por contenedores padres)
                    wrap.appendChild(viewport);
                    // asegurar que el wrap esté posicionado para las flechas
                    if (getComputedStyle(wrap).position === 'static') {
                        wrap.style.position = 'relative';
                    }
                    // añadir el wrap al contenedor de compras
                    comprasContainer.appendChild(wrap);
                    // colocar las flechas en el borde de la sección padre (si existe) para que queden en los bordes
                    const sectionEl = comprasContainer.closest('.perfil-compras-section') || comprasContainer.parentElement;
                    if (sectionEl) {
                        sectionEl.appendChild(btnPrev);
                        sectionEl.appendChild(btnNext);
                        // asegurar que la sección esté posicionada para que las flechas se ubiquen respecto a ella
                        if (getComputedStyle(sectionEl).position === 'static') {
                            sectionEl.style.position = 'relative';
                        }
                    } else {
                        // fallback: añadir dentro del wrap
                        wrap.appendChild(btnPrev);
                        wrap.appendChild(btnNext);
                    }

                    // lógica para mostrar máximo 4 tarjetas (o 1 en móvil) y hacer las flechas útiles
                    function getVisibleCount() {
                        // <=600px -> 1, 601-768px -> 2, >768px -> 4
                        if (window.matchMedia('(max-width: 600px)').matches) return 1;
                        if (window.matchMedia('(min-width: 601px) and (max-width: 768px)').matches) return 2;
                        return 4;
                    }

                    // asegurar que los estilos se hayan aplicado y medir ancho de carta
                    const computeLayout = function () {
                        const firstLi = ul.querySelector('li');
                        if (!firstLi) return null;
                        // gap del contenedor (si no está disponible, fallback 20)
                        const gapStr = getComputedStyle(ul).gap || '20px';
                        const gap = parseInt(gapStr, 10) || 20;
                        const cardW = firstLi.offsetWidth;
                        const perCard = cardW + gap;
                        const visibleNow = getVisibleCount();

                        // En móvil (1 tarjeta) fijar el ancho del viewport al ancho exacto
                        // de una tarjeta (cardW) en px para que sólo quepa una por vista.
                        if (visibleNow === 1) {
                            const viewportWidth = cardW; // no incluir gap para que sólo quepa la tarjeta
                            viewport.style.width = viewportWidth + 'px';
                            if (wrap && wrap.style) {
                                wrap.style.width = viewportWidth + 'px';
                                wrap.style.margin = '0 auto';
                            }
                        } else {
                            const viewportWidth = perCard * visibleNow - gap;
                            viewport.style.width = viewportWidth + 'px';
                            // centrar el wrap dentro de la sección: fijar ancho del wrap igual al viewport
                            if (wrap && wrap.style) {
                                wrap.style.width = viewportWidth + 'px';
                                wrap.style.margin = '0 auto';
                            }
                        }

                        return { perCard: perCard, gap: gap, visible: visibleNow };
                    };

                    let layout = computeLayout();

                    function updateArrows() {
                        const need = viewport.scrollWidth > viewport.clientWidth + 1;
                        if (!need) {
                            btnPrev.style.display = 'none';
                            btnNext.style.display = 'none';
                            return;
                        }
                        btnPrev.style.display = 'flex';
                        btnNext.style.display = 'flex';

                        // deshabilitar si al inicio o al final
                        const atStart = viewport.scrollLeft <= 5;
                        const atEnd = (viewport.scrollLeft + viewport.clientWidth) >= (viewport.scrollWidth - 5);
                        btnPrev.disabled = atStart;
                        btnNext.disabled = atEnd;
                        btnPrev.style.opacity = atStart ? '0.4' : '1';
                        btnNext.style.opacity = atEnd ? '0.4' : '1';
                    }

                    // desplazar una tarjeta (card + gap) por clic
                    function scrollByOne(direction) {
                        // recalcular layout si necesario
                        layout = computeLayout() || layout;
                        let move;
                        // Si la vista actual es 1 tarjeta (móvil), usar el ancho del viewport
                        // como distancia de desplazamiento para garantizar que avance exactamente
                        // una tarjeta que ocupe toda la vista.
                        if (layout && layout.visible === 1) {
                            // Móvil: desplazar exactamente una tarjeta (card + gap)
                            move = layout.perCard;
                        } else {
                            move = layout ? layout.perCard : viewport.clientWidth;
                        }
                        viewport.scrollBy({ left: direction * move, behavior: 'smooth' });
                    }

                    btnPrev.addEventListener('click', function () { scrollByOne(-1); });
                    btnNext.addEventListener('click', function () { scrollByOne(1); });

                    // actualizar flechas al hacer scroll y al redimensionar
                    viewport.addEventListener('scroll', updateArrows);
                    window.addEventListener('resize', function () { layout = computeLayout(); updateArrows(); });

                    // Si imágenes tardan en cargar, esperar un poco para calcular tamaños
                    setTimeout(function () { layout = computeLayout(); updateArrows(); }, 160);
                }
            }
        } catch (err) {
            console.error('Error renderizando compras:', err);
        }

        // Renderizar consejos escritos por este usuario
        try {
            const consejosContainer = document.getElementById('perfil-consejos');
            const allConsejos = JSON.parse(localStorage.getItem('consejos') || '[]');
            // usar el nombre de usuario legible como autor si está disponible
            const authorName = (userData && userData.usuario) ? userData.usuario : usuarioActual;
            const userConsejos = allConsejos.filter(c => (c && c.autor === authorName));

            if (consejosContainer) {
                consejosContainer.innerHTML = '';
                if (!userConsejos.length) {
                    consejosContainer.textContent = 'No has publicado consejos aún.';
                } else {
                    const ul = document.createElement('ul');
                    ul.className = 'perfil-consejos-list';

                    userConsejos.forEach(function (c, index) {
                        const li = document.createElement('li');
                        li.className = 'perfil-consejo-item';

                        const title = document.createElement('strong');
                        title.textContent = c.titulo || 'Sin título';
                        title.className = 'perfil-consejo-title';

                        const desc = document.createElement('div');
                        desc.textContent = c.descripcion || '';
                        desc.className = 'perfil-consejo-desc';

                        // Obtener media de valoración
                        const consejoIndex = allConsejos.indexOf(c);
                        const consejoId = `consejo_${consejoIndex}`;
                        let media = 0;
                        let totalValoraciones = 0;

                        // Intentar obtener media si ValoracionConsejo está disponible
                        if (typeof ValoracionConsejo !== 'undefined') {
                            media = ValoracionConsejo.calcularMedia(consejoId);
                            totalValoraciones = ValoracionConsejo.obtenerTotalValoraciones(consejoId);
                        } else {
                            // Fallback manual si ValoracionConsejo no está disponible
                            const valoraciones = JSON.parse(localStorage.getItem('consejoValoraciones') || '{}');
                            if (valoraciones[consejoId]) {
                                const valores = Object.values(valoraciones[consejoId]);
                                if (valores.length > 0) {
                                    media = (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(1);
                                    totalValoraciones = valores.length;
                                }
                            }
                        }

                        // Crear elemento para la media
                        const media_div = document.createElement('div');
                        media_div.className = 'perfil-consejo-media';
                        if (totalValoraciones > 0) {
                            // Construir texto con SVG de estrella (relleno amarillo y borde negro)
                            const texto = document.createElement('span');
                            texto.textContent = `Media: ${media} `;
                            media_div.appendChild(texto);

                            const svgNS = 'http://www.w3.org/2000/svg';
                            const svg = document.createElementNS(svgNS, 'svg');
                            svg.setAttribute('viewBox', '0 0 24 24');
                            svg.setAttribute('aria-hidden', 'true');
                            svg.classList.add('media-star');

                            const path = document.createElementNS(svgNS, 'path');
                            path.setAttribute('d', 'M12 .587l3.668 7.431L23.4 9.75l-5.7 5.56L19.335 24 12 19.897 4.665 24l1.635-8.69L.6 9.75l7.732-1.732z');
                            path.setAttribute('fill', '#ffc107');
                            path.setAttribute('stroke', '#000');
                            path.setAttribute('stroke-width', '0.8');

                            svg.appendChild(path);
                            media_div.appendChild(svg);

                            const cuenta = document.createElement('span');
                            cuenta.textContent = ` (${totalValoraciones} valoraciones)`;
                            media_div.appendChild(cuenta);
                        } else {
                            media_div.textContent = 'Sin valoraciones';
                        }

                        li.appendChild(title);
                        li.appendChild(desc);
                        // Mostrar tags del consejo
                        if (c.tags && Array.isArray(c.tags) && c.tags.length > 0) {
                            const tagsContainer = document.createElement('div');
                            tagsContainer.className = 'tags-container';
                            c.tags.forEach(t => {
                                const spanTag = document.createElement('span');
                                spanTag.className = 'tag-chip';
                                spanTag.textContent = t;
                                tagsContainer.appendChild(spanTag);
                            });
                            li.appendChild(tagsContainer);
                        }
                        li.appendChild(media_div);
                        ul.appendChild(li);
                    });

                    consejosContainer.appendChild(ul);
                }
            }
        } catch (e) {
            console.error('Error renderizando consejos del perfil:', e);
        }

        // Renderizar compañeros añadidos desde `perfil-compra` (localStorage.acompanantesAgregados)
        try {
            const compasSection = document.getElementById('compas-viaje-section');
            if (compasSection) {
                // leer mapa de emails añadidos, normalizar a minúsculas
                const rawAdded = localStorage.getItem('acompanantesAgregados') || '{}';
                let addedMap = {};
                try { addedMap = JSON.parse(rawAdded); } catch (e) { addedMap = {}; }
                const addedEmails = Object.keys(addedMap).filter(k => addedMap[k]).map(k => (k || '').toLowerCase());

                if (addedEmails.length === 0) {
                    compasSection.innerHTML = '<h2>Compañeros de viaje</h2><p>No tienes compañeros añadidos.</p>';
                } else {
                    // crear contenedor de avatares
                    const container = document.createElement('div');
                    container.className = 'companeros-list';

                    // función auxiliar para encontrar usuario por email
                    function findUserByEmail(email) {
                        if (!email) return null;
                        const target = email.toLowerCase();
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (!key) continue;
                            // evitar claves obvias de almacenamiento que no sean usuarios
                            if (key.startsWith('purchases_') || key === 'comprasRealizadas' || key === 'datosAcompanantes' || key === 'datosAmpliacion' || key === 'usuarioActual' || key === 'historialCompras' || key === 'acompanantesAgregados' || key === 'buscador_favorites') continue;
                            try {
                                const parsed = JSON.parse(localStorage.getItem(key));
                                if (parsed && (parsed.email || parsed.correo)) {
                                    const candidateEmail = (parsed.email || parsed.correo || '').toLowerCase();
                                    if (candidateEmail === target) return parsed;
                                }
                            } catch (e) {
                                // no es JSON de usuario, ignorar
                            }
                        }
                        return null;
                    }

                    addedEmails.forEach(email => {
                        const user = findUserByEmail(email);
                        const item = document.createElement('div');
                        item.className = 'companero-item';

                        const img = document.createElement('img');
                        img.src = (user && user.imagen) ? user.imagen : 'imagenes/usuario.png';
                        img.alt = (user && (user.usuario || user.nombre)) ? (user.usuario || user.nombre) : email;

                        const info = document.createElement('div');
                        info.className = 'compañero-info';

                        const nombre = document.createElement('div');
                        nombre.className = 'compañero-nombre';
                        nombre.textContent = (user && (user.usuario || user.nombre)) ? (user.usuario || user.nombre) : email;

                        info.appendChild(nombre);
                        item.appendChild(img);
                        item.appendChild(info);
                        container.appendChild(item);
                    });

                    // reemplazar el contenido de la sección (mantener título)
                    compasSection.innerHTML = '<h2>Compañeros de viaje</h2>';
                    compasSection.appendChild(container);
                }
            }
        } catch (e) {
            console.error('Error renderizando compañeros añadidos:', e);
        }
    } catch (err) {
        console.error('Error cargando perfil:', err);
    }

    // En la función que maneja el clic en "Ver detalles"
    function verDetalleCompra(index) {
        try {
            const usuarioActual = localStorage.getItem('usuarioActual');
            if (!usuarioActual) return;
            
            // Obtener compras del usuario en el formato correcto
            const purchasesKey = 'purchases_' + usuarioActual;
            const compras = JSON.parse(localStorage.getItem(purchasesKey) || '[]');
            
            // Como mostramos las compras en orden inverso, calculamos el índice real
            const realIndex = compras.length - 1 - index;
            const compra = compras[realIndex];
            
            if (compra) {
                // Guardar la compra en sessionStorage para perfil-compra.html
                sessionStorage.setItem('compraDetalle', JSON.stringify(compra));
                window.location.href = 'perfil-compra.html';
            } else {
                alert('No se pudo cargar el detalle de la compra');
            }
        } catch (e) {
            console.error('Error al cargar detalle:', e);
            alert('Error al cargar los detalles de la compra');
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        // Manejar botón cerrar sesión
        const cerrarSesionBtn = document.querySelector('.cerrar-sesion-perfil');
        if (cerrarSesionBtn) {
            cerrarSesionBtn.addEventListener('click', function () {
                localStorage.removeItem('usuarioActual');
                window.location.href = 'iniciar-sesion.html';
            });
        }

        const form = document.getElementById('form-cambiar-pass');
        if (!form) return;
        const msg = document.getElementById('pass-msg');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            msg.textContent = '';
            msg.classList.remove('pass-ok');

            const actual = form['pass-actual'].value;
            const nueva = form['pass-nueva'].value;
            const nueva2 = form['pass-nueva2'].value;

            const usuarioActual = localStorage.getItem('usuarioActual');
            if (!usuarioActual) {
                msg.textContent = 'Sesión no válida.';
                return;
            }
            const userRaw = localStorage.getItem(usuarioActual);
            if (!userRaw) {
                msg.textContent = 'Usuario no encontrado.';
                return;
            }
            let userData;
            try {
                userData = JSON.parse(userRaw);
            } catch {
                msg.textContent = 'Error de usuario.';
                return;
            }

            if (!userData.contrasena || actual !== userData.contrasena) {
                msg.textContent = 'La contraseña actual no es correcta.';
                return;
            }
            if (nueva.length < 4) {
                msg.textContent = 'La nueva contraseña debe tener al menos 4 caracteres.';
                return;
            }
            if (nueva !== nueva2) {
                msg.textContent = 'Las contraseñas nuevas no coinciden.';
                return;
            }
            if (nueva === actual) {
                msg.textContent = 'La nueva contraseña debe ser diferente.';
                return;
            }

            userData.contrasena = nueva;
            localStorage.setItem(usuarioActual, JSON.stringify(userData));
            msg.textContent = 'Contraseña cambiada correctamente.';
            msg.classList.add('pass-ok');
            form.reset();
        });
    });
})();
