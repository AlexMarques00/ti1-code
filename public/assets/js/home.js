// ============================================
// Sistema de Destaques (Home)
// ============================================

// Dados dos locais carregados do db.json (places)
let lugares = [];
// Estado da aplicação
let favoritos = [];
let usuarioLogadoId = null;

// tags ativas selecionadas pelo navbar
let activeTagFilters = [];

// normaliza texto de tag (remove acentos, coloca em lowercase)
function normalizeTag(tag) {
    return tag ? tag.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
}

// termo atual da busca (normalizado)
let searchQuery = '';

// Helper: detecta se o lugar tem a tag 'date'
function hasDatesTag(lugar) {
    if (!lugar || !lugar.tags) return false;
    return (lugar.tags || []).map(normalizeTag).includes('date');
}

// verifica se um lugar corresponde ao termo de busca atual
function matchesSearch(lugar) {
    if (!searchQuery) return true;
    const haystack = [lugar.nome, lugar.descricao, lugar.endereco, (lugar.tags || []).join(' ')].join(' ');
    return normalizeTag(haystack).includes(searchQuery);
}

// verifica se um lugar passa nos filtros de tag ativos
function passesTagFilter(lugar) {
    if (!activeTagFilters || activeTagFilters.length === 0) return true;
    const lugarTags = (lugar.tags || []).map(normalizeTag);
    return activeTagFilters.some(f => lugarTags.includes(f));
}

// expõe função para o navbar (ou outros) aplicar a busca
window.applySearchQuery = function(q) {
    searchQuery = normalizeTag(q || '');
    renderizarApp();
};

// retorna array de resultados atuais (aplica filtros de tag e busca)
window.getSearchResults = function() {
    return lugares.filter(l => passesTagFilter(l) && matchesSearch(l));
};

// função exposta para o navbar aplicar filtros por tag
window.applyTagFilters = function(tags) {
    activeTagFilters = (tags || []).map(normalizeTag).filter(Boolean);
    renderizarApp();
};

// ============================================
// Funções de Favoritos (localStorage)
// ============================================

function getFavoriteStorageKey() {
    // A chave agora é específica para o ID do usuário
    return `ddd031_favoritos_${usuarioLogadoId}`;
}

function carregarFavoritos() {
    // Tenta carregar o ID do usuário logado antes de carregar favoritos
    const usuarioCorrente = getUsuarioCorrente();
    if (usuarioCorrente && usuarioCorrente.id) {
        usuarioLogadoId = usuarioCorrente.id;
    } else {
        // Se não houver usuário logado, usamos um ID temporário para não quebrar, mas os favoritos não serão persistidos corretamente.
        usuarioLogadoId = 0; 
    }
    
    // Tenta carregar os favoritos do localStorage com a chave específica
    const saved = localStorage.getItem(getFavoriteStorageKey());
    favoritos = saved ? JSON.parse(saved) : [];
}

function salvarFavoritos() {
    if (!usuarioLogadoId || usuarioLogadoId === 0) {
        console.warn("Tentativa de salvar favoritos sem ID de usuário logado válido.");
        return;
    }
    // Salva a lista atual de favoritos na chave específica do usuário
    localStorage.setItem(getFavoriteStorageKey(), JSON.stringify(favoritos));
}

function toggleFavorito(id) {
    const index = favoritos.indexOf(id);
    if (index > -1) {
        // Se já está nos favoritos, remove
        favoritos.splice(index, 1);
    } else {
        // Se não está, adiciona
        favoritos.push(id);
    }
    salvarFavoritos();
    // Re-renderiza a aplicação para atualizar os ícones e a lista de favoritos
    renderizarApp();
}

function isFavorito(id) {
    return favoritos.includes(id);
}

// ============================================
// Funções de Renderização
// ============================================

function renderizarApp() {
    const root = document.getElementById('home-content');
    if (!root) return;
    // Inclui locais com tag 'date' na renderização da HOME
    const lugaresVisiveis = lugares;
    const lugaresPorCategoria = agruparPorCategoria(lugaresVisiveis);
    const lugaresDestaque = lugaresVisiveis.filter(l => l.destaque && passesTagFilter(l) && matchesSearch(l));
    const hasActiveFilters = activeTagFilters && activeTagFilters.length > 0;
    const isSearching = !!searchQuery;

    if (isSearching) {
        // Quando em modo busca, exibimos apenas os cards que batem com a pesquisa
        // Não exclui 'date' durante busca na HOME
        const resultados = lugares.filter(l => passesTagFilter(l) && matchesSearch(l));
        root.innerHTML = `
            <main class="main-content-padding">
                <div class="container-home no-carousel">
                    ${renderizarResultadosBusca(resultados)}
                </div>
            </main>
        `;
    } else {
        root.innerHTML = `
            <main class="main-content-padding"> 
                <div class="container-home ${hasActiveFilters ? 'no-carousel' : ''}">
                    ${renderizarCarrosselDestaques(lugaresDestaque)}
                    ${renderizarListasPorCategoria(lugaresPorCategoria)}
                </div>
            </main>
        `;
    }
    
    adicionarEventListeners();
    inicializarCarrossel();
}

