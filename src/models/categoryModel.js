'use strict';

const db = require('../config/db');

// Ubah nilai checkbox/boolean apa pun menjadi 1 atau 0.
function toActiveFlag(value) {
  return value === 1 || value === '1' || value === true || value === 'on' ? 1 : 0;
}

const CategoryModel = {
  async findAll(onlyActive = false) {
    const where = onlyActive ? 'WHERE is_active = 1' : '';
    const [rows] = await db.execute(
      `SELECT * FROM categories ${where} ORDER BY name ASC`
    );
    return rows;
  },

  async findBySlug(slug) {
    const [rows] = await db.execute(
      'SELECT * FROM categories WHERE slug = ? LIMIT 1',
      [slug]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM categories WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, slug, description }) {
    const [result] = await db.execute(
      'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
      [name, slug, description || null]
    );
    return result.insertId;
  },

  async update(id, { name, slug, description, is_active }) {
    await db.execute(
      'UPDATE categories SET name = ?, slug = ?, description = ?, is_active = ? WHERE id = ?',
      [name, slug, description || null, toActiveFlag(is_active), id]
    );
  },

  async delete(id) {
    await db.execute('DELETE FROM categories WHERE id = ?', [id]);
  },
};

module.exports = CategoryModel;