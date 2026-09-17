/**
 * DeskCraft - Lógica de Curadoria, IA e Integração com Busca de Ofertas Reais (Mercado Livre API)
 */

// Catalogo inicial de categorias e termos de busca para o Home Office
const produtosHomeOffice = [
  {
    id: 1,
    categoria: "ergonomia",
    categoriaNome: "Ergonomia",
    icone: "🪑",
    titulo: "Cadeira Ergonômica com Apoio Lombar",
    termoBuscaML: "cadeira ergonomica apoio lombar",
    motivo: "Evita dores na coluna e lombar durante longas jornadas. Possui ajuste de altura, inclinação de encosto e apoio de braço.",
    preco: "Carregando oferta...",
    avaliacao: "★ 4.9 (Mais vendida)",
    palavrasChave: ["costas", "coluna", "lombar", "postura", "sentar", "cadeira", "dor"],
    linkAfiliado: "#"
  },
  {
    id: 2,
    categoria: "ergonomia",
    categoriaNome: "Ergonomia",
    icone: "💻",
    titulo: "Suporte Articulado para Notebook",
    termoBuscaML: "suporte notebook articulado aluminio",
    motivo: "Eleva a tela do notebook para a altura exata dos olhos, corrigindo a curvatura do pescoço e coluna.",
    preco: "Carregando oferta...",
    avaliacao: "★ 4.8 (Alta avaliação)",
    palavrasChave: ["pescoço", "notebook", "cervical", "altura", "postura", "suporte", "olhos"],
    linkAfiliado: "#"
  },
  {
    id: 3,
    categoria: "iluminacao",
    categoriaNome: "Iluminação",
    icone: "💡",
    titulo: "Luminária de Monitor ScreenBar LED",
    termoBuscaML: "luminaria monitor screenbar led",
    motivo: "Ilumina a mesa diretamente sem criar reflexo na tela. Essencial para eliminar a vista cansada e dores de cabeça.",
    preco: "Carregando oferta...",
    avaliacao: "★ 4.9 (Destaque iluminação)",
    palavrasChave: ["olhos", "luz", "vista", "cansaço", "iluminação", "noite", "monitor", "cabeça"],
    linkAfiliado: "#"
  },
  {
    id: 4,
    categoria: "iluminacao",
    categoriaNome: "Iluminação",
    icone: "📹",
    titulo: "Webcam Full HD com Microfone",
    termoBuscaML: "webcam full hd microfone",
    motivo: "Garante iluminação facial e imagem nítida em reuniões virtuais de trabalho ou videochamadas com clientes.",
    preco: "Carregando oferta...",
    avaliacao: "★ 4.7 (Excelente em reuniões)",
    palavrasChave: ["reunião", "videochamada", "webcam", "câmera", "imagem", "luz", "zoom", "teams"],
    linkAfiliado: "#"
  },
  {
    id: 5,
    categoria: "organizacao",
    categoriaNome: "Organização",
    icone: "⌨️",
    titulo: "Desk Pad em Couro Ecológico Grande",
    termoBuscaML: "desk pad couro ecologico 90x40",
    motivo: "Protege a mesa contra riscos, melhora a precisão do mouse e organiza a área de digitação com acabamento sofisticado.",
    preco: "Carregando oferta...",
    avaliacao: "★ 4.8 (Favorito de organização)",
    palavrasChave: ["mesa", "mouse", "teclado", "pad", "couro", "risco", "estética", "organizar"],
    linkAfiliado: "#"
  },
  {
    id: 6,
    categoria: "organizacao",
    categoriaNome: "Organização",
    icone: "🔌",
    titulo: "Organizador e Esconde Cabos Flexível",
    motivo: "Agrupa e esconde fios e cabos soltos, eliminando a poluição visual embaixo da mesa e facilitando a limpeza.",
    preco: "Carregando oferta...",
    avaliacao: "★ 4.9 (Praticidade máxima)",
    palavrasChave: ["cabos", "fios", "bagunça", "organizador", "tomada", "fiação", "poluição visual"],
    linkAfiliado: "#"
  }
];

// Elementos DOM
const containerProdutos = document.getElementById("products-grid");
const botoesFiltro = document.querySelectorAll(".filter-btn");
const aiForm = document.getElementById("ai-form");
const aiInput = document.getElementById("ai-input");
const aiResultBox = document.getElementById("ai-result-box");
const aiResponseText = document.getElementById("ai-response-text");
const chips = document.querySelectorAll(".chip");

let idProdutoRecomendado = null;

/**
 * Busca a oferta real ao vivo usando a API pública do Mercado Livre
 */
