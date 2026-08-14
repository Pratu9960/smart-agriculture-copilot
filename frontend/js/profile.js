/**
 * Smart Agriculture Copilot - Profile & Authentication Integration Module
 * Manages farmer profile details, Firebase auth state bindings, and Login/Register UI hooks.
 */

const ProfileModule = {
  profileData: JSON.parse(localStorage.getItem('smart_ag_profile') || 'null') || {
    name: '',
    phone: '',
    crop: '',
    location: ''
  },
  currentMode: 'login',
  initialized: false,

  initView() {
    this.setupEventListeners();
    this.renderProfile();
    this.renderAppStatus();
  },

  setupEventListeners() {
    if (this.initialized) return;
    this.initialized = true;

    // Profile details form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProfile();
      });
    }

    // Modal open / close handlers
    const btnToggleAuth = document.getElementById('btn-toggle-auth-modal');
    if (btnToggleAuth) {
      btnToggleAuth.addEventListener('click', () => this.openAuthModal());
    }

    const modalClose = document.getElementById('modal-auth-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeAuthModal());
    }

    // Close modal on overlay background click
    const authOverlay = document.getElementById('modal-auth-overlay');
    if (authOverlay) {
      authOverlay.addEventListener('click', (e) => {
        if (e.target === authOverlay) this.closeAuthModal();
      });
    }

    // Sign out button handler
    const btnLogout = document.getElementById('btn-logout-auth');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => this.handleLogout());
    }

    // Authentication form submission (Login / Register)
    const authForm = document.getElementById('auth-form');
    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAuthSubmit();
      });
    }

    // Tab switching (Sign In vs Create Account)
    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');
    if (tabLogin && tabRegister) {
      tabLogin.addEventListener('click', () => this.switchAuthTab('login'));
      tabRegister.addEventListener('click', () => this.switchAuthTab('register'));
    }

    // Listen to Firebase Auth state changes
    if (window.AuthModule) {
      window.AuthModule.onAuthStateChanged((user) => this.onAuthStateChange(user));
    }
  },

  /**
   * Handle Firebase auth state updates (Single Source of Truth)
   * @param {Object|null} user Firebase User
   */
  onAuthStateChange(user) {
    const displayName = document.getElementById('display-farmer-name');
    const displayEmail = document.getElementById('display-farmer-email');
    const authBadge = document.getElementById('profile-auth-badge');
    const btnToggleAuth = document.getElementById('btn-toggle-auth-modal');
    const btnLogout = document.getElementById('btn-logout-auth');
    const authHint = document.getElementById('auth-status-hint');
    const inputName = document.getElementById('profile-name');

    const i18n = window.i18n;

    if (user) {
      const name = user.displayName || this.profileData.name || (user.email ? user.email.split('@')[0] : 'Farmer');
      if (displayName) displayName.innerText = name;
      if (displayEmail) displayEmail.innerText = user.email || '';
      
      if (authBadge) {
        authBadge.classList.remove('logged-out');
        authBadge.innerText = i18n ? i18n.t('loggedInStatus') : 'Logged In';
      }

      if (btnToggleAuth) {
        btnToggleAuth.innerText = i18n ? i18n.t('switchAccount') : 'Switch Account / Login';
      }

      if (btnLogout) {
        btnLogout.style.display = 'block';
      }

      if (authHint) {
        authHint.innerText = `Signed in as ${user.email}. Scans and settings are synchronized.`;
      }

      if (inputName && !inputName.value && user.displayName) {
        inputName.value = user.displayName;
      }

    } else {
      const defaultName = i18n ? i18n.t('guestFarmer') : 'Guest Farmer';
      if (displayName) displayName.innerText = this.profileData.name || defaultName;
      if (displayEmail) displayEmail.innerText = i18n ? i18n.t('loggedOutStatus') : 'Not logged in';

      if (authBadge) {
        authBadge.classList.add('logged-out');
        authBadge.innerText = i18n ? i18n.t('loggedOutStatus') : 'Not Logged In';
      }

      if (btnToggleAuth) {
        btnToggleAuth.innerText = i18n ? i18n.t('loginRegister') : 'Farmer Login / Register';
      }

      if (btnLogout) {
        btnLogout.style.display = 'none';
      }

      if (authHint) {
        authHint.innerText = 'Sign in to sync your crop scans and access records on any device.';
      }
    }
  },

  renderProfile() {
    const inputName = document.getElementById('profile-name');
    const inputPhone = document.getElementById('profile-phone');
    const inputCrop = document.getElementById('profile-crop');
    const inputLocation = document.getElementById('profile-location');

    if (inputName) inputName.value = this.profileData.name || '';
    if (inputPhone) inputPhone.value = this.profileData.phone || '';
    if (inputCrop) inputCrop.value = this.profileData.crop || '';
    if (inputLocation) inputLocation.value = this.profileData.location || '';

    // Update with current auth state
    if (window.AuthModule) {
      this.onAuthStateChange(window.AuthModule.getCurrentUser());
    }
  },

  async saveProfile() {
    const name = (document.getElementById('profile-name')?.value || '').trim();
    const phone = (document.getElementById('profile-phone')?.value || '').trim();
    const crop = (document.getElementById('profile-crop')?.value || '').trim();
    const location = (document.getElementById('profile-location')?.value || '').trim();

    this.profileData = { name, phone, crop, location };
    localStorage.setItem('smart_ag_profile', JSON.stringify(this.profileData));

    // Update Firebase display name if authenticated
    if (window.AuthModule && window.AuthModule.isLoggedIn() && name) {
      try {
        await window.AuthModule.updateDisplayName(name);
      } catch (err) {
        console.warn('[ProfileModule] Could not update Firebase display name:', err);
      }
    }

    this.renderProfile();

    if (window.App) {
      window.App.showToast('✅ Profile information updated successfully!', 'success');
    }
  },

  renderAppStatus() {
    const statusOnline = document.getElementById('diag-status-online');
    const statusBridge = document.getElementById('diag-status-bridge');

    if (statusOnline) {
      statusOnline.innerText = navigator.onLine ? 'Connected (FastAPI Online Mode)' : 'Offline (Local Web Mode)';
    }

    if (statusBridge) {
      const bridgeActive = window.SmartAgBridge && window.SmartAgBridge.isAvailable();
      statusBridge.innerText = bridgeActive ? 'Available (Android WebView Active)' : 'Unavailable (Standard Browser)';
    }
  },

  openAuthModal() {
    this.clearAuthErrors();
    const modal = document.getElementById('modal-auth-overlay');
    if (modal) modal.classList.add('active');
  },

  closeAuthModal() {
    this.clearAuthErrors();
    const modal = document.getElementById('modal-auth-overlay');
    if (modal) modal.classList.remove('active');
  },

  clearAuthErrors() {
    const errBox = document.getElementById('auth-error-msg');
    if (errBox) {
      errBox.innerText = '';
      errBox.classList.remove('active');
    }
  },

  showAuthError(message) {
    const errBox = document.getElementById('auth-error-msg');
    if (errBox) {
      errBox.innerText = message;
      errBox.classList.add('active');
    }
  },

  switchAuthTab(mode) {
    this.currentMode = mode;
    this.clearAuthErrors();

    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');
    const btnSubmit = document.getElementById('btn-auth-submit');
    const nameGroup = document.getElementById('auth-name-group');
    const modalTitle = document.getElementById('modal-auth-title');

    const i18n = window.i18n;

    if (mode === 'login') {
      if (tabLogin) tabLogin.classList.add('active');
      if (tabRegister) tabRegister.classList.remove('active');
      if (btnSubmit) btnSubmit.innerText = i18n ? i18n.t('loginBtn') : 'Sign In';
      if (nameGroup) nameGroup.style.display = 'none';
      if (modalTitle) modalTitle.innerText = i18n ? i18n.t('loginBtn') : 'Farmer Sign In';
    } else {
      if (tabRegister) tabRegister.classList.add('active');
      if (tabLogin) tabLogin.classList.remove('active');
      if (btnSubmit) btnSubmit.innerText = i18n ? i18n.t('registerBtn') : 'Create Account';
      if (nameGroup) nameGroup.style.display = 'block';
      if (modalTitle) modalTitle.innerText = i18n ? i18n.t('registerBtn') : 'Create Farmer Account';
    }
  },

  /**
   * Execute Firebase Authentication on Form Submit
   */
  async handleAuthSubmit() {
    this.clearAuthErrors();

    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const nameInput = document.getElementById('auth-name');
    const btnSubmit = document.getElementById('btn-auth-submit');

    const email = emailInput?.value?.trim() || '';
    const password = passwordInput?.value || '';
    const name = nameInput?.value?.trim() || '';

    if (!email) {
      this.showAuthError(window.i18n ? window.i18n.t('authErrorInvalidEmail') : 'Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      this.showAuthError(window.i18n ? window.i18n.t('authErrorWeakPassword') : 'Password must be at least 6 characters.');
      return;
    }

    const originalBtnText = btnSubmit ? btnSubmit.innerText : '';
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerText = 'Processing...';
    }

    try {
      if (this.currentMode === 'register') {
        await window.AuthModule.register(name, email, password);
        if (window.App) {
          window.App.showToast(window.i18n ? window.i18n.t('authSuccessRegister') : 'Account created successfully!', 'success');
        }
      } else {
        await window.AuthModule.login(email, password);
        if (window.App) {
          window.App.showToast(window.i18n ? window.i18n.t('authSuccessLogin') : 'Logged in successfully!', 'success');
        }
      }

      // Reset form & close modal
      if (emailInput) emailInput.value = '';
      if (passwordInput) passwordInput.value = '';
      if (nameInput) nameInput.value = '';
      this.closeAuthModal();

    } catch (error) {
      console.error('[ProfileModule] Auth error:', error.message);
      this.showAuthError(error.message);
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerText = originalBtnText;
      }
    }
  },

  /**
   * Handle user logout
   */
  async handleLogout() {
    try {
      if (window.AuthModule) {
        await window.AuthModule.logout();
      }
      if (window.App) {
        window.App.showToast(window.i18n ? window.i18n.t('authSuccessLogout') : 'Signed out successfully.', 'info');
      }
    } catch (err) {
      console.error('[ProfileModule] Sign out error:', err);
      if (window.App) {
        window.App.showToast('Error during sign out. Please try again.', 'error');
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  ProfileModule.setupEventListeners();
});

window.ProfileModule = ProfileModule;
