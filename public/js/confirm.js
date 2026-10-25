(function () {
    // Konfirmasi sebelum submit form yang punya atribut data-confirm.
    document.addEventListener('submit', function (e) {
        var msg = e.target.getAttribute('data-confirm');
        if (msg && !window.confirm(msg)) {
            e.preventDefault();
        }
    });
})();
