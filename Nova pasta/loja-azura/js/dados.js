/* ==========================================================
   dados.js – catálogo da loja (categorias e produtos)
   Todos os produtos e marcas são fictícios.
   ========================================================== */

const CATEGORIAS = [
  { id: "notebooks", nome: "Notebooks" },
  { id: "smartphones", nome: "Smartphones" },
  { id: "monitores", nome: "Monitores" },
  { id: "perifericos", nome: "Periféricos" },
  { id: "componentes", nome: "Componentes" },
  { id: "armazenamento", nome: "Armazenamento" }
];

/* precoAntigo preenchido = produto em oferta */
const PRODUTOS = [
  {
    id: 1, categoria: "notebooks", marca: "Vector",
    nome: "Notebook Vector 15 · i5 · 16 GB · SSD 512 GB",
    preco: 3299, nota: 4.7, avaliacoes: 1284, estoque: true,
    descricao: "Notebook de 15,6 polegadas para trabalho e estudo, com processador Intel Core i5, 16 GB de memória e SSD rápido de 512 GB.",
    specs: ["Tela 15,6\" Full HD", "Intel Core i5 de 12ª geração", "16 GB de RAM DDR4", "SSD de 512 GB", "Bateria de até 10 horas"],
    imagem: "images/notebook-vector-15.svg"
  },
  {
    id: 2, categoria: "notebooks", marca: "Orbit",
    nome: "Notebook Orbit Slim 14 · Ryzen 5 · 16 GB",
    preco: 2949, nota: 4.5, avaliacoes: 731, estoque: true,
    descricao: "Fino e leve, o Orbit Slim 14 pesa apenas 1,3 kg e entrega ótimo desempenho para quem carrega o notebook todos os dias.",
    specs: ["Tela 14\" Full HD IPS", "AMD Ryzen 5", "16 GB de RAM", "SSD de 256 GB", "Peso de 1,3 kg"],
    imagem: "images/notebook-orbit-slim-14.svg"
  },
  {
    id: 3, categoria: "notebooks", marca: "Kairo",
    nome: "Notebook Kairo Pro 16 · i7 · 16 GB · SSD 1 TB",
    preco: 3989, nota: 4.8, avaliacoes: 402, estoque: true,
    descricao: "O notebook mais potente da linha, com tela grande de 16 polegadas, processador Intel Core i7 e 1 TB de armazenamento.",
    specs: ["Tela 16\" WUXGA 120 Hz", "Intel Core i7 de 12ª geração", "16 GB de RAM DDR5", "SSD de 1 TB", "Teclado retroiluminado"],
    imagem: "images/notebook-kairo-pro-16.svg"
  },
  {
    id: 4, categoria: "notebooks", marca: "Vector",
    nome: "Notebook Vector 14 · i5 · 16 GB · SSD 256 GB",
    preco: 2699, precoAntigo: 3099, nota: 4.4, avaliacoes: 518, estoque: false,
    descricao: "Versão compacta do Vector, ideal para o dia a dia. Produto temporariamente sem estoque.",
    specs: ["Tela 14\" Full HD", "Intel Core i5", "16 GB de RAM", "SSD de 256 GB", "Bateria de até 9 horas"],
    imagem: "images/notebook-vector-14.svg"
  },
  {
    id: 5, categoria: "smartphones", marca: "Nova",
    nome: "Smartphone Nova X2 · 128 GB · 6 GB RAM",
    preco: 1899, nota: 4.6, avaliacoes: 2210, estoque: true,
    descricao: "Tela AMOLED de 6,5 polegadas, câmera tripla de 50 MP e bateria que dura o dia inteiro.",
    specs: ["Tela AMOLED 6,5\"", "128 GB de armazenamento", "6 GB de RAM", "Câmera tripla de 50 MP", "Bateria de 5.000 mAh"],
    imagem: "images/smartphone-nova-x2.svg"
  },
  {
    id: 6, categoria: "smartphones", marca: "Pulse",
    nome: "Smartphone Pulse 5G · 256 GB · 8 GB RAM",
    preco: 2599, nota: 4.8, avaliacoes: 980, estoque: true,
    descricao: "Conexão 5G, tela de 120 Hz e carregamento rápido de 67 W para você ficar pouco tempo na tomada.",
    specs: ["Tela OLED 6,7\" 120 Hz", "256 GB de armazenamento", "8 GB de RAM", "5G dual chip", "Carga rápida de 67 W"],
    imagem: "images/smartphone-pulse-5g.svg"
  },
  {
    id: 7, categoria: "smartphones", marca: "Lume",
    nome: "Smartphone Lume A1 · 64 GB · 4 GB RAM",
    preco: 999, precoAntigo: 1199, nota: 4.2, avaliacoes: 3400, estoque: true,
    descricao: "Opção de entrada com ótimo custo-benefício: tela grande, câmera dupla e bateria de longa duração.",
    specs: ["Tela LCD 6,5\"", "64 GB de armazenamento", "4 GB de RAM", "Câmera dupla de 13 MP", "Bateria de 5.000 mAh"],
    imagem: "images/smartphone-lume-a1.svg"
  },
  {
    id: 8, categoria: "monitores", marca: "Prisma",
    nome: "Monitor Prisma 27\" QHD 165 Hz",
    preco: 1799, nota: 4.7, avaliacoes: 612, estoque: true,
    descricao: "Monitor gamer de 27 polegadas com resolução QHD, painel IPS e taxa de atualização de 165 Hz.",
    specs: ["27 polegadas QHD (2560x1440)", "Painel IPS", "165 Hz · 1 ms", "HDMI e DisplayPort", "Ajuste de altura e inclinação"],
    imagem: "images/monitor-prisma-27.svg"
  },
  {
    id: 9, categoria: "monitores", marca: "Prisma",
    nome: "Monitor Prisma 24\" Full HD 75 Hz",
    preco: 899, precoAntigo: 1049, nota: 4.5, avaliacoes: 1540, estoque: true,
    descricao: "Monitor de 24 polegadas com bordas finas, ótimo para escritório, estudos e entretenimento.",
    specs: ["24 polegadas Full HD", "Painel IPS", "75 Hz", "HDMI e VGA", "Bordas ultrafinas"],
    imagem: "images/monitor-prisma-24.svg"
  },
  {
    id: 10, categoria: "perifericos", marca: "Kora",
    nome: "Teclado Mecânico Kora TKL · ABNT2",
    preco: 349, nota: 4.6, avaliacoes: 890, estoque: true,
    descricao: "Teclado mecânico compacto com switches táteis, layout ABNT2 e iluminação personalizável.",
    specs: ["Formato TKL (sem teclado numérico)", "Switches mecânicos táteis", "Layout ABNT2", "Iluminação RGB", "Cabo USB destacável"],
    imagem: "images/teclado-kora.svg"
  },
  {
    id: 11, categoria: "perifericos", marca: "Glide",
    nome: "Mouse Sem Fio Glide · 2.4 GHz · 1600 DPI",
    preco: 149, precoAntigo: 189, nota: 4.4, avaliacoes: 2750, estoque: true,
    descricao: "Mouse sem fio silencioso com design ergonômico e pilha que dura até 12 meses.",
    specs: ["Conexão sem fio 2.4 GHz", "Sensor de até 1600 DPI", "Cliques silenciosos", "Design ergonômico", "Pilha com até 12 meses de duração"],
    imagem: "images/mouse-glide.svg"
  },
  {
    id: 12, categoria: "perifericos", marca: "Echo",
    nome: "Headset Gamer Echo 7.1 · USB",
    preco: 279, nota: 4.5, avaliacoes: 1320, estoque: true,
    descricao: "Som surround virtual 7.1, microfone com cancelamento de ruído e almofadas macias para longas sessões.",
    specs: ["Som surround virtual 7.1", "Microfone com cancelamento de ruído", "Conexão USB", "Almofadas de espuma viscoelástica", "Controle de volume no cabo"],
    imagem: "images/headset-echo.svg"
  },
  {
    id: 13, categoria: "componentes", marca: "Zenith",
    nome: "Placa de Vídeo Zenith RX 8 GB GDDR6",
    preco: 2899, nota: 4.7, avaliacoes: 310, estoque: true,
    descricao: "Placa de vídeo com 8 GB de memória GDDR6, ideal para jogos em Full HD e QHD com alto desempenho.",
    specs: ["8 GB GDDR6", "Barramento de 128 bits", "Três saídas DisplayPort e uma HDMI", "Refrigeração com dois coolers", "Fonte recomendada de 550 W"],
    imagem: "images/placa-video-zenith.svg"
  },
  {
    id: 14, categoria: "componentes", marca: "Flux",
    nome: "Memória RAM Flux 16 GB DDR5 5200 MHz",
    preco: 429, nota: 4.8, avaliacoes: 1900, estoque: true,
    descricao: "Módulo de memória DDR5 de 16 GB com dissipador de calor para mais velocidade e estabilidade.",
    specs: ["16 GB DDR5", "5200 MHz", "Dissipador de calor", "Compatível com placas-mãe DDR5", "Garantia de 3 anos"],
    imagem: "images/memoria-flux-16.svg"
  },
  {
    id: 15, categoria: "armazenamento", marca: "Vela",
    nome: "SSD NVMe Vela 1 TB · 3500 MB/s",
    preco: 519, precoAntigo: 649, nota: 4.8, avaliacoes: 4100, estoque: true,
    descricao: "SSD NVMe M.2 de 1 TB com leitura de até 3500 MB/s, perfeito para acelerar seu computador.",
    specs: ["1 TB", "Interface NVMe PCIe 3.0 M.2", "Leitura de até 3500 MB/s", "Gravação de até 3000 MB/s", "Garantia de 5 anos"],
    imagem: "images/ssd-vela-1tb.svg"
  },
  {
    id: 16, categoria: "armazenamento", marca: "Atlas",
    nome: "HD Externo Atlas 2 TB · USB 3.0",
    preco: 389, nota: 4.5, avaliacoes: 760, estoque: true,
    descricao: "HD externo portátil de 2 TB para backup de fotos, vídeos e documentos, com conexão USB 3.0.",
    specs: ["2 TB", "USB 3.0", "Compatível com Windows, macOS e Linux", "Design compacto", "Cabo incluso"],
    imagem: "images/hd-externo-atlas.svg"
  }
];

/* ----------------------------------------------------------
   Fotos dos produtos
   O site procura primeiro a foto em .jpg (ex.: images/notebook-vector-15.jpg).
   Se o arquivo não existir, usa o desenho .svg que já está na pasta.
   Para usar uma foto real, é só salvar o .jpg na pasta images com o mesmo nome.
   ---------------------------------------------------------- */
PRODUTOS.forEach(function (p) { p.imagem = p.imagem.replace(/\.svg$/, ".jpg"); });

document.addEventListener("error", function (e) {
  const img = e.target;
  if (img && img.tagName === "IMG" && /\.jpg$/.test(img.src)) {
    img.src = img.src.replace(/\.jpg$/, ".svg");
  }
}, true);
