/* sucesso.js – mensagem de compra realizada com o resumo do pedido */

const alvoConfirmacao = document.getElementById("confirmacao");
const idPedido = new URLSearchParams(location.search).get("pedido");
const todos = ler(CH.pedidos, []);
const pedido = todos.find(function (p) { return p.id === idPedido; }) || (idPedido ? null : todos[0]);

function descricaoPagamento(pg) {
  if (pg.tipo === "pix") return "PIX (com 5% de desconto)";
  const final = " · cartão final " + pg.cartaoFinal;
  if (pg.tipo === "debito") return "Cartão de débito" + final;
  return "Cartão de crédito em " + pg.parcelas + "x de " + moeda(pg.valorParcela) + (pg.comJuros ? " com juros" : " sem juros") + final;
}

if (!pedido) {
  alvoConfirmacao.innerHTML =
    '<div class="vazio"><h2>Nenhum pedido encontrado</h2>' +
    "<p>Não encontramos esse pedido neste navegador. Faça uma compra para ver a confirmação aqui.</p>" +
    '<a class="btn-primary" href="produtos.html">Ver produtos</a></div>';
} else {
  document.title = "Pedido " + pedido.id + " confirmado – Azura";
  const e = pedido.entrega;
  const primeiroNome = pedido.cliente.nome.split(" ")[0];

  alvoConfirmacao.innerHTML =
    '<section class="sucesso" aria-labelledby="t-sucesso">' +
      '<div class="selo" aria-hidden="true">✓</div>' +
      '<h1 class="titulo" id="t-sucesso">Compra realizada com sucesso!</h1>' +
      '<p class="muted">Obrigado, ' + escapar(primeiroNome) + "! Esta é uma simulação: enviaríamos a confirmação para " + escapar(pedido.cliente.email) + ".</p>" +
      '<span class="numero">Pedido ' + pedido.id + "</span>" +
      '<div class="panel detalhes">' +
        "<dl>" +
          "<dt>Pagamento</dt><dd>" + escapar(descricaoPagamento(pedido.pagamento)) + "</dd>" +
          "<dt>Entrega</dt><dd>" + escapar(e.endereco + ", " + e.numero + (e.complemento ? " – " + e.complemento : "") + " · " + e.bairro + ", " + e.cidade + "/" + e.uf + " · CEP " + e.cep) + "</dd>" +
          "<dt>Previsão</dt><dd>Até 5 dias úteis após a confirmação do pagamento</dd>" +
        "</dl>" +
        '<ul class="resumo-itens">' +
          pedido.itens.map(function (i) {
            return '<li class="resumo-item"><img src="' + i.imagem + '" alt="">' +
              "<span>" + i.qtd + "× " + escapar(i.nome) + "</span><span>" + moeda(arred(i.preco * i.qtd)) + "</span></li>";
          }).join("") +
        "</ul>" +
        '<div class="linha-valor"><span>Subtotal</span><span>' + moeda(pedido.totais.subtotal) + "</span></div>" +
        (pedido.totais.desconto ? '<div class="linha-valor desc"><span>Cupom ' + pedido.cupom + '</span><span>− ' + moeda(pedido.totais.desconto) + "</span></div>" : "") +
        (pedido.totais.descontoPix ? '<div class="linha-valor desc"><span>Desconto PIX</span><span>− ' + moeda(pedido.totais.descontoPix) + "</span></div>" : "") +
        '<div class="linha-valor"><span>Frete</span><span>' + (pedido.totais.frete ? moeda(pedido.totais.frete) : "Grátis") + "</span></div>" +
        (pedido.totais.juros ? '<div class="linha-valor"><span>Juros do parcelamento</span><span>' + moeda(pedido.totais.juros) + "</span></div>" : "") +
        '<div class="linha-valor total"><span>Total</span><span>' + moeda(pedido.totais.total) + "</span></div>" +
      "</div>" +
      '<div class="botoes"><a class="btn-primary" href="index.html">Voltar à loja</a><a class="btn-ghost" href="produtos.html">Continuar comprando</a></div>' +
    "</section>";
}
