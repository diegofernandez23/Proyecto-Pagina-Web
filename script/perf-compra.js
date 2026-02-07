document.addEventListener('DOMContentLoaded', function() {
    let compra = null;

    try {
        const compraRaw = sessionStorage.getItem('compraDetalle');
        if (!compraRaw) {
            document.getElementById('detalle-compra').innerHTML = '<p class="mensaje-error">No se encontraron datos de la compra.</p>';
            return;
        }

        compra = JSON.parse(compraRaw);
        
        // Renderizar información del pack
        renderPackInfo(compra);
        
        // Renderizar detalles de la compra
        renderDetalleCompra(compra);

        // Mostrar datos de acompañantes en la tabla de detalle (usa misma lógica que info-compra)
        mostrarDatosAcompanantesDetalle(compra);

        // Renderizar valoración del pack usando la lógica compartida en valoracion-con.js
        try {
            const usuarioActual = localStorage.getItem('usuarioActual') || '';
            const consejoId = 'pack_' + (compra && compra.pack ? compra.pack : 'desconocido');
            if (typeof ValoracionConsejo !== 'undefined') {
                ValoracionConsejo.renderizarValoracion('valoracion-pack', consejoId, usuarioActual);
            }
        } catch (e) {
            console.warn('No se pudo renderizar la valoración del pack:', e);
        }

    } catch (err) {
        console.error('Error cargando detalle de compra:', err);
        document.getElementById('detalle-compra').innerHTML = '<p class="mensaje-error">Error al cargar los datos de la compra.</p>';
    }

    const btnGuardarReview = document.getElementById('btn-guardar-review');
    const reviewTextarea = document.getElementById('user-review-text');
    const reviewMessage = document.getElementById('review-message');
    const usuarioActual = localStorage.getItem('usuarioActual') || '';
    
    // Usar la variable 'compra' cargada arriba para asegurar el consejoId estable
    const consejoId = 'pack_' + (compra && compra.pack ? compra.pack : 'desconocido'); 

    if (btnGuardarReview && typeof ValoracionConsejo !== 'undefined') {
        btnGuardarReview.addEventListener('click', function() {
            if (!usuarioActual) {
                alert("Debes iniciar sesión para dejar una reseña.");
                return;
            }

            const texto = reviewTextarea.value.trim();
            if (texto.length < 10) {
                reviewMessage.textContent = 'Tu reseña debe tener al menos 10 caracteres.';
                reviewMessage.style.color = '#dc3545';
                return;
            }
            
            // 1. Obtener la valoración actual (estrellas) guardada en localStorage
            const valoracionObj = ValoracionConsejo.obtenerValoracionUsuario(consejoId, usuarioActual);
            const valorEstrellas = valoracionObj.valor || 0; 

            // 2. Guardar la reseña completa, MANTENIENDO el valor de estrella guardado (valorEstrellas)
            // Se pasan 4 argumentos: valorEstrellas (valor existente) y texto (nuevo texto).
            ValoracionConsejo.guardarValoracionUsuario(consejoId, usuarioActual, valorEstrellas, texto);
            
            reviewMessage.textContent = '¡Reseña guardada correctamente!';
            reviewMessage.style.color = '#0b6623';
            
            // 3. Volver a renderizar. Esto se encarga de mostrar la reseña guardada y ocultar el formulario.
            const contenedorValoracion = document.getElementById('valoracion-pack');
            if (contenedorValoracion) {
                ValoracionConsejo.renderizarValoracion('valoracion-pack', consejoId, usuarioActual);
            }
        });
    }

    // Event listeners para botones
    document.getElementById('btn-volver-perfil').addEventListener('click', function() {
        window.location.href = 'perfil.html';
    });

    document.getElementById('btn-inicio').addEventListener('click', function() {
        window.location.href = 'index.html';
    });

    // Delegación: manejar clicks en botones "Añadir compañero"
    document.addEventListener('click', function(e) {
        const btn = e.target.closest && e.target.closest('.btn-anadir-acompanante');
        if (!btn) return;
        const num = btn.getAttribute('data-num') || '';
        const tr = btn.closest('tr');

        // Intentar obtener el email del acompañante desde varios orígenes
        let email = '';
        try {
            // 1) Desde la compra actual (si existe en este scope)
            if (typeof compra !== 'undefined' && compra) {
                const datos = compra.datosAcompanantes || compra.datosAcompañantes || [];
                if (Array.isArray(datos) && datos.length > 0) {
                    const found = datos.find(a => String(a.numero) === String(num) || String(a.numero) === String(num));
                    if (found && (found.correo || found.email)) {
                        email = found.correo || found.email;
                    }
                }
            }

            // 2) Si no, intentar leer 'datosAcompanantes' en localStorage/sessionStorage
            if (!email) {
                const raw = localStorage.getItem('datosAcompanantes') || sessionStorage.getItem('datosAcompanantes') || '[]';
                const arr = JSON.parse(raw || '[]');
                if (Array.isArray(arr) && arr.length > 0) {
                    const f = arr.find(a => String(a.numero) === String(num));
                    if (f && (f.correo || f.email)) email = f.correo || f.email;
                }
            }

            // 3) Si aún no hay email, intentar extraer un correo del texto de la celda
            if (!email) {
                const cellText = tr ? tr.textContent : '';
                const mailMatch = cellText && cellText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                if (mailMatch) email = mailMatch[0];
            }
        } catch (err) {
            console.warn('Error al buscar email del acompañante:', err);
            email = '';
        }

        if (!email) {
            alert('No se encontró el correo del acompañante en localStorage.');
            return;
        }

        // Buscar cuenta en localStorage cuyo campo 'email' coincida
        let cuentaEncontrada = null;
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                // Omitir claves conocidas que no sean usuarios (prefijos comunes)
                if (!key) continue;
                // Evitar revisar elementos como compras o datos auxiliares que no sean JSON de usuario
                if (key.startsWith('purchases_') || key === 'comprasRealizadas' || key === 'datosAcompanantes' || key === 'datosAmpliacion' || key === 'usuarioActual' || key === 'historialCompras') continue;
                try {
                    const parsed = JSON.parse(localStorage.getItem(key));
                    if (parsed && (parsed.email === email || parsed.correo === email)) {
                        cuentaEncontrada = parsed;
                        break;
                    }
                } catch (e) {
                    // No es JSON o no es un objeto usuario: ignorar
                }
            }
        } catch (err) {
            console.error('Error buscando cuentas en localStorage:', err);
        }

        if (!cuentaEncontrada) {
            alert('No existe ninguna cuenta con ese correo.');
            return;
        }

        // Reemplazar el botón por un texto que indique éxito
        const displayName = cuentaEncontrada.usuario || cuentaEncontrada.nombre || email;
        try {
            const span = document.createElement('span');
            span.className = 'anadido-correcto';
            span.textContent = 'Añadido correctamente';
            btn.replaceWith(span);

            // Persistir estado de compañero añadido por email
            try {
                const key = 'acompanantesAgregados';
                const raw = localStorage.getItem(key) || '{}';
                let added = {};
                try { added = JSON.parse(raw); } catch (e) { added = {}; }
                if (email) {
                    added[email] = true;
                    localStorage.setItem(key, JSON.stringify(added));
                }
            } catch (e) {
                console.warn('No se pudo guardar compañero añadido en localStorage', e);
            }
        } catch (err) {
            // Fallback: si falla, insertar una fila nueva (no debería ocurrir)
            console.warn('No se pudo reemplazar el botón, insertando fila como fallback:', err);
            tr.insertAdjacentHTML('afterend', `<tr class="acompanante-row añadido"><td>Compañero añadido</td><td>${displayName} (${email})</td></tr>`);
        }
    });
});

