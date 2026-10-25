'use strict';

const express      = require('express');
const router       = express.Router();

const publicRoutes  = require('./publicRoutes');
const authRoutes    = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const adminRoutes   = require('./adminRoutes');

router.use('/', publicRoutes);
router.use('/', authRoutes);
router.use('/student', studentRoutes);
router.use('/admin',   adminRoutes);

module.exports = router;
