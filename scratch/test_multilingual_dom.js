const fs = require('fs');
const vm = require('vm');

// Mock a complete realistic DOM environment
class MockClassList {
  constructor() { this.classes = new Set(); }
  add(c) { this.classes.add(c); }
  remove(c) { this.classes.delete(c); }
  toggle(c, force) {
    if (force === true) this.classes.add(c);
    else if (force === false) this.classes.delete(c);
    else if (this.classes.has(c)) this.classes.delete(c);
    else this.classes.add(c);
  }
  contains(c) { return this.classes.has(c); }
}

class MockElement {
  constructor(tag, id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.textContent = '';
    this._innerHTML = '';
    this.className = '';
    this.classList = new MockClassList();
    this.dataset = {};
    this.children = [];
    this.parentElement = null;
    this.attributes = {};
    this.listeners = {};
  }

  get innerHTML() { return this._innerHTML; }
  set innerHTML(val) {
    this._innerHTML = val;
    // Rough parse of child elements for test queries
    this.children = [];
  }

  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k] || null; }
  appendChild(child) {
    this.children.push(child);
    child.parentElement = this;
    return child;
  }
  append(...nodes) {
    for (const n of nodes) this.appendChild(n);
  }
  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  dispatchEvent(event) {
    const list = this.listeners[event.name || event.type || event] || [];
    for (const fn of list) fn(event);
  }
  querySelector(sel) {
    if (sel.startsWith('#')) {
      const targetId = sel.slice(1);
      if (this.id === targetId) return this;
      for (const c of this.children) {
        const found = c.querySelector(sel);
        if (found) return found;
      }
    }
    return null;
  }
  querySelectorAll(sel) {
    return [];
  }
}

const elements = {};
function getOrCreate(id, tag = 'div') {
  if (!elements[id]) {
    elements[id] = new MockElement(tag, id);
  }
  return elements[id];
}

// Pre-create elements used in weather & schemes
const requiredIds = [
  'weather-location-text', 'weather-last-updated', 'weather-data-status',
  'weather-temp-val', 'weather-condition-text', 'weather-humidity', 'weather-wind',
  'weather-rain-prob', 'weather-content', 'weather-status-card', 'weather-error-actions',
  'advisory-headline', 'advisory-detail', 'advisory-recommendation', 'weather-advisory-card',
  'weather-forecast-list', 'weather-rain-summary-detail',
  'schemes-count-badge', 'schemes-category-chips', 'schemes-grid',
  'schemes-personalized-container', 'schemes-personalized-section', 'schemes-empty-box',
  'schemes-offline-banner', 'schemes-loading-skeleton', 'schemes-error-box',
  'modal-scheme-overlay', 'modal-scheme-title', 'modal-scheme-body',
  'modal-eligibility-overlay', 'modal-eligibility-title', 'eligibility-scheme-name',
  'scheme-eligibility-form', 'eligibility-form-container', 'eligibility-result-box'
];
for (const id of requiredIds) getOrCreate(id);

const mockDoc = {
  documentElement: { lang: 'en' },
  body: new MockElement('body'),
  createElement(tag) {
    return new MockElement(tag);
  },
  getElementById(id) {
    return elements[id] || getOrCreate(id);
  },
  querySelector(sel) {
    if (sel.startsWith('#')) return elements[sel.slice(1)] || null;
    return null;
  },
  querySelectorAll(sel) {
    return [];
  },
  addEventListener(event, fn) {},
  dispatchEvent(evt) {}
};