function renderPackInfo(compra) {
    const packContainer = document.querySelector('.pack-info');
    
    // Información de los packs (mismo texto que en version-c)
    const packMapping = {
        brasil: {
            titulo: "Ritmo y Naturaleza por Brasil",
            imagen: "imagenes/brasil.jpg",
            precio: "899€",
            textoImagen: "Vive la energía de Brasil entre playas paradisíacas, selvas amazónicas y cultura vibrante",
            descripcion: "Un recorrido por lo mejor de Brasil: Río de Janeiro y sus playas, la increíble biodiversidad del Amazonas, y la cultura vibrante del país con música, baile y gastronomía. Ideal para quienes buscan mezcla de naturaleza y fiesta."
        },
        francia: {
            titulo: "Arte por las Calles Francesas",
            imagen: "imagenes/francia.jpg",
            precio: "1.099€",
            textoImagen: "Recorre París, la Provenza y la Riviera francesa entre arte, cultura y sabores inolvidables",
            descripcion: "Descubre la riqueza cultural de Francia: pasea por las calles de París, visita museos emblemáticos como el Louvre, disfruta de la cocina francesa en mercados locales y explora la belleza de la Provenza y la Costa Azul. Un viaje pensado para amantes del arte, la historia y la gastronomía."
        },
        italia: {
            titulo: "Descubre la Belleza de Italia",
            imagen: "imagenes/italia.jpg",
            precio: "987€",
            textoImagen: "Explora Roma, Florencia y la Toscana en un viaje lleno de historia, arte y gastronomía auténtica",
            descripcion: "Recorre ciudades históricas como Roma y Florencia, disfruta de la auténtica pasta, pizza y vinos locales, y sumérgete en tradiciones y monumentos que hacen de Italia un país único. Este viaje combina aventura, historia y placer culinario en una experiencia inolvidable para quienes quieren explorar lo mejor del país de forma auténtica."
        },
        japon: {
            titulo: "Japón, Tradición y Modernidad",
            imagen: "imagenes/japon.jpg",
            precio: "850€",
            textoImagen: "Descubre Tokio, Kioto y el Monte Fuji en una fascinante mezcla de tradición y modernidad",
            descripcion: "Sumérgete en la cultura japonesa y descubre sus tradiciones milenarias: comtempla la majestuosidad del Monte Fuji, explora los templos ancestrales de Kioto y disfruta de la vibrante vida urbana de Tokio. Este viaje de 11 días te llevará a través de una mezcla fascinante de historia, tecnología y naturaleza, ofreciéndote una experiencia inolvidable en el corazón de Japón."
        },
        marruecos: {
            titulo: "Colores y Aromas de Marruecos",
            imagen: "imagenes/marruecos.jpg",
            precio: "799€",
            textoImagen: "Aventúrate por Marrakech, el desierto del Sáhara y las montañas del Atlas en una experiencia única",
            descripcion: "Déjate llevar por los sentidos en un viaje inolvidable a tráves de mundo bereber: explora los paisajes desérticos y las montañas del Atlas, descubre la hospitalidad de sus pueblos, sus colores, aromas y tradiciones ancestrales. Una experiencia que combina aventura, cultura y autenticidad en cada rincón de Marruecos."
        },
        noruega: {
            titulo: "Paisajes de Ensueño en Noruega",
            imagen: "imagenes/noruega.jpg",
            precio: "1.495€",
            textoImagen: "Navega por los fiordos noruegos y contempla las auroras boreales en paisajes de ensueño",
            descripcion: "Atrévete a explorar la magia de los majestuosos fiordos noruegos, descubre la fascinante historia vikinga y sumérgete en paisajes naturales que parecen sacados de un sueño. Este viaje combina aventura, cultura escandinava y la tranquilidad del norte, ofreciendo una experiencia inolvidable para quienes buscan conectar con la naturaleza y la historia de una región única en el mundo."
        }
    };

    const packInfo = packMapping[compra.pack];
    
    if (!packInfo) {
        packContainer.innerHTML = '<p class="mensaje-error">Información del pack no encontrada</p>';
        return;
    }

    // Renderizar exactamente como en version-c.html
    packContainer.innerHTML = `
        <div class="pack-intro">
            <div class="pack-imagen">
                <img src="${packInfo.imagen}" alt="${packInfo.titulo}">
                <div class="pack-header">
                    <h2>${packInfo.titulo}</h2>
                    <span class="precio">${packInfo.precio}</span>
                </div>
                <p>${packInfo.textoImagen}</p>
            </div>      
        </div>

        <div class="pack-descripcion">
            <h3>Descripción del pack:</h3>
            <p>${packInfo.descripcion}</p>
        </div>
    `;
}

