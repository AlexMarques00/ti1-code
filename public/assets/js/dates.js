// dates.js — renderiza apenas locais com tag 'dates'
(function(){
  // normalize similar to home.js
  function normalizeTag(tag) {
    return tag ? tag.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
  }

  function renderCard(lugar) {
    // Usa a lógica de favoritos definida em home.js, se disponível
    const esFavorito = (typeof isFavorito === 'function') ? isFavorito(lugar.id) : false;
    const favClass = esFavorito ? 'btn-danger' : 'btn-primary';
    const favText = esFavorito ? 'Remover' : 'Favoritar';
    const favIcon = esFavorito ? '—' : '❤';

    const imageUrl = lugar.image || 'https://via.placeholder.com/400x120?text=Imagem+Indispon%C3%ADvel';
    const categoria = (lugar.tags && lugar.tags.length>0) ? lugar.tags[0].toUpperCase() : '';
    return `
      <div class="place-card ${esFavorito ? 'favorite' : ''}">
        <div class="place-card-image">
          <img src="${imageUrl}" alt="${lugar.nome}" onerror="this.src='https://via.placeholder.com/400x120?text=${encodeURIComponent(lugar.nome)}'">
          ${lugar.destaque?'<div class="place-card-badge">Destaque</div>':''}
        </div>
        <div class="place-card-content">
          <div class="place-card-header">
            <div>
              <div class="place-card-title">${lugar.nome}</div>
              <div class="place-card-category">${categoria}</div>
            </div>
            <div class="place-card-rating"><span class="place-card-rating-star">★</span> <span class="place-card-rating-value">${(lugar.rating||0).toFixed(1)}</span></div>
          </div>
          <p class="place-card-description">${lugar.descricao || ''}</p>
          <div class="place-card-location"><span>${lugar.endereco || ''}</span></div>
          <div class="place-card-reviews">${lugar.ratings || 0} avaliações</div>
          <div class="place-card-actions">
            <button class="favorite-btn btn ${favClass}" data-id="${lugar.id}">
              <span class="favorite-btn-icon">${favIcon}</span>
              ${favText}
            </button>
            <button class="details-btn btn btn-secondary" data-id="${lugar.id}">Ver Detalhes</button>
          </div>
        </div>
      </div>
    `;
  }

  async function loadDates() {
    const root = document.getElementById('dates-content');
    if (!root) return;

    root.innerHTML = '<p>Carregando...</p>';

    // Carrega favoritos se disponível (home.js)
    if (typeof carregarFavoritos === 'function') {
      try { carregarFavoritos(); } catch (e) { /* ignore */ }
    }

    try {
      const res = await fetch('/places');
      if (!res.ok) throw new Error('Falha ao carregar places');
      const places = await res.json();

      const dates = (places || []).filter(p => (p.tags||[]).map(normalizeTag).includes('dates'));

      if (!dates.length) {
        root.innerHTML = '<main class="main-content-padding"><div class="container-home"><section class="category-section"><h2>DATES</h2><p>Sem locais cadastrados com a tag "dates".</p></section></div></main>';
        return;
      }

      const cards = dates.map(renderCard).join('');

      root.innerHTML = `
        <main class="main-content-padding">
          <div class="container-home no-carousel">
            <section class="category-section">
              <h2>DATES</h2>
              <div class="cards-grid">
                ${cards}
              </div>
            </section>
          </div>
        </main>
      `;

      // attach event listeners: favorite + details
      // Helper to update button UI in-place
      function updateFavoriteButtonUI(buttonEl, isFav) {
        if (!buttonEl) return;
        const iconSpan = buttonEl.querySelector('.favorite-btn-icon');
        if (isFav) {
          buttonEl.classList.remove('btn-primary');
          buttonEl.classList.add('btn-danger');
          if (iconSpan) iconSpan.textContent = '—';
          // text node after icon (replace whole innerText except icon)
          buttonEl.innerHTML = `<span class="favorite-btn-icon">—</span> Remover`;
        } else {
          buttonEl.classList.remove('btn-danger');
          buttonEl.classList.add('btn-primary');
          if (iconSpan) iconSpan.textContent = '❤';
          buttonEl.innerHTML = `<span class="favorite-btn-icon">❤</span> Favoritar`;
        }
        // toggle card class
        const card = buttonEl.closest('.place-card');
        if (card) card.classList.toggle('favorite', isFav);
      }

      document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.currentTarget.dataset.id);
          // If shared toggle exists, call it and then update this button using isFavorito
          if (typeof toggleFavorito === 'function') {
            try {
              toggleFavorito(id);
            } catch (err) {
              console.error('toggleFavorito error', err);
            }
            // Immediately update this specific button and card according to new state
            const nowFav = (typeof isFavorito === 'function') ? isFavorito(id) : null;
            updateFavoriteButtonUI(e.currentTarget, !!nowFav);
          } else {
            // fallback: store in localStorage generic key
            const key = 'ddd031_favoritos_0';
            const saved = JSON.parse(localStorage.getItem(key) || '[]');
            const i = saved.indexOf(id);
            const becameFav = i === -1;
            if (i > -1) saved.splice(i,1); else saved.push(id);
            localStorage.setItem(key, JSON.stringify(saved));
            // update this button UI in-place
            updateFavoriteButtonUI(e.currentTarget, becameFav);
          }
        });
      });

      document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = parseInt(e.currentTarget.dataset.id);
          const place = dates.find(p => p.id === id) || (await (await fetch('/places/'+id)).json());
          if (typeof mostrarDetalhes === 'function') {
            mostrarDetalhes(place);
          } else if (typeof showDetailsModal === 'function') {
            showDetailsModal(place);
          } else {
            // fallback simple alert
            alert(place.nome + '\n' + (place.descricao || ''));
          }
        });
      });

    } catch (err) {
      root.innerHTML = '<p>Erro ao carregar locais. Verifique se o JSON Server está rodando.</p>';
      console.error(err);
    }
  }

  function showDetailsModal(lugar) {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    const imageUrl = lugar.image || 'https://via.placeholder.com/600x300?text=Imagem+Indispon%C3%ADvel';
    const categoria = (lugar.tags && lugar.tags.length>0)?lugar.tags[0].toUpperCase():'';
    modal.innerHTML = `
      <div class="modal-content card modal-box">
        <div class="modal-header"><h2 class="modal-title">${lugar.nome}</h2><button class="close">✕</button></div>
        <div class="modal-body">
          <img src="${imageUrl}" class="modal-image">
          <p><strong>Categoria:</strong> ${categoria}</p>
          <p><strong>Endereço:</strong> ${lugar.endereco || ''}</p>
          <p><strong>Descrição:</strong> ${lugar.descricao || ''}</p>
        </div>
      </div>`;
    document.body.appendChild(modal);
    document.body.classList.add('no-scroll');
    modal.querySelector('.close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }

  document.addEventListener('DOMContentLoaded', loadDates);
})();
