/* ==========================================================
   produtos.js – listagem com busca, filtros e ordenação
   Fluxo: o objeto "estado" guarda os filtros escolhidos;
   toda vez que algo muda, a função renderizar() refaz a lista.
   ========================================================== */

const params = new URLSearchParams(location.search);

const estado = {
  cat: params.get("cat") || "todas",
  preco: "qualquer",
  marcas: [],
  nota: "0",
  estoque: false,
  frete: false,
  oferta: params.get("oferta") === "1",
  q: (params.get("q") || "").trim(),
  ordem: "relevancia"
};
if (estado.cat !== "todas" && !categoriaPorId(estado.cat)) estado.cat = "todas";

const FAIXAS = [
  { id: "qualquer", rotulo: "Qualquer preço" },
  { id: "ate500", rotulo: "Até R$ 500", ok: function (p) { return p.preco <= 500; } },
  { id: "meio", rotulo: "R$ 500 a R$ 2.000", ok: function (p) { return p.preco > 500 && p.preco <= 2000; } },
  { id: "acima", rotulo: "Acima de R$ 2.000", ok: function (p) { return p.preco > 2000; } }
];
const NOTAS = [
  { id: "0", rotulo: "Todas" },
  { id: "4", rotulo: "4 estrelas ou mais" },
  { id: "4.5", rotulo: "4,5 ou mais" },
  { id: "4.7", rotulo: "4,7 ou mais" }
];

const form = document.getElementById("filtros");

/* ---------- monta o painel de filtros ---------- */
function opcoesRadio(nome, lista, atual) {
  return lista.map(function (i) {
    return '<label class="opt"><input type="radio" name="' + nome + '" value="' + i.id + '"' + (i.id === atual ? " checked" : "") + ">" + i.rotulo + "</label>";
  }).join("");
}

function marcasDisponiveis() {
  const lista = PRODUTOS
    .filter(function (p) { return estado.cat === "todas" || p.categoria === estado.cat; })
    .map(function (p) { return p.marca; });
  return Array.from(new Set(lista)).sort();
}

function htmlMarcas() {
  return marcasDisponiveis().map(function (m) {
    return '<label class="opt"><input type="checkbox" name="marca" value="' + m + '"' + (estado.marcas.indexOf(m) >= 0 ? " checked" : "") + ">" + m + "</label>";
  }).join("");
}

function montarFiltros() {
  const cats = [{ id: "todas", rotulo: "Todas" }].concat(CATEGORIAS.map(function (c) { return { id: c.id, rotulo: c.nome }; }));
  form.innerHTML =
    '<fieldset class="group"><legend>Categoria</legend>' + opcoesRadio("cat", cats, estado.cat) + "</fieldset>" +
    '<fieldset class="group"><legend>Preço</legend>' + opcoesRadio("preco", FAIXAS, estado.preco) + "</fieldset>" +
    '<fieldset class="group" id="grupoMarca"><legend>Marca</legend>' + htmlMarcas() + "</fieldset>" +
    '<fieldset class="group"><legend>Avaliação</legend>' + opcoesRadio("nota", NOTAS, estado.nota) + "</fieldset>" +
    '<fieldset class="group"><legend>Disponibilidade</legend>' +
      '<label class="opt"><input type="checkbox" name="estoque"' + (estado.estoque ? " checked" : "") + ">Em estoque</label>" +
      '<label class="opt"><input type="checkbox" name="frete"' + (estado.frete ? " checked" : "") + ">Frete grátis</label>" +
      '<label class="opt"><input type="checkbox" name="oferta"' + (estado.oferta ? " checked" : "") + ">Em oferta</label>" +
    "</fieldset>" +
    '<button class="btn-ghost full" type="button" id="limpar">Limpar filtros</button>';
}

/* ---------- aplica os filtros ---------- */
function passaNosFiltros(p) {
  if (estado.cat !== "todas" && p.categoria !== estado.cat) return false;
  const faixa = FAIXAS.find(function (f) { return f.id === estado.preco; });
  if (faixa && faixa.ok && !faixa.ok(p)) return false;
  if (estado.marcas.length && estado.marcas.indexOf(p.marca) < 0) return false;
  if (p.nota < parseFloat(estado.nota)) return false;
  if (estado.estoque && !p.estoque) return false;
  if (estado.frete && p.preco < FRETE_GRATIS_ACIMA) return false;
  if (estado.oferta && !p.precoAntigo) return false;
  if (estado.q) {
    const texto = semAcento(p.nome + " " + p.marca + " " + categoriaPorId(p.categoria).nome);
    const ok = semAcento(estado.q).split(/\s+/).every(function (palavra) { return texto.indexOf(palavra) >= 0; });
    if (!ok) return false;
  }
  return true;
}

function ordenar(lista) {
  const l = lista.slice();
  if (estado.ordem === "menor") l.sort(function (a, b) { return a.preco - b.preco; });
  else if (estado.ordem === "maior") l.sort(function (a, b) { return b.preco - a.preco; });
  else if (estado.ordem === "nota") l.sort(function (a, b) { return b.nota - a.nota; });
  else l.sort(function (a, b) { return b.avaliacoes - a.avaliacoes; });
  return l;
}

