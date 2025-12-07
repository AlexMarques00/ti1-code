function toggleFilters() {
  const dropdown = document.getElementById('filterDropdown');
  dropdown.classList.toggle('show');
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function closeDropdown(e) {
      if (!e.target.closest('.search-container')) {
          dropdown.classList.remove('show');
          document.removeEventListener('click', closeDropdown);
      }
  });
}

const navbarDiv = document.querySelector('.navbar');

const navbarContent = `
  <div class="nav-left">
    <button class="nav-hamburger" aria-label="Abrir menu" aria-expanded="false"> 
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="nav-close" aria-hidden="true">✕</span>
    </button>
    <img src="./assets/images/logo.png" alt="Logo" class="nav-logo">
  </div>

  <ul class="nav-menu">
    <li><a href="index.html">Home</a></li>
    <li class="mobile-search-toggle"><button class="mobile-search-btn">Pesquisa</button></li>
    <li>
      <div class="search-container">
        <input type="text" class="search-input" placeholder="Buscar lugares...">
        <button class="filter-btn" onclick="toggleFilters()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
        </button>
        <div class="filter-dropdown" id="filterDropdown">
          <div class="filter-option">
            <input type="checkbox" id="filterCafe">
            <label for="filterCafe">Café</label>
          </div>
          <div class="filter-option">
            <input type="checkbox" id="filterBar">
            <label for="filterBar">Bar</label>
          </div>
          <div class="filter-option">
            <input type="checkbox" id="filterRestaurante">
            <label for="filterRestaurante">Restaurante</label>
          </div>
          <div class="filter-option">
            <input type="checkbox" id="filterParque">
            <label for="filterParque">Parque</label>
          </div>
          <div class="filter-option">
            <input type="checkbox" id="filterDate">
            <label for="filterDate">Date</label>
          </div>
          <div class="filter-option">
            <input type="checkbox" id="filterCultura">
            <label for="filterCultura">Cultura</label>
          </div>
        </div>
      </div>
    </li>
    <li><a href="favorites.html">Favoritos</a></li>
    <li><a href="map.html">Mapa</a></li>
    <li><a href="roulette.html">Roleta</a></li>
    <li><a href="dates.html">Dates</a></li>
    <li><a href="match.html">Match</a></li>
    <li><a href="forum.html">Fórum</a></li>
    <li><a href="faq.html">FAQ</a></li>
    <li><a href="about.html">Sobre Nós</a></li>
  </ul>

  <div class="nav-user">
    <div class="user-profile" id="userProfile">
      <span id="userInfo"></span>
    </div>
  </div>
`

function inicializarDados(){

}

