/* ============================================
   LUCIÉRNAGAS — JARDÍN NOCTURNO
   Para Jaqueline Lara 🪲✨
   Motor de partículas, formación de texto
   e interacción táctil
   ============================================ */

// ============================================
// CONFIGURACIÓN
// ============================================

const CONFIG = {
    // Luciérnagas
    initialCount: 60,
    maxCount: 250,
    spawnPerTouch: 5,
    baseRadius: 2,
    glowRadius: 18,
    speed: 0.4,
    driftStrength: 0.008,
    colors: [
        { r: 180, g: 230, b: 80 },   // verde-amarillo cálido
        { r: 160, g: 240, b: 100 },   // verde brillante
        { r: 200, g: 220, b: 60 },    // amarillo-verde
        { r: 140, g: 230, b: 120 },   // verde suave
        { r: 220, g: 210, b: 70 },    // dorado
        { r: 180, g: 255, b: 140 },   // verde claro
    ],

    // Formación de texto
    formationTexts: [
        "Perdóname",
        "Jaqueline",
        "🥺💕"
    ],
    formationDuration: 4000,   // ms que mantiene cada texto
    formationPause: 2000,      // ms entre textos
    formationSpeed: 0.03,      // qué tan rápido van a su posición

    // Mensaje
    message: "Sé que te fallé y no hay excusa que valga. No soy perfecto, pero lo que siento por ti es real. Me duele haberte lastimado porque eres lo más importante que tengo. Quiero ser mejor por ti, quiero demostrarte que puedo cambiar. Perdóname, Corazón de melón. Dame la oportunidad de hacerte sonreír de nuevo. Te quiero con todo lo que soy 🐻💕",
    typeSpeed: 50,

    // Estrellas de fondo
    starCount: 80
};

// ============================================
// ESTADO
// ============================================

const state = {
    fireflies: [],
    canvas: null,
    ctx: null,
    width: 0,
    height: 0,
    mouse: { x: -1000, y: -1000 },
    phase: 'intro',  // intro -> freefly -> forming -> message -> freefly_final
    formationPoints: [],
    currentFormationIndex: 0,
    formationActive: false,
    animationId: null,
    stars: [],
    typewriterTimeout: null
};

// ============================================
// INICIALIZACIÓN
// ============================================

function init() {
    state.canvas = document.getElementById('fireflies-canvas');
    state.ctx = state.canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    createStars();
    createInitialFireflies();
    setupEventListeners();
    animate();
}

function resize() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    state.canvas.width = state.width;
    state.canvas.height = state.height;
}

// ============================================
// ESTRELLAS ESTÁTICAS
// ============================================

function createStars() {
    state.stars = [];
    for (let i = 0; i < CONFIG.starCount; i++) {
        state.stars.push({
            x: Math.random() * state.width,
            y: Math.random() * state.height * 0.6,
            radius: Math.random() * 1.2 + 0.3,
            alpha: Math.random() * 0.6 + 0.2,
            twinkleSpeed: Math.random() * 0.02 + 0.005,
            twinkleOffset: Math.random() * Math.PI * 2
        });
    }
}

function drawStars(time) {
    state.stars.forEach(star => {
        const alpha = star.alpha + Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.2;
        state.ctx.beginPath();
        state.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        state.ctx.fillStyle = `rgba(255, 255, 240, ${Math.max(0.05, alpha)})`;
        state.ctx.fill();
    });
}

// ============================================
// LUCIÉRNAGAS
// ============================================

function createFirefly(x, y) {
    const color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
    const angle = Math.random() * Math.PI * 2;

    return {
        x: x ?? Math.random() * state.width,
        y: y ?? Math.random() * state.height * 0.85,
        vx: Math.cos(angle) * CONFIG.speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * CONFIG.speed * (0.5 + Math.random()),
        radius: CONFIG.baseRadius * (0.6 + Math.random() * 0.8),
        color: color,
        alpha: 0,
        targetAlpha: 0.6 + Math.random() * 0.4,
        pulseSpeed: 0.015 + Math.random() * 0.025,
        pulseOffset: Math.random() * Math.PI * 2,
        driftAngle: Math.random() * Math.PI * 2,
        driftSpeed: 0.002 + Math.random() * 0.004,
        // Para formación
        targetX: null,
        targetY: null,
        forming: false,
        // Vida
        born: performance.now(),
        fadeIn: true
    };
}

function createInitialFireflies() {
    for (let i = 0; i < CONFIG.initialCount; i++) {
        const f = createFirefly();
        f.alpha = f.targetAlpha; // ya visibles
        f.fadeIn = false;
        state.fireflies.push(f);
    }
}

function spawnFirefliesAt(x, y) {
    if (state.fireflies.length >= CONFIG.maxCount) return;

    const count = Math.min(CONFIG.spawnPerTouch, CONFIG.maxCount - state.fireflies.length);
    for (let i = 0; i < count; i++) {
        const offsetX = (Math.random() - 0.5) * 60;
        const offsetY = (Math.random() - 0.5) * 60;
        const f = createFirefly(x + offsetX, y + offsetY);
        state.fireflies.push(f);
    }
}

