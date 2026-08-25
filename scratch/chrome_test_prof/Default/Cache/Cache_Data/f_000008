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
  authMode: 'login', // Single Source of Truth: 'login' | 'register'
  currentMode: 'login',
  initialized: false,

  t(key, fallback = '') {
    return window.i18n ? window.i18n.t(key, {}, fallback) : fallback;
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
      authSwitchLink.addEventListener('click', () => {
        const nextMode = (this.authMode === 'login') ? 'register' : 'login';
        this.setAuthMode(nextMode);
      });
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

    const confirmPasswordToggle = document.getElementById('btn-toggle-confirm-password');
    if (confirmPasswordToggle) {
      confirmPasswordToggle.addEventListener('click', () => {
        const confirmInput = document.getElementById('auth-confirm-password');
        if (!confirmInput) return;
        const showing = confirmInput.type === 'text';
        confirmInput.type = showing ? 'password' : 'text';
        confirmPasswordToggle.textContent = showing ? this.t('auth.show', 'Show') : this.t('auth.hide', 'Hide');
        confirmPasswordToggle.setAttribute('aria-label', showing ? this.t('auth.show', 'Show password') : this.t('auth.hide', 'Hide password'));
      });
    }

    const forgotPassword = document.getElementById('btn-forgot-password');
    if (forgotPassword) forgotPassword.addEventListener('click', () => this.handleForgotPassword());

    // Google Sign-In button handler
    const btnGoogle = document.getElementById('btn-google-auth');
    if (btnGoogle) {
      btnGoogle.addEventListener('click', () => this.handleGoogleSignIn());
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

  renderAppStatus() {
    const bridgeStatus = document.getElementById('status-bridge-text');
    if (bridgeStatus) {
      const isAndroidBridge = !!(window.SmartAgAndroidBridge || window.AndroidBridge);
      bridgeStatus.innerText = isAndroidBridge
        ? this.t('profile.bridgeAvailable', 'Available (Android app)')
        : this.t('profile.bridgeUnavailable', 'Unavailable (standard browser)');
    }

    const netStatus = document.getElementById('status-net-text');
    if (netStatus) {
      netStatus.innerText = navigator.onLine 
        ? this.t('common.online', 'Online') 
        : this.t('common.offline', 'Offline');
    }
  },

  saveProfile() {
    const name = document.getElementById('profile-name')?.value?.trim() || '';
    const phone = document.getElementById('profile-phone')?.value?.trim() || '';
    const crop = document.getElementById('profile-crop')?.value?.trim() || '';
    const location = document.getElementById('profile-location')?.value?.trim() || '';

    this.profileData = { name, phone, crop, location };
    localStorage.setItem('smart_ag_profile', JSON.stringify(this.profileData));

    // Update display name across UI
    const displayFarmerName = document.getElementById('display-farmer-name');
    if (displayFarmerName && name) {
      displayFarmerName.innerText = name;
    }

    // Sync display name with Firebase auth user profile if logged in
    if (window.AuthModule && window.AuthModule.isLoggedIn() && name) {
      window.AuthModule.updateDisplayName(name).catch((err) => {
        console.warn('[ProfileModule] Could not sync display name with Firebase:', err);
      });
    }

    if (window.App) {
      window.App.showToast(this.t('profile.saved', 'Profile updated successfully.'), 'success');
      window.App.syncUserUI({ displayName: name });
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
      errBox.style.display = 'none';
    }
  },

  showAuthError(message) {
    const errBox = document.getElementById('auth-error-msg');
    if (errBox) {
      errBox.innerText = message;
      errBox.classList.add('active');
      errBox.style.display = 'block';
    }
  },

  /**
   * Set Authentication Mode (Single Source of Truth)
   * @param {string} mode 'login' | 'register'
   */
  setAuthMode(mode) {
    this.authMode = (mode === 'register') ? 'register' : 'login';
    this.currentMode = this.authMode;
    this.renderAuthMode();
  },

  switchAuthTab(mode) {
    this.setAuthMode(mode || (this.authMode === 'login' ? 'register' : 'login'));
  },

  refreshAuthCopy() {
    this.renderAuthMode();
  },

  /**
   * Unconditionally render DOM elements, styles, classes, and copies based on authMode
   */
  renderAuthMode() {
    const isRegister = (this.authMode === 'register');
    this.currentMode = this.authMode;
    this.clearAuthErrors();

    const authScreen = document.getElementById('auth-screen');
    const authForm = document.getElementById('auth-form');
    const nameGroup = document.getElementById('auth-name-group');
    const emailGroup = document.getElementById('auth-email-group');
    const passGroup = document.getElementById('auth-password-group');
    const confirmGroup = document.getElementById('auth-confirm-group');
    const loginOptions = document.getElementById('auth-login-options');
    const modalTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const btnSubmit = document.getElementById('btn-auth-submit');
    const switchCopy = document.getElementById('auth-switch-copy');
    const switchLink = document.getElementById('auth-switch-link');

    // 1. Synchronize mode classes on root containers
    if (authScreen) {
      authScreen.classList.toggle('mode-register', isRegister);
      authScreen.classList.toggle('mode-login', !isRegister);
    }
    if (authForm) {
      authForm.classList.toggle('mode-register', isRegister);
      authForm.classList.toggle('mode-login', !isRegister);
    }

    // 2. Explicitly toggle visibility and remove any blocking classes
    if (nameGroup) {
      if (isRegister) {
        nameGroup.classList.remove('is-hidden', 'hidden');
        nameGroup.removeAttribute('hidden');
        nameGroup.style.setProperty('display', 'block', 'important');
      } else {
        nameGroup.classList.add('is-hidden');
        nameGroup.style.setProperty('display', 'none', 'important');
      }
    }

    if (emailGroup) {
      emailGroup.classList.remove('is-hidden', 'hidden');
      emailGroup.removeAttribute('hidden');
      emailGroup.style.setProperty('display', 'block', 'important');
    }

    if (passGroup) {
      passGroup.classList.remove('is-hidden', 'hidden');
      passGroup.removeAttribute('hidden');
      passGroup.style.setProperty('display', 'block', 'important');
    }

    if (confirmGroup) {
      if (isRegister) {
        confirmGroup.classList.remove('is-hidden', 'hidden');
        confirmGroup.removeAttribute('hidden');
        confirmGroup.style.setProperty('display', 'block', 'important');
      } else {
        confirmGroup.classList.add('is-hidden');
        confirmGroup.style.setProperty('display', 'none', 'important');
      }
    }

    if (loginOptions) {
      if (isRegister) {
        loginOptions.classList.add('is-hidden');
        loginOptions.style.setProperty('display', 'none', 'important');
      } else {
        loginOptions.classList.remove('is-hidden', 'hidden');
        loginOptions.removeAttribute('hidden');
        loginOptions.style.setProperty('display', 'flex', 'important');
      }
    }

    // 3. Reset password field input types to 'password' and toggle text to 'Show'
    const passInput = document.getElementById('auth-password');
    const confirmPassInput = document.getElementById('auth-confirm-password');
    const togglePass = document.getElementById('btn-toggle-password');
    const toggleConfirm = document.getElementById('btn-toggle-confirm-password');
    if (passInput) passInput.type = 'password';
    if (confirmPassInput) confirmPassInput.type = 'password';
    if (togglePass) {
      togglePass.textContent = this.t('auth.show', 'Show');
      togglePass.setAttribute('aria-label', this.t('auth.show', 'Show password'));
    }
    if (toggleConfirm) {
      toggleConfirm.textContent = this.t('auth.show', 'Show');
      toggleConfirm.setAttribute('aria-label', this.t('auth.show', 'Show password'));
    }

    // 4. Update Titles, Subtitles, Buttons, and Switch Links
    if (modalTitle) {
      modalTitle.textContent = isRegister 
        ? this.t('auth.createTitle', 'Create your workspace') 
        : this.t('auth.signInTitle', 'Welcome back');
    }
    if (authSubtitle) {
      authSubtitle.textContent = isRegister 
        ? this.t('auth.createSubtitle', 'Create a secure workspace for your crop insights.') 
        : this.t('auth.signInSubtitle', 'Sign in to continue to your crop intelligence workspace.');
    }
    if (btnSubmit) {
      btnSubmit.textContent = isRegister 
        ? this.t('auth.submitCreate', 'Create account') 
        : this.t('auth.submitSignIn', 'Sign in');
    }
    if (switchCopy) {
      switchCopy.textContent = isRegister 
        ? this.t('auth.alreadyMember', 'Already have an account? ') 
        : this.t('auth.newHere', "Don't have an account? ");
    }
    if (switchLink) {
      switchLink.textContent = isRegister 
        ? this.t('auth.switchSignIn', 'Sign in') 
        : this.t('auth.switchCreate', 'Create account');
    }

    // 5. Update Field Labels & Placeholders
    const labels = [
      ['#auth-name-group .form-label', 'auth.fullName', 'Full Name'],
      ['#auth-email-group .form-label', 'auth.email', 'Email Address'],
      ['#auth-password-group .form-label', 'auth.password', 'Password'],
      ['#auth-confirm-group .form-label', 'auth.confirmPassword', 'Confirm Password']
    ];
    labels.forEach(([selector, key, fallback]) => {
      const el = document.querySelector(selector);
      if (el) el.textContent = this.t(key, fallback);
    });

    const nameInp = document.getElementById('auth-name');
    if (nameInp) nameInp.placeholder = this.t('auth.fullName', 'Full name');
    const emailInp = document.getElementById('auth-email');
    if (emailInp) emailInp.placeholder = this.t('auth.email', 'Email address');
    const passInp = document.getElementById('auth-password');
    if (passInp) passInp.placeholder = this.t('auth.password', 'Password');
    const confirmInp = document.getElementById('auth-confirm-password');
    if (confirmInp) confirmInp.placeholder = this.t('auth.confirmPassword', 'Confirm password');

    const forgotBtn = document.getElementById('btn-forgot-password');
    if (forgotBtn) forgotBtn.textContent = this.t('auth.forgot', 'Forgot password?');
    const rememberSpan = document.querySelector('#auth-remember-label span');
    if (rememberSpan) rememberSpan.textContent = this.t('auth.remember', 'Remember me');
    const legalEl = document.getElementById('auth-legal');
    if (legalEl) legalEl.textContent = this.t('auth.legal', 'By continuing, you agree to use AI guidance alongside local agricultural expertise.');
    const googleText = document.getElementById('btn-google-text');
    if (googleText) googleText.textContent = this.t('auth.continueWithGoogle', 'Continue with Google');
    const dividerSpan = document.querySelector('#auth-divider span');
    if (dividerSpan) dividerSpan.textContent = this.t('auth.orDivider', 'OR');
  },

  /**
   * Execute Firebase Authentication on Form Submit
   */
  async handleAuthSubmit() {
    this.clearAuthErrors();

    const mode = this.authMode || this.currentMode || 'login';
    console.log('[ProfileModule] Executing auth submit in mode:', mode);

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === 'register') {
      if (!name) {
        this.showAuthError(this.t('validation.nameRequired', 'Please enter your full name.'));
        nameInput?.focus();
        return;
      }

      if (!email) {
        this.showAuthError(this.t('validation.missingEmail', 'Please enter your email address.'));
        emailInput?.focus();
        return;
      }

      if (!emailRegex.test(email)) {
        this.showAuthError(this.t('validation.invalidEmail', 'Please enter a valid email address.'));
        emailInput?.focus();
        return;
      }

      if (!password || password.length < 6) {
        this.showAuthError(this.t('validation.weakPassword', 'Password must be at least 6 characters.'));
        passwordInput?.focus();
        return;
      }

      if (!confirmPassword) {
        this.showAuthError(this.t('auth.confirmPasswordRequired', 'Please confirm your password.'));
        confirmInput?.focus();
        return;
      }

      if (password !== confirmPassword) {
        this.showAuthError(this.t('auth.passwordMismatch', 'Passwords do not match. Please check both fields.'));
        confirmInput?.focus();
        return;
      }
    } else {
      // Sign In mode
      if (!email) {
        this.showAuthError(this.t('validation.missingEmail', 'Please enter your email address.'));
        emailInput?.focus();
        return;
      }

      if (!emailRegex.test(email)) {
        this.showAuthError(this.t('validation.invalidEmail', 'Please enter a valid email address.'));
        emailInput?.focus();
        return;
      }

      if (!password) {
        this.showAuthError(this.t('auth.missingPassword', 'Please enter your password.'));
        passwordInput?.focus();
        return;
      }
    }

    const originalBtnText = btnSubmit ? btnSubmit.innerText : '';
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerText = this.t('auth.processing', 'Processing...');
    }

    try {
      if (mode === 'register') {
        const userCred = await window.AuthModule.register(name, email, password);
        console.log('[ProfileModule] Registered user successfully:', userCred?.user?.email);
        if (window.App) {
          window.App.showToast(this.t('authStatus.registerSuccess', 'Account created successfully.'), 'success');
          if (typeof window.App.showAppShell === 'function') {
            window.App.showAppShell(userCred?.user || window.AuthModule.getCurrentUser());
          }
        }
      } else {
        if (window.AuthModule && typeof window.AuthModule.setPersistence === 'function') {
          await window.AuthModule.setPersistence(Boolean(rememberInput && rememberInput.checked));
        }
        const userCred = await window.AuthModule.login(email, password);
        console.log('[ProfileModule] Logged in user successfully:', userCred?.user?.email);
        if (window.App) {
          window.App.showToast(this.t('authStatus.loginSuccess', 'Logged in successfully.'), 'success');
          if (typeof window.App.showAppShell === 'function') {
            window.App.showAppShell(userCred?.user || window.AuthModule.getCurrentUser());
          }
        }
      }

      // Clear input fields
      if (emailInput) emailInput.value = '';
      if (passwordInput) passwordInput.value = '';
      if (nameInput) nameInput.value = '';
      if (confirmInput) confirmInput.value = '';

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
   * Execute Firebase Google Sign-In
   */
  async handleGoogleSignIn() {
    this.clearAuthErrors();

    const btnGoogle = document.getElementById('btn-google-auth');
    const btnSubmit = document.getElementById('btn-auth-submit');
    const rememberInput = document.getElementById('auth-remember');
    const googleTextSpan = document.getElementById('btn-google-text');

    const originalGoogleText = googleTextSpan ? googleTextSpan.textContent : '';

    if (btnGoogle) {
      btnGoogle.disabled = true;
    }
    if (btnSubmit) {
      btnSubmit.disabled = true;
    }
    if (googleTextSpan) {
      googleTextSpan.textContent = this.t('auth.processing', 'Processing...');
    }

    try {
      if (window.AuthModule && typeof window.AuthModule.setPersistence === 'function') {
        await window.AuthModule.setPersistence(Boolean(!rememberInput || rememberInput.checked));
      }

      if (!window.AuthModule || typeof window.AuthModule.loginWithGoogle !== 'function') {
        throw new Error(this.t('validation.googleProviderNotFound', 'Google Sign-In is temporarily unavailable. Please try again.'));
      }

      const userCred = await window.AuthModule.loginWithGoogle();
      const user = userCred?.user || (window.AuthModule && window.AuthModule.getCurrentUser());
      console.log('[ProfileModule] Logged in with Google successfully:', user?.email);

      // Sync display name if user has one
      if (user && user.displayName && !this.profileData.name) {
        this.profileData.name = user.displayName;
        localStorage.setItem('smart_ag_profile', JSON.stringify(this.profileData));
      }

      if (window.App) {
        window.App.showToast(this.t('authStatus.loginSuccess', 'Logged in successfully.'), 'success');
        if (typeof window.App.showAppShell === 'function') {
          window.App.showAppShell(user || window.AuthModule.getCurrentUser());
        }
      }
    } catch (error) {
      console.error('[ProfileModule] Google Auth error:', error.message);
      this.showAuthError(error.message || this.t('validation.default', 'Something went wrong. Please try again.'));
    } finally {
      if (btnGoogle) {
        btnGoogle.disabled = false;
      }
      if (btnSubmit) {
        btnSubmit.disabled = false;
      }
      if (googleTextSpan && originalGoogleText) {
        googleTextSpan.textContent = originalGoogleText;
      }
    }
  },

  async handleForgotPassword() {
    this.clearAuthErrors();
    const email = document.getElementById('auth-email')?.value?.trim() || '';
    if (!email) {
      this.showAuthError(this.t('auth.resetPrompt', 'Enter your email address first, then choose forgot password.'));
      document.getElementById('auth-email')?.focus();
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

// Initialize immediately and on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ProfileModule.setupEventListeners();
    ProfileModule.renderAuthMode();
  });
} else {
  ProfileModule.setupEventListeners();
  ProfileModule.renderAuthMode();
}

window.ProfileModule = ProfileModule;
