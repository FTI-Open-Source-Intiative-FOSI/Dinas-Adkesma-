'use strict';

const express  = require('express');
const router   = express.Router();
const { isLoggedIn }   = require('../middlewares/auth');
const { requireRole }  = require('../middlewares/role');
const { upload, MAX_FILES } = require('../middlewares/upload');
const { reportRules }  = require('../middlewares/validators');

const StudentReportController  = require('../controllers/student/reportController');
const ProfileController        = require('../controllers/student/profileController');

// Semua route di bawah ini memerlukan login + role mahasiswa
router.use(isLoggedIn, requireRole('mahasiswa'));

/* ── Dashboard ── */
router.get('/dashboard', (req, res) => {
  res.redirect('/student/reports');
});

/* ── Laporan ── */
router.get('/reports',      StudentReportController.list);
router.get('/reports/new',  StudentReportController.newForm);
router.post('/reports',     upload.array('attachments', MAX_FILES), reportRules, StudentReportController.create);
router.get('/reports/:id',  StudentReportController.detail);

/* ── Profil ── */
router.get('/profile',          ProfileController.show);
router.post('/profile',         ProfileController.update);
router.post('/profile/password', ProfileController.changePassword);

module.exports = router;
