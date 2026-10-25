'use strict';

const express  = require('express');
const router   = express.Router();
const { isLoggedIn }   = require('../middlewares/auth');
const { requireRole }  = require('../middlewares/role');
const { categoryRules, faqRules, responseRules } = require('../middlewares/validators');

const DashboardController  = require('../controllers/admin/dashboardController');
const ReportController     = require('../controllers/admin/reportController');
const CategoryController   = require('../controllers/admin/categoryController');
const FaqController        = require('../controllers/admin/faqController');
const UserController       = require('../controllers/admin/userController');

// Semua route di bawah ini memerlukan login + role admin
router.use(isLoggedIn, requireRole('admin'));

/* ── Dashboard ── */
router.get('/dashboard', DashboardController.index);

/* ── Laporan ── */
router.get('/reports',                ReportController.list);
router.get('/reports/:id',            ReportController.detail);
router.post('/reports/:id/status',    ReportController.updateStatus);
router.post('/reports/:id/responses', responseRules, ReportController.addResponse);
router.post('/reports/:id/delete', ReportController.destroy);

/* ── Kategori ── */
router.get('/categories',                CategoryController.list);
router.post('/categories',               categoryRules, CategoryController.create);
router.post('/categories/:id/edit',      categoryRules, CategoryController.update);
router.post('/categories/:id/delete',    CategoryController.destroy);

/* ── FAQ ── */
router.get('/faqs',              FaqController.list);
router.post('/faqs',             faqRules, FaqController.create);
router.post('/faqs/:id/edit',    faqRules, FaqController.update);
router.post('/faqs/:id/delete',  FaqController.destroy);

/* ── Pengguna ── */
router.get('/users',                    UserController.list);
router.post('/users/:id/toggle-active', UserController.toggleActive);

module.exports = router;
