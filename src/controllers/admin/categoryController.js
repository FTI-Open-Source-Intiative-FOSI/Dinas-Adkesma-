'use strict';

const CategoryModel = require('../../models/categoryModel');
const { setFlash } = require('../../utils/flash');
const { validationResult } = require('express-validator');

function slugify(str) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const AdminCategoryController = {
  /* GET /admin/categories */
  async list(req, res) {
    const categories = await CategoryModel.findAll();
    res.render('admin/categories', {
      title: 'Kelola Kategori',
      layout: 'layouts/admin',
      categories,
    });
  },

  /* POST /admin/categories */
  async create(req, res) {
    const errResult = validationResult(req);
    if (!errResult.isEmpty()) {
      setFlash(req, 'error', errResult.array()[0].msg);
      return res.redirect('/admin/categories');
    }
    const { name, description } = req.body;
    const slug = req.body.slug || slugify(name);
    await CategoryModel.create({ name, slug, description });
    setFlash(req, 'success', 'Kategori berhasil ditambahkan.');
    return res.redirect('/admin/categories');
  },

  /* POST /admin/categories/:id/edit */
  async update(req, res) {
    const errResult = validationResult(req);
    if (!errResult.isEmpty()) {
      setFlash(req, 'error', errResult.array()[0].msg);
      return res.redirect('/admin/categories');
    }
    const { name, slug, description } = req.body;
    // FIX: checkbox di view mengirim value="1" (bukan 'on'); terima keduanya.
    const is_active = (req.body.is_active === '1' || req.body.is_active === 'on') ? 1 : 0;
    await CategoryModel.update(req.params.id, { name, slug, description, is_active });
    setFlash(req, 'success', 'Kategori berhasil diperbarui.');
    return res.redirect('/admin/categories');
  },

  /* POST /admin/categories/:id/delete */
  async destroy(req, res) {
    try {
      await CategoryModel.delete(req.params.id);
      setFlash(req, 'success', 'Kategori berhasil dihapus.');
    } catch (err) {
      setFlash(req, 'error', 'Tidak dapat menghapus kategori yang sudah digunakan laporan.');
    }
    return res.redirect('/admin/categories');
  },
};

module.exports = AdminCategoryController;