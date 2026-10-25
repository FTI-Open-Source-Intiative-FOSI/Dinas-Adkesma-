'use strict';

/**
 * Middleware pemeriksa role user.
 * @param {'admin'|'mahasiswa'} role
 */
function requireRole(role) {
  return function (req, res, next) {
    if (req.session && req.session.user && req.session.user.role === role) {
      return next();
    }
    // Jika sudah login tapi role salah
    if (req.session && req.session.user) {
      return res.status(403).render('error', {
        title: 'Akses Ditolak',
        message: 'Kamu tidak memiliki akses ke halaman ini.',
        layout: 'layouts/main',
      });
    }
    req.session.flash = req.session.flash || [];
    req.session.flash.push({ type: 'error', message: 'Silakan login terlebih dahulu.' });
    return res.redirect('/login');
  };
}

module.exports = { requireRole };
