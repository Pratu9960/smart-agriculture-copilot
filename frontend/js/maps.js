/**
 * Smart Agriculture Copilot - Agriculture Shop Finder Module
 * Uses browser GPS location & generates location-aware Google Maps search URLs.
 */

const MapsModule = {
  selectedCategory: 'agriculture shop',
  currentLat: null,
  currentLon: null,
  initialized: false,

  initView() {
    this.setupEventListeners();
    this.detectLocation();
  },

  setupEventListeners() {
    if (this.initialized) return;
    this.initialized = true;
    document.querySelectorAll('.shop-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.shop-cat-btn').forEach(b => b.classList.remove('active'));
        const target = e.currentTarget;
        target.classList.add('active');
        this.selectedCategory = target.getAttribute('data-category') || 'agriculture shop';
        this.updateMapsLinkPreview();
      });
    });

    const btnGPS = document.getElementById('btn-detect-maps-gps');
    if (btnGPS) {
      btnGPS.addEventListener('click', () => this.detectLocation());
    }

    const btnOpenMaps = document.getElementById('btn-launch-google-maps');
    if (btnOpenMaps) {
      btnOpenMaps.addEventListener('click', () => this.launchGoogleMaps());
    }
  },

  detectLocation() {
    const statusText = document.getElementById('maps-gps-status');
    if (statusText) statusText.innerText = 'Detecting GPS location...';

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.currentLat = pos.coords.latitude;
          this.currentLon = pos.coords.longitude;
          if (statusText) statusText.innerText = `📍 Location found (${this.currentLat.toFixed(2)}, ${this.currentLon.toFixed(2)})`;
          this.updateMapsLinkPreview();
        },
        (err) => {
          console.warn('[MapsModule] Geolocation access denied or unavailable.', err);
          if (statusText) statusText.innerText = '📍 Using manual/general area search';
          this.updateMapsLinkPreview();
        },
        { timeout: 8000 }
      );
    } else {
      if (statusText) statusText.innerText = '📍 Browser geolocation unavailable';
      this.updateMapsLinkPreview();
    }
  },

  buildMapsUrl() {
    const query = encodeURIComponent(this.selectedCategory);
    if (this.currentLat && this.currentLon) {
      return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=&center=${this.currentLat},${this.currentLon}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  },

  updateMapsLinkPreview() {
    const previewElem = document.getElementById('maps-query-preview');
    if (previewElem) {
      previewElem.innerText = `Search: "${this.selectedCategory}" ${this.currentLat ? 'near current coordinates' : ''}`;
    }
  },

  launchGoogleMaps() {
    const url = this.buildMapsUrl();
    console.log('[MapsModule] Launching Google Maps with URL:', url);
    window.open(url, '_blank');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Initialized on view display
});

window.MapsModule = MapsModule;
