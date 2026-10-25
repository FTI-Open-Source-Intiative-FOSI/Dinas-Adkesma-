'use strict';

const db = require('../config/db');

const UserModel = {
  /** Cari user berdasarkan email */
  async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
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

  /** Ambil semua user (untuk admin) */
  async findAll({ page = 1, limit = 20, search = '' } = {}) {
    const offset = (page - 1) * limit;
    const like   = `%${search}%`;
    const [rows] = await db.execute(
      `SELECT id, nim, name, email, role, prodi, phone, is_active, created_at
       FROM users
       WHERE name LIKE ? OR email LIKE ? OR nim LIKE ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [like, like, like, limit, offset]
    );
    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM users
       WHERE name LIKE ? OR email LIKE ? OR nim LIKE ?`,
      [like, like, like]
    );
    return { rows, total };
  },

  /** Toggle aktif/nonaktif user */
  async toggleActive(id) {
    await db.execute(
      'UPDATE users SET is_active = NOT is_active WHERE id = ?',
      [id]
    );
  },
};

module.exports = UserModel;
