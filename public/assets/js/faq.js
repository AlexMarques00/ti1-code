let faqData = [];
let filteredFaqData = [];

// Função para carregar o FAQ do servidor (JSON)
async function carregarFAQdoServidor() {
  try {
    // Corrige o caminho: de public/assets/js para db/db.json
    const response = await fetch('/faq');
    const data = await response.json();
    faqData = Array.isArray(data) ? data : [];
    filteredFaqData = [...faqData];
    console.log('FAQ carregado com sucesso:', 'perguntas');
    carregarFAQ();
  } catch (error) {
    console.error('Erro ao carregar FAQ:', error);
    // Se houver erro, usa dados locais como fallback
    usarFallbackFAQ();
  }
}

// Fallback com dados locais caso o fetch falhe
function usarFallbackFAQ() {
  console.warn('Usando FAQ de fallback');
  faqData = [
    {
      id: 1,
      pergunta: "Porque estou vendo somente uma pergunta?",
      resposta: "O fetch falhou, então estamos usando dados locais como fallback."
    }
  ];
  filteredFaqData = [...faqData];
  carregarFAQ();
}

// Função para criar os itens de FAQ dinamicamente
function carregarFAQ() {
  const faqList = document.querySelector('.faq-list');
  const emptyEl = document.querySelector('.faq-empty');
  
  if (!faqList) {
    console.error('Elemento .faq-list não encontrado!');
    return;
  }

  // Limpar o conteúdo anterior (se houver)
  faqList.innerHTML = '';
  
  console.log('Carregando', filteredFaqData.length, 'itens de FAQ');
  faqList.setAttribute('aria-busy', 'true');
  
  // Criar cada item de FAQ
  filteredFaqData.forEach((item, index) => {
    const faqItem = document.createElement('div');
    faqItem.className = 'faq-item';
    const questionId = `faq-q-${item.id ?? index}`;
    const answerId = `faq-a-${item.id ?? index}`;
    faqItem.innerHTML = `
      <button class="faq-question" aria-expanded="false" aria-controls="${answerId}" id="${questionId}" onclick="toggleAnswer(this)">
        <span>${item.pergunta}</span>
        <span class="faq-toggle" aria-hidden="true">▼</span>
      </button>
      <div class="faq-answer" id="${answerId}" role="region" aria-labelledby="${questionId}">
        <p>${item.resposta}</p>
      </div>
    `;
    
    faqList.appendChild(faqItem);
  });

  if (filteredFaqData.length === 0) {
    emptyEl?.removeAttribute('hidden');
  } else {
    emptyEl?.setAttribute('hidden', '');
  }
  faqList.setAttribute('aria-busy', 'false');
}

// Função para abrir/fechar respostas
function toggleAnswer(button) {
  const faqItem = button.closest('.faq-item');
  
  // Fechar todos os outros itens
  document.querySelectorAll('.faq-item.active').forEach(item => {
    if (item !== faqItem) {
      item.classList.remove('active');
      const btn = item.querySelector('.faq-question');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Abrir ou fechar o item clicado
  const isActive = faqItem.classList.toggle('active');
  button.setAttribute('aria-expanded', isActive ? 'true' : 'false');
}

// Carregar o FAQ quando a página for carregada
document.addEventListener('DOMContentLoaded', () => {
  carregarFAQdoServidor();

  const searchInput = document.getElementById('faq-search-input');
  if (searchInput) {
    const applyFilter = () => {
      const term = searchInput.value.trim().toLowerCase();
      filteredFaqData = faqData.filter((item) => {
        const q = String(item.pergunta || '').toLowerCase();
        const a = String(item.resposta || '').toLowerCase();
        return q.includes(term) || a.includes(term);
      });
      carregarFAQ();
    };

    searchInput.addEventListener('input', applyFilter);
  }
});