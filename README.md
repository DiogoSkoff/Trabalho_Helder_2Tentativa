# Azura – Loja Virtual

Projeto da atividade avaliativa de **Criação de Sites** (e-commerce).
Azura é uma loja fictícia de tecnologia: notebooks, smartphones, monitores, periféricos, componentes e armazenamento. Nenhum pagamento é real e nenhum produto será enviado.

Feita somente com **HTML, CSS e JavaScript puro**, sem frameworks, e versionada com **Git**.

## Como executar
Clique no botao ali do lado de githubpages que voce sera direcionado diretamente para o site ou copie o link aqui em baixo

```
https://diogoskoff.github.io/Trabalho_Helder_2Tentativa/loja-azura/index.html
```

## Funcionalidades
- **Página inicial** com banner, categorias, ofertas da semana e produtos mais bem avaliados
- **Menu de navegação** com categorias e **busca** de produtos
- **Listagem** com filtros (categoria, preço, marca, avaliação, estoque, frete grátis e oferta) e ordenação
- **Página do produto** com imagem, nome, descrição, características, preço, quantidade, "Adicionar ao carrinho" e "Comprar agora"
- **Carrinho** com alteração de quantidade, remoção de itens, cupom de desconto, cálculo de frete e valor total
- **Checkout** com formulário de dados do cliente e entrega, validação dos campos e máscaras (CPF, telefone e CEP)
- **Formas de pagamento:**
  - Cartão de crédito, de 1x a 12x (até 6x sem juros; de 7x a 12x com juros de 1,99% ao mês)
  - Cartão de débito, à vista
  - PIX, com 5% de desconto e QR Code ilustrativo
- **Confirmação** do pedido com o resumo da compra
- **Extras:** favoritos, modo escuro, carrinho salvo no navegador (localStorage), frete grátis acima de R$ 2.000 e layout responsivo para computador e celular

## Cupons para testar
| Código | Efeito |
|---|---|
| `AZURA10` | 10% de desconto na compra |
| `FRETEGRATIS` | Frete grátis |

## Dados fictícios para testar o pagamento
Use apenas dados inventados. Exemplo de cartão: `4111 1111 1111 1111`, validade futura (ex.: `12/30`), qualquer nome e CVV `123`.

## Estrutura do projeto
```
index.html          página inicial
produtos.html       listagem, busca e filtros
produto.html        detalhes do produto
carrinho.html       carrinho de compras
checkout.html       finalização e pagamento
sucesso.html        confirmação do pedido

css/
  base.css          cores, fontes, tema escuro e layout geral
  componentes.css   cabeçalho, rodapé, botões, formulários e avisos
  home.css          página inicial
  produtos.css      cartões de produto, listagem e filtros
  produto.css       página do produto
  carrinho.css      carrinho
  checkout.css      checkout, pagamento e confirmação
  responsivo.css    ajustes para telas menores

js/
  tema.js           aplica o tema claro/escuro
  dados.js          catálogo (categorias e produtos)
  app.js            carrinho, cupom, frete, parcelamento, cabeçalho e rodapé
  home.js           monta a página inicial
  produtos.js       busca, filtros e ordenação
  produto.js        página do produto
  carrinho.js       tela do carrinho
  checkout.js       validação, pagamentos e finalização
  sucesso.js        tela de compra realizada

images/             fotos e ilustrações dos produtos
```

## Imagens dos produtos
As fotos dos produtos vêm do **Wikimedia Commons** (imagens de licença livre), carregadas direto da internet, e por isso precisam de conexão. Os endereços ficam em `js/dados.js`. Se uma foto não carregar, o site usa a ilustração `.svg` do produto que está na pasta `images/`.

## Como o código funciona (resumo)
- **Carrinho:** lista de `{ id, qtd }` guardada no `localStorage`. As funções `adicionar`, `definirQtd` e `remover` ficam em `js/app.js`.
- **Total:** `calcularTotais()` soma os itens, aplica o cupom, o desconto do PIX e o frete.
- **Parcelamento:** `parcelar()` divide o total; acima de 6x aplica juros compostos de 1,99% ao mês.
- **Filtros:** o objeto `estado` em `js/produtos.js` guarda o que foi escolhido e `renderizar()` refaz a lista a cada mudança.
- **Pedido:** ao confirmar, o pedido é salvo no navegador e a pessoa vai para `sucesso.html`. O número completo do cartão e o CVV nunca são guardados.
