'use strict';

const db = require('../config/db');

const ReportModel = {
  /** Buat laporan baru, return insertId */
  async create({ ticket_code, user_id, category_id, title, description,
                 incident_date, incident_location, reported_party, is_anonymous = 0 }) {
    const [result] = await db.execute(
      `INSERT INTO reports
         (ticket_code, user_id, category_id, title, description,
          incident_date, incident_location, reported_party, is_anonymous)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ticket_code, user_id, category_id, title, description,
       incident_date, incident_location || null, reported_party || null, is_anonymous]
    );
    return result.insertId;
  },

  /** Laporan milik mahasiswa tertentu */
  async findByUser(user_id, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const [rows] = await db.execute(
      `SELECT r.*, c.name AS category_name
       FROM reports r
       JOIN categories c ON c.id = r.category_id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [user_id, limit, offset]
    );
    const [[{ total }]] = await db.execute(
      'SELECT COUNT(*) AS total FROM reports WHERE user_id = ?',
      [user_id]
    );
    return { rows, total };
  },

  /** Cari laporan berdasarkan kode tiket (publik) */
  async findByTicket(ticket_code) {
    const [rows] = await db.execute(
      `SELECT r.*, c.name AS category_name
       FROM reports r
       JOIN categories c ON c.id = r.category_id
       WHERE r.ticket_code = ? LIMIT 1`,
      [ticket_code]
    );
    return rows[0] || null;
  },

  /** Detail laporan + respons admin */
  async findByIdWithDetails(id) {
    const [reports] = await db.execute(
      `SELECT r.*, c.name AS category_name, u.name AS reporter_name, u.nim
       FROM reports r
       JOIN categories c ON c.id = r.category_id
       JOIN users u      ON u.id = r.user_id
       WHERE r.id = ? LIMIT 1`,
      [id]
    );
    if (!reports[0]) return null;
    const report = reports[0];

    const [attachments] = await db.execute(
      'SELECT * FROM report_attachments WHERE report_id = ?',
      [id]
    );
    const [responses] = await db.execute(
      `SELECT rr.*, u.name AS admin_name
       FROM report_responses rr
       JOIN users u ON u.id = rr.admin_id
       WHERE rr.report_id = ?
       ORDER BY rr.created_at ASC`,
      [id]
    );
    const [statusLogs] = await db.execute(
      `SELECT sl.*, u.name AS changed_by_name
       FROM report_status_logs sl
       JOIN users u ON u.id = sl.changed_by
       WHERE sl.report_id = ?
       ORDER BY sl.created_at ASC`,
      [id]
    );
    return { ...report, attachments, responses, statusLogs };
  },

  /** Semua laporan (admin), dengan filter & paginasi */
  async findAll({ page = 1, limit = 15, status = '', category_id = '', search = '' } = {}) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params     = [];
    if (status)      { conditions.push('r.status = ?');          params.push(status); }
    if (category_id) { conditions.push('r.category_id = ?');     params.push(category_id); }
    if (search)      { conditions.push('(r.title LIKE ? OR r.ticket_code LIKE ?)');
                       params.push(`%${search}%`, `%${search}%`); }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const [rows] = await db.execute(
      `SELECT r.*, c.name AS category_name, u.name AS reporter_name
       FROM reports r
       JOIN categories c ON c.id = r.category_id
       JOIN users u      ON u.id = r.user_id
       ${where}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM reports r ${where}`,
      params
    );
    return { rows, total };
  },

  /** Ubah status laporan */
  async updateStatus(id, new_status, changed_by, old_status, note = null) {
    await db.execute(
      'UPDATE reports SET status = ?, resolved_at = IF(? = "selesai", NOW(), NULL) WHERE id = ?',
      [new_status, new_status, id]
    );
    await db.execute(
      `INSERT INTO report_status_logs (report_id, old_status, new_status, changed_by, note)
       VALUES (?, ?, ?, ?, ?)`,
      [id, old_status, new_status, changed_by, note]
    );
  },

  /** Tambah lampiran */
  async addAttachment({ report_id, file_path, original_name, mime_type, file_size }) {
    await db.execute(
      `INSERT INTO report_attachments (report_id, file_path, original_name, mime_type, file_size)
       VALUES (?, ?, ?, ?, ?)`,
      [report_id, file_path, original_name, mime_type, file_size]
    );
  },

  /** Hapus laporan berdasarkan ID beserta data terkait */
  async deleteById(id) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Hapus data terkait terlebih dahulu
      await connection.execute(
        'DELETE FROM report_attachments WHERE report_id = ?',
        [id]
      );

      await connection.execute(
        'DELETE FROM report_responses WHERE report_id = ?',
        [id]
      );

      await connection.execute(
        'DELETE FROM report_status_logs WHERE report_id = ?',
        [id]
      );

      // Hapus laporan utama
      const [result] = await connection.execute(
        'DELETE FROM reports WHERE id = ?',
        [id]
      );

      await connection.commit();

      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /** Statistik ringkas untuk dashboard admin */
  async getStats() {
    const [[stats]] = await db.execute(`
      SELECT
        COUNT(*) AS total,
        SUM(status = 'menunggu')    AS menunggu,
        SUM(status = 'diverifikasi') AS diverifikasi,
        SUM(status = 'diproses')    AS diproses,
        SUM(status = 'selesai')     AS selesai,
        SUM(status = 'ditolak')     AS ditolak
      FROM reports
    `);
    return stats;
  },
};

module.exports = ReportModel;
