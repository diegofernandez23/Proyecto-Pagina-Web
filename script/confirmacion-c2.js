// ===================================================================
// FUNCIÓN DE UTILIDAD: Parsear el precio a número entero
// ===================================================================
function parsePrice(priceString) {
    // Elimina el símbolo de euro (€) y el punto de mil (si existe)
    const cleanPrice = priceString.replace('€', '').replace('.', '').trim();
    return parseInt(cleanPrice, 10);
}

// PACK MAPPING (Datos base por si falla la traducción)
const packMapping = {
    brasil: { titulo: "Ritmo y Naturaleza por Brasil", imagen: "imagenes/brasil.jpg", precio: "899€", textoImagen: "Vive la energía de Brasil entre playas paradisíacas, selvas amazónicas y cultura vibrante", descripcion:  "Un recorrido por lo mejor de Brasil: Río de Janeiro y sus playas, la increíble biodiversidad del Amazonas, y la cultura vibrante del país con música, baile y gastronomía. Ideal para quienes buscan mezcla de naturaleza y fiesta." },
    francia: { titulo: "Arte por las Calles Francesas", imagen: "imagenes/francia.jpg", precio: "1.099€", textoImagen: "Recorre París, la Provenza y la Riviera francesa entre arte, cultura y sabores inolvidables", descripcion: "Descubre la riqueza cultural de Francia: pasea por las calles de París, visita museos emblemáticos como el Louvre, disfruta de la cocina francesa en mercados locales y explora la belleza de la Provenza y la Costa Azul. Un viaje pensado para amantes del arte, la historia y la gastronomía." },
    italia: { titulo: "Descubre la Belleza de Italia", imagen: "imagenes/italia.jpg", precio: "987€", textoImagen: "Explora Roma, Florencia y la Toscana en un viaje lleno de historia, arte y gastronomía auténtica", descripcion: "Recorre ciudades históricas como Roma y Florencia, disfruta de la auténtica pasta, pizza y vinos locales, y sumérgete en tradiciones y monumentos que hacen de Italia un país único. Este viaje combina aventura, historia y placer culinario en una experiencia inolvidable para quienes quieren explorar lo mejor del país de forma auténtica." },
    japon: { titulo: "Japón, Tradición y Modernidad", imagen: "imagenes/japon.jpg", precio: "850€", textoImagen: "Descubre Tokio, Kioto y el Monte Fuji en una fascinante mezcla de tradición y modernidad.", descripcion: "Sumérgete en la cultura japonesa y descubre sus tradiciones milenarias: comtempla la majestuosidad del Monte Fuji, explora los templos ancestrales de Kioto y disfruta de la vibrante vida urbana de Tokio. Este viaje de 11 días te llevará a través de una mezcla fascinante de historia, tecnología y naturaleza, ofreciéndote una experiencia inolvidable en el corazón de Japón." },
    marruecos: { titulo: "Colores y Aromas de Marruecos", imagen: "imagenes/marruecos.jpg", precio: "799€", textoImagen: "Aventúrate por Marrakech, el desierto del Sáhara y las montañas del Atlas en una experiencia única", descripcion: "Déjate llevar por los sentidos en un viaje inolvidable a tráves de mundo bereber: explora los paisajes desérticos y las montañas del Atlas, descubre la hospitalidad de sus pueblos, sus colores, aromas y tradiciones ancestrales. Una experiencia que combina aventura, cultura y autenticidad en cada rincón de Marruecos." },
    noruega: { titulo: "Paisajes de Ensueño en Noruega", imagen: "imagenes/noruega.jpg", precio: "1.495€", textoImagen: "Navega por los fiordos noruegos y contempla las auroras boreales en paisajes de ensueño.", descripcion: "Atrévete a explorar la magia de los majestuosos fiordos noruegos, descubre la fascinante historia vikinga y sumérgete en paisajes naturales que parecen sacados de un sueño. Este viaje combina aventura, cultura escandinava y la tranquilidad del norte, ofreciendo una experiencia inolvidable para quienes buscan conectar con la naturaleza y la historia de una región única en el mundo." }
};

