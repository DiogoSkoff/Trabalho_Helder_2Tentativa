/* ==========================================================
   app.js – funções usadas em todas as páginas
   1. utilidades (formatação de valores, localStorage)
   2. carrinho, cupom, frete e parcelamento
   3. favoritos
   4. cabeçalho, rodapé, avisos e cartão de produto
   ========================================================== */

/* ---------- 1. Utilidades ---------- */

// chaves usadas no localStorage do navegador
const CH = {
  carrinho: "azura_carrinho",
  favoritos: "azura_favoritos",
  tema: "azura_tema",
  pedidos: "azura_pedidos",
  cupom: "azura_cupom"
};

function ler(chave, padrao) {
  try {
    const v = localStorage.getItem(chave);
    return v ? JSON.parse(v) : padrao;
  } catch (e) {
    return padrao;
  }
}

function gravar(chave, valor) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* sem armazenamento */ }
}

function arred(n) { return Math.round(n * 100) / 100; }
function moeda(n) { return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function precoCurto(n) { return Number.isInteger(n) ? "R$ " + n.toLocaleString("pt-BR") : moeda(n); }
function notaFmt(n) { return n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
function semAcento(s) { return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
function produtoPorId(id) { return PRODUTOS.find(function (p) { return p.id === Number(id); }); }
function categoriaPorId(id) { return CATEGORIAS.find(function (c) { return c.id === id; }); }

function escapar(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

/* ---------- 2. Carrinho, cupom, frete e parcelamento ---------- */

const LIMITE_POR_ITEM = 10;
const FRETE_FIXO = 24.9;
const FRETE_GRATIS_ACIMA = 2000;   // compras a partir deste valor têm frete grátis
const DESCONTO_PIX = 0.05;         // 5% de desconto no PIX
const PARCELAS_SEM_JUROS = 6;
const MAX_PARCELAS = 12;
const PARCELA_MINIMA = 30;
const JUROS_MENSAL = 0.0199;       // 1,99% ao mês a partir da 7ª parcela

const CUPONS = {
  AZURA10: { tipo: "percentual", valor: 10, texto: "10% de desconto na compra" },
  FRETEGRATIS: { tipo: "frete", texto: "Frete grátis" }
};

// o carrinho é uma lista de { id, qtd } guardada no navegador
function carrinho() { return ler(CH.carrinho, []); }

function totalItens() {
  return carrinho().reduce(function (soma, i) { return soma + i.qtd; }, 0);
}

function adicionar(id, qtd) {
  qtd = qtd || 1;
  const lista = carrinho();
  const item = lista.find(function (i) { return i.id === id; });
  if (item) item.qtd = Math.min(LIMITE_POR_ITEM, item.qtd + qtd);
  else lista.push({ id: id, qtd: Math.min(LIMITE_POR_ITEM, qtd) });
  gravar(CH.carrinho, lista);
  atualizarBadge();
}

function definirQtd(id, qtd) {
  let lista = carrinho();
  if (qtd <= 0) {
    lista = lista.filter(function (i) { return i.id !== id; });
  } else {
    lista.forEach(function (i) { if (i.id === id) i.qtd = Math.min(LIMITE_POR_ITEM, qtd); });
  }
  gravar(CH.carrinho, lista);
  atualizarBadge();
}

function remover(id) { definirQtd(id, 0); }

function limparCarrinho() {
  gravar(CH.carrinho, []);
  gravar(CH.cupom, null);
  atualizarBadge();
}

// junta cada item do carrinho com os dados do produto
function itensCarrinho() {
  return carrinho()
    .map(function (i) { return { produto: produtoPorId(i.id), qtd: i.qtd }; })
    .filter(function (i) { return i.produto; });
}

function subtotal() {
  return arred(itensCarrinho().reduce(function (s, i) { return s + i.produto.preco * i.qtd; }, 0));
}

function cupomAtivo() {
  const codigo = ler(CH.cupom, null);
  return codigo && CUPONS[codigo] ? codigo : null;
}

function aplicarCupom(codigo) {
  const c = String(codigo).trim().toUpperCase();
  if (!CUPONS[c]) return false;
  gravar(CH.cupom, c);
  return true;
}

function removerCupom() { gravar(CH.cupom, null); }

// calcula todos os valores da compra. pagamento: "pix", "credito" ou "debito"
function calcularTotais(pagamento) {
  const sub = subtotal();
  const codigo = cupomAtivo();
  const cupom = codigo ? CUPONS[codigo] : null;
  const desconto = cupom && cupom.tipo === "percentual" ? arred(sub * cupom.valor / 100) : 0;
  const freteGratis = sub >= FRETE_GRATIS_ACIMA || (cupom && cupom.tipo === "frete");
  const frete = sub === 0 || freteGratis ? 0 : FRETE_FIXO;
  const base = sub - desconto;
  const descontoPix = pagamento === "pix" ? arred(base * DESCONTO_PIX) : 0;
  const total = arred(base - descontoPix + frete);
  return { sub: sub, desconto: desconto, frete: frete, descontoPix: descontoPix, total: total, cupom: codigo };
}

// parcelamento: até 6x sem juros; de 7x a 12x com juros compostos
function parcelar(total, n) {
  if (n <= PARCELAS_SEM_JUROS) {
    return { n: n, valor: arred(total / n), total: arred(total), juros: false };
  }
  const comJuros = total * Math.pow(1 + JUROS_MENSAL, n);
  return { n: n, valor: arred(comJuros / n), total: arred(comJuros), juros: true };
}

/* ---------- 3. Favoritos ---------- */

function favoritos() { return ler(CH.favoritos, []); }

function alternarFavorito(id) {
  let lista = favoritos();
  if (lista.indexOf(id) >= 0) lista = lista.filter(function (f) { return f !== id; });
  else lista.push(id);
  gravar(CH.favoritos, lista);
  return lista.indexOf(id) >= 0;
}

/* ---------- 4. Layout compartilhado ---------- */

function atualizarBadge() {
  const n = totalItens();
  document.querySelectorAll(".js-qtd-carrinho").forEach(function (el) { el.textContent = n; });
}

function mostrarAviso(texto) {
  let el = document.getElementById("aviso");
  if (!el) {
    el = document.createElement("div");
    el.id = "aviso";
    el.className = "toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    document.body.appendChild(el);
  }
  el.textContent = texto;
  el.classList.add("visivel");
  clearTimeout(mostrarAviso.timer);
  mostrarAviso.timer = setTimeout(function () { el.classList.remove("visivel"); }, 2400);
}

function montarCabecalho() {
  const alvo = document.getElementById("cabecalho");
  if (!alvo) return;
  const params = new URLSearchParams(location.search);
  const catAtual = location.pathname.indexOf("produtos.html") >= 0 ? params.get("cat") : null;
  const ofertaAtiva = location.pathname.indexOf("produtos.html") >= 0 && params.get("oferta") === "1";

  const links = CATEGORIAS.map(function (c) {
    return '<a href="produtos.html?cat=' + c.id + '"' + (catAtual === c.id ? ' aria-current="page"' : "") + ">" + c.nome + "</a>";
  }).join("");

  alvo.innerHTML =
    '<header class="site-header"><div class="wrap">' +
      '<div class="topbar">' +
        '<a class="brand" href="index.html" aria-label="Azura – página inicial"><b>AZURA</b><i></i></a>' +
        '<form class="search" role="search" action="produtos.html" method="get">' +
          '<input type="search" name="q" placeholder="Busque por notebook, smartphone, SSD…" aria-label="Buscar produtos" autocomplete="off" value="' + escapar(params.get("q") || "") + '">' +
          '<button type="submit">Buscar</button>' +
        "</form>" +
        '<div class="actions">' +
          '<button class="pill" id="btnTema" type="button"></button>' +
          '<a class="pill" href="carrinho.html">Carrinho (<span class="js-qtd-carrinho">0</span>)</a>' +
        "</div>" +
      "</div>" +
      '<nav class="nav" aria-label="Categorias">' + links +
        '<a href="produtos.html?oferta=1"' + (ofertaAtiva ? ' aria-current="page"' : "") + ">Ofertas</a>" +
      "</nav>" +
    "</div></header>";

  const btn = document.getElementById("btnTema");
  function pintar() {
    btn.textContent = document.documentElement.getAttribute("data-theme") === "dark" ? "☀ Claro" : "☾ Escuro";
  }
  btn.addEventListener("click", function () {
    const novo = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", novo);
    try { localStorage.setItem(CH.tema, novo); } catch (e) {}
    pintar();
  });
  pintar();
}

function montarRodape() {
  const alvo = document.getElementById("rodape");
  if (!alvo) return;
  alvo.innerHTML =
    '<footer class="site-footer"><div class="wrap">' +
      "<div><b>AZURA</b><p>Loja virtual fictícia criada para a atividade de Criação de Sites. Nenhum pagamento é real e nenhum produto será enviado.</p></div>" +
      '<nav aria-label="Rodapé">' +
        '<a href="index.html">Início</a>' +
        '<a href="produtos.html">Todos os produtos</a>' +
        '<a href="produtos.html?oferta=1">Ofertas</a>' +
        '<a href="carrinho.html">Carrinho</a>' +
      "</nav>" +
    "</div></footer>";
}

// monta o HTML de um cartão de produto (usado na home, na listagem e nos relacionados)
function cardProduto(p) {
  const fav = favoritos().indexOf(p.id) >= 0;
  const pct = p.precoAntigo ? Math.round((1 - p.preco / p.precoAntigo) * 100) : 0;
  let frete = "Frete " + moeda(FRETE_FIXO);
  let classeFrete = "ship";
  if (!p.estoque) frete = "Sem estoque";
  else if (p.preco >= FRETE_GRATIS_ACIMA) { frete = "Frete grátis"; classeFrete = "ship free"; }
  const parcela = parcelar(p.preco, PARCELAS_SEM_JUROS);

  return '<article class="card">' +
    '<button class="fav" type="button" data-fav="' + p.id + '" aria-pressed="' + fav + '" aria-label="Favoritar ' + escapar(p.nome) + '">' + (fav ? "♥" : "♡") + "</button>" +
    '<a class="card-link" href="produto.html?id=' + p.id + '">' +
      '<div class="photo"><img src="' + p.imagem + '" alt="' + escapar(p.nome) + '" loading="lazy"></div>' +
      '<div class="info">' +
        '<h3 class="name">' + escapar(p.nome) + "</h3>" +
        '<div class="rate">★ ' + notaFmt(p.nota) + " (" + p.avaliacoes.toLocaleString("pt-BR") + ")" + (pct ? " · Oferta" : "") + "</div>" +
        '<div class="price-line">' +
          (p.precoAntigo ? '<s class="old">' + precoCurto(p.precoAntigo) + "</s>" : "") +
          '<span class="price">' + precoCurto(p.preco) + "</span>" +
          (pct ? '<span class="off">' + pct + "% OFF</span>" : "") +
        "</div>" +
        '<div class="parcelas">em ' + PARCELAS_SEM_JUROS + "x de " + moeda(parcela.valor) + " sem juros</div>" +
        '<div class="' + classeFrete + '">' + frete + "</div>" +
      "</div>" +
    "</a>" +
    '<div class="card-actions"><button class="btn-primary sm" type="button" data-add="' + p.id + '"' + (p.estoque ? "" : " disabled") + ">" +
      (p.estoque ? "Adicionar ao carrinho" : "Indisponível") + "</button></div>" +
  "</article>";
}

// cliques nos botões "Adicionar ao carrinho" e "Favoritar" funcionam em qualquer página
document.addEventListener("click", function (e) {
  const btnAdd = e.target.closest("[data-add]");
  if (btnAdd) {
    const p = produtoPorId(btnAdd.getAttribute("data-add"));
    if (p && p.estoque) {
      adicionar(p.id, 1);
      mostrarAviso("Adicionado ao carrinho: " + p.nome);
    }
    return;
  }
  const btnFav = e.target.closest("[data-fav]");
  if (btnFav) {
    const ativo = alternarFavorito(Number(btnFav.getAttribute("data-fav")));
    btnFav.setAttribute("aria-pressed", ativo);
    btnFav.textContent = ativo ? "♥" : "♡";
  }
});

montarCabecalho();
montarRodape();
atualizarBadge();