document.addEventListener('DOMContentLoaded', () => {
if (navbarDiv) {
    navbarDiv.innerHTML = navbarContent;
    
    // Chama showUserInfo após criar a navbar, se a função existir
    if (typeof showUserInfo === 'function') {
        showUserInfo('userInfo');
    }

    // Wiring do input de busca: repassa termos para o home sem recarregar
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        if (typeof window.applySearchQuery === 'function') {
          window.applySearchQuery(e.currentTarget.value || '');
        }
      });
    }

    // Mobile hamburger menu toggle
    const hamburger = document.querySelector('.nav-hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
      function setMenuOpen(open) {
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
        hamburger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        document.querySelector('.navbar').classList.toggle('open', open);

        // Toggle hamburger lines vs close icon without relying on CSS
        const lines = hamburger.querySelectorAll('.hamburger-line');
        const closeIcon = hamburger.querySelector('.nav-close');
        lines.forEach(l => l.style.display = open ? 'none' : 'block');
        if (closeIcon) closeIcon.style.display = open ? 'inline' : 'none';
      }

      // Garantir estado inicial fechado: mostra sanduíche, esconde X
      setMenuOpen(false);

      hamburger.addEventListener('click', (e) => {
        const isOpen = document.querySelector('.navbar').classList.contains('open');
        setMenuOpen(!isOpen);
      });

      // Fecha o menu ao clicar fora (em mobile)
      document.addEventListener('click', (e) => {
        const navbarEl = document.querySelector('.navbar');
        if (!navbarEl) return;
        if (!navbarEl.contains(e.target) && navbarEl.classList.contains('open')) {
          setMenuOpen(false);
        }
      });

      // Fecha o menu quando redimensionar para desktop
      window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) setMenuOpen(false);
      });
    }

    // Mobile search overlay (abre quando o usuário clica em 'Pesquisa' dentro do menu mobile)
    const mobileSearchBtn = document.querySelector('.mobile-search-btn');
    function createMobileSearchOverlay() {
      // Se já existe, não recria
      if (document.getElementById('mobileSearchOverlay')) return;

      const overlay = document.createElement('div');
      overlay.id = 'mobileSearchOverlay';
      overlay.className = 'mobile-search-overlay';
      overlay.innerHTML = `
        <div class="mobile-search-header">
          <button class="mobile-search-close" aria-label="Fechar">✕</button>
          <h3>Pesquisar</h3>
        </div>
        <div class="mobile-search-body">
          <input type="text" id="mobileSearchInput" class="mobile-search-input" placeholder="Buscar lugares...">
          <div id="mobileSearchResults" class="mobile-search-results"></div>
        </div>
      `;

      document.body.appendChild(overlay);

      const closeBtn = overlay.querySelector('.mobile-search-close');
      const input = overlay.querySelector('#mobileSearchInput');
      const resultsContainer = overlay.querySelector('#mobileSearchResults');

      function renderResults() {
        const q = input.value || '';
        if (typeof window.applySearchQuery === 'function') {
          window.applySearchQuery(q);
        }
        // getSearchResults retorna objetos de lugar
        const results = (typeof window.getSearchResults === 'function') ? window.getSearchResults() : [];
        if (!results || results.length === 0) {
          resultsContainer.innerHTML = '<p class="no-results">Sem resultados</p>';
          return;
        }
        // Usa renderizarCard se disponível
        if (typeof window.renderizarCard === 'function') {
          resultsContainer.innerHTML = results.map(r => window.renderizarCard(r)).join('');
        } else {
          resultsContainer.innerHTML = results.map(r => `<div class="result-item">${r.nome}</div>`).join('');
        }
      }

      input.addEventListener('input', () => renderResults());

      closeBtn.addEventListener('click', () => overlay.remove());

      // fechar com ESC
      overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') overlay.remove();
      });

      // foco inicial
      setTimeout(() => input.focus(), 50);

      // inicial render
      renderResults();
    }

    if (mobileSearchBtn) {
      mobileSearchBtn.addEventListener('click', (e) => {
        // fecha o menu mobile para mostrar a tela de busca
        document.querySelector('.navbar').classList.remove('open');
        createMobileSearchOverlay();
        const overlay = document.getElementById('mobileSearchOverlay');
        if (overlay) overlay.tabIndex = -1;
      });
    }

    // =========================
    // Wiring dos filtros por tag
    // =========================
    const dropdown = document.getElementById('filterDropdown');
    if (dropdown) {
        // pega todos os checkboxes dentro do dropdown
        const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');

        // normaliza label (remove acentos / lower)
        function normalizeLabelText(text) {
            return text.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }

        function collectSelectedTags() {
            const selected = [];
            checkboxes.forEach(cb => {
                if (cb.checked) {
                    const lbl = dropdown.querySelector(`label[for="${cb.id}"]`);
                    if (lbl) selected.push(normalizeLabelText(lbl.textContent.trim()));
                }
            });

            // Guarda os filtros no sessionStorage para persistir através da navegação
            sessionStorage.setItem('selectedTagFilters', JSON.stringify(selected));

            // Se estivermos na página inicial, aplica diretamente; caso contrário, navega para index.html
            const currentFile = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1);
            const isIndexPage = currentFile === '' || currentFile === 'index.html';

            if (isIndexPage && typeof window.applyTagFilters === 'function') {
                window.applyTagFilters(selected);
                sessionStorage.removeItem('selectedTagFilters');
            } else {
                // Navega para a página inicial, que irá ler os filtros do sessionStorage ao carregar
                window.location.href = 'index.html';
            }
        }

        // adiciona listener em cada checkbox
        checkboxes.forEach(cb => cb.addEventListener('change', collectSelectedTags));

        // se houver filtros pendentes aplicá-los
        if (window.__pendingTagFilters && typeof window.applyTagFilters === 'function') {
            window.applyTagFilters(window.__pendingTagFilters);
            delete window.__pendingTagFilters;
        }
    }

} else {
    console.error("Elemento com classe 'navbar' não encontrado para inserir o conteúdo.");
}

inicializarDados();
highlightActiveLink();
});

function highlightActiveLink() {
const currentPath = window.location.pathname;
const navLinks = document.querySelectorAll('.nav-menu a');

navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    
    // Extrai o nome do arquivo da URL atual (ex: index.html)
    // Trata o caso de estar em um subdiretório (ex: /code/public/index.html)
    const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    const linkFile = linkPath;

    // A página inicial pode ser acessada como / ou index.html
    const isIndexPage = currentFile === '' || currentFile === 'index.html';
    const isIndexLink = linkFile === 'index.html';

    if (currentFile === linkFile || (isIndexPage && isIndexLink)) {
         link.classList.add('active');
    } else {
         link.classList.remove('active');
    }
});
}