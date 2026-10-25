'use strict';

const FaqModel     = require('../../models/faqModel');
const { setFlash } = require('../../utils/flash');

const AdminFaqController = {
  async list(req, res) {
    const faqs = await FaqModel.findAll();
    res.render('admin/faqs', { title: 'Kelola FAQ', layout: 'layouts/admin', faqs });
  },

  async create(req, res) {
    const { question, answer, sort_order } = req.body;
    await FaqModel.create({ question, answer, sort_order: parseInt(sort_order || '0', 10) });
    setFlash(req, 'success', 'FAQ berhasil ditambahkan.');
    return res.redirect('/admin/faqs');
  },

  async update(req, res) {
    const { question, answer, sort_order } = req.body;
    const is_active = req.body.is_active === 'on' ? 1 : 0;
    await FaqModel.update(req.params.id, { question, answer, sort_order: parseInt(sort_order || '0', 10), is_active });
    setFlash(req, 'success', 'FAQ berhasil diperbarui.');
    return res.redirect('/admin/faqs');
  },

  async destroy(req, res) {
    await FaqModel.delete(req.params.id);
    setFlash(req, 'success', 'FAQ berhasil dihapus.');
    return res.redirect('/admin/faqs');
  },
};

module.exports = AdminFaqController;
