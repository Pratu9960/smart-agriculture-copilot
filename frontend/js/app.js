/**
 * Smart Agriculture Copilot - Main Application Controller & SPA Router
 */

const App = {
  activeView: 'view-home',
  isOnline: navigator.onLine,
  isAuthenticated: false,
  authReady: false,

  init() {
    console.log('[SmartAg App] Initializing Smart Agriculture Copilot Frontend...');
    this.setupEventListeners();
    this.setupConnectivityMonitor();
    this.setupNativeBridgeHook();
    this.updateConnectivityUI();
    this.setupAuthFlow();
  },

  setupAuthFlow() {
    this.showAuthScreen('login');
    if (window.AuthModule) {
      window.AuthModule.onAuthStateChanged((user) => {
        this.authReady = true;
        this.isAuthenticated = Boolean(user);
        if (user) {
          this.showAppShell(user);
        } else {
          this.showAuthScreen('login');
        }
      });
    } else {
      // Keep the product usable if the optional auth script failed to load.
      this.authReady = true;
      this.showAppShell(null);
    }
  },

  showAuthScreen(mode = 'login') {
    const authScreen = document.getElementById('auth-screen');
    const appShell = document.getElementById('app-shell');
    if (authScreen) authScreen.classList.remove('is-hidden');
    if (appShell) appShell.classList.add('is-hidden');
    if (window.ProfileModule && typeof window.ProfileModule.switchAuthTab === 'function') {
      window.ProfileModule.switchAuthTab(mode);
    }
  },

  showAppShell(user) {
    const authScreen = document.getElementById('auth-screen');
    const appShell = document.getElementById('app-shell');
    if (authScreen) authScreen.classList.add('is-hidden');
    if (appShell) appShell.classList.remove('is-hidden');
    this.syncUserUI(user || (window.AuthModule && window.AuthModule.getCurrentUser()));
    this.navigateTo(this.activeView);
  },

  syncUserUI(user) {
    const name = user && (user.displayName || (user.email ? user.email.split('@')[0] : 'farmer'));
    const displayName = name || 'farmer';
    const dashboardName = document.getElementById('dashboard-farmer-name');
    const headerInitial = document.getElementById('header-profile-initial');
    const profileAvatar = document.getElementById('profile-avatar');
    if (dashboardName) dashboardName.textContent = displayName;
    const greetingTitle = document.getElementById('dashboard-intro-title');
    if (greetingTitle && window.i18n) greetingTitle.innerHTML = window.i18n.t('dashboard.greeting', { name: displayName }).replace(displayName, `<span id="dashboard-farmer-name">${displayName}</span>`);
    if (headerInitial) headerInitial.textContent = displayName.charAt(0).toUpperCase();
    if (profileAvatar) profileAvatar.textContent = displayName.charAt(0).toUpperCase();
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

    // Deactivate all navigation items
    document.querySelectorAll('.nav-item').forEach(nav => {
      nav.classList.remove('active');
    });
    document.querySelectorAll('.desktop-nav-item').forEach(nav => {
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
    const desktopNavMatch = document.querySelector(`.desktop-nav-item[data-target="${viewId}"]`);
    if (desktopNavMatch) desktopNavMatch.classList.add('active');

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

    this.updateAIModeUI();
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

  getAIMode() {
    if (this.isOnline) return 'online';
    return window.SmartAgBridge && window.SmartAgBridge.isAvailable() ? 'offline' : 'offline-unavailable';
  },

  updateAIModeUI() {
    const mode = this.getAIMode();
    const scanLabel = document.getElementById('scan-mode-label');
    const dashboardLabel = document.getElementById('dashboard-network-label');
    const t = key => window.i18n ? window.i18n.t(key) : key;
    const copy = mode === 'online' ? t('network.usingOnline') : mode === 'offline' ? t('network.usingOffline') : t('network.offlineUnavailable');
    if (scanLabel) scanLabel.textContent = copy;
    if (dashboardLabel) dashboardLabel.textContent = mode === 'online' ? t('network.onlineAI') : mode === 'offline' ? t('network.offlineAI') : t('network.offlineUnavailable');
  },

  setupConnectivityMonitor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateConnectivityUI();
      this.showToast(window.i18n ? window.i18n.t('network.connectionRestored') : 'Connection restored. Online AI is available.', 'success');
      // Attempt auto-sync of pending records if available
      if (window.HistoryModule) {
        window.HistoryModule.autoSyncPending();
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateConnectivityUI();
      this.showToast(window.i18n ? window.i18n.t('network.connectionLost') : 'You are offline. Checking local AI availability.', 'warning');
    });
  },

  updateConnectivityUI() {
    const badge = document.getElementById('status-badge');
    const badgeText = document.getElementById('status-badge-text');
    const offlineBanner = document.getElementById('offline-banner');
    const dashboardStatus = document.getElementById('dashboard-network-label');

    if (this.isOnline) {
      if (badge) badge.classList.remove('offline');
      if (badgeText) badgeText.innerText = window.i18n ? window.i18n.t('network.online') : 'Online';
      if (offlineBanner) offlineBanner.classList.add('hidden');
      if (dashboardStatus) dashboardStatus.textContent = window.i18n ? window.i18n.t('network.onlineAI') : 'Online AI available';
    } else {
      if (badge) badge.classList.add('offline');
      if (badgeText) badgeText.innerText = window.i18n ? window.i18n.t('network.offline') : 'Offline';
      if (offlineBanner) offlineBanner.classList.remove('hidden');
      if (dashboardStatus) dashboardStatus.textContent = window.i18n ? (this.getAIMode() === 'offline' ? window.i18n.t('network.offlineAI') : window.i18n.t('network.offlineUnavailable')) : 'Offline AI unavailable on this device';
    }
    this.updateAIModeUI();
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
    const toastMessage = document.createElement('span');
    toastMessage.textContent = message;
    toast.appendChild(toastMessage);
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
