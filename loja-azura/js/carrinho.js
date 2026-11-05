/* ==========================================================
   carrinho.js – tela do carrinho
   Mostra os itens, permite alterar a quantidade, remover,
   aplicar cupom e calcula subtotal, frete e total.
   ========================================================== */

const raiz = document.getElementById("carrinhoConteudo");
let mensagemCupom = null; // { tipo: "ok" | "erro", texto: "..." }

function linhaItem(item) {
  const p = item.produto;
  const totalLinha = arred(p.preco * item.qtd);
  return '<li class="item-carrinho">' +
    '<a href="produto.html?id=' + p.id + '"><img src="' + p.imagem + '" alt="' + escapar(p.nome) + '"></a>' +
    "<div>" +
      '<a class="name" href="produto.html?id=' + p.id + '">' + escapar(p.nome) + "</a>" +
      '<div class="sub">' + moeda(p.preco) + " cada</div>" +
    "</div>" +
    '<div class="qtd" role="group" aria-label="Quantidade de ' + escapar(p.nome) + '">' +
      '<button type="button" data-menos="' + p.id + '" aria-label="Diminuir quantidade"' + (item.qtd <= 1 ? " disabled" : "") + ">−</button>" +
      "<output>" + item.qtd + "</output>" +
      '<button type="button" data-mais="' + p.id + '" aria-label="Aumentar quantidade"' + (item.qtd >= LIMITE_POR_ITEM ? " disabled" : "") + ">+</button>" +
    "</div>" +
    '<div class="item-fim">' +
      '<div class="item-total">' + moeda(totalLinha) + "</div>" +
      '<button class="btn-remover" type="button" data-remover="' + p.id + '">Remover</button>' +
    "</div>" +
  "</li>";
}

function resumo() {
  const t = calcularTotais("");
  const faltam = Math.max(0, FRETE_GRATIS_ACIMA - t.sub);
  const progresso = Math.min(100, Math.round(t.sub / FRETE_GRATIS_ACIMA * 100));
  const codigo = t.cupom;

  return '<aside class="panel resumo-compra" aria-label="Resumo da compra">' +
    "<h2>Resumo</h2>" +
    '<div class="linha-valor"><span>Subtotal</span><span>' + moeda(t.sub) + "</span></div>" +
    (t.desconto ? '<div class="linha-valor desc"><span>Cupom ' + codigo + '</span><span>− ' + moeda(t.desconto) + "</span></div>" : "") +
    '<div class="linha-valor"><span>Frete</span><span>' + (t.frete ? moeda(t.frete) : "Grátis") + "</span></div>" +
    (faltam > 0 && !(codigo && CUPONS[codigo].tipo === "frete")
      ? '<div><div class="barra-frete" aria-hidden="true"><span style="width:' + progresso + '%"></span></div>' +
        '<p class="msg muted" style="margin-top:6px">Faltam ' + moeda(faltam) + " para o frete grátis.</p></div>"
      : "") +
    '<div class="linha-valor total"><span>Total</span><span>' + moeda(t.total) + "</span></div>" +
    '<p class="msg muted" style="margin:0">Até ' + PARCELAS_SEM_JUROS + "x de " + moeda(parcelar(t.total, PARCELAS_SEM_JUROS).valor) + " sem juros ou " + moeda(arred(t.total * (1 - DESCONTO_PIX))) + " no PIX.</p>" +
    '<form class="cupom" id="formCupom" aria-label="Cupom de desconto">' +
      '<input id="cupom" type="text" placeholder="Cupom de desconto" aria-label="Cupom de desconto" autocomplete="off">' +
      '<button type="submit">Aplicar</button>' +
    "</form>" +
    (mensagemCupom ? '<p class="msg ' + mensagemCupom.tipo + '" role="status">' + mensagemCupom.texto + "</p>" : "") +
    (codigo ? '<button class="btn-link" type="button" id="tirarCupom">Remover cupom ' + codigo + "</button>" : '<p class="msg muted" style="margin:0">Dica: use AZURA10 ou FRETEGRATIS.</p>') +
    '<a class="btn-primary full" href="checkout.html">Finalizar compra</a>' +
    '<a class="btn-ghost full" href="produtos.html">Continuar comprando</a>' +
  "</aside>";
}

function renderizar() {
  const itens = itensCarrinho();
  if (!itens.length) {
    raiz.innerHTML =
      '<div class="vazio" style="margin-top:16px"><h2>Seu carrinho está vazio</h2>' +
      "<p>Explore as categorias e adicione produtos para ver o resumo da compra aqui.</p>" +
      '<a class="btn-primary" href="produtos.html">Ver produtos</a></div>';
    return;
  }
  raiz.innerHTML =
    '<div class="carrinho-layout">' +
      '<ul class="lista-carrinho" aria-label="Itens do carrinho">' + itens.map(linhaItem).join("") + "</ul>" +
      resumo() +
    "</div>";
}

function qtdAtual(id) {
  const item = carrinho().find(function (i) { return i.id === id; });
  return item ? item.qtd : 0;
}

raiz.addEventListener("click", function (e) {
  const menos = e.target.closest("[data-menos]");
  const mais = e.target.closest("[data-mais]");
  const rem = e.target.closest("[data-remover]");
  if (menos) {
    const id = Number(menos.getAttribute("data-menos"));
    definirQtd(id, qtdAtual(id) - 1);
  } else if (mais) {
    const id = Number(mais.getAttribute("data-mais"));
    definirQtd(id, qtdAtual(id) + 1);
  } else if (rem) {
    remover(Number(rem.getAttribute("data-remover")));
    mostrarAviso("Produto removido do carrinho");
  } else if (e.target.id === "tirarCupom") {
    removerCupom();
    mensagemCupom = { tipo: "ok", texto: "Cupom removido." };
  } else {
    return;
  }
  renderizar();
});

raiz.addEventListener("submit", function (e) {
  if (e.target.id !== "formCupom") return;
  e.preventDefault();
  const codigo = document.getElementById("cupom").value;
  if (!codigo.trim()) {
    mensagemCupom = { tipo: "erro", texto: "Digite o código do cupom." };
  } else if (aplicarCupom(codigo)) {
    mensagemCupom = { tipo: "ok", texto: "Cupom aplicado: " + CUPONS[codigo.trim().toUpperCase()].texto + "." };
  } else {
    mensagemCupom = { tipo: "erro", texto: "Cupom inválido. Confira o código e tente de novo." };
  }
  renderizar();
});

renderizar();
