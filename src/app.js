'use strict';

const path           = require('path');
const express        = require('express');
const helmet         = require('helmet');
const session        = require('express-session');
const MySQLStore     = require('express-mysql-session')(session);
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const rateLimit      = require('express-rate-limit');
const pool           = require('./config/db');
const { setFlash, getFlash } = require('./utils/flash');
const routes         = require('./routes/index');

const app = express();

// Penting untuk deployment di balik reverse proxy (Railway, Render, Nginx, cPanel)
// agar session cookie secure (HTTPS) dan rate-limiter membaca IP asli pengguna.
app.set('trust proxy', 1);

/* ── Security ── */
app.use(helmet({
  contentSecurityPolicy: false,   // Tailwind CDN & inline styles
  crossOriginEmbedderPolicy: false,
}));

/* ── Body parsers ── */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* ── Method override (PUT/DELETE via POST) ── */
app.use(methodOverride('_method'));

const { UPLOAD_DIR } = require('./middlewares/upload');

/* ── Static files ── */
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(UPLOAD_DIR));

/* ── Session (MySQL store) ── */
const sessionStore = new MySQLStore({}, pool);
app.use(session({
  key:               'lapor_sid',
  secret:            process.env.SESSION_SECRET || 'default-secret-change-me',
  store:             sessionStore,
  resave:            false,
  saveUninitialized: false,
  cookie: {
    maxAge:   1000 * 60 * 60 * 24,  // 1 hari
    httpOnly: true,
    secure:   'auto',
    sameSite: 'lax',
  },
}));

/* ── Rate limiter (hanya POST login/register & hanya percobaan gagal) ── */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  skipSuccessfulRequests: true,
  requestWasSuccessful: (req) => Boolean(req.session && req.session.user),
  handler: (req, res) => {
    setFlash(req, 'error', 'Terlalu banyak percobaan gagal. Silakan coba lagi nanti.');
    return res.redirect(req.path || '/login');
  },
});
app.post('/login', authLimiter);
app.post('/register', authLimiter);

/* ── View engine (EJS + layouts) ── */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

/* ── Global locals (available in every EJS template) ── */
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.currentPath = req.path;
  res.locals.flashMessages = [];

  // Ambil flash message hanya saat halaman benar-benar di-render (bukan saat redirect)
  const origRender = res.render;
  res.render = function (view, options, callback) {
    if (!res.locals.flashMessages || res.locals.flashMessages.length === 0) {
      res.locals.flashMessages = getFlash(req);
    }
    return origRender.call(this, view, options, callback);
  };
  next();
});

/* ── Routes ── */
app.use(routes);

/* ── 404 handler ── */
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 - Halaman Tidak Ditemukan',
    message: 'Halaman yang kamu cari tidak ditemukan.',
    layout: 'layouts/main',
  });
});

/* ── Error handler ── */
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err);
  res.status(500).render('error', {
    title: '500 - Kesalahan Server',
    message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti.',
    layout: 'layouts/main',
  });
});

module.exports = app;
