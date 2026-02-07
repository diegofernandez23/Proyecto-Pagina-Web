document.addEventListener("DOMContentLoaded", function() {
    const packs = document.querySelectorAll('.carrusel-imagenes .pack'); //selecciona todos los elementos con la clase 'pack' dentro del carrusel
    const btnIzq = document.querySelector('.flecha-izquierda'); //selecciona el primer boton 'flecha-izquierda'
    const btnDer = document.querySelector('.flecha-derecha'); //selecciona el primer boton 'flecha-derecha'
    let actual = 0; //indice del pack actualmente visible
    let intervalo; //variable para almacenar el intervalo de tiempo

    //funcion para ajustar el numero de packs visibles segun el ancho de la ventana
    function ajustarVisible() {
        if (window.innerWidth < 600) return 1; //movil
        if (window.innerWidth < 768) return 2; //tablet
        return 3; //escritorio
    }

    //funcion para mostrar los packs en la posicion 'index'
    function mostrarPacks(index) { 
        const VISIBLE = ajustarVisible();
        packs.forEach(pack => pack.style.display = 'none');
        for (let i = 0; i < VISIBLE; i++) {
            const idx = (index + i) % packs.length;
            packs[idx].style.display = 'block';
            packs[idx].style.order = i;
        }
    }

    //funcion para avanzar al siguiente pack
    function avanzar() {
        const VISIBLE = ajustarVisible();
        actual = (actual + 1) % packs.length;
        mostrarPacks(actual);
    }

    //funcion para retroceder al pack anterior
    function retroceder() {
        actual = (actual - 1 + packs.length) % packs.length; //decrementa el indice y lo reinicia si es negativo
        mostrarPacks(actual);
    }

    //eventos para los botones de flechas
    btnDer.addEventListener('click', () => {
        avanzar();
        reiniciarIntervalo();
    });
    btnIzq.addEventListener('click', () => {
        retroceder();
        reiniciarIntervalo();
    });

    //funcion para reiniciar el intervalo de tiempo
    function reiniciarIntervalo() {
        clearInterval(intervalo);
        intervalo = setInterval(avanzar, 2000); //reinicia el intervalo para avanzar automaticamente cada 2 seg
    }

    window.addEventListener('resize', () => {
        mostrarPacks(actual); //ajusta los packs visibles al cambiar el tamaño de la ventana
    });

    //inicializa el carrusel
    mostrarPacks(actual);
    intervalo = setInterval(avanzar, 2000); //comienza el intervalo para avanzar automaticamente cada 2 seg

});