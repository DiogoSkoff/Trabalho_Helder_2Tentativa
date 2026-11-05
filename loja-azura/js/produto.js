/* produto.js – página de detalhes de um produto (produto.html?id=1) */

const idProduto = Number(new URLSearchParams(location.search).get("id"));
const prod = produtoPorId(idProduto);
const alvoProduto = document.getElementById("produto");

if (!prod) {
  // id inválido ou ausente na URL
  document.title = "Produto não encontrado – Azura";
  alvoProduto.innerHTML =
    '<div class="vazio"><h2>Produto não encontrado</h2>' +
    "<p>O endereço pode estar incorreto ou o produto saiu do catálogo.</p>" +
    '<a class="btn-primary" href="produtos.html">Ver todos os produtos</a></div>';
} else {
  document.title = prod.nome + " – Azura";
  const cat = categoriaPorId(prod.categoria);
  const pct = prod.precoAntigo ? Math.round((1 - prod.preco / prod.precoAntigo) * 100) : 0;
  const sem6x = parcelar(prod.preco, PARCELAS_SEM_JUROS);
  const precoPix = arred(prod.preco * (1 - DESCONTO_PIX));
  let qtd = 1;

  const freteTexto = !prod.estoque
    ? "Produto sem estoque no momento"
    : prod.preco >= FRETE_GRATIS_ACIMA
      ? "Frete grátis para todo o Brasil"
      : "Frete " + moeda(FRETE_FIXO) + " · grátis em compras acima de " + precoCurto(FRETE_GRATIS_ACIMA);

  alvoProduto.innerHTML =
    '<div class="crumbs"><a href="index.html">Início</a> › <a href="produtos.html?cat=' + cat.id + '">' + cat.nome + "</a> › " + escapar(prod.nome) + "</div>" +
    '<div class="detalhe">' +
      '<div class="detalhe-foto"><img src="' + prod.imagem + '" alt="' + escapar(prod.nome) + '"></div>' +
      '<div class="detalhe-info">' +
        '<span class="marca">' + escapar(prod.marca) + "</span>" +
        "<h1>" + escapar(prod.nome) + "</h1>" +
        '<div class="rate">★ ' + notaFmt(prod.nota) + " (" + prod.avaliacoes.toLocaleString("pt-BR") + " avaliações)</div>" +
        '<div class="compra">' +
          "<div>" +
            (prod.precoAntigo ? '<div class="price-line"><s class="old">' + precoCurto(prod.precoAntigo) + '</s><span class="off">' + pct + "% OFF</span></div>" : "") +
            '<div class="preco-grande">' + precoCurto(prod.preco) + "</div>" +
            '<div class="parcelas">ou ' + PARCELAS_SEM_JUROS + "x de " + moeda(sem6x.valor) + " sem juros</div>" +
            '<div class="ship free">' + moeda(precoPix) + " no PIX (" + Math.round(DESCONTO_PIX * 100) + "% de desconto)</div>" +
          "</div>" +
          '<div class="ship' + (prod.estoque && prod.preco >= FRETE_GRATIS_ACIMA ? " free" : "") + '">' + freteTexto + "</div>" +
          '<div class="qtd" role="group" aria-label="Quantidade">' +
            '<button type="button" id="menos" aria-label="Diminuir quantidade">−</button>' +
            '<output id="qtd" aria-live="polite">1</output>' +
            '<button type="button" id="mais" aria-label="Aumentar quantidade">+</button>' +
          "</div>" +
          '<div class="botoes">' +
            '<button class="btn-primary" type="button" id="adicionar"' + (prod.estoque ? "" : " disabled") + ">" + (prod.estoque ? "Adicionar ao carrinho" : "Indisponível") + "</button>" +
            '<button class="btn-ghost" type="button" id="comprar"' + (prod.estoque ? "" : " disabled") + ">Comprar agora</button>" +
          "</div>" +
        "</div>" +
        "<div><h2 class=\"bloco-titulo\">Descrição</h2><p class=\"muted\" style=\"margin:0\">" + escapar(prod.descricao) + "</p></div>" +
        '<div><h2 class="bloco-titulo">Características</h2><ul class="specs">' +
          prod.specs.map(function (s) { return "<li>" + escapar(s) + "</li>"; }).join("") +
        "</ul></div>" +
      "</div>" +
    "</div>";

  const saida = document.getElementById("qtd");
  const btnMenos = document.getElementById("menos");
  const btnMais = document.getElementById("mais");

  function atualizarQtd() {
    saida.textContent = qtd;
    btnMenos.disabled = qtd <= 1;
    btnMais.disabled = qtd >= LIMITE_POR_ITEM;
  }
  btnMenos.addEventListener("click", function () { qtd = Math.max(1, qtd - 1); atualizarQtd(); });
  btnMais.addEventListener("click", function () { qtd = Math.min(LIMITE_POR_ITEM, qtd + 1); atualizarQtd(); });
  atualizarQtd();

  document.getElementById("adicionar").addEventListener("click", function () {
    adicionar(prod.id, qtd);
    mostrarAviso(qtd + (qtd === 1 ? " unidade adicionada" : " unidades adicionadas") + " ao carrinho");
  });
  document.getElementById("comprar").addEventListener("click", function () {
    adicionar(prod.id, qtd);
    location.href = "carrinho.html";
  });

  // produtos relacionados: mesma categoria; se faltar, completa com os mais bem avaliados
  let rel = PRODUTOS.filter(function (p) { return p.categoria === prod.categoria && p.id !== prod.id; });
  if (rel.length < 4) {
    const extras = PRODUTOS
      .filter(function (p) { return p.categoria !== prod.categoria; })
      .sort(function (a, b) { return b.nota - a.nota; });
    rel = rel.concat(extras);
  }
  document.getElementById("relacionados").innerHTML = rel.slice(0, 4).map(cardProduto).join("");
  document.getElementById("relacionadosSecao").hidden = false;
}
