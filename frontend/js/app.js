/**
 * Smart Agriculture Copilot - Main Application Controller & SPA Router
 */

const App = {
  activeView: 'view-home',
  isOnline: navigator.onLine,

  init() {
    console.log('[SmartAg App] Initializing Smart Agriculture Copilot Frontend...');
    this.setupEventListeners();
    this.setupConnectivityMonitor();
    this.setupNativeBridgeHook();
    this.updateConnectivityUI();
    this.navigateTo(this.activeView);
  },

  /**
   * SPA Navigation Engine
   * @param {string} viewId ID of the view section to make active (e.g., 'view-home')
   */
  navigateTo(viewId) {
    const targetSection = document.getElementById(viewId);
    if (!targetSection) {
      console.error(`[App] View section #${viewId} not found.`);
      return;
    }

    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(section => {
      section.classList.remove('active');
    });

    // Deactivate all bottom nav items
    document.querySelectorAll('.nav-item').forEach(nav => {
      nav.classList.remove('active');
    });

    // Activate target section
    targetSection.classList.add('active');
    this.activeView = viewId;

    // Activate corresponding nav item
    const navMatch = document.querySelector(`.nav-item[data-target="${viewId}"]`);
    if (navMatch) {
      navMatch.classList.add('active');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // View specific initialization triggers
    if (viewId === 'view-weather' && window.WeatherModule) {
      window.WeatherModule.initView();
    } else if (viewId === 'view-history' && window.HistoryModule) {
      window.HistoryModule.loadHistory();
    } else if (viewId === 'view-shops' && window.MapsModule) {
      window.MapsModule.initView();
    } else if (viewId === 'view-profile' && window.ProfileModule) {
      window.ProfileModule.initView();
    }
  },

  setupEventListeners() {
    // Header brand click -> return home
    const brand = document.getElementById('brand-home-btn');
    if (brand) {
      brand.addEventListener('click', () => this.navigateTo('view-home'));
    }

    // Navigation item click handlers
    document.querySelectorAll('[data-target]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetView = e.currentTarget.getAttribute('data-target');
        if (targetView) {
          this.navigateTo(targetView);
        }
      });
    });
  },

  setupConnectivityMonitor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateConnectivityUI();
      this.showToast('📶 Internet connection restored!', 'success');
      // Attempt auto-sync of pending records if available
      if (window.HistoryModule) {
        window.HistoryModule.autoSyncPending();
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateConnectivityUI();
      this.showToast('📡 You are currently offline.', 'warning');
    });
  },

  updateConnectivityUI() {
    const badge = document.getElementById('status-badge');
    const badgeText = document.getElementById('status-badge-text');
    const offlineBanner = document.getElementById('offline-banner');

    if (this.isOnline) {
      if (badge) badge.classList.remove('offline');
      if (badgeText) badgeText.innerText = window.i18n ? window.i18n.t('online') : 'Online';
      if (offlineBanner) offlineBanner.classList.add('hidden');
    } else {
      if (badge) badge.classList.add('offline');
      if (badgeText) badgeText.innerText = window.i18n ? window.i18n.t('offline') : 'Offline';
      if (offlineBanner) offlineBanner.classList.remove('hidden');
    }
  },

  /**
   * OPTIONAL Native Android Bridge Interface
   * Safely checks window.AndroidNativeBridge without failing in desktop/mobile web browsers.
   */
  setupNativeBridgeHook() {
    window.SmartAgBridge = {
      isAvailable() {
        return typeof window.AndroidNativeBridge !== 'undefined' && window.AndroidNativeBridge !== null;
      },
      triggerOfflineDiagnosis(base64Image) {
        if (this.isAvailable() && typeof window.AndroidNativeBridge.diagnoseOffline === 'function') {
          console.log('[NativeBridge] Invoking AndroidNativeBridge.diagnoseOffline()');
          return window.AndroidNativeBridge.diagnoseOffline(base64Image);
        }
        console.warn('[NativeBridge] AndroidNativeBridge is unavailable in this environment.');
        return null;
      },
      saveOfflineRecord(recordJsonString) {
        if (this.isAvailable() && typeof window.AndroidNativeBridge.saveToRoom === 'function') {
          console.log('[NativeBridge] Invoking AndroidNativeBridge.saveToRoom()');
          return window.AndroidNativeBridge.saveToRoom(recordJsonString);
        }
        return false;
      }
    };

    if (window.SmartAgBridge.isAvailable()) {
      console.log('📱 Android Native Bridge detected and active.');
    } else {
      console.log('🌐 Standard Web Browser mode active (AndroidNativeBridge optional hook is inactive).');
    }
  },

  /**
   * Toast Notification Helper
   * @param {string} message Text to display
   * @param {'info'|'success'|'warning'|'error'} type 
   */
  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

window.App = App;