function renderDetalleCompra(compra) {
    const container = document.getElementById('detalle-compra');
    
    // Filtrar datos sensibles
    const excludeFields = [
        'tarjeta',
        'tarjeta-num',
        'titular',
        'fecha-caducidad',
        'cvv',
        'politica-privacidad',
        'acepta-politica'
    ];

    // Orden específico
    const fieldsOrder = [
        'fecha',
        'nombre',
        'correo',
        'acompanantes',
        'mascotas',
        'tipo-mascota',
        'intolerancias',
        'telefono_emergencia',
        'comentarios_adicionales'
    ];

    const filteredData = Object.keys(compra)
        .filter(key => !excludeFields.includes(key) && key !== 'pack')
        .reduce((obj, key) => {
            obj[key] = compra[key];
            return obj;
        }, {});

    // Usar datos de ampliación si existen
    if (compra.datosAmpliacion) {
        filteredData.acompanantes = compra.datosAmpliacion.acompanantes || '0';
        filteredData.mascotas = compra.datosAmpliacion.mascotas_chk || false;
        filteredData['tipo-mascota'] = compra.datosAmpliacion.tipo_mascota || '';
        filteredData.intolerancias = compra.datosAmpliacion.intolerancias_input || '';
        filteredData.telefono_emergencia = compra.datosAmpliacion.telefono_emergencia || '';
        filteredData.comentarios_adicionales = compra.datosAmpliacion.comentarios_adicionales || '';
    }

    const rows = fieldsOrder.map(key => {
        let label = '';
        let value = filteredData[key];
        
        switch(key) {
            case 'fecha': label = 'Fecha de compra'; break;
            case 'nombre': label = 'Nombre completo'; break;
            case 'correo': label = 'Correo electrónico'; break;
            case 'acompanantes': label = 'Acompañantes'; break;
            case 'mascotas': label = 'Viaja con mascotas'; break;
            case 'tipo-mascota': label = 'Tipo de mascota'; break;
            case 'intolerancias': label = 'Intolerancias / Alergias'; break;
            case 'telefono_emergencia': label = 'Teléfono de emergencia'; break;
            case 'comentarios_adicionales': label = 'Comentarios adicionales'; break;
        }
        
        // Procesar valores
        if (value === undefined || value === null || value === '') {
            switch(key) {
                case 'acompanantes': value = '0'; break;
                case 'mascotas': value = 'No'; break;
                case 'tipo-mascota': value = 'No especificado'; break;
                case 'intolerancias': value = 'Ninguna'; break;
                case 'telefono_emergencia': value = 'No proporcionado'; break;
                case 'comentarios_adicionales': value = 'Ninguno'; break;
                default: 
                    if (key === 'fecha' || key === 'nombre' || key === 'correo') {
                        return ''; // No mostrar campos obligatorios vacíos
                    }
                    value = 'No especificado';
                    break;
            }
        }
        
        if (typeof value === 'boolean') value = value ? 'Sí' : 'No';
        if (key === 'fecha' && value && value !== 'No especificado') {
            value = new Date(value).toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        return `<tr><td>${label}</td><td>${value}</td></tr>`;
    }).filter(row => row !== '').join('');

    container.innerHTML = `
        <table class="detalle-tabla">
            <tbody>${rows}</tbody>
        </table>
    `;
}

function crearElementoCompra(compra, index) {
    // Agregar datos de ampliación si existen
    if (compra.datosAmpliacion) {
        let ampliacionInfo = '';
        
        if (compra.datosAmpliacion.intolerancias_input && compra.datosAmpliacion.intolerancias_input.trim()) {
            ampliacionInfo += `<p class="ampliacion-info"><strong>Intolerancias:</strong> ${compra.datosAmpliacion.intolerancias_input}</p>`;
        }
        
        if (compra.datosAmpliacion.telefono_emergencia && compra.datosAmpliacion.telefono_emergencia.trim()) {
            ampliacionInfo += `<p class="ampliacion-info"><strong>Tel. emergencia:</strong> ${compra.datosAmpliacion.telefono_emergencia}</p>`;
        }
        
        if (compra.datosAmpliacion.mascotas_chk) {
            ampliacionInfo += `<p class="ampliacion-info"><strong>Con mascotas</strong>`;
            if (compra.datosAmpliacion.tipo_mascota && compra.datosAmpliacion.tipo_mascota.trim()) {
                ampliacionInfo += ` (${compra.datosAmpliacion.tipo_mascota})`;
            }
            ampliacionInfo += `</p>`;
        }
        
        if (ampliacionInfo) {
            // Agregar al HTML del elemento de compra
            const elementoCompra = document.querySelector(`.compra-item[data-index="${index}"]`);
            if (elementoCompra) {
                elementoCompra.insertAdjacentHTML('beforeend', `<div class="info-ampliacion">${ampliacionInfo}</div>`);
            }
        }
    }
}

function mostrarAcompanantesEnPerfil() {
    const compras = JSON.parse(localStorage.getItem('comprasRealizadas') || '[]');
    
    compras.forEach((compra, index) => {
        // Buscar si esta compra tiene acompañantes
        const datosAcompanantes = compra.datosAcompanantes || [];
        const datosAmpliacion = compra.datosAmpliacion || {};
        
        if (datosAcompanantes.length > 0) {
            // Buscar el contenedor de esta compra específica
            const compraElement = document.querySelector(`[data-compra-index="${index}"]`) || 
                                 document.querySelectorAll('.compra-detalle')[index];
            
            if (compraElement) {
                // Crear sección de acompañantes
                const divAcompanantes = document.createElement('div');
                divAcompanantes.className = 'compra-acompanantes';
                
                let htmlAcompanantes = `<h4>Información adicional:</h4>`;
                htmlAcompanantes += `<p><strong>Acompañantes:</strong> ${datosAcompanantes.length}</p>`;
                
                // Mostrar mascotas si las hay
                if (datosAmpliacion.mascotas) {
                    htmlAcompanantes += `<p><strong>Mascotas:</strong> Sí`;
                    if (datosAmpliacion.tipoMascota) {
                        htmlAcompanantes += ` - ${datosAmpliacion.tipoMascota}`;
                    }
                    htmlAcompanantes += `</p>`;
                }
                
                htmlAcompanantes += `<h4>Acompañantes:</h4>`;
                datosAcompanantes.forEach(acompanante => {
                    htmlAcompanantes += `
                        <div class="acompanante-perfil">
                            <p><strong>Acompañante ${acompanante.numero}:</strong> ${acompanante.nombre} (${acompanante.correo})</p>
                        </div>
                    `;
                });
                
                divAcompanantes.innerHTML = htmlAcompanantes;
                compraElement.appendChild(divAcompanantes);
            }
        }
    });
}

// Mostrar datos de acompañantes en la vista detalle (añade filas a la tabla .detalle-tabla)
function mostrarDatosAcompanantesDetalle(compra) {
    // Leer acompañantes desde la compra pasada, si no están ahí intentar múltiples orígenes
    let datosAcompanantes = [];
    try {
        datosAcompanantes = compra && (compra.datosAcompanantes || compra.datosAcompañantes) ? (compra.datosAcompanantes || compra.datosAcompañantes) : [];
    } catch (e) { datosAcompanantes = []; }

    if ((!datosAcompanantes || datosAcompanantes.length === 0)) {
        try {
            datosAcompanantes = JSON.parse(localStorage.getItem('datosAcompanantes') || sessionStorage.getItem('datosAcompanantes') || '[]');
        } catch (e) { datosAcompanantes = []; }
    }

    // Normalizar ampliación
    let datosAmpliacion = {};
    try {
        datosAmpliacion = compra && compra.datosAmpliacion ? compra.datosAmpliacion : JSON.parse(localStorage.getItem('datosAmpliacion') || sessionStorage.getItem('datosAmpliacion') || '{}');
    } catch (e) { datosAmpliacion = {}; }

    if (!Array.isArray(datosAcompanantes) || datosAcompanantes.length === 0) return;

    // Localizar tbody de la tabla de detalle
    const tbody = document.querySelector('#detalle-compra .detalle-tabla tbody') || document.querySelector('.detalle-tabla tbody');
    if (!tbody) return;

    // No añadimos aquí el resumen ni las filas de ampliación (esas ya las genera renderDetalleCompra).
    // Solo añadimos filas individuales por cada acompañante si no existen aún.
    datosAcompanantes.forEach((acompanante, i) => {
        const num = acompanante.numero || (i + 1);
        const nombre = (acompanante.nombre || acompanante.name || '').trim();
        const correo = (acompanante.correo || acompanante.email || '').trim();
        if (!nombre && !correo) return;
        const valor = correo ? `${nombre} (${correo})` : nombre;

        // Comprobar si ya existe una fila para este acompañante
        const selector = Array.from(tbody.querySelectorAll('tr')).find(tr => {
            const td = tr.querySelector('td');
            if (!td) return false;
            return td.textContent && td.textContent.trim().startsWith(`Acompañante ${num}`);
        });
        if (selector) return; // ya existe

        // Comprobar si este acompañante ya fue marcado como añadido en localStorage
        let addedSet = {};
        try { addedSet = JSON.parse(localStorage.getItem('acompanantesAgregados') || '{}'); } catch (e) { addedSet = {}; }
        const correoLower = (correo || '').toLowerCase();
        if (correoLower && addedSet[correoLower]) {
            // Mostrar texto de añadido en lugar de botón
            tbody.insertAdjacentHTML('beforeend', `<tr class="acompanante-row"><td>Acompañante ${num}</td><td>${valor} <span class="anadido-correcto">Añadido correctamente</span></td></tr>`);
        } else {
            // Insertar fila incluyendo botón para "Añadir compañero"
            tbody.insertAdjacentHTML('beforeend', `<tr class="acompanante-row"><td>Acompañante ${num}</td><td>${valor} <button type="button" class="btn-anadir-acompanante" data-num="${num}">Añadir compañero</button></td></tr>`);
        }
    });
}