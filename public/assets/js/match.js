let options = [];

// Função para renderizar as opções de lugares no front-end
function renderOptions() {
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';

    // Exibe os lugares na interface para votar
    options.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.innerHTML = `
            <button class="btn-vote" onclick="removeVote(${option.id})">−</button>
            <span class="option-name">${option.name}</span>
            <span class="vote-count">${option.votes || 0}</span>
            <button class="btn-vote" onclick="addVote(${option.id})">+</button>
        `;
        container.appendChild(optionDiv);
    });

    // Div para adicionar novos lugares
    const addDiv = document.createElement('div');
    addDiv.className = 'option add-option';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Digite o Lugar';
    input.className = 'input-option';

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add-option';
    addBtn.textContent = '+';
    addBtn.setAttribute('aria-label', 'Adicionar lugar');

    function commitAdd() {
        const val = input.value.trim();
        if (!val) return;
        addOption(val);
        input.value = '';
        input.focus();
    }

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitAdd();
        }
    });
    addBtn.addEventListener('click', commitAdd);

    addDiv.appendChild(input);
    addDiv.appendChild(addBtn);
    container.appendChild(addDiv);
}




// Função para adicionar um voto a uma opção
function addVote(optionId) {
    const option = options.find(o => o.id === optionId);
    if (option) option.votes++;
    renderOptions();
}

// Função para remover um voto de uma opção
function removeVote(optionId) {
    const optionIndex = options.findIndex(o => o.id === optionId);
    if (optionIndex !== -1) {
        if (options[optionIndex].votes > 0) {
            options[optionIndex].votes--;
        }
        if (options[optionIndex].votes === 0) {
            options.splice(optionIndex, 1); // Remove a opção se os votos chegarem a 0
        }
    }
    renderOptions();
}

// Função para adicionar uma nova opção (lugar temporário)
function addOption(name) {
    // Verifica se a opção já existe para evitar duplicatas
    if (!options.some(o => o.name.toLowerCase() === name.toLowerCase())) {
        const newId = options.length > 0 ? Math.max(...options.map(o => o.id)) + 1 : 1;
        options.push({ id: newId, name, votes: 0 });
    }
    renderOptions();
}

// Função para confirmar o vencedor (com base nos votos)
function confirmVotes() {
    if (options.length === 0) {
        alert('Adicione pelo menos uma opção antes de confirmar!');
        return;
    }

    const votableOptions = options.filter(o => o.votes >= 0);

    if (votableOptions.length === 0) {
        alert('Você precisa votar em pelo menos uma opção com votos positivos!');
        return;
    }

    const maxVotes = Math.max(...votableOptions.map(o => o.votes));
    if (maxVotes === 0) {
        alert('Você precisa votar em pelo menos uma opção!');
        return;
    }

    const winners = votableOptions.filter(o => o.votes === maxVotes);
    const winner = winners[Math.floor(Math.random() * winners.length)];

    document.getElementById('winnerName').textContent = winner.name;

    // Exibe o gif aleatório
    showRandomGif();

    document.getElementById('votingPage').classList.add('hidden');
    document.getElementById('resultPage').classList.remove('hidden');
}

// Função para resetar o jogo (limpar opções e votos)
function resetGame() {
    options = [];
    renderOptions();
    document.getElementById('votingPage').classList.remove('hidden');
    document.getElementById('resultPage').classList.add('hidden');
}

// --------------------------- gif JS ------------------------------ //

// Lista de gifs para exibir aleatoriamente
const gifs = [
    "https://media1.tenor.com/m/eiqAzkujwKAAAAAd/gatinho-pulando.gif",  // Gif 1
    "https://media1.tenor.com/m/NmDEKc29vyQAAAAC/canddy.gif",  // Gif 2
    "https://media1.tenor.com/m/U1mwmPTCAaQAAAAd/passinho-de-bh.gif",  // Gif 3
    "https://media1.tenor.com/m/szqa_FvNLEcAAAAd/cat-dance-kitten-dance.gif",  // Gif 4
    "https://media1.tenor.com/m/fsrNnKugzHMAAAAC/baile-ex%C3%B3tico.gif"  // Gif 5
];

// Função para mostrar um gif aleatório
function showRandomGif() {
    const randomIndex = Math.floor(Math.random() * gifs.length); // Escolhe um índice aleatório
    const gifUrl = gifs[randomIndex]; // Pega o gif da lista com o índice aleatório

    // Cria um elemento <img> para o gif
    const gifElement = document.createElement('img');
    gifElement.src = gifUrl;
    gifElement.alt = "Gif aleatório";
    gifElement.style.width = "200px"; // Define a largura do gif
    gifElement.style.height = "200px"; // Define a altura do gif (mantendo o quadrado)
    gifElement.style.objectFit = "cover"; // Faz o gif cobrir completamente o quadrado, cortando o excesso, se necessário

    // Coloca o gif no container da página de resultados
    const gifContainer = document.getElementById('gifContainer');
    gifContainer.innerHTML = '';  // Limpa qualquer gif anterior
    gifContainer.appendChild(gifElement); // Adiciona o novo gif
}

// Carregar a página inicial
document.addEventListener('DOMContentLoaded', () => {
    // Força o container-match a estar centralizado
    const containerMatch = document.querySelector('.container-match');
    if (containerMatch) {
        containerMatch.style.justifyContent = 'center';
    }
    
    renderOptions();
});
