'use strict';

const express       = require('express');
const router        = express.Router();
const AuthController = require('../controllers/authController');
const { isGuest }   = require('../middlewares/auth');
const { loginRules, registerRules } = require('../middlewares/validators');

router.get('/login',    isGuest, AuthController.showLogin);
router.post('/login',   isGuest, loginRules, AuthController.processLogin);
router.get('/register', isGuest, AuthController.showRegister);
router.post('/register', isGuest, registerRules, AuthController.processRegister);
router.post('/logout',  AuthController.logout);

module.exports = router;
