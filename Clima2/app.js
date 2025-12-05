const API_BASE = 'https://api.weatherapi.com/v1';
const API_KEY = '97598e0a54b64bd99bb181712252911';

const form = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const message = document.getElementById('message');
const weatherSection = document.getElementById('weather-section');
const currentCard = document.getElementById('current-card');
const forecastEl = document.getElementById('forecast');

const LAST_CITY_KEY = 'weatherapp_last_city';

function showMessage(text, isError=false){
  message.textContent = text;
  message.className = isError ? 'message error' : 'message';
}

async function fetchWeather(city){
  showMessage('Cargando...');
  weatherSection.classList.add('hidden');
  try{
    const currentRes = await fetch(`${API_BASE}/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&lang=es`);
    if(!currentRes.ok) throw new Error('No se pudo obtener el clima actual');
    const currentData = await currentRes.json();

    const forecastRes = await fetch(`${API_BASE}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=3&lang=es`);
    if(!forecastRes.ok) throw new Error('No se pudo obtener el pronóstico');
    const forecastData = await forecastRes.json();

    renderWeather(currentData, forecastData);
    const cityName = currentData.location ? `${currentData.location.name}, ${currentData.location.country}` : city;
    localStorage.setItem(LAST_CITY_KEY, cityName);
    showMessage('');
  }catch(err){
    console.error(err);
    showMessage('No se encontró la ciudad o ocurrió un error.', true);
  }
}

function renderWeather(currentData, forecastData){
  weatherSection.classList.remove('hidden');

  const loc = currentData.location;
  const cur = currentData.current;
  const iconUrl = cur?.condition?.icon ? 'https:' + cur.condition.icon : '';

  currentCard.innerHTML = `
    <img class="weather-icon" src="${iconUrl}" alt="Icono clima">
    <div class="current-info">
      <h2>${loc.name}, ${loc.country}</h2>
      <div class="small">${cur.temp_c} °C — ${cur.condition.text}</div>
      <div class="small">Humedad: ${cur.humidity}% · Viento: ${cur.wind_kph} km/h</div>
    </div>
  `;

  forecastEl.innerHTML = '';
  const days = forecastData.forecast.forecastday.slice(0,3);
  days.forEach(day => {
    const date = new Date(day.date);
    const weekday = date.toLocaleDateString('es-ES', {weekday:'long'});
    const icon = 'https:' + day.day.condition.icon;
    const max = day.day.maxtemp_c.toFixed(0);
    const min = day.day.mintemp_c.toFixed(0);

    const item = document.createElement('div');
    item.className = 'forecast-item card';
    item.innerHTML = `
      <div class="small">${weekday}</div>
      <img class="weather-icon" src="${icon}" alt="Icono">
      <div class="small">Máx: ${max} °C</div>
      <div class="small">Mín: ${min} °C</div>
    `;
    forecastEl.appendChild(item);
  });
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const q = cityInput.value.trim();
  if(!q) return showMessage('Ingresa una ciudad.', true);
  fetchWeather(q);
});

window.addEventListener('DOMContentLoaded', ()=>{
  const last = localStorage.getItem(LAST_CITY_KEY);
  if(last){
    cityInput.value = last;
    fetchWeather(last);
  }
});
