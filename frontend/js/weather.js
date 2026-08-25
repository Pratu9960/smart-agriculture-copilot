/**
 * Weather and location flow.
 *
 * The backend remains the source of live weather data. This module only stores
 * the last resolved location and a real response so that the UI can explain
 * what is available when the device is offline.
 */
const WeatherModule = {
  locationStorageKey: 'haritkranti_weather_location',
  weatherStorageKey: 'haritkranti_weather_cache',
  locationMaxAgeMs: 30 * 24 * 60 * 60 * 1000,
  weatherFreshnessMs: 30 * 60 * 1000,
  currentLocation: null,
  currentData: null,
  currentCacheTime: null,
  currentIsCached: false,
  lastStatusState: 'prompt',
  initialized: false,
  viewReady: false,
  requestSequence: 0,
  searchResults: [],

  t(key, variables = {}) {
    return window.i18n && typeof window.i18n.t === 'function'
      ? window.i18n.t(key, variables)
      : key;
  },

  isOnline() {
    return window.App && typeof window.App.isOnline === 'boolean'
      ? window.App.isOnline
      : navigator.onLine;
  },

  initView() {
    this.setupEventListeners();
    this.viewReady = true;
    this.ensureWeather();
  },

  setupEventListeners() {
    if (this.initialized) return;
    this.initialized = true;

    document.getElementById('btn-weather-use-location')?.addEventListener('click', () => this.requestDeviceLocation());
    document.getElementById('btn-weather-location')?.addEventListener('click', () => this.refreshWeather());
    document.getElementById('btn-weather-change-location')?.addEventListener('click', () => this.openSearchPanel());
    document.getElementById('btn-weather-search-location')?.addEventListener('click', () => this.openSearchPanel());
    document.getElementById('btn-weather-error-change')?.addEventListener('click', () => this.openSearchPanel());
    document.getElementById('btn-weather-retry')?.addEventListener('click', () => this.retry());
    document.getElementById('btn-weather-close-search')?.addEventListener('click', () => this.closeSearchPanel());
    document.getElementById('weather-search-form')?.addEventListener('submit', event => {
      event.preventDefault();
      this.searchForLocation();
    });
    document.getElementById('weather-search-results')?.addEventListener('click', event => {
      const resultButton = event.target.closest('[data-location-index]');
      if (!resultButton) return;
      const result = this.searchResults[Number(resultButton.dataset.locationIndex)];
      if (result) this.selectLocation(result);
    });
    document.addEventListener('languagechange', () => {
      this.refreshTranslations();
    });
  },

  getConditionTranslationKey(condition) {
    if (!condition || typeof condition !== 'string') return null;
    const norm = condition.toLowerCase().trim();
    const map = {
      'clear sky': 'weather.condClearSky',
      'mainly clear': 'weather.condMainlyClear',
      'partly cloudy': 'weather.condPartlyCloudy',
      'overcast': 'weather.condOvercast',
      'foggy': 'weather.condFoggy',
      'fog': 'weather.condFoggy',
      'rime fog': 'weather.condRimeFog',
      'light drizzle': 'weather.condLightDrizzle',
      'drizzle': 'weather.condDrizzle',
      'heavy drizzle': 'weather.condHeavyDrizzle',
      'light rain': 'weather.condLightRain',
      'rain': 'weather.condRain',
      'heavy rain': 'weather.condHeavyRain',
      'light snow': 'weather.condLightSnow',
      'snow': 'weather.condSnow',
      'heavy snow': 'weather.condHeavySnow',
      'rain showers': 'weather.condRainShowers',
      'heavy rain showers': 'weather.condHeavyRainShowers',
      'thunderstorm': 'weather.condThunderstorm',
      'thunderstorm with hail': 'weather.condThunderstormHail',
      'severe thunderstorm': 'weather.condSevereThunderstorm',
      'unknown conditions': 'weather.unknownCondition'
    };
    return map[norm] || null;
  },

  translateCondition(condition) {
    if (!condition) return this.t('weather.unknownCondition');
    const key = this.getConditionTranslationKey(condition);
    return key ? this.t(key) : condition;
  },

  refreshTranslations() {
    if (this.currentData) {
      const statusState = this.lastStatusState;
      this.renderWeatherUI(this.currentData, { cached: this.currentIsCached, cacheTime: this.currentCacheTime });
      if (statusState && statusState !== 'live') this.showStatus(statusState, null, true);
    } else {
      const locText = document.getElementById('weather-location-text');
      if (locText && (!this.currentLocation || !this.currentLocation.displayName)) {
        locText.textContent = this.t('weather.locationLoading');
      }
      if (this.viewReady) this.refreshStatusCopy();
    }
  },

  getStoredLocation() {
    try {
      const parsed = JSON.parse(localStorage.getItem(this.locationStorageKey) || 'null');
      if (!parsed || !this.validCoordinates(parsed.latitude, parsed.longitude)) return null;
      if (parsed.timestamp && Date.now() - Number(parsed.timestamp) > this.locationMaxAgeMs) return null;
      return parsed;
    } catch (error) {
      return null;
    }
  },

  saveLocation(location) {
    const saved = {
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      city: location.city || '',
      state: location.state || '',
      country: location.country || '',
      displayName: location.displayName || '',
      timestamp: Date.now()
    };
    this.currentLocation = saved;
    localStorage.setItem(this.locationStorageKey, JSON.stringify(saved));
    const locationText = document.getElementById('weather-location-text');
    if (locationText) {
      locationText.textContent = saved.displayName
        || [saved.city, saved.state].filter(Boolean).join(', ')
        || this.t('weather.currentLocation');
    }
    return saved;
  },

  readWeatherCache() {
    try {
      const cached = JSON.parse(localStorage.getItem(this.weatherStorageKey) || 'null');
      if (!cached || !cached.data || cached.data.isDevMockPayload === true) return null;
      if (!this.validCoordinates(cached.data.latitude, cached.data.longitude)) return null;
      return cached;
    } catch (error) {
      return null;
    }
  },

  saveWeatherCache(data, location) {
    if (!data || data.isDevMockPayload === true) return;
    const payload = { data, location, savedAt: Date.now() };
    this.currentCacheTime = payload.savedAt;
    localStorage.setItem(this.weatherStorageKey, JSON.stringify(payload));
  },

  validCoordinates(latitude, longitude) {
    return Number.isFinite(Number(latitude)) && Number(latitude) >= -90 && Number(latitude) <= 90
      && Number.isFinite(Number(longitude)) && Number(longitude) >= -180 && Number(longitude) <= 180;
  },

  async ensureWeather() {
    const savedLocation = this.currentLocation || this.getStoredLocation();
    const cached = this.readWeatherCache();
    if (savedLocation) this.currentLocation = savedLocation;
    else if (cached?.location && this.validCoordinates(cached.location.latitude, cached.location.longitude)) {
      this.currentLocation = cached.location;
    }

    if (!this.currentLocation) {
      if (!this.isOnline() && cached) {
        this.currentLocation = cached.location;
        this.renderWeatherUI(cached.data, { cached: true, offline: true, cacheTime: cached.savedAt });
      } else if (!this.isOnline()) {
        this.showStatus('offline');
      } else {
        const permission = await this.getLocationPermissionState();
        if (permission === 'granted') await this.requestDeviceLocation();
        else if (permission === 'denied') this.showStatus('denied');
        else this.showLocationPrompt();
      }
      return;
    }

    if (!this.isOnline()) {
      if (cached && this.sameLocation(cached.data, this.currentLocation)) {
        this.renderWeatherUI(cached.data, { cached: true, offline: true, cacheTime: cached.savedAt });
      } else {
        this.showStatus('offline');
      }
      return;
    }

    if (cached && this.sameLocation(cached.data, this.currentLocation)
      && Date.now() - Number(cached.savedAt || 0) < this.weatherFreshnessMs) {
      this.renderWeatherUI(cached.data, { cached: true, cacheTime: cached.savedAt });
      return;
    }
    await this.loadWeatherData(this.currentLocation);
  },

  async getLocationPermissionState() {
    if (!navigator.permissions || typeof navigator.permissions.query !== 'function') return 'prompt';
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state || 'prompt';
    } catch (error) {
      return 'prompt';
    }
  },

  async requestDeviceLocation() {
    if (!('geolocation' in navigator)) {
      this.showStatus('unsupported');
      this.openSearchPanel();
      return;
    }

    this.closeSearchPanel();
    this.setLoading('location');
    navigator.geolocation.getCurrentPosition(
      position => this.handleLocationSuccess(position),
      error => this.handleLocationError(error),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 5 * 60 * 1000 }
    );
  },

  async handleLocationSuccess(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    if (!this.validCoordinates(lat, lon)) {
      this.showStatus('unavailable');
      this.openSearchPanel();
      return;
    }

    const location = {
      latitude: lat,
      longitude: lon,
      displayName: '',
      city: '',
      state: '',
      country: ''
    };
    this.saveLocation(location);

    // Weather must load immediately from coordinates; reverse geocoding runs in parallel
    const weatherPromise = this.loadWeatherData(this.currentLocation);

    if (this.isOnline() && window.SmartAgAPI?.reverseGeocode) {
      window.SmartAgAPI.reverseGeocode(lat, lon)
        .then(resolved => {
          if (resolved && (resolved.displayName || resolved.city)) {
            Object.assign(this.currentLocation, resolved);
            this.saveLocation(this.currentLocation);
            const locationText = document.getElementById('weather-location-text');
            if (locationText) {
              locationText.textContent = this.locationLabel(this.currentData || { latitude: lat, longitude: lon });
            }
          }
        })
        .catch(error => {
          console.warn('[WeatherModule] Reverse geocoding unavailable. Weather continues with coordinates.', error);
        });
    }

    await weatherPromise;
  },

  handleLocationError(error) {
    const code = error && error.code;
    if (code === 1) this.showStatus('denied');
    else if (code === 3) this.showStatus('timeout');
    else this.showStatus('unavailable');
    this.openSearchPanel();
  },

  async loadWeatherData(location) {
    if (!this.isOnline()) {
      const cached = this.readWeatherCache();
      if (cached && this.sameLocation(cached.data, location)) {
        this.renderWeatherUI(cached.data, { cached: true, offline: true, cacheTime: cached.savedAt });
      } else {
        this.showStatus('offline');
      }
      return;
    }

    const requestId = ++this.requestSequence;
    this.setLoading('weather');
    try {
      const data = await window.SmartAgAPI.getWeather(location.latitude, location.longitude);
      if (requestId !== this.requestSequence) return;
      if (!data || data.isDevMockPayload === true) throw new Error('Non-live weather response.');
      this.currentData = data;
      this.currentCacheTime = Date.now();
      this.currentIsCached = false;
      this.saveWeatherCache(data, location);
      this.renderWeatherUI(data, { cacheTime: this.currentCacheTime });
    } catch (error) {
      if (requestId !== this.requestSequence) return;
      console.error('[WeatherModule] Live weather request failed.', error);
      const cached = this.readWeatherCache();
      if (cached && this.sameLocation(cached.data, location)) {
        this.renderWeatherUI(cached.data, { cached: true, offline: false, cacheTime: cached.savedAt });
        this.showStatus('serviceError', null, true);
      } else {
        this.showStatus(error && error.status === 404 ? 'invalid' : 'serviceError');
      }
    }
  },

  async refreshWeather() {
    if (!this.currentLocation) {
      await this.ensureWeather();
      return;
    }
    if (!this.isOnline()) {
      await this.ensureWeather();
      return;
    }
    await this.loadWeatherData(this.currentLocation);
  },

  async retry() {
    const state = document.getElementById('weather-status-card')?.dataset.state;
    if (!this.currentLocation && ['timeout', 'unavailable'].includes(state)) {
      await this.requestDeviceLocation();
      return;
    }
    if (this.currentLocation) await this.loadWeatherData(this.currentLocation);
    else await this.ensureWeather();
  },

  openSearchPanel() {
    document.getElementById('weather-location-panel')?.classList.remove('hidden');
    const input = document.getElementById('weather-location-search');
    if (input) window.setTimeout(() => input.focus(), 0);
  },

  closeSearchPanel() {
    document.getElementById('weather-location-panel')?.classList.add('hidden');
  },

  async searchForLocation() {
    const input = document.getElementById('weather-location-search');
    const results = document.getElementById('weather-search-results');
    const query = input?.value.trim();
    if (!query || !results) return;
    results.textContent = this.t('weather.searching');
    try {
      this.searchResults = await window.SmartAgAPI.searchLocation(query);
      results.textContent = '';
      if (!this.searchResults.length) {
        results.textContent = this.t('weather.noSearchResults');
        return;
      }
      this.searchResults.forEach((result, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'weather-search-result';
        button.dataset.locationIndex = String(index);
        const title = document.createElement('strong');
        title.textContent = result.displayName || [result.city, result.state].filter(Boolean).join(', ');
        const meta = document.createElement('small');
        meta.textContent = [result.city, result.state, result.country].filter(Boolean).join(', ');
        button.append(title, meta);
        results.appendChild(button);
      });
    } catch (error) {
      results.textContent = this.t('weather.locationSearchUnavailable');
    }
  },

  async selectLocation(result) {
    if (!this.validCoordinates(result.latitude, result.longitude)) return;
    this.closeSearchPanel();
    this.saveLocation(result);
    await this.loadWeatherData(this.currentLocation);
  },

  showLocationPrompt() {
    this.showStatus('prompt');
  },

  refreshStatusCopy() {
    const status = document.getElementById('weather-status-card');
    if (!status || status.classList.contains('hidden')) return;
    const state = status.dataset.state || 'prompt';
    this.showStatus(state, null, status.dataset.withContent === 'true');
  },

  showStatus(state, titleKey = null, withContent = false) {
    const keys = {
      prompt: ['weather.locationPermissionTitle', 'weather.locationPermissionBody'],
      denied: ['weather.locationDeniedTitle', 'weather.locationDeniedBody'],
      unavailable: ['weather.locationUnavailableTitle', 'weather.locationUnavailableBody'],
      timeout: ['weather.locationTimeoutTitle', 'weather.locationTimeoutBody'],
      unsupported: ['weather.locationUnsupportedTitle', 'weather.locationUnsupportedBody'],
      offline: ['weather.offlineTitle', 'weather.offlineBody'],
      serviceError: ['weather.serviceErrorTitle', 'weather.serviceErrorBody'],
      invalid: ['weather.invalidLocationTitle', 'weather.invalidLocationBody']
    };
    const selected = titleKey ? [titleKey, 'weather.serviceErrorBody'] : keys[state] || keys.serviceError;
    const card = document.getElementById('weather-status-card');
    const content = document.getElementById('weather-content');
    const errorActions = document.getElementById('weather-error-actions');
    if (!card) return;
    card.dataset.state = state;
    card.dataset.withContent = withContent ? 'true' : 'false';
    this.lastStatusState = state;
    card.classList.remove('hidden');
    if (content) content.classList.toggle('hidden', !withContent);
    if (errorActions) errorActions.classList.toggle('hidden', !['serviceError', 'invalid', 'timeout', 'unavailable'].includes(state));
    const title = document.getElementById('weather-status-title');
    const detail = document.getElementById('weather-status-detail');
    if (title) title.textContent = this.t(selected[0]);
    if (detail) detail.textContent = this.t(selected[1]);
    const statusActions = card.querySelector('.weather-status-actions');
    if (statusActions) statusActions.classList.toggle('hidden', ['serviceError', 'invalid', 'timeout', 'unavailable', 'offline'].includes(state));
  },

  setLoading(stage) {
    const card = document.getElementById('weather-status-card');
    const content = document.getElementById('weather-content');
    const errorActions = document.getElementById('weather-error-actions');
    if (!card) return;
    card.dataset.state = 'loading';
    card.dataset.withContent = 'false';
    this.lastStatusState = 'loading';
    card.classList.remove('hidden');
    content?.classList.add('hidden');
    errorActions?.classList.add('hidden');
    card.querySelector('.weather-status-actions')?.classList.add('hidden');
    const title = document.getElementById('weather-status-title');
    const detail = document.getElementById('weather-status-detail');
    if (title) title.textContent = this.t(stage === 'location' ? 'weather.gettingLocationTitle' : 'weather.fetchingWeatherTitle');
    if (detail) detail.textContent = this.t(stage === 'location' ? 'weather.gettingLocationBody' : 'weather.fetchingWeatherBody');
  },

  sameLocation(data, location) {
    return data && location && Math.abs(Number(data.latitude) - Number(location.latitude)) < 0.00001
      && Math.abs(Number(data.longitude) - Number(location.longitude)) < 0.00001;
  },

  locationLabel(data) {
    if (this.currentLocation?.displayName) return this.currentLocation.displayName;
    const cityState = [this.currentLocation?.city, this.currentLocation?.state].filter(Boolean).join(', ');
    if (cityState) return cityState;
    if (data?.location && !data.location.startsWith('Location (')) return data.location;
    return this.t('weather.currentLocation');
  },

  formatTimestamp(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const lang = document.documentElement.lang || 'en';
    const localeMap = { en: 'en-IN', mr: 'mr-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN' };
    const locale = localeMap[lang] || lang;
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    } catch (error) {
      return date.toLocaleString();
    }
  },

  setOptional(itemId, valueId, value, formatter) {
    const item = document.getElementById(itemId);
    const valueElement = document.getElementById(valueId);
    const available = value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
    if (item) item.classList.toggle('hidden', !available);
    if (valueElement && available) valueElement.textContent = formatter(value);
  },

  renderWeatherUI(data, options = {}) {
    if (!data || data.isDevMockPayload === true) return;
    this.currentData = data;
    const cacheTime = options.cacheTime || this.currentCacheTime || Date.now();
    this.currentCacheTime = options.cached ? cacheTime : Date.now();
    this.currentIsCached = Boolean(options.cached);
    this.lastStatusState = 'live';
    const content = document.getElementById('weather-content');
    const statusCard = document.getElementById('weather-status-card');
    const errorActions = document.getElementById('weather-error-actions');
    content?.classList.remove('hidden');
    statusCard?.classList.add('hidden');
    errorActions?.classList.add('hidden');

    const locationText = document.getElementById('weather-location-text');
    if (locationText) locationText.textContent = this.locationLabel(data);
    const updated = document.getElementById('weather-last-updated');
    if (updated) updated.textContent = this.t('weather.lastUpdated', { time: this.formatTimestamp(data.timestamp) || this.formatTimestamp(cacheTime) });
    const statusBadge = document.getElementById('weather-data-status');
    if (statusBadge) statusBadge.textContent = options.offline ? this.t('weather.offlineCached') : options.cached ? this.t('weather.cached') : this.t('weather.live');

    const temperature = document.getElementById('weather-temp-val');
    if (temperature) temperature.textContent = Number.isFinite(Number(data.temperature)) ? `${Math.round(Number(data.temperature))}°C` : '—';
    const condition = document.getElementById('weather-condition-text');
    const translatedCondition = this.translateCondition(data.condition);
    if (condition) condition.textContent = [data.icon, translatedCondition].filter(Boolean).join(' ') || this.t('weather.unknownCondition');
    const humidity = document.getElementById('weather-humidity');
    if (humidity) humidity.textContent = Number.isFinite(Number(data.humidity)) ? `${Math.round(Number(data.humidity))}%` : '—';
    const wind = document.getElementById('weather-wind');
    if (wind) wind.textContent = Number.isFinite(Number(data.windSpeed)) ? `${Math.round(Number(data.windSpeed))} km/h` : '—';
    const rainProbability = document.getElementById('weather-rain-prob');
    if (rainProbability) rainProbability.textContent = Number.isFinite(Number(data.rainProbability)) ? `${Math.round(Number(data.rainProbability))}%` : '—';

    this.setOptional('weather-precipitation-item', 'weather-precipitation', data.precipitation, value => `${Number(value).toFixed(1)} mm`);
    this.setOptional('weather-feels-item', 'weather-feels', data.feelsLike, value => `${Math.round(Number(value))}°C`);
    this.setOptional('weather-direction-item', 'weather-direction', data.windDirection, value => `${this.windDirection(value)} (${Math.round(Number(value))}°)`);
    this.setOptional('weather-cloud-item', 'weather-cloud', data.cloudCover, value => `${Math.round(Number(value))}%`);
    this.setOptional('weather-visibility-item', 'weather-visibility', data.visibility, value => `${(Number(value) / 1000).toFixed(1)} km`);
    this.setOptional('weather-pressure-item', 'weather-pressure', data.pressure, value => `${Math.round(Number(value))} hPa`);

    const rainDetail = document.getElementById('weather-rain-summary-detail');
    const rainParts = [];
    if (Number.isFinite(Number(data.rainProbability))) rainParts.push(this.t('weather.rainProbabilityValue', { value: Math.round(Number(data.rainProbability)) }));
    if (Number.isFinite(Number(data.precipitation))) rainParts.push(this.t('weather.precipitationValue', { value: Number(data.precipitation).toFixed(1) }));
    if (rainDetail) rainDetail.textContent = rainParts.length ? rainParts.join(' · ') : this.t('weather.rainDataUnavailable');

    const advisory = data.irrigationAdvisory;
    const advisoryTitle = document.getElementById('advisory-headline');
    const advisoryDetail = document.getElementById('advisory-detail');
    const advisoryRec = document.getElementById('advisory-recommendation');
    const advisoryCard = document.getElementById('weather-advisory-card');

    let transHeadline = '';
    let transDetail = '';
    let transRec = '';

    const recType = advisory?.recommendation;
    const headText = advisory?.headline || '';

    if (recType === 'DELAY_IRRIGATION' || headText.toLowerCase().includes('rain')) {
      transHeadline = this.t('weather.advisoryRainLikelyHeadline');
      transDetail = this.t('weather.advisoryRainLikelyDetail');
      transRec = this.t('weather.advisoryRainLikelyRec');
    } else if (recType === 'IRRIGATE_SOON' || headText.toLowerCase().includes('hot')) {
      transHeadline = this.t('weather.advisoryHotDryHeadline');
      transDetail = this.t('weather.advisoryHotDryDetail');
      transRec = this.t('weather.advisoryHotDryRec');
    } else if (headText.toLowerCase().includes('moderate')) {
      transHeadline = this.t('weather.advisoryModerateHeadline');
      transDetail = this.t('weather.advisoryModerateDetail');
      transRec = this.t('weather.advisoryModerateRec');
    } else if (recType === 'CHECK_SOIL_MOISTURE' || headText.toLowerCase().includes('normal')) {
      transHeadline = this.t('weather.advisoryNormalHeadline');
      transDetail = this.t('weather.advisoryNormalDetail');
      transRec = this.t('weather.advisoryNormalRec');
    }

    if (advisoryTitle) advisoryTitle.textContent = transHeadline || advisory?.headline || this.t('weather.adviceUnavailable');
    if (advisoryDetail) advisoryDetail.textContent = transDetail || advisory?.detail || this.t('weather.adviceUnavailableBody');
    if (advisoryRec) {
      advisoryRec.textContent = transRec || this.t('weather.advisoryNormalRec');
      advisoryRec.classList.toggle('hidden', !transRec);
    }
    advisoryCard?.classList.toggle('warning', advisory?.recommendation === 'DELAY_IRRIGATION');

    const forecastList = document.getElementById('weather-forecast-list');
    if (forecastList) {
      forecastList.textContent = '';
      const forecast = Array.isArray(data.forecast) ? data.forecast.slice(0, 5) : [];
      if (!forecast.length) {
        forecastList.textContent = this.t('weather.forecastUnavailable');
      } else {
        forecast.forEach(day => {
          const card = document.createElement('article');
          card.className = 'weather-forecast-card';
          const date = document.createElement('span');
          date.className = 'weather-forecast-date';
          date.textContent = this.formatForecastDate(day.date);
          const icon = document.createElement('span');
          icon.className = 'weather-forecast-icon';
          icon.textContent = day.icon || '—';
          const conditionText = document.createElement('strong');
          conditionText.textContent = this.translateCondition(day.condition);
          const temperatures = document.createElement('span');
          temperatures.className = 'weather-forecast-temperatures';
          const max = Number.isFinite(Number(day.temperatureMax)) ? `${Math.round(Number(day.temperatureMax))}°` : '—';
          const min = Number.isFinite(Number(day.temperatureMin)) ? `${Math.round(Number(day.temperatureMin))}°` : '—';
          temperatures.textContent = `${max} / ${min}`;
          const rain = document.createElement('small');
          const rainParts = [];
          if (Number.isFinite(Number(day.rainProbability))) rainParts.push(this.t('weather.rainProbabilityValue', { value: Math.round(Number(day.rainProbability)) }));
          if (Number.isFinite(Number(day.precipitation))) rainParts.push(this.t('weather.precipitationValue', { value: Number(day.precipitation).toFixed(1) }));
          rain.textContent = rainParts.join(' · ');
          card.append(date, icon, conditionText, temperatures, rain);
          forecastList.appendChild(card);
        });
      }
    }
  },

  formatForecastDate(value) {
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value || '—';
    const lang = document.documentElement.lang || 'en';
    const localeMap = { en: 'en-IN', mr: 'mr-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN' };
    const locale = localeMap[lang] || lang;
    try {
      return new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
    } catch (error) {
      return value;
    }
  },

  windDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(Number(degrees) / 45) % 8];
  },

  async handleConnectivityChange() {
    if (this.viewReady) await this.ensureWeather();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // App navigation initializes the module when the Weather view is opened.
});

window.WeatherModule = WeatherModule;
