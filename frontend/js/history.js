/**
 * Smart Agriculture Copilot - Scan History Module
 * Manages scan records, history filtering, detail modal view, dynamic translation, and manual sync.
 */

const HistoryModule = {
  records: [],
  initialized: false,
  openRecordId: null,

  t(key, fallback = '') {
    return window.i18n ? window.i18n.t(key) : fallback;
  },

  escapeHtml(value) {
    if (value === null || value === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(value);
    return div.innerHTML;
  },

  initView() {
    this.setupEventListeners();
    this.loadHistory();
  },

  setupEventListeners() {
    if (this.initialized) return;
    this.initialized = true;

    window.addEventListener('smartag:languagechange', (e) => {
      if (e.detail && e.detail.language) {
        this.onLanguageChange(e.detail.language);
      }
    });

    const searchInput = document.getElementById('history-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.filterHistory(e.target.value));
    }

    const btnSyncNow = document.getElementById('btn-sync-history');
    if (btnSyncNow) {
      btnSyncNow.addEventListener('click', () => this.syncPendingRecords());
    }

    const modalClose = document.getElementById('modal-history-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeDetailModal());
    }

    const modalOverlay = document.getElementById('modal-history-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) this.closeDetailModal();
      });
    }
  },

  async loadHistory() {
    try {
      this.records = await window.SmartAgAPI.getHistory();
      await this.renderHistoryList(this.records);
    } catch (err) {
      console.error('[HistoryModule] Failed to load history:', err);
    }
  },

  async renderHistoryList(list) {
    const container = document.getElementById('history-list-container');
    if (!container) return;

    if (!list || list.length === 0) {
      container.innerHTML = `
        <div class="history-empty">
          <div style="font-size: 40px; margin-bottom: 8px;">📜</div>
          <p><strong>${this.t('history.emptyTitle', 'No scan history yet')}</strong></p>
          <p>${this.t('history.emptyBody', 'Your saved crop analyses will appear here.')}</p>
        </div>
      `;
      return;
    }

    const targetLang = (window.LanguageModule && window.LanguageModule.currentLang) || 'en';

    // Render original items initially
    container.innerHTML = list.map(item => `
      <div class="history-card" onclick="HistoryModule.openDetailModal('${item.id}')">
        <div class="history-thumb" style="display: flex; align-items: center; justify-content: center; font-size: 28px; background: #e8f5e9;">
          🌿
        </div>
        <div class="history-info">
          <div class="history-title" data-record-id="${item.id}">${this.escapeHtml(item.crop)} - ${this.escapeHtml(item.disease)}</div>
          <div class="history-severity">${item.severity ? this.t('history.severity', '{{value}} severity').replace('{{value}}', this.escapeHtml(item.severity)) : this.t('history.analysisRecord', 'Analysis record')}</div>
          <div class="history-date">📅 ${this.escapeHtml(item.date || this.t('history.analysisRecord', 'Recent'))}</div>
        </div>
        <div>
          <span class="status-badge ${item.syncStatus === 'PENDING' ? 'offline' : ''}">
            ${this.escapeHtml(item.syncStatus || 'SYNCED')}
          </span>
        </div>
      </div>
    `).join('');

    // Translate card title headers dynamically for non-English view without modifying records
    if (targetLang !== 'en') {
      try {
        const uniqueTitles = new Set();
        list.forEach(i => {
          if (i.crop) uniqueTitles.add(i.crop.trim());
          if (i.disease) uniqueTitles.add(i.disease.trim());
        });
        const titleArr = Array.from(uniqueTitles);
        if (titleArr.length > 0) {
          const map = new Map();
          const trs = await Promise.all(
            titleArr.map(txt =>
              window.SmartAgAPI.translateText(txt, targetLang)
                .then(res => ({ orig: txt, tr: (res && res.translatedText) || txt }))
                .catch(() => ({ orig: txt, tr: txt }))
            )
          );
          trs.forEach(pair => map.set(pair.orig, pair.tr));

          list.forEach(item => {
            const titleEl = container.querySelector(`.history-title[data-record-id="${item.id}"]`);
            if (titleEl) {
              const trCrop = map.get(item.crop ? item.crop.trim() : '') || item.crop;
              const trDisease = map.get(item.disease ? item.disease.trim() : '') || item.disease;
              titleEl.textContent = `${trCrop} - ${trDisease}`;
            }
          });
        }
      } catch (err) {
        console.warn('[HistoryModule] Failed to translate history list titles:', err);
      }
    }
  },

  filterHistory(query) {
    if (!query) {
      this.renderHistoryList(this.records);
      return;
    }
    const q = query.toLowerCase();
    const filtered = this.records.filter(r => 
      (r.crop && r.crop.toLowerCase().includes(q)) || 
      (r.disease && r.disease.toLowerCase().includes(q))
    );
    this.renderHistoryList(filtered);
  },

  /**
   * Translate history detail payload without modifying original record.
   */
  async translateRecordPayload(record, targetLang) {
    if (!record || typeof record !== 'object') return record;
    if (!targetLang || targetLang === 'en') return record;

    const stringsToTranslate = new Set();
    const addStr = (val) => {
      if (typeof val === 'string' && val.trim().length > 0) {
        stringsToTranslate.add(val.trim());
      }
    };

    addStr(record.crop);
    addStr(record.disease);
    addStr(record.severity);
    addStr(record.cause);
    addStr(record.overview);
    addStr(record.treatment);
    addStr(record.fertilizer);

    if (Array.isArray(record.symptoms)) {
      record.symptoms.forEach(s => addStr(s));
    } else if (typeof record.symptoms === 'string') {
      addStr(record.symptoms);
    }

    if (Array.isArray(record.prevention)) {
      record.prevention.forEach(p => addStr(p));
    } else if (typeof record.prevention === 'string') {
      addStr(record.prevention);
    }

    if (Array.isArray(record.pesticides)) {
      record.pesticides.forEach(p => {
        if (p && typeof p === 'object') {
          addStr(p.name);
          addStr(p.dosage);
          addStr(p.application);
          addStr(p.formulation);
        } else if (typeof p === 'string') {
          addStr(p);
        }
      });
    } else if (typeof record.pesticides === 'string') {
      addStr(record.pesticides);
    }

    const textList = Array.from(stringsToTranslate);
    if (textList.length === 0) return record;

    const translationMap = new Map();
    try {
      const results = await Promise.all(
        textList.map(text =>
          window.SmartAgAPI.translateText(text, targetLang)
            .then(res => ({ original: text, translated: (res && res.translatedText) || text }))
            .catch(() => ({ original: text, translated: text }))
        )
      );
      results.forEach(item => {
        translationMap.set(item.original, item.translated);
      });
    } catch (err) {
      console.warn('[HistoryModule] Error translating record payload:', err);
      throw err;
    }

    const tr = (val) => {
      if (typeof val !== 'string' || !val.trim()) return val;
      return translationMap.get(val.trim()) || val;
    };

    const translatedRecord = {
      ...record,
      crop: tr(record.crop),
      disease: tr(record.disease),
      severity: tr(record.severity),
      cause: tr(record.cause),
      overview: tr(record.overview),
      treatment: tr(record.treatment),
      fertilizer: tr(record.fertilizer)
    };

    if (Array.isArray(record.symptoms)) {
      translatedRecord.symptoms = record.symptoms.map(s => tr(s));
    } else if (typeof record.symptoms === 'string') {
      translatedRecord.symptoms = tr(record.symptoms);
    }

    if (Array.isArray(record.prevention)) {
      translatedRecord.prevention = record.prevention.map(p => tr(p));
    } else if (typeof record.prevention === 'string') {
      translatedRecord.prevention = tr(record.prevention);
    }

    if (Array.isArray(record.pesticides)) {
      translatedRecord.pesticides = record.pesticides.map(p => {
        if (p && typeof p === 'object') {
          return {
            ...p,
            name: tr(p.name),
            dosage: tr(p.dosage),
            application: tr(p.application),
            formulation: tr(p.formulation)
          };
        } else if (typeof p === 'string') {
          return tr(p);
        }
        return p;
      });
    } else if (typeof record.pesticides === 'string') {
      translatedRecord.pesticides = tr(record.pesticides);
    }

    return translatedRecord;
  },

  renderDetailModalContent(record) {
    const modalTitle = document.getElementById('modal-history-title');
    const modalBody = document.getElementById('modal-history-body');

    if (modalTitle) {
      modalTitle.innerText = `${record.crop || 'Crop'} - ${record.disease || 'Diagnosis'}`;
    }

    if (modalBody) {
      let symptomsHtml = '';
      if (Array.isArray(record.symptoms) && record.symptoms.length > 0) {
        symptomsHtml = `<ul>${record.symptoms.map(s => `<li>${this.escapeHtml(s)}</li>`).join('')}</ul>`;
      } else if (typeof record.symptoms === 'string' && record.symptoms.trim()) {
        symptomsHtml = `<p>${this.escapeHtml(record.symptoms)}</p>`;
      } else {
        symptomsHtml = `<p>${this.t('diagnosis.symptomsFallback', 'Visual symptoms will appear here.')}</p>`;
      }

      let treatmentHtml = '';
      if (typeof record.treatment === 'string' && record.treatment.trim()) {
        treatmentHtml = `<p>${this.escapeHtml(record.treatment)}</p>`;
      } else {
        treatmentHtml = `<p>${this.t('diagnosis.treatmentFallback', 'Treatment guidance will appear here.')}</p>`;
      }

      modalBody.innerHTML = `
        <div style="margin-bottom: 12px; font-size: 0.85rem; color: var(--text-muted);">
          <strong>${this.t('history.date', 'Date')}:</strong> ${this.escapeHtml(record.date || '—')}<br>
          <strong>${this.t('history.status', 'Status')}:</strong> ${this.escapeHtml(record.syncStatus || 'SYNCED')}
        </div>
        <div class="result-section">
          <h4>🩺 ${this.t('history.symptoms', 'Symptoms')}</h4>
          ${symptomsHtml}
        </div>
        <div class="result-section">
          <h4>🧪 ${this.t('history.treatment', 'Treatment')}</h4>
          ${treatmentHtml}
        </div>
      `;
    }
  },

  async openDetailModal(recordId) {
    const record = this.records.find(r => r.id === recordId);
    if (!record) return;

    this.openRecordId = recordId;

    const modalTitle = document.getElementById('modal-history-title');
    const modalBody = document.getElementById('modal-history-body');
    const modalOverlay = document.getElementById('modal-history-overlay');

    const targetLang = (window.LanguageModule && window.LanguageModule.currentLang) || 'en';

    if (modalTitle) modalTitle.innerText = `${record.crop} - ${record.disease}`;
    if (modalOverlay) modalOverlay.classList.add('active');

    if (targetLang === 'en') {
      this.renderDetailModalContent(record);
      return;
    }

    if (modalBody) {
      modalBody.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted);">
          <div class="spinner" style="margin: 0 auto 12px auto;"></div>
          <p><strong>${this.t('common.loading', 'Translating...')}</strong></p>
        </div>
      `;
    }

    let displayRecord = record;
    try {
      displayRecord = await this.translateRecordPayload(record, targetLang);
    } catch (err) {
      console.warn('[HistoryModule] Dynamic translation failed for history detail:', err);
      if (window.App) {
        window.App.showToast(this.t('validation.default', 'Translation service unavailable. Displaying original detail.'), 'warning');
      }
      displayRecord = record;
    }

    this.renderDetailModalContent(displayRecord);
  },

  closeDetailModal() {
    this.openRecordId = null;
    const modalOverlay = document.getElementById('modal-history-overlay');
    if (modalOverlay) modalOverlay.classList.remove('active');
  },

  /**
   * Re-translates and re-renders open history detail modal & list upon language change.
   */
  async onLanguageChange(newLang) {
    const targetLang = newLang || (window.LanguageModule && window.LanguageModule.currentLang) || 'en';

    this.renderHistoryList(this.records);

    if (this.openRecordId) {
      const record = this.records.find(r => r.id === this.openRecordId);
      if (!record) return;

      if (targetLang === 'en') {
        this.renderDetailModalContent(record);
        return;
      }

      let displayRecord = record;
      try {
        displayRecord = await this.translateRecordPayload(record, targetLang);
      } catch (err) {
        console.warn('[HistoryModule] Dynamic translation on language change failed:', err);
        if (window.App) {
          window.App.showToast(this.t('validation.default', 'Translation service unavailable. Displaying original detail.'), 'warning');
        }
        displayRecord = record;
      }

      this.renderDetailModalContent(displayRecord);
    }
  },

  async syncPendingRecords() {
    const pending = this.records.filter(r => r.syncStatus === 'PENDING');
    if (pending.length === 0) {
      if (window.App) window.App.showToast(this.t('history.syncAlready', 'All scan records are already synchronized.'), 'info');
      return;
    }

    if (window.App) window.App.showToast(this.t('history.syncStart', 'Synchronizing records with cloud...'), 'info');
    let res;
    try {
      res = await window.SmartAgAPI.syncRecords(pending);
    } catch (error) {
      console.warn('[HistoryModule] Sync failed:', error);
      if (window.App) window.App.showToast(error.message || this.t('history.syncFailed', 'Records could not be synchronized.'), 'error');
      return;
    }

    if (res.success) {
      this.records.forEach(r => r.syncStatus = 'SYNCED');
      this.renderHistoryList(this.records);
      if (window.App) window.App.showToast(this.t('history.syncSuccess', 'All pending records synchronized.'), 'success');
    }
  },

  autoSyncPending() {
    const pending = this.records.filter(r => r.syncStatus === 'PENDING');
    if (pending.length > 0) {
      this.syncPendingRecords();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  HistoryModule.setupEventListeners();
});

window.HistoryModule = HistoryModule;
