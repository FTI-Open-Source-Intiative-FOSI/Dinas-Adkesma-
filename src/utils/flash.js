'use strict';

/**
 * Simpan pesan flash ke session.
 * @param {import('express').Request} req
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {string} message
 */
function setFlash(req, type, message) {
  if (!req.session.flash) req.session.flash = [];
  req.session.flash.push({ type, message });
}

/**
 * Ambil dan hapus semua pesan flash dari session.
 * @param {import('express').Request} req
 * @returns {Array<{type: string, message: string}>}
 */
function getFlash(req) {
  const messages = req.session.flash || [];
  req.session.flash = [];
  return messages;
}

module.exports = { setFlash, getFlash };