// Función para renderizar el pack (solo el bloque de la izquierda) INTEGRADO CON TRADUCCIÓN
function renderPack(packId) {
    const packInfo = document.querySelector('.pack-info');
    if (!packInfo) return;

    // Detectar idioma seleccionado (sincronizado con traductor.js)
    const lang = localStorage.getItem('idioma_seleccionado') || 'ES';
    // Obtener diccionario global si existe
    const t = (typeof textos !== 'undefined') ? textos[lang] : null;

    const data = packMapping[packId];
    if (!data) { packInfo.innerHTML = '<p>Pack no especificado</p>'; return; }
    
    // Variables traducibles (usamos las claves de traductor.js si existen)
    let titulo = data.titulo;
    let descripcion = data.descripcion;
    let textoImagen = data.textoImagen;
    let labelDesc = "Descripción del pack:";

    if (t) {
        // Mapeo inteligente a las claves de traductor.js
        if (t[`titulo_${packId}`]) titulo = t[`titulo_${packId}`];
        if (t[`texto_pack_${packId}`]) descripcion = t[`texto_pack_${packId}`];
        if (t[`descripcion_${packId}`]) textoImagen = t[`descripcion_${packId}`]; // Usamos la descripción corta como texto de imagen
        if (t['descripcion_pack']) labelDesc = t['descripcion_pack'];
    }

    packInfo.innerHTML = `
        <div class="pack-intro">
            <div class="pack-imagen">
                <img src="${data.imagen}" alt="${titulo}">
                <div class="pack-header">
                    <h2>${titulo}</h2>
                    <span class="precio">${data.precio}</span>
                </div>
                <p>${textoImagen}</p>
                <div id="valoracion-pack" class="consejo-valoracion solo-lectura"></div>
            </div>      
        </div>
        <div class="pack-descripcion">
            <h3>${labelDesc}</h3>
            <p>${descripcion}</p>
        </div>
    `;
}

