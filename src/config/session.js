'use strict';

const session       = require('express-session');
const MySQLStore    = require('express-mysql-session')(session);

const storeOptions = {
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT || '3306', 10),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'lapor_mahasiswa',
  clearExpired:       true,
  checkExpirationInterval: 900000,
  expiration:         86400000,
  createDatabaseTable: true,
};

const sessionStore = new MySQLStore(storeOptions);

const sessionMiddleware = session({
  key:               'lapor_sid',
  secret:            process.env.SESSION_SECRET || 'rahasia-sangat-panjang',
  store:             sessionStore,
  resave:            false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    maxAge:   86400000,   // 1 hari
  },
});

module.exports = sessionMiddleware;