async function buscarOfertasReaisML() {
  for (let produto of produtosHomeOffice) {
    try {
      const urlAPI = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(produto.termoBuscaML)}&limit=1`;
      const resposta = await fetch(urlAPI);
      const dados = await resposta.json();

      if (dados.results && dados.results.length > 0) {
        const itemML = dados.results[0];
        
        // Formata o preço retornado em Real (R$)
        const precoFormatado = itemML.price.toLocaleString('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        });

        produto.preco = precoFormatado;
        produto.linkAfiliado = itemML.permalink;
        if (itemML.thumbnail) {
          produto.imagemReal = itemML.thumbnail.replace('-I.jpg', '-O.jpg'); // imagem em resolução maior
        }
      } else {
        // Link de busca direta como fallback
        produto.linkAfiliado = `https://lista.mercadolivre.com.br/${encodeURIComponent(produto.termoBuscaML)}`;
      }
    } catch (erro) {
      console.warn(`Não foi possível buscar a oferta de ${produto.titulo}:`, erro);
      produto.linkAfiliado = `https://lista.mercadolivre.com.br/${encodeURIComponent(produto.termoBuscaML)}`;
      if (produto.preco === "Carregando oferta...") {
        produto.preco = "Ver preço no Mercado Livre";
      }
    }
  }

  // Re-renderiza os produtos na tela com os preços e links reais atualizados
  renderizarProdutos(obterCategoriaAtiva());
}

function obterCategoriaAtiva() {
  const botaoAtivo = document.querySelector(".filter-btn.active");
  return botaoAtivo ? botaoAtivo.getAttribute("data-category") : "todos";
}

// Renderiza os cards na página
function renderizarProdutos(categoriaSelecionada = "todos") {
  containerProdutos.innerHTML = "";

  const produtosFiltrados = categoriaSelecionada === "todos" 
    ? produtosHomeOffice 
    : produtosHomeOffice.filter(p => p.categoria === categoriaSelecionada);

  produtosFiltrados.forEach(produto => {
    const card = document.createElement("article");
    const isDestaque = produto.id === idProdutoRecomendado;
    
    card.className = `product-card ${isDestaque ? "highlighted" : ""}`;
    card.setAttribute("id", `produto-${produto.id}`);
    
    const iconeOuImagem = produto.imagemReal 
      ? `<img src="${produto.imagemReal}" alt="${produto.titulo}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 8px; margin-bottom: 12px;">` 
      : `<div class="product-icon">${produto.icone}</div>`;

    card.innerHTML = `
      <div>
        <span class="product-tag">${produto.categoriaNome}</span>
        ${iconeOuImagem}
        <h3 class="product-title">${produto.titulo}</h3>
        <p class="product-reason">${produto.motivo}</p>
      </div>
      <div>
        <div class="product-meta">
          <span class="product-price">${produto.preco}</span>
          <span class="product-rating">${produto.avaliacao}</span>
        </div>
        <a href="${produto.linkAfiliado}" class="btn-buy" target="_blank" rel="noopener noreferrer">
          Ver Oferta no Mercado Livre ↗
        </a>
      </div>
    `;

    containerProdutos.appendChild(card);
  });
}

// Mecanismo da IA de Recomendação
function processarRecomendacaoIA(promptTexto) {
  const promptLower = promptTexto.toLowerCase();
  let melhorMatch = null;
  let pontuacaoMaxima = 0;

  produtosHomeOffice.forEach(produto => {
    let pontos = 0;
    produto.palavrasChave.forEach(palavra => {
      if (promptLower.includes(palavra)) {
        pontos += 2;
      }
    });

    if (pontos > pontuacaoMaxima) {
      pontuacaoMaxima = pontos;
      melhorMatch = produto;
    }
  });

  if (!melhorMatch) {
    melhorMatch = produtosHomeOffice[0];
  }

  idProdutoRecomendado = melhorMatch.id;

  aiResultBox.classList.remove("hidden");
  aiResponseText.innerHTML = `Com base na sua busca (<em>"${promptTexto}"</em>), identificamos que a melhor recomendação para o seu caso é o item de <strong>${melhorMatch.categoriaNome}</strong>: <strong>${melhorMatch.titulo}</strong>.<br><br>💡 <strong>Por que este produto?</strong> ${melhorMatch.motivo}<br>🏷️ <strong>Preço encontrado ao vivo:</strong> ${melhorMatch.preco}`;

  renderizarProdutos(obterCategoriaAtiva());
  
  setTimeout(() => {
    const cardElemento = document.getElementById(`produto-${melhorMatch.id}`);
    if (cardElemento) {
      cardElemento.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 100);
}

// Listeners dos Filtros
botoesFiltro.forEach(botao => {
  botao.addEventListener("click", () => {
    botoesFiltro.forEach(b => b.classList.remove("active"));
    botao.classList.add("active");
    idProdutoRecomendado = null;
    renderizarProdutos(botao.getAttribute("data-category"));
  });
});

// Listener da IA
aiForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const busca = aiInput.value.trim();
  if (busca) {
    processarRecomendacaoIA(busca);
  }
});

// Listener dos Chips
chips.forEach(chip => {
  chip.addEventListener("click", () => {
    const prompt = chip.getAttribute("data-prompt");
    aiInput.value = prompt;
    processarRecomendacaoIA(prompt);
  });
});

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  renderizarProdutos("todos");
  // Busca as ofertas reais via API
  buscarOfertasReaisML();
});
