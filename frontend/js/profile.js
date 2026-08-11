/**
 * Smart Agriculture Copilot - Profile & Authentication Integration Module
 * Manages farmer profile details and Login/Register UI form hooks.
 */

const ProfileModule = {
  profileData: JSON.parse(localStorage.getItem('smart_ag_profile') || 'null') || {
    name: 'Kisan Ramesh Patil',
    phone: '+91 98765 43210',
    crop: 'Tomato & Cotton',
    location: 'Nashik, Maharashtra'
  },
  initialized: false,

  initView() {
    this.setupEventListeners();
    this.renderProfile();
    this.renderAppStatus();
  },

  setupEventListeners() {
    if (this.initialized) return;
    this.initialized = true;
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProfile();
      });
    }

    const btnToggleAuth = document.getElementById('btn-toggle-auth-modal');
    if (btnToggleAuth) {
      btnToggleAuth.addEventListener('click', () => this.openAuthModal());
    }

    const modalClose = document.getElementById('modal-auth-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeAuthModal());
    }

    const authForm = document.getElementById('auth-form');
    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAuthSubmit();
      });
    }

    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');
    if (tabLogin && tabRegister) {
      tabLogin.addEventListener('click', () => this.switchAuthTab('login'));
      tabRegister.addEventListener('click', () => this.switchAuthTab('register'));
    }
  },

  renderProfile() {
    const inputName = document.getElementById('profile-name');
    const inputPhone = document.getElementById('profile-phone');
    const inputCrop = document.getElementById('profile-crop');
    const inputLocation = document.getElementById('profile-location');
    const displayName = document.getElementById('display-farmer-name');

    if (inputName) inputName.value = this.profileData.name || '';
    if (inputPhone) inputPhone.value = this.profileData.phone || '';
    if (inputCrop) inputCrop.value = this.profileData.crop || '';
    if (inputLocation) inputLocation.value = this.profileData.location || '';
    if (displayName) displayName.innerText = this.profileData.name || 'Farmer';
  },

  saveProfile() {
    const name = document.getElementById('profile-name').value;
    const phone = document.getElementById('profile-phone').value;
    const crop = document.getElementById('profile-crop').value;
    const location = document.getElementById('profile-location').value;

    this.profileData = { name, phone, crop, location };
    localStorage.setItem('smart_ag_profile', JSON.stringify(this.profileData));
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
    const modal = document.getElementById('modal-auth-overlay');
    if (modal) modal.classList.add('active');
  },

  closeAuthModal() {
    const modal = document.getElementById('modal-auth-overlay');
    if (modal) modal.classList.remove('active');
  },

  switchAuthTab(mode) {
    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');
    const btnSubmit = document.getElementById('btn-auth-submit');
    const nameGroup = document.getElementById('auth-name-group');

    if (mode === 'login') {
      if (tabLogin) tabLogin.classList.add('active');
      if (tabRegister) tabRegister.classList.remove('active');
      if (btnSubmit) btnSubmit.innerText = window.i18n ? window.i18n.t('loginBtn') : 'Sign In';
      if (nameGroup) nameGroup.style.display = 'none';
    } else {
      if (tabRegister) tabRegister.classList.add('active');
      if (tabLogin) tabLogin.classList.remove('active');
      if (btnSubmit) btnSubmit.innerText = window.i18n ? window.i18n.t('registerBtn') : 'Create Account';
      if (nameGroup) nameGroup.style.display = 'block';
    }
  },

  /**
   * Firebase Authentication Hook Handler
   * Ready for Firebase Agent to attach auth listener.
   */
  handleAuthSubmit() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    console.log('[ProfileModule] Auth hook triggered for email:', email);

    // Simulated auth success hook for UI feedback
    if (window.App) {
      window.App.showToast(`Logged in successfully as ${email}`, 'success');
    }
    this.closeAuthModal();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Initialized on view display
});

window.ProfileModule = ProfileModule;
