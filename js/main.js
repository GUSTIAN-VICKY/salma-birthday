/**
 * main.js — App logic: API calls, UI interactions, animations
 */

const API = '/api';

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function toast(msg, type = 'default', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    el.style.transition = '0.3s';
    setTimeout(() => el.remove(), 300);
  }, duration);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function addRipple(btn, e) {
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
}

/* ═══════════════════════════════════════════════════════════════════════════
   INTERSECTION OBSERVER — SCROLL REVEAL
   ═══════════════════════════════════════════════════════════════════════════ */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

function initReveal() {
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
}

/* ═══════════════════════════════════════════════════════════════════════════
   COVER SCREEN
   ═══════════════════════════════════════════════════════════════════════════ */
function openApp() {
  const cover = document.getElementById('cover');
  const app   = document.getElementById('app');
  cover.classList.add('exit');
  app.removeAttribute('aria-hidden');
  playMusic();
  setTimeout(() => {
    cover.style.display = 'none';
    app.classList.add('visible');
    initReveal();
    initTypewriter();
    loadGallery();
  }, 600);
  Confetti.burst(null, null, 50);
}

document.getElementById('cover').addEventListener('click', openApp);
document.getElementById('cover').addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') openApp();
});

/* ═══════════════════════════════════════════════════════════════════════════
   NAVBAR
   ═══════════════════════════════════════════════════════════════════════════ */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  updateActiveNav();
});

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

function updateActiveNav() {
  const sections = ['hero', 'message', 'wishes', 'gallery', 'letter'];
  let current = '';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 120) current = id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG & HERO
   ═══════════════════════════════════════════════════════════════════════════ */
let config = { salmaName: 'Salma Salsabila Rahma', birthday: '2002-09-27', senderName: 'Seseorang yang Mencintaimu' };

function applyConfig(data) {
  config = data;
  const firstName = (data.salmaName || 'Salma').split(' ')[0];
  const coverName = document.getElementById('coverName');
  if (coverName) coverName.textContent = firstName;

  // Hero age line (Salma is turning 25)
  const bday = new Date(data.birthday || '2001-09-27');
  const now = new Date();
  const calculatedAge = now.getFullYear() - bday.getFullYear()
    - (now < new Date(now.getFullYear(), bday.getMonth(), bday.getDate()) ? 1 : 0);
  const age = data.age || calculatedAge || 25;
  const heroAge = document.getElementById('heroAge');
  if (heroAge) heroAge.innerHTML = `🎂 <strong style="color:var(--pink);font-weight:700;">${age} tahun</strong> yang luar biasa ✨`;

  const msgSender = document.getElementById('msgSender');
  if (msgSender) msgSender.textContent = `— ${data.senderName || 'Seseorang yang Mencintaimu'} 💕`;
}

fetch(`${API}/config`)
  .then(r => { if (!r.ok) throw new Error(); return r.json(); })
  .then(applyConfig)
  .catch(() => {
    fetch('data/config.json')
      .then(r => r.json())
      .then(applyConfig)
      .catch(() => applyConfig(config));
  });

// Interactive 3D birthday cake
const heroCake = document.getElementById('heroCakeInteractive');
heroCake?.addEventListener('click', () => {
  const rect = heroCake.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      spawnFlyingHeart(cx + (Math.random() - 0.5) * 100, cy + (Math.random() - 0.5) * 100);
    }, i * 80);
  }
  if (window.Confetti?.burst) {
    window.Confetti.burst(cx, cy, 35);
  }
  toast('Tiup lilin & panjatkan doa terbaikmu, Salma! 🎂✨', 'success');
});

/* ═══════════════════════════════════════════════════════════════════════════
   TYPEWRITER
   ═══════════════════════════════════════════════════════════════════════════ */
const TYPEWRITER_TEXTS = [
  'Happy Birthday, Salma! 🎉',
  'Semoga bahagia selalu 💕',
  'Kamu sangat istimewa ✨',
  'Selamat Ulang Tahun! 🎂',
  'Dicintai sepenuh hati ❤️'
];

