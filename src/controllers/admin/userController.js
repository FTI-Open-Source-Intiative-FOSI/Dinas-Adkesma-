'use strict';

const UserModel = require('../../models/userModel');

const PAGE_SIZE = 20;
const ROLES     = ['admin', 'mahasiswa'];

/** Bungkus handler async agar error dilempar ke error handler Express (bukan crash). */
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Ambil & bersihkan filter dari query string. */
function readFilters(src) {
  src = src || {};
  const search = String(src.search || '').trim().slice(0, 100);
  const role   = ROLES.includes(src.role) ? src.role : '';
  const page   = Math.max(1, parseInt(src.page, 10) || 1);
  return { search, role, page };
}

/** Bangun URL daftar pengguna yang mempertahankan pencarian, filter, dan halaman. */
function buildUrl({ search, role, page }) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (role)   params.set('role', role);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return '/admin/users' + (qs ? '?' + qs : '');
}

const AdminUserController = {
  /* GET /admin/users */
  list: wrap(async (req, res) => {
    const filters = readFilters(req.query);

    const [{ rows: users, total }, stats] = await Promise.all([
      UserModel.findAll({ ...filters, limit: PAGE_SIZE }),
      UserModel.getStats(),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    // Halaman di luar jangkauan (mis. setelah filter berubah) -> ke halaman terakhir.
    if (filters.page > totalPages) {
      return res.redirect(buildUrl({ ...filters, page: totalPages }));
    }

    return res.render('admin/users', {
      title: 'Kelola Pengguna',
      layout: 'layouts/admin',
      users, total, stats, totalPages,
      page: filters.page,
      filters,
    });
  }),
};

module.exports = AdminUserController;