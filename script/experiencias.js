document.addEventListener('DOMContentLoaded', function() {
    // Asegúrate de que ValoracionConsejo esté disponible globalmente desde valoracion-con.js
    if (typeof ValoracionConsejo === 'undefined') {
        console.error("ValoracionConsejo no está cargado.");
        document.getElementById('lista-reviews').innerHTML = '<p class="mensaje-error">Error: No se pudo cargar la funcionalidad de reseñas. Asegúrate de que valoracion-con.js esté incluido y expuesto globalmente.</p>';
        return;
    }

    const contenedor = document.getElementById('lista-reviews');
    contenedor.innerHTML = ''; // Limpiar el mensaje de "Cargando"

    const todasValoraciones = ValoracionConsejo.obtenerValoraciones();
    let reviewsHtml = [];
    let contador = 0;

    // Iterar sobre cada pack/consejo (viaje)
    for (const consejoId in todasValoraciones) {
        const valoracionesPack = todasValoraciones[consejoId];
        // Formato simple para el nombre del viaje (ej: "pack_paris" -> "Viaje a Paris")
        const packNombre = 'Viaje a ' + consejoId.replace('pack_', '').replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '); 

        // Iterar sobre cada usuario que ha valorado este pack
        for (const usuario in valoracionesPack) {
            const review = valoracionesPack[usuario];
            const valoracionNum = review.valor || 0;
            const textoReview = review.texto || '';

            // Solo mostrar reseñas que tienen texto
            if (textoReview.length > 0) {
                contador++;
                
                // Generar estrellas
                let estrellasHtml = '<span class="estrellas-display">';
                for (let i = 1; i <= 5; i++) {
                    estrellasHtml += `<i class="bi ${i <= valoracionNum ? 'bi-star-fill' : 'bi-star'}"></i>`;
                }
                estrellasHtml += '</span>';

                reviewsHtml.push(`
                    <div class="review-tarjeta">
                        <h3>${packNombre}</h3>
                        <p class="meta-info">Usuario: <strong>${usuario}</strong></p>
                        <p class="meta-info">Valoración: ${estrellasHtml}</p>
                        <p class="review-texto">"${textoReview}"</p>
                    </div>
                `);
            }
        }
    }

    if (contador > 0) {
        contenedor.innerHTML = reviewsHtml.join('');
    } else {
        contenedor.innerHTML = '<p>Aún no hay reseñas de texto de usuarios disponibles.</p>';
    }
});