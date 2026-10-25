(function () {
    // Slug otomatis untuk form tambah kategori.
    var nameEl = document.getElementById('cat-name');
    var slugEl = document.getElementById('cat-slug');
    var slugTouched = false;

    function slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    if (nameEl && slugEl) {
        nameEl.addEventListener('input', function () {
            if (!slugTouched) slugEl.value = slugify(nameEl.value);
        });

        // Slug diketik manual -> jangan ditimpa lagi. Dikosongkan -> kembali otomatis.
        slugEl.addEventListener('input', function () {
            slugTouched = slugEl.value.trim() !== '';
        });
    }

    // Tombol Edit: buka/tutup form edit. Tombol Batal: tutup.
    document.addEventListener('click', function (e) {
        var openBtn = e.target.closest('[data-toggle-edit]');
        if (openBtn) {
            var row = document.getElementById('cat-edit-' + openBtn.getAttribute('data-toggle-edit'));
            if (row) row.hidden = !row.hidden;
            return;
        }

        var closeBtn = e.target.closest('[data-close-edit]');
        if (closeBtn) {
            var target = document.getElementById('cat-edit-' + closeBtn.getAttribute('data-close-edit'));
            if (target) target.hidden = true;
        }
    });

    // Konfirmasi sebelum submit (pengganti onsubmit inline).
    document.addEventListener('submit', function (e) {
        var msg = e.target.getAttribute('data-confirm');
        if (msg && !window.confirm(msg)) {
            e.preventDefault();
        }
    });
})();