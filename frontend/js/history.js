/**
 * Smart Agriculture Copilot - Scan History Module
 * Manages scan records, history filtering, detail modal view, and manual sync.
 */

const HistoryModule = {
  records: [],
  initialized: false,

  t(key, fallback = '') {
    return window.i18n ? window.i18n.t(key) : fallback;
  },

  initView() {
    this.setupEventListeners();
    this.loadHistory();
  },

  setupEventListeners() {
    if (this.initialized) return;
    this.initialized = true;
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
      this.renderHistoryList(this.records);
    } catch (err) {
      console.error('[HistoryModule] Failed to load history:', err);
    }
  },

  renderHistoryList(list) {
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

    container.innerHTML = list.map(item => `
      <div class="history-card" onclick="HistoryModule.openDetailModal('${item.id}')">
        <div class="history-thumb" style="display: flex; align-items: center; justify-content: center; font-size: 28px; background: #e8f5e9;">
          🌿
        </div>
          <div class="history-info">
          <div class="history-title">${item.crop} - ${item.disease}</div>
          <div class="history-severity">${item.severity ? this.t('history.severity', '{{value}} severity').replace('{{value}}', item.severity) : this.t('history.analysisRecord', 'Analysis record')}</div>
          <div class="history-date">📅 ${item.date || this.t('history.analysisRecord', 'Recent')}</div>
        </div>
        <div>
          <span class="status-badge ${item.syncStatus === 'PENDING' ? 'offline' : ''}">
            ${item.syncStatus || 'SYNCED'}
          </span>
        </div>
      </div>
    `).join('');
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

  openDetailModal(recordId) {
    const record = this.records.find(r => r.id === recordId);
    if (!record) return;

    const modalTitle = document.getElementById('modal-history-title');
    const modalBody = document.getElementById('modal-history-body');
    const modalOverlay = document.getElementById('modal-history-overlay');

    if (modalTitle) modalTitle.innerText = `${record.crop} - ${record.disease}`;
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="margin-bottom: 12px; font-size: 0.85rem; color: var(--text-muted);">
          <strong>${this.t('history.date', 'Date')}:</strong> ${record.date || '—'}<br>
          <strong>${this.t('history.status', 'Status')}:</strong> ${record.syncStatus || 'SYNCED'}
        </div>
        <div class="result-section">
          <h4>🩺 ${this.t('history.symptoms', 'Symptoms')}</h4>
          <p>${Array.isArray(record.symptoms) ? record.symptoms.join(', ') : (record.symptoms || this.t('diagnosis.symptomsFallback', 'Visual symptoms will appear here.'))}</p>
        </div>
        <div class="result-section">
          <h4>🧪 ${this.t('history.treatment', 'Treatment')}</h4>
          <p>${record.treatment || this.t('diagnosis.treatmentFallback', 'Treatment guidance will appear here.')}</p>
        </div>
      `;
    }

    if (modalOverlay) modalOverlay.classList.add('active');
  },

  closeDetailModal() {
    const modalOverlay = document.getElementById('modal-history-overlay');
    if (modalOverlay) modalOverlay.classList.remove('active');
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
