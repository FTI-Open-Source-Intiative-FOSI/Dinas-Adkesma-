'use strict';

const db        = require('../config/db');
const validator = require('validator');

const UserModel = {
  /** Cari user berdasarkan email (mendukung pencocokan persis maupun hasil normalizeEmail lama) */
  async findByEmail(email) {
    const raw        = String(email || '').trim().toLowerCase();
    const normalized = validator.normalizeEmail(raw) || raw;
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(email) = ? LIMIT 1',
      [raw, normalized]
    );
    return rows[0] || null;
  },

  /** Cari user berdasarkan NIM */
  async findByNim(nim) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE nim = ? LIMIT 1',
      [nim]
    );
    return rows[0] || null;
  },

  /** Cari user berdasarkan ID */
  async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  /** Buat user baru */
  async create({ nim, name, email, password_hash, role = 'mahasiswa', prodi, phone }) {
    const [result] = await db.execute(
      `INSERT INTO users (nim, name, email, password_hash, role, prodi, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nim || null, name, email, password_hash, role, prodi || null, phone || null]
    );
    return result.insertId;
  },

  /** Update profil user */
  async updateProfile(id, { name, prodi, phone }) {
    await db.execute(
      'UPDATE users SET name = ?, prodi = ?, phone = ? WHERE id = ?',
      [name, prodi || null, phone || null, id]
    );
  },

  /** Update password */
  async updatePassword(id, password_hash) {
    await db.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [password_hash, id]
    );
  },

  /**
   * Ambil user untuk admin, dengan pencarian + filter role + paginasi.
   * report_count sengaja TIDAK menghitung laporan anonim, supaya admin tidak
   * bisa menebak siapa pelapor anonim dari jumlah laporan per pengguna.
   */
  async findAll({ page = 1, limit = 20, search = '', role = '' } = {}) {
    const offset     = (page - 1) * limit;
    const conditions = [];
    const params     = [];

    if (search) {
      const like = `%${search}%`;
      conditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.nim LIKE ?)');
      params.push(like, like, like);
    }
    if (role) {
      conditions.push('u.role = ?');
      params.push(role);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const [rows] = await db.execute(
      `SELECT u.id, u.nim, u.name, u.email, u.role, u.prodi, u.phone,
              u.created_at,
              (SELECT COUNT(*) FROM reports r
                WHERE r.user_id = u.id AND r.is_anonymous = 0) AS report_count
       FROM users u
       ${where}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM users u ${where}`,
      params
    );
    return { rows, total };
  },

  /** Ringkasan jumlah pengguna untuk kartu di halaman admin */
  async getStats() {
    const [[row]] = await db.execute(
      `SELECT COUNT(*)                              AS total,
              COALESCE(SUM(role = 'mahasiswa'), 0)  AS mahasiswa,
              COALESCE(SUM(role = 'admin'), 0)      AS admin
       FROM users`
    );
    return {
      total:     Number(row.total),
      mahasiswa: Number(row.mahasiswa),
      admin:     Number(row.admin),
    };
  },
};

module.exports = UserModel;