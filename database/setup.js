'use strict';

require('dotenv').config();
const bcrypt = require('bcrypt');
const db     = require('../src/config/db');

async function setup() {
  console.log('[db:setup] Menghubungkan ke database:', process.env.DB_HOST, '->', process.env.DB_NAME);

  // 1. Buat tabel users
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
      nim           VARCHAR(20)  NULL,
      name          VARCHAR(100) NOT NULL,
      email         VARCHAR(100) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role          ENUM('mahasiswa','admin') NOT NULL DEFAULT 'mahasiswa',
      prodi         VARCHAR(100) NULL,
      phone         VARCHAR(20)  NULL,
      is_active     TINYINT(1)   NOT NULL DEFAULT 1,
      created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_users_nim (nim),
      UNIQUE KEY uq_users_email (email),
      KEY idx_users_role (role)
    ) ENGINE=InnoDB
  `);

  // 2. Buat tabel categories
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name        VARCHAR(100) NOT NULL,
      slug        VARCHAR(120) NOT NULL,
      description TEXT         NULL,
      is_active   TINYINT(1)   NOT NULL DEFAULT 1,
      created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_categories_slug (slug)
    ) ENGINE=InnoDB
  `);

  // 3. Buat tabel reports
  await db.execute(`
    CREATE TABLE IF NOT EXISTS reports (
      id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
      ticket_code       VARCHAR(20)  NOT NULL,
      user_id           INT UNSIGNED NOT NULL,
      category_id       INT UNSIGNED NOT NULL,
      title             VARCHAR(200) NOT NULL,
      description       TEXT         NOT NULL,
      incident_date     DATE         NOT NULL,
      incident_location VARCHAR(200) NULL,
      reported_party    VARCHAR(200) NULL,
      is_anonymous      TINYINT(1)   NOT NULL DEFAULT 0,
      status            ENUM('menunggu','diverifikasi','diproses','selesai','ditolak')
                        NOT NULL DEFAULT 'menunggu',
      created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      resolved_at       TIMESTAMP    NULL DEFAULT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_reports_ticket (ticket_code),
      KEY idx_reports_user (user_id),
      KEY idx_reports_category (category_id),
      KEY idx_reports_status (status),
      KEY idx_reports_created (created_at),
      CONSTRAINT fk_reports_user     FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE RESTRICT,
      CONSTRAINT fk_reports_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB
  `);

  // 4. Buat tabel report_attachments
  await db.execute(`
    CREATE TABLE IF NOT EXISTS report_attachments (
      id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
      report_id     INT UNSIGNED NOT NULL,
      file_path     VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime_type     VARCHAR(100) NOT NULL,
      file_size     INT UNSIGNED NOT NULL,
      created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_attach_report (report_id),
      CONSTRAINT fk_attach_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    ) ENGINE=InnoDB
  `);

  // 5. Buat tabel report_responses
  await db.execute(`
    CREATE TABLE IF NOT EXISTS report_responses (
      id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
      report_id   INT UNSIGNED NOT NULL,
      admin_id    INT UNSIGNED NOT NULL,
      message     TEXT         NOT NULL,
      is_internal TINYINT(1)   NOT NULL DEFAULT 0,
      created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_resp_report (report_id),
      CONSTRAINT fk_resp_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
      CONSTRAINT fk_resp_admin  FOREIGN KEY (admin_id)  REFERENCES users(id)   ON DELETE RESTRICT
    ) ENGINE=InnoDB
  `);

  // 6. Buat tabel report_status_logs
  await db.execute(`
    CREATE TABLE IF NOT EXISTS report_status_logs (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      report_id  INT UNSIGNED NOT NULL,
      old_status VARCHAR(20)  NULL,
      new_status VARCHAR(20)  NOT NULL,
      changed_by INT UNSIGNED NOT NULL,
      note       VARCHAR(255) NULL,
      created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_log_report (report_id),
      CONSTRAINT fk_log_report FOREIGN KEY (report_id)  REFERENCES reports(id) ON DELETE CASCADE,
      CONSTRAINT fk_log_user   FOREIGN KEY (changed_by) REFERENCES users(id)   ON DELETE RESTRICT
    ) ENGINE=InnoDB
  `);

  // 7. Buat tabel faqs
  await db.execute(`
    CREATE TABLE IF NOT EXISTS faqs (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      question   VARCHAR(255) NOT NULL,
      answer     TEXT         NOT NULL,
      sort_order INT          NOT NULL DEFAULT 0,
      is_active  TINYINT(1)   NOT NULL DEFAULT 1,
      created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB
  `);

  console.log('[db:setup] Semua tabel berhasil dibuat/diverifikasi.');

  // Bersihkan spasi / karakter baris baru pada semua email & set password standar untuk akun uji
  const [existingUsers] = await db.execute('SELECT id, email, role FROM users');
  const adminHash = await bcrypt.hash('Admin123', 12);
  const mhsHash   = await bcrypt.hash('Mahasiswa123', 12);

  for (const u of existingUsers) {
    const cleanEmail = String(u.email || '').replace(/[\r\n\s]+/g, '').toLowerCase();
    const targetHash = u.role === 'admin' ? adminHash : mhsHash;
    await db.execute(
      'UPDATE users SET email = ?, password_hash = ?, is_active = 1 WHERE id = ?',
      [cleanEmail, targetHash, u.id]
    );
  }

  // Seed akun admin & mahasiswa awal jika belum ada
  await db.execute(
    `INSERT INTO users (nim, name, email, password_hash, role, is_active)
     VALUES (NULL, 'Administrator', 'admin@lapor.local', ?, 'admin', 1)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = 1`,
    [adminHash]
  );

  await db.execute(
    `INSERT INTO users (nim, name, email, password_hash, role, prodi, is_active)
     VALUES ('2511521016', 'Lathifa', 'lathifa@gmail.com', ?, 'mahasiswa', 'Sistem Informasi', 1)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), is_active = 1`,
    [mhsHash]
  );

  // Seed kategori awal jika masih kosong
  const [[{ catCount }]] = await db.execute('SELECT COUNT(*) AS catCount FROM categories');
  if (Number(catCount) === 0) {
    const categories = [
      ['Kode Etik Mahasiswa', 'kode-etik-mahasiswa', 'Laporan dugaan pelanggaran perilaku yang tidak sesuai dengan kode etik di lingkungan kampus.'],
      ['Penyalahgunaan Narkoba & Miras', 'narkoba-miras', 'Laporan dugaan penyalahgunaan narkoba dan/atau minuman keras di lingkungan kampus.'],
      ['Bullying / Perundungan', 'bullying-perundungan', 'Laporan kekerasan verbal, nonverbal, fisik, atau psikologis yang merugikan individu di kampus.'],
      ['Rasisme', 'rasisme', 'Laporan sikap, ucapan, atau tindakan diskriminatif berdasarkan suku, ras, atau latar belakang tertentu.'],
      ['Kekerasan Seksual', 'kekerasan-seksual', 'Laporan tindakan melecehkan atau memaksa secara seksual, baik langsung maupun melalui media digital.'],
      ['Penistaan Agama', 'penistaan-agama', 'Laporan sikap, ucapan, atau tindakan yang menghina ajaran, simbol, atau keyakinan agama.'],
      ['Korupsi atau Penipuan', 'korupsi-penipuan', 'Laporan penyalahgunaan wewenang, manipulasi, atau kecurangan yang merugikan individu atau institusi.'],
      ['Pemerasan atau Gratifikasi', 'pemerasan-gratifikasi', 'Laporan tindakan meminta, menerima, atau memberi sesuatu secara tidak sah untuk memengaruhi layanan atau keputusan.'],
    ];
    for (const [name, slug, description] of categories) {
      await db.execute(
        'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
        [name, slug, description]
      );
    }
  }

  // Seed FAQ awal jika masih kosong
  const [[{ faqCount }]] = await db.execute('SELECT COUNT(*) AS faqCount FROM faqs');
  if (Number(faqCount) === 0) {
    const faqs = [
      ['Bagaimana cara membuat laporan?', 'Login sebagai mahasiswa, pilih kategori yang sesuai, lalu isi formulir laporan dan lampirkan bukti jika ada.', 1],
      ['Apakah identitas saya dirahasiakan?', 'Anda dapat memilih mengirim laporan secara anonim sehingga identitas tidak ditampilkan kepada pengelola.', 2],
      ['Bagaimana cara memantau status laporan?', 'Gunakan menu Cek Status dan masukkan kode tiket yang Anda terima setelah laporan dikirim.', 3],
    ];
    for (const [question, answer, sort_order] of faqs) {
      await db.execute(
        'INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)',
        [question, answer, sort_order]
      );
    }
  }

  console.log('[db:setup] Selesai! Database siap digunakan.');
  const [allUsers] = await db.execute('SELECT id, name, email, role, is_active FROM users');
  console.table(allUsers);
  console.log('  -> Admin     : admin@lapor.local / Admin123');
  console.log('  -> Mahasiswa : lathifa@gmail.com / Mahasiswa123');
  process.exit(0);
}

setup().catch((err) => {
  console.error('[db:setup] Gagal:', err);
  process.exit(1);
});

