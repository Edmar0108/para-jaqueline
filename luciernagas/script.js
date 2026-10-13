/* ============================================
   CIELO DE ESTRELLAS — Para Jaqueline Lara
   Estrellas que forman texto + estrella fugaz
   + mensaje de disculpa
   ============================================ */

// ============================================
// CONFIGURACIÓN
// ============================================

const CONFIG = {
    starCount: 300,
    
    // Formación de texto
    formationTexts: ["Perdóname", "Jaqueline", "♥"],
    formationHold: 5000,
    formationGap: 2500,
    formationEase: 0.04,

    // Estrella fugaz
    shootingStarInterval: 4000,

    // Mensaje
    message: "Sé que te fallé y no hay excusa que valga. No soy perfecto, pero lo que siento por ti es real. Me duele haberte lastimado porque eres lo más importante que tengo. Quiero ser mejor por ti, quiero demostrarte que puedo cambiar. Perdóname, Corazón de melón. Dame la oportunidad de hacerte sonreír de nuevo. Te quiero con todo lo que soy 🐻💕",
    typeSpeed: 45
};

// ============================================
// ESTADO
// ============================================

const S = {
    canvas: null,
    ctx: null,
    W: 0,
    H: 0,
    stars: [],
    shootingStars: [],
    phase: 'intro',
    raf: null
};

// ============================================
// INICIALIZACIÓN
// ============================================

function init() {
    S.canvas = document.getElementById('stars-canvas');
    S.ctx = S.canvas.getContext('2d');
    resize();
    window.addEventListener('resize', () => { resize(); createStars(); });
    createStars();
    loop();
    document.getElementById('btn-start').addEventListener('click', startExperience);
}

function resize() {
    S.W = window.innerWidth;
    S.H = window.innerHeight;
    S.canvas.width = S.W;
    S.canvas.height = S.H;
}

// ============================================
// ESTRELLAS
// ============================================

function createStars() {
    S.stars = [];
    for (let i = 0; i < CONFIG.starCount; i++) {
        S.stars.push(makeStar(
            Math.random() * S.W,
            Math.random() * S.H
        ));
    }
}

function makeStar(x, y) {
    return {
        // posición actual
        x, y,
        // posición "hogar" (donde flota libre)
        homeX: x,
        homeY: y,
        // posición objetivo (formación o hogar)
        tx: x,
        ty: y,
        // visual
        radius: Math.random() * 1.5 + 0.5,
        baseAlpha: Math.random() * 0.5 + 0.3,
        alpha: 0,
        // twinkle
        twinkleSpeed: Math.random() * 0.03 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
        // color temp (cálido a frío)
        temp: Math.random(),
        // estado
        forming: false,
        // drift libre
        driftAngle: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.002 + 0.001
    };
}

function updateStar(star, time) {
    // Twinkle
    const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
    star.alpha = star.baseAlpha * (0.6 + twinkle * 0.4);

    if (star.forming) {
        // Mover suavemente hacia el objetivo
        star.x += (star.tx - star.x) * CONFIG.formationEase;
        star.y += (star.ty - star.y) * CONFIG.formationEase;
    } else {
        // Mover suavemente de regreso a casa
        star.x += (star.tx - star.x) * 0.02;
        star.y += (star.ty - star.y) * 0.02;
        // Drift orgánico sutil
        star.driftAngle += star.driftSpeed;
        star.homeX += Math.cos(star.driftAngle) * 0.1;
        star.homeY += Math.sin(star.driftAngle) * 0.08;
        // Mantener en pantalla
        if (star.homeX < 0) star.homeX = S.W;
        if (star.homeX > S.W) star.homeX = 0;
        if (star.homeY < 0) star.homeY = S.H;
        if (star.homeY > S.H) star.homeY = 0;
        star.tx = star.homeX;
        star.ty = star.homeY;
    }
}