// ===================================================================
// INICIO DE LA LÓGICA PRINCIPAL AL CARGAR EL DOCUMENTO
// ===================================================================
document.addEventListener('DOMContentLoaded', function() {
    sessionStorage.setItem('enPaginaC', 'true');
    
    // --- Configuración de Traducción ---
    const lang = localStorage.getItem('idioma_seleccionado') || 'ES';
    const t = (typeof textos !== 'undefined') ? textos[lang] : null;
    // Helper seguro: busca la clave, si no existe devuelve el texto por defecto
    const trans = (key, def) => (t && t[key]) ? t[key] : def;
    // Helper para limpiar los dos puntos extra (ej: "Nombre:" -> "Nombre")
    const cleanLabel = (text) => text.replace(/:$/, '').trim();

    // 1. LECTURA Y VALIDACIÓN DE DATOS
    let datosFinal = {};
    try {
        const raw = sessionStorage.getItem('compraPasoFinal') || sessionStorage.getItem('compraPaso1');
        if (raw) datosFinal = JSON.parse(raw);
    } catch (e) { console.warn('Error leyendo datos de compra', e); }

    // Validación de mismatch
    try {
        const usuarioActual = localStorage.getItem('usuarioActual');
        if (usuarioActual && datosFinal.correo) {
            const rawUser = localStorage.getItem(usuarioActual);
            if (rawUser) {
                const parsed = JSON.parse(rawUser);
                if (parsed.email && parsed.email.toLowerCase() === datosFinal.correo.toLowerCase()) {
                    sessionStorage.removeItem('compraEmailMismatch');
                }
            }
        } else {
            sessionStorage.removeItem('compraEmailMismatch');
        }
    } catch (e) { sessionStorage.removeItem('compraEmailMismatch'); }


    // 2. CÁLCULO DE PRECIO Y PERSONAS
    const packData = packMapping[datosFinal.pack];
    let precioTotal = 0;
    let totalPersonas = 0;

    if (packData) {
        const precioUnitario = parsePrice(packData.precio);
        const numAcompanantes = parseInt(localStorage.getItem('numAcompanantes') || '0', 10);
        totalPersonas = numAcompanantes + 1;
        const costoSeguro = parseInt(sessionStorage.getItem('costoSeguro') || '0', 10);

        precioTotal = (precioUnitario * totalPersonas) + (totalPersonas * costoSeguro);

        datosFinal.precioTotal = precioTotal;
        datosFinal.totalPersonas = totalPersonas;
        datosFinal.costoSeguro = costoSeguro;
    }

    // --- Renderizado del Pack (Bloque Izquierdo) ---
    renderPack(datosFinal.pack);

    // Renderizar valoración
    try {
        const usuarioActual = localStorage.getItem('usuarioActual') || null;
        if (typeof ValoracionConsejo !== 'undefined' && ValoracionConsejo && datosFinal.pack) {
            ValoracionConsejo.renderizarValoracionGlobal('valoracion-pack', 'pack_' + datosFinal.pack);
        }
    } catch (e) {}

    // 3. RENDER DEL RESUMEN (Bloque Derecho)
    const resumen = document.getElementById('resumen-datos');
    const datosAmpliacion = JSON.parse(localStorage.getItem('datosAmpliacion') || '{}');
    const datosAcompanantes = JSON.parse(localStorage.getItem('datosAcompanantes') || '[]');

    if (resumen) {
        // --- Aviso de Mismatch ---
        if (sessionStorage.getItem('compraEmailMismatch')) {
            const aviso = document.createElement('div');
            aviso.className = 'compra-aviso';
            aviso.textContent = 'El correo con el que ha iniciado sesión no coincide con el correo introducido en el formulario de compra.';
            resumen.parentNode.insertBefore(aviso, resumen);
            sessionStorage.removeItem('compraEmailMismatch');
        }

        // A. Renderizar Datos Principales (TRADUCIDO)
        const fieldsOrder = ['nombre','correo','tarjeta','tarjeta-num','titular'];
        const normalContainer = document.createElement('div');
        normalContainer.className = 'datos-normales';

        fieldsOrder.forEach(function(key) {
            if (!datosFinal.hasOwnProperty(key)) return;
            let label = key;
            
            // TRADUCCIÓN: Usamos las claves de traductor.js
            switch(key) {
                case 'tarjeta-num': label = cleanLabel(trans('num_tarjeta', 'Número de tarjeta')); break;
                case 'tarjeta': label = cleanLabel(trans('tipo_tarjeta', 'Tipo de tarjeta')); break;
                case 'nombre': label = cleanLabel(trans('nombre_completo', 'Nombre completo')); break;
                case 'correo': label = cleanLabel(trans('correo', 'Correo electrónico')); break;
                case 'titular': label = cleanLabel(trans('titular_tarjeta', 'Titular de la tarjeta')); break;
                default: return;
            }
            
            let value = datosFinal[key];
            if (value === undefined || value === null || value === '') return;

            const infoDiv = document.createElement('div');
            infoDiv.className = 'acompanante-info';
            infoDiv.innerHTML = `<p><strong>${label}: </strong>${value}</p>`;
            normalContainer.appendChild(infoDiv);
        });

        // B. Renderizar TOTALES (TRADUCIDO)
        if (totalPersonas > 0) {
            const personasDiv = document.createElement('div');
            personasDiv.className = 'acompanante-info';
            const labelPersonas = cleanLabel(trans('total_personas', 'Total de personas')); // Fallback si no está en dict
            personasDiv.innerHTML = `<p><strong>${labelPersonas}: </strong>${totalPersonas}</p>`;
            normalContainer.appendChild(personasDiv);
        }
        
        if (precioTotal > 0) {
            const totalDiv = document.createElement('div');
            totalDiv.className = 'acompanante-info';
            totalDiv.style.marginTop = '15px';
            totalDiv.style.borderTop = '1px solid #ccc';
            totalDiv.style.paddingTop = '10px';
            const labelPrecio = cleanLabel(trans('precio_total', 'Precio Total')); // Fallback
            totalDiv.innerHTML = `
                <p><strong>${labelPrecio}: </strong><span style="font-size: 1.2em; color: #1e2e1f; font-weight: bold;">${precioTotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span></p>
            `;
            normalContainer.appendChild(totalDiv);
        }

        // Limpiar y añadir el contenedor principal
        while (resumen.firstChild) resumen.removeChild(resumen.firstChild);
        resumen.appendChild(normalContainer);

        // C. Renderizar Información Adicional (TRADUCIDO)
        if (Object.keys(datosAmpliacion).length > 0) {
            let htmlAmpliacion = '';
            
            const labelMascotas = cleanLabel(trans('mascotas', 'Mascotas'));
            const txtSi = trans('si', 'Sí');
            const txtNo = trans('no', 'No');
            const valMascotas = datosAmpliacion.mascotas ? txtSi : txtNo;

            htmlAmpliacion += `<p><strong>${labelMascotas}:</strong> ${valMascotas}`;
            if (datosAmpliacion.tipoMascota) htmlAmpliacion += ` - ${datosAmpliacion.tipoMascota}`;
            htmlAmpliacion += `</p>`;
            
            if (datosAmpliacion.intolerancias) {
                const label = cleanLabel(trans('alergias', 'Intolerancias/Alergias'));
                htmlAmpliacion += `<p><strong>${label}:</strong> ${datosAmpliacion.intolerancias}</p>`;
            }
            if (datosAmpliacion.telefonoEmergencia) {
                const label = cleanLabel(trans('telefono_contacto', 'Teléfono emergencia'));
                htmlAmpliacion += `<p><strong>${label}:</strong> ${datosAmpliacion.telefonoEmergencia}</p>`;
            }
            if (datosAmpliacion.comentarios) {
                const label = cleanLabel(trans('coment_adicional', 'Comentarios'));
                htmlAmpliacion += `<p><strong>${label}:</strong> ${datosAmpliacion.comentarios}</p>`;
            }
            
            if (htmlAmpliacion) {
                const divAmpliacion = document.createElement('div');
                divAmpliacion.className = 'datos-ampliacion';
                const tituloInfo = trans('info_adicional', 'Información adicional');
                divAmpliacion.innerHTML = `<h3>${tituloInfo}:</h3>${htmlAmpliacion}`;
                resumen.appendChild(divAmpliacion);
            }
        }
        
        // D. Renderizar Acompañantes (TRADUCIDO)
        const numAcompanantesStored = parseInt(localStorage.getItem('numAcompanantes') || '0', 10) || 0;
        const validAcompanantes = Array.isArray(datosAcompanantes)
            ? datosAcompanantes.filter(a => a && ((a.nombre && a.nombre.trim()) || (a.correo && a.correo.trim()))) : [];

        if (numAcompanantesStored >= 1 && validAcompanantes.length > 0) {
            const divAcompanantes = document.createElement('div');
            divAcompanantes.className = 'datos-acompanantes';
            const tituloAcomp = cleanLabel(trans('acompanante', 'Acompañantes'));
            let htmlAcompanantes = `<h3>${tituloAcomp}:</h3>`;

            const labelNombre = cleanLabel(trans('nombre', 'Nombre'));
            const labelCorreo = cleanLabel(trans('correo', 'Correo'));

            const labelAcompSingular = cleanLabel(trans('acompanante_singular', 'Acompañante'));

            for (let i = 0; i < Math.min(numAcompanantesStored, datosAcompanantes.length); i++) {
                const acompanante = datosAcompanantes[i] || {};
                const numero = acompanante.numero || (i + 1);
                const nombre = (acompanante.nombre || '').trim() || '—';
                const correo = (acompanante.correo || '').trim() || '—';

                if (nombre === '—' && correo === '—') continue;

                htmlAcompanantes += `
                    <div class="acompanante-info">
                        <h4>${labelAcompSingular} ${numero}:</h4>
                        <p><strong>${labelNombre}:</strong> ${nombre}</p>
                        <p><strong>${labelCorreo}:</strong> ${correo}</p>
                    </div>
                `;
            }

            if (htmlAcompanantes !== `<h3>${tituloAcomp}:</h3>`) {
                divAcompanantes.innerHTML = htmlAcompanantes;
                resumen.appendChild(divAcompanantes);
            }
        }
    }

    // 4. LÓGICA DE BOTONES Y HANDLERS
    const btnModificar = document.getElementById('modificar');
    if (btnModificar) {
        btnModificar.addEventListener('click', function() {
            sessionStorage.setItem('compraPrefill', 'true');
            window.location.href = 'pago.html'; 
        });
    }

    const btnConfirm = document.getElementById('confirmar');
    if (btnConfirm) {
        btnConfirm.addEventListener('click', function() {
            // Verificar si hay usuario logueado
            const usuarioActual = localStorage.getItem('usuarioActual');
            
            if (!usuarioActual) {
                window.location.href = 'iniciar-sesion.html';
                return;
            }

            // Verificar si los correos coinciden
            try {
                const compraRaw = sessionStorage.getItem('compraPasoFinal') || sessionStorage.getItem('compraPaso1');
                if (compraRaw) {
                    const compra = JSON.parse(compraRaw);
                    let userEmail = null;
                    try {
                        const rawUser = localStorage.getItem(usuarioActual);
                        if (rawUser) {
                            const parsed = JSON.parse(rawUser);
                            userEmail = parsed.email || null;
                        }
                    } catch (e) {}

                    if (compra && compra.correo && userEmail && compra.correo.toLowerCase() !== userEmail.toLowerCase()) {
                        localStorage.removeItem('usuarioActual');
                        sessionStorage.setItem('compraEmailMismatch', '1');
                        window.location.href = 'iniciar-sesion.html';
                        return;
                    }
                }
            } catch (err) {}
            
            // Obtener datos finales y guardar
            let datosFinales = { ...datosFinal }; // Clonar
            if (!datosFinales.fecha) datosFinales.fecha = new Date().toISOString();
            
            // Recalcular precios finales por seguridad
            const packDataFinal = packMapping[datosFinales.pack];
            if (packDataFinal) {
                const precioUnitario = parsePrice(packDataFinal.precio);
                const numAcompanantes = parseInt(localStorage.getItem('numAcompanantes') || '0', 10);
                const totalPersonas = numAcompanantes + 1;
                const costoSeguro = parseInt(sessionStorage.getItem('costoSeguro') || '0', 10);
                const precioTotal = (precioUnitario * totalPersonas) + (totalPersonas * costoSeguro);

                datosFinales.precioTotal = precioTotal;
                datosFinales.totalPersonas = totalPersonas;
                datosFinales.costoSeguro = costoSeguro;
            }

            datosFinales.datosAcompanantes = datosAcompanantes;
            datosFinales.datosAmpliacion = datosAmpliacion;

            // Guardar en localStorage
            try {
                let historial = JSON.parse(localStorage.getItem('historialCompras') || '[]');
                historial.push(datosFinales);
                localStorage.setItem('historialCompras', JSON.stringify(historial));
                
                const purchasesKey = 'purchases_' + usuarioActual;
                let userPurchases = JSON.parse(localStorage.getItem(purchasesKey) || '[]');
                userPurchases.push(datosFinales);
                localStorage.setItem(purchasesKey, JSON.stringify(userPurchases));
                
                const userData = JSON.parse(localStorage.getItem(usuarioActual) || '{}');
                if (!userData.compras) userData.compras = [];
                userData.compras.push(datosFinales);
                localStorage.setItem(usuarioActual, JSON.stringify(userData));
                
            } catch (e) {
                alert('Error al guardar la compra');
                return;
            }
            
            sessionStorage.setItem('reservation', JSON.stringify(datosFinales));
            sessionStorage.removeItem('compraPaso1');
            sessionStorage.removeItem('compraPasoFinal');
            sessionStorage.removeItem('enPaginaC');
            
            window.location.href = 'info-compra.html';
        });
    }
});