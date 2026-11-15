(function () {
  if (window.__laporPasswordToggleInit) return;
  window.__laporPasswordToggleInit = true;

  function initPasswordToggles() {
    var inputs = document.querySelectorAll('input[type="password"]');
    inputs.forEach(function (input) {
      if (input.dataset.pwToggleReady) return;
      input.dataset.pwToggleReady = '1';

      var wrapper = document.createElement('div');
      wrapper.className = 'relative';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      input.style.paddingRight = '2.75rem';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Tampilkan password');
      btn.setAttribute('title', 'Tampilkan password');
      btn.className = 'absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-white transition-colors';
      btn.innerHTML = '<i class="fas fa-eye text-sm"></i>';

      btn.addEventListener('click', function () {
        var isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.innerHTML = isHidden
          ? '<i class="fas fa-eye-slash text-sm"></i>'
          : '<i class="fas fa-eye text-sm"></i>';
        var label = isHidden ? 'Sembunyikan password' : 'Tampilkan password';
        btn.setAttribute('aria-label', label);
        btn.setAttribute('title', label);
      });

      wrapper.appendChild(btn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPasswordToggles);
  } else {
    initPasswordToggles();
  }
})();

