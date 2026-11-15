'use strict';

/** Pastikan user sudah login. */
function isLoggedIn(req, res, next) {
  if (!(req.session && req.session.user)) {
    req.session.flash = req.session.flash || [];
    req.session.flash.push({ type: 'error', message: 'Silakan login terlebih dahulu.' });
    return res.redirect('/login');
  }
  return next();
}

/** Pastikan user belum login (tamu). Jika sudah login, redirect ke halaman sesuai role */
function isGuest(req, res, next) {
  if (!req.session || !req.session.user) return next();
  const role = req.session.user.role;
  return res.redirect(role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
}

module.exports = { isLoggedIn, isGuest };