// Renderiza resultados de busca como uma lista plana de cards
function renderizarResultadosBusca(resultados) {
    if (!resultados || resultados.length === 0) {
        return `<section class="search-results-empty"><h2>Sem resultados</h2><p>Não foram encontrados locais com esse termo de busca.</p></section>`;
    }

    const cardsHtml = resultados.map(lugar => renderizarCard(lugar)).join('');

    return `
        <section class="search-results">
            <h2>Resultados da Busca (${resultados.length})</h2>
            <div class="cards-grid search-cards-grid">
                ${cardsHtml}
            </div>
        </section>
    `;
}

function agruparPorCategoria(lugares) {
    const grupos = {};
    // aplicar filtro por tags ativas e por busca antes de agrupar
    const listaFiltrada = lugares.filter(lugar => passesTagFilter(lugar) && matchesSearch(lugar));

    listaFiltrada.forEach(lugar => {
        // Usa a primeira tag como categoria principal
        const categoria = lugar.tags && lugar.tags.length > 0 ? lugar.tags[0] : 'Outros';
        if (!grupos[categoria]) {
            grupos[categoria] = [];
        }
        grupos[categoria].push(lugar);
    });
    return grupos;
}

// ============================================
// Carrossel de Destaques
// ============================================

function renderizarCarrosselDestaques(lugaresDestaque) {
    if (lugaresDestaque.length === 0) return '';

    // Esconde o carrossel quando houver filtros ativos no navbar
    const hiddenClass = (activeTagFilters && activeTagFilters.length > 0) ? 'hidden' : '';

    const slidesHtml = lugaresDestaque.map((lugar, index) => {
        const imageUrl = lugar.image || 'https://via.placeholder.com/800x400?text=Imagem+Destaque+Indisponível';
        return `
            <div class="carousel-slide" data-index="${index}">
                <img src="${imageUrl}" alt="${lugar.nome}" class="carousel-image">
                <div class="carousel-caption">
                    <h2>${lugar.nome}</h2>
                    <p>${lugar.descricao}</p>
                    <button class="details-btn btn btn-primary" data-id="${lugar.id}">Ver Detalhes</button>
                </div>
            </div>
        `;
    }).join('');

    return `
        <section class="carousel-section ${hiddenClass}">
            <div class="carousel-container">
                <div class="carousel-slides" id="destaques-carousel">
                    ${slidesHtml}
                </div>
                <button class="carousel-control prev">❮</button>
                <button class="carousel-control next">❯</button>
                <div class="carousel-dots" id="carousel-dots"></div>
            </div>
        </section>
    `;
}

function inicializarCarrossel() {
    const carousel = document.getElementById('destaques-carousel');
    if (!carousel) return;

    // Se a seção do carrossel estiver escondida, não inicializa a lógica do carrossel
    const carouselSection = carousel.closest('.carousel-section');
    if (carouselSection && carouselSection.classList.contains('hidden')) return;

    const slides = carousel.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');
    const dotsContainer = document.getElementById('carousel-dots');
    let currentIndex = 0;

    // Cria os indicadores (dots)
    slides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    const dots = dotsContainer.querySelectorAll('.dot');

    function updateCarousel() {
        const offset = -currentIndex * 100;
        carousel.style.transform = `translateX(${offset}%)`;
        
        // Atualiza os dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function goToSlide(index) {
        currentIndex = (index + slides.length) % slides.length;
        updateCarousel();
    }

    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

    // Inicializa o carrossel na primeira posição
    updateCarousel();
}

// ============================================
// Listas por Categoria
// ============================================

function renderizarListasPorCategoria(lugaresPorCategoria) {
    let html = '';
    
    // Ordena as categorias alfabeticamente
    const categoriasOrdenadas = Object.keys(lugaresPorCategoria).sort();

    categoriasOrdenadas.forEach(categoria => {
        const lugaresDaCategoria = lugaresPorCategoria[categoria];
        if (lugaresDaCategoria.length === 0) return;

        const cardsHtml = lugaresDaCategoria.map(lugar => renderizarCard(lugar)).join('');

        html += `
            <section class="category-section">
                <h2>${categoria.toUpperCase()}</h2>
                <div class="cards-grid">
                
                ${cardsHtml}
                    
                </div>
                
            </section>
        `;
    });

    return html;
}

