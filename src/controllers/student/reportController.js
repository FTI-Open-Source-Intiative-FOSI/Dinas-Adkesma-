'use strict';

const ReportModel   = require('../../models/reportModel');
const CategoryModel = require('../../models/categoryModel');
const { setFlash }  = require('../../utils/flash');
const { generateTicketCode } = require('../../utils/ticket');
const { validationResult }   = require('express-validator');

const StudentReportController = {
  /* GET /student/reports */
  async list(req, res) {
    const page = parseInt(req.query.page || '1', 10);
    const { rows: reports, total } = await ReportModel.findByUser(req.session.user.id, { page });
    res.render('student/report-list', {
      title: 'Riwayat Laporan',
      layout: 'layouts/student',
      reports, total, page,
      totalPages: Math.ceil(total / 10),
    });
  },

  /* GET /student/reports/new */
  async newForm(req, res) {
    const categories = await CategoryModel.findAll(true);
    res.render('student/report-form', {
      title: 'Buat Laporan Baru',
      layout: 'layouts/student',
      categories,
      errors: [],
      old: {},
    });
  },

  /* POST /student/reports */
  async create(req, res) {
    const errResult = validationResult(req);
    if (!errResult.isEmpty()) {
      const categories = await CategoryModel.findAll(true);
      setFlash(req, 'error', errResult.array()[0].msg);
      return res.render('student/report-form', {
        title: 'Buat Laporan Baru',
        layout: 'layouts/student',
        categories,
        errors: errResult.array(),
        old: req.body,
      });
    }
    try {
      const { title, category_id, description, incident_date, incident_location, reported_party } = req.body;
      const is_anonymous = req.body.is_anonymous === 'on' ? 1 : 0;
      const ticket_code  = generateTicketCode();

      const report_id = await ReportModel.create({
        ticket_code,
        user_id:     req.session.user.id,
        category_id: parseInt(category_id, 10),
        title, description, incident_date,
        incident_location, reported_party, is_anonymous,
      });

      // Simpan lampiran jika ada
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await ReportModel.addAttachment({
            report_id,
            file_path:     file.filename,
            original_name: file.originalname,
            mime_type:     file.mimetype,
            file_size:     file.size,
          });
        }
      }

      setFlash(req, 'success', `Laporan berhasil dikirim! Kode tiket kamu: ${ticket_code}`);
      return res.redirect('/student/reports');
    } catch (err) {
      console.error('[StudentReport.create]', err);
      setFlash(req, 'error', 'Terjadi kesalahan. Coba lagi.');
      return res.redirect('/student/reports/new');
    }
  },

  /* GET /student/reports/:id */
  async detail(req, res) {
    const report = await ReportModel.findByIdWithDetails(parseInt(req.params.id, 10));
    if (!report || report.user_id !== req.session.user.id) {
      return res.status(404).render('error', {
        title: 'Tidak Ditemukan', message: 'Laporan tidak ditemukan.', layout: 'layouts/student',
      });
    }
    res.render('student/report-detail', {
      title: `Detail Laporan #${report.ticket_code}`,
      layout: 'layouts/student',
      report,
    });
  },
};

module.exports = StudentReportController;
