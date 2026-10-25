'use strict';

/** Pastikan user sudah login. Jika belum, redirect ke /login */
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) return next();
  req.session.flash = req.session.flash || [];
  req.session.flash.push({ type: 'error', message: 'Silakan login terlebih dahulu.' });
  return res.redirect('/login');
}

/** Pastikan user belum login (tamu). Jika sudah login, redirect ke halaman sesuai role */
function isGuest(req, res, next) {
  if (!req.session || !req.session.user) return next();
  const role = req.session.user.role;
  return res.redirect(role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
}

module.exports = { isLoggedIn, isGuest };
