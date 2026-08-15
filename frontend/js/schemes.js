/**
 * Smart Agriculture Copilot - Government Schemes Module
 * 
 * Official directory derived from myScheme / Ministry of Agriculture & Farmers Welfare.
 * Features search, multi-faceted filtering, personalized farm profile recommendations,
 * verified scheme details, interactive eligibility self-check, and direct official links.
 */

const SchemesModule = {
  cacheStorageKey: 'haritkranti_schemes_cache',
  schemes: [],
  categories: [],
  activeCategory: 'all',
  activeLevel: 'all', // 'all' | 'central' | 'state'
  activeState: 'all',
  searchQuery: '',
  activeScheme: null,
  isInitialized: false,
  debounceTimer: null,

  t(key, params = {}) {
    return window.i18n && typeof window.i18n.t === 'function'
      ? window.i18n.t(key, params)
      : key;
  },

  async initView() {
    this.setupEventListeners();
    await this.loadCategories();
    await this.loadSchemes();
  },

  setupEventListeners() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Search Input with 300ms Debounce
    const searchInput = document.getElementById('schemes-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.searchQuery = e.target.value;
          this.loadSchemes();
        }, 300);
      });
    }

    // Level Filter Tabs (All, Central, State)
    document.querySelectorAll('.scheme-level-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.scheme-level-tab').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeLevel = e.currentTarget.dataset.level;
        this.loadSchemes();
      });
    });

    // State Selector Dropdown
    document.getElementById('schemes-state-select')?.addEventListener('change', (e) => {
      this.activeState = e.target.value;
      this.loadSchemes();
    });

    // Modal Close Buttons
    document.getElementById('modal-scheme-close')?.addEventListener('click', () => this.closeDetailsModal());
    document.getElementById('modal-scheme-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-scheme-overlay') this.closeDetailsModal();
    });

    document.getElementById('modal-eligibility-close')?.addEventListener('click', () => this.closeEligibilityModal());
    document.getElementById('modal-eligibility-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-eligibility-overlay') this.closeEligibilityModal();
    });

    // Eligibility Form Submission
    document.getElementById('scheme-eligibility-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.evaluateEligibility();
    });

    // Refresh & Retry
    document.getElementById('btn-schemes-refresh')?.addEventListener('click', () => this.loadSchemes());
    document.getElementById('btn-schemes-retry')?.addEventListener('click', () => this.loadSchemes());
  },

  async loadCategories() {
    try {
      if (window.SmartAgAPI) {
        this.categories = await window.SmartAgAPI.getSchemeCategories();
      }
    } catch (e) {
      console.warn('[SchemesModule] Using fallback categories');
      this.categories = [
        { id: "financial_support", name: "Farmer Financial Support", icon: "₹" },
        { id: "crop_insurance", name: "Crop Insurance", icon: "🛡️" },
        { id: "irrigation", name: "Irrigation & Water", icon: "💧" },
        { id: "farm_machinery", name: "Farm Machinery & Tools", icon: "🚜" },
        { id: "soil_fertilizer", name: "Soil & Fertilizer", icon: "🌱" },
        { id: "credit_loans", name: "Credit & Loans", icon: "💳" },
        { id: "horticulture", name: "Horticulture & Organic", icon: "🍎" }
      ];
    }
    this.renderCategoryChips();
  },

  renderCategoryChips() {
    const container = document.getElementById('schemes-category-chips');
    if (!container) return;

    let html = `
      <button type="button" class="scheme-cat-chip ${this.activeCategory === 'all' ? 'active' : ''}" data-cat="all">
        <span>⭐</span> ${this.t('schemes.allCategories')}
      </button>
    `;

    this.categories.forEach(cat => {
      html += `
        <button type="button" class="scheme-cat-chip ${this.activeCategory === cat.name ? 'active' : ''}" data-cat="${cat.name}">
          <span>${cat.icon || '🌱'}</span> ${cat.name}
        </button>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.scheme-cat-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        container.querySelectorAll('.scheme-cat-chip').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeCategory = e.currentTarget.dataset.cat;
        this.loadSchemes();
      });
    });
  },

  async loadSchemes() {
    this.setLoadingState(true);
    this.hideErrorState();

    try {
      const params = {};
      if (this.searchQuery) params.q = this.searchQuery;
      if (this.activeCategory && this.activeCategory !== 'all') params.category = this.activeCategory;
      if (this.activeLevel && this.activeLevel !== 'all') params.level = this.activeLevel;
      if (this.activeState && this.activeState !== 'all') params.state = this.activeState;

      const schemes = await window.SmartAgAPI.getGovernmentSchemes(params);
      this.schemes = schemes;

      // Cache locally for offline availability
      this.cacheSchemes(schemes);

      this.renderPersonalizedSection();
      this.renderSchemesGrid();
      this.setLoadingState(false);
      this.updateOfflineBanner(false);
    } catch (err) {
      console.error('[SchemesModule] Failed to fetch schemes:', err);
      const cached = this.getCachedSchemes();
      if (cached && cached.length > 0) {
        this.schemes = cached;
        this.renderPersonalizedSection();
        this.renderSchemesGrid();
        this.setLoadingState(false);
        this.updateOfflineBanner(true);
      } else {
        this.setLoadingState(false);
        this.showErrorState();
      }
    }
  },

  cacheSchemes(schemes) {
    try {
      localStorage.setItem(this.cacheStorageKey, JSON.stringify({
        data: schemes,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {}
  },

  getCachedSchemes() {
    try {
      const cache = JSON.parse(localStorage.getItem(this.cacheStorageKey) || 'null');
      return cache ? cache.data : null;
    } catch (e) {
      return null;
    }
  },

  updateOfflineBanner(isOffline) {
    const banner = document.getElementById('schemes-offline-banner');
    if (banner) banner.classList.toggle('hidden', !isOffline);
  },

  renderPersonalizedSection() {
    const container = document.getElementById('schemes-personalized-container');
    const wrapper = document.getElementById('schemes-personalized-section');
    if (!container || !wrapper) return;

    let userCrop = '';
    let userLocation = '';
    try {
      const userProf = JSON.parse(localStorage.getItem('haritkranti_farmer_profile') || '{}');
      userCrop = userProf.crop || '';
      userLocation = userProf.location || '';
    } catch (e) {}

    if (!userCrop && !userLocation) {
      wrapper.classList.add('hidden');
      return;
    }

    const matched = this.schemes.filter(s => {
      const cropMatch = userCrop && s.applicableCrops.some(c => c.toLowerCase().includes(userCrop.toLowerCase()) || userCrop.toLowerCase().includes(c.toLowerCase()));
      const stateMatch = userLocation && (s.state === 'All India' || userLocation.toLowerCase().includes(s.state.toLowerCase()));
      return cropMatch || (stateMatch && s.level === 'State');
    });

    if (matched.length === 0) {
      wrapper.classList.add('hidden');
      return;
    }

    wrapper.classList.remove('hidden');
    container.innerHTML = matched.slice(0, 2).map(s => this.generateSchemeCardHtml(s, true)).join('');
    this.attachCardEventListeners(container);
  },

  renderSchemesGrid() {
    const grid = document.getElementById('schemes-grid');
    const emptyBox = document.getElementById('schemes-empty-box');
    const countBadge = document.getElementById('schemes-count-badge');

    if (!grid) return;

    if (countBadge) {
      countBadge.textContent = `${this.schemes.length} ${this.schemes.length === 1 ? 'Scheme' : 'Schemes'}`;
    }

    if (this.schemes.length === 0) {
      grid.innerHTML = '';
      if (emptyBox) emptyBox.classList.remove('hidden');
      return;
    }

    if (emptyBox) emptyBox.classList.add('hidden');
    grid.innerHTML = this.schemes.map(s => this.generateSchemeCardHtml(s, false)).join('');
    this.attachCardEventListeners(grid);
  },

  generateSchemeCardHtml(scheme, isRecommended = false) {
    const levelClass = scheme.level === 'Central' ? 'badge-central' : 'badge-state';
    const firstBenefit = (scheme.benefits && scheme.benefits[0]) || scheme.description;
    const maxSubsidy = scheme.maxSubsidyAmount ? `<div class="card-subsidy-highlight"><strong>Benefit:</strong> ${scheme.maxSubsidyAmount}</div>` : '';

    return `
      <article class="scheme-card ${isRecommended ? 'scheme-card-recommended' : ''}" data-scheme-id="${scheme.id}">
        <div class="scheme-card-header">
          <div class="scheme-badges">
            <span class="badge ${levelClass}">${scheme.level} Govt</span>
            <span class="badge badge-category">${scheme.category}</span>
            ${scheme.state !== 'All India' ? `<span class="badge badge-region">${scheme.state}</span>` : ''}
          </div>
          ${isRecommended ? `<span class="recommended-tag"><span aria-hidden="true">&#9733;</span> ${this.t('schemes.mayBeRelevant')}</span>` : ''}
        </div>
        <h3 class="scheme-card-title">${scheme.name}</h3>
        <p class="scheme-card-desc">${scheme.description}</p>
        ${maxSubsidy}
        <div class="scheme-key-benefit">
          <span class="benefit-check" aria-hidden="true">&#10003;</span>
          <small>${firstBenefit}</small>
        </div>
        <div class="scheme-card-actions">
          <button type="button" class="btn btn-outline btn-compact btn-view-scheme" data-id="${scheme.id}">
            ${this.t('schemes.viewDetails')}
          </button>
          <button type="button" class="btn btn-secondary btn-compact btn-check-eligibility" data-id="${scheme.id}">
            ${this.t('schemes.checkEligibility')}
          </button>
          <a href="${scheme.officialUrl}" target="_blank" rel="noopener noreferrer" class="btn-link-official" title="Visit official government portal">
            ${this.t('schemes.officialWebsite')}
          </a>
        </div>
      </article>
    `;
  },

  attachCardEventListeners(parentEl) {
    parentEl.querySelectorAll('.btn-view-scheme').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.openDetailsModal(id);
      });
    });

    parentEl.querySelectorAll('.btn-check-eligibility').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.openEligibilityModal(id);
      });
    });
  },

  async openDetailsModal(schemeId) {
    try {
      const scheme = await window.SmartAgAPI.getSchemeById(schemeId);
      this.activeScheme = scheme;

      const modal = document.getElementById('modal-scheme-overlay');
      const titleEl = document.getElementById('modal-scheme-title');
      const bodyEl = document.getElementById('modal-scheme-body');
      if (!modal || !bodyEl) return;

      if (titleEl) titleEl.textContent = scheme.name;

      bodyEl.innerHTML = `
        <div class="scheme-detail-badges">
          <span class="badge ${scheme.level === 'Central' ? 'badge-central' : 'badge-state'}">${scheme.level} Govt</span>
          <span class="badge badge-category">${scheme.category}</span>
          <span class="badge badge-region">${scheme.state}</span>
          ${scheme.maxSubsidyAmount ? `<span class="badge badge-subsidy">${scheme.maxSubsidyAmount}</span>` : ''}
        </div>

        <section class="scheme-detail-block">
          <h4>${this.t('schemes.modalOverview')}</h4>
          <p>${scheme.description}</p>
        </section>

        <section class="scheme-detail-block">
          <h4>${this.t('schemes.modalBenefits')}</h4>
          <ul class="detail-bullets">
            ${scheme.benefits.map(b => `<li><strong>•</strong> <span>${b}</span></li>`).join('')}
          </ul>
        </section>

        <section class="scheme-detail-block">
          <h4>${this.t('schemes.modalEligibility')}</h4>
          <ul class="detail-bullets">
            ${scheme.eligibility.map(e => `<li><strong>•</strong> <span>${e}</span></li>`).join('')}
          </ul>
        </section>

        <section class="scheme-detail-block">
          <h4>${this.t('schemes.modalDocuments')}</h4>
          <ul class="doc-checklist">
            ${scheme.documentsRequired.map(d => `<li><span class="doc-icon">&#9634;</span> <span>${d}</span></li>`).join('')}
          </ul>
        </section>

        <section class="scheme-detail-block">
          <h4>${this.t('schemes.modalApplication')}</h4>
          <ol class="step-list">
            ${scheme.applicationProcess.map((step, i) => `<li><span class="step-num">${i + 1}</span> <span>${step}</span></li>`).join('')}
          </ol>
        </section>

        <div class="scheme-detail-footer">
          <div class="verified-tag">
            <span aria-hidden="true">&#10003;</span>
            <span>${this.t('schemes.sourceLabel')}</span>
          </div>
          <div class="modal-cta-row">
            <button type="button" class="btn btn-secondary" id="btn-modal-start-eligibility" data-id="${scheme.id}">
              ${this.t('schemes.checkEligibility')}
            </button>
            <a href="${scheme.officialUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
              ${this.t('schemes.btnProceedOfficial')} <span aria-hidden="true">&#8599;</span>
            </a>
          </div>
        </div>
      `;

      document.getElementById('btn-modal-start-eligibility')?.addEventListener('click', () => {
        this.closeDetailsModal();
        this.openEligibilityModal(schemeId);
      });

      modal.classList.add('active');
      document.body.classList.add('modal-open');
    } catch (err) {
      console.error('[SchemesModule] Error opening scheme details:', err);
    }
  },

  closeDetailsModal() {
    const modal = document.getElementById('modal-scheme-overlay');
    if (modal) modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  },

  openEligibilityModal(schemeId) {
    const scheme = this.schemes.find(s => s.id === schemeId) || this.activeScheme;
    if (!scheme) return;
    this.activeScheme = scheme;

    const modal = document.getElementById('modal-eligibility-overlay');
    const schemeNameEl = document.getElementById('eligibility-scheme-name');
    const resultBox = document.getElementById('eligibility-result-box');
    const formBox = document.getElementById('scheme-eligibility-form');

    if (schemeNameEl) schemeNameEl.textContent = scheme.name;
    if (resultBox) resultBox.classList.add('hidden');
    if (formBox) formBox.classList.remove('hidden');

    if (modal) {
      modal.classList.add('active');
      document.body.classList.add('modal-open');
    }
  },

  closeEligibilityModal() {
    const modal = document.getElementById('modal-eligibility-overlay');
    if (modal) modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  },

  async evaluateEligibility() {
    if (!this.activeScheme) return;

    const isLandowner = document.querySelector('input[name="q_land"]:checked')?.value === 'yes';
    const hasAadhaar = document.querySelector('input[name="q_aadhaar"]:checked')?.value === 'yes';
    const hasBank = document.querySelector('input[name="q_bank"]:checked')?.value === 'yes';
    const isTaxPayer = document.querySelector('input[name="q_tax"]:checked')?.value === 'yes';
    const hasWater = document.querySelector('input[name="q_water"]:checked')?.value === 'yes';

    const answers = {
      isLandowner,
      hasAadhaar,
      hasBankAccount: hasBank,
      isIncomeTaxPayer: isTaxPayer,
      hasWaterSource: hasWater,
      state: this.activeState !== 'all' ? this.activeState : 'Maharashtra'
    };

    try {
      const res = await window.SmartAgAPI.checkSchemeEligibility(this.activeScheme.id, answers);
      this.renderEligibilityResult(res);
    } catch (err) {
      console.error('[SchemesModule] Eligibility check error:', err);
    }
  },

  renderEligibilityResult(result) {
    const formBox = document.getElementById('scheme-eligibility-form');
    const resultBox = document.getElementById('eligibility-result-box');
    if (!resultBox) return;

    if (formBox) formBox.classList.add('hidden');
    resultBox.classList.remove('hidden');

    const isEligible = result.eligible;
    const statusClass = isEligible ? 'eligibility-success' : 'eligibility-warning';

    resultBox.innerHTML = `
      <div class="eligibility-status-banner ${statusClass}">
        <div class="status-icon">${isEligible ? '&#10003;' : '&#9888;'}</div>
        <div>
          <h4>${result.statusText}</h4>
          <p>${result.recommendation}</p>
        </div>
      </div>

      ${result.matchedCriteria && result.matchedCriteria.length > 0 ? `
        <div class="eligibility-criteria-list">
          <h5>${this.t('schemes.matchedHeader')}</h5>
          <ul>
            ${result.matchedCriteria.map(m => `<li class="criteria-matched"><span aria-hidden="true">&#10003;</span> <span>${m}</span></li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${result.unmatchedCriteria && result.unmatchedCriteria.length > 0 ? `
        <div class="eligibility-criteria-list">
          <h5>${this.t('schemes.unmatchedHeader')}</h5>
          <ul>
            ${result.unmatchedCriteria.map(u => `<li class="criteria-unmatched"><span aria-hidden="true">&#9888;</span> <span>${u}</span></li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="eligibility-actions">
        <button type="button" class="btn btn-outline" id="btn-eligibility-recheck">
          ${this.t('common.retry')}
        </button>
        <a href="${result.officialUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
          ${this.t('schemes.btnProceedOfficial')} <span aria-hidden="true">&#8599;</span>
        </a>
      </div>
    `;

    document.getElementById('btn-eligibility-recheck')?.addEventListener('click', () => {
      if (formBox) formBox.classList.remove('hidden');
      resultBox.classList.add('hidden');
    });
  },

  setLoadingState(isLoading) {
    const loader = document.getElementById('schemes-loading-skeleton');
    const content = document.getElementById('schemes-main-content');
    if (loader) loader.classList.toggle('hidden', !isLoading);
    if (content) content.classList.toggle('hidden', isLoading);
  },

  showErrorState() {
    const errBox = document.getElementById('schemes-error-box');
    const content = document.getElementById('schemes-main-content');
    if (errBox) errBox.classList.remove('hidden');
    if (content) content.classList.add('hidden');
  },

  hideErrorState() {
    const errBox = document.getElementById('schemes-error-box');
    if (errBox) errBox.classList.add('hidden');
  },

  refreshTranslations() {
    if (this.schemes && this.schemes.length > 0) {
      this.renderPersonalizedSection();
      this.renderSchemesGrid();
      this.renderCategoryChips();
    }
  }
};

window.SchemesModule = SchemesModule;
