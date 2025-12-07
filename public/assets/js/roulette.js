// roulette.js — sorteia um lugar aleatório e mostra o card
(function(){
  let places = [];

  function pickRandom() {
    if (!places || places.length === 0) return null;
    const idx = Math.floor(Math.random() * places.length);
    return places[idx];
  }

  function renderPlace(place) {
    const container = document.getElementById('roulette-container');
    if (!container) return;

    // Reuse renderizarCard from home.js when available
    if (typeof renderizarCard === 'function') {
      container.innerHTML = `<div class="roulette-card">${renderizarCard(place)}</div>`;
    } else {
      container.innerHTML = `
        <div class="place-card">
          <div class="place-card-content">
            <h3>${place.nome}</h3>
            <p>${place.descricao || ''}</p>
            <p>${place.endereco || ''}</p>
          </div>
        </div>
      `;
    }

    // Ensure favorite/details buttons are wired (reuse adicionarEventListeners if present)
    if (typeof adicionarEventListeners === 'function') {
      // Slight delay to ensure DOM insertion
      setTimeout(() => adicionarEventListeners(), 20);
    }
  }

  async function init() {
    // Load favorites helper if present
    if (typeof carregarFavoritos === 'function') {
      try { carregarFavoritos(); } catch(e) { /* ignore */ }
    }

    try {
      const res = await fetch('/places');
      if (!res.ok) throw new Error('Failed to fetch places');
      places = await res.json();
    } catch (err) {
      console.error(err);
      const container = document.getElementById('roulette-container');
      if (container) container.innerHTML = '<p>Erro ao carregar locais. Verifique se o JSON Server está rodando.</p>';
      return;
    }

    const btn = document.getElementById('roulette-spin');
    if (!btn) return;

    let spinning = false;

    btn.addEventListener('click', () => {
      if (spinning) return;
      if (!places || places.length === 0) return;
      spinning = true;
      btn.disabled = true;
      btn.textContent = 'Girando...';

      // Simula roleta: troca cards rapidamente por DURATION ms
      const DURATION = 1800; // ms
      const INTERVAL = 80; // ms
      let elapsed = 0;

      const timer = setInterval(() => {
        const p = pickRandom();
        if (p) renderPlace(p);
        elapsed += INTERVAL;
        if (elapsed >= DURATION) {
          clearInterval(timer);
          // final selection
          const final = pickRandom();
          if (final) renderPlace(final);
          spinning = false;
          btn.disabled = false;
          btn.textContent = 'Girar';
        }
      }, INTERVAL);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
