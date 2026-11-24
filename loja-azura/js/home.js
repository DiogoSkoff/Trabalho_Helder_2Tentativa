/*monta as seções da página inicial a partir do catálogo */

//usa a imagem do primeiro produto de cada uma
document.getElementById("categorias").innerHTML = CATEGORIAS.map(function (c) {
  const doGrupo = PRODUTOS.filter(function (p) { return p.categoria === c.id; });
  return '<a class="cat-tile" href="produtos.html?cat=' + c.id + '">' +
    '<img src="' + doGrupo[0].imagem + '" alt="">' +
    "<span><b>" + c.nome + "</b><small>" + doGrupo.length + " produtos</small></span></a>";
}).join("");

//produtos que têm "precoAntigo"
document.getElementById("ofertas").innerHTML = PRODUTOS
  .filter(function (p) { return p.precoAntigo; })
  .slice(0, 4)
  .map(cardProduto).join("");

// mais bem avaliados
document.getElementById("destaques").innerHTML = PRODUTOS.slice()
  .sort(function (a, b) { return b.nota - a.nota || b.avaliacoes - a.avaliacoes; })
  .slice(0, 4)
  .map(cardProduto).join("");
