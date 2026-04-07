const personalAccessToken = 'patIGARLG7lD4gPJg.1b02ad6e8a2077f309b58ce1a73b35a296c064bf547aa5b22195847ee62a1166'; 
const baseId = 'appodukDqe4DTLynp'; 
const tableName = 'Embarcadero'; 
const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;

async function fetchPlaces() {
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${personalAccessToken}` }
        });
        const data = await response.json();
        if (data.error) { console.error("Airtable Error:", data.error.message); return; }
        displayPlaces(data.records);
    } catch (error) { console.error("Connection Error:", error); }
}

function displayPlaces(records) {
    const container = document.getElementById('places-container');
    if (!container) return; 
    container.innerHTML = ''; 

    records.forEach(record => {
        const fields = record.fields;
        const name = fields.Locations || "Unnamed Spot";
        const addr = fields.Address || "San Francisco, CA";
        const hours = fields.Hours || "Always Open";
        
        
        const longBio = fields.PopupBio || "No detailed bio available yet.";
        
        let imageUrl = (fields.Images && fields.Images.length > 0) ? fields.Images[0].url : 'https://via.placeholder.com/400x250';

        const cardHTML = `
        <div class="col">
            <div class="card h-100 shadow-sm border-0">
                <div class="position-relative">
                    <img src="${imageUrl}" class="card-img-top" alt="${name}">
                    <span class="badge bg-primary position-absolute top-0 end-0 m-3 shadow-sm">
                        ${fields.Stars || '5.0'} ★
                    </span>
                </div>
                <div class="card-body p-4 d-flex flex-column">
                    <h5 class="card-title fw-bold">${name}</h5>
                    <p class="card-text text-muted mb-4 small">${fields.Description || ''}</p>
                    
                    <div class="mt-auto">
                        <button class="btn btn-outline-primary w-100 rounded-pill mb-2 spot-detail-btn" 
                                data-name="${name}" 
                                data-bio="${longBio}" 
                                data-addr="${addr}" 
                                data-hours="${hours}">
                            EXPLORE DETAILS
                        </button>

                        <a href="${fields.Website || '#'}" target="_blank" class="btn btn-outline-dark w-100 rounded-pill">
                            VISIT OFFICIAL SITE
                        </a>
                    </div>
                </div>
            </div>
        </div>`;
        container.innerHTML += cardHTML;
    });

    setupModalButtons();
}

function setupModalButtons() {
    document.querySelectorAll('.spot-detail-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const bio = this.getAttribute('data-bio');
            const addr = this.getAttribute('data-addr');
            const hours = this.getAttribute('data-hours');

            document.getElementById('modalTitle').innerText = name;
            document.getElementById('modalBio').innerText = bio;
            document.getElementById('modalDetails').innerHTML = `
                <hr>
                <p class="mb-1 small"><strong>📍 LOCATION:</strong> ${addr}</p>
                <p class="small"><strong>🕒 HOURS:</strong> ${hours}</p>
            `;
            
            const myModal = new bootstrap.Modal(document.getElementById('infoModal'));
            myModal.show();
        });
    });
}

fetchPlaces();
