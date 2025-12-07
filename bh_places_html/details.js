// State Management
let currentPlace = null;
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Get place ID from URL
const urlParams = new URLSearchParams(window.location.search);
const placeId = parseInt(urlParams.get('id'));

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPlaceDetails();
});

// Load place details
async function loadPlaceDetails() {
    try {
        const response = await fetch('lugares.json');
        const data = await response.json();
        currentPlace = data.lugares.find(p => p.id === placeId);
        
        if (currentPlace) {
            renderPlaceDetails();
            initMap();
        } else {
            showNotFound();
        }
    } catch (error) {
        console.error('Error loading place details:', error);
        showNotFound();
    }
}

// Render place details
function renderPlaceDetails() {
    const isFav = isFavorite(currentPlace.id);
    
    const detailsHTML = `
        <div class="detail-main">
            <!-- Hero Image -->
            <div class="detail-hero">
                <img src="${currentPlace.imagem}" alt="${currentPlace.nome}" onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&h=400&fit=crop'">
                ${currentPlace.destaque ? '<div class="badge-featured">Destaque</div>' : ''}
            </div>

            <!-- Header Info -->
            <div class="detail-header">
                <div class="detail-info">
                    <h1 class="detail-title">${currentPlace.nome}</h1>
                    <span class="badge">${currentPlace.categoria}</span>
                </div>
                <div class="detail-actions">
                    <button class="btn-outline btn-icon ${isFav ? 'active' : ''}" onclick="toggleFavorite(${currentPlace.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button class="btn-outline btn-icon" onclick="sharePlace()">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>

            <!-- Location -->
            <div class="location-info">
                <i class="fas fa-map-marker-alt"></i>
                <div class="location-text">
                    <p class="location-address">${currentPlace.endereco}</p>
                    <p class="location-coords">Coordenadas: ${currentPlace.latitude.toFixed(4)}, ${currentPlace.longitude.toFixed(4)}</p>
                </div>
            </div>

            <!-- Rating -->
            <div class="rating-box">
                <i class="fas fa-star"></i>
                <div>
                    <div class="rating-box-value">${currentPlace.avaliacao}</div>
                    <div class="rating-box-votes">${currentPlace.votos} avaliações</div>
                </div>
            </div>

            <!-- Description -->
            <div class="card">
                <h2 class="card-title">Sobre este Local</h2>
                <p class="card-text">${currentPlace.descricao}</p>
            </div>

            <!-- Map -->
            <div class="card">
                <h2 class="card-title">Localização no Mapa</h2>
                <p class="card-description">Veja a localização exata do local em Belo Horizonte</p>
                <div id="map"></div>
            </div>
        </div>

        <!-- Sidebar -->
        <div class="detail-sidebar">
            <!-- Quick Info Card -->
            <div class="card">
                <h3 class="card-title">Informações Rápidas</h3>
                <div class="info-item">
                    <p class="info-label">Categoria</p>
                    <p class="info-value">${currentPlace.categoria}</p>
                </div>
                <div class="info-item">
                    <p class="info-label">Avaliação</p>
                    <p class="info-value">
                        <i class="fas fa-star" style="color: var(--yellow);"></i>
                        ${currentPlace.avaliacao} / 5.0
                    </p>
                </div>
                <div class="info-item">
                    <p class="info-label">Número de Avaliações</p>
                    <p class="info-value">${currentPlace.votos}</p>
                </div>
            </div>

            <!-- Actions -->
            <div class="action-buttons">
                <button class="btn-primary btn-full" onclick="ratePlace()">Avaliar Local</button>
                <button class="btn-outline btn-full" onclick="sharePlace()">Compartilhar</button>
            </div>

            <!-- Related Places -->
            <div class="card">
                <h3 class="card-title">Locais Similares</h3>
                <p class="card-description">Confira outros locais da categoria ${currentPlace.categoria}</p>
                <button class="btn-outline btn-full" onclick="viewCategory('${currentPlace.categoria}')">Ver Mais</button>
            </div>
        </div>
    `;
    
    document.getElementById('placeDetails').innerHTML = detailsHTML;
}

// Initialize Map
function initMap() {
    if (typeof L === 'undefined') {
        console.error('Leaflet library not loaded');
        return;
    }
    
    const map = L.map('map').setView([currentPlace.latitude, currentPlace.longitude], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    L.marker([currentPlace.latitude, currentPlace.longitude])
        .addTo(map)
        .bindPopup(`<b>${currentPlace.nome}</b><br>${currentPlace.endereco}`)
        .openPopup();
}

// Show not found
function showNotFound() {
    document.getElementById('placeDetails').style.display = 'none';
    document.getElementById('notFound').style.display = 'block';
}

// Toggle Favorite
function toggleFavorite(placeId) {
    const index = favorites.indexOf(placeId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(placeId);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Update UI
    loadPlaceDetails();
}

// Check if place is favorite
function isFavorite(placeId) {
    return favorites.includes(placeId);
}

// Share place
function sharePlace() {
    if (navigator.share) {
        navigator.share({
            title: currentPlace.nome,
            text: currentPlace.descricao,
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert('Link copiado para a área de transferência!');
    }
}

// Rate place
function ratePlace() {
    alert('Funcionalidade de avaliação em desenvolvimento!');
}

// View category
function viewCategory(category) {
    window.location.href = `index.html?category=${category}`;
}
