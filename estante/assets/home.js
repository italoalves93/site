/* Estante — home page: one shelf per section, built from sites.js. */
(function () {
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var host = document.getElementById("shelves");
  window.ESTANTE.sections.forEach(function (sec) {
    var el = document.createElement("section");
    el.className = "shelf";
    el.innerHTML = '<div class="shelf-head"><h2>' + esc(sec.title) + '</h2><span class="count">' + sec.sites.length + '</span>'
      + '<span class="spacer"></span>'
      + (sec.page ? '<a class="read" href="' + sec.page + '">Ler em colunas →</a>' : '')
      + '</div><div class="grid"></div>';
    var grid = el.querySelector(".grid");
    sec.sites.forEach(function (s) {
      var a = document.createElement("a");
      a.className = "card";
      a.href = typeof s.url === "function" ? s.url() : s.url;
      a.target = "_blank"; a.rel = "noopener";
      var sub = s.flag ? '<span class="sub flag">' + esc(s.flag) + '</span>'
              : '<span class="sub">' + esc(s.note || s.domain) + '</span>';
      a.innerHTML = '<span class="logo">' + esc(s.mono)
        + (s.domain ? '<img alt="" loading="lazy" src="https://icons.duckduckgo.com/ip3/' + s.domain + '.ico">' : '')
        + '</span><span class="meta"><span class="name">' + esc(s.name) + '</span>' + sub + '</span>';
      var img = a.querySelector("img");
      if (img) img.addEventListener("error", function () { img.remove(); });
      grid.appendChild(a);
    });
    host.appendChild(el);
  });
  try {
    var d = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
    document.getElementById("date").textContent = d;
  } catch (e) {}
})();
