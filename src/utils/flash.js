'use strict';

/**
 * Simpan pesan flash ke session.
 * @param {import('express').Request} req
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {string} message
 */
function setFlash(req, type, message) {
  if (!req.session) return;
  if (!Array.isArray(req.session.flash)) req.session.flash = [];
  req.session.flash.push({ type, message });
}

/**
 * Ambil dan hapus semua pesan flash dari session.
 * Hanya memodifikasi session jika memang ada pesan flash,
 * agar request biasa tidak memicu penulisan ulang session yang tidak perlu.
 * @param {import('express').Request} req
 * @returns {Array<{type: string, message: string}>}
 */
function getFlash(req) {
  if (!req.session || !Array.isArray(req.session.flash) || req.session.flash.length === 0) {
    return [];
  }
  const messages = req.session.flash;
  delete req.session.flash;
  return messages;
}

module.exports = { setFlash, getFlash };
