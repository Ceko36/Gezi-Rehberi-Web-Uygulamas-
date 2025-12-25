const API_URL = '/api';

let places = [];

// API'den verileri yükle
async function loadPlaces() {
    try {
        const response = await fetch(`${API_URL}/places`);
        places = await response.json();
        
        // Sayfaya göre uygun fonksiyonu çağır
        if (document.getElementById('popularPlaces')) {
            displayPopularPlaces();
        }
        if (document.getElementById('placesGrid')) {
            displayAllPlaces();
        }
    } catch (error) {
        console.error('Veri yükleme hatası:', error);
    }
}

// Sayfa yüklendiğinde verileri yükle
loadPlaces();

// Popüler yerleri göster (ana sayfa)
function displayPopularPlaces() {
    const container = document.getElementById('popularPlaces');
    if (!container) return;
    
    const popularPlaces = places.slice(0, 3);
    
    if (popularPlaces.length === 0) {
        container.innerHTML = '<p>Henüz yer eklenmemiş.</p>';
        return;
    }
    
    container.innerHTML = popularPlaces.map(place => `
        <div class="place-card">
            ${place.image ? `<img src="${place.image}" alt="${place.name}" class="place-image">` : ''}
            <div class="place-card-body">
                <h3>${place.name}</h3>
                <p class="place-location">📍 ${place.city}, ${place.country}</p>
                <p class="place-description">${place.description || ''}</p>
                <div class="place-card-actions">
                    <a href="place-detail.html?id=${place.id}" class="btn btn-primary">Detaylar</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Tüm yerleri göster
function displayAllPlaces() {
    const container = document.getElementById('placesGrid');
    if (!container) return;
    
    if (places.length === 0) {
        container.innerHTML = '<div class="no-results"><p>Henüz yer eklenmemiş. İlk yeri eklemek için <a href="place-create.html">buraya tıklayın</a>.</p></div>';
        return;
    }
    
    container.innerHTML = places.map(place => `
        <div class="place-card">
            ${place.image ? `<img src="${place.image}" alt="${place.name}" class="place-image">` : ''}
            <div class="place-card-body">
                <h3>${place.name}</h3>
                <p class="place-location">📍 ${place.city}, ${place.country}</p>
                <p class="place-description">${place.description || ''}</p>
                <div class="place-card-actions">
                    <a href="place-detail.html?id=${place.id}" class="btn btn-primary">Detaylar</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Yer detayını göster
async function displayPlaceDetail(id) {
    const container = document.getElementById('placeDetail');
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/places/${id}`);
        if (!response.ok) {
            container.innerHTML = '<p>Yer bulunamadı.</p>';
            return;
        }
        const place = await response.json();
        
        container.innerHTML = `
            ${place.image ? `<img src="${place.image}" alt="${place.name}" class="place-detail-image">` : ''}
            <div class="place-detail-body">
                <h1>${place.name}</h1>
                <p class="place-detail-location">📍 ${place.city}, ${place.country}</p>
                <p class="place-detail-description">${place.description || 'Açıklama eklenmemiş.'}</p>
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<p>Yer bulunamadı.</p>';
    }
}

// Yer ara
function filterPlaces(searchTerm) {
    const container = document.getElementById('placesGrid');
    const noResults = document.getElementById('noResults');
    if (!container) return;
    
    const filtered = places.filter(place => 
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filtered.length === 0) {
        container.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    if (noResults) noResults.style.display = 'none';
    
    container.innerHTML = filtered.map(place => `
        <div class="place-card">
            ${place.image ? `<img src="${place.image}" alt="${place.name}" class="place-image">` : ''}
            <div class="place-card-body">
                <h3>${place.name}</h3>
                <p class="place-location">📍 ${place.city}, ${place.country}</p>
                <p class="place-description">${place.description || ''}</p>
                <div class="place-card-actions">
                    <a href="place-detail.html?id=${place.id}" class="btn btn-primary">Detaylar</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Yeni yer oluştur
async function createPlace() {
    const name = document.getElementById('name').value.trim();
    const city = document.getElementById('city').value.trim();
    const country = document.getElementById('country').value.trim();
    const description = document.getElementById('description').value.trim();
    const image = document.getElementById('image').value.trim();
    
    if (!name || !city || !country) {
        alert('Lütfen zorunlu alanları doldurun.');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/places`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, city, country, description, image })
        });
        
        if (response.ok) {
            alert('Yer başarıyla eklendi!');
            window.location.href = 'places.html';
        } else {
            alert('Hata oluştu!');
        }
    } catch (error) {
        alert('Hata oluştu: ' + error.message);
    }
}

// Yer düzenleme için veriyi yükle
async function loadPlaceForEdit(id) {
    try {
        const response = await fetch(`${API_URL}/places/${id}`);
        if (!response.ok) {
            window.location.href = 'places.html';
            return;
        }
        const place = await response.json();
        
        document.getElementById('name').value = place.name;
        document.getElementById('city').value = place.city;
        document.getElementById('country').value = place.country;
        document.getElementById('description').value = place.description || '';
        document.getElementById('image').value = place.image || '';
    } catch (error) {
        window.location.href = 'places.html';
    }
}

// Yer güncelle
async function updatePlace(id) {
    const name = document.getElementById('name').value.trim();
    const city = document.getElementById('city').value.trim();
    const country = document.getElementById('country').value.trim();
    const description = document.getElementById('description').value.trim();
    const image = document.getElementById('image').value.trim();
    
    if (!name || !city || !country) {
        alert('Lütfen zorunlu alanları doldurun.');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/places/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, city, country, description, image })
        });
        
        if (response.ok) {
            alert('Yer başarıyla güncellendi!');
            window.location.href = `place-detail.html?id=${id}`;
        } else {
            alert('Hata oluştu!');
        }
    } catch (error) {
        alert('Hata oluştu: ' + error.message);
    }
}

// Yer sil
async function deletePlace(id) {
    try {
        const response = await fetch(`${API_URL}/places/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Yer başarıyla silindi!');
            window.location.href = 'places.html';
        } else {
            alert('Hata oluştu!');
        }
    } catch (error) {
        alert('Hata oluştu: ' + error.message);
    }
}

// İletişim formu gönder
function submitContact() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    if (!name || !email || !subject || !message) {
        alert('Lütfen tüm alanları doldurun.');
        return;
    }
    
    alert('Mesajınız alındı! (Front-end uygulaması - gerçek gönderim yapılmadı)');
    document.getElementById('contactForm').reset();
}
