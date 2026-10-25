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
const { getFlash }   = require('./utils/flash');
const routes         = require('./routes/index');

const app = express();

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

/* ── Static files ── */
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
}));

/* ── Rate limiter (auth routes) ── */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Terlalu banyak percobaan. Coba lagi nanti.',
});
app.use('/login', authLimiter);
app.use('/register', authLimiter);

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
  res.locals.flashMessages = getFlash(req);
  res.locals.currentPath = req.path;
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
