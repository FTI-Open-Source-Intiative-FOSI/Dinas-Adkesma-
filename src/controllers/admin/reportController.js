'use strict';

const ReportModel   = require('../../models/reportModel');
const CategoryModel = require('../../models/categoryModel');
const { setFlash }  = require('../../utils/flash');

const STATUSES = ['menunggu', 'diverifikasi', 'diproses', 'selesai', 'ditolak'];

const AdminReportController = {
  /* GET /admin/reports */
  async list(req, res) {
    const page        = parseInt(req.query.page     || '1', 10);
    const status      = req.query.status      || '';
    const category_id = req.query.category_id || '';
    const search      = req.query.search      || '';
    const { rows: reports, total } = await ReportModel.findAll({ page, status, category_id, search });
    const categories = await CategoryModel.findAll();
    res.render('admin/reports', {
      title: 'Kelola Laporan',
      layout: 'layouts/admin',
      reports, total, page,
      totalPages: Math.ceil(total / 15),
      categories, statuses: STATUSES,
      filters: { status, category_id, search },
    });
  },

  /* GET /admin/reports/:id */
  async detail(req, res) {
    const report = await ReportModel.findByIdWithDetails(parseInt(req.params.id, 10));
    if (!report) return res.status(404).render('error', {
      title: 'Tidak Ditemukan', message: 'Laporan tidak ditemukan.', layout: 'layouts/admin',
    });
    res.render('admin/report-detail', {
      title: `Detail Laporan #${report.ticket_code}`,
      layout: 'layouts/admin',
      report, statuses: STATUSES,
    });
  },

  /* POST /admin/reports/:id/status */
  async updateStatus(req, res) {
    const id         = parseInt(req.params.id, 10);
    const report     = await ReportModel.findByIdWithDetails(id);
    if (!report) { setFlash(req, 'error', 'Laporan tidak ditemukan.'); return res.redirect('/admin/reports'); }
    const { new_status, note } = req.body;
    if (!STATUSES.includes(new_status)) { setFlash(req, 'error', 'Status tidak valid.'); return res.redirect(`/admin/reports/${id}`); }
    await ReportModel.updateStatus(id, new_status, req.session.user.id, report.status, note || null);
    setFlash(req, 'success', 'Status laporan berhasil diperbarui.');
    return res.redirect(`/admin/reports/${id}`);
  },

  /* POST /admin/reports/:id/responses */
  async addResponse(req, res) {
    const id      = parseInt(req.params.id, 10);
    const { message } = req.body;
    const is_internal = req.body.is_internal === 'on' ? 1 : 0;
    if (!message || !message.trim()) {
      setFlash(req, 'error', 'Tanggapan tidak boleh kosong.');
      return res.redirect(`/admin/reports/${id}`);
    }
    const db = require('../../config/db');
    await db.execute(
      'INSERT INTO report_responses (report_id, admin_id, message, is_internal) VALUES (?, ?, ?, ?)',
      [id, req.session.user.id, message.trim(), is_internal]
    );
    setFlash(req, 'success', 'Tanggapan berhasil ditambahkan.');
    return res.redirect(`/admin/reports/${id}`);
  },
  
  /* POST /admin/reports/:id/delete */
  async destroy(req, res) {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      setFlash(req, 'error', 'ID laporan tidak valid.');
      return res.redirect('/admin/reports');
    }

    try {
      const report = await ReportModel.findByIdWithDetails(id);

      if (!report) {
        setFlash(req, 'error', 'Laporan tidak ditemukan.');
        return res.redirect('/admin/reports');
      }

      const deleted = await ReportModel.deleteById(id);

      if (!deleted) {
        setFlash(req, 'error', 'Laporan gagal dihapus.');
        return res.redirect('/admin/reports');
      }

      setFlash(req, 'success', 'Laporan berhasil dihapus.');
      return res.redirect('/admin/reports');
    } catch (error) {
      console.error('Gagal menghapus laporan:', error);
      setFlash(
        req,
        'error',
        'Laporan gagal dihapus. Periksa relasi data di database.'
      );
      return res.redirect('/admin/reports');
    }
  },


};

module.exports = AdminReportController;
