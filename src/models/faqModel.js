'use strict';

const db = require('../config/db');

const FaqModel = {
  async findAll(onlyActive = false) {
    const where = onlyActive ? 'WHERE is_active = 1' : '';
    const [rows] = await db.execute(
      `SELECT * FROM faqs ${where} ORDER BY sort_order ASC, id ASC`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM faqs WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async create({ question, answer, sort_order = 0 }) {
    const [result] = await db.execute(
      'INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)',
      [question, answer, sort_order]
    );
    return result.insertId;
  },

  async update(id, { question, answer, sort_order, is_active }) {
    await db.execute(
      'UPDATE faqs SET question = ?, answer = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [question, answer, sort_order, is_active, id]
    );
  },

  async delete(id) {
    await db.execute('DELETE FROM faqs WHERE id = ?', [id]);
  },
};

module.exports = FaqModel;
