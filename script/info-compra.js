// ===================================================================
// LÓGICA DE TRADUCCIÓN Y RENDERIZADO PARA INFO-COMPRA
// ===================================================================

// Helper para traducir de forma segura
function getTranslation(key, defaultText) {
    const lang = localStorage.getItem('idioma_seleccionado') || 'ES';
    if (typeof textos !== 'undefined' && textos[lang] && textos[lang][key]) {
        return textos[lang][key];
    }
    return defaultText;
}

function renderReservation(res) {
    const container = document.getElementById('resumenReserva');
    const msgError = getTranslation('mensaje_error_reserva', 'No se encontró información de la reserva. Vuelve a realizar el proceso.');
    
    if (!res || Object.keys(res).length === 0) {
        container.innerHTML = `<p class="mensaje-error">${msgError}</p>`;
        return;
    }

    // Detectar idioma para traducir el título del pack si es posible
    const lang = localStorage.getItem('idioma_seleccionado') || 'ES';
    const t = (typeof textos !== 'undefined') ? textos[lang] : null;

    // Títulos de Packs (Fallback en español si no hay traducción específica)
    // Lo ideal es que 'packTitles' también sea dinámico
    let packName = res.pack; 
    // Intenta buscar el título traducido usando la clave 'titulo_packID'
    if (t && t[`titulo_${res.pack}`]) {
        packName = t[`titulo_${res.pack}`];
    } else {
        // Fallback manual si no está en traductor.js
        const packTitles = {
            'brasil': 'Ritmo y Naturaleza por Brasil',
            'francia': 'Arte por las Calles Francesas',
            'italia': 'Descubre la Belleza de Italia',
            'japon': 'Japón, Tradición y Modernidad',
            'marruecos': 'Colores y Aromas de Marruecos',
            'noruega': 'Paisajes de Ensueño en Noruega'
        };
        if (packTitles[res.pack]) packName = packTitles[res.pack];
    }

    // Filtrar datos sensibles
    const excludeFields = ['tarjeta','tarjeta-num','titular','fecha-caducidad','cvv','politica-privacidad','acepta-politica'];

    const fieldsOrder = [
        'pack', 'nombre', 'correo', 'acompanantes',
        'totalPersonas', 'costoSeguro', 'precioTotal',
        'mascotas', 'tipo-mascota', 'intolerancias'
    ];

    const filteredData = Object.keys(res)
        .filter(key => !excludeFields.includes(key))
        .reduce((obj, key) => { obj[key] = res[key]; return obj; }, {});

    const rows = fieldsOrder
        .filter(key => filteredData.hasOwnProperty(key) && filteredData[key] !== '' && filteredData[key] != null)
        .map(key => {
            let label = '';
            let value = filteredData[key];
            
            // TRADUCCIÓN DE ETIQUETAS
            switch(key) {
                case 'pack': label = getTranslation('pack_seleccionado', 'Pack seleccionado'); break;
                case 'nombre': label = getTranslation('nombre_completo', 'Nombre completo'); break;
                case 'correo': label = getTranslation('correo_electronico', 'Correo electrónico'); break;
                case 'acompanantes': label = getTranslation('acompanantes', 'Acompañantes'); break;
                case 'mascotas': label = getTranslation('viaja_mascotas', 'Viaja con mascotas'); break;
                case 'tipo-mascota': label = getTranslation('tipo_mascota', 'Tipo de mascota'); break;
                case 'intolerancias': label = getTranslation('intolerancias', 'Intolerancias / Alergias'); break;
                case 'totalPersonas': label = getTranslation('numero_personas', 'Número de personas'); break;
                case 'costoSeguro': 
                    label = getTranslation('seguro_persona', 'Seguro (por persona)'); 
                    if(value > 0) value = value + '€';
                    break;
                case 'precioTotal': 
                    label = getTranslation('precio_total', 'Precio Total'); 
                    value = parseFloat(value).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
                    break;
            }
            
            // Traducir valores booleanos (Sí/No)
            if (typeof value === 'boolean' || value === 'true' || value === 'false') {
                const valBool = (value === true || value === 'true');
                value = valBool ? getTranslation('si', 'Sí') : getTranslation('no', 'No');
            }
            
            // Asignar nombre del pack traducido
            if (key === 'pack') {
                value = packName;
                // Añadir precio por persona si lo tienes disponible o dejar solo el nombre
                // value += ...
            }

            if (key === 'precioTotal') {
                return `<tr class="fila-precio-total"><td><strong>${label}</strong></td><td><strong>${value}</strong></td></tr>`;
            }
            return `<tr><td>${label}</td><td>${value}</td></tr>`;
        }).join('');

    const msgExito = getTranslation('mensaje_exito_compra', 'Tu compra ha sido confirmada. A continuación se muestran los datos registrados:');

    container.innerHTML = `
        <p class="mensaje-info">${msgExito}</p>
        <table class="resumen-tabla">
        <tbody>${rows}</tbody>
        </table>
    `;
}