// Função de renderização de card padronizada (mantida a mesma lógica)
function renderizarCard(lugar) {
    const esFavorito = isFavorito(lugar.id);
    const classDetails = 'btn-secondary';
    let classFavoriteBtn = '';
    let favoriteBtnText = '';
    let favoriteBtnIcon = '';

    if (esFavorito) {
        // Se JÁ É FAVORITO (para REMOVER)
        classFavoriteBtn = 'btn-danger';
        favoriteBtnText = 'Remover';
        favoriteBtnIcon = '—'; 
    } else {
        // Se NÃO É FAVORITO (para FAVORITAR)
        classFavoriteBtn = 'btn-primary';
        favoriteBtnText = 'Favoritar';
        favoriteBtnIcon = '❤';
    }

    // Usando a primeira tag como categoria principal de exibição
    const categoriaPrincipal = lugar.tags && lugar.tags.length > 0 ? lugar.tags[0] : 'Geral'; 
    // Formatando todas as tags
    const tagsHtml = lugar.tags ? lugar.tags.map(tag => `<span class="place-card-tag">${tag.toUpperCase()}</span>`).join('') : '';

    // A imagem será carregada do JSON Server, usando a propriedade 'image'
    const imageUrl = lugar.image || 'https://via.placeholder.com/400x120?text=Imagem+Indisponível';

    return `
        <div class="place-card ${esFavorito ? 'favorite' : ''}">
            <div class="place-card-image">
                <img src="${imageUrl}" alt="${lugar.nome}" onerror="this.src='https://via.placeholder.com/400x120?text=${encodeURIComponent(lugar.nome)}'">
                ${lugar.destaque ? `<div class="place-card-badge">Destaque</div>` : ''}
            </div>
            <div class="place-card-content">
                <div class="place-card-header">
                    <div>
                        <div class="place-card-title">${lugar.nome}</div>
                        <div class="place-card-category">${categoriaPrincipal.toUpperCase()}</div>
                    </div>
                    <div class="place-card-rating">
                        <span class="place-card-rating-star">★</span>
                        <span class="place-card-rating-value">${lugar.rating.toFixed(1)}</span>
                    </div>
                </div>
                <p class="place-card-description">${lugar.descricao}</p>
                
                

                <div class="place-card-location">
                    <span class="place-card-location-icon"><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M12 10c-1.104 0-2-.896-2-2s.896-2 2-2 2 .896 2 2-.896 2-2 2m0-5c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3m-7 2.602c0-3.517 3.271-6.602 7-6.602s7 3.085 7 6.602c0 3.455-2.563 7.543-7 14.527-4.489-7.073-7-11.072-7-14.527m7-7.602c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602"/></svg></span>
                    <span>${lugar.endereco}</span>
                </div>
                <div class="place-card-reviews">${lugar.ratings} avaliações</div>
                <div class="place-card-actions">
                    <button class="favorite-btn btn ${classFavoriteBtn}" data-id="${lugar.id}">
                        <span class="favorite-btn-icon">${favoriteBtnIcon}</span>
                        ${favoriteBtnText}
                    </button>
                    <button class="details-btn btn ${classDetails}" data-id="${lugar.id}">Ver Detalhes</button>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// Funções de Filtros de Tags (Navbar)
// ============================================

function getTodasTagsUnicas() {
    const allTags = lugares.flatMap(lugar => lugar.tags || []);
    return [...new Set(allTags)].sort();
}

function renderizarFiltrosTags() {
    const filterDropdown = document.getElementById('filterDropdown');
    if (!filterDropdown) return;

    const tagsUnicas = getTodasTagsUnicas();

    // Limpa os filtros existentes (que podem ser do HTML estático)
    filterDropdown.innerHTML = ''; 

    const optionsHtml = tagsUnicas.map(tag => {
        // Cria um ID amigável para o checkbox
        const tagId = `filter-${tag.replace(/\s/g, '-')}`; 
        return `
            <div class="filter-option">
                <input type="checkbox" id="${tagId}">
                <label for="${tagId}">${tag.charAt(0).toUpperCase() + tag.slice(1)}</label>
            </div>
        `;
    }).join('');

    // Injeta os novos filtros no dropdown
    filterDropdown.innerHTML = optionsHtml;
}


// ============================================
// Event Listeners
// ============================================

function adicionarEventListeners() {
    // Botões de favoritar
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            toggleFavorito(id);
        });
    });

    // Botões de detalhes (incluindo os do carrossel)
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            const lugar = lugares.find(l => l.id === id);
            mostrarDetalhes(lugar);
        });
    });
}

// ============================================
// Modal de Detalhes (Mantido o mesmo)
// ============================================

function mostrarDetalhes(lugar) {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop'; // Classe para fundo escuro
    const esFavorito = isFavorito(lugar.id);
    
    // Usando a primeira tag como categoria principal de exibição
    const categoriaPrincipal = lugar.tags && lugar.tags.length > 0 ? lugar.tags[0] : 'Geral'; 
    const tagsHtml = lugar.tags ? lugar.tags.map(tag => `<span class="modal-tag">${tag.toUpperCase()}</span>`).join(' ') : '';

    const imageUrl = lugar.image || 'https://via.placeholder.com/600x300?text=Imagem+Indisponível';

    modal.innerHTML = `
        <div class="modal-content card modal-box"> 
            <div class="modal-header">
                <h2 class="modal-title">${lugar.nome}</h2>
                <button class="close" onclick="this.closest('.modal-backdrop').remove()">✕</button>
            </div>

            <div class="modal-body">
                <img src="${imageUrl}" alt="${lugar.nome}" class="modal-image" onerror="this.src='https://via.placeholder.com/600x300?text=${encodeURIComponent(lugar.nome)}'">

                <div class="modal-info-grid">
                    <div>
                        <p class="modal-label">Categoria Principal</p>
                        <p class="modal-value">${categoriaPrincipal.toUpperCase()}</p>
                    </div>
                    <div>
                        <p class="modal-label">Avaliação</p>
                        <p class="modal-value"> ★ ${lugar.rating.toFixed(1)} / 5.0</p>
                    </div>
                    <div>
                        <p class="modal-label">Avaliações</p>
                        <p class="modal-value">${lugar.ratings}</p>
                    </div>
                </div>

                <div class="modal-description">
                    <p class="modal-label">Descrição</p>
                    <p class="modal-value-description">${lugar.descricao}</p>
                </div>
                
                <div class="modal-tags-container">
                    ${tagsHtml}
                </div>


                <div class="modal-location">
                    <p class="modal-label">Localização</p>
                    <p class="modal-value-location"> <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M12 10c-1.104 0-2-.896-2-2s.896-2 2-2 2 .896 2 2-.896 2-2 2m0-5c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3m-7 2.602c0-3.517 3.271-6.602 7-6.602s7 3.085 7 6.602c0 3.455-2.563 7.543-7 14.527-4.489-7.073-7-11.072-7-14.527m7-7.602c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602"/></svg> ${lugar.endereco}</p>
                </div>

                <div class="modal-actions btn-group">
                    <button id="modalFavoriteBtn" class="btn btn-primary" data-id="${lugar.id}">
                        ${esFavorito ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');

    // Event listener para o botão de favoritar no modal
    const modalFavoriteBtn = document.getElementById('modalFavoriteBtn');
    modalFavoriteBtn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        toggleFavorito(id);
        // Fecha o modal após favoritar/desfavoritar
        e.currentTarget.closest('.modal-backdrop').remove();
    });

    // Fechar modal ao clicar no backdrop
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Remover no-scroll quando o modal for removido
    const observer = new MutationObserver(function(mutationsList, observer) {
        for (const mutation of mutationsList) {
            // Verifica se o modal foi removido
            if (mutation.type === 'childList' && !document.body.contains(modal)) {
                document.body.classList.remove('no-scroll');
                observer.disconnect();
            }
        }
    });
    observer.observe(document.body, { childList: true });
}

