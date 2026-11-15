'use strict';

const { body }  = require('express-validator');

/* ---- AUTH ---- */
const registerRules = [
  body('name').trim().notEmpty().withMessage('Nama wajib diisi.').isLength({ max: 100 }),
  body('nim').trim().optional({ checkFalsy: true }).isLength({ max: 20 }).withMessage('NIM maksimal 20 karakter.'),
  body('email').trim().isEmail().withMessage('Format email tidak valid.').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password minimal 8 karakter.'),
  body('password_confirm').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Konfirmasi password tidak cocok.');
    return true;
  }),
  body('prodi').trim().optional({ checkFalsy: true }).isLength({ max: 100 }),
  body('phone').trim().optional({ checkFalsy: true }).isMobilePhone('id-ID').withMessage('Format nomor telepon tidak valid.'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Email tidak valid.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password wajib diisi.'),
];

/* ---- LAPORAN ---- */
const reportRules = [
  body('title').trim().notEmpty().withMessage('Judul laporan wajib diisi.').isLength({ max: 200 }),
  body('category_id').isInt({ min: 1 }).withMessage('Kategori wajib dipilih.'),
  body('description').trim().notEmpty().withMessage('Deskripsi wajib diisi.'),
  body('incident_date').isDate().withMessage('Tanggal kejadian tidak valid.'),
  body('incident_location').trim().optional({ checkFalsy: true }).isLength({ max: 200 }),
  body('reported_party').trim().optional({ checkFalsy: true }).isLength({ max: 200 }),
  body('is_anonymous').optional().isIn(['0', '1', 'on', '']),
];

/* ---- KATEGORI ---- */
const categoryRules = [
  body('name').trim().notEmpty().withMessage('Nama kategori wajib diisi.').isLength({ max: 100 }),
  body('slug').trim().notEmpty().withMessage('Slug wajib diisi.')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug hanya boleh huruf kecil, angka, dan tanda hubung.')
    .isLength({ max: 120 }),
  body('description').trim().optional({ checkFalsy: true }),
];

/* ---- FAQ ---- */
const faqRules = [
  body('question').trim().notEmpty().withMessage('Pertanyaan wajib diisi.').isLength({ max: 255 }),
  body('answer').trim().notEmpty().withMessage('Jawaban wajib diisi.'),
  body('sort_order').optional().isInt({ min: 0 }),
];

/* ---- TANGGAPAN ADMIN ---- */
const responseRules = [
  body('message').trim().notEmpty().withMessage('Tanggapan tidak boleh kosong.'),
  body('is_internal').optional().isIn(['0', '1', 'on', '']),
];

module.exports = {
  registerRules,
  loginRules,
  reportRules,
  categoryRules,
  faqRules,
  responseRules,
};
