'use strict';
(function () {
  function $(id) { return document.getElementById(id); }
  // Validación de campos: ayuda a quien escribe y evita datos raros. La protección de verdad es que
  // todo lo que escribe el usuario se muestra con textContent, nunca como HTML.
  var NAME_RE = /^\p{L}(?:[\p{L}\p{M}]|['’ -](?=\p{L}))*$/u;
  function clean(v) { return String(v || '').normalize('NFC').replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\uFEFF]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function cleanLong(v) { return String(v || '').normalize('NFC').replace(/[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\uFEFF]/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim(); }
  function nameMsg(v, min, max, empty) {
    if (!v) return empty;
    if (/[^\p{L}\p{M}\d '’-]/u.test(v)) return 'Use letters, spaces, apostrophes and hyphens only (no symbols like < > / ; =).';
    if (/\d/.test(v)) return 'Names can’t contain numbers.';
    if (!NAME_RE.test(v)) return 'Use letters, spaces, apostrophes and hyphens only.';
    if (v.length < min) return 'Enter at least ' + min + ' letters.';
    if (v.length > max) return max + ' characters max.';
    return '';
  }
  function phoneMsg(v, min, short) {
    if (/(?!^\+)\D/.test(v)) return 'Phone numbers use digits only (and + at the start for a country code).';
    var d = v.replace(/\D/g, '');
    if (d.length < min) return short;
    if (d.length > 15) return 'Too many digits. Check the number.';
    return '';
  }
  function textMsg(v, max) {
    if (/[<>]/.test(v)) return 'Please leave out the < and > characters.';
    if (max && v.length > max) return max + ' characters max.';
    return '';
  }
  function isCharMsg(m) { return /numbers|letters, spaces|digits only|only accepts|characters\./.test(m); }
  // Valida al escribir solo si hay un carácter no permitido (o si el campo ya estaba marcado), y siempre al salir del campo
  function live(input, rule, show) {
    input.addEventListener('input', function () { var m = rule(input.value); if (input.getAttribute('aria-invalid') === 'true' || isCharMsg(m)) show(m); });
    input.addEventListener('blur', function () { if (input.value) show(rule(input.value)); });
  }
  // Filtro al escribir o pegar: quita lo que no corresponde al tipo de campo y lo avisa.
  var FILTERS = {
    name: [/[^\p{L}\p{M} '’-]/gu, 'This field only accepts letters, spaces, apostrophes and hyphens.'],
    digits: [/\D/g, 'This field only accepts numbers.'],
    phone: [/(?!^\+)\D/g, 'Phone numbers only accept digits (and + at the start for a country code).'],
    user: [/[^A-Za-z0-9._-]/g, 'Usernames use plain letters, numbers, dots and hyphens only.'],
    text: [/[<>]/g, 'The < and > characters aren’t allowed.']
  };
  function filter(input, kind, show) {
    input.addEventListener('input', function () {
      var k = typeof kind === 'function' ? kind() : kind, f = FILTERS[k];
      if (!f) return;
      var v = input.value, c = v.replace(f[0], '');
      if (c === v) return;
      var pos = Math.max(0, (input.selectionStart || c.length) - (v.length - c.length));
      input.value = c;
      try { input.setSelectionRange(pos, pos); } catch (e) {}
      if (show) show(f[1]);
    });
  }
  // Campos type=number: bloquea e, E, +, -, punto y coma (el navegador sí los deja escribir)
  function digitsOnlyNumber(input) {
    input.addEventListener('keydown', function (e) { if (['e', 'E', '+', '-', '.', ','].indexOf(e.key) > -1) e.preventDefault(); });
    input.addEventListener('paste', function (e) { var t = (e.clipboardData || window.clipboardData).getData('text'); if (/\D/.test(t)) e.preventDefault(); });
  }
  // Menú móvil
  var btn = document.querySelector('.menu-btn'), nav = $('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open)); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('open', open);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
    });
  }
  var form = $('contact');
  if (!form) return;
  var rules = {
    nombre: function (v) { return nameMsg(clean(v), 2, 80, 'Enter your name.'); },
    email: function (v) { v = clean(v); return v.length <= 100 && /^[^\s@<>()"',;:]+@[^\s@<>()"',;:]+\.[^\s@<>()"',;:]{2,}$/.test(v) ? '' : 'Check your email: it’s missing the @ or the domain.'; },
    tel: function (v) { v = clean(v); return !v ? '' : phoneMsg(v, 10, 'If you add a phone number, it needs 10 digits.'); },
    mensaje: function (v) { v = cleanLong(v); return textMsg(v, 1500) || (v.length >= 15 ? '' : 'Tell us a bit more (15 characters minimum).'); }
  };
  function show(k, msg) {
    var input = $(k), e = $('err-' + k);
    e.textContent = msg; e.hidden = !msg; input.setAttribute('aria-invalid', String(!!msg));
    if (msg) input.setAttribute('aria-describedby', (k === 'mensaje' ? 'help-msg ' : '') + 'err-' + k); else if (k !== 'mensaje') input.removeAttribute('aria-describedby'); else input.setAttribute('aria-describedby', 'help-msg');
    return !msg;
  }
  function check(k) { var input = $(k); input.value = k === 'mensaje' ? cleanLong(input.value) : clean(input.value); return show(k, rules[k](input.value)); }
  var KIND = { nombre: 'name', email: 'text', tel: 'phone', mensaje: 'text' };
  Object.keys(rules).forEach(function (k) { live($(k), rules[k], function (m) { show(k, m); }); filter($(k), KIND[k], function (m) { show(k, m); }); });
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var bad = Object.keys(rules).filter(function (k) { return !check(k); });
    var ok = $('acepto').checked, ea = $('err-acepto');
    ea.textContent = ok ? '' : 'We need your OK before we can reply.'; ea.hidden = ok;
    if (bad.length) { $(bad[0]).focus(); return; }
    if (!ok) { $('acepto').focus(); return; }
    $('s-nombre').textContent = clean($('nombre').value).split(' ')[0];
    $('s-email').textContent = clean($('email').value);
    form.hidden = true; var s = $('success'); s.hidden = false; s.focus();
  });
})();
