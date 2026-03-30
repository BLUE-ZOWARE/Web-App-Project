// 1. Connection Setup
const personalAccessToken = 'patIGARLG7lD4gPJg.1b02ad6e8a2077f309b58ce1a73b35a296c064bf547aa5b22195847ee62a1166'; 
const baseId = 'appodukDqe4DTLynp'; 
const tableName = 'Embarcadero'; 
const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;

// 2. Fetch the Data
async function fetchPlaces() {
    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${personalAccessToken}` }
        });
        const data = await response.json();
        
        if (data.error) {
            console.error("Airtable Error:", data.error.message);
            return;
        }
        displayPlaces(data.records);
    } catch (error) {
        console.error("Connection Error:", error);
    }
}

// 3. Display the Cards
// ... (Your Connection and Fetch sections are perfect)

// 3. Display the Cards
function displayPlaces(records) {
    const container = document.getElementById('places-container');
    if (!container) return; 
    container.innerHTML = ''; 

    records.forEach(record => {
        const fields = record.fields;
        const name = fields.Locations || "Unnamed Spot";
        const desc = fields.Description || "No description available.";
        const addr = fields.Address || "San Francisco, CA";
        const hours = fields.Hours || "Always Open";
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
                    <p class="card-text text-muted mb-4 small">${desc.substring(0, 90)}...</p>
                    
                    <div class="mt-auto">
                        <button class="btn btn-outline-primary w-100 rounded-pill mb-2 spot-detail-btn" 
                                data-name="${name}" 
                                data-bio="${desc}" 
                                data-addr="${addr}" 
                                data-hours="${hours}">
                            VIEW SPOT DETAILS
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

    // New way to handle the clicks
    setupModalButtons();
}

function setupModalButtons() {
    document.querySelectorAll('.spot-detail-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Pull the data back out of the button
            const name = this.getAttribute('data-name');
            const bio = this.getAttribute('data-bio');
            const addr = this.getAttribute('data-addr');
            const hours = this.getAttribute('data-hours');

            // Fill the modal
            document.getElementById('modalTitle').innerText = name;
            document.getElementById('modalBio').innerText = bio;
            document.getElementById('modalDetails').innerHTML = `
                <p class="mb-1"><strong>📍 LOCATION:</strong> ${addr}</p>
                <p><strong>🕒 HOURS:</strong> ${hours}</p>
            `;

            const myModal = new bootstrap.Modal(document.getElementById('infoModal'));
            myModal.show();
        });
    });
}

// Start the app
fetchPlaces();