/* --- CONFIGURATION --- */
const personalAccessToken = 'patIGARLG7lD4gPJg.1b02ad6e8a2077f309b58ce1a73b35a296c064bf547aa5b22195847ee62a1166'; 
const baseId = 'appodukDqe4DTLynp'; 
const tableName = 'Embarcadero'; 
const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;

let allRecords = []; 

/* --- 1. DATA FETCHING --- */
async function fetchPlaces() {
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${personalAccessToken}` }
        });
        const data = await response.json();
        
        allRecords = data.records; 
        displayPlaces(allRecords);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

/* --- 2. DISPLAY & UI GENERATION --- */
function displayPlaces(records) {
    const container = document.getElementById('places-container');
    if (!container) return; 
    container.innerHTML = ''; 

    records.forEach(record => {
        const fields = record.fields;
        const id = record.id;
        const likes = fields.Likes || 0; 
        const isLiked = localStorage.getItem(`liked-${id}`) ? 'text-danger' : 'text-muted';
        let imageUrl = (fields.Images && fields.Images.length > 0) ? fields.Images[0].url : 'https://via.placeholder.com/600x400';

        container.innerHTML += `
        <div class="col">
            <div class="card h-100 shadow-sm border-0">
                <div class="position-relative overflow-hidden">
                    <img src="${imageUrl}" class="card-img-top" alt="${fields.Locations}">
                    <span class="badge bg-danger position-absolute top-0 end-0 m-3 shadow-sm">
                        ${fields.Stars || '5.0'} ★
                    </span>
                </div>
                <div class="card-body p-3 d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="card-title fw-bold mb-0" style="font-size: 1.1rem;">${fields.Locations}</h5>
                        <div class="like-container" onclick="handleLike('${id}', ${likes}, this)">
                            <span class="like-heart ${isLiked} me-1">❤</span>
                            <span class="like-count small fw-bold">${likes}</span>
                        </div>
                    </div>
                    <p class="card-text text-muted mb-3 small" style="font-size: 0.85rem;">${fields.Description || ''}</p>
                    <div class="mt-auto">
                        <button class="btn btn-outline-primary btn-sm w-100 rounded-pill mb-2 spot-detail-btn" 
                                data-name="${fields.Locations}" 
                                data-bio="${fields.PopupBio || ''}" 
                                data-addr="${fields.Address || 'N/A'}" 
                                data-hours="${fields.Hours || 'N/A'}">
                            EXPLORE DETAILS
                        </button>
                        <a href="${fields.Website || '#'}" target="_blank" class="btn btn-outline-dark btn-sm w-100 rounded-pill">
                            OFFICIAL SITE
                        </a>
                    </div>
                </div>
            </div>
        </div>`;
    });

    // Re-initialize modal buttons every time the list is rendered
    setupModalButtons();
}

/* --- 3. MODAL & INTERACTION --- */
function setupModalButtons() {
    // We attach the listener to the 'body' once, and it "listens" for 
    // any clicks on '.spot-detail-btn', even if they were just created.
    document.body.onclick = function(e) {
        if (e.target.classList.contains('spot-detail-btn')) {
            const btn = e.target;
            
            // Fill the modal
            document.getElementById('modalTitle').innerText = btn.getAttribute('data-name');
            document.getElementById('modalBio').innerText = btn.getAttribute('data-bio');
            document.getElementById('modalDetails').innerHTML = `
                <hr class="accent-hr">
                <p class="mb-1 small"><strong>📍 LOCATION:</strong> ${btn.getAttribute('data-addr')}</p>
                <p class="small"><strong>🕒 HOURS:</strong> ${btn.getAttribute('data-hours')}</p>`;
            
            // Show the modal
            const modalElement = document.getElementById('infoModal');
            if (modalElement) {
                const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
                modalInstance.show();
            }
        }
    };
}

async function handleLike(recordId, currentLikes, element) {
    const heart = element.querySelector('.like-heart');
    const countDisplay = element.querySelector('.like-count');
    const alreadyLiked = localStorage.getItem(`liked-${recordId}`);
    
    let newLikes = alreadyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

    // Fast UI Feedback
    heart.classList.toggle('text-danger', !alreadyLiked);
    heart.classList.toggle('text-muted', alreadyLiked);
    countDisplay.innerText = newLikes;
    
    if (alreadyLiked) {
        localStorage.removeItem(`liked-${recordId}`);
    } else {
        localStorage.setItem(`liked-${recordId}`, true);
    }

    // Update Local Data for Sorting
    const recIndex = allRecords.findIndex(r => r.id === recordId);
    if(recIndex !== -1) allRecords[recIndex].fields.Likes = newLikes;

    // Update onclick for consecutive clicks
    element.setAttribute('onclick', `handleLike('${recordId}', ${newLikes}, this)`);

    // Sync to Airtable
    try {
        await fetch(`${url}/${recordId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${personalAccessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fields: { "Likes": Number(newLikes) } })
        });
    } catch (error) {
        console.error("Sync failed:", error);
    }
}

function handleSort() {
    const sortValue = document.getElementById('sortSelect').value;
    if (allRecords.length === 0) return;

    let sortedList = [...allRecords]; 

    if (sortValue === 'most-liked') {
        sortedList.sort((a, b) => (b.fields.Likes || 0) - (a.fields.Likes || 0));
    } else if (sortValue === 'least-liked') {
        sortedList.sort((a, b) => (a.fields.Likes || 0) - (b.fields.Likes || 0));
    }
    
    displayPlaces(sortedList);
}

/* --- 4. CINEMATIC WAVE TRANSITION --- */
function navigateWithWave(targetUrl) {
    const wave = document.getElementById('wave-overlay');
    if (!wave) return;

    wave.classList.add('active');

    // Wait for wave to cover screen before moving
    setTimeout(() => {
        sessionStorage.setItem('waveTransition', 'true');
        window.location.href = targetUrl;
    }, 1300); // Matched to CSS duration
}

window.addEventListener('DOMContentLoaded', () => {
    const wave = document.getElementById('wave-overlay');
    if (!wave) return;

    if (sessionStorage.getItem('waveTransition') === 'true') {
        // Immediate Cover
        wave.style.transition = 'none';
        wave.style.left = '0';
        
        const content = wave.querySelector('.transition-content');
        if (content) {
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
        }

        setTimeout(() => {
            // Fade text out slightly before sliding
            if (content) content.style.opacity = '0';

            setTimeout(() => {
                // Wash away to the right
                wave.style.transition = 'left 1.4s cubic-bezier(0.22, 1, 0.36, 1)';
                wave.style.left = '200%'; 
                sessionStorage.removeItem('waveTransition');
            }, 200); 
        }, 600); 
    }
});

// Run on start
fetchPlaces();