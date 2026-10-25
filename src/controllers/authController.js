'use strict';

const bcrypt        = require('bcrypt');
const { validationResult } = require('express-validator');
const UserModel     = require('../models/userModel');
const { setFlash }  = require('../utils/flash');

const SALT_ROUNDS = 12;

const AuthController = {
  /* ─────────────── GET /login ─────────────── */
  showLogin(req, res) {
    res.render('auth/login', { title: 'Login', layout: 'layouts/main' });
  },

  /* ─────────────── POST /login ─────────────── */
  async processLogin(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      setFlash(req, 'error', errors.array()[0].msg);
      return res.redirect('/login');
    }
    try {
      const { email, password } = req.body;
      const user = await UserModel.findByEmail(email);
      if (!user || !user.is_active) {
        setFlash(req, 'error', 'Email atau password salah.');
        return res.redirect('/login');
      }
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        setFlash(req, 'error', 'Email atau password salah.');
        return res.redirect('/login');
      }
      // Simpan sesi
      req.session.user = {
        id:    user.id,
        name:  user.name,
        email: user.email,
        role:  user.role,
        nim:   user.nim,
      };
      setFlash(req, 'success', `Selamat datang, ${user.name}!`);
      return res.redirect(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      console.error('[AuthController.processLogin]', err);
      setFlash(req, 'error', 'Terjadi kesalahan server. Coba lagi.');
      return res.redirect('/login');
    }
  },

  /* ─────────────── GET /register ─────────────── */
  showRegister(req, res) {
    res.render('auth/register', { title: 'Daftar Akun', layout: 'layouts/main' });
  },

  /* ─────────────── POST /register ─────────────── */
  async processRegister(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      setFlash(req, 'error', errors.array()[0].msg);
      return res.redirect('/register');
    }
    try {
      const { name, nim, email, password, prodi, phone } = req.body;

      // Cek duplikat email
      const existingEmail = await UserModel.findByEmail(email);
      if (existingEmail) {
        setFlash(req, 'error', 'Email sudah terdaftar.');
        return res.redirect('/register');
      }
      // Cek duplikat NIM (jika diisi)
      if (nim) {
        const existingNim = await UserModel.findByNim(nim);
        if (existingNim) {
          setFlash(req, 'error', 'NIM sudah terdaftar.');
          return res.redirect('/register');
        }
      }

      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      await UserModel.create({ nim, name, email, password_hash, role: 'mahasiswa', prodi, phone });

      setFlash(req, 'success', 'Akun berhasil dibuat. Silakan login.');
      return res.redirect('/login');
    } catch (err) {
      console.error('[AuthController.processRegister]', err);
      setFlash(req, 'error', 'Terjadi kesalahan server. Coba lagi.');
      return res.redirect('/register');
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
