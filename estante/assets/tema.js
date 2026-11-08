/* Light / dark mode. Follows the device until you press the button; the choice is then remembered on that device. */
(function () {
  var KEY = "estante-theme", root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);

  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  function isDark() { var t = root.getAttribute("data-theme"); return t ? t === "dark" : !!(mq && mq.matches); }
  function paint() {
    var dark = isDark();
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#121212" : "#ffffff");
    var b = document.getElementById("theme");
    if (b) {
      b.textContent = dark ? "Modo claro" : "Modo escuro";
      b.setAttribute("aria-pressed", String(dark));
    }
  }
  paint();
  document.addEventListener("DOMContentLoaded", function () {
    paint();
    var b = document.getElementById("theme");
    if (b) b.addEventListener("click", function () {
      var next = isDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      paint();
    });
    if (mq && mq.addEventListener) mq.addEventListener("change", paint);
  });
})();
