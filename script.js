/* --- CONFIGURATION --- */
const personalAccessToken = 'patIGARLG7lD4gPJg.1b02ad6e8a2077f309b58ce1a73b35a296c064bf547aa5b22195847ee62a1166';
const baseId = 'appodukDqe4DTLynp';
const tableName = 'Embarcadero';
const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;

let allRecords = [];
let currentSpotIndex = 0;

/* --- 1. DATA INITIALIZATION --- */
async function fetchPlaces() {
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${personalAccessToken}` }
        });
        const data = await response.json();
        allRecords = data.records;

        // Routing logic
        if (window.location.pathname.includes('spot.html')) {
            loadSpotData();
        } else {
            displayPlaces(allRecords);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

/* --- 2. DEDICATED VIEW LOGIC --- */
function loadSpotData() {
    const index = parseInt(localStorage.getItem('currentSpotIndex')) || 0;
    currentSpotIndex = index;
    if (!allRecords[index]) return;

    const data = allRecords[index].fields;
    const themeColor = data.ThemeColor || "#1D3557";

    // Text & UI Updates
    document.getElementById('info-section').style.backgroundColor = themeColor;
    document.getElementById('spot-title').innerText = data.Locations;
    document.getElementById('spot-description').innerText = data.PopupBio || data.Description;
    document.getElementById('spot-addr').innerText = data.Address || "San Francisco, CA";
    document.getElementById('spot-hours').innerText = data.Hours || "N/A";
    document.getElementById('spot-stars').innerText = (data.Stars || '5.0') + " ★";
    document.getElementById('spot-food').innerText = data.Food === "Yes" ? "YES" : "NO";
    document.getElementById('spot-attr').innerText = data.Attraction === "Yes" ? "YES" : "NO";
    document.getElementById('spot-link').href = data.Website || "#";

    // Image Update
    const imgUrl = (data.Images && data.Images.length > 0) ? data.Images[0].url : 'https://via.placeholder.com/1200x800';
    document.getElementById('spot-image').style.backgroundImage = `url('${imgUrl}')`;


    const encodedAddr = encodeURIComponent(data.Address + ", San Francisco, CA");
    document.getElementById('spot-map').src = `https://maps.google.com/maps?q=${encodedAddr}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

function changeSpot(direction) {
    const container = document.getElementById('main-slide-container');
    if (!container) return;

    // 1. Slide Out
    container.style.opacity = '0';
    container.style.transform = direction === 1 ? 'translateX(-50px)' : 'translateX(50px)';

    setTimeout(() => {
        // 2. Update Data
        currentSpotIndex += direction;
        if (currentSpotIndex < 0) currentSpotIndex = allRecords.length - 1;
        if (currentSpotIndex >= allRecords.length) currentSpotIndex = 0;
        localStorage.setItem('currentSpotIndex', currentSpotIndex);

        loadSpotData();

        // 3. Prepare for Slide In
        container.style.transition = 'none';
        container.style.transform = direction === 1 ? 'translateX(50px)' : 'translateX(-50px)';
        
        setTimeout(() => {
            container.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
            container.style.opacity = '1';
            container.style.transform = 'translateX(0)';
        }, 50);
    }, 400);
}

/* --- 3. GALLERY LOGIC --- */
function displayPlaces(records) {
    const container = document.getElementById('places-container');
    if (!container) return;
    container.innerHTML = '';

    records.forEach((record, index) => {
        const fields = record.fields;
        const id = record.id;
        const likes = fields.Likes || 0;
        const isLiked = localStorage.getItem(`liked-${id}`) ? 'text-danger' : 'text-muted';
        const imgUrl = (fields.Images && fields.Images.length > 0) ? fields.Images[0].url : 'https://via.placeholder.com/600x400';

        container.innerHTML += `
        <div class="col">
            <div class="card h-100 shadow-sm">
                <div class="position-relative overflow-hidden">
                    <img src="${imgUrl}" class="card-img-top" onclick="goToDedicated(${index})">
                    <span class="badge bg-danger position-absolute top-0 end-0 m-3">${fields.Stars || '5.0'} ★</span>
                </div>
                <div class="card-body p-3 d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="fw-bold mb-0">${fields.Locations}</h5>
                        <div class="like-container" onclick="handleLike('${id}', ${likes}, this)">
                            <span class="like-heart ${isLiked} me-1">❤</span>
                            <span class="like-count small fw-bold">${likes}</span>
                        </div>
                    </div>
                    <p class="small text-muted mb-3" style="height: 40px; overflow: hidden;">${fields.Description || ''}</p>
                    <div class="mt-auto d-grid gap-2">
                        <button class="btn btn-explore-red btn-sm rounded-pill spot-detail-btn" 
                                data-name="${fields.Locations}" 
                                data-bio="${fields.PopupBio || fields.Description || ''}" 
                                data-addr="${fields.Address || 'San Francisco, CA'}" 
                                data-hours="${fields.Hours || 'N/A'}">EXPLORE DETAILS</button>
                        <button class="btn btn-dedicated-blue btn-sm rounded-pill fw-bold" onclick="goToDedicated(${index})">DEDICATED VIEW</button>
                        <a href="${fields.Website || '#'}" target="_blank" class="btn btn-outline-dark btn-sm rounded-pill">OFFICIAL SITE</a>
                    </div>
                </div>
            </div>
        </div>`;
    });
    setupModalButtons();
}

/* --- 4. MODAL & NAVIGATION --- */
function setupModalButtons() {
    document.querySelectorAll('.spot-detail-btn').forEach(btn => {
        btn.onclick = function() {
            document.getElementById('modalTitle').innerText = this.dataset.name;
            document.getElementById('modalBio').innerText = this.dataset.bio;
            document.getElementById('modalDetails').innerHTML = `
                <hr class="accent-hr">
                <p class="mb-1 small"><strong>📍 LOCATION:</strong> ${this.dataset.addr}</p>
                <p class="small"><strong>🕒 HOURS:</strong> ${this.dataset.hours}</p>`;
            bootstrap.Modal.getOrCreateInstance(document.getElementById('infoModal')).show();
        };
    });
}

function goToDedicated(index) {
    localStorage.setItem('currentSpotIndex', index);
    navigateWithWave('spot.html');
}

function navigateWithWave(targetUrl) {
    const wave = document.getElementById('wave-overlay');
    if (!wave) return;
    wave.classList.add('active');
    setTimeout(() => {
        sessionStorage.setItem('waveTransition', 'true');
        window.location.href = targetUrl;
    }, 1300);
}

window.addEventListener('DOMContentLoaded', () => {
    const wave = document.getElementById('wave-overlay');
    if (sessionStorage.getItem('waveTransition') === 'true') {
        wave.style.transition = 'none';
        wave.style.left = '0';
        setTimeout(() => {
            wave.style.transition = 'left 1.4s cubic-bezier(0.22, 1, 0.36, 1)';
            wave.style.left = '200%';
            sessionStorage.removeItem('waveTransition');
        }, 600);
    }
});

fetchPlaces();