function drawStar(star) {
    if (star.alpha < 0.02) return;
    const ctx = S.ctx;

    // Color basado en "temperatura" estelar
    let r, g, b;
    if (star.temp < 0.3) {
        // Azulada fría
        r = 180; g = 200; b = 255;
    } else if (star.temp < 0.7) {
        // Blanca
        r = 255; g = 255; b = 245;
    } else {
        // Dorada cálida
        r = 255; g = 230; b = 180;
    }

    // Glow muy sutil (solo un halo pequeño)
    const glowSize = star.forming ? star.radius * 3 : star.radius * 4;
    const gradient = ctx.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, glowSize
    );
    gradient.addColorStop(0, `rgba(${r},${g},${b},${star.alpha * 0.3})`);
    gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.beginPath();
    ctx.arc(star.x, star.y, glowSize, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Punto central nítido
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.forming ? star.radius * 0.9 : star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${star.alpha})`;
    ctx.fill();
}

// ============================================
// ESTRELLAS FUGACES
// ============================================

function spawnShootingStar() {
    const startX = Math.random() * S.W * 0.6 + S.W * 0.2;
    const startY = Math.random() * S.H * 0.3;
    const angle = Math.PI * 0.2 + Math.random() * 0.3;
    const speed = 8 + Math.random() * 6;
    const length = 80 + Math.random() * 60;

    S.shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length,
        alpha: 1,
        life: 1,
        decay: 0.012 + Math.random() * 0.008
    });
}

function updateShootingStars() {
    for (let i = S.shootingStars.length - 1; i >= 0; i--) {
        const ss = S.shootingStars[i];
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life -= ss.decay;
        ss.alpha = Math.max(0, ss.life);

        if (ss.life <= 0) {
            S.shootingStars.splice(i, 1);
        }
    }
}

function drawShootingStars() {
    const ctx = S.ctx;
    S.shootingStars.forEach(ss => {
        const tailX = ss.x - (ss.vx / Math.sqrt(ss.vx * ss.vx + ss.vy * ss.vy)) * ss.length * ss.alpha;
        const tailY = ss.y - (ss.vy / Math.sqrt(ss.vx * ss.vx + ss.vy * ss.vy)) * ss.length * ss.alpha;

        const gradient = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 240, ${ss.alpha})`);
        gradient.addColorStop(0.3, `rgba(255, 240, 200, ${ss.alpha * 0.6})`);
        gradient.addColorStop(1, `rgba(255, 230, 180, 0)`);

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Cabeza brillante
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 250, ${ss.alpha})`;
        ctx.fill();
    });
}

// ============================================
// FORMACIÓN DE TEXTO
// ============================================

function getTextPoints(text) {
    const tmp = document.createElement('canvas');
    const c = tmp.getContext('2d');
    tmp.width = S.W;
    tmp.height = S.H;

    const mobile = S.W < 600;
    const fontSize = mobile ? 40 : 65;

    c.fillStyle = '#fff';
    c.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(text, S.W / 2, S.H * 0.4);

    const img = c.getImageData(0, 0, S.W, S.H);
    const pts = [];
    // Separación grande para legibilidad
    const gap = mobile ? 7 : 6;

    for (let y = 0; y < S.H; y += gap) {
        for (let x = 0; x < S.W; x += gap) {
            if (img.data[(y * S.W + x) * 4 + 3] > 128) {
                pts.push({ x, y });
            }
        }
    }
    return pts;
}

function formText(text) {
    const pts = getTextPoints(text);
    if (!pts.length) return;

    // Mezclar aleatoriamente
    for (let i = pts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pts[i], pts[j]] = [pts[j], pts[i]];
    }

    const count = Math.min(S.stars.length, pts.length);

    // Asignar estrellas a puntos
    for (let i = 0; i < count; i++) {
        S.stars[i].tx = pts[i].x;
        S.stars[i].ty = pts[i].y;
        S.stars[i].forming = true;
        // Hacer más brillantes las que forman texto
        S.stars[i].baseAlpha = 0.8 + Math.random() * 0.2;
    }
    // Las demás quedan libres
    for (let i = count; i < S.stars.length; i++) {
        S.stars[i].forming = false;
        S.stars[i].baseAlpha = Math.random() * 0.3 + 0.1;
    }
}

function releaseStars() {
    S.stars.forEach(star => {
        star.forming = false;
        star.tx = star.homeX;
        star.ty = star.homeY;
        star.baseAlpha = Math.random() * 0.5 + 0.3;
    });
}

// ============================================
// SECUENCIA PRINCIPAL
// ============================================

async function startExperience() {
    const intro = document.getElementById('intro-overlay');
    intro.classList.remove('active');
    S.phase = 'sky';

    // Estrellas fugaces periódicas
    const shootingInterval = setInterval(() => {
        if (S.phase !== 'done') spawnShootingStar();
    }, CONFIG.shootingStarInterval);

    // Primera estrella fugaz rápida
    await wait(1500);
    spawnShootingStar();

    // Disfrutar cielo
    await wait(3000);

    // Secuencia de formación
    for (let i = 0; i < CONFIG.formationTexts.length; i++) {
        formText(CONFIG.formationTexts[i]);
        await wait(CONFIG.formationHold);
        releaseStars();
        if (i < CONFIG.formationTexts.length - 1) {
            await wait(CONFIG.formationGap);
        }
    }

    // Pausa antes del mensaje
    await wait(2000);

    // Lanzar una ráfaga de estrellas fugaces
    spawnShootingStar();
    await wait(300);
    spawnShootingStar();
    await wait(200);
    spawnShootingStar();

    await wait(1000);
    showMessage();

    // Limpiar intervalo después de un rato
    setTimeout(() => clearInterval(shootingInterval), 30000);
}

// ============================================
// MENSAJE
// ============================================

function showMessage() {
    S.phase = 'message';
    const overlay = document.getElementById('message-overlay');
    overlay.classList.add('active');

    const el = document.getElementById('msg-body');
    el.textContent = '';
    let i = 0;

    function type() {
        if (i < CONFIG.message.length) {
            el.textContent += CONFIG.message.charAt(i);
            i++;

            let delay = CONFIG.typeSpeed;
            const ch = CONFIG.message.charAt(i - 1);
            if (ch === ',' || ch === '.') delay *= 5;
            else if (ch === ' ') delay *= 1.2;

            setTimeout(type, delay);
        } else {
            // Mostrar firma
            setTimeout(() => {
                document.getElementById('msg-signature').classList.add('visible');
            }, 600);
        }
    }

    type();
}

// ============================================
// LOOP DE ANIMACIÓN
// ============================================

function loop() {
    const t = performance.now() * 0.001;
    const ctx = S.ctx;

    ctx.clearRect(0, 0, S.W, S.H);

    // Estrellas
    S.stars.forEach(star => {
        updateStar(star, t);
        drawStar(star);
    });

    // Estrellas fugaces
    updateShootingStars();
    drawShootingStars();

    S.raf = requestAnimationFrame(loop);
}

// ============================================
// UTILIDAD
// ============================================

function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ============================================
// INICIO
// ============================================

document.addEventListener('DOMContentLoaded', init);