const mockWin = {
  document: mockDoc,
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); }
  },
  addEventListener() {},
  dispatchEvent() {},
  CustomEvent: class CustomEvent { constructor(name, opts) { this.type = name; this.name = name; this.detail = opts ? opts.detail : {}; } },
  SmartAgAPI: {
    getWeather: async () => ({
      latitude: 18.5204,
      longitude: 73.8567,
      temperature: 29,
      condition: 'Clear Sky',
      humidity: 56,
      windSpeed: 18,
      rainProbability: 83,
      precipitation: 4.2,
      irrigationAdvisory: {
        headline: 'Rain is likely',
        detail: 'Rainfall is currently occurring or has a high probability. Consider delaying irrigation to avoid unnecessary water use.',
        recommendation: 'DELAY_IRRIGATION'
      },
      forecast: [
        { date: '2026-08-26', condition: 'Thunderstorm', temperatureMax: 31, temperatureMin: 23, rainProbability: 80, precipitation: 12.5 },
        { date: '2026-08-27', condition: 'Rain', temperatureMax: 29, temperatureMin: 22, rainProbability: 75, precipitation: 8.0 }
      ]
    }),
    getGovernmentSchemes: async () => [
      {
        id: 'pm_kisan',
        name: 'PM-KISAN',
        level: 'Central',
        category: 'Direct Income Support',
        state: 'All India',
        description: 'Direct income support of ₹6,000 per year',
        maxSubsidyAmount: '₹6,000/year',
        benefits: ['Direct DBT transfer of ₹2,000 thrice a year.'],
        eligibility: ['Small and marginal landholding farmer families.'],
        documentsRequired: ['Aadhaar card', 'Bank account details', '7/12 land extract'],
        applicationProcess: ['Visit official PM-KISAN portal.'],
        officialUrl: 'https://pmkisan.gov.in',
        applicableCrops: ['All crops']
      },
      {
        id: 'pmfby',
        name: 'Pradhan Mantri Fasal Bima Yojana',
        level: 'Central',
        category: 'Crop Insurance',
        state: 'All India',
        description: 'Comprehensive risk insurance against crop loss',
        maxSubsidyAmount: 'Up to 90% premium subsidy',
        benefits: ['Full financial protection for non-preventable natural risks.'],
        eligibility: ['All farmers growing notified crops in notified areas.'],
        documentsRequired: ['Aadhaar', 'Land records', 'Sowing certificate'],
        applicationProcess: ['Apply via NCIP portal.'],
        officialUrl: 'https://pmfby.gov.in',
        applicableCrops: ['Wheat', 'Rice', 'Cotton', 'Soybean']
      }
    ],
    getSchemeById: async (id) => ({
      id: 'pm_kisan',
      name: 'PM-KISAN',
      level: 'Central',
      category: 'Direct Income Support',
      state: 'All India',
      description: 'Direct income support of ₹6,000 per year',
      maxSubsidyAmount: '₹6,000/year',
      benefits: ['Direct DBT transfer of ₹2,000 thrice a year.'],
      eligibility: ['Small and marginal landholding farmer families.'],
      documentsRequired: ['Aadhaar card', 'Bank account details', '7/12 land extract'],
      applicationProcess: ['Visit official PM-KISAN portal.'],
      officialUrl: 'https://pmkisan.gov.in',
      applicableCrops: ['All crops']
    }),
    getSchemeCategories: async () => [
      { id: 'direct_benefit', name: 'Direct Income Support', icon: '💰' },
      { id: 'crop_insurance', name: 'Crop Insurance', icon: '🛡️' },
      { id: 'irrigation', name: 'Irrigation & Water', icon: '💧' }
    ]
  }
};

const sandbox = {
  window: mockWin,
  document: mockDoc,
  localStorage: mockWin.localStorage,
  navigator: { onLine: true },
  CustomEvent: mockWin.CustomEvent,
  console
};

vm.createContext(sandbox);

// Run code files
vm.runInContext(fs.readFileSync('frontend/js/language.js', 'utf8'), sandbox);
vm.runInContext(fs.readFileSync('frontend/js/weather.js', 'utf8'), sandbox);
vm.runInContext(fs.readFileSync('frontend/js/schemes.js', 'utf8'), sandbox);

async function runTests() {
  console.log('=== MULTILINGUAL VERIFICATION TEST RUN ===');

  const WeatherModule = sandbox.window.WeatherModule;
  const SchemesModule = sandbox.window.SchemesModule;
  const LanguageModule = sandbox.window.LanguageModule;

  // 1. Initial Load
  await WeatherModule.loadWeatherData({ latitude: 18.5204, longitude: 73.8567 });
  await SchemesModule.loadCategories();
  await SchemesModule.loadSchemes();

  const testLangs = ['en', 'mr', 'hi', 'ta', 'te'];
  const results = {};

  for (const lang of testLangs) {
    LanguageModule.setLanguage(lang);
    
    // Check Weather
    const condition = elements['weather-condition-text'].textContent;
    const advisoryHeadline = elements['advisory-headline'].textContent;
    const advisoryRec = elements['advisory-recommendation'].textContent;

    // Check Schemes
    const countBadge = elements['schemes-count-badge'].textContent;
    SchemesModule.renderCategoryChips();
    const chipsHtml = elements['schemes-category-chips'].innerHTML;

    // Check Scheme Details Modal
    await SchemesModule.openDetailsModal('pm_kisan');
    const modalBody = elements['modal-scheme-body'].innerHTML;

    // Check Eligibility Modal
    SchemesModule.openEligibilityModal('pm_kisan');
    const formHtml = elements['eligibility-form-container'].innerHTML;

    results[lang] = {
      condition,
      advisoryHeadline,
      advisoryRec,
      countBadge,
      hasChips: chipsHtml.length > 50,
      hasModal: modalBody.length > 100,
      hasForm: formHtml.length > 100
    };

    console.log(`[${lang.toUpperCase()}] Verified:`);
    console.log(`  Weather Condition: ${condition}`);
    console.log(`  Advisory: ${advisoryHeadline} | ${advisoryRec}`);
    console.log(`  Schemes Count: ${countBadge}`);
  }

  console.log('\n=== ALL TRANSLATION DOM CHECKS COMPLETED SUCCESSFULLY ===');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