function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  let textIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const current = TYPEWRITER_TEXTS[textIdx];
    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        setTimeout(type, 2200);
        return;
      }
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        textIdx = (textIdx + 1) % TYPEWRITER_TEXTS.length;
      }
    }
    setTimeout(type, deleting ? 45 : 80);
  }
  type();
}

/* ═══════════════════════════════════════════════════════════════════════════
   CELEBRATION POPUP CARD (HARAPAN & DOA SAYA)
   ═══════════════════════════════════════════════════════════════════════════ */
const celebrationModal = document.getElementById('celebrationModal');
const closeCelebrateModal = document.getElementById('closeCelebrateModal');
const celebrateBackdrop = document.getElementById('celebrateBackdrop');
const confirmCelebrateBtn = document.getElementById('confirmCelebrateBtn');
let wishesCardData = null;

function getDefaultWishesCard() {
  return {
    title: 'Harapan & Doa Terindah untuk Salma',
    subtitle: 'Di usiamu yang ke-25 tahun ini ✨',
    items: [
      {
        icon: '🌸',
        title: 'Kebahagiaan yang Melimpah',
        desc: 'Semoga setiap hari yang kamu lalui selalu dipenuhi senyuman tulus, tawa yang lepas, dan hati yang selalu damai.'
      },
      {
        icon: '🌟',
        title: 'Kesehatan & Keberkahan Hidup',
        desc: 'Semoga senantiasa diberikan raga yang sehat, jiwa yang kuat, serta umur yang penuh dengan keberkahan.'
      },
      {
        icon: '🚀',
        title: 'Semua Mimpi & Harapan Terwujud',
        desc: 'Semoga segala cita-cita besar, karier, dan impian indahmu dimudahkan jalannya dan segera menjadi kenyataan.'
      },
      {
        icon: '💖',
        title: 'Selalu Dikelilingi Kasih Sayang',
        desc: 'Semoga kamu selalu merasa dicintai, dihargai, dan ditemani oleh orang-orang yang tulus menyayangimu.'
      },
      {
        icon: '✨',
        title: 'Semakin Bersinar di Usia 25',
        desc: 'Semoga di usia perak yang istimewa ini, Salma tumbuh menjadi pribadi yang semakin anggun, bijaksana, dan bersinar.'
      }
    ],
    closing: 'Selamat ulang tahun yang ke-25, Salma Salsabila Rahma. Terima kasih telah lahir ke dunia dan menjadi sosok yang begitu berarti. Aku akan selalu ada untuk mendukung dan mencintaimu. ❤️',
    signature: '— Dari seseorang yang selalu mencintaimu 💕'
  };
}

function renderWishesCard(data) {
  if (!data) return;
  const titleEl = document.getElementById('celebrateCardTitle');
  const subEl = document.getElementById('celebrateCardSub');
  const listEl = document.getElementById('celebrateWishesList');
  const closingEl = document.getElementById('celebrateClosing');
  const signEl = document.getElementById('celebrateSignature');

  if (titleEl && data.title) titleEl.textContent = data.title;
  if (subEl && data.subtitle) subEl.textContent = data.subtitle;
  if (closingEl && data.closing) closingEl.textContent = `"${data.closing}"`;
  if (signEl && data.signature) signEl.textContent = data.signature;

  if (listEl && Array.isArray(data.items)) {
    listEl.innerHTML = data.items.map(item => `
      <div class="celebrate-wish-item">
        <span class="wish-item-icon">${escapeHtml(item.icon || '✨')}</span>
        <div class="wish-item-text">
          <h4>${escapeHtml(item.title || '')}</h4>
          <p>${escapeHtml(item.desc || '')}</p>
        </div>
      </div>
    `).join('');
  }
}

function loadWishesCard() {
  fetch(`${API}/wishes-card`)
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(data => {
      wishesCardData = data;
      renderWishesCard(data);
    })
    .catch(() => {
      fetch('data/wishes_card.json')
        .then(r => r.json())
        .then(data => {
          wishesCardData = data;
          renderWishesCard(data);
        })
        .catch(() => {
          renderWishesCard(getDefaultWishesCard());
        });
    });
}

