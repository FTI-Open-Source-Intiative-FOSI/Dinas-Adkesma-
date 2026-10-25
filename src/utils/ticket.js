'use strict';

const crypto = require('crypto');

/**
 * Generate kode tiket unik, contoh: LPR-20261018-A7K2
 * @returns {string}
 */
function generateTicketCode() {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day   = String(now.getDate()).padStart(2, '0');
  const rand  = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `LPR-${year}${month}${day}-${rand}`;
}

module.exports = { generateTicketCode };
