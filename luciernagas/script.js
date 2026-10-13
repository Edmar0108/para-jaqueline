/* ============================================
   CIELO DE ESTRELLAS — Para Jaqueline Lara
   Versión robusta para celular
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // CONFIGURACIÓN
    // ============================================

    var starCount = 300;
    var formationTexts = ["Perdoname", "Jaqueline"];
    var formationHold = 5000;
    var formationGap = 2500;
    var formationEase = 0.045;
    var shootingInterval = 4500;
    var message = "Se que te falle y no hay excusa que valga. No soy perfecto, pero lo que siento por ti es real. Me duele haberte lastimado porque eres lo mas importante que tengo. Quiero ser mejor por ti, quiero demostrarte que puedo cambiar. Perdoname, Corazon de melon. Dame la oportunidad de hacerte sonreir de nuevo. Te quiero con todo lo que soy.";
    var typeSpeed = 45;

    // ============================================
    // ESTADO
    // ============================================

    var canvas, ctx, W, H;
    var stars = [];
    var shootingStars = [];
    var phase = 'intro';

    // ============================================
    // INIT
    // ============================================

    function init() {
        canvas = document.getElementById('stars-canvas');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        doResize();
        window.addEventListener('resize', function() {
            doResize();
            buildStars();
        });
        buildStars();
        requestAnimationFrame(tick);

        var btn = document.getElementById('btn-start');
        if (btn) {
            btn.addEventListener('click', function() {
                startShow();
            });
            btn.addEventListener('touchend', function(e) {
                e.preventDefault();
                startShow();
            });
        }
    }

    function doResize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
    }

    // ============================================
    // ESTRELLAS
    // ============================================

    function buildStars() {
        stars = [];
        for (var i = 0; i < starCount; i++) {
            var x = Math.random() * W;
            var y = Math.random() * H;
            stars.push({
                x: x, y: y,
                homeX: x, homeY: y,
                tx: x, ty: y,
                r: Math.random() * 1.4 + 0.4,
                baseA: Math.random() * 0.5 + 0.3,
                a: 0,
                tSpeed: Math.random() * 0.03 + 0.01,
                tPhase: Math.random() * 6.28,
                temp: Math.random(),
                forming: false,
                da: Math.random() * 6.28,
                ds: Math.random() * 0.002 + 0.001
            });
        }
    }

    function updateStar(s, t) {
        var tw = Math.sin(t * s.tSpeed + s.tPhase);
        s.a = s.baseA * (0.55 + tw * 0.45);

        if (s.forming) {
            s.x += (s.tx - s.x) * formationEase;
            s.y += (s.ty - s.y) * formationEase;
        } else {
            s.x += (s.tx - s.x) * 0.02;
            s.y += (s.ty - s.y) * 0.02;
            s.da += s.ds;
            s.homeX += Math.cos(s.da) * 0.08;
            s.homeY += Math.sin(s.da) * 0.06;
            if (s.homeX < 0) s.homeX = W;
            if (s.homeX > W) s.homeX = 0;
            if (s.homeY < 0) s.homeY = H;
            if (s.homeY > H) s.homeY = 0;
            s.tx = s.homeX;
            s.ty = s.homeY;
        }
    }

    function drawStar(s) {
        if (s.a < 0.02) return;
        var r, g, b;
        if (s.temp < 0.3) { r=180; g=200; b=255; }
        else if (s.temp < 0.7) { r=255; g=255; b=245; }
        else { r=255; g=230; b=180; }

        // Glow pequeño
        var gl = s.forming ? s.r * 2.5 : s.r * 3.5;
        var grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, gl);
        grad.addColorStop(0, 'rgba('+r+','+g+','+b+','+(s.a*0.25)+')');
        grad.addColorStop(1, 'rgba('+r+','+g+','+b+',0)');
        ctx.beginPath();
        ctx.arc(s.x, s.y, gl, 0, 6.28);
        ctx.fillStyle = grad;
        ctx.fill();

        // Centro
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.forming ? s.r * 0.8 : s.r, 0, 6.28);
        ctx.fillStyle = 'rgba('+r+','+g+','+b+','+s.a+')';
        ctx.fill();
    }

    // ============================================
    // ESTRELLAS FUGACES
    // ============================================

    function addShootingStar() {
        var sx = Math.random() * W * 0.6 + W * 0.2;
        var sy = Math.random() * H * 0.25;
        var ang = 0.6 + Math.random() * 0.4;
        var spd = 9 + Math.random() * 5;
        shootingStars.push({
            x: sx, y: sy,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            len: 70 + Math.random() * 50,
            life: 1,
            dec: 0.013 + Math.random() * 0.007
        });
    }

    function tickShootingStars() {
        for (var i = shootingStars.length - 1; i >= 0; i--) {
            var ss = shootingStars[i];
            ss.x += ss.vx;
            ss.y += ss.vy;
            ss.life -= ss.dec;
            if (ss.life <= 0) { shootingStars.splice(i, 1); continue; }

            var mag = Math.sqrt(ss.vx*ss.vx + ss.vy*ss.vy);
            var tX = ss.x - (ss.vx/mag) * ss.len * ss.life;
            var tY = ss.y - (ss.vy/mag) * ss.len * ss.life;

            var grad = ctx.createLinearGradient(ss.x, ss.y, tX, tY);
            grad.addColorStop(0, 'rgba(255,255,240,'+ss.life+')');
            grad.addColorStop(0.3, 'rgba(255,240,200,'+(ss.life*0.5)+')');
            grad.addColorStop(1, 'rgba(255,230,180,0)');

            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(tX, tY);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(ss.x, ss.y, 2, 0, 6.28);
            ctx.fillStyle = 'rgba(255,255,250,'+ss.life+')';
            ctx.fill();
        }
    }

    // ============================================
    // FORMACIÓN DE TEXTO (canvas sampling)
    // ============================================

    function sampleText(text) {
        var tmp = document.createElement('canvas');
        tmp.width = W;
        tmp.height = H;
        var c = tmp.getContext('2d');

        var mobile = W < 600;
        var fs = mobile ? 38 : 60;

        c.fillStyle = '#fff';
        c.font = '900 ' + fs + 'px Arial,Helvetica,sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(text, W / 2, H * 0.38);

        var id = c.getImageData(0, 0, W, H);
        var pts = [];
        var gap = mobile ? 8 : 7;

        for (var y = 0; y < H; y += gap) {
            for (var x = 0; x < W; x += gap) {
                var idx = (y * W + x) * 4;
                if (id.data[idx + 3] > 100) {
                    pts.push({x: x, y: y});
                }
            }
        }
        return pts;
    }

    function formText(text) {
        var pts = sampleText(text);
        if (pts.length === 0) return;

        // Shuffle
        for (var i = pts.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = pts[i]; pts[i] = pts[j]; pts[j] = tmp;
        }

        var count = Math.min(stars.length, pts.length);

        for (var i = 0; i < count; i++) {
            stars[i].tx = pts[i].x;
            stars[i].ty = pts[i].y;
            stars[i].forming = true;
            stars[i].baseA = 0.85 + Math.random() * 0.15;
            stars[i].r = 1.2 + Math.random() * 0.5;
        }
        for (var i = count; i < stars.length; i++) {
            stars[i].forming = false;
            stars[i].baseA = Math.random() * 0.2 + 0.05;
        }
    }

    function releaseAll() {
        for (var i = 0; i < stars.length; i++) {
            stars[i].forming = false;
            stars[i].tx = stars[i].homeX;
            stars[i].ty = stars[i].homeY;
            stars[i].baseA = Math.random() * 0.5 + 0.3;
            stars[i].r = Math.random() * 1.4 + 0.4;
        }
    }

    // ============================================
    // SECUENCIA PRINCIPAL
    // ============================================

    var showStarted = false;

    function startShow() {
        if (showStarted) return;
        showStarted = true;

        var intro = document.getElementById('intro-overlay');
        if (intro) intro.classList.remove('active');
        phase = 'sky';

        // Estrellas fugaces periódicas
        var ssTimer = setInterval(function() {
            if (phase !== 'done') addShootingStar();
        }, shootingInterval);

        // Secuencia con timeouts simples (más compatible)
        setTimeout(function() { addShootingStar(); }, 1500);

        // Espera para disfrutar cielo, luego forma texto
        setTimeout(function() { runFormations(0, ssTimer); }, 4500);
    }

    function runFormations(index, ssTimer) {
        if (index >= formationTexts.length) {
            // Terminó la formación, ráfaga de fugaces y luego mensaje
            setTimeout(function() { addShootingStar(); }, 500);
            setTimeout(function() { addShootingStar(); }, 900);
            setTimeout(function() { addShootingStar(); }, 1200);
            setTimeout(function() { showMsg(); }, 2500);
            setTimeout(function() { clearInterval(ssTimer); }, 30000);
            return;
        }

        formText(formationTexts[index]);

        setTimeout(function() {
            releaseAll();
            setTimeout(function() {
                runFormations(index + 1, ssTimer);
            }, formationGap);
        }, formationHold);
    }

    // ============================================
    // MENSAJE
    // ============================================

    function showMsg() {
        phase = 'message';
        var overlay = document.getElementById('message-overlay');
        if (overlay) overlay.classList.add('active');

        var el = document.getElementById('msg-body');
        if (!el) return;
        el.textContent = '';

        var i = 0;
        function typ() {
            if (i < message.length) {
                el.textContent += message.charAt(i);
                i++;
                var d = typeSpeed;
                var ch = message.charAt(i - 1);
                if (ch === ',' || ch === '.') d = typeSpeed * 4;
                else if (ch === ' ') d = typeSpeed * 1.1;
                setTimeout(typ, d);
            } else {
                setTimeout(function() {
                    var sig = document.getElementById('msg-signature');
                    if (sig) sig.classList.add('visible');
                }, 600);
            }
        }
        typ();
    }

    // ============================================
    // LOOP
    // ============================================

    function tick() {
        var t = performance.now() * 0.001;
        ctx.clearRect(0, 0, W, H);

        for (var i = 0; i < stars.length; i++) {
            updateStar(stars[i], t);
            drawStar(stars[i]);
        }

        tickShootingStars();
        requestAnimationFrame(tick);
    }

    // ============================================
    // ARRANQUE
    // ============================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