function openCelebrationCard() {
  if (!wishesCardData) loadWishesCard();
  if (celebrationModal) {
    celebrationModal.classList.add('open');
    celebrationModal.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeCelebrationCard() {
  if (celebrationModal) {
    celebrationModal.classList.remove('open');
    celebrationModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

closeCelebrateModal?.addEventListener('click', closeCelebrationCard);
celebrateBackdrop?.addEventListener('click', closeCelebrationCard);
confirmCelebrateBtn?.addEventListener('click', () => {
  closeCelebrationCard();
  toast('Doa terbaik telah dipanjatkan untuk Salma 🤲💖', 'success');
  if (window.Confetti?.burst) window.Confetti.burst(null, null, 50);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && celebrationModal?.classList.contains('open')) {
    closeCelebrationCard();
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   CELEBRATE BUTTON
   ═══════════════════════════════════════════════════════════════════════════ */
function spawnFlyingCelebrationHeart(x, y) {
  const emojis = ['💖', '🎉', '✨', '🎂', '🌸', '💝', '⭐', '🎈', '🍰'];
  const el = document.createElement('div');
  el.className = 'flying-heart';
  el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.fontSize = `${Math.random() * 0.8 + 1.3}rem`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

document.getElementById('celebrateBtn')?.addEventListener('click', function (e) {
  addRipple(this, e);

  // 1. Play birthday music
  playMusic();

  // 2. Open Popup Card Harapan Saya
  openCelebrationCard();

  // 3. Heart & sparkles explosion from the button
  const rect = this.getBoundingClientRect();
  const bx = rect.left + rect.width / 2;
  const by = rect.top + rect.height / 2;
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      spawnFlyingCelebrationHeart(
        bx + (Math.random() - 0.5) * 180,
        by + (Math.random() - 0.5) * 80
      );
    }, i * 50);
  }

  // 4. Cake happy celebratory bounce
  const cake = document.getElementById('heroCakeInteractive');
  if (cake) {
    cake.classList.add('cake-celebrating');
    setTimeout(() => cake.classList.remove('cake-celebrating'), 2200);
  }

  // 5. Background fireworks blooms
  if (window.Confetti?.fireworks) {
    window.Confetti.fireworks(6);
  } else if (window.Confetti?.burst) {
    window.Confetti.burst(null, null, 70);
  }
});

document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('click', function (e) {
    addRipple(this, e);
  });
});


/* ═══════════════════════════════════════════════════════════════════════════
   AUTO-SLIDING PHOTO COLLAGE
   ═══════════════════════════════════════════════════════════════════════════ */
let galleryPhotos = [];
let currentLightboxIdx = 0;

function shuffleArray(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function loadGallery() {
  const track1 = document.getElementById('track1');
  if (!track1) return;

  function processGallery(items) {
    if (!Array.isArray(items)) return;
    const rawPhotos = items.filter(it => it.type === 'image' || !it.type || /\.(jpg|jpeg|png|webp|gif)$/i.test(it.url || it.filename || ''));
    // Ensure relative URL for GitHub Pages / static hosting compatibility
    rawPhotos.forEach(p => {
      if (p.url && p.url.startsWith('/')) {
        p.url = p.url.replace(/^\/+/, '');
      }
    });
    galleryPhotos = shuffleArray(rawPhotos);
    if (!galleryPhotos.length) return;
    distributeAndRenderTracks(galleryPhotos);
  }

  fetch(`${API}/gallery`)
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(processGallery)
    .catch(() => {
      fetch('data/gallery.json')
        .then(r => r.json())
        .then(processGallery)
        .catch(() => {});
    });
}

function distributeAndRenderTracks(photos) {
  const track1 = document.getElementById('track1');
  const track2 = document.getElementById('track2');
  const track3 = document.getElementById('track3');
  const row1Items = [];
  const row2Items = [];
  const row3Items = [];

  photos.forEach((photo, idx) => {
    if (idx % 3 === 0) row1Items.push({ photo, idx });
    else if (idx % 3 === 1) row2Items.push({ photo, idx });
    else row3Items.push({ photo, idx });
  });

  renderCollageTrack(track1, row1Items);
  renderCollageTrack(track2, row2Items);
  renderCollageTrack(track3, row3Items);
}

function renderCollageTrack(trackEl, itemsWithIdx) {
  if (!trackEl || !itemsWithIdx.length) return;

  const cardTypes = ['card-tall', 'card-wide', 'card-square', 'card-portrait'];
  const tilts = ['tilt-a', 'tilt-b', 'tilt-c', 'tilt-d'];

  function createCards(list) {
    return list.map((itemObj, i) => {
      const p = itemObj.photo;
      const globalIdx = itemObj.idx;
      const cardType = cardTypes[(globalIdx + i) % cardTypes.length];
      const tilt = tilts[(globalIdx * 2 + i) % tilts.length];
      const cap = escapeHtml(p.caption || 'Momen indah kita 💕');
      const dateText = escapeHtml(p.date || `Momen ${globalIdx + 1}`);

      return `
        <div class="collage-card ${cardType} ${tilt}" data-idx="${globalIdx}" data-src="${p.url}" data-caption="${cap}">
          <img src="${p.url}" alt="${cap}" loading="lazy" />
          <div class="collage-card-overlay"></div>
          <span class="collage-card-date">${dateText}</span>
          <button class="collage-card-like" title="Sukai foto">❤️</button>
          <div class="collage-card-caption">${cap}</div>
        </div>
      `;
    }).join('');
  }

  // Duplicate cards for seamless infinite marquee loop
  const cardsHtml = createCards(itemsWithIdx);
  trackEl.innerHTML = cardsHtml + cardsHtml;

  // Bind interactions on cards
  trackEl.querySelectorAll('.collage-card').forEach(card => {
    const likeBtn = card.querySelector('.collage-card-like');
    likeBtn?.addEventListener('click', e => {
      e.stopPropagation();
      likeBtn.classList.toggle('liked');
      spawnFlyingHeart(e.clientX, e.clientY);
    });

    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.idx, 10);
      openPhotoLightbox(idx);
    });
  });
}

