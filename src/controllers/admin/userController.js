'use strict';

const UserModel    = require('../../models/userModel');
const { setFlash } = require('../../utils/flash');

const AdminUserController = {
  async list(req, res) {
    const page   = parseInt(req.query.page   || '1', 10);
    const search = req.query.search || '';
    const { rows: users, total } = await UserModel.findAll({ page, search });
    res.render('admin/users', {
      title: 'Kelola Pengguna',
      layout: 'layouts/admin',
      users, total, page,
      totalPages: Math.ceil(total / 20),
      search,
    });
  },

  async toggleActive(req, res) {
    await UserModel.toggleActive(req.params.id);
    setFlash(req, 'success', 'Status pengguna berhasil diubah.');
    return res.redirect('/admin/users');
  },
};

module.exports = AdminUserController;
