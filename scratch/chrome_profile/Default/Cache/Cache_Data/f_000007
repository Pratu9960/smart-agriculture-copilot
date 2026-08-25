/**
 * Smart Agriculture Copilot - Market Prices & Price History Module
 * 
 * Interacts with FastAPI / Data.gov.in AGMARKNET dataset.
 * Zero fake data: displays only verified wholesale mandi observations,
 * generates dynamic SVG price charts, multi-market comparison, and CSV export.
 */

const MarketModule = {
  cacheStorageKey: 'haritkranti_market_cache',
  prefStorageKey: 'haritkranti_market_prefs',
  currentCrop: 'soybean',
  currentState: 'Maharashtra',
  currentDistrict: 'Dharashiv',
  currentMarket: 'Dharashiv',
  currentPeriod: '30d',
  currentPriceType: 'modal', // 'modal' | 'min' | 'max'
  locationsData: null,
  latestData: null,
  historyData: null,
  isInitialized: false,
  activeTooltipPoint: null,

  t(key, params = {}) {
    return window.i18n && typeof window.i18n.t === 'function'
      ? window.i18n.t(key, params)
      : key;
  },

  async initView() {
    this.setupEventListeners();
    this.loadSavedPreferences();
    await this.loadLocationsHierarchy();
    await this.loadMarketData();
  },

  setupEventListeners() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Crop Search / Selection
    const cropSearchInput = document.getElementById('market-crop-search');
    if (cropSearchInput) {
      cropSearchInput.addEventListener('input', (e) => this.filterCropList(e.target.value));
    }

    // State / District / Market Dropdowns
    document.getElementById('market-state-select')?.addEventListener('change', (e) => {
      this.currentState = e.target.value;
      this.populateDistrictDropdown();
      this.loadMarketData();
    });

    document.getElementById('market-district-select')?.addEventListener('change', (e) => {
      this.currentDistrict = e.target.value;
      this.populateMarketDropdown();
      this.loadMarketData();
    });

    document.getElementById('market-select')?.addEventListener('change', (e) => {
      this.currentMarket = e.target.value;
      this.loadMarketData();
    });

    // Detect Location Button
    document.getElementById('btn-market-detect-location')?.addEventListener('click', () => {
      this.detectLocation();
    });

    // Period Filter Chips (7D, 30D, 3M, 6M, 1Y)
    document.querySelectorAll('.period-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        document.querySelectorAll('.period-chip').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentPeriod = e.currentTarget.dataset.period;
        this.loadHistoryDataOnly();
      });
    });

    // Price Type Switches (Modal, Min, Max)
    document.querySelectorAll('.price-type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.price-type-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentPriceType = e.currentTarget.dataset.type;
        this.renderChart();
      });
    });

    // Market Comparison Sorting
    document.getElementById('market-compare-sort')?.addEventListener('change', () => {
      this.renderComparisonTable();
    });

    // CSV Download
    document.getElementById('btn-download-market-csv')?.addEventListener('click', () => {
      this.downloadCsv();
    });

    // Save Favorite Crop & Market
    document.getElementById('btn-save-fav-crop')?.addEventListener('click', () => this.toggleSaveCrop());
    document.getElementById('btn-save-fav-market')?.addEventListener('click', () => this.toggleSaveMarket());

    // Refresh & Retry Buttons
    document.getElementById('btn-market-refresh')?.addEventListener('click', () => this.loadMarketData());
    document.getElementById('btn-market-retry')?.addEventListener('click', () => this.loadMarketData());
  },

  loadSavedPreferences() {
    try {
      const prefs = JSON.parse(localStorage.getItem(this.prefStorageKey) || '{}');
      if (prefs.crop) this.currentCrop = prefs.crop;
      if (prefs.state) this.currentState = prefs.state;
      if (prefs.district) this.currentDistrict = prefs.district;
      if (prefs.market) this.currentMarket = prefs.market;
    } catch (e) {
      console.warn('[MarketModule] Failed to read preferences', e);
    }
  },

  savePreferences() {
    try {
      const prefs = {
        crop: this.currentCrop,
        state: this.currentState,
        district: this.currentDistrict,
        market: this.currentMarket
      };
      localStorage.setItem(this.prefStorageKey, JSON.stringify(prefs));
    } catch (e) {}
  },

  async loadLocationsHierarchy() {
    try {
      if (window.SmartAgAPI) {
        this.locationsData = await window.SmartAgAPI.getMarketLocations();
      }
    } catch (e) {
      console.warn('[MarketModule] Using local fallback locations hierarchy');
      this.locationsData = {
        "Maharashtra": {
          "Dharashiv": ["Dharashiv", "Tuljapur", "Umarga", "Murum", "Kalamb"],
          "Latur": ["Latur", "Ausa", "Nilanga", "Udgir"],
          "Solapur": ["Solapur", "Pandharpur", "Barshi", "Akkalkot"],
          "Nashik": ["Nashik", "Lasalgaon", "Pimpalgaon", "Yeola"],
          "Pune": ["Pune", "Junnar", "Manchar", "Baramati"]
        },
        "Madhya Pradesh": { "Indore": ["Indore", "Mhow"], "Ujjain": ["Ujjain"] },
        "Gujarat": { "Rajkot": ["Rajkot", "Gondal"], "Surat": ["Surat"] },
        "Karnataka": { "Kalaburagi": ["Kalaburagi"], "Belagavi": ["Belagavi"] },
        "Punjab": { "Ludhiana": ["Ludhiana", "Khanna"] }
      };
    }

    this.populateStateDropdown();
    this.populateDistrictDropdown();
    this.populateMarketDropdown();
    this.renderCropsSelector();
  },

  populateStateDropdown() {
    const select = document.getElementById('market-state-select');
    if (!select || !this.locationsData) return;
    const states = Object.keys(this.locationsData);
    select.innerHTML = states.map(s => `<option value="${s}" ${s === this.currentState ? 'selected' : ''}>${s}</option>`).join('');
  },

  populateDistrictDropdown() {
    const select = document.getElementById('market-district-select');
    if (!select || !this.locationsData) return;
    const districts = Object.keys(this.locationsData[this.currentState] || {});
    if (!districts.includes(this.currentDistrict)) {
      this.currentDistrict = districts[0] || '';
    }
    select.innerHTML = districts.map(d => `<option value="${d}" ${d === this.currentDistrict ? 'selected' : ''}>${d}</option>`).join('');
  },

  populateMarketDropdown() {
    const select = document.getElementById('market-select');
    if (!select || !this.locationsData) return;
    const markets = (this.locationsData[this.currentState] && this.locationsData[this.currentState][this.currentDistrict]) || [];
    if (!markets.includes(this.currentMarket)) {
      this.currentMarket = markets[0] || '';
    }
    select.innerHTML = markets.map(m => `<option value="${m}" ${m === this.currentMarket ? 'selected' : ''}>${m}</option>`).join('');
  },

  renderCropsSelector() {
    const container = document.getElementById('market-crop-chips');
    if (!container || !window.CropsData) return;

    const crops = window.CropsData.getCrops();
    const currentLang = window.i18n ? window.i18n.currentLang : 'en';

    container.innerHTML = crops.map(c => {
      const isSelected = c.id.toLowerCase() === this.currentCrop.toLowerCase() || c.name.toLowerCase() === this.currentCrop.toLowerCase();
      const displayName = window.CropsData.getCropDisplayName(c, currentLang);
      return `
        <button type="button" class="crop-select-chip ${isSelected ? 'active' : ''}" data-crop-id="${c.id}" style="--chip-accent: ${c.accentColor}">
          <span class="crop-chip-icon">${c.iconSvg}</span>
          <span class="crop-chip-name">${displayName}</span>
        </button>
      `;
    }).join('');

    container.querySelectorAll('.crop-select-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const cropId = e.currentTarget.dataset.cropId;
        this.selectCrop(cropId);
      });
    });
  },

  selectCrop(cropId) {
    this.currentCrop = cropId;
    document.querySelectorAll('.crop-select-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.cropId === cropId);
    });
    this.savePreferences();
    this.loadMarketData();
  },

  filterCropList(query) {
    const q = (query || '').toLowerCase().trim();
    document.querySelectorAll('.crop-select-chip').forEach(chip => {
      const name = chip.querySelector('.crop-chip-name')?.textContent?.toLowerCase() || '';
      chip.style.display = !q || name.includes(q) ? 'inline-flex' : 'none';
    });
  },

  detectLocation() {
    const btn = document.getElementById('btn-market-detect-location');
    if (btn) btn.textContent = this.t('market.loading');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            if (window.SmartAgAPI) {
              const geo = await window.SmartAgAPI.reverseGeocode(pos.coords.latitude, pos.coords.longitude);
              if (geo) {
                if (geo.state && this.locationsData && this.locationsData[geo.state]) {
                  this.currentState = geo.state;
                }
                if (geo.district) {
                  // Clean "District" from name if present
                  const cleanDist = geo.district.replace(/ district/i, '').trim();
                  const stateDists = Object.keys(this.locationsData[this.currentState] || {});
                  const match = stateDists.find(d => cleanDist.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(cleanDist.toLowerCase()));
                  if (match) this.currentDistrict = match;
                }
                this.populateStateDropdown();
                this.populateDistrictDropdown();
                this.populateMarketDropdown();
                this.loadMarketData();
              }
            }
          } catch (err) {
            console.warn('[MarketModule] Geo lookup fallback:', err);
          } finally {
            if (btn) btn.innerHTML = `<span>&#8982;</span> ${this.t('market.detectLocation')}`;
          }
        },
        () => {
          if (btn) btn.innerHTML = `<span>&#8982;</span> ${this.t('market.detectLocation')}`;
        },
        { timeout: 8000 }
      );
    }
  },

  async loadMarketData() {
    this.setLoadingState(true);
    this.hideErrorState();

    const cropObj = window.CropsData ? window.CropsData.getCropById(this.currentCrop) : { name: this.currentCrop };
    const commodity = cropObj.name;

    try {
      // 1. Fetch latest prices & nearby comparison
      const latestPromise = window.SmartAgAPI.getLatestMarketPrice({
        commodity: commodity,
        state: this.currentState,
        district: this.currentDistrict,
        market: this.currentMarket
      });

      // 2. Fetch price history & trend
      const historyPromise = window.SmartAgAPI.getMarketPriceHistory({
        commodity: commodity,
        state: this.currentState,
        district: this.currentDistrict,
        market: this.currentMarket,
        period: this.currentPeriod
      });

      const [latestRes, historyRes] = await Promise.all([latestPromise, historyPromise]);

      this.latestData = latestRes;
      this.historyData = historyRes;

      // Cache locally for offline support
      this.cacheCurrentData();

      this.renderLatestSummary();
      this.renderComparisonTable();
      this.renderHistorySection();
      this.setLoadingState(false);
      this.updateOfflineBadge(false);
    } catch (error) {
      console.error('[MarketModule] Failed to load live market data:', error);
      const cached = this.getCachedData();
      if (cached) {
        this.latestData = cached.latest;
        this.historyData = cached.history;
        this.renderLatestSummary();
        this.renderComparisonTable();
        this.renderHistorySection();
        this.setLoadingState(false);
        this.updateOfflineBadge(true, cached.timestamp);
      } else {
        this.setLoadingState(false);
        this.showErrorState();
      }
    }
  },

  async loadHistoryDataOnly() {
    const cropObj = window.CropsData ? window.CropsData.getCropById(this.currentCrop) : { name: this.currentCrop };
    const chartLoading = document.getElementById('market-chart-loading');
    if (chartLoading) chartLoading.classList.remove('hidden');

    try {
      this.historyData = await window.SmartAgAPI.getMarketPriceHistory({
        commodity: cropObj.name,
        state: this.currentState,
        district: this.currentDistrict,
        market: this.currentMarket,
        period: this.currentPeriod
      });
      this.renderHistorySection();
    } catch (e) {
      console.warn('[MarketModule] History fetch error:', e);
    } finally {
      if (chartLoading) chartLoading.classList.add('hidden');
    }
  },

  cacheCurrentData() {
    try {
      const cacheKey = `${this.currentCrop}_${this.currentState}_${this.currentDistrict}_${this.currentMarket}`;
      const payload = {
        latest: this.latestData,
        history: this.historyData,
        timestamp: new Date().toISOString()
      };
      const allCache = JSON.parse(localStorage.getItem(this.cacheStorageKey) || '{}');
      allCache[cacheKey] = payload;
      localStorage.setItem(this.cacheStorageKey, JSON.stringify(allCache));
    } catch (e) {}
  },

  getCachedData() {
    try {
      const cacheKey = `${this.currentCrop}_${this.currentState}_${this.currentDistrict}_${this.currentMarket}`;
      const allCache = JSON.parse(localStorage.getItem(this.cacheStorageKey) || '{}');
      return allCache[cacheKey] || null;
    } catch (e) {
      return null;
    }
  },

  updateOfflineBadge(isOffline, timestamp) {
    const banner = document.getElementById('market-offline-banner');
    if (!banner) return;
    if (isOffline) {
      const dateStr = timestamp ? new Date(timestamp).toLocaleDateString() : '';
      banner.textContent = this.t('market.offlineCached', { date: dateStr });
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
  },

  renderLatestSummary() {
    if (!this.latestData) return;

    const record = this.latestData.selectedMarket;
    const cropObj = window.CropsData ? window.CropsData.getCropById(this.currentCrop) : null;
    const currentLang = window.i18n ? window.i18n.currentLang : 'en';

    // Crop Image / Icon Header
    const cropNameEl = document.getElementById('market-summary-crop-name');
    const cropCatEl = document.getElementById('market-summary-category');
    const marketNameEl = document.getElementById('market-summary-mandi');
    const locationNameEl = document.getElementById('market-summary-location');
    const modalPriceEl = document.getElementById('market-summary-modal-price');
    const minPriceEl = document.getElementById('market-summary-min-price');
    const maxPriceEl = document.getElementById('market-summary-max-price');
    const varietyEl = document.getElementById('market-summary-variety');
    const updateDateEl = document.getElementById('market-summary-date');
    const heroCard = document.getElementById('market-hero-card');

    if (cropObj && cropNameEl) {
      cropNameEl.textContent = window.CropsData.getCropDisplayName(cropObj, currentLang);
      cropCatEl.textContent = cropObj.category;
      if (heroCard) heroCard.style.setProperty('--crop-theme', cropObj.accentColor);
    }

    if (record) {
      if (marketNameEl) marketNameEl.textContent = `${record.market} Mandi (APMC)`;
      if (locationNameEl) locationNameEl.textContent = `${record.district}, ${record.state}`;
      if (modalPriceEl) modalPriceEl.textContent = `₹${Math.round(record.modalPrice).toLocaleString('en-IN')}`;
      if (minPriceEl) minPriceEl.textContent = `₹${Math.round(record.minPrice).toLocaleString('en-IN')}`;
      if (maxPriceEl) maxPriceEl.textContent = `₹${Math.round(record.maxPrice).toLocaleString('en-IN')}`;
      if (varietyEl) varietyEl.textContent = this.t('market.variety', { value: record.variety || 'Standard' });
      if (updateDateEl) updateDateEl.textContent = this.t('market.updated', { date: record.arrivalDate });
    }
  },

  renderComparisonTable() {
    const tableBody = document.getElementById('market-compare-tbody');
    if (!tableBody || !this.latestData) return;

    let items = [...(this.latestData.nearbyMarkets || [])];
    const sortVal = document.getElementById('market-compare-sort')?.value || 'highest';

    if (sortVal === 'highest') {
      items.sort((a, b) => b.modalPrice - a.modalPrice);
    } else if (sortVal === 'lowest') {
      items.sort((a, b) => a.modalPrice - b.modalPrice);
    } else if (sortVal === 'nearest') {
      items.sort((a, b) => (a.relation === 'same_district' ? -1 : 1));
    }

    if (items.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="table-empty">${this.t('market.noDataBody')}</td></tr>`;
      return;
    }

    tableBody.innerHTML = items.map(m => {
      const isSelected = m.relation === 'selected' || m.market.toLowerCase() === this.currentMarket.toLowerCase();
      let relationBadge = '';
      if (m.relation === 'same_district') relationBadge = `<span class="badge badge-district">${this.t('market.sameDistrict')}</span>`;
      else if (m.relation === 'same_state') relationBadge = `<span class="badge badge-state">${this.t('market.sameState')}</span>`;

      return `
        <tr class="${isSelected ? 'selected-row' : ''}">
          <td>
            <strong>${m.market}</strong>
            <small>${m.district}</small>
          </td>
          <td>${relationBadge}</td>
          <td><strong class="price-highlight">₹${Math.round(m.modalPrice).toLocaleString('en-IN')}</strong></td>
          <td>₹${Math.round(m.minPrice).toLocaleString('en-IN')} – ₹${Math.round(m.maxPrice).toLocaleString('en-IN')}</td>
          <td><small>${m.arrivalDate}</small></td>
        </tr>
      `;
    }).join('');
  },

  renderHistorySection() {
    if (!this.historyData) return;

    const data = this.historyData;
    const latestModalEl = document.getElementById('hist-metric-latest');
    const periodHighEl = document.getElementById('hist-metric-high');
    const periodLowEl = document.getElementById('hist-metric-low');
    const changeEl = document.getElementById('hist-metric-change');
    const trendBadgeEl = document.getElementById('hist-trend-badge');
    const whatChartShowsEl = document.getElementById('hist-what-chart-shows');

    if (data.latestModal != null && latestModalEl) {
      latestModalEl.textContent = `₹${Math.round(data.latestModal).toLocaleString('en-IN')}`;
    }
    if (data.periodHigh != null && periodHighEl) {
      periodHighEl.textContent = `₹${Math.round(data.periodHigh).toLocaleString('en-IN')}`;
    }
    if (data.periodLow != null && periodLowEl) {
      periodLowEl.textContent = `₹${Math.round(data.periodLow).toLocaleString('en-IN')}`;
    }

    if (changeEl && data.netChange != null) {
      const sign = data.netChange > 0 ? '+' : '';
      const pctSign = data.percentageChange > 0 ? '+' : '';
      changeEl.textContent = `${sign}₹${Math.round(data.netChange)} (${pctSign}${data.percentageChange}%)`;
      changeEl.className = `metric-value ${data.netChange > 0 ? 'text-positive' : data.netChange < 0 ? 'text-negative' : 'text-neutral'}`;
    }

    if (trendBadgeEl) {
      const trend = data.trend || 'Stable';
      let trendText = this.t('market.trendStable');
      let trendClass = 'trend-stable';

      if (trend === 'Increasing') {
        trendText = this.t('market.trendIncreasing');
        trendClass = 'trend-increasing';
      } else if (trend === 'Decreasing') {
        trendText = this.t('market.trendDecreasing');
        trendClass = 'trend-decreasing';
      } else if (trend === 'Insufficient data') {
        trendText = this.t('market.trendInsufficient');
        trendClass = 'trend-insufficient';
      }

      trendBadgeEl.textContent = trendText;
      trendBadgeEl.className = `trend-indicator ${trendClass}`;
    }

    if (whatChartShowsEl) {
      whatChartShowsEl.textContent = data.whatChartShows || this.t('market.whatChartShowsTitle');
    }

    this.renderChart();
    this.renderHistoricalRecordsTable();
  },

  renderChart() {
    const svgContainer = document.getElementById('market-price-svg-wrapper');
    if (!svgContainer || !this.historyData) return;

    const records = this.historyData.records || [];
    if (records.length === 0) {
      svgContainer.innerHTML = `<div class="chart-empty-state"><p>${this.t('market.trendInsufficient')}</p></div>`;
      return;
    }

    const priceKey = this.currentPriceType === 'min' ? 'minPrice' : this.currentPriceType === 'max' ? 'maxPrice' : 'modalPrice';
    const values = records.map(r => r[priceKey]);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const paddingVal = (maxVal - minVal) * 0.15 || 100;
    const yMin = Math.max(0, Math.floor((minVal - paddingVal) / 100) * 100);
    const yMax = Math.ceil((maxVal + paddingVal) / 100) * 100;

    const width = 760;
    const height = 280;
    const padX = 60;
    const padY = 30;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    const getX = (idx) => padX + (records.length === 1 ? chartW / 2 : (idx / (records.length - 1)) * chartW);
    const getY = (val) => padY + chartH - ((val - yMin) / (yMax - yMin || 1)) * chartH;

    // Build SVG Path
    let pathD = `M ${getX(0)} ${getY(values[0])}`;
    for (let i = 1; i < records.length; i++) {
      pathD += ` L ${getX(i)} ${getY(values[i])}`;
    }

    // Area path for gradient fill
    const areaD = `${pathD} L ${getX(records.length - 1)} ${height - padY} L ${getX(0)} ${height - padY} Z`;

    // Horizontal Gridlines & Y-Axis Labels
    const ySteps = 4;
    let gridLines = '';
    for (let s = 0; s <= ySteps; s++) {
      const stepVal = Math.round(yMin + (s / ySteps) * (yMax - yMin));
      const stepY = getY(stepVal);
      gridLines += `
        <line x1="${padX}" y1="${stepY}" x2="${width - padX}" y2="${stepY}" stroke="rgba(0,0,0,0.06)" stroke-dasharray="3,3" />
        <text x="${padX - 8}" y="${stepY + 4}" text-anchor="end" font-size="11" fill="#718096">₹${stepVal}</text>
      `;
    }

    // Interactive Data Points
    let pointsSvg = '';
    records.forEach((r, idx) => {
      const cx = getX(idx);
      const cy = getY(values[idx]);
      const dateShort = r.date.split('-').slice(1).join('/');

      pointsSvg += `
        <g class="chart-point-group" data-point-idx="${idx}" tabindex="0" aria-label="${r.date}: ₹${values[idx]}">
          <circle cx="${cx}" cy="${cy}" r="5" class="chart-point-dot" />
          <circle cx="${cx}" cy="${cy}" r="14" class="chart-point-hitbox" />
          <text x="${cx}" y="${height - 10}" text-anchor="middle" font-size="11" fill="#718096">${dateShort}</text>
        </g>
      `;
    });

    const cropObj = window.CropsData ? window.CropsData.getCropById(this.currentCrop) : null;
    const strokeColor = (cropObj && cropObj.accentColor) || '#2d6a4f';

    svgContainer.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" class="market-trend-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mandi price history trend chart">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.25" />
            <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.01" />
          </linearGradient>
        </defs>
        ${gridLines}
        <path d="${areaD}" fill="url(#chartGradient)" />
        <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        ${pointsSvg}
      </svg>
      <div class="chart-tooltip hidden" id="market-chart-tooltip" role="tooltip"></div>
    `;

    // Tooltip listeners
    const tooltip = document.getElementById('market-chart-tooltip');
    svgContainer.querySelectorAll('.chart-point-group').forEach(group => {
      const idx = Number(group.dataset.pointIdx);
      const pt = records[idx];

      const showTip = (evt) => {
        if (!tooltip || !pt) return;
        const rect = svgContainer.getBoundingClientRect();
        const ptX = getX(idx);
        const ptY = getY(values[idx]);
        const scaleX = rect.width / width;
        const scaleY = rect.height / height;

        tooltip.innerHTML = `
          <strong>${pt.date}</strong>
          <div>${this.historyData.market} APMC</div>
          <div class="tip-price">₹${Math.round(values[idx]).toLocaleString('en-IN')} <small>/ quintal</small></div>
          <div class="tip-range">Min: ₹${Math.round(pt.minPrice)} | Max: ₹${Math.round(pt.maxPrice)}</div>
        `;
        tooltip.style.left = `${ptX * scaleX}px`;
        tooltip.style.top = `${(ptY * scaleY) - 10}px`;
        tooltip.classList.remove('hidden');
      };

      const hideTip = () => {
        if (tooltip) tooltip.classList.add('hidden');
      };

      group.addEventListener('mouseenter', showTip);
      group.addEventListener('focus', showTip);
      group.addEventListener('mouseleave', hideTip);
      group.addEventListener('blur', hideTip);
    });
  },

  renderHistoricalRecordsTable() {
    const tableBody = document.getElementById('market-history-tbody');
    if (!tableBody || !this.historyData) return;

    const records = [...(this.historyData.records || [])].reverse();
    if (records.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="table-empty">${this.t('market.noDataBody')}</td></tr>`;
      return;
    }

    tableBody.innerHTML = records.map(r => `
      <tr>
        <td><strong>${r.date}</strong></td>
        <td>${r.market}</td>
        <td>${this.historyData.commodity}</td>
        <td>${r.variety}</td>
        <td>₹${Math.round(r.minPrice).toLocaleString('en-IN')}</td>
        <td><strong class="price-highlight">₹${Math.round(r.modalPrice).toLocaleString('en-IN')}</strong></td>
        <td>₹${Math.round(r.maxPrice).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');
  },

  downloadCsv() {
    if (!this.historyData || !this.historyData.records || this.historyData.records.length === 0) {
      alert(this.t('market.trendInsufficient'));
      return;
    }

    const commodity = this.historyData.commodity;
    const market = this.historyData.market;
    const district = this.historyData.district;
    const state = this.historyData.state;

    let csvContent = 'Date,Market,District,State,Commodity,Variety,MinPrice_INR_Quintal,ModalPrice_INR_Quintal,MaxPrice_INR_Quintal,Source\n';
    
    this.historyData.records.forEach(r => {
      csvContent += `"${r.date}","${r.market}","${district}","${state}","${commodity}","${r.variety}",${r.minPrice},${r.modalPrice},${r.maxPrice},"Government of India Data.gov.in / AGMARKNET"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Mandi_Price_History_${commodity}_${market}_${this.currentPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  toggleSaveCrop() {
    const btn = document.getElementById('btn-save-fav-crop');
    if (btn) {
      btn.textContent = this.t('market.saved');
      btn.classList.add('btn-saved');
      this.savePreferences();
    }
  },

  toggleSaveMarket() {
    const btn = document.getElementById('btn-save-fav-market');
    if (btn) {
      btn.textContent = this.t('market.saved');
      btn.classList.add('btn-saved');
      this.savePreferences();
    }
  },

  setLoadingState(isLoading) {
    const loader = document.getElementById('market-loading-skeleton');
    const content = document.getElementById('market-main-content');
    if (loader) loader.classList.toggle('hidden', !isLoading);
    if (content) content.classList.toggle('hidden', isLoading);
  },

  showErrorState() {
    const errBox = document.getElementById('market-error-box');
    const content = document.getElementById('market-main-content');
    if (errBox) errBox.classList.remove('hidden');
    if (content) content.classList.add('hidden');
  },

  hideErrorState() {
    const errBox = document.getElementById('market-error-box');
    if (errBox) errBox.classList.add('hidden');
  },

  refreshTranslations() {
    if (this.latestData) {
      this.renderLatestSummary();
      this.renderComparisonTable();
      this.renderHistorySection();
      this.renderCropsSelector();
    }
  }
};

window.MarketModule = MarketModule;
