# Audit Navbar dan Interaksi UI — FOSI_ADKESMA

## Temuan utama
- `src/views/layouts/student.ejs`: dropdown akun sebelumnya memakai `hidden group-hover:block` dengan `mt-2`. Menu bergantung pada hover; ketika pointer meninggalkan area grup, menu bisa langsung tersembunyi sehingga item sulit diklik. Ini satu-satunya dropdown akun yang ditemukan memakai pola tersebut.
- Perbaikan pada file ini mengubah dropdown menjadi toggle klik, menambahkan `aria-expanded`/`aria-controls`, menutup menu ketika klik di luar, dan menutup dengan tombol Escape. Logika profil dan POST `/logout` tetap sama.

## Pemeriksaan pola interaksi lain
- `src/views/layouts/admin.ejs`: tidak memakai dropdown hover; tombol Keluar mengirim form POST langsung.
- `src/views/partials/navbar.ejs`: menu mobile memakai `classList.toggle('hidden')`, jadi klik berulang membuka/menutup. Tidak ditemukan pola hover-dropdown akun yang sama.
- `src/views/admin/categories.ejs` dan `src/views/admin/faqs.ejs`: tombol Edit/Batal men-toggle baris form berdasarkan `data-toggle-edit`; pola ini berbeda dari dropdown navbar dan tidak bergantung pada hover.
- `src/views/auth/login.ejs`: toggle password berganti tipe input dan ikon bolak-balik; bukan dropdown.
- `src/views/partials/flash.ejs`: tombol menutup notifikasi dengan menghapus elemen.

## Batasan pemeriksaan
- Pemeriksaan dilakukan terhadap kode sumber dalam ZIP. Aplikasi tidak dijalankan end-to-end karena memerlukan konfigurasi dan layanan database MySQL. Karena itu, tautan profil/logout dan interaksi UI belum diverifikasi melalui browser otomatis.
- File `.env` dan `node_modules` sengaja tidak disertakan dalam ZIP hasil audit. Salin nilai konfigurasi lokal ke `.env` sendiri dan jalankan `npm install` di folder proyek.