// ============================================
// Inicialização
// ============================================

function getUsuarioCorrente() {
    const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    return usuarioCorrenteJSON ? JSON.parse(usuarioCorrenteJSON) : null;
}

async function inicializarDados() {
    // Não é necessário verificar o login para a Home, mas precisamos do ID para os favoritos
    carregarFavoritos();
    
    try {
        // Faz a requisição para o endpoint de lugares
        const response = await fetch('/places'); 
        
        if (!response.ok) {
            throw new Error(`Erro de rede: ${response.status}`);
        }
        
        lugares = await response.json(); 
        
        // Aplica filtros pendentes vindos do sessionStorage (ex.: quando o usuário escolheu filtros na navbar e foi redirecionado)
        const pending = sessionStorage.getItem('selectedTagFilters');
        if (pending) {
            try {
                const parsed = JSON.parse(pending);
                activeTagFilters = (parsed || []).map(normalizeTag).filter(Boolean);
            } catch (err) {
                activeTagFilters = [];
            }
            sessionStorage.removeItem('selectedTagFilters');
        }
        
        // Renderiza a aplicação
        renderizarApp();

    } catch (error) {
        console.error("Falha ao carregar os dados:", error);
        const root = document.getElementById('home-content');
        if (root) {
            root.innerHTML = '<p>Erro ao carregar dados dos locais. Verifique se o JSON Server está rodando na porta 3000.</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa carregando os dados e renderizando
    inicializarDados();
});
