// Utilidades
function parseExpiryToYearMonth(value) {
    if (!value) return null;
    value = value.trim();
    const m1 = value.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
    if (m1) return { year: parseInt(m1[1],10), month: parseInt(m1[2],10) };
    const m2 = value.match(/^(\d{2})\/(\d{4})$/);
    if (m2) return { year: parseInt(m2[2],10), month: parseInt(m2[1],10) };
    const m3 = value.match(/^(\d{2})-(\d{2})$/);
    if (m3) return { year: 2000 + parseInt(m3[2],10), month: parseInt(m3[1],10) };
    return null;
}
function isExpiryInFuture(value) {
    const ym = parseExpiryToYearMonth(value);
    if (!ym) return false;
    const now = new Date();
    const cy = now.getFullYear(), cm = now.getMonth()+1;
    if (ym.year > cy) return true;
    if (ym.year === cy && ym.month >= cm) return true;
    return false;
}

// Main
document.addEventListener('DOMContentLoaded', function() {

    // leer datos previos
    let datosFinal = {};
    try {
        const raw = sessionStorage.getItem('compraPasoFinal') || sessionStorage.getItem('compraPaso1');
        if (raw) datosFinal = JSON.parse(raw);
    } catch(e){ datosFinal = {}; }

    // elementos
    const contForm = document.querySelector('.formulario-compra'); // <- escucha aquí (igual que en tu código que SI funciona)
    const formInterno = contForm ? contForm.querySelector('form') : document.querySelector('form');
    const btnVolver = document.getElementById('volver-seguro');

    // campos (IDs esperados en tu HTML)
    const nombreEl = document.getElementById('nombre');
    const correoEl = document.getElementById('correo');
    const tarjetaTipoEl = document.getElementById('tarjeta');
    const tarjetaNumEl = document.getElementById('tarjeta-num');
    const titularEl = document.getElementById('titular');
    const fechaEl = document.getElementById('fecha-caducidad');
    const cvvEl = document.getElementById('cvv');

    // prefil si existe
    try {
        const raw = sessionStorage.getItem('compraPaso1') || sessionStorage.getItem('compraPasoFinal');
        if (raw) {
            const d = JSON.parse(raw);
            if (nombreEl && d.nombre) nombreEl.value = d.nombre;
            if (correoEl && d.correo) correoEl.value = d.correo;
            if (tarjetaTipoEl && d.tarjeta) tarjetaTipoEl.value = d.tarjeta;
            if (tarjetaNumEl && d['tarjeta-num']) tarjetaNumEl.value = d['tarjeta-num'];
            if (titularEl && d.titular) titularEl.value = d.titular;
            if (fechaEl && d['fecha-caducidad']) fechaEl.value = d['fecha-caducidad'];
            if (cvvEl && d.cvv) cvvEl.value = d.cvv;
        }
    } catch(e){ console.warn('prefill falló', e); }

    // listeners por campo (para mensajes inmediatos)
    if (titularEl) titularEl.addEventListener('input', function(){ this.setCustomValidity(this.value.trim().length>0 && this.value.trim().length<3 ? 'Debe tener al menos 3 caracteres' : ''); });
    if (correoEl) correoEl.addEventListener('input', function(){
        const v = this.value.trim(), re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        this.setCustomValidity(!v ? 'Completa este campo' : (re.test(v) ? '' : 'Email inválido'));
    });
    if (tarjetaTipoEl) tarjetaTipoEl.addEventListener('change', function(){
        this.setCustomValidity(this.value ? '' : 'Selecciona un tipo de tarjeta');
    });
    if (tarjetaNumEl) tarjetaNumEl.addEventListener('input', function(){
        this.value = this.value.replace(/\D/g,'').slice(0,19);
        const len = this.value.length;
        if (len === 0) this.setCustomValidity('Completa este campo');
        else if (![13,15,16,19].includes(len)) this.setCustomValidity('El número de tarjeta debe tener 13,15,16 o 19 dígitos');
        else this.setCustomValidity('');
    });
    if (fechaEl) fechaEl.addEventListener('input', function(){
        if (!this.value) { this.setCustomValidity('Completa este campo'); return; }
        this.setCustomValidity(isExpiryInFuture(this.value) ? '' : 'La fecha de caducidad no puede ser pasada');
    });
    if (cvvEl) cvvEl.addEventListener('input', function(){
        this.value = this.value.replace(/\D/g,'').slice(0,4); // permitir hasta 4 por si AMEX
        const expected = (tarjetaTipoEl && tarjetaTipoEl.value && /amex/i.test(tarjetaTipoEl.value)) ? 4 : 3;
        if (this.value.length === 0) this.setCustomValidity('Completa este campo');
        else if (this.value.length !== expected) this.setCustomValidity(`El CVV debe tener exactamente ${expected} dígitos`);
        else this.setCustomValidity('');
    });

    // Escuchamos el submit en el contenedor
    if (contForm) {
        contForm.addEventListener('submit', function(event){
            // campos a revisar 
            const camposEspecificos = [nombreEl, correoEl, tarjetaTipoEl, tarjetaNumEl, titularEl, fechaEl, cvvEl];
            let incompleto = false;

            camposEspecificos.forEach(function(campo){
                if (!campo) return;
                const valor = (campo.value || '').toString().trim();
                const tieneMensajeEspecifico = campo.validationMessage && campo.validationMessage !== '' && campo.validationMessage !== 'Completa este campo';

                // aplicar reglas extras antes de checkValidity si es necesario
                if (!valor || !campo.checkValidity()) {
                    if (!tieneMensajeEspecifico) campo.setCustomValidity('Completa este campo');
                    incompleto = true;
                    campo.reportValidity(); // muestra el mensaje concreto
                } else {
                    campo.setCustomValidity(''); // limpiar
                }
            });

            if (incompleto) {
                event.preventDefault();
                contForm.reportValidity();
                return; // NO continuar si hay errores
            }

            // Si llegamos aquí -> todo válido (guardamos y redirigimos)
            event.preventDefault();

            // obtener formulario real para FormData (por si el botón submit está fuera)
            const formElement = contForm.querySelector('form') || formInterno;
            const datos = {};
            if (formElement) {
                new FormData(formElement).forEach(function(value, key){ datos[key] = value; });
            }

            // combinar y guardar
            try {
                const rawPrev = sessionStorage.getItem('compraPasoFinal') || '{}';
                const base = JSON.parse(rawPrev || '{}');
                Object.assign(base, datos);
                sessionStorage.setItem('compraPasoFinal', JSON.stringify(base));
            } catch(e){ console.warn('No se pudo guardar en sessionStorage', e); }

            window.location.href = 'confirmacion-c.html';
        });
    } else if (formInterno) {
        // fallback: si no existe contForm, enlazamos al form directamente (para robustez)
        formInterno.addEventListener('submit', function(e){
            e.preventDefault();
            // reutilizar lógica: disparar submit sobre contForm simulado
            if (contForm) contForm.dispatchEvent(new Event('submit', {cancelable:true, bubbles:true}));
            else {
                // mismo proceso básico
                formInterno.reportValidity();
                // si pasa, guardar y redirigir:
                if (formInterno.checkValidity()) {
                    const datos = {}; new FormData(formInterno).forEach((v,k)=>datos[k]=v);
                    try {
                        const rawPrev = sessionStorage.getItem('compraPasoFinal') || '{}';
                        const base = JSON.parse(rawPrev || '{}');
                        Object.assign(base, datos);
                        sessionStorage.setItem('compraPasoFinal', JSON.stringify(base));
                    } catch(e){}
                    window.location.href = 'confirmacion-c.html';
                }
            }
        });
    }

    // botón volver (inmutable)
    if (btnVolver) {
        btnVolver.addEventListener('click', function(){
            // puedes marcar compraPrefill si quieres que la página anterior rellene
            // sessionStorage.setItem('compraPrefill','true');
            window.location.href = 'seguros.html';
        });
    }

    // reset limpieza
    if (contForm) {
        contForm.addEventListener('reset', function(){
            setTimeout(function(){
                Array.from(contForm.querySelectorAll('input, select, textarea')).forEach(function(el){
                    if (el && typeof el.setCustomValidity === 'function') el.setCustomValidity('');
                });
            }, 0);
        });
    }
});
