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
    this.setupSupportInteractions();
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
    const sidebarInitial = document.querySelector('.profile-avatar-sm');
    if (sidebarInitial) sidebarInitial.textContent = displayName.charAt(0).toUpperCase();
  },

  /**
   * SPA Navigation Engine
   * @param {string} viewId ID of the view section to make active (e.g., 'view-home')
   */
  navigateTo(viewId) {
    const targetSection = document.getElementById(viewId);
    if (!targetSection) {
      console.warn(`[App] View section #${viewId} not found.`);
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

    // Close mobile sidebar drawer if open
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // View specific initialization triggers
    if (viewId === 'view-weather' && window.WeatherModule) {
      window.WeatherModule.initView();
    } else if (viewId === 'view-market' && window.MarketModule) {
      window.MarketModule.initView();
    } else if (viewId === 'view-schemes' && window.SchemesModule) {
      window.SchemesModule.initView();
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

    // Global Click Delegation for any element with [data-target]
    document.addEventListener('click', (e) => {
      const targetBtn = e.target.closest('[data-target]');
      if (targetBtn) {
        const targetView = targetBtn.getAttribute('data-target');
        if (targetView) {
          e.preventDefault();
          this.navigateTo(targetView);
        }
      }
    });

    // Mobile Sidebar Drawer Toggle
    const hamburgerBtn = document.getElementById('btn-sidebar-toggle');
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const closeSidebarBtn = document.getElementById('btn-sidebar-close');

    if (hamburgerBtn && sidebar) {
      hamburgerBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (backdrop) backdrop.classList.toggle('active');
      });
    }

    if (backdrop && sidebar) {
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
      });
    }

    if (closeSidebarBtn && sidebar) {
      closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
        if (backdrop) backdrop.classList.remove('active');
      });
    }

    // Notification Bell Toggle
    const notifBtn = document.getElementById('btn-header-notifications');
    const notifPanel = document.getElementById('header-notifications-panel');
    if (notifBtn && notifPanel) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifPanel.classList.toggle('hidden');
      });

      document.addEventListener('click', (e) => {
        if (!notifPanel.contains(e.target) && e.target !== notifBtn) {
          notifPanel.classList.add('hidden');
        }
      });
    }
  },

  setupSupportInteractions() {
    // FAQ Accordion Toggle
    document.addEventListener('click', (e) => {
      const faqBtn = e.target.closest('.faq-question');
      if (faqBtn) {
        const faqItem = faqBtn.closest('.faq-item');
        if (faqItem) {
          faqItem.classList.toggle('open');
        }
      }
    });

    // Contact Form Submission
    const contactForm = document.getElementById('contact-support-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.showToast('Thank you! Your message has been sent to HaritKranti Support.', 'success');
        contactForm.reset();
      });
    }

    // Feedback Form Submission
    const feedbackForm = document.getElementById('user-feedback-form');
    if (feedbackForm) {
      feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.showToast('Thank you for your valuable feedback!', 'success');
        feedbackForm.reset();
      });
    }

    // Crop Guide Search
    const cropGuideSearch = document.getElementById('crop-guide-search');
    if (cropGuideSearch) {
      cropGuideSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.crop-guide-card');
        cards.forEach(card => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(query) ? '' : 'none';
        });
      });
    }
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
      if (this.activeView === 'view-weather' && window.WeatherModule && typeof window.WeatherModule.handleConnectivityChange === 'function') {
        window.WeatherModule.handleConnectivityChange(true);
      }
      if (window.HistoryModule) {
        window.HistoryModule.autoSyncPending();
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateConnectivityUI();
      this.showToast(window.i18n ? window.i18n.t('network.connectionLost') : 'You are offline. Checking local AI availability.', 'warning');
      if (this.activeView === 'view-weather' && window.WeatherModule && typeof window.WeatherModule.handleConnectivityChange === 'function') {
        window.WeatherModule.handleConnectivityChange(false);
      }
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
  },

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
