const CLIENT_ID = '1472988748487590144';
const REDIRECT_URI = 'https://ttvgortix.github.io/ems/'; 

// --- GESTION DES STATS (MODIFIABLE & PERSISTANT) ---

/**
 * Change la valeur d'une stat et la sauvegarde dans le navigateur.
 */
function updateStat(type) {
    const newValue = prompt("Entrez la nouvelle valeur pour ce compteur :");
    if (newValue !== null && newValue.trim() !== "") {
        const el = document.getElementById('stat-' + type);
        if (el) {
            el.innerText = newValue;
            localStorage.setItem('sams_stat_' + type, newValue);
        }
    }
}

/**
 * Charge les stats au démarrage de la page.
 */
function loadSavedStats() {
    const stats = ['units', 'beds', 'emergencies', 'staff'];
    stats.forEach(type => {
        const saved = localStorage.getItem('sams_stat_' + type);
        const el = document.getElementById('stat-' + type);
        if (saved && el) el.innerText = saved;
    });
}

// --- NAVIGATION ---

function showTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    element.classList.add('active');
}

// --- AUTHENTIFICATION DISCORD ---

function login() {
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=identify`;
}

function logout() {
    localStorage.removeItem('discord_token');
    window.location.href = REDIRECT_URI;
}

// --- INITIALISATION ---

window.onload = () => {
    // 1. On charge les chiffres sauvegardés
    loadSavedStats();

    // 2. On vérifie l'auth Discord
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    let token = fragment.get('access_token') || localStorage.getItem('discord_token');

    if (token) {
        localStorage.setItem('discord_token', token);
        fetch('https://discord.com/api/users/@me', { 
            headers: { authorization: `Bearer ${token}` } 
        })
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(user => {
            document.getElementById('login-screen').style.display = 'none';
            document.getElementById('main-ui').style.display = 'flex';
            document.getElementById('username').innerText = user.username;
            document.getElementById('user-greeting').innerText = user.username;
            
            if(user.avatar) {
                document.getElementById('avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
            }
            // Nettoie l'URL pour enlever le token visible
            window.history.replaceState({}, document.title, REDIRECT_URI);
        })
        .catch(() => logout());
    }
};