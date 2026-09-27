/**
 * confetti.js — Ambient Blurred Background Fireworks & Bokeh Particle System
 * Creates soft, dreamy, romantic glowing fireworks blooms in the background.
 */
const Confetti = (() => {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return { burst: () => {}, fireworks: () => {}, stop: () => {} };

  const ctx = canvas.getContext('2d');
  let pieces = [];
  let running = false;
  let ambientTimer = null;

  const COLORS = [
    '#ff6fa8', '#ff9fc5', '#c084fc', '#d8b4fe',
    '#fbbf24', '#fde68a', '#ffffff', '#fb7185',
    '#f43f5e', '#e879f9', '#fda4af'
  ];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function createFireworkSparks(x, y, count = 45) {
    const burstColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const burstColor2 = COLORS[Math.floor(Math.random() * COLORS.length)];
    const baseSpeed = Math.random() * 3 + 2.5;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = baseSpeed * (Math.random() * 0.7 + 0.65);
      pieces.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.04,
        drag: 0.965,
        r: Math.random() * 6 + 4, // bokeh orb radius
        color: Math.random() > 0.35 ? burstColor : burstColor2,
        alpha: 1,
        alphaDecay: Math.random() * 0.012 + 0.008
      });
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces = pieces.filter(p => p.alpha > 0.02);

    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i];
      p.vy += p.gravity;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.alphaDecay;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (pieces.length > 0 || running) {
      requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function burst(x, y, count = 50) {
    const cx = x ?? (Math.random() * canvas.width * 0.75 + canvas.width * 0.12);
    const cy = y ?? (Math.random() * canvas.height * 0.55 + canvas.height * 0.12);
    createFireworkSparks(cx, cy, count);

    if (!running) {
      running = true;
      loop();
    }
  }

  function fireworks(count = 4) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        burst(
          Math.random() * canvas.width * 0.75 + canvas.width * 0.12,
          Math.random() * canvas.height * 0.5 + canvas.height * 0.1,
          45
        );
      }, i * 400);
    }
  }

  // Gentle ambient background firework bloom
  function startAmbient() {
    if (ambientTimer) clearInterval(ambientTimer);
    ambientTimer = setInterval(() => {
      // Gentle bloom in the background sky
      burst(
        Math.random() * canvas.width * 0.8 + canvas.width * 0.1,
        Math.random() * canvas.height * 0.55 + canvas.height * 0.1,
        35
      );
    }, 4500);
  }

  // Start gentle ambient blooms after 2 seconds
  setTimeout(startAmbient, 2000);

  function stop() {
    running = false;
    if (ambientTimer) clearInterval(ambientTimer);
    pieces = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  return { burst, fireworks, stop };
})();
