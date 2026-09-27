const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// ── UPLOAD CONFIG ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase())
             && allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Hanya file gambar yang diizinkan!'));
  }
});

// ── DATA HELPERS ────────────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

function readJSON(file, fallback) {
  const fp = path.join(DATA_DIR, file);
  if (!fs.existsSync(fp)) return fallback;
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}
function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// ── INIT DATA ────────────────────────────────────────────────────────────────
const CONFIG_DEFAULT = {
  salmaName: 'Salma Salsabila Rahma',
  birthday: '2001-09-27',        // 25th birthday
  secretPassword: 'salmasayang', // ← password love letter
  senderName: 'Seseorang yang Mencintaimu'
};
if (!fs.existsSync(path.join(DATA_DIR, 'config.json'))) {
  writeJSON('config.json', CONFIG_DEFAULT);
}
if (!fs.existsSync(path.join(DATA_DIR, 'wishes.json'))) {
  writeJSON('wishes.json', []);
}
if (!fs.existsSync(path.join(DATA_DIR, 'gallery.json'))) {
  writeJSON('gallery.json', []);
}

// ── ROUTES ───────────────────────────────────────────────────────────────────

// GET config (public info only)
app.get('/api/config', (req, res) => {
  const cfg = readJSON('config.json', CONFIG_DEFAULT);
  res.json({
    salmaName: cfg.salmaName,
    birthday: cfg.birthday,
    age: cfg.age || 25,
    senderName: cfg.senderName
  });
});

// ─ WISHES ─
app.get('/api/wishes', (req, res) => {
  const wishes = readJSON('wishes.json', []);
  res.json(wishes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// ─ CELEBRATION WISHES CARD (HARAPAN SAYA) ─
app.get('/api/wishes-card', (req, res) => {
  const card = readJSON('wishes_card.json', {
    title: 'Harapan & Doa Terindah untuk Salma',
    subtitle: 'Di usiamu yang ke-25 tahun ini ✨',
    items: [],
    closing: 'Selamat ulang tahun ke-25, Salma. Semoga bahagia selalu! ❤️',
    signature: '— Dari seseorang yang selalu mencintaimu 💕'
  });
  res.json(card);
});

app.post('/api/wishes', (req, res) => {
  const { name, message, emoji } = req.body;
  if (!name?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Nama dan pesan wajib diisi!' });
  }
  const wishes = readJSON('wishes.json', []);
  const wish = {
    id: Date.now().toString(),
    name: name.trim().substring(0, 50),
    message: message.trim().substring(0, 300),
    emoji: emoji || '💕',
    createdAt: new Date().toISOString()
  };
  wishes.push(wish);
  writeJSON('wishes.json', wishes);
  res.status(201).json(wish);
});

app.delete('/api/wishes/:id', (req, res) => {
  const wishes = readJSON('wishes.json', []);
  const filtered = wishes.filter(w => w.id !== req.params.id);
  writeJSON('wishes.json', filtered);
  res.json({ ok: true });
});

// ─ GALLERY ─
app.get('/api/gallery', (req, res) => {
  const gallery = readJSON('gallery.json', []);
  res.json(gallery);
});

app.post('/api/gallery', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File foto wajib diunggah!' });
  const { caption } = req.body;
  const gallery = readJSON('gallery.json', []);
  const item = {
    id: Date.now().toString(),
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    caption: caption?.trim().substring(0, 100) || '',
    type: 'image',
    span: 'normal',
    createdAt: new Date().toISOString()
  };
  gallery.unshift(item);
  writeJSON('gallery.json', gallery);
  res.status(201).json(item);
});

app.delete('/api/gallery/:id', (req, res) => {
  const gallery = readJSON('gallery.json', []);
  const item = gallery.find(g => g.id === req.params.id);
  if (item) {
    const fp = path.join(__dirname, 'public', 'uploads', item.filename);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
  writeJSON('gallery.json', gallery.filter(g => g.id !== req.params.id));
  res.json({ ok: true });
});

// ─ LOVE LETTER ─
app.post('/api/love-letter', (req, res) => {
  const { password } = req.body;
  const cfg = readJSON('config.json', CONFIG_DEFAULT);
  if (password !== cfg.secretPassword) {
    return res.status(401).json({ error: 'Password salah, coba lagi! 🔐' });
  }
  const letter = readJSON('letter.json', {
    content: `Hei Salma Salsabila Rahma yang paling cantik,

Kalau kamu bisa membaca surat ini, berarti kamu sudah tahu rahasianya...

Aku ingin kamu tahu bahwa setiap hari denganmu adalah hari terbaik dalam hidupku. 
Senyummu adalah alasan aku semangat di pagi hari. Tawa kecilmu selalu berhasil 
membuat hatiku hangat, bahkan di hari yang paling melelahkan sekalipun.

Di hari ulang tahunmu ini, aku mendoakan agar semua hal baik di dunia ini 
datang kepadamu. Kamu layak mendapatkan segalanya — kebahagiaan tanpa batas, 
mimpi yang terwujud, dan cinta yang tulus.

Aku berjanji untuk selalu ada untukmu, mendukungmu, dan mencintaimu.
Selamat ulang tahun, Salma. Kamu adalah duniaku. ❤️

Dengan cinta yang tak terhingga,
Orang yang paling menyayangimu 💕`,
    from: cfg.senderName
  });
  res.json(letter);
});

// ─ COUNTDOWN ─
app.get('/api/countdown', (req, res) => {
  const cfg = readJSON('config.json', CONFIG_DEFAULT);
  const now = new Date();
  const bday = new Date(cfg.birthday);
  
  // Next birthday
  let next = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
  if (next < now) next.setFullYear(next.getFullYear() + 1);
  
  const diff = next - now;
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const age = now.getFullYear() - bday.getFullYear()
    - (now < new Date(now.getFullYear(), bday.getMonth(), bday.getDate()) ? 1 : 0);

  const isToday = now.getDate() === bday.getDate() && now.getMonth() === bday.getMonth();

  res.json({ days, hours, minutes, seconds, age, isToday, birthday: cfg.birthday });
});

// ── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎂 ======================================`);
  console.log(`   Happy Birthday Salma Website`);
  console.log(`   Server berjalan di http://localhost:${PORT}`);
  console.log(`🎂 ======================================\n`);
});
