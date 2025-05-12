// State management
let currentUser = null;
let currentPage = 'auth';

// API endpoints
const API_BASE_URL = 'http://localhost:3000/api';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('[name="email"]').value;
        const password = loginForm.querySelector('[name="password"]').value;
        await login(email, password);
        loginForm.reset();
    });

    // Register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = registerForm.querySelector('[name="email"]').value;
        const password = registerForm.querySelector('[name="password"]').value;
        const confirmPassword = registerForm.querySelector('[name="confirmPassword"]').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        await register(email, password);
        registerForm.reset();
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

// DOM Elements
const authPage = document.getElementById('authPage');
const searchPage = document.getElementById('searchPage');
const favoritesPage = document.getElementById('favoritesPage');
const navLinks = document.getElementById('navLinks');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const favoritesList = document.getElementById('favoritesList');
const movieModal = document.getElementById('movieModal');
const modalPoster = document.getElementById('modalPoster');
const modalTitle = document.getElementById('modalTitle');
const modalYear = document.getElementById('modalYear');
const modalDescription = document.getElementById('modalDescription');
const movieRating = document.getElementById('movieRating');
const movieNotes = document.getElementById('movieNotes');
const saveToFavorites = document.getElementById('saveToFavorites');

// Authentication functions
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            currentUser = data;
            localStorage.setItem('token', data.token);
            showPage('search');
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        alert('Error during login');
    }
}

async function register(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please login.');
            showAuthForm('login');
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        alert('Error during registration');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('token');
    showPage('auth');
}

// Movie functions
async function searchMovies(query) {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/search?query=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const movies = await response.json();
        displaySearchResults(movies);
    } catch (error) {
        alert('Error searching movies');
    }
}

async function getFavorites() {
    try {
        const response = await fetch(`${API_BASE_URL}/movies`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const favorites = await response.json();
        displayFavorites(favorites);
    } catch (error) {
        alert('Error fetching favorites');
    }
}

async function addToFavorites(movieData) {
    try {
        const response = await fetch(`${API_BASE_URL}/movies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(movieData)
        });
        if (response.ok) {
            alert('Movie added to favorites!');
            closeModal();
            if (currentPage === 'favorites') getFavorites();
        } else {
            alert('Failed to add movie to favorites');
        }
    } catch (error) {
        alert('Error adding to favorites');
    }
}

async function updateFavorite(movieId, updates) {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(updates)
        });
        if (response.ok) {
            alert('Movie updated successfully!');
            closeModal();
            getFavorites();
        } else {
            alert('Failed to update movie');
        }
    } catch (error) {
        alert('Error updating movie');
    }
}

async function removeFavorite(movieId) {
    if (!confirm('Are you sure you want to remove this movie from favorites?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
            getFavorites();
        } else {
            alert('Failed to remove movie from favorites');
        }
    } catch (error) {
        alert('Error removing from favorites');
    }
}

// UI functions
async function getPopularMovies() {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/search?query=popular`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const movies = await response.json();
        displaySearchResults(movies);
    } catch (error) {
        alert('Error fetching popular movies');
    }
}

function showPage(pageName) {
    currentPage = pageName;
    [authPage, searchPage, favoritesPage].forEach(page => {
        page.classList.add('hidden');
    });

    if (pageName === 'auth') {
        authPage.classList.remove('hidden');
        navLinks.classList.add('hidden');
    } else {
        document.getElementById(`${pageName}Page`).classList.remove('hidden');
        navLinks.classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageName);
        });

        if (pageName === 'favorites') {
            getFavorites();
        } else if (pageName === 'search') {
            getPopularMovies();
        }
    }
}

function showAuthForm(formName) {
    const forms = {
        login: loginForm,
        register: registerForm
    };
    Object.values(forms).forEach(form => form.classList.add('hidden'));
    forms[formName].classList.remove('hidden');
    
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.form === formName);
    });
}

function displaySearchResults(movies) {
    searchResults.innerHTML = movies.map(movie => `
        <div class="movie-card" onclick="showMovieDetails(${JSON.stringify(movie).replace(/"/g, "'")})">
            <img src="${movie.poster_path ? TMDB_IMAGE_BASE_URL + movie.poster_path : 'placeholder.jpg'}" alt="${movie.title}">
            <div class="movie-card-info">
                <h3 class="movie-card-title">${movie.title}</h3>
                <p class="movie-card-year">${new Date(movie.release_date).getFullYear()}</p>
            </div>
        </div>
    `).join('');
}

function displayFavorites(favorites) {
    favoritesList.innerHTML = favorites.map(movie => `
        <div class="movie-card">
            <div onclick="showMovieDetails(${JSON.stringify(movie).replace(/"/g, "'")}, true)">
                <img src="${movie.posterPath ? TMDB_IMAGE_BASE_URL + movie.posterPath : 'placeholder.jpg'}" alt="${movie.title}">
                <div class="movie-card-info">
                    <h3 class="movie-card-title">${movie.title}</h3>
                    <p class="movie-card-year">${movie.releaseYear}</p>
                    <p>Rating: ${movie.rating || 'Not rated'}</p>
                </div>
            </div>
            <button class="delete-btn" onclick="event.stopPropagation(); removeFavorite('${movie._id}')">Delete</button>
        </div>
    `).join('');
}

function showMovieDetails(movie, isFavorite = false) {
    modalPoster.src = movie.poster_path ? 
        TMDB_IMAGE_BASE_URL + movie.poster_path : 
        (movie.posterPath ? TMDB_IMAGE_BASE_URL + movie.posterPath : 'placeholder.jpg');
    modalTitle.textContent = movie.title;
    modalYear.textContent = movie.releaseYear || new Date(movie.release_date).getFullYear();
    modalDescription.textContent = movie.description || movie.overview;
    movieRating.value = movie.rating || '5';
    movieNotes.value = movie.notes || '';
    
    saveToFavorites.onclick = () => {
        const movieData = {
            tmdbId: movie.tmdbId || movie.id,
            title: movie.title,
            posterPath: movie.poster_path || movie.posterPath,
            description: movie.overview || movie.description,
            releaseYear: movie.releaseYear || new Date(movie.release_date).getFullYear(),
            rating: parseInt(movieRating.value),
            notes: movieNotes.value
        };
        
        if (isFavorite) {
            updateFavorite(movie._id, { rating: movieData.rating, notes: movieData.notes });
        } else {
            addToFavorites(movieData);
        }
    };
    
    movieModal.classList.remove('hidden');
}

function closeModal() {
    movieModal.classList.add('hidden');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
        currentUser = { token };
        showPage('search');
    } else {
        showPage('auth');
    }

    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => showAuthForm(tab.dataset.form));
    });

    // Auth forms
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const [email, password] = [e.target[0].value, e.target[1].value];
        login(email, password);
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const [email, password, confirmPassword] = [e.target[0].value, e.target[1].value, e.target[2].value];
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        register(email, password);
    });

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.id === 'logoutBtn') {
            link.addEventListener('click', logout);
        } else {
            link.addEventListener('click', () => showPage(link.dataset.page));
        }
    });

    // Search
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) searchMovies(query);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) searchMovies(query);
        }
    });

    // Modal
    document.querySelector('.close-modal').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === movieModal) closeModal();
    });
});