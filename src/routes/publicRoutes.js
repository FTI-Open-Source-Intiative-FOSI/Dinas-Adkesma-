
'use strict';

const express          = require('express');
const router           = express.Router();
const PublicController = require('../controllers/publicController');

// Middleware autentikasi dan role
router.get('/', (req, res, next) => {
  if (
    req.session.user &&
    req.session.user.role === 'admin'
  ) {
    return res.redirect('/admin/dashboard');
  }

  return next();
}, PublicController.home);

router.get('/category/:slug', PublicController.category);
router.get('/faq',             PublicController.faq);
router.get('/check',           PublicController.checkStatus);
router.post('/check',          PublicController.searchStatus);

module.exports = router;
