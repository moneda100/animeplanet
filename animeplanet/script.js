let selectedAnime = null;
let animes = JSON.parse(localStorage.getItem('animes')) || [];
let searchTimeout = null;
let searchResults = [];

document.getElementById('startDate').valueAsDate = new Date();

document.getElementById('animeSearch').addEventListener('input', function(e) {
    const query = e.target.value.trim();
    
    clearTimeout(searchTimeout);
    
    if (query.length < 3) {
        document.getElementById('suggestions').classList.add('hidden');
        return;
    }
    
    searchTimeout = setTimeout(() => {
        searchAnime(query);
    }, 500);
});

async function searchAnime(query) {
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`);
        
        if (!response.ok) {
            throw new Error('Error en la búsqueda');
        }
        
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            searchResults = data.data;
            displaySuggestions(data.data);
        } else {
            const suggestionsDiv = document.getElementById('suggestions');
            suggestionsDiv.innerHTML = '<div class="p-3 text-gray-500 text-center">No se encontraron resultados</div>';
            suggestionsDiv.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error buscando anime:', error);
        const suggestionsDiv = document.getElementById('suggestions');
        suggestionsDiv.innerHTML = '<div class="p-3 text-red-500 text-center">Error al buscar animes. Intenta de nuevo.</div>';
        suggestionsDiv.classList.remove('hidden');
    }
}

function displaySuggestions(animes) {
    const suggestionsDiv = document.getElementById('suggestions');
    
    if (!animes || animes.length === 0) {
        suggestionsDiv.classList.add('hidden');
        return;
    }
    
    suggestionsDiv.innerHTML = animes.map((anime, index) => {
        const durationText = anime.duration ? anime.duration.split(' ')[0] : 'N/A';
        return `
        <div class="suggestion-item p-3 hover:bg-purple-50 cursor-pointer border-b last:border-b-0 flex items-center gap-3" data-index="${index}">
            <img src="${anime.images.jpg.small_image_url}" alt="${escapeHtml(anime.title)}" class="w-12 h-16 object-cover rounded">
            <div class="flex-1">
                <div class="font-semibold text-gray-800">${escapeHtml(anime.title)}</div>
                <div class="text-sm text-gray-600">
                    ${anime.episodes || 'N/A'} eps · ${durationText} min
                </div>
            </div>
        </div>
    `;
    }).join('');
    
    document.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            selectAnime(searchResults[index]);
        });
    });
    
    suggestionsDiv.classList.remove('hidden');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function parseDuration(durationString) {
    if (!durationString) return 24;
    
    const match = durationString.match(/(\d+)/);
    if (match) {
        const duration = parseInt(match[1]);
        return isNaN(duration) ? 24 : duration;
    }
    
    return 24;
}

function selectAnime(anime) {
    const duration = parseDuration(anime.duration);
    
    selectedAnime = {
        id: anime.mal_id,
        title: anime.title,
        episodes: anime.episodes || 12,
        duration: duration,
        image: anime.images.jpg.image_url
    };
    
    document.getElementById('animeSearch').value = anime.title;
    document.getElementById('suggestions').classList.add('hidden');
    
    document.getElementById('selectedTitle').textContent = selectedAnime.title;
    document.getElementById('selectedEpisodes').textContent = selectedAnime.episodes;
    document.getElementById('selectedDuration').textContent = selectedAnime.duration;
    document.getElementById('animeDetails').style.display = 'block';
    document.getElementById('addButton').disabled = false;
}

function addAnime() {
    if (!selectedAnime) return;
    
    const episodesPerDay = parseInt(document.getElementById('episodiosPerDay').value);
    const startDate = new Date(document.getElementById('startDate').value);
    
    if (!episodesPerDay || episodesPerDay < 1) {
        alert('Por favor ingresa un número válido de episodios por día');
        return;
    }
    
    const daysNeeded = Math.ceil(selectedAnime.episodes / episodesPerDay);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysNeeded - 1);
    
    const totalMinutes = selectedAnime.episodes * selectedAnime.duration;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    const newAnime = {
        id: Date.now(),
        ...selectedAnime,
        episodesPerDay,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalTime: `${hours}h ${minutes}m`,
        daysNeeded
    };
    
    animes.push(newAnime);
    saveAnimes();
    renderAnimes();
    renderCalendar();
    
    document.getElementById('animeSearch').value = '';
    document.getElementById('animeDetails').style.display = 'none';
    document.getElementById('addButton').disabled = true;
    selectedAnime = null;
    
    alert(`¡Anime agregado! Terminarás de verlo el ${endDate.toLocaleDateString('es-ES')}`);
}

function saveAnimes() {
    localStorage.setItem('animes', JSON.stringify(animes));
}

function renderAnimes() {
    const animeList = document.getElementById('animeList');
    
    if (animes.length === 0) {
        animeList.innerHTML = '<p class="text-gray-500 col-span-full text-center">No hay animes programados todavía</p>';
        return;
    }
    
    animeList.innerHTML = animes.map(anime => `
        <div class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200 shadow-sm hover:shadow-md transition">
            <div class="flex gap-3 mb-3">
                <img src="${anime.image}" alt="${escapeHtml(anime.title)}" class="w-20 h-28 object-cover rounded shadow">
                <div class="flex-1">
                    <h3 class="font-bold text-gray-800 mb-1 line-clamp-2">${escapeHtml(anime.title)}</h3>
                    <p class="text-sm text-gray-600 mb-1">
                        <i class="fas fa-film"></i> ${anime.episodes} eps × ${anime.duration} min
                    </p>
                    <p class="text-sm text-gray-600">
                        <i class="fas fa-clock"></i> ${anime.totalTime} total
                    </p>
                </div>
            </div>
            <div class="border-t pt-3 space-y-1 text-sm">
                <p class="text-gray-700">
                    <i class="fas fa-calendar-day text-green-600"></i> 
                    <strong>Inicio:</strong> ${new Date(anime.startDate).toLocaleDateString('es-ES')}
                </p>
                <p class="text-gray-700">
                    <i class="fas fa-calendar-check text-blue-600"></i> 
                    <strong>Fin:</strong> ${new Date(anime.endDate).toLocaleDateString('es-ES')}
                </p>
                <p class="text-gray-700">
                    <i class="fas fa-tv text-purple-600"></i> 
                    <strong>${anime.episodesPerDay}</strong> eps/día · <strong>${anime.daysNeeded}</strong> días
                </p>
            </div>
            <button 
                onclick="deleteAnime(${anime.id})" 
                class="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition duration-200 text-sm font-semibold"
            >
                <i class="fas fa-trash-alt mr-1"></i>Eliminar
            </button>
        </div>
    `).join('');
}

function deleteAnime(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este anime?')) {
        animes = animes.filter(a => a.id !== id);
        saveAnimes();
        renderAnimes();
        renderCalendar();
    }
}

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    let calendarHTML = `
        <div class="mb-4">
            <h3 class="text-xl font-bold text-center text-gray-800">${monthNames[currentMonth]} ${currentYear}</h3>
        </div>
        <div class="grid grid-cols-7 gap-1 text-center">
            <div class="font-bold text-gray-600 p-2">Dom</div>
            <div class="font-bold text-gray-600 p-2">Lun</div>
            <div class="font-bold text-gray-600 p-2">Mar</div>
            <div class="font-bold text-gray-600 p-2">Mié</div>
            <div class="font-bold text-gray-600 p-2">Jue</div>
            <div class="font-bold text-gray-600 p-2">Vie</div>
            <div class="font-bold text-gray-600 p-2">Sáb</div>
    `;
    
    for (let i = 0; i < startDayOfWeek; i++) {
        calendarHTML += '<div class="p-2"></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(currentYear, currentMonth, day);
        const dateStr = currentDate.toDateString();
        
        const animesOnThisDay = animes.filter(anime => {
            const start = new Date(anime.startDate);
            const end = new Date(anime.endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            currentDate.setHours(0, 0, 0, 0);
            return currentDate >= start && currentDate <= end;
        });
        
        let dayClass = 'p-2 min-h-[60px] border border-gray-200 rounded';
        let indicators = '';
        
        if (currentDate.toDateString() === today.toDateString()) {
            dayClass += ' bg-blue-100 border-blue-400 font-bold';
        }
        
        if (animesOnThisDay.length > 0) {
            dayClass += ' bg-purple-50 hover:bg-purple-100 cursor-pointer';
            indicators = `<div class="text-xs mt-1">${animesOnThisDay.map(a => 
                `<div class="bg-purple-500 text-white rounded px-1 mb-1 truncate" title="${escapeHtml(a.title)}">${escapeHtml(a.title.substring(0, 15))}...</div>`
            ).join('')}</div>`;
        }
        
        calendarHTML += `
            <div class="${dayClass}">
                <div class="font-semibold">${day}</div>
                ${indicators}
            </div>
        `;
    }
    
    calendarHTML += '</div>';
    calendar.innerHTML = calendarHTML;
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('#animeSearch') && !e.target.closest('#suggestions')) {
        document.getElementById('suggestions').classList.add('hidden');
    }
});

renderAnimes();
renderCalendar();
