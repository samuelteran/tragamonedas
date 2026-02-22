// --- CONFIGURACIÓN DE SONIDOS ---
const sonidoGiro = new Audio('giro.mp3');
const sonidoPremio = new Audio('ganar.mp3');
sonidoGiro.loop = true; // El sonido de giro se repite hasta que frenen los rodillos

// --- VARIABLES DE JUEGO ---
const simbolos = ["🍎", "🍒", "🍋", "🍇", "💎", "7️⃣", "🍺"];
let saldo = 100;

// Al cargar la página, revisamos si el usuario tiene un bloqueo activo
window.onload = function() {
    verificarBloqueo();
};

function verificarBloqueo() {
    const tiempoBloqueo = localStorage.getItem('bloqueoHasta');
    const mensaje = document.getElementById('mensaje');
    const btn = document.getElementById('btn-jugar');
    const saldoTxt = document.getElementById('saldo');

    if (tiempoBloqueo) {
        const ahora = new Date().getTime();
        if (ahora < tiempoBloqueo) {
            // Aún está bloqueado
            const minutosRestantes = Math.ceil((tiempoBloqueo - ahora) / 60000);
            mensaje.innerText = `Bancarrota. Vuelve en ${minutosRestantes} min.`;
            mensaje.style.color = "#ff4d4d";
            btn.disabled = true;
            saldo = 0;
            saldoTxt.innerText = saldo;
            return true;
        } else {
            // El tiempo expiró: limpiar bloqueo y dar bono de rescate
            localStorage.removeItem('bloqueoHasta');
            saldo = 100;
            saldoTxt.innerText = saldo;
        }
    }
    return false;
}

function jugar() {
    const btn = document.getElementById('btn-jugar');
    const mensaje = document.getElementById('mensaje');
    const saldoTxt = document.getElementById('saldo');
    const reels = document.querySelectorAll('.reel');

    // 1. Verificar si hay bloqueo temporal
    if (verificarBloqueo()) return;

    // 2. Verificar si tiene saldo para jugar
    if (saldo < 10) {
        mensaje.innerText = "¡Sin saldo! Bloqueo de 10 min activado.";
        const tiempoExpiracion = new Date().getTime() + (10 * 60 * 1000);
        localStorage.setItem('bloqueoHasta', tiempoExpiracion);
        verificarBloqueo();
        return;
    }

    // 3. Cobrar entrada e iniciar sonidos
    saldo -= 10;
    saldoTxt.innerText = saldo;
    btn.disabled = true;
    mensaje.innerText = "¡Mucha suerte...!";
    mensaje.style.color = "white";
    
    sonidoGiro.currentTime = 0;
    sonidoGiro.play();

    const resultadosFinales = [];

    // 4. Iniciar animación de rodillos
    reels.forEach((reel, index) => {
        reel.innerHTML = '';
        const reelInner = document.createElement('div');
        reelInner.classList.add('reel-inner');

        const tira = [];
        for (let i = 0; i < 30; i++) {
            tira.push(simbolos[Math.floor(Math.random() * simbolos.length)]);
        }
        
        resultadosFinales[index] = tira[tira.length - 1];

        tira.forEach(s => {
            const div = document.createElement('div');
            div.className = 'symbol';
            div.innerText = s;
            reelInner.appendChild(div);
        });

        reel.appendChild(reelInner);

        // Desplazamiento con retraso entre rodillos (efecto cascada)
        setTimeout(() => {
            const alturaSimbolo = 120;
            const totalDesplazamiento = (tira.length - 1) * alturaSimbolo;
            reelInner.style.transform = `translateY(-${totalDesplazamiento}px)`;
        }, index * 300);

        // Cuando el último rodillo se detenga
        if (index === 2) {
            setTimeout(() => {
                sonidoGiro.pause();
                btn.disabled = false;
                evaluarPremios(resultadosFinales);
            }, 3800); 
        }
    });
}

function evaluarPremios(res) {
    const mensaje = document.getElementById('mensaje');
    const saldoTxt = document.getElementById('saldo');
    let premio = 0;

    // Lógica de combinaciones
    if (res[0] === "7️⃣" && res[1] === "7️⃣" && res[2] === "7️⃣") {
        premio = 500;
        mensaje.innerText = "¡JACKPOT 777! +500 Bs.";
    } else if (res[0] === "💎" && res[1] === "💎" && res[2] === "💎") {
        premio = 200;
        mensaje.innerText = "¡DIAMANTES! +200 Bs.";
    } else if (res[0] === "🍺" && res[1] === "🍺" && res[2] === "🍺") {
        premio = 100;
        mensaje.innerText = "¡SAMUEL INVITA! +100 Bs.";
    } else if (res[0] === res[1] && res[1] === res[2]) {
        premio = 50;
        mensaje.innerText = "¡TRÍO FRUTAL! +50 Bs.";
    } else if (res[0] === res[1] || res[1] === res[2] || res[0] === res[2]) {
        premio = 5;
        mensaje.innerText = "Pareja: Recuperas 5 Bs.";
    } else {
        mensaje.innerText = "Nada esta vez...";
        mensaje.style.color = "#bdc3c7";
    }

    // Si ganó algo, sonar campanas y sumar saldo
    if (premio > 0) {
        sonidoPremio.currentTime = 0;
        sonidoPremio.play();
        saldo += premio;
        saldoTxt.innerText = saldo;
        mensaje.style.color = "#f1c40f";
    }
}