function titulo() {
  if (estado.q) return "Resultados para “" + estado.q + "”";
  if (estado.cat !== "todas") return categoriaPorId(estado.cat).nome;
  if (estado.oferta) return "Ofertas";
  return "Todos os produtos";
}

function listaDeChips() {
  const c = [];
  if (estado.cat !== "todas") c.push({ k: "cat", t: "Categoria: " + categoriaPorId(estado.cat).nome });
  if (estado.preco !== "qualquer") c.push({ k: "preco", t: "Preço: " + FAIXAS.find(function (f) { return f.id === estado.preco; }).rotulo });
  estado.marcas.forEach(function (m) { c.push({ k: "marca:" + m, t: "Marca: " + m }); });
  if (estado.nota !== "0") c.push({ k: "nota", t: "Avaliação: " + NOTAS.find(function (n) { return n.id === estado.nota; }).rotulo });
  if (estado.estoque) c.push({ k: "estoque", t: "Em estoque" });
  if (estado.frete) c.push({ k: "frete", t: "Frete grátis" });
  if (estado.oferta) c.push({ k: "oferta", t: "Em oferta" });
  if (estado.q) c.push({ k: "q", t: "Busca: " + estado.q });
  return c;
}

function renderizar() {
  const itens = ordenar(PRODUTOS.filter(passaNosFiltros));
  const t = titulo();
  document.title = t + " – Azura";
  document.getElementById("titulo").textContent = t;
  document.getElementById("crumbs").textContent = "Início › Tecnologia › " + t;
  document.getElementById("contagem").textContent = itens.length + (itens.length === 1 ? " resultado" : " resultados");
  document.getElementById("chips").innerHTML = listaDeChips().map(function (c) {
    return '<span class="chip">' + escapar(c.t) + '<button type="button" data-rm="' + escapar(c.k) + '" aria-label="Remover filtro ' + escapar(c.t) + '">×</button></span>';
  }).join("");

  document.getElementById("lista").innerHTML = itens.length
    ? '<div class="grid">' + itens.map(cardProduto).join("") + "</div>"
    : '<div class="vazio"><h2>Nenhum produto encontrado</h2>' +
      "<p>Não encontramos produtos com os filtros escolhidos. Experimente outros filtros ou limpe-os para ver todos os produtos.</p>" +
      '<button class="btn-primary" type="button" id="limparVazio">Limpar filtros</button></div>';
}

function limparTudo() {
  estado.cat = "todas"; estado.preco = "qualquer"; estado.marcas = []; estado.nota = "0";
  estado.estoque = false; estado.frete = false; estado.oferta = false; estado.q = "";
  const busca = document.querySelector(".search input");
  if (busca) busca.value = "";
  montarFiltros();
  renderizar();
}

/* ---------- eventos ---------- */
form.addEventListener("change", function () {
  const f = form.elements;
  const mudouCategoria = f.cat.value !== estado.cat;
  estado.cat = f.cat.value;
  estado.preco = f.preco.value;
  estado.nota = f.nota.value;
  estado.estoque = f.estoque.checked;
  estado.frete = f.frete.checked;
  estado.oferta = f.oferta.checked;
  if (mudouCategoria) {
    estado.marcas = [];
    document.getElementById("grupoMarca").innerHTML = "<legend>Marca</legend>" + htmlMarcas();
  } else {
    estado.marcas = Array.from(form.querySelectorAll('input[name="marca"]:checked')).map(function (i) { return i.value; });
  }
  renderizar();
});

document.getElementById("ordem").addEventListener("change", function (e) {
  estado.ordem = e.target.value;
  renderizar();
});

document.addEventListener("click", function (e) {
  if (e.target.id === "limpar" || e.target.id === "limparVazio") return limparTudo();
  const rm = e.target.closest("[data-rm]");
  if (!rm) return;
  const k = rm.getAttribute("data-rm");
  if (k === "cat") { estado.cat = "todas"; estado.marcas = []; }
  else if (k === "preco") estado.preco = "qualquer";
  else if (k === "nota") estado.nota = "0";
  else if (k === "estoque") estado.estoque = false;
  else if (k === "frete") estado.frete = false;
  else if (k === "oferta") estado.oferta = false;
  else if (k === "q") {
    estado.q = "";
    const busca = document.querySelector(".search input");
    if (busca) busca.value = "";
  }
  else if (k.indexOf("marca:") === 0) estado.marcas = estado.marcas.filter(function (m) { return m !== k.slice(6); });
  montarFiltros();
  renderizar();
});

// no computador os filtros ficam sempre abertos; no celular ficam recolhidos
const caixa = document.getElementById("filtrosBox");
if (window.matchMedia) {
  const largo = window.matchMedia("(min-width: 861px)");
  const ajustar = function () { if (largo.matches) caixa.open = true; };
  ajustar();
  if (largo.addEventListener) largo.addEventListener("change", ajustar);
}

montarFiltros();
renderizar();
