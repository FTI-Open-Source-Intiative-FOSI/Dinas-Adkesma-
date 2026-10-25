-- =====================================================
-- Data awal. Jalankan SETELAH schema.sql
-- =====================================================
USE lapor_mahasiswa;

-- Admin awal (password: Admin#12345) -> WAJIB diganti setelah login pertama
INSERT INTO users (nim, name, email, password_hash, role) VALUES
(NULL, 'Administrator', 'admin@lapor.local', '$2b$10$rFfxzVKtw8izKWnKvWtZ5eWRq240V0VBI/gNdQ6fHxhL1bEN9ISf2', 'admin');

-- Kategori awal (dapat diubah admin dari panel)
INSERT INTO categories (name, slug, description) VALUES
('Kode Etik Mahasiswa', 'kode-etik-mahasiswa', 'Laporan dugaan pelanggaran perilaku yang tidak sesuai dengan kode etik di lingkungan kampus.'),
('Penyalahgunaan Narkoba & Miras', 'narkoba-miras', 'Laporan dugaan penyalahgunaan narkoba dan/atau minuman keras di lingkungan kampus.'),
('Bullying / Perundungan', 'bullying-perundungan', 'Laporan kekerasan verbal, nonverbal, fisik, atau psikologis yang merugikan individu di kampus.'),
('Rasisme', 'rasisme', 'Laporan sikap, ucapan, atau tindakan diskriminatif berdasarkan suku, ras, atau latar belakang tertentu.'),
('Kekerasan Seksual', 'kekerasan-seksual', 'Laporan tindakan melecehkan atau memaksa secara seksual, baik langsung maupun melalui media digital.'),
('Penistaan Agama', 'penistaan-agama', 'Laporan sikap, ucapan, atau tindakan yang menghina ajaran, simbol, atau keyakinan agama.'),
('Korupsi atau Penipuan', 'korupsi-penipuan', 'Laporan penyalahgunaan wewenang, manipulasi, atau kecurangan yang merugikan individu atau institusi.'),
('Pemerasan atau Gratifikasi', 'pemerasan-gratifikasi', 'Laporan tindakan meminta, menerima, atau memberi sesuatu secara tidak sah untuk memengaruhi layanan atau keputusan.');

-- FAQ awal (contoh, silakan sesuaikan)
INSERT INTO faqs (question, answer, sort_order) VALUES
('Bagaimana cara membuat laporan?', 'Login sebagai mahasiswa, pilih kategori yang sesuai, lalu isi formulir laporan dan lampirkan bukti jika ada.', 1),
('Apakah identitas saya dirahasiakan?', 'Anda dapat memilih mengirim laporan secara anonim sehingga identitas tidak ditampilkan kepada pengelola.', 2),
('Bagaimana cara memantau status laporan?', 'Gunakan menu Cek Status dan masukkan kode tiket yang Anda terima setelah laporan dikirim.', 3);