function mostrarDetallesCompra(compra) {
    const storedAmpliacion = compra && compra.datosAmpliacion ? compra.datosAmpliacion : null;
    let ampliacion = {};

    if (storedAmpliacion && Object.keys(storedAmpliacion).length > 0) {
        ampliacion = storedAmpliacion;
    } else {
        try {
            const s = JSON.parse(sessionStorage.getItem('datosAmpliacion') || 'null');
            if (s && Object.keys(s).length > 0) ampliacion = s;
        } catch (e) { }
    }

    const intolerancias = ampliacion.intolerancias || '';
    const telefonoEmergencia = ampliacion.telefonoEmergencia || '';
    const comentarios = ampliacion.comentarios || '';

    if (Object.keys(ampliacion).length > 0) {
        const container = document.getElementById('resumenReserva');
        let tbody = null;
        if (container) tbody = container.querySelector('.resumen-tabla tbody');

        const rows = [];
        if (telefonoEmergencia && String(telefonoEmergencia).trim()) {
            rows.push({ label: getTranslation('telefono_emergencia', 'Teléfono de emergencia'), value: telefonoEmergencia });
        }
        if (comentarios && String(comentarios).trim()) {
            rows.push({ label: getTranslation('comentarios_adicionales', 'Comentarios adicionales'), value: comentarios });
        }

        if (tbody && rows.length > 0) {
            const html = rows.map(r => `<tr><td>${r.label}</td><td>${r.value}</td></tr>`).join('');
            tbody.insertAdjacentHTML('beforeend', html);
        }
    }
}

function mostrarDatosAcompanantes() {
    let datosAcompanantes = [];
    try {
        datosAcompanantes = JSON.parse(localStorage.getItem('datosAcompanantes') || sessionStorage.getItem('datosAcompanantes') || '[]');
    } catch (e) { datosAcompanantes = []; }

    if (Array.isArray(datosAcompanantes) && datosAcompanantes.length > 0) {
        const container = document.getElementById('resumenReserva');
        let tbody = null;
        if (container) tbody = container.querySelector('.resumen-tabla tbody');

        const labelAcomp = getTranslation('acompanante_singular', 'Acompañante');
        const labelNombre = getTranslation('nombre_completo', 'Nombre'); // Usamos nombre completo o crear clave 'nombre'
        const labelCorreo = getTranslation('correo_electronico', 'Correo');

        const rows = [];
        datosAcompanantes.forEach(acompanante => {
            const num = acompanante.numero || '';
            const nombre = (acompanante.nombre || '').trim();
            const correo = (acompanante.correo || '').trim();
            
            if (nombre) rows.push({ label: `${labelAcomp} ${num} - ${labelNombre}`, value: nombre });
            if (correo) rows.push({ label: `${labelAcomp} ${num} - ${labelCorreo}`, value: correo });
        });

        if (tbody && rows.length > 0) {
            const html = rows.map(r => `<tr><td>${r.label}</td><td>${r.value}</td></tr>`).join('');
            tbody.insertAdjacentHTML('beforeend', html);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Intentar renderizar
    try {
        const raw = sessionStorage.getItem('reservation');
        const reservation = raw ? JSON.parse(raw) : null;
        
        renderReservation(reservation);
        mostrarDetallesCompra(reservation);

        if (reservation && (parseInt(reservation.acompanantes) >= 1 || (reservation.totalPersonas && reservation.totalPersonas > 1))) {
            mostrarDatosAcompanantes();
        }
        
        // Limpiar datos
        if (raw) {
            sessionStorage.removeItem('reservation');
            sessionStorage.removeItem('compraPasoFinal');
            sessionStorage.removeItem('compraPaso1');
        }
    } catch (err) {
        console.error(err);
    }

    // Botones
    const btnInicio = document.getElementById('btn-inicio');
    if(btnInicio) btnInicio.addEventListener('click', function() { window.location.href = 'index.html'; });

    const btnPerfil = document.getElementById('btn-perfil');
    if(btnPerfil) btnPerfil.addEventListener('click', function() { window.location.href = 'perfil.html'; });
});