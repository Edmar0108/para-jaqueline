/* ============================================
   PÁGINA ROMÁNTICA PARA JAQUELINE
   Script principal - Animaciones e interacciones
   ============================================ */

// ============================================
// CONFIGURACIÓN
// ============================================

const CONFIG = {
    message: "Eres la persona más especial que tengo, sé que no soy perfecto pero trato de darte mi mejor versión, te quiero para mí, pero también quiero verte feliz, gracias por todo. Besos y abrazos de oso 🐻💕",
    typeSpeed: 55,          // ms por carácter
    heartsInterval: 800,    // ms entre corazones
    maxHearts: 30,          // máximo de corazones en pantalla
    heartEmojis: ['💖', '💕', '💗', '💓', '💘', '💝', '🩷', '♥️', '🌸'],
    starCount: 60,
    confettiColors: ['#ff6b9d', '#e84393', '#fd79a8', '#ff85ad', '#ffb3cc', '#ffd6e5', '#fff', '#ffc0d3']
};

// ============================================
// ESTADO GLOBAL
// ============================================

let heartsIntervalId = null;
let typewriterTimeoutId = null;
let confettiAnimationId = null;
let activeHeartContainerId = null;

// ============================================
// CORAZONES FLOTANTES
// ============================================

function createFloatingHeart(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const hearts = container.querySelectorAll('.floating-heart');
    if (hearts.length >= CONFIG.maxHearts) {
        if (hearts[0]) hearts[0].remove();
    }

    const heart = document.createElement('span');
    heart.classList.add('floating-heart');
    heart.textContent = CONFIG.heartEmojis[Math.floor(Math.random() * CONFIG.heartEmojis.length)];

    const size = Math.random() * 24 + 14;
    const left = Math.random() * 100;
    const duration = Math.random() * 6 + 6;
    const drift = (Math.random() - 0.5) * 120;
    const rotation = Math.random() * 720 - 360;

    heart.style.cssText = `
        font-size: ${size}px;
        left: ${left}%;
        animation-duration: ${duration}s;
        --drift: ${drift}px;
        --rotation: ${rotation}deg;
    `;

    container.appendChild(heart);

    // Limpieza automática
    setTimeout(() => {
        if (heart.parentNode) heart.remove();
    }, duration * 1000 + 500);
}

function startFloatingHearts(containerId) {
    stopFloatingHearts();
    activeHeartContainerId = containerId;

    // Crear algunos corazones iniciales con delay
    for (let i = 0; i < 5; i++) {
        setTimeout(() => createFloatingHeart(containerId), i * 300);
    }

    heartsIntervalId = setInterval(() => {
        createFloatingHeart(containerId);
    }, CONFIG.heartsInterval);
}

function stopFloatingHearts() {
    if (heartsIntervalId) {
        clearInterval(heartsIntervalId);
        heartsIntervalId = null;
    }
}

// ============================================
// ESTRELLAS DE FONDO
// ============================================

function createStars() {
    const container = document.getElementById('stars-bg');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < CONFIG.starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const size = Math.random() * 3 + 1;
        const duration = Math.random() * 4 + 2;
        const delay = Math.random() * 5;
        const maxOpacity = Math.random() * 0.6 + 0.3;

        star.style.cssText = `
            left: ${x}%;
            top: ${y}%;
            width: ${size}px;
            height: ${size}px;
            --duration: ${duration}s;
            --max-opacity: ${maxOpacity};
            animation-delay: ${delay}s;
        `;

        container.appendChild(star);
    }
}

// ============================================
// EFECTO TYPEWRITER
// ============================================

function typeWriter(text, elementId, speed, callback) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = '';
    let index = 0;

    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;

            // Velocidad variable para naturalidad
            let nextSpeed = speed;
            const char = text.charAt(index - 1);

            if (char === ',' || char === '.') {
                nextSpeed = speed * 5; // Pausa en comas y puntos
            } else if (char === ' ') {
                nextSpeed = speed * 1.2;
            }

            typewriterTimeoutId = setTimeout(type, nextSpeed);
        } else {
            // Terminó de escribir
            if (callback) callback();
        }
    }

    type();
}

function stopTypewriter() {
    if (typewriterTimeoutId) {
        clearTimeout(typewriterTimeoutId);
        typewriterTimeoutId = null;
    }
}

// ============================================
// CONFETI
// ============================================

function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 150;

    // Crear partículas
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 8 + 4,
            color: CONFIG.confettiColors[Math.floor(Math.random() * CONFIG.confettiColors.length)],
            speedX: (Math.random() - 0.5) * 4,
            speedY: Math.random() * 3 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            opacity: 1,
            shape: Math.random() > 0.5 ? 'rect' : 'circle',
            wobble: Math.random() * 10,
            wobbleSpeed: Math.random() * 0.1 + 0.05
        });
    }

    let frame = 0;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        frame++;

        let activeParticles = 0;

        particles.forEach(p => {
            if (p.opacity <= 0) return;
            activeParticles++;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;

            if (p.shape === 'rect') {
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();

            // Física
            p.x += p.speedX + Math.sin(frame * p.wobbleSpeed) * p.wobble * 0.05;
            p.y += p.speedY;
            p.rotation += p.rotationSpeed;
            p.speedY += 0.03; // gravedad

            // Desvanecer al salir
            if (p.y > canvas.height * 0.85) {
                p.opacity -= 0.02;
            }
        });

        if (activeParticles > 0) {
            confettiAnimationId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    animate();

    // Segunda oleada después de 1.5s
    setTimeout(() => {
        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: -20 - Math.random() * 200,
                size: Math.random() * 8 + 4,
                color: CONFIG.confettiColors[Math.floor(Math.random() * CONFIG.confettiColors.length)],
                speedX: (Math.random() - 0.5) * 6,
                speedY: Math.random() * 2 + 1,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 12,
                opacity: 1,
                shape: Math.random() > 0.5 ? 'rect' : 'circle',
                wobble: Math.random() * 10,
                wobbleSpeed: Math.random() * 0.1 + 0.05
            });
        }
    }, 1500);
}

