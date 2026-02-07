(function () {
    function applyProfileLink() {
        // logica para el icono de perfil en la cabecera
        try {
            var navUl = document.querySelector('.menu-navegacion ul');
            var isLogged = Boolean(localStorage.getItem('usuarioActual'));
            var currentUrl = (window.location.pathname || window.location.href || '').toLowerCase();

            //crear o reutilizar el ancla para el icono
            var iconAnchor = document.getElementById('perfil-icon');
            if (!iconAnchor) {
                iconAnchor = document.createElement('a');
                iconAnchor.id = 'perfil-icon';
                var img = document.createElement('img');
                img.src = 'imagenes/icono-cab.png';
                img.alt = 'Perfil';
                img.className = 'icono-cab';
                iconAnchor.appendChild(img);
            }
            iconAnchor.setAttribute('href', isLogged ? 'perfil.html' : 'iniciar-sesion.html');

            if (navUl) {
                // asegurar que hay un <li> que contiene el icono y añadirlo al final
                var existingLi = Array.from(navUl.querySelectorAll('li')).find(function (li) {
                    return li.querySelector('#perfil-icon');
                });
                if (!existingLi) {
                    var newLi = document.createElement('li');
                    newLi.appendChild(iconAnchor);
                    navUl.appendChild(newLi);
                } else {
                    if (existingLi.querySelector('#perfil-icon') !== iconAnchor) {
                        existingLi.innerHTML = '';
                        existingLi.appendChild(iconAnchor);
                    }
                }
                // Si estamos en una versión-c, interceptar 'Inicio' y el icono de perfil para mostrar modal de confirmación
                try {
                    if (/version-c-/.test(currentUrl)) {
                        // helper para crear/obtener modal
                        function ensureSalirModal() {
                            var existing = document.getElementById('confirm-salir-modal');
                            if (existing) return existing;
                            var overlay = document.createElement('div');
                            overlay.id = 'confirm-salir-modal';
                            overlay.className = 'modal-overlay';
                            var dialog = document.createElement('div');
                            dialog.className = 'modal-confirm modal-split';
                            dialog.innerHTML = '\n                                <h3 class="modal-title">¿Salir y cancelar compra?</h3>\n                                <p class="modal-text">Si sales se cancelará el proceso de compra. ¿Quieres continuar?</p>\n                                <div class="modal-actions">\n                                    <button id="modal-no" class="modal-cancelar">No</button>\n                                    <button id="modal-si" class="modal-confirmar">Sí</button>\n                                </div>\n                            ';
                            overlay.appendChild(dialog);
                            document.body.appendChild(overlay);
                            // cerrar si se hace click fuera
                            overlay.addEventListener('click', function(e) {
                                if (e.target === overlay) overlay.remove();
                            });
                            return overlay;
                        }

                        function attachConfirm(anchor, resolver) {
                            if (!anchor) return;
                            anchor.addEventListener('click', function(ev) {
                                ev.preventDefault();
                                var modal = ensureSalirModal();
                                var btnSi = modal.querySelector('#modal-si');
                                var btnNo = modal.querySelector('#modal-no');
                                function onNo() { modal.remove(); btnSi.removeEventListener('click', onSi); btnNo.removeEventListener('click', onNo); }
                                function onSi() { modal.remove(); btnSi.removeEventListener('click', onSi); btnNo.removeEventListener('click', onNo); window.location.href = resolver(); }
                                btnNo.addEventListener('click', onNo);
                                btnSi.addEventListener('click', onSi);
                            });
                        }

                        var inicioAnchor = navUl ? navUl.querySelector('li a') : null;
                        var perfilAnchor = document.getElementById('perfil-icon') || (navUl ? navUl.querySelector('a#perfil-icon') : null);
                        attachConfirm(inicioAnchor, function() { return isLogged ? 'index.html' : 'index.html'; });
                        attachConfirm(perfilAnchor, function() { return isLogged ? 'perfil.html' : 'iniciar-sesion.html'; });
                    }
                } catch (e) {
                    /* noop */
                }

                // actualizar cualquier enlace textual 'Perfil' para compatibilidad
                var textual = Array.from(navUl.querySelectorAll('a')).find(function (a) {
                    return (a.textContent || '').trim().toLowerCase() === 'perfil';
                });
                if (textual) textual.setAttribute('href', isLogged ? 'perfil.html' : 'iniciar-sesion.html');
            } else {
                // fallback: añadir el icono a la cabecera si no se encuentra el nav
                var header = document.querySelector('.cabecera');
                if (header && header !== iconAnchor.parentElement) header.appendChild(iconAnchor);
            }

        
        } catch (e) {
            /* noop */
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyProfileLink);
    } else {
        applyProfileLink();
    }
})();
