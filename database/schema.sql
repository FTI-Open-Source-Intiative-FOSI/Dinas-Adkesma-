-- =====================================================
-- Skema database: lapor_mahasiswa
-- Jalankan: mysql -u root -p < database/schema.sql
-- Catatan: tabel `sessions` dibuat otomatis oleh express-mysql-session
-- =====================================================

CREATE DATABASE IF NOT EXISTS lapor_mahasiswa
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lapor_mahasiswa;

-- ---------- users ----------
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
) ENGINE=InnoDB;

-- ---------- categories ----------
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
) ENGINE=InnoDB;

-- ---------- reports ----------
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
) ENGINE=InnoDB;

-- ---------- report_attachments ----------
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
) ENGINE=InnoDB;

-- ---------- report_responses (tanggapan admin) ----------
CREATE TABLE IF NOT EXISTS report_responses (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_id   INT UNSIGNED NOT NULL,
  admin_id    INT UNSIGNED NOT NULL,
  message     TEXT         NOT NULL,
  is_internal TINYINT(1)   NOT NULL DEFAULT 0,  -- 1 = catatan internal, tidak tampil ke pelapor
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_resp_report (report_id),
  CONSTRAINT fk_resp_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_resp_admin  FOREIGN KEY (admin_id)  REFERENCES users(id)   ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------- report_status_logs ----------
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
) ENGINE=InnoDB;

-- ---------- faqs (opsional) ----------
CREATE TABLE IF NOT EXISTS faqs (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  question   VARCHAR(255) NOT NULL,
  answer     TEXT         NOT NULL,
  sort_order INT          NOT NULL DEFAULT 0,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;
