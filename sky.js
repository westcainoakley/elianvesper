/* elianvesper.co.uk — the breathing sky, shared across pages */
(function () {
  "use strict";
  const canvas = document.getElementById("sky");
  if (!canvas) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");
  let W, H, stars = [], links = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    const count = Math.floor((W * H) / 16000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.4 + Math.random() * 1.1,
      amber: Math.random() < 0.14,
      phase: Math.random() * Math.PI * 2,
      speed: 0.00006 + Math.random() * 0.00012,
      dx: (Math.random() - 0.5) * 0.02,
      dy: (Math.random() - 0.5) * 0.02
    }));
    links = [];
  }

  function maybeLink(t) {
    if (links.length < 3 && Math.random() < 0.004) {
      const a = stars[Math.floor(Math.random() * stars.length)];
      let best = null, bd = 1e9;
      for (const b of stars) {
        if (b === a) continue;
        const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
        if (d < bd && d < 180 * 180) { bd = d; best = b; }
      }
      if (best) links.push({ a, b: best, born: t, life: 9000 + Math.random() * 7000 });
    }
    links = links.filter(l => t - l.born < l.life);
  }

  let last = 0;
  function frame(t) {
    if (t - last < 33) { requestAnimationFrame(frame); return; }
    last = t;
    ctx.clearRect(0, 0, W, H);

    for (const s of stars) {
      if (!reduceMotion) {
        s.x += s.dx; s.y += s.dy;
        if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
        if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
      }
      const breathe = reduceMotion ? 0.75 : 0.55 + 0.45 * Math.sin(t * s.speed * 2 * Math.PI * 60 + s.phase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.amber
        ? "rgba(224,163,74," + (0.35 + 0.4 * breathe) + ")"
        : "rgba(233,236,242," + (0.12 + 0.3 * breathe) + ")";
      ctx.fill();
    }

    if (!reduceMotion) {
      maybeLink(t);
      for (const l of links) {
        const age = (t - l.born) / l.life;
        const fade = age < 0.2 ? age / 0.2 : age > 0.75 ? (1 - age) / 0.25 : 1;
        ctx.beginPath();
        ctx.moveTo(l.a.x, l.a.y);
        ctx.lineTo(l.b.x, l.b.y);
        ctx.strokeStyle = "rgba(224,163,74," + (0.14 * fade) + ")";
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(frame);
})();
