'use strict';
(function () {
  function $(id) { return document.getElementById(id); }
  // Menú móvil
  var btn = document.querySelector('.menu-btn'), nav = $('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open)); btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      nav.classList.toggle('open', open);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
    });
  }
  var form = $('contact');
  if (!form) return;
  var rules = {
    nombre: function (v) { return v.length >= 2 ? '' : 'Escribe tu nombre.'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Revisa el correo: falta la @ o el dominio.'; },
    tel: function (v) { return !v || v.replace(/\D/g, '').length >= 9 ? '' : 'Si pones teléfono, necesita 9 dígitos.'; },
    mensaje: function (v) { return v.length >= 15 ? '' : 'Cuéntanos un poco más (mínimo 15 caracteres).'; }
  };
  function check(k) {
    var input = $(k), msg = rules[k](input.value.trim()), e = $('err-' + k);
    e.textContent = msg; e.hidden = !msg; input.setAttribute('aria-invalid', String(!!msg));
    if (msg) input.setAttribute('aria-describedby', 'err-' + k); else if (k !== 'mensaje') input.removeAttribute('aria-describedby');
    return !msg;
  }
  Object.keys(rules).forEach(function (k) { $(k).addEventListener('blur', function () { if ($(k).value) check(k); }); });
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var bad = Object.keys(rules).filter(function (k) { return !check(k); });
    var ok = $('acepto').checked, ea = $('err-acepto');
    ea.textContent = ok ? '' : 'Necesitamos tu permiso para contestarte.'; ea.hidden = ok;
    if (bad.length) { $(bad[0]).focus(); return; }
    if (!ok) { $('acepto').focus(); return; }
    $('s-nombre').textContent = $('nombre').value.trim().split(' ')[0];
    $('s-email').textContent = $('email').value.trim();
    form.hidden = true; var s = $('success'); s.hidden = false; s.focus();
  });
})();