function spawnFlyingHeart(x, y) {
  const heart = document.createElement('div');
  heart.className = 'flying-heart';
  heart.textContent = '💖';
  heart.style.left = `${x - 12}px`;
  heart.style.top = `${y - 12}px`;
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 1200);
}



/* Lightbox */
function openPhotoLightbox(index) {
  if (!galleryPhotos.length) return;
  currentLightboxIdx = (index + galleryPhotos.length) % galleryPhotos.length;
  const photo = galleryPhotos[currentLightboxIdx];

  let lb = document.querySelector('.lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `
      <button class="lightbox-close" title="Tutup (Esc)">✕</button>
      <button class="lightbox-nav-btn lightbox-prev" title="Sebelumnya (←)">‹</button>
      <div class="lightbox-content-box">
        <div class="lightbox-img-wrap">
          <img id="lbImg" src="" alt="Kenangan" />
        </div>
        <div class="lightbox-footer">
          <div class="lightbox-caption" id="lbCaption"></div>
          <div class="lightbox-counter" id="lbCounter"></div>
        </div>
      </div>
      <button class="lightbox-nav-btn lightbox-next" title="Berikutnya (→)">›</button>
    `;

    lb.querySelector('.lightbox-close').addEventListener('click', () => closeLightbox());
    lb.querySelector('.lightbox-prev').addEventListener('click', (e) => {
      e.stopPropagation();
      openPhotoLightbox(currentLightboxIdx - 1);
    });
    lb.querySelector('.lightbox-next').addEventListener('click', (e) => {
      e.stopPropagation();
      openPhotoLightbox(currentLightboxIdx + 1);
    });
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

    document.addEventListener('keydown', handleLightboxKey);
    document.body.appendChild(lb);
  }

  const imgEl = document.getElementById('lbImg');
  const capEl = document.getElementById('lbCaption');
  const countEl = document.getElementById('lbCounter');

  imgEl.src = photo.url;
  imgEl.alt = photo.caption || 'Foto Kenangan';
  capEl.textContent = photo.caption || 'Momen Indah Bersama Salma 💕';
  countEl.textContent = `Foto ${currentLightboxIdx + 1} dari ${galleryPhotos.length}`;
}

function closeLightbox() {
  const lb = document.querySelector('.lightbox');
  if (lb) lb.remove();
  document.removeEventListener('keydown', handleLightboxKey);
}

function handleLightboxKey(e) {
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowLeft') openPhotoLightbox(currentLightboxIdx - 1);
  else if (e.key === 'ArrowRight') openPhotoLightbox(currentLightboxIdx + 1);
}



/* ═══════════════════════════════════════════════════════════════════════════
   LOVE LETTER
   ═══════════════════════════════════════════════════════════════════════════ */
const togglePwd = document.getElementById('togglePwd');
const letterPwd = document.getElementById('letterPassword');

togglePwd?.addEventListener('click', () => {
  const isText = letterPwd.type === 'text';
  letterPwd.type = isText ? 'password' : 'text';
  togglePwd.textContent = isText ? '👁' : '🙈';
});

document.getElementById('letterForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const password = (letterPwd.value || '').trim();
  const errEl = document.getElementById('letterError');

  function showError() {
    errEl.classList.remove('hidden');
    letterPwd.style.borderColor = 'var(--rose)';
    setTimeout(() => { errEl.classList.add('hidden'); letterPwd.style.borderColor = ''; }, 3000);
  }

  function unlockLetter(data) {
    document.getElementById('letterLocked').style.display = 'none';
    const contentEl = document.getElementById('letterContent');
    contentEl.classList.remove('hidden');
    contentEl.innerHTML = `
      <div class="letter-header">
        <span class="letter-emoji">💌</span>
        <h3>Surat Rahasia Untukmu</h3>
      </div>
      <div class="letter-body">${escapeHtml(data.content)}</div>
      <div class="letter-from">${escapeHtml(data.from)}</div>
    `;
    revealObs.observe(contentEl);
    playMusic();
    Confetti.burst(null, null, 40);
    toast('💌 Surat terbuka! Ini hanya untukmu, Salma.', 'success', 5000);
  }

  try {
    const res = await fetch(`${API}/love-letter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (res.ok) {
      const data = await res.json();
      unlockLetter(data);
      return;
    } else if (res.status === 401) {
      showError();
      return;
    }
  } catch {
    // API server not present (GitHub Pages static mode)
  }

  // Static Fallback for GitHub Pages
  if (password.toLowerCase() === 'salmasayang') {
    try {
      const res = await fetch('data/letter.json');
      const data = await res.json();
      unlockLetter(data);
    } catch {
      unlockLetter({
        content: "Hei Salma Salsabila Rahma yang paling cantik...\nSelamat ulang tahun ke-25! ❤️",
        from: "Seseorang yang Selalu Mencintaimu 💕"
      });
    }
  } else {
    showError();
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   MUSIC (Auto-plays on letter/card open)
   ═══════════════════════════════════════════════════════════════════════════ */
const audio = document.getElementById('bgAudio');
let musicOn = false;

function playMusic() {
  if (!audio) return;
  audio.play()
    .then(() => {
      musicOn = true;
    })
    .catch(() => {
      musicOn = false;
    });
}

/* ═══════════════════════════════════════════════════════════════════════════
   FOOTER YEAR
   ═══════════════════════════════════════════════════════════════════════════ */
const footerYear = document.getElementById('footerYear');
if (footerYear) {
  footerYear.textContent = `${new Date().getFullYear()} · Dibuat khusus untuk Salma Salsabila Rahma 💕`;
}

// Preload gallery & wishes card on script start
loadGallery();
loadWishesCard();

