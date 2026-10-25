'use strict';

const CategoryModel = require('../models/categoryModel');
const FaqModel      = require('../models/faqModel');
const ReportModel   = require('../models/reportModel');

const PublicController = {
  /* GET / */
  async home(req, res) {
    const categories = await CategoryModel.findAll(true);
    const faqs       = await FaqModel.findAll(true);
    res.render('public/home', {
      title: 'Beranda - Lapor Mahasiswa',
      layout: 'layouts/main',
      categories,
      faqs: faqs.slice(0, 4),
    });
  },

  /* GET /category/:slug */
  async category(req, res) {
    const cat = await CategoryModel.findBySlug(req.params.slug);
    if (!cat || !cat.is_active) return res.status(404).render('error', {
      title: '404 - Tidak Ditemukan', message: 'Kategori tidak ditemukan.', layout: 'layouts/main',
    });
    res.render('public/category', {
      title: `Kategori: ${cat.name}`,
      layout: 'layouts/main',
      category: cat,
    });
  },

  /* GET /faq */
  async faq(req, res) {
    const faqs = await FaqModel.findAll(true);
    res.render('public/faq', { title: 'FAQ - Lapor Mahasiswa', layout: 'layouts/main', faqs });
  },

  /* GET /check — form cek status tiket */
  checkStatus(req, res) {
    res.render('public/check-status', {
      title: 'Cek Status Laporan',
      layout: 'layouts/main',
      report: null,
      searched: false,
    });
  },

  /* POST /check */
  async searchStatus(req, res) {
    const { ticket_code } = req.body;
    const report = ticket_code ? await ReportModel.findByTicket(ticket_code.trim().toUpperCase()) : null;
    res.render('public/check-status', {
      title: 'Cek Status Laporan',
      layout: 'layouts/main',
      report,
      searched: true,
      ticket_code,
    });
  },
};

module.exports = PublicController;
