/**
 * Smart Agriculture Copilot - Firebase Authentication Module
 * 
 * Manages user registration, login, logout, session persistence, and auth state
 * using Firebase Web SDK (v10 compat).
 */

const firebaseConfig = {
  apiKey: "AIzaSyBnFARC4YlN_AZybr0KfUM3NYpBKlnhIZs",
  authDomain: "smart-agriculture-copilot.firebaseapp.com",
  projectId: "smart-agriculture-copilot",
  storageBucket: "smart-agriculture-copilot.firebasestorage.app",
  messagingSenderId: "225816518526",
  appId: "1:225816518526:web:9a537c7e0c7129e6b95d2f",
  measurementId: "G-04VQPNR9RD"
};

const AuthModule = {
  auth: null,
  currentUser: null,
  authStateReady: false,
  _listeners: [],

  /**
   * Initialize Firebase App and Auth service
   */
  init() {
    try {
      if (typeof firebase === 'undefined') {
        console.error('[AuthModule] Firebase Web SDK is not loaded. Please check script tags in index.html.');
        return;
      }

      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('[AuthModule] Firebase App initialized.');
      }

      this.auth = firebase.auth();

      // Listen to authentication state changes (Single Source of Truth)
      this.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        this.authStateReady = true;
        console.log('[AuthModule] Auth state changed:', user ? `Logged in (${user.email})` : 'Logged out');

        // Notify all registered subscribers
        this._notifyListeners(user);
      });

    } catch (error) {
      console.error('[AuthModule] Initialization error:', error);
    }
  },

  /**
   * Subscribe to auth state updates
   * @param {Function} callback function(user)
   */
  onAuthStateChanged(callback) {
    if (typeof callback === 'function') {
      this._listeners.push(callback);
      if (this.authStateReady) {
        callback(this.currentUser);
      }
    }
  },

  _notifyListeners(user) {
    this._listeners.forEach((listener) => {
      try {
        listener(user);
      } catch (err) {
        console.error('[AuthModule] Listener callback error:', err);
      }
    });
  },

  /**
   * Get current authenticated user
   * @returns {Object|null} Firebase User
   */
  getCurrentUser() {
    return this.auth ? this.auth.currentUser : null;
  },

  /**
   * Check if user is currently logged in
   * @returns {boolean}
   */
  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  /**
   * Set whether Firebase should keep the session after the browser closes.
   * Firebase auth configuration stays in this module; no provider secrets are
   * sent to the UI or to the backend diagnosis API.
   */
  async setPersistence(rememberMe = true) {
    if (!this.auth || !firebase.auth || !firebase.auth.Auth) return;
    const persistence = rememberMe
      ? firebase.auth.Auth.Persistence.LOCAL
      : firebase.auth.Auth.Persistence.SESSION;
    await this.auth.setPersistence(persistence);
  },

  /**
   * Register a new farmer account
   * @param {string} name 
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} Firebase UserCredential
   */
  async register(name, email, password) {
    if (!this.auth) {
      throw new Error(this.getFriendlyErrorMessage({ code: 'auth/initialization-failed' }));
    }

    const cleanEmail = (email || '').trim();
    const cleanPassword = (password || '').trim();
    const cleanName = (name || '').trim();

    if (!cleanEmail) {
      throw new Error(this.getFriendlyErrorMessage({ code: 'auth/missing-email' }));
    }
    if (!cleanPassword) {
      throw new Error(this.getFriendlyErrorMessage({ code: 'auth/missing-password' }));
    }
    if (cleanPassword.length < 6) {
      throw new Error(this.getFriendlyErrorMessage({ code: 'auth/weak-password' }));
    }

    try {
      const userCredential = await this.auth.createUserWithEmailAndPassword(cleanEmail, cleanPassword);
      
      // Update display name if provided
      if (cleanName && userCredential.user && typeof userCredential.user.updateProfile === 'function') {
        try {
          await userCredential.user.updateProfile({
            displayName: cleanName
          });
        } catch (profileErr) {
          console.warn('[AuthModule] Error setting user display name:', profileErr);
        }
      }

      return userCredential;
    } catch (error) {
      console.error('[AuthModule] Registration error:', error.code, error.message);
      throw new Error(this.getFriendlyErrorMessage(error));
    }
  },

  /**
   * Sign in an existing farmer
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} Firebase UserCredential
   */
  async login(email, password) {
    if (!this.auth) {
      throw new Error(this.getFriendlyErrorMessage({ code: 'auth/initialization-failed' }));
    }

    const cleanEmail = (email || '').trim();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail) {
      throw new Error(this.getFriendlyErrorMessage({ code: 'auth/missing-email' }));
    }
    if (!cleanPassword) {
      throw new Error(this.getFriendlyErrorMessage({ code: 'auth/missing-password' }));
    }

    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(cleanEmail, cleanPassword);
      return userCredential;
    } catch (error) {
      console.error('[AuthModule] Login error:', error.code, error.message);
      throw new Error(this.getFriendlyErrorMessage(error));
    }
  },

  /**
   * Get an instance of Firebase GoogleAuthProvider
   * @returns {Object|null}
   */
  getGoogleProvider() {
    if (typeof firebase === 'undefined' || !firebase.auth || !firebase.auth.GoogleAuthProvider) {
      return null;
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return provider;
  },

  /**
   * Sign in using Firebase Google Sign-In popup
   * @returns {Promise<Object>} Firebase UserCredential
   */
  async loginWithGoogle() {
    if (!this.auth) {
      throw new Error(this.getFriendlyErrorMessage({ code: 'auth/initialization-failed' }));
    }

    const provider = this.getGoogleProvider();
    if (!provider) {
      throw new Error(this.getFriendlyErrorMessage({ code: 'auth/google-provider-not-found' }));
    }

    try {
      const userCredential = await this.auth.signInWithPopup(provider);
      return userCredential;
    } catch (error) {
      console.error('[AuthModule] Google Sign-In error:', error.code, error.message);
      throw new Error(this.getFriendlyErrorMessage(error));
    }
  },

  /**
   * Send Firebase's password reset email for the sign-in form.
   */
  async sendPasswordReset(email) {
    if (!this.auth) {
      throw new Error(this.getFriendlyErrorMessage({ code: 'auth/initialization-failed' }));
    }
    const cleanEmail = (email || '').trim();
    if (!cleanEmail) {
      throw new Error(this.getFriendlyErrorMessage({ code: 'auth/missing-email' }));
    }
    try {
      await this.auth.sendPasswordResetEmail(cleanEmail);
    } catch (error) {
      console.error('[AuthModule] Password reset error:', error.code, error.message);
      throw new Error(this.getFriendlyErrorMessage(error));
    }
  },

  /**
   * Safely sign out the current user
   * @returns {Promise<void>}
   */
  async logout() {
    if (!this.auth) return;
    try {
      await this.auth.signOut();
      console.log('[AuthModule] User signed out successfully.');
    } catch (error) {
      console.error('[AuthModule] Logout error:', error);
      throw new Error(this.getFriendlyErrorMessage(error));
    }
  },

  /**
   * Update current farmer's display name
   * @param {string} newName 
   * @returns {Promise<void>}
   */
  async updateDisplayName(newName) {
    const user = this.getCurrentUser();
    if (user && typeof user.updateProfile === 'function') {
      await user.updateProfile({
        displayName: (newName || '').trim()
      });
      // Force trigger state listeners with updated user object
      this._notifyListeners(this.auth.currentUser);
    }
  },

  /**
   * Map Firebase error codes to farmer-friendly localized messages.
   * Never expose raw Firebase objects or internal stack traces to users.
   * @param {Object} error 
   * @returns {string} Farmer friendly message
   */
  getFriendlyErrorMessage(error) {
    const code = error ? error.code : '';
    const lang = (window.i18n && typeof window.i18n.t === 'function') ? window.i18n : null;
    const t = (key, fallback) => lang ? lang.t(key) : fallback;

    switch (code) {
      case 'auth/invalid-email':
      case 'auth/missing-email':
        return t('validation.invalidEmail', 'Please enter a valid email address.');

      case 'auth/weak-password':
      case 'auth/missing-password':
        return t('validation.weakPassword', 'Password must be at least 6 characters.');

      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
      case 'auth/invalid-login-credentials':
        return t('validation.wrongPassword', 'Email or password is incorrect.');

      case 'auth/email-already-in-use':
        return t('validation.emailInUse', 'This email is already registered.');

      case 'auth/popup-closed-by-user':
        return t('validation.popupClosed', 'Sign in popup was closed before completing. Please try again.');

      case 'auth/cancelled-popup-request':
        return t('validation.popupCancelled', 'Sign in popup request was cancelled. Please try again.');

      case 'auth/popup-blocked':
        return t('validation.popupBlocked', 'Sign in popup was blocked by your browser. Please allow popups for this site and try again.');

      case 'auth/account-exists-with-different-credential':
        return t('validation.accountExistsDifferentCredential', 'An account already exists with the same email using a different sign-in method.');

      case 'auth/unauthorized-domain':
        return t('validation.unauthorizedDomain', 'This domain is not authorized for OAuth sign-in. Please contact support.');

      case 'auth/google-provider-not-found':
        return t('validation.googleProviderNotFound', 'Google Sign-In is temporarily unavailable. Please try again.');

      case 'auth/network-request-failed':
        return t('validation.network', 'Unable to connect. Please check your internet connection and try again.');

      case 'auth/too-many-requests':
        return t('authStatus.tooMany', 'Too many attempts. Please wait a moment and try again.');

      case 'auth/user-disabled':
        return t('authStatus.disabled', 'This account has been deactivated. Please contact support.');

      case 'auth/operation-not-allowed':
        return t('authStatus.notAllowed', 'Sign in method is not enabled in Firebase.');

      default:
        return t('validation.default', 'Something went wrong. Please try again.');
    }
  }
};

// Initialize on script execution or DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AuthModule.init());
} else {
  AuthModule.init();
}

window.AuthModule = AuthModule;
