/* ==========================================================
   checkout.js – finalização do pedido (simulação)
   1. máscaras dos campos
   2. validação do formulário
   3. formas de pagamento: crédito (parcelado), débito e PIX
   4. resumo do pedido e confirmação
   ========================================================== */

const formCheckout = document.getElementById("formCheckout");
const itensDoPedido = itensCarrinho();

// carrinho vazio: não há o que finalizar
if (!itensDoPedido.length) {
  document.getElementById("checkoutLayout").hidden = true;
  document.getElementById("checkoutVazio").hidden = false;
} else {
  iniciarCheckout();
}

function iniciarCheckout() {
  const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
  document.getElementById("uf").insertAdjacentHTML("beforeend", UFS.map(function (u) {
    return '<option value="' + u + '">' + u + "</option>";
  }).join(""));

  /* ---------- 1. Máscaras ---------- */
  function digitos(v) { return String(v).replace(/\D/g, ""); }

  const MASCARAS = {
    cpf: function (v) {
      return digitos(v).slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    },
    telefone: function (v) {
      v = digitos(v).slice(0, 11);
      if (v.length > 10) return v.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
      if (v.length > 6) return v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
      if (v.length > 2) return v.replace(/(\d{2})(\d*)/, "($1) $2");
      return v;
    },
    cep: function (v) {
      v = digitos(v).slice(0, 8);
      return v.length > 5 ? v.slice(0, 5) + "-" + v.slice(5) : v;
    },
    cartaoNumero: function (v) { return digitos(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "); },
    cartaoValidade: function (v) {
      v = digitos(v).slice(0, 4);
      return v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v;
    },
    cartaoCvv: function (v) { return digitos(v).slice(0, 4); }
  };

  Object.keys(MASCARAS).forEach(function (id) {
    document.getElementById(id).addEventListener("input", function (e) {
      e.target.value = MASCARAS[id](e.target.value);
    });
  });

  /* ---------- 2. Validação ---------- */
  function validade(v) {
    const m = /^(\d{2})\/(\d{2})$/.exec(v);
    if (!m) return "Informe a validade no formato MM/AA.";
    const mes = Number(m[1]);
    const ano = 2000 + Number(m[2]);
    if (mes < 1 || mes > 12) return "Mês de validade inválido.";
    if (new Date(ano, mes, 0, 23, 59, 59) < new Date()) return "Cartão vencido.";
    return "";
  }

  const REGRAS_GERAIS = [
    { id: "nome", testar: function (v) { return v.trim().length >= 5 && v.trim().indexOf(" ") > 0 ? "" : "Informe nome e sobrenome."; } },
    { id: "email", testar: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Informe um e-mail válido."; } },
    { id: "telefone", testar: function (v) { const n = digitos(v).length; return n === 10 || n === 11 ? "" : "Informe o telefone com DDD."; } },
    { id: "cpf", testar: function (v) { return digitos(v).length === 11 ? "" : "O CPF deve ter 11 dígitos."; } },
    { id: "cep", testar: function (v) { return digitos(v).length === 8 ? "" : "O CEP deve ter 8 dígitos."; } },
    { id: "endereco", testar: function (v) { return v.trim().length >= 3 ? "" : "Informe o endereço."; } },
    { id: "numero", testar: function (v) { return v.trim() ? "" : "Informe o número."; } },
    { id: "bairro", testar: function (v) { return v.trim() ? "" : "Informe o bairro."; } },
    { id: "cidade", testar: function (v) { return v.trim() ? "" : "Informe a cidade."; } },
    { id: "uf", testar: function (v) { return v ? "" : "Selecione o estado."; } }
  ];
  const REGRAS_CARTAO = [
    { id: "cartaoNumero", testar: function (v) { return digitos(v).length === 16 ? "" : "O número do cartão deve ter 16 dígitos."; } },
    { id: "cartaoNome", testar: function (v) { return v.trim().length >= 3 ? "" : "Informe o nome impresso no cartão."; } },
    { id: "cartaoValidade", testar: validade },
    { id: "cartaoCvv", testar: function (v) { const n = digitos(v).length; return n === 3 || n === 4 ? "" : "O CVV tem 3 ou 4 dígitos."; } }
  ];

  function mostrarErro(id, msg) {
    document.getElementById("erro-" + id).textContent = msg;
    document.getElementById(id).setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function pagamentoAtual() { return formCheckout.elements.pagamento.value; }

  // devolve a lista de campos com erro (e mostra as mensagens na tela)
  function validar() {
    const regras = REGRAS_GERAIS.concat(pagamentoAtual() === "pix" ? [] : REGRAS_CARTAO);
    const comErro = [];
    regras.forEach(function (r) {
      const msg = r.testar(document.getElementById(r.id).value);
      mostrarErro(r.id, msg);
      if (msg) comErro.push(r.id);
    });
    return comErro;
  }

  formCheckout.addEventListener("input", function (e) {
    if (e.target.id && document.getElementById("erro-" + e.target.id)) mostrarErro(e.target.id, "");
  });

  /* ---------- 3. Formas de pagamento ---------- */
  const painelCartao = document.getElementById("painelCartao");
  const painelPix = document.getElementById("painelPix");
  const blocoParcelas = document.getElementById("blocoParcelas");
  const selParcelas = document.getElementById("parcelas");

  function montarParcelas() {
    const anterior = Number(selParcelas.value) || 1;
    const base = calcularTotais("credito").total;
    let html = "";
    for (let n = 1; n <= MAX_PARCELAS; n++) {
      const p = parcelar(base, n);
      if (n > 1 && p.valor < PARCELA_MINIMA) break;
      html += '<option value="' + n + '">' + n + "x de " + moeda(p.valor) +
        (p.juros ? " com juros (total " + moeda(p.total) + ")" : " sem juros") + "</option>";
    }
    selParcelas.innerHTML = html;
    selParcelas.value = selParcelas.querySelector('option[value="' + anterior + '"]') ? anterior : 1;
  }

  // QR Code ilustrativo: padrão gerado a partir do valor (não é um QR real)
  function gerarQr(semente) {
    let h = 2166136261;
    for (let i = 0; i < semente.length; i++) { h ^= semente.charCodeAt(i); h = Math.imul(h, 16777619); }
    function aleatorio() { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
    const N = 25;
    let celulas = "";
    function finder(x0, y0) {
      return '<rect x="' + x0 + '" y="' + y0 + '" width="7" height="7" fill="#000"/>' +
        '<rect x="' + (x0 + 1) + '" y="' + (y0 + 1) + '" width="5" height="5" fill="#fff"/>' +
        '<rect x="' + (x0 + 2) + '" y="' + (y0 + 2) + '" width="3" height="3" fill="#000"/>';
    }
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const emCanto = (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
        if (!emCanto && aleatorio() > 0.5) celulas += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="#000"/>';
      }
    }
    return '<svg viewBox="0 0 ' + N + " " + N + '" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true">' +
      celulas + finder(0, 0) + finder(N - 7, 0) + finder(0, N - 7) + "</svg>";
  }

  function atualizarPix() {
    const valor = calcularTotais("pix").total;
    const codigo = "00020126580014BR.GOV.BCB.PIX0136azura-loja-simulacao-0000-0000-00005204000053039865406" +
      valor.toFixed(2) + "5802BR5905AZURA6009SAO PAULO62070503***6304SIM0";
    document.getElementById("pixValor").textContent = moeda(valor);
    document.getElementById("pixCodigo").textContent = codigo;
    document.getElementById("pixQr").innerHTML = gerarQr(codigo);
  }

  document.getElementById("copiarPix").addEventListener("click", function () {
    const texto = document.getElementById("pixCodigo").textContent;
    function aviso() { mostrarAviso("Código PIX copiado"); }
    function selecionar() {
      const faixa = document.createRange();
      faixa.selectNodeContents(document.getElementById("pixCodigo"));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(faixa);
      mostrarAviso("Selecione e copie o código manualmente");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(aviso, selecionar);
    } else {
      selecionar();
    }
  });

  /* ---------- 4. Resumo do pedido ---------- */
  function totaisDoPedido() {
    const tipo = pagamentoAtual();
    const t = calcularTotais(tipo);
    const parcelamento = tipo === "credito" ? parcelar(t.total, Number(selParcelas.value) || 1) : null;
    const juros = parcelamento && parcelamento.juros ? arred(parcelamento.total - t.total) : 0;
    const totalFinal = parcelamento ? parcelamento.total : t.total;
    return { tipo: tipo, t: t, parcelamento: parcelamento, juros: juros, totalFinal: totalFinal };
  }

  function atualizarResumo() {
    const r = totaisDoPedido();
    const t = r.t;
    document.getElementById("resumoItens").innerHTML = itensDoPedido.map(function (i) {
      return '<li class="resumo-item"><img src="' + i.produto.imagem + '" alt="">' +
        "<span>" + i.qtd + "× " + escapar(i.produto.nome) + "</span>" +
        "<span>" + moeda(arred(i.produto.preco * i.qtd)) + "</span></li>";
    }).join("");

    document.getElementById("resumoValores").innerHTML =
      '<div class="linha-valor"><span>Subtotal</span><span>' + moeda(t.sub) + "</span></div>" +
      (t.desconto ? '<div class="linha-valor desc"><span>Cupom ' + t.cupom + '</span><span>− ' + moeda(t.desconto) + "</span></div>" : "") +
      (t.descontoPix ? '<div class="linha-valor desc"><span>Desconto PIX (5%)</span><span>− ' + moeda(t.descontoPix) + "</span></div>" : "") +
      '<div class="linha-valor"><span>Frete</span><span>' + (t.frete ? moeda(t.frete) : "Grátis") + "</span></div>" +
      (r.juros ? '<div class="linha-valor"><span>Juros do parcelamento</span><span>' + moeda(r.juros) + "</span></div>" : "") +
      '<div class="linha-valor total"><span>Total</span><span>' + moeda(r.totalFinal) + "</span></div>";

    let texto = "Pagamento no PIX com 5% de desconto.";
    if (r.tipo === "debito") texto = "Pagamento à vista no cartão de débito.";
    if (r.parcelamento) texto = "Cartão de crédito em " + r.parcelamento.n + "x de " + moeda(r.parcelamento.valor) + (r.parcelamento.juros ? " (com juros)." : " sem juros.");
    document.getElementById("resumoPagamento").textContent = texto;
  }

  function trocarPagamento() {
    const tipo = pagamentoAtual();
    painelCartao.hidden = tipo === "pix";
    painelPix.hidden = tipo !== "pix";
    blocoParcelas.hidden = tipo !== "credito";
    if (tipo === "pix") atualizarPix();
    if (tipo === "credito") montarParcelas();
    atualizarResumo();
  }

  formCheckout.addEventListener("change", function (e) {
    if (e.target.name === "pagamento") trocarPagamento();
    else if (e.target.id === "parcelas") atualizarResumo();
  });

  /* ---------- Envio do pedido ---------- */
  formCheckout.addEventListener("submit", function (e) {
    e.preventDefault();
    const erros = validar();
    if (erros.length) {
      document.getElementById(erros[0]).focus();
      mostrarAviso("Corrija os campos destacados para continuar.");
      return;
    }
    const botao = document.getElementById("btnConfirmar");
    botao.disabled = true;
    botao.textContent = "Processando pagamento…";
    setTimeout(finalizarPedido, 1200); // simula o tempo de processamento
  });

  function finalizarPedido() {
    const r = totaisDoPedido();
    const v = function (id) { return document.getElementById(id).value.trim(); };
    const pagamento = { tipo: r.tipo };
    if (r.tipo !== "pix") pagamento.cartaoFinal = digitos(v("cartaoNumero")).slice(-4); // nunca guardamos o número completo
    if (r.parcelamento) {
      pagamento.parcelas = r.parcelamento.n;
      pagamento.valorParcela = r.parcelamento.valor;
      pagamento.comJuros = r.parcelamento.juros;
    }

    const pedido = {
      id: "AZ" + Date.now().toString(36).toUpperCase(),
      data: new Date().toISOString(),
      cliente: { nome: v("nome"), email: v("email"), telefone: v("telefone"), cpf: v("cpf") },
      entrega: {
        cep: v("cep"), endereco: v("endereco"), numero: v("numero"), complemento: v("complemento"),
        bairro: v("bairro"), cidade: v("cidade"), uf: v("uf")
      },
      itens: itensDoPedido.map(function (i) {
        return { id: i.produto.id, nome: i.produto.nome, qtd: i.qtd, preco: i.produto.preco, imagem: i.produto.imagem };
      }),
      totais: { subtotal: r.t.sub, desconto: r.t.desconto, descontoPix: r.t.descontoPix, frete: r.t.frete, juros: r.juros, total: r.totalFinal },
      cupom: r.t.cupom,
      pagamento: pagamento
    };

    const pedidos = ler(CH.pedidos, []);
    pedidos.unshift(pedido);
    gravar(CH.pedidos, pedidos.slice(0, 20));
    limparCarrinho();
    location.href = "sucesso.html?pedido=" + encodeURIComponent(pedido.id);
  }

  // se a pessoa voltar para esta página pelo navegador, o botão não fica travado
  window.addEventListener("pageshow", function (ev) {
    if (ev.persisted) {
      const b = document.getElementById("btnConfirmar");
      b.disabled = false;
      b.textContent = "Confirmar pedido";
    }
  });

  trocarPagamento();
}
