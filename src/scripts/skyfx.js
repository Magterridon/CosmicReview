/**
 * Cosmic Review — météores occasionnels + parallaxe discrète.
 * Vanilla JS + canvas 2D, sans dépendance. Respecte prefers-reduced-motion.
 *
 * Le site ne rechargeant jamais de page, ce module tourne pour toute la
 * durée de la visite : il s'arrête donc de lui-même dès qu'on quitte le
 * ciel, et repart en y revenant (voir `setActive`).
 */

export function initSky() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- Météores ---------- */
    var canvas = document.getElementById("fx");
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, meteors = [];
    var active = true, raf = 0, timer = 0;

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn() {
      var fromLeft = Math.random() < 0.5;
      var angle = (Math.random() * 22 + 24) * Math.PI / 180;
      var speed = 14 + Math.random() * 8;
      meteors.push({
        x: fromLeft ? Math.random() * W * 0.45 : W * 0.55 + Math.random() * W * 0.45,
        y: Math.random() * H * 0.28,
        vx: (fromLeft ? 1 : -1) * Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 90 + Math.random() * 130,
        life: 0,
        max: 46 + Math.random() * 26
      });
    }

    function schedule() {
      if (reduce) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        if (active) spawn();
        schedule();
      }, 7000 + Math.random() * 11000);
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = meteors.length - 1; i >= 0; i--) {
        var m = meteors[i];
        m.x += m.vx; m.y += m.vy; m.life++;

        var p = m.life / m.max;
        var a = Math.sin(Math.min(p, 1) * Math.PI);
        var n = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
        var tx = m.x - (m.vx / n) * m.len;
        var ty = m.y - (m.vy / n) * m.len;

        var g = ctx.createLinearGradient(tx, ty, m.x, m.y);
        g.addColorStop(0, "rgba(255,250,238,0)");
        g.addColorStop(0.7, "rgba(255,250,238," + (a * 0.32).toFixed(3) + ")");
        g.addColorStop(1, "rgba(255,252,244," + (a * 0.92).toFixed(3) + ")");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = "rgba(255,253,247," + (a * 0.95).toFixed(3) + ")";
        ctx.arc(m.x, m.y, 1.3, 0, Math.PI * 2);
        ctx.fill();

        if (m.life > m.max || m.y > H || m.x < -200 || m.x > W + 200) meteors.splice(i, 1);
      }
      // Rien à dessiner et scène quittée : on rend la main au navigateur
      // plutôt que de faire tourner une boucle vide en arrière-plan.
      if (!active && !meteors.length) { raf = 0; return; }
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", resize);
    resize();
    frame();
    schedule();
    if (!reduce) window.setTimeout(function () { if (active) spawn(); }, 2200);

    /* ---------- Parallaxe discrète ---------- */
    if (!reduce && window.matchMedia("(hover: hover)").matches) {
      var sky = document.getElementById("sky");
      var terrain = document.getElementById("terrain");
      window.addEventListener("mousemove", function (e) {
        if (!active) return;
        var dx = (e.clientX / window.innerWidth - 0.5);
        var dy = (e.clientY / window.innerHeight - 0.5);
        sky.style.transform = "scale(1.06) translate(" + (-dx * 10).toFixed(2) + "px," + (-dy * 6).toFixed(2) + "px)";
        terrain.style.transform = "translate(" + (dx * 5).toFixed(2) + "px,0)";
      });
    }

    return {
      /** Le ciel ne s'anime que lorsqu'on le regarde. */
      setActive: function (on) {
        if (on === active) return;
        active = on;
        if (on) {
          resize();
          if (!raf) frame();
        } else {
          meteors.length = 0;
        }
      }
    };
}
