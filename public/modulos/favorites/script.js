// ============================================
// Sistema de Destaques e Favoritos
// ============================================

// Dados dos locais carregados do db.json (places)
let lugares = [];
// Estado da aplicação
let favoritos = [];
let lugaresDestaque = [];
let usuarioLogadoId = null;
// ============================================
// Funções de Favoritos (localStorage)
// ============================================

function getFavoriteStorageKey() {
    // A chave agora é específica para o ID do usuário
    return `ddd031_favoritos_${usuarioLogadoId}`;
}

function carregarFavoritos() {
    // Verifica se o usuárioLogadoId foi definido (deve ser no inicializarDados)
    if (!usuarioLogadoId) {
        favoritos = [];
        return;
    }
    
    // Tenta carregar os favoritos do localStorage com a chave específica
    const saved = localStorage.getItem(getFavoriteStorageKey());
    favoritos = saved ? JSON.parse(saved) : [];
}

function salvarFavoritos() {
    if (!usuarioLogadoId) {
        console.error("Tentativa de salvar favoritos sem ID de usuário logado.");
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
    const root = document.getElementById('favorites-page-div');
    root.innerHTML = `
        <section class="favorites-section">
            ${renderizarSecaoFavoritos()}
        </section>
    `;
    
    // Adicionar event listeners após a injeção do HTML
    adicionarEventListeners();
}




function renderizarSecaoFavoritos() {
    // Filtra os locais que estão na lista de favoritos
    const lugaresComFavorito = favoritos.map(id => lugares.find(l => l.id === id)).filter(Boolean);
    
    if (lugaresComFavorito.length === 0) {
        return `
            <section class="favorites-section">
                <div class="favorites-header">
                   
                </div>
                <div class="favorites-empty">
                    <p>Nenhum local favorito ainda :( </p>
                    <small>Clique no coração para adicionar seus locais favoritos</small>
                </div>
            </section>
        `;
    }

    const cardsHtml = lugaresComFavorito.map(lugar => renderizarCard(lugar, true)).join('');

    return `
        <section class="favorites-section">
            <div class="favorites-header">
                
            </div>
            <div class="cards-grid">
                ${cardsHtml}
            </div>
        </section>
    `;
}



function renderizarCard(lugar, isFavoritesSection) {
    const esFavorito = isFavorito(lugar.id);
    const classFavorite = esFavorito ? 'favorite' : '';
    const classDetails = 'btn-secondary';
    let classFavoriteBtn = '';
    let favoriteBtnText = '';
    let favoriteBtnIcon = '';

    if (esFavorito) {
        // Se JÁ É FAVORITO (para REMOVER): Estilo Vermelho Contornado (danger-outline)
        classFavoriteBtn = 'btn-danger';
        favoriteBtnText = 'Remover';
        favoriteBtnIcon = '—'; 
    } else {
        // Se NÃO É FAVORITO (para FAVORITAR): Estilo Roxo (primary)
        classFavoriteBtn = 'btn-primary';
        favoriteBtnText = 'Favoritar';
        favoriteBtnIcon = '❤';
    }

    // Usando a primeira tag como categoria principal de exibição (opcional, mas preenche a lacuna)
    const categoriaPrincipal = lugar.tags && lugar.tags.length > 0 ? lugar.tags[0] : 'Geral'; 
    // Formatando todas as tags
    const tagsHtml = lugar.tags ? lugar.tags.map(tag => `<span class="place-card-tag">${tag}</span>`).join('') : '';

    return `
        <div class="place-card ${classFavorite}">
            <div class="place-card-image">
                <img src="${lugar.image}" alt="${lugar.nome}" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(lugar.nome)}'">
                ${lugar.destaque && !isFavoritesSection ? `<div class="place-card-badge">Destaque</div>` : ''}
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
                    <span class="place-card-location-icon">
    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd">
        <path d="M12 10c-1.104 0-2-.896-2-2s.896-2 2-2 2 .896 2 2-.896 2-2 2m0-5c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3m-7 2.602c0-3.517 3.271-6.602 7-6.602s7 3.085 7 6.602c0 3.455-2.563 7.543-7 14.527-4.489-7.073-7-11.072-7-14.527m7-7.602c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602"/>
    </svg>
</span>

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

    // Botões de detalhes
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            const lugar = lugares.find(l => l.id === id);
            mostrarDetalhes(lugar);
        });
    });
}

// ============================================
// Modal de Detalhes
// ============================================

function mostrarDetalhes(lugar) {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop'; // Classe para fundo escuro
    const esFavorito = isFavorito(lugar.id);
    
    // Usando a primeira tag como categoria principal de exibição
    const categoriaPrincipal = lugar.tags && lugar.tags.length > 0 ? lugar.tags[0] : 'Geral'; 
    const tagsHtml = lugar.tags ? lugar.tags.map(tag => `<span class="modal-tag">${tag}</span>`).join(' ') : '';


    modal.innerHTML = `
        <div class="modal-content card modal-box"> 
            <div class="modal-header">
                <h2 class="modal-title">${lugar.nome}</h2>
                <button class="close" onclick="this.closest('.modal-backdrop').remove()">✕</button>
            </div>

            <div class="modal-body">
                <img src="${lugar.image}" alt="${lugar.nome}" class="modal-image" onerror="this.src='https://via.placeholder.com/600x300?text=${encodeURIComponent(lugar.nome)}'">

                <div class="modal-info-grid">
                    <div>
                        <p class="modal-label">Categoria Principal</p>
                        <p class="modal-value">${categoriaPrincipal.toUpperCase()}</p>
                    </div>
                    <div>
                        <p class="modal-label">Avaliação</p>
                        <p class="modal-value">★ ${lugar.rating.toFixed(1)} / 5.0</p>
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
                    <p class="modal-label">Tags</p>
                    <p class="modal-value-tags">${tagsHtml}</p>
                </div>


                <div class="modal-location">
                    <p class="modal-label">Localização</p>
                    <p class="modal-value-location"><svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M12 10c-1.104 0-2-.896-2-2s.896-2 2-2 2 .896 2 2-.896 2-2 2m0-5c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3m-7 2.602c0-3.517 3.271-6.602 7-6.602s7 3.085 7 6.602c0 3.455-2.563 7.543-7 14.527-4.489-7.073-7-11.072-7-14.527m7-7.602c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602"/></svg> ${lugar.endereco}</p>
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
    const usuarioCorrente = getUsuarioCorrente();

    if (!usuarioCorrente || !usuarioCorrente.id) {
        // RESTRIÇÃO DE ACESSO: Se não houver usuário logado, redireciona.
        // Assumindo que LOGIN_URL está definido ou usando um valor padrão
        const LOGIN_URL = "/modulos/login/login.html"; 
        console.warn("Usuário não logado. Redirecionando para login.");
        window.location.href = LOGIN_URL;
        return; // Para a execução se não houver login
    }
    
    // Atribui o ID do usuário logado
    usuarioLogadoId = usuarioCorrente.id; 

    try {
        // ... [Faz a requisição para o endpoint de lugares] ...
        const response = await fetch('http://localhost:3000/places'); 
        
        if (!response.ok) {
            throw new Error(`Erro de rede: ${response.status}`);
        }
        
        lugares = await response.json(); 
        
        // Carrega favoritos do localStorage (agora específico para o usuário)
        carregarFavoritos();
        
        // Renderiza a aplicação (exibindo os favoritos do usuário)
        renderizarApp();

    } catch (error) {
        console.error("Falha ao carregar os dados:", error);
        document.getElementById('favorites-page-div').innerHTML = '<p>Erro ao carregar dados dos locais. Verifique o servidor.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa carregando os dados e renderizando
    inicializarDados();
});