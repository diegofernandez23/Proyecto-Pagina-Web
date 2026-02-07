document.addEventListener('DOMContentLoaded', function() {
    const numAcompanantes = localStorage.getItem('numAcompanantes') || 0;
    const container = document.getElementById('acompanantes-container');
    
    // Cargar y mostrar información del pack (igual que en ampliacion-c.js)
    const datosGuardados = sessionStorage.getItem('compraPaso1');
    
    if (datosGuardados) {
        const datos = JSON.parse(datosGuardados);

        // Mapping de packs (copiado de ampliacion-c.js)
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
                        <div id="valoracion-pack" class="consejo-valoracion solo-lectura"></div>
                    </div>      
                </div>

                <div class="pack-descripcion">
                    <h3>Descripción del pack:</h3>
                    <p>${data.descripcion}</p>
                </div>
            `;
        }

        // Renderizar según el pack enviado desde el paso 1
        renderPack(datos['pack']);

        // Renderizar la valoración del pack (solo lectura) si está disponible
        const idContenedorValoracion = 'valoracion-pack'; // Ej: 'valoracion-pack-japon'
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
    }
    
    // Generar formularios para cada acompañante
    for (let i = 1; i <= numAcompanantes; i++) {
        const acompananteDiv = document.createElement('fieldset');
        acompananteDiv.innerHTML = `
            <legend>Acompañante ${i}</legend>
            
            <label for="nombre_${i}">Nombre completo:</label>
            <input type="text" id="nombre_${i}" name="nombre_${i}" required placeholder="Nombre y apellidos">
            
            <label for="correo_${i}">Correo electrónico:</label>
            <input type="email" id="correo_${i}" name="correo_${i}" required placeholder="correo@ejemplo.com">
        `;
        container.appendChild(acompananteDiv);
    }

    // Manejar envío del formulario
    document.getElementById('form-acompanantes').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Guardar datos de acompañantes
        const datosAcompanantes = [];
        for (let i = 1; i <= numAcompanantes; i++) {
            const nombre = document.getElementById(`nombre_${i}`).value;
            const correo = document.getElementById(`correo_${i}`).value;
            
            datosAcompanantes.push({
                numero: i,
                nombre: nombre,
                correo: correo
            });
        }
        
        localStorage.setItem('datosAcompanantes', JSON.stringify(datosAcompanantes));
        //window.location.href = 'confirmacion-c.html';
        window.location.href = 'seguros.html';
    });

    // Botón volver
    document.getElementById('volver-ampliacion').addEventListener('click', function() {
        window.location.href = 'NUEVO-ampliacion-c.html';
    });

    // Interceptar 'Inicio' en la cabecera y mostrar modal de confirmación (igual que en ampliacion-c.js)
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
        console.warn('Error instalando modal de confirmación de salida en acompañante:', e);
    }
});