function updateFirefly(f, time) {
    // Fade in
    if (f.fadeIn) {
        f.alpha += 0.01;
        if (f.alpha >= f.targetAlpha) {
            f.alpha = f.targetAlpha;
            f.fadeIn = false;
        }
    }

    // Pulso de brillo
    const pulse = Math.sin(time * f.pulseSpeed + f.pulseOffset);
    f.currentAlpha = f.alpha * (0.5 + pulse * 0.5);

    if (f.forming && f.targetX !== null && f.targetY !== null) {
        // Moverse hacia el punto de formación
        const dx = f.targetX - f.x;
        const dy = f.targetY - f.y;
        f.x += dx * CONFIG.formationSpeed;
        f.y += dy * CONFIG.formationSpeed;
        // Pequeño temblor en posición
        f.x += (Math.random() - 0.5) * 0.5;
        f.y += (Math.random() - 0.5) * 0.5;
    } else {
        // Movimiento libre con drift orgánico
        f.driftAngle += f.driftSpeed;
        f.vx += Math.cos(f.driftAngle) * CONFIG.driftStrength;
        f.vy += Math.sin(f.driftAngle) * CONFIG.driftStrength;

        // Limitar velocidad
        const speed = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
        const maxSpeed = CONFIG.speed * 1.5;
        if (speed > maxSpeed) {
            f.vx = (f.vx / speed) * maxSpeed;
            f.vy = (f.vy / speed) * maxSpeed;
        }

        f.x += f.vx;
        f.y += f.vy;

        // Rebote suave en bordes
        const margin = 30;
        if (f.x < -margin) f.x = state.width + margin;
        if (f.x > state.width + margin) f.x = -margin;
        if (f.y < -margin) f.y = state.height * 0.85 + margin;
        if (f.y > state.height * 0.85 + margin) f.y = -margin;
    }

    // Repulsión suave del mouse/touch
    const mdx = f.x - state.mouse.x;
    const mdy = f.y - state.mouse.y;
    const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
    if (mDist < 80 && mDist > 0 && !f.forming) {
        const force = (80 - mDist) / 80 * 0.8;
        f.vx += (mdx / mDist) * force;
        f.vy += (mdy / mDist) * force;
    }
}

