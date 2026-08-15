/**
 * Smart Agriculture Copilot - Weather & Irrigation Module
 * Fetches weather data & API-driven irrigation advice via FastAPI backend.
 */

const WeatherModule = {
  currentData: null,
  initialized: false,

  initView() {
    this.setupEventListeners();
    this.fetchWeatherForCurrentLocation();
  },

  setupEventListeners() {
    if (this.initialized) return;
    this.initialized = true;

    const btnRefreshLocation = document.getElementById('btn-weather-location');
    if (btnRefreshLocation) {
      btnRefreshLocation.addEventListener('click', () => this.fetchWeatherForCurrentLocation());
    }
  },

  async fetchWeatherForCurrentLocation() {
    const locText = document.getElementById('weather-location-text');
    if (locText) locText.innerText = window.i18n ? window.i18n.t('weather.locationLoading') : 'Detecting your location...';

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          await this.loadWeatherData(lat, lon);
        },
        async (error) => {
          console.warn('[WeatherModule] Geolocation access denied or unavailable. Using default regional location.', error);
          // Default location: Nashik, Maharashtra
          await this.loadWeatherData(20.00, 73.78);
        },
        { timeout: 8000 }
      );
    } else {
      await this.loadWeatherData(20.00, 73.78);
    }
  },

  async loadWeatherData(lat, lon) {
    try {
      const data = await window.SmartAgAPI.getWeather(lat, lon);
      this.currentData = data;
      this.renderWeatherUI(data);
    } catch (err) {
      console.error('[WeatherModule] Error loading weather data:', err);
      const locText = document.getElementById('weather-location-text');
      const t = key => window.i18n ? window.i18n.t(key) : key;
      if (locText) locText.innerText = t('weather.unavailableLocation');
      const conditionText = document.getElementById('weather-condition-text');
      const advisoryTitle = document.getElementById('advisory-headline');
      const advisoryDetail = document.getElementById('advisory-detail');
      if (conditionText) conditionText.innerText = t('weather.unavailableCondition');
      if (advisoryTitle) advisoryTitle.innerText = t('weather.unavailableTitle');
      if (advisoryDetail) { advisoryDetail.innerText = t('weather.unavailableBody'); advisoryDetail.dataset.live = 'false'; }
      if (window.App) window.App.showToast(t('validation.network'), 'error');
    }
  },

  renderWeatherUI(data) {
    const locText = document.getElementById('weather-location-text');
    const tempVal = document.getElementById('weather-temp-val');
    const condText = document.getElementById('weather-condition-text');
    const humidityVal = document.getElementById('weather-humidity');
    const windVal = document.getElementById('weather-wind');
    const rainVal = document.getElementById('weather-rain-prob');

    if (locText) locText.innerText = data.location || `Lat: ${data.latitude}, Lon: ${data.longitude}`;
    if (tempVal) tempVal.innerText = `${Math.round(data.temperature)}°C`;
    if (condText) condText.innerText = `${data.icon || '🌤️'} ${data.condition || (window.i18n ? (window.i18n.t('weather.clear') || 'Clear') : 'Clear')}`;
    if (humidityVal) humidityVal.innerText = `${data.humidity}%`;
    if (windVal) windVal.innerText = `${data.windSpeed} km/h`;
    if (rainVal) rainVal.innerText = `${data.rainProbability || 0}%`;

    // Render API-driven Irrigation Advisory object
    const adv = data.irrigationAdvisory;
    const advisoryTitle = document.getElementById('advisory-headline');
    const advisoryDetail = document.getElementById('advisory-detail');
    const advisoryCard = document.getElementById('weather-advisory-card');

    if (adv) {
      if (advisoryTitle) advisoryTitle.innerText = adv.headline || (window.i18n ? window.i18n.t('weather.adviceEyebrow') : 'Irrigation advisory');
      if (advisoryDetail) { advisoryDetail.innerText = adv.detail || (window.i18n ? window.i18n.t('weather.fallbackAdvice') : 'Follow standard irrigation guidance for your crop.'); advisoryDetail.dataset.live = 'true'; }
      if (advisoryCard) {
        if (adv.recommendation === 'DELAY_IRRIGATION') {
          advisoryCard.className = 'card advisory-card warning';
        } else {
          advisoryCard.className = 'card advisory-card';
        }
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Module initialized on view navigation
});

window.WeatherModule = WeatherModule;
