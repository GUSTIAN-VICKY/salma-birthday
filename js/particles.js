/**
 * particles.js — Canvas star particle system
 */
(function () {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLORS = ['#ff6fa8', '#c084fc', '#fbbf24', '#ffffff', '#ff9fc5', '#d8b4fe', '#e8406a'];
  let W, H, particles = [], mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.reset = function () {
      this.x     = Math.random() * W;
      this.y     = Math.random() * H;
      this.r     = Math.random() * 1.8 + 0.3;
      this.ox    = this.x;
      this.oy    = this.y;
      this.vx    = (Math.random() - 0.5) * 0.25;
      this.vy    = (Math.random() - 0.5) * 0.25;
      this.alpha = Math.random() * 0.55 + 0.15;
      this.da    = (Math.random() - 0.5) * 0.006;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.twinkle = Math.random() > 0.7;
    };
    this.reset();
  }

  function init() {
    resize();
    particles = Array.from({ length: 60 }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      // Subtle mouse repulsion
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100;
        p.x += dx / dist * force * 1.5;
        p.y += dy / dist * force * 1.5;
      } else {
        p.x += (p.ox - p.x) * 0.02 + p.vx;
        p.y += (p.oy - p.y) * 0.02 + p.vy;
        p.ox += p.vx; p.oy += p.vy;
      }

      // Wrap
      if (p.ox < 0) p.ox = W; if (p.ox > W) p.ox = 0;
      if (p.oy < 0) p.oy = H; if (p.oy > H) p.oy = 0;

      // Alpha twinkle
      p.alpha += p.da;
      if (p.alpha < 0.1 || p.alpha > 0.75) p.da *= -1;

      ctx.beginPath();
      if (p.twinkle) {
        // 4-point star
        const s = p.r * 2.5;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(Date.now() * 0.0003);
        for (let i = 0; i < 4; i++) {
          ctx.lineTo(Math.cos((i * 90 - 45) * Math.PI / 180) * s,
                     Math.sin((i * 90 - 45) * Math.PI / 180) * s);
          ctx.lineTo(Math.cos((i * 90) * Math.PI / 180) * (s * 0.4),
                     Math.sin((i * 90) * Math.PI / 180) * (s * 0.4));
        }
        ctx.closePath();
        ctx.restore();
      } else {
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('touchmove', e => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }, { passive: true });

  init();
  draw();

  // Floating hearts
  const heartContainer = document.createElement('div');
  heartContainer.id = 'particles';
  const HEART_EMOJIS = ['❤️','💕','💖','💗','💝','🌸','✨','💫','🦋','⭐'];

  function spawnHeart() {
    const el = document.createElement('span');
    el.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
    el.style.cssText = `
      position:absolute;
      left:${Math.random() * 100}vw;
      bottom:-40px;
      font-size:${Math.random() * 0.6 + 0.5}rem;
      opacity:0;
      pointer-events:none;
      animation: floatHeart ${Math.random() * 10 + 12}s linear ${Math.random() * 2}s forwards;
    `;
    document.getElementById('particles').appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  // inject keyframe once
  if (!document.getElementById('heartKeyframe')) {
    const s = document.createElement('style');
    s.id = 'heartKeyframe';
    s.textContent = `
      @keyframes floatHeart {
        0%   { opacity:0; transform: translateY(0) rotate(0deg) scale(0.8); }
        8%   { opacity:0.85; }
        92%  { opacity:0.4; }
        100% { opacity:0; transform: translateY(-110vh) rotate(30deg) scale(1.2); }
      }
    `;
    document.head.appendChild(s);
  }

  setTimeout(() => {
    for (let i = 0; i < 5; i++) spawnHeart();
    setInterval(spawnHeart, 4000);
  }, 1500);
})();
