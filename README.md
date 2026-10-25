# Lapor Mahasiswa

Sistem pengaduan mahasiswa dengan 2 role: **mahasiswa** dan **admin web**.
Stack: Node.js + Express + EJS + MySQL (query mentah, tanpa ORM) + Tailwind CSS (Basecoat) + HTMX.

## Menjalankan (setelah kode terisi)
1. `npm install`
2. Salin `.env.example` menjadi `.env`, lalu isi konfigurasi DB
3. Buat database dan import: `database/schema.sql` kemudian `database/seed.sql`
4. `npm run css:build`
5. `npm run dev`

## Akun admin awal (dari seed.sql)
- Email    : admin@lapor.local
- Password : Admin#12345  (WAJIB diganti setelah login pertama)

## Tahapan implementasi
| Fase | Isi |
|---|---|
| 1 | Setup proyek, config, koneksi DB, layout dasar |
| 2 | Auth: register, login, logout, middleware role |
| 3 | Halaman publik: beranda, kategori, FAQ |
| 4 | Mahasiswa: buat laporan, upload, riwayat, detail, tracking tiket |
| 5 | Admin: dashboard, kelola laporan, ubah status, tanggapan |
| 6 | Admin: CRUD kategori, user, FAQ |
| 7 | Hardening keamanan, polishing UI, ekspor (opsional) |

Setiap file placeholder berisi komentar `TODO Fase X` yang menunjukkan kapan file itu diisi.
