document.addEventListener('DOMContentLoaded', function() {
    const datosGuardados = sessionStorage.getItem('compraPaso1');
    const form = document.getElementById('form-ampliacion');

    // Función para auto-expandir inputs
    function autoExpandInput(input) {
        input.style.height = 'auto';
        input.style.height = Math.max(40, input.scrollHeight) + 'px';
    }

    // Aplicar auto-expansión a los inputs específicos
    const expandableInputs = ['intolerancias_input', 'comentarios_adicionales'];
    
    expandableInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                autoExpandInput(this);
            });
        }
    });

    // NO restaurar datos de ampliación - siempre empezar limpio
    // Eliminar toda la lógica de restauración de datosAmpliacion

    if (datosGuardados) {
        const datos = JSON.parse(datosGuardados);

        // si hay un pack asociado, renderizar la columna izquierda igual que en la versión-c correspondiente
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

        const packActual = datos.pack;

        function renderPack(packId) {
            if (!packId) return;
            const data = packMapping[packId];
            if (!data) return;
            const packInfo = document.querySelector('.pack-info');
            if (!packInfo) return;
            packInfo.innerHTML = `
                <div class="pack-intro">
                    <div class="pack-imagen">
                        <img src="${data.imagen}" alt="${data.titulo}">
                        <div class="pack-header">
                            <h2>${data.titulo}</h2>
                            <span class="precio">${data.precio}</span>
                        </div>
                        <p>${data.textoImagen}</p>
                        <div id="valoracion-pack-${packId}" class="consejo-valoracion solo-lectura" style="margin:8px 0 0 10px;"></div>
                    </div>      
                </div>

                <div class="pack-descripcion">
                    <h3>Descripción del pack:</h3>
                    <p>${data.descripcion}</p>
                </div>
            `;
        }

        // renderiza según el pack enviado desde el paso 1
        renderPack(datos['pack']);

        // Renderizar la valoración del pack (solo lectura) si está disponible
        const idContenedorValoracion = 'valoracion-pack-' + packActual; // Ej: 'valoracion-pack-japon'
        const idConsejoValoracion = 'pack_' + packActual;             // Ej: 'pack_japon'

        const contenedorValoracion = document.getElementById(idContenedorValoracion);
        if (contenedorValoracion && typeof ValoracionConsejo !== 'undefined') {
            try {
                // Renderizar la valoración global en el nuevo contenedor
                ValoracionConsejo.renderizarValoracionGlobal(idContenedorValoracion, idConsejoValoracion);
            } catch (e) {
                console.warn('Error al renderizar la valoración en ampliación:', e);
            }
        }

        // rellenar campos de revisión (si existen)
        function setIf(id, value) {
            const el = document.getElementById(id);
            if (!el) return;
            el.value = value !== undefined ? value : '';
        }

        setIf('nombre_rev', datos['nombre'] || '');
        setIf('correo_rev', datos['correo'] || '');
        setIf('tarjeta_rev', datos['tarjeta'] || '');
        setIf('tarjeta_num_rev', datos['tarjeta-num'] || '');
        setIf('titular_rev', datos['titular'] || '');
        setIf('fecha_rev', datos['fecha-caducidad'] || '');
        setIf('cvv_rev', datos['cvv'] || '');
        // si en algún caso vinieran datos de acompañantes/mascotas/intolerancias del paso 1, rellenar la vista
        setIf('acompanantes_rev', datos['acompanantes'] || '0');
        const mascotasText = datos['mascotas'] ? (datos['tipo-mascota'] ? ('Sí - ' + datos['tipo-mascota']) : 'Sí') : 'No';
        setIf('mascotas_rev', mascotasText);
        setIf('intolerancias_rev', datos['intolerancias'] || '');

        // rellenar también los campos editables de la ampliación si existen
        const acompInput = document.getElementById('acompanantes_input');
        if (acompInput && datos['acompanantes'] !== undefined) acompInput.value = datos['acompanantes'];

        const mascotasChk = document.getElementById('mascotas_chk');
        const tipoMascotaInput = document.getElementById('tipo_mascota');
        if (mascotasChk) mascotasChk.checked = !!datos['mascotas'];
        if (tipoMascotaInput && datos['tipo-mascota']) tipoMascotaInput.value = datos['tipo-mascota'];

        const intoleranciasInput = document.getElementById('intolerancias_input');
        if (intoleranciasInput && datos['intolerancias']) intoleranciasInput.value = datos['intolerancias'];
    }

    // volver atrás: regresar a la versión-c correspondiente
    const botonVolver = document.getElementById('volver');
    if (botonVolver) {
        botonVolver.addEventListener('click', function() {
            // NO guardar datos - solo volver
            // resto del código de volver sin guardar...
            try {
                const paso1Raw = sessionStorage.getItem('compraPaso1');
                if (paso1Raw) {
                    const paso1 = JSON.parse(paso1Raw);
                    const pack = paso1.pack;
                    if (pack) {
                        // mapping pack -> filename
                        const filename = {
                            brasil: 'NUEVO-version-c-brasil.html',
                            francia: 'NUEVO-version-c-francia.html',
                            italia: 'NUEVO-version-c-italia.html',
                            japon: 'NUEVO-version-c-japon.html',
                            marruecos: 'NUEVO-version-c-marruecos.html',
                            noruega: 'NUEVO-version-c-noruega.html'
                        }[pack];
                        if (filename) {
                            // marcar que venimos de la ampliación para permitir rellenar los campos
                            try {
                                sessionStorage.setItem('compraPrefill', 'true');
                            } catch (err) {
                                console.warn('No se pudo establecer marca de prefill:', err);
                            }
                            window.location.href = filename;
                            return;
                        }
                    }
                }
            } catch (e) {
                console.warn('Error leyendo pack para volver:', e);
            }
            // fallback
            window.history.back();
        });
    }

    // en el envío final validamos campos y combinamos datos
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const datosAmpliacion = {};
            
            // Recoger todos los datos del formulario de ampliación
            datosAmpliacion.acompanantes = formData.get('acompanantes') || '0';
            datosAmpliacion.mascotas_chk = formData.get('mascotas') === 'on';
            datosAmpliacion.tipo_mascota = formData.get('tipo-mascota') || '';
            datosAmpliacion.intolerancias_input = formData.get('intolerancias') || '';
            datosAmpliacion.telefono_emergencia = formData.get('telefono_emergencia') || '';
            datosAmpliacion.comentarios_adicionales = formData.get('comentarios_adicionales') || '';
            
            // Validar número de acompañantes (0-7)
            const numAcompanantes = parseInt(datosAmpliacion.acompanantes);
            if (isNaN(numAcompanantes) || numAcompanantes < 0 || numAcompanantes > 7) {
                return; // Bloquear envío si el número no es válido
            }
            
            // Verificar que se aceptan los términos
            if (!formData.get('acepto_terminos')) {
                return; // Bloquear envío si no se aceptan términos
            }
            
            // Combinar con datos del paso 1
            let datosCombinados = {};
            try {
                const datosPaso1 = sessionStorage.getItem('compraPaso1');
                if (datosPaso1) {
                    datosCombinados = JSON.parse(datosPaso1);
                }
            } catch (e) {
                console.error('Error leyendo datos paso 1:', e);
            }
            
            // Agregar datos de ampliación
            datosCombinados.datosAmpliacion = datosAmpliacion;
            
            // También agregar los campos directamente al objeto principal para compatibilidad
            datosCombinados.acompanantes = datosAmpliacion.acompanantes;
            datosCombinados.mascotas = datosAmpliacion.mascotas_chk;
            datosCombinados['tipo-mascota'] = datosAmpliacion.tipo_mascota;
            datosCombinados.intolerancias = datosAmpliacion.intolerancias_input;
            datosCombinados.telefono_emergencia = datosAmpliacion.telefono_emergencia;
            datosCombinados.comentarios_adicionales = datosAmpliacion.comentarios_adicionales;
            
            // Agregar fecha de compra
            datosCombinados.fecha = new Date().toISOString();
            
            // Guardar datos finales
            sessionStorage.setItem('compraPasoFinal', JSON.stringify(datosCombinados));
            
            // Guardar datos para el flujo de acompañantes
            localStorage.setItem('numAcompanantes', numAcompanantes);
            localStorage.setItem('datosAmpliacion', JSON.stringify({
                acompanantes: numAcompanantes,
                mascotas: datosAmpliacion.mascotas_chk,
                tipoMascota: datosAmpliacion.tipo_mascota,
                intolerancias: datosAmpliacion.intolerancias_input,
                telefonoEmergencia: datosAmpliacion.telefono_emergencia,
                comentarios: datosAmpliacion.comentarios_adicionales
            }));
            
            // Redirigir según el número de acompañantes
            if (numAcompanantes > 0) {
                window.location.href = 'acompanante-c.html';
            } else {
                //window.location.href = 'confirmacion-c.html';
                window.location.href = 'seguros.html';
            }
        });
    }

    // modal de confirmación al pulsar 'Inicio' en la página de ampliación ---
    try {
        const nav = document.querySelector('.menu-navegacion');
        if (nav) {
            const firstAnchor = nav.querySelector('li a');
            if (firstAnchor) {
                firstAnchor.addEventListener('click', function(ev) {
                    ev.preventDefault();
                    const href = this.getAttribute('href') || this.href || '#';
                    if (!document.getElementById('confirm-salir-modal')) {
                        const overlay = document.createElement('div');
                        overlay.id = 'confirm-salir-modal';
                        overlay.className = 'modal-overlay';

                        const dialog = document.createElement('div');
                        dialog.className = 'modal-confirm modal-split';
                        dialog.innerHTML = `
                            <h3 class="modal-title">¿Salir y cancelar compra?</h3>
                            <p class="modal-text">Si sales se cancelará el proceso de compra. ¿Quieres continuar?</p>
                            <div class="modal-actions">
                                <button id="modal-no" class="modal-cancelar">No</button>
                                <button id="modal-si" class="modal-confirmar">Sí</button>
                            </div>
                        `;

                        overlay.appendChild(dialog);
                        document.body.appendChild(overlay);

                        // cerrar al clicar fuera
                        overlay.addEventListener('click', function(e) {
                            if (e.target === overlay) overlay.remove();
                        });

                        document.getElementById('modal-no').addEventListener('click', function() {
                            overlay.remove();
                        });
                        document.getElementById('modal-si').addEventListener('click', function() {
                            var destino = href;
                            if (!destino || destino === '#') destino = localStorage.getItem('usuarioActual') ? 'index.html' : 'index.html';
                            overlay.remove();
                            window.location.href = destino;
                        });
                    } else {
                        const overlay = document.getElementById('confirm-salir-modal');
                        overlay.classList.remove('hidden');
                    }
                });
            }
        }
    } catch (e) {
        console.warn('Error instalando modal de confirmación de salida en ampliación:', e);
    }

    // Limpiar SOLO los datos del formulario al salir del flujo C
    // NO limpiar compraPaso1 porque se necesita para el perfil
    window.addEventListener('beforeunload', function() {
        if (!sessionStorage.getItem('enPaginaC')) {
            sessionStorage.removeItem('datosAmpliacion');
        }
        sessionStorage.removeItem('enPaginaC');
    });

    // Detectar navegación con botones del navegador
    window.addEventListener('popstate', function() {
        const currentUrl = window.location.href;
        if (!currentUrl.includes('version-c.html') && 
            !currentUrl.includes('NUEVO-ampliacion-c.html') && 
            //!currentUrl.includes('confirmacion-c.html')) 
            !currentUrl.includes('seguros.html')){
            sessionStorage.removeItem('datosAmpliacion');
            sessionStorage.removeItem('compraPaso1');
        }
    });

    // Limpiar datos al salir de las páginas C
    window.addEventListener('beforeunload', function() {
        sessionStorage.removeItem('enPaginaC');
    });

    // Detectar si venimos de fuera del flujo C
    if (!sessionStorage.getItem('enPaginaC')) {
        // Si no estaba
    }
});