'use strict';

const express        = require('express');
const router         = express.Router();
const AuthController = require('../controllers/authController');
const { loginRules, registerRules } = require('../middlewares/validators');

// Tanpa blokir isGuest agar pengguna/admin bisa langsung daftar akun baru
// atau berganti akun lewat /login & /register meski masih ada sesi aktif di tab lain.
router.get('/login',     AuthController.showLogin);
router.post('/login',    loginRules, AuthController.processLogin);
router.get('/register',  AuthController.showRegister);
router.post('/register', registerRules, AuthController.processRegister);
router.post('/logout',   AuthController.logout);

module.exports = router;