function stopConfetti() {
    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
        confettiAnimationId = null;
    }
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// ============================================
// MINI EXPLOSIONES DE CORAZONES (click)
// ============================================

function createHeartBurst(x, y) {
    const burstCount = 8;
    for (let i = 0; i < burstCount; i++) {
        const heart = document.createElement('span');
        heart.textContent = CONFIG.heartEmojis[Math.floor(Math.random() * CONFIG.heartEmojis.length)];
        heart.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            font-size: ${Math.random() * 16 + 12}px;
            pointer-events: none;
            z-index: 9999;
            transition: all ${Math.random() * 0.8 + 0.6}s ease-out;
            opacity: 1;
        `;
        document.body.appendChild(heart);

        const angle = (i / burstCount) * Math.PI * 2;
        const distance = Math.random() * 80 + 40;

        requestAnimationFrame(() => {
            heart.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance - 30}px) scale(0.3)`;
            heart.style.opacity = '0';
        });

        setTimeout(() => {
            if (heart.parentNode) heart.remove();
        }, 1500);
    }
}

// Explosión de corazones al hacer click en cualquier parte
document.addEventListener('click', (e) => {
    createHeartBurst(e.clientX, e.clientY);
});

// ============================================
// TRANSICIONES ENTRE PANTALLAS
// ============================================

function switchScreen(hideId, showId) {
    return new Promise((resolve) => {
        const hideScreen = document.getElementById(hideId);
        const showScreen = document.getElementById(showId);

        if (hideScreen) {
            hideScreen.classList.remove('active');
        }

        setTimeout(() => {
            if (showScreen) {
                showScreen.classList.add('active');
            }
            resolve();
        }, 800);
    });
}

// ============================================
// FLUJO PRINCIPAL
// ============================================

// Iniciar corazones en pantalla de intro
document.addEventListener('DOMContentLoaded', () => {
    startFloatingHearts('hearts-bg');
});

// Botón "Abrir carta"
async function startExperience() {
    stopFloatingHearts();

    await switchScreen('intro-screen', 'message-screen');

    // Iniciar efectos de la pantalla de mensaje
    createStars();
    startFloatingHearts('hearts-bg-2');

    // Esperar un momento y empezar el typewriter
    setTimeout(() => {
        typeWriter(CONFIG.message, 'typewriter-text', CONFIG.typeSpeed, () => {
            // Al terminar el typewriter, mostrar firma y botón
            const cursor = document.getElementById('cursor');
            if (cursor) cursor.style.display = 'none';

            setTimeout(() => {
                const signature = document.getElementById('signature');
                if (signature) {
                    signature.classList.remove('hidden');
                    signature.classList.add('visible');
                }

                setTimeout(() => {
                    const btnSurprise = document.getElementById('btn-surprise');
                    if (btnSurprise) {
                        btnSurprise.classList.remove('hidden');
                        btnSurprise.classList.add('visible');
                    }
                }, 800);
            }, 600);
        });
    }, 1200);
}

// Botón "¿Quieres ver una sorpresa?"
async function showSurprise() {
    stopFloatingHearts();
    stopTypewriter();

    await switchScreen('message-screen', 'surprise-screen');

    // Iniciar efectos de la pantalla sorpresa
    startFloatingHearts('hearts-bg');
    setTimeout(() => launchConfetti(), 300);
}

// Botón "Ver de nuevo"
function replayAll() {
    stopFloatingHearts();
    stopTypewriter();
    stopConfetti();

    // Resetear elementos
    const typewriterText = document.getElementById('typewriter-text');
    const cursor = document.getElementById('cursor');
    const signature = document.getElementById('signature');
    const btnSurprise = document.getElementById('btn-surprise');

    if (typewriterText) typewriterText.textContent = '';
    if (cursor) cursor.style.display = 'inline-block';
    if (signature) {
        signature.classList.add('hidden');
        signature.classList.remove('visible');
    }
    if (btnSurprise) {
        btnSurprise.classList.add('hidden');
        btnSurprise.classList.remove('visible');
    }

    // Quitar pantalla de sorpresa y activar intro
    const surpriseScreen = document.getElementById('surprise-screen');
    const introScreen = document.getElementById('intro-screen');

    if (surpriseScreen) surpriseScreen.classList.remove('active');

    setTimeout(() => {
        if (introScreen) introScreen.classList.add('active');
        startFloatingHearts('hearts-bg');
    }, 500);
}

// ============================================
// RESIZE HANDLER (para canvas de confeti)
// ============================================

window.addEventListener('resize', () => {
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});
