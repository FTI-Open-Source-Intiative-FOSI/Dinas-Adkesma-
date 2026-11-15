'use strict';

const bcrypt        = require('bcrypt');
const { validationResult } = require('express-validator');
const UserModel     = require('../models/userModel');
const { setFlash }  = require('../utils/flash');

const SALT_ROUNDS = 12;

function renderLoginError(res, message, email = '') {
  res.locals.flashMessages = [{ type: 'error', message }];
  return res.status(400).render('auth/login', {
    title: 'Login',
    layout: 'layouts/main',
    old: { email },
  });
}

function renderRegisterError(res, message, old = {}) {
  res.locals.flashMessages = [{ type: 'error', message }];
  return res.status(400).render('auth/register', {
    title: 'Daftar Akun',
    layout: 'layouts/main',
    old,
  });
}

const AuthController = {
  /* ─────────────── GET /login ─────────────── */
  showLogin(req, res) {
    res.render('auth/login', {
      title: 'Login',
      layout: 'layouts/main',
      old: { email: req.query.email || '' },
    });
  },

  /* ─────────────── POST /login ─────────────── */
  async processLogin(req, res) {
    const rawEmail = String(req.body.email || '').trim();
    const errors   = validationResult(req);
    if (!errors.isEmpty()) {
      return renderLoginError(res, errors.array()[0].msg, rawEmail);
    }
    try {
      const { email, password } = req.body;
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return renderLoginError(res, 'Email belum terdaftar atau salah.', rawEmail);
      }
      let match = false;
      const storedHash = String(user.password_hash || '').trim();
      if (storedHash.startsWith('$2')) {
        const candidates = [
          password,
          typeof password === 'string' ? password.trim() : '',
          `${password}\r\n`,
          `${password}\n`,
        ];
        for (const cand of candidates) {
          if (cand && (await bcrypt.compare(cand, storedHash))) {
            match = true;
            break;
          }
        }
      } else if (storedHash && (password === storedHash || password.trim() === storedHash)) {
        // Jika akun ditambahkan manual lewat phpMyAdmin dengan password plain-text,
        // izinkan login lalu otomatis enkripsi ke bcrypt.
        match = true;
        const newHash = await bcrypt.hash(password.trim(), SALT_ROUNDS);
        await UserModel.updatePassword(user.id, newHash);
      }
      if (!match) {
        return renderLoginError(res, 'Password yang kamu masukkan salah.', rawEmail);
      }
      // Simpan sesi lalu pastikan tersimpan ke MySQL sebelum redirect
      req.session.user = {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        nim:   user.nim,
      };
      setFlash(req, 'success', `Selamat datang, ${user.name}!`);
      const target = user.role === 'admin' ? '/admin/dashboard' : '/student/reports';
      return req.session.save(() => res.redirect(target));
    } catch (err) {
      console.error('[AuthController.processLogin]', err);
      return renderLoginError(res, 'Terjadi kesalahan server. Coba lagi.', rawEmail);
    }
  },

  /* ─────────────── GET /register ─────────────── */
  showRegister(req, res) {
    res.render('auth/register', {
      title: 'Daftar Akun',
      layout: 'layouts/main',
      old: {},
    });
  },

  /* ─────────────── POST /register ─────────────── */
  async processRegister(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return renderRegisterError(res, errors.array()[0].msg, req.body);
    }
    try {
      const { name, nim, email, password, prodi, phone } = req.body;

      // Cek duplikat email
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        return renderRegisterError(res, 'Email sudah terdaftar.', req.body);
      }
      // Cek duplikat NIM (jika diisi)
      if (nim) {
        const existingNim = await UserModel.findByNim(nim);
        if (existingNim) {
          return renderRegisterError(res, 'NIM sudah terdaftar.', req.body);
        }
      }

      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      await UserModel.create({ nim, name, email, password_hash, role: 'mahasiswa', prodi, phone });

      setFlash(req, 'success', 'Akun berhasil dibuat. Silakan login.');
      return req.session.save(() => res.redirect(`/login?email=${encodeURIComponent(email)}`));
    } catch (err) {
      console.error('[AuthController.processRegister]', err);
      return renderRegisterError(res, 'Terjadi kesalahan server. Coba lagi.', req.body);
    }
  },

  /* ─────────────── POST /logout ─────────────── */
  logout(req, res) {
    req.session.destroy(() => {
      res.clearCookie('lapor_sid');
      res.redirect('/');
    });
  },
};

module.exports = AuthController;
