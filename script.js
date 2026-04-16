const personalAccessToken = 'patIGARLG7lD4gPJg.1b02ad6e8a2077f309b58ce1a73b35a296c064bf547aa5b22195847ee62a1166'; 
const baseId = 'appodukDqe4DTLynp'; 
const tableName = 'Embarcadero'; 
const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;


let allRecords = []; 

async function fetchPlaces() {
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${personalAccessToken}` }
        });
        const data = await response.json();
        
        // CRITICAL: Stores the Data and sends it out
        allRecords = data.records; 
        
        displayPlaces(allRecords);
    } catch (error) {
        console.error("Error fetching data:", error);
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
    } else {
       
        sortedList = allRecords;
    }
    
    
    displayPlaces(sortedList);
}

function displayPlaces(records) {
    const container = document.getElementById('places-container');
    if (!container) return; 
    container.innerHTML = ''; 

    records.forEach(record => {
        const fields = record.fields;
        const id = record.id;
        
        // FIX: Always use the number from Airtable first
        const likes = fields.Likes || 0; 
        
        const isLiked = localStorage.getItem(`liked-${id}`) ? 'text-danger' : 'text-muted';
        let imageUrl = (fields.Images && fields.Images.length > 0) ? fields.Images[0].url : 'https://via.placeholder.com/600x400';

        container.innerHTML += `
        <div class="col">
            <div class="card h-100 shadow-sm border-0">
                <div class="position-relative">
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
                                data-addr="${fields.Address}" 
                                data-hours="${fields.Hours}">
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
    setupModalButtons();
}

async function handleLike(recordId, currentLikes, element) {
    const heart = element.querySelector('.like-heart');
    const countDisplay = element.querySelector('.like-count');
    
    // Check if the user has already liked this item locally
    const alreadyLiked = localStorage.getItem(`liked-${recordId}`);
    
    // Calculate new total
    let newLikes = alreadyLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

    // 1. Immediate UI Update (Make it feel fast)
    heart.classList.toggle('text-danger', !alreadyLiked);
    heart.classList.toggle('text-muted', alreadyLiked);
    countDisplay.innerText = newLikes;
    
    if (alreadyLiked) {
        localStorage.removeItem(`liked-${recordId}`);
    } else {
        localStorage.setItem(`liked-${recordId}`, true);
    }

    // 2. Update local memory so sorting stays accurate
    const recIndex = allRecords.findIndex(r => r.id === recordId);
    if(recIndex !== -1) {
        allRecords[recIndex].fields.Likes = newLikes;
    }

    // 3. Sync with Airtable
    try {
        const response = await fetch(`${url}/${recordId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${personalAccessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                fields: { 
                    "Likes": Number(newLikes) // Ensure it is sent as a number
                } 
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Airtable Error Details:", errorData);
            throw new Error('Failed to update Airtable');
        }

        // Successfully synced! Update the onclick so further clicks use the new total
        element.setAttribute('onclick', `handleLike('${recordId}', ${newLikes}, this)`);
        console.log(`Successfully updated ${recordId} to ${newLikes} likes.`);

    } catch (error) {
        console.error("Sync failed. Reverting UI...", error);
        // Optional: Revert UI if sync fails so user doesn't see "fake" likes
    }
}

function setupModalButtons() {
    document.querySelectorAll('.spot-detail-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('modalTitle').innerText = this.getAttribute('data-name');
            document.getElementById('modalBio').innerText = this.getAttribute('data-bio');
            document.getElementById('modalDetails').innerHTML = `
                <hr class="accent-hr">
                <p class="mb-1 small"><strong>📍 LOCATION:</strong> ${this.getAttribute('data-addr')}</p>
                <p class="small"><strong>🕒 HOURS:</strong> ${this.getAttribute('data-hours')}</p>`;
            new bootstrap.Modal(document.getElementById('infoModal')).show();
        });
    });
}

fetchPlaces();