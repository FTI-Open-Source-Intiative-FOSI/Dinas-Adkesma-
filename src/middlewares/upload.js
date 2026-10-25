'use strict';

const multer  = require('multer');
const path    = require('path');
const crypto  = require('crypto');
const fs      = require('fs');

const MAX_SIZE_MB = parseInt(process.env.UPLOAD_MAX_SIZE_MB || '5', 10);
const MAX_FILES   = parseInt(process.env.UPLOAD_MAX_FILES   || '3', 10);

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext  = path.extname(file.originalname).toLowerCase();
    const rand = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}-${rand}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipe file tidak diizinkan. Gunakan JPG, PNG, PDF, atau DOCX.'), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

module.exports = { upload, MAX_FILES };
