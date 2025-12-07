// State Management
let allPlaces = [];
let filteredPlaces = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let selectedCategory = 'Todos';
let searchTerm = '';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const categoryTabs = document.querySelectorAll('.tab-trigger');
const featuredGrid = document.getElementById('featuredGrid');
const placesGrid = document.getElementById('placesGrid');
const favoritesSection = document.getElementById('favoritesSection');
const favoritesGrid = document.getElementById('favoritesGrid');
const noResults = document.getElementById('noResults');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPlaces();
    setupEventListeners();
});

// Load places from JSON
async function loadPlaces() {
    try {
        const response = await fetch('lugares.json');
        const data = await response.json();
        allPlaces = data.lugares;
        filteredPlaces = allPlaces;
        renderFeatured();
        renderPlaces();
        updateFavoritesSection();
    } catch (error) {
        console.error('Error loading places:', error);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        filterPlaces();
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchTerm = '';
        filterPlaces();
    });

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            selectedCategory = tab.dataset.category;
            filterPlaces();
        });
    });
}

// Filter Places
function filterPlaces() {
    let filtered = allPlaces;

    // Filter by category
    if (selectedCategory !== 'Todos') {
        filtered = filtered.filter(place => place.categoria === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(place =>
            place.nome.toLowerCase().includes(term) ||
            place.descricao.toLowerCase().includes(term) ||
            place.endereco.toLowerCase().includes(term)
        );
    }

    // Sort: favorites first
    filtered.sort((a, b) => {
        const aIsFav = isFavorite(a.id);
        const bIsFav = isFavorite(b.id);
        if (aIsFav && !bIsFav) return -1;
        if (!aIsFav && bIsFav) return 1;
        return 0;
    });

    filteredPlaces = filtered;
    renderPlaces();
}

// Render Featured Places
function renderFeatured() {
    const featured = allPlaces.filter(place => place.destaque);
    featuredGrid.innerHTML = featured.map(place => createPlaceCard(place)).join('');
}

// Render Places
function renderPlaces() {
    if (filteredPlaces.length === 0) {
        placesGrid.style.display = 'none';
        noResults.style.display = 'block';
    } else {
        placesGrid.style.display = 'grid';
        noResults.style.display = 'none';
        placesGrid.innerHTML = filteredPlaces.map(place => createPlaceCard(place)).join('');
    }
}

// Update Favorites Section
function updateFavoritesSection() {
    const favPlaces = allPlaces.filter(place => isFavorite(place.id));
    
    if (favPlaces.length > 0) {
        favoritesSection.style.display = 'block';
        favoritesGrid.innerHTML = favPlaces.map(place => createPlaceCard(place)).join('');
    } else {
        favoritesSection.style.display = 'none';
    }
}

// Create Place Card
function createPlaceCard(place) {
    const isFav = isFavorite(place.id);
    
    return `
        <div class="place-card">
            <div class="place-card-image">
                <img src="${place.imagem}" alt="${place.nome}" onerror="this.src='https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=300&fit=crop'">
                ${place.destaque ? '<div class="badge-featured">Destaque</div>' : ''}
                <button class="favorite-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(event, ${place.id})">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="place-card-content" onclick="viewDetails(${place.id})">
                <div class="place-card-header">
                    <h3 class="place-card-title">${place.nome}</h3>
                    <span class="badge">${place.categoria}</span>
                </div>
                <p class="place-card-description">${place.descricao}</p>
                <div class="place-card-footer">
                    <div class="rating">
                        <i class="fas fa-star"></i>
                        <span class="rating-value">${place.avaliacao}</span>
                        <span class="rating-votes">(${place.votos})</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Toggle Favorite
function toggleFavorite(event, placeId) {
    event.stopPropagation();
    
    const index = favorites.indexOf(placeId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(placeId);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Update UI
    renderFeatured();
    renderPlaces();
    updateFavoritesSection();
}

// Check if place is favorite
function isFavorite(placeId) {
    return favorites.includes(placeId);
}

// View Details
function viewDetails(placeId) {
    window.location.href = `details.html?id=${placeId}`;
}
