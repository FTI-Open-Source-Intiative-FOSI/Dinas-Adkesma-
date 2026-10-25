# Lapor Mahasiswa

Sistem pengaduan mahasiswa berbasis web. Mahasiswa dapat mengirim laporan beserta bukti dan memantau perkembangannya dengan kode tiket, sedangkan admin menindaklanjuti laporan yang masuk.

## Fitur

**Publik (tanpa login)**
- Beranda, daftar kategori laporan, dan FAQ
- Cek status laporan dengan kode tiket

**Mahasiswa**
- Registrasi dan login
- Membuat laporan dengan lampiran bukti (maksimal 3 berkas, 5 MB per berkas)
- Opsi mengirim laporan secara anonim
- Melihat riwayat laporan, status, dan tanggapan admin
- Mengelola profil dan mengganti password

**Admin**
- Dashboard ringkasan laporan
- Mengubah status laporan dan memberi tanggapan (publik atau catatan internal)
- Mengelola kategori, FAQ, dan pengguna

**Umum**
- Mode gelap dan terang
- Tampilan responsif

## Teknologi

Node.js, Express, EJS, MySQL, dan Tailwind CSS.

## Instalasi

Prasyarat: Node.js, MySQL (atau MariaDB), dan Git.

1. Unduh proyek dan pasang dependensi:

   ```bash
   git clone https://github.com/FTI-Open-Source-Intiative-FOSI/Dinas-Adkesma-.git
   cd Dinas-Adkesma-
   npm install
   ```

2. Salin `.env.example` menjadi `.env`, lalu isi pengaturan database dan `SESSION_SECRET`:

   ```bash
   copy .env.example .env      # Windows
   cp .env.example .env        # macOS / Linux
   ```

3. Buat database dan isi data awal (urutannya harus begini):

   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql
   ```

4. Bangun CSS:

   ```bash
   npm run css:build
   ```

5. Jalankan aplikasi, lalu buka `http://localhost:3000`:

   ```bash
   npm run dev
   ```

## Akun Admin

Setelah `seed.sql` diimpor, tersedia satu akun admin bawaan:

| | |
|---|---|
| Email | `admin@lapor.local` |
| Password | `Admin123` |

Akun ini untuk pengembangan dan demo. Ganti password-nya sebelum aplikasi dipasang di server yang dapat diakses publik. Akun mahasiswa dibuat sendiri lewat halaman `/register`.

## Cara Penggunaan

**Mahasiswa**
1. Daftar di `/register`, lalu login di `/login`.
2. Pilih "Buat Laporan", isi judul, kategori, deskripsi, dan tanggal kejadian. Lampiran dan opsi anonim bersifat opsional.
3. Simpan kode tiket yang muncul setelah laporan terkirim (contoh: `LPR-20261024-A7K2`).
4. Pantau status dan tanggapan di menu "Laporan Saya", atau lewat halaman "Cek Status" memakai kode tiket.

**Admin**
1. Login dengan akun admin, lalu buka menu "Laporan".
2. Buka detail laporan, ubah statusnya, dan tulis tanggapan untuk pelapor.
3. Kelola kategori, FAQ, dan pengguna lewat menu di sidebar.

**Status laporan:** `menunggu` → `diverifikasi` → `diproses` → `selesai` (atau `ditolak`).

## Pemecahan Masalah

- **Halaman tampil tanpa gaya:** jalankan `npm run css:build`, lalu hard refresh (Ctrl+Shift+R).
- **Gagal terhubung ke database:** periksa nilai `DB_*` di `.env`, dan pastikan `schema.sql` serta `seed.sql` sudah diimpor.
- **Port sudah dipakai:** ubah `PORT` di `.env`.
