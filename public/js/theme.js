(function () {
    if (window.__laporThemeInit) return;
    window.__laporThemeInit = true;

    var KEY = 'lapor_theme';
    var root = document.documentElement;

    function saved() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }

    function apply(theme) {
        root.setAttribute('data-theme', theme);
        var toGoLight = theme === 'dark';
        var label = toGoLight ? 'Ganti ke mode terang' : 'Ganti ke mode gelap';
        var btns = document.querySelectorAll('[data-theme-toggle]');
        for (var i = 0; i < btns.length; i++) {
            btns[i].setAttribute('aria-label', label);
            btns[i].setAttribute('title', label);
        }
    }

    // Dipanggil di <head>, jadi tema terpasang sebelum halaman tergambar (tanpa kedipan).
    var initial = saved() === 'light' ? 'light' : 'dark';
    root.setAttribute('data-theme', initial);

    document.addEventListener('DOMContentLoaded', function () {
        apply(root.getAttribute('data-theme'));
        document.addEventListener('click', function (e) {
            var btn = e.target.closest ? e.target.closest('[data-theme-toggle]') : null;
            if (!btn) return;
            var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            try { localStorage.setItem(KEY, next); } catch (err) { }
            apply(next);
        });
    });
})();