function drawFirefly(f) {
    if (f.currentAlpha <= 0.01) return;

    const { r, g, b } = f.color;

    // Glow exterior
    const gradient = state.ctx.createRadialGradient(
        f.x, f.y, 0,
        f.x, f.y, CONFIG.glowRadius * f.radius
    );
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${f.currentAlpha * 0.6})`);
    gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${f.currentAlpha * 0.2})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

    state.ctx.beginPath();
    state.ctx.arc(f.x, f.y, CONFIG.glowRadius * f.radius, 0, Math.PI * 2);
    state.ctx.fillStyle = gradient;
    state.ctx.fill();

    // Centro brillante
    state.ctx.beginPath();
    state.ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    state.ctx.fillStyle = `rgba(${Math.min(r + 60, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 30, 255)}, ${f.currentAlpha})`;
    state.ctx.fill();
}

// ============================================
// FORMACIÓN DE TEXTO
// ============================================

function getTextPoints(text) {
    // Crear canvas temporal para obtener píxeles del texto
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    const isMobile = state.width < 600;
    const fontSize = isMobile ? 45 : 70;

    tempCanvas.width = state.width;
    tempCanvas.height = state.height;

    tempCtx.fillStyle = '#fff';
    tempCtx.font = `bold ${fontSize}px 'Dancing Script', cursive`;
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillText(text, state.width / 2, state.height * 0.4);

    // Muestrear píxeles
    const imageData = tempCtx.getImageData(0, 0, state.width, state.height);
    const points = [];
    const gap = isMobile ? 5 : 4; // densidad de muestreo

    for (let y = 0; y < state.height; y += gap) {
        for (let x = 0; x < state.width; x += gap) {
            const i = (y * state.width + x) * 4;
            if (imageData.data[i + 3] > 128) {
                points.push({ x, y });
            }
        }
    }

    return points;
}

function startFormation(text) {
    const points = getTextPoints(text);
    if (points.length === 0) return;

    state.formationActive = true;

    // Asignar puntos a luciérnagas existentes
    const available = state.fireflies.slice(0, points.length);

    // Si necesitamos más luciérnagas, crear temporales
    while (state.fireflies.length < points.length && state.fireflies.length < CONFIG.maxCount) {
        const f = createFirefly();
        f.alpha = 0.3;
        f.fadeIn = true;
        state.fireflies.push(f);
    }

    const usable = Math.min(state.fireflies.length, points.length);

    // Mezclar puntos para distribución natural
    const shuffledPoints = points.sort(() => Math.random() - 0.5).slice(0, usable);

    for (let i = 0; i < usable; i++) {
        state.fireflies[i].targetX = shuffledPoints[i].x;
        state.fireflies[i].targetY = shuffledPoints[i].y;
        state.fireflies[i].forming = true;
    }

    // Las sobrantes siguen libres
    for (let i = usable; i < state.fireflies.length; i++) {
        state.fireflies[i].forming = false;
        state.fireflies[i].targetX = null;
        state.fireflies[i].targetY = null;
    }
}

function releaseFormation() {
    state.formationActive = false;
    state.fireflies.forEach(f => {
        f.forming = false;
        f.targetX = null;
        f.targetY = null;
        // Darle un empujón aleatorio al soltarlas
        const angle = Math.random() * Math.PI * 2;
        f.vx = Math.cos(angle) * CONFIG.speed * 2;
        f.vy = Math.sin(angle) * CONFIG.speed * 2;
    });
}

async function runFormationSequence() {
    for (let i = 0; i < CONFIG.formationTexts.length; i++) {
        state.currentFormationIndex = i;
        startFormation(CONFIG.formationTexts[i]);

        await wait(CONFIG.formationDuration);
        releaseFormation();

        if (i < CONFIG.formationTexts.length - 1) {
            await wait(CONFIG.formationPause);
        }
    }

    // Después de la secuencia, mostrar el mensaje
    await wait(1500);
    showMessage();
}

// ============================================
// MENSAJE CON TYPEWRITER
// ============================================

function showMessage() {
    state.phase = 'message';
    const overlay = document.getElementById('message-overlay');
    overlay.classList.add('active');

    // Typewriter del mensaje
    const msgBody = document.getElementById('msg-body');
    typeWriter(CONFIG.message, msgBody, CONFIG.typeSpeed, () => {
        // Mostrar firma
        const sig = document.querySelector('.msg-signature');
        if (sig) sig.classList.add('visible');

        // Después de un rato, cerrar mensaje y volver a luciérnagas libres
        setTimeout(() => {
            overlay.classList.remove('active');
            state.phase = 'freefly_final';

            const hint = document.getElementById('touch-hint');
            if (hint) {
                hint.classList.remove('hidden');
                hint.classList.add('visible');
            }
        }, 6000);
    });
}

function typeWriter(text, element, speed, callback) {
    element.textContent = '';
    let index = 0;

    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;

            let nextSpeed = speed;
            const char = text.charAt(index - 1);
            if (char === ',' || char === '.') nextSpeed = speed * 5;
            else if (char === ' ') nextSpeed = speed * 1.2;

            state.typewriterTimeout = setTimeout(type, nextSpeed);
        } else {
            if (callback) callback();
        }
    }

    type();
}

// ============================================
// EVENTOS
// ============================================

function setupEventListeners() {
    // Botón de inicio
    document.getElementById('btn-start').addEventListener('click', startExperience);

    // Touch/click para crear luciérnagas
    document.addEventListener('touchstart', handleTouch, { passive: false });
    document.addEventListener('mousedown', handleMouse);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('mousemove', handleMouseMove);
}

function handleTouch(e) {
    if (state.phase === 'intro') return;
    e.preventDefault();

    for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        state.mouse.x = touch.clientX;
        state.mouse.y = touch.clientY;
        spawnFirefliesAt(touch.clientX, touch.clientY);
    }
}

function handleTouchMove(e) {
    if (state.phase === 'intro') return;
    e.preventDefault();

    for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        state.mouse.x = touch.clientX;
        state.mouse.y = touch.clientY;
        if (Math.random() > 0.6) {
            spawnFirefliesAt(touch.clientX, touch.clientY);
        }
    }
}

function handleMouse(e) {
    if (state.phase === 'intro') return;
    state.mouse.x = e.clientX;
    state.mouse.y = e.clientY;
    spawnFirefliesAt(e.clientX, e.clientY);
}

function handleMouseMove(e) {
    state.mouse.x = e.clientX;
    state.mouse.y = e.clientY;
}

// ============================================
// FLUJO PRINCIPAL
// ============================================

async function startExperience() {
    // Ocultar intro
    const intro = document.getElementById('intro-overlay');
    intro.classList.remove('active');

    state.phase = 'freefly';

    // Mostrar hint
    const hint = document.getElementById('touch-hint');
    setTimeout(() => {
        hint.classList.remove('hidden');
        hint.classList.add('visible');
    }, 1000);

    // Esperar un poco para que disfrute las luciérnagas
    await wait(5000);

    // Ocultar hint
    hint.classList.remove('visible');
    hint.classList.add('hidden');

    // Iniciar la secuencia de formación
    state.phase = 'forming';
    await wait(1000);
    runFormationSequence();
}

// ============================================
// LOOP DE ANIMACIÓN
// ============================================

function animate() {
    const time = performance.now() * 0.001; // en segundos

    state.ctx.clearRect(0, 0, state.width, state.height);

    // Dibujar estrellas
    drawStars(time);

    // Actualizar y dibujar luciérnagas
    state.fireflies.forEach(f => {
        updateFirefly(f, time);
        drawFirefly(f);
    });

    state.animationId = requestAnimationFrame(animate);
}

// ============================================
// UTILIDADES
// ============================================

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// INICIO
// ============================================

document.addEventListener('DOMContentLoaded', init);

// Recalcular estrellas en resize
window.addEventListener('resize', () => {
    createStars();
});
