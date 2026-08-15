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

  t(key, fallback = '') {
    return window.i18n ? window.i18n.t(key) : fallback;
  },

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

    const authSwitchLink = document.getElementById('auth-switch-link');
    if (authSwitchLink) {
      authSwitchLink.addEventListener('click', () => this.switchAuthTab(this.currentMode === 'login' ? 'register' : 'login'));
    }

    const passwordToggle = document.getElementById('btn-toggle-password');
    if (passwordToggle) {
      passwordToggle.addEventListener('click', () => {
        const passwordInput = document.getElementById('auth-password');
        if (!passwordInput) return;
        const showing = passwordInput.type === 'text';
        passwordInput.type = showing ? 'password' : 'text';
        passwordToggle.textContent = showing ? this.t('auth.show', 'Show') : this.t('auth.hide', 'Hide');
        passwordToggle.setAttribute('aria-label', showing ? this.t('auth.show', 'Show password') : this.t('auth.hide', 'Hide password'));
      });
    }

    const forgotPassword = document.getElementById('btn-forgot-password');
    if (forgotPassword) forgotPassword.addEventListener('click', () => this.handleForgotPassword());

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
    const btnLogout = document.getElementById('btn-logout-auth');
    const authHint = document.getElementById('auth-status-hint');
    const inputName = document.getElementById('profile-name');

    if (user) {
      const name = user.displayName || this.profileData.name || (user.email ? user.email.split('@')[0] : 'Farmer');
      if (displayName) displayName.innerText = name;
      if (displayEmail) displayEmail.innerText = user.email || '';
      
      if (authBadge) {
        authBadge.classList.remove('logged-out');
        authBadge.innerText = this.t('profile.connected', 'Connected');
      }

      if (btnLogout) {
        btnLogout.style.display = 'block';
      }

      if (authHint) {
        authHint.innerText = this.t('profile.signedIn', 'Signed in as {{email}}. Scans and settings are synchronized.').replace('{{email}}', user.email || '');
      }

      if (inputName && !inputName.value && user.displayName) {
        inputName.value = user.displayName;
      }

    } else {
      const defaultName = 'Guest Farmer';
      if (displayName) displayName.innerText = this.profileData.name || defaultName;
      if (displayEmail) displayEmail.innerText = this.t('profile.signInToSync', 'Not logged in');

      if (authBadge) {
        authBadge.classList.add('logged-out');
        authBadge.innerText = this.t('profile.signInToSync', 'Not logged in');
      }

      if (btnLogout) {
        btnLogout.style.display = 'none';
      }

      if (authHint) {
        authHint.innerText = this.t('profile.signInToSync', 'Sign in to sync records.');
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
      window.App.showToast(this.t('profile.saved', 'Profile information updated successfully.'), 'success');
    }
  },

  renderAppStatus() {
    const statusOnline = document.getElementById('diag-status-online');
    const statusBridge = document.getElementById('diag-status-bridge');

    if (statusOnline) {
      statusOnline.innerText = navigator.onLine ? this.t('profile.connected', 'Connected') : this.t('profile.localMode', 'Offline (local mode)');
    }

    if (statusBridge) {
      const bridgeActive = window.SmartAgBridge && window.SmartAgBridge.isAvailable();
      statusBridge.innerText = bridgeActive ? this.t('profile.bridgeAvailable', 'Available (Android app)') : this.t('profile.bridgeUnavailable', 'Unavailable (standard browser)');
    }
  },

  openAuthModal() {
    this.clearAuthErrors();
    if (window.App) window.App.showAuthScreen('login');
  },

  closeAuthModal() {
    this.clearAuthErrors();
    if (window.App && window.AuthModule && window.AuthModule.isLoggedIn()) {
      window.App.showAppShell(window.AuthModule.getCurrentUser());
    }
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

  refreshAuthCopy() {
    const t = (key, fallback) => this.t(key, fallback);
    const login = this.currentMode === 'login';
    const set = (id, value) => { const element = document.getElementById(id); if (element) element.textContent = value; };
    set('tab-auth-login', t('auth.signIn', 'Sign in'));
    set('tab-auth-register', t('auth.createAccount', 'Create account'));
    set('auth-title', login ? t('auth.signInTitle', 'Welcome back') : t('auth.createTitle', 'Create your workspace'));
    set('auth-subtitle', login ? t('auth.signInSubtitle', 'Sign in to continue to your crop intelligence workspace.') : t('auth.createSubtitle', 'Create a secure workspace for your crop insights.'));
    set('btn-auth-submit', login ? t('auth.submitSignIn', 'Sign in') : t('auth.submitCreate', 'Create account'));
    set('auth-switch-link', login ? t('auth.switchCreate', 'Create an account') : t('auth.switchSignIn', 'Sign in'));
    const switchCopy = document.getElementById('auth-switch-copy');
    if (switchCopy) switchCopy.childNodes[0].textContent = `${login ? t('auth.newHere', 'New to HaritKranti?') : t('auth.alreadyMember', 'Already have an account?')} `;
    set('btn-forgot-password', t('auth.forgot', 'Forgot password?'));
    const remember = document.querySelector('#auth-remember-label span');
    if (remember) remember.textContent = t('auth.remember', 'Remember me');
    const toggle = document.getElementById('btn-toggle-password');
    if (toggle) {
      const showing = document.getElementById('auth-password')?.type === 'text';
      toggle.textContent = showing ? t('auth.hide', 'Hide') : t('auth.show', 'Show');
      toggle.setAttribute('aria-label', showing ? t('auth.hide', 'Hide password') : t('auth.show', 'Show password'));
    }
    const labels = [['auth-name-group .form-label', 'auth.fullName'], ['label[for="auth-email"]', 'auth.email'], ['label[for="auth-password"]', 'auth.password'], ['label[for="auth-confirm-password"]', 'auth.confirmPassword']];
    labels.forEach(([selector, key]) => { const element = document.querySelector(selector); if (element) element.textContent = t(key, ''); });
    const legal = document.getElementById('auth-legal');
    if (legal) legal.textContent = t('auth.legal', 'By continuing, you agree to use AI guidance alongside local agricultural expertise.');
    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');
    if (tabLogin) tabLogin.setAttribute('aria-selected', String(login));
    if (tabRegister) tabRegister.setAttribute('aria-selected', String(!login));
  },

  switchAuthTab(mode) {
    this.currentMode = mode;
    this.clearAuthErrors();

    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');
    const btnSubmit = document.getElementById('btn-auth-submit');
    const nameGroup = document.getElementById('auth-name-group');
    const confirmGroup = document.getElementById('auth-confirm-group');
    const modalTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const switchCopy = document.getElementById('auth-switch-copy');
    const switchLink = document.getElementById('auth-switch-link');
    const loginOptions = document.getElementById('auth-login-options');

    const i18n = window.i18n;

    if (mode === 'login') {
      if (tabLogin) tabLogin.classList.add('active');
      if (tabRegister) tabRegister.classList.remove('active');
      if (btnSubmit) btnSubmit.innerText = this.t('auth.submitSignIn', 'Sign in');
      if (nameGroup) nameGroup.style.display = 'none';
      if (confirmGroup) confirmGroup.style.display = 'none';
      if (loginOptions) loginOptions.style.display = 'flex';
      if (modalTitle) modalTitle.innerText = this.t('auth.signInTitle', 'Welcome back');
    } else {
      if (tabRegister) tabRegister.classList.add('active');
      if (tabLogin) tabLogin.classList.remove('active');
      if (btnSubmit) btnSubmit.innerText = this.t('auth.submitCreate', 'Create account');
      if (nameGroup) nameGroup.style.display = 'block';
      if (confirmGroup) confirmGroup.style.display = 'block';
      if (loginOptions) loginOptions.style.display = 'none';
      if (modalTitle) modalTitle.innerText = this.t('auth.createTitle', 'Create your workspace');
    }
    if (tabLogin) tabLogin.setAttribute('aria-selected', String(mode === 'login'));
    if (tabRegister) tabRegister.setAttribute('aria-selected', String(mode === 'register'));
    this.refreshAuthCopy();
  },

  /**
   * Execute Firebase Authentication on Form Submit
   */
  async handleAuthSubmit() {
    this.clearAuthErrors();

    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const nameInput = document.getElementById('auth-name');
    const confirmInput = document.getElementById('auth-confirm-password');
    const rememberInput = document.getElementById('auth-remember');
    const btnSubmit = document.getElementById('btn-auth-submit');

    const email = emailInput?.value?.trim() || '';
    const password = passwordInput?.value || '';
    const name = nameInput?.value?.trim() || '';
    const confirmPassword = confirmInput?.value || '';

    if (!email) {
      this.showAuthError(this.t('validation.invalidEmail', 'Please enter a valid email address.'));
      return;
    }

    if (!password || password.length < 6) {
      this.showAuthError(this.t('validation.weakPassword', 'Password must be at least 6 characters.'));
      return;
    }

    if (this.currentMode === 'register' && password !== confirmPassword) {
      this.showAuthError(this.t('auth.passwordMismatch', 'Passwords do not match. Please check both fields.'));
      return;
    }

    const originalBtnText = btnSubmit ? btnSubmit.innerText : '';
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerText = this.t('auth.processing', 'Processing...');
    }

    try {
      if (this.currentMode === 'register') {
        await window.AuthModule.register(name, email, password);
        if (window.App) {
          window.App.showToast(this.t('authStatus.registerSuccess', 'Account created successfully.'), 'success');
        }
      } else {
        if (window.AuthModule && typeof window.AuthModule.setPersistence === 'function') {
          await window.AuthModule.setPersistence(Boolean(rememberInput && rememberInput.checked));
        }
        await window.AuthModule.login(email, password);
        if (window.App) {
          window.App.showToast(this.t('authStatus.loginSuccess', 'Logged in successfully.'), 'success');
        }
      }

      // Reset form & close modal
      if (emailInput) emailInput.value = '';
      if (passwordInput) passwordInput.value = '';
      if (nameInput) nameInput.value = '';
      if (confirmInput) confirmInput.value = '';
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

  async handleForgotPassword() {
    this.clearAuthErrors();
    const email = document.getElementById('auth-email')?.value?.trim() || '';
    if (!email) {
      this.showAuthError(this.t('auth.resetPrompt', 'Enter your email address first, then choose forgot password.'));
      return;
    }
    try {
      await window.AuthModule.sendPasswordReset(email);
      if (window.App) window.App.showToast(this.t('auth.resetSent', 'Password reset email sent. Check your inbox.'), 'success');
    } catch (error) {
      this.showAuthError(error.message || this.t('validation.resetUnavailable', 'Unable to send a password reset email.'));
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
        window.App.showToast(this.t('authStatus.logoutSuccess', 'Signed out successfully.'), 'info');
      }
    } catch (err) {
      console.error('[ProfileModule] Sign out error:', err);
      if (window.App) {
        window.App.showToast(this.t('validation.default', 'Something went wrong. Please try again.'), 'error');
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  ProfileModule.setupEventListeners();
});

window.ProfileModule = ProfileModule;
