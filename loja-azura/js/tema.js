(function () {
  var tema = null;
  try { tema = localStorage.getItem("azura_tema"); } catch (e) {}
  if (!tema) {
    var escuro = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    tema = escuro ? "dark" : "light";
  }
  document.documentElement.setAttribute("data-theme", tema);
})();
