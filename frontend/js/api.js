/**
 * Smart Agriculture Copilot - API Client Module
 * 
 * Provides async wrapper functions connecting to FastAPI backend endpoints.
 * Includes development fallback mocks ONLY for frontend testing when FastAPI is unreachable.
 */

const API_BASE_URL =
  window.location.origin.includes('localhost') ||
  window.location.origin.includes('127.0.0.1')
    ? 'http://127.0.0.1:8000/api'
    : 'https://smart-agriculture-backend-mfyh.onrender.com/api';

const SmartAgAPI = {

const SmartAgAPI = {  
  /**
   * Get authentication headers for protected backend endpoints.
   */
  async getAuthHeaders() {
    if (
      !window.AuthModule ||
      typeof window.AuthModule.getCurrentUser !== 'function'
    ) {
      throw new Error('Authentication module is not available.');
    }

    const user = window.AuthModule.getCurrentUser();

    if (!user) {
      throw new Error('Please log in to access your scan history.');
    }

    const idToken = await user.getIdToken();

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    };
  },
  /**
   * Send crop leaf image to FastAPI for online Gemini diagnosis.
   * @param {File|Blob} imageFile 
   * @returns {Promise<Object>} Diagnosis response object
   */
  async diagnoseCrop(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);

    let response;

    try {
        response = await fetch(`${API_BASE_URL}/diagnose`, {
            method: 'POST',
            body: formData
        });
    } catch (netError) {
        console.error(
            '[SmartAgAPI] Network error reaching FastAPI diagnosis endpoint:',
            netError
        );

        throw new Error(
            'AI diagnosis is temporarily unavailable. Please check your network connection and try again.'
        );
    }

    // Read response as text FIRST
    const responseText = await response.text();

    console.log('[SmartAgAPI] Diagnosis status:', response.status);
    console.log('[SmartAgAPI] Diagnosis response:', responseText);

    // Try converting response to JSON safely
    let data = null;

    if (responseText && responseText.trim()) {
        try {
            data = JSON.parse(responseText);
        } catch (error) {
            console.error(
                '[SmartAgAPI] Backend returned invalid JSON:',
                responseText
            );

            throw new Error(
                'The server returned an invalid response. Please try again.'
            );
        }
    }

    // Handle backend errors
    if (!response.ok) {
        let errorDetail =
            'AI diagnosis is temporarily unavailable. Please try again or check your image.';

        if (data) {
            errorDetail =
                data.detail ||
                data.message ||
                data.error ||
                errorDetail;

            if (typeof errorDetail !== 'string') {
                errorDetail = JSON.stringify(errorDetail);
            }
        }

        console.error(
            `[SmartAgAPI] Backend returned error status ${response.status}:`,
            errorDetail
        );

        throw new Error(errorDetail);
    }

    // Successful status but empty response
    if (!data) {
        console.error(
            '[SmartAgAPI] Backend returned a successful response but no data.'
        );

        throw new Error(
            'AI diagnosis service returned an empty response. Please try again.'
        );
    }

    return data;
},
  async getWeather(latitude, longitude) {
    try {
      const response = await fetch(`${API_BASE_URL}/weather?latitude=${latitude}&longitude=${longitude}`);
      if (!response.ok) {
        let detail = '';
        try {
          const payload = await response.json();
          detail = payload && payload.detail ? String(payload.detail) : '';
        } catch (parseError) {
          // Keep the status code when the server did not return JSON.
        }
        const error = new Error(detail || `Weather service returned HTTP ${response.status}.`);
        error.status = response.status;
        console.error(`[SmartAgAPI] Weather endpoint returned HTTP ${response.status}:`, detail);
        throw error;
      }
      const data = await response.json();
      if (!data || data.isDevMockPayload === true) {
        console.error('[SmartAgAPI] Weather endpoint returned non-live/mock data.');
        const mockError = new Error('The weather service returned non-live data.');
        mockError.code = 'MOCK_DATA';
        throw mockError;
      }
      return data;
    } catch (error) {
      if (error && (error.status || error.code === 'MOCK_DATA')) throw error;
      console.error('[SmartAgAPI] Network/fetch error reaching weather endpoint:', error);
      const networkError = new Error('Weather service is unreachable. Please check your connection.');
      networkError.code = 'NETWORK';
      networkError.originalError = error;
      throw networkError;
    }
  },

  /** Search a city, town, district, or locality through the backend geocoder. */
  async searchLocation(query) {
    const cleanQuery = String(query || '').trim();
    if (!cleanQuery) return [];
    try {
      const response = await fetch(`${API_BASE_URL}/location/search?q=${encodeURIComponent(cleanQuery)}`);
      if (!response.ok) {
        let detail = '';
        try {
          const payload = await response.json();
          detail = payload && payload.detail ? String(payload.detail) : '';
        } catch (e) {
          // Ignore json parse error
        }
        console.error(`[SmartAgAPI] Location search failed with HTTP ${response.status}:`, detail);
        const error = new Error(detail || `Location search returned HTTP ${response.status}.`);
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } catch (error) {
      if (error && error.status) throw error;
      console.error('[SmartAgAPI] Network error reaching location search endpoint:', error);
      const netErr = new Error('Location search is unreachable.');
      netErr.code = 'NETWORK';
      throw netErr;
    }
  },

  /** Reverse geocode coordinates through the backend geocoder. */
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await fetch(`${API_BASE_URL}/location/reverse?latitude=${latitude}&longitude=${longitude}`);
      if (!response.ok) {
        let detail = '';
        try {
          const payload = await response.json();
          detail = payload && payload.detail ? String(payload.detail) : '';
        } catch (e) {
          // Ignore json parse error
        }
        console.warn(`[SmartAgAPI] Reverse geocoding failed with HTTP ${response.status}:`, detail);
        const error = new Error(detail || `Reverse geocode returned HTTP ${response.status}.`);
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } catch (error) {
      if (error && error.status) throw error;
      console.warn('[SmartAgAPI] Network error during reverse geocoding:', error);
      const netErr = new Error('Reverse geocoding is unreachable.');
      netErr.code = 'NETWORK';
      throw netErr;
    }
  },

  /**
   * Fetch scan history for authenticated user.
   * @returns {Promise<Array>} List of scan records
   */
  
  async getHistory() {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/history`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        let detail = '';

        try {
          const payload = await response.json();
          detail = payload && payload.detail
            ? String(payload.detail)
            : '';
        } catch (e) {
          // Ignore JSON parsing failure.
        }

        const error = new Error(
          detail || `History service returned HTTP ${response.status}.`
        );

        error.status = response.status;
        throw error;
      }

      return await response.json();

    } catch (error) {
      console.error(
        '[SmartAgAPI] Failed to retrieve Firestore history:',
        error
      );

      // Do NOT silently replace an authentication/Firestore failure
      // with fake history data.
      throw error;
    }
  
  },

  /**
   * Save a scan record to backend / Firestore.
   * @param {Object} scanRecord 
   * @returns {Promise<Object>} Saved record details
   */
  
    async saveHistory(scanRecord) {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/history`, {
        method: 'POST',
        headers,
        body: JSON.stringify(scanRecord)
      });

      if (!response.ok) {
        let detail = '';

        try {
          const payload = await response.json();
          detail = payload && payload.detail
            ? String(payload.detail)
            : '';
        } catch (e) {
          // Ignore JSON parsing failure.
        }

        const error = new Error(
          detail || `History service returned HTTP ${response.status}.`
        );

        error.status = response.status;
        throw error;
      }

      return await response.json();

    } catch (error) {
      console.error(
        '[SmartAgAPI] Failed to save scan to Firestore:',
        error
      );

      throw error;
    }
  },

  _translationCache: new Map(),

  /**
   * Translate text via FastAPI translation service wrapper with in-memory caching.
   * @param {string} text 
   * @param {string} targetLang ('en', 'hi', 'mr', 'ta', 'te')
   * @param {string} sourceLang ('en')
   * @returns {Promise<Object>} Translated string wrapper
   */
  async translateText(text, targetLang, sourceLang = 'en') {
    if (!text || typeof text !== 'string' || !text.trim()) {
      return { translatedText: text || '', isDevFallback: false };
    }

    const cleanText = text.trim();
    if (!targetLang || targetLang === sourceLang) {
      return { translatedText: cleanText, isDevFallback: false };
    }

    const cacheKey = `${sourceLang}:${targetLang}:${cleanText}`;
    if (this._translationCache.has(cacheKey)) {
      return Promise.resolve(this._translationCache.get(cacheKey));
    }

    try {
      const response = await fetch(`${API_BASE_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, target_language: targetLang, source_language: sourceLang })
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      if (data && typeof data.translatedText === 'string') {
        this._translationCache.set(cacheKey, data);
      }
      return data;
    } catch (error) {
      console.warn('[SmartAgAPI] Translate API unavailable. Returning original text.', error);
      return { translatedText: cleanText, isDevFallback: true };
    }
  },

  /**
   * Synchronize pending offline scan records with server.
   * @param {Array} pendingRecords 
   * @returns {Promise<Object>} Sync status
   */
    async syncRecords(pendingRecords) {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/sync`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          records: pendingRecords
        })
      });

      if (!response.ok) {
        let detail = '';

        try {
          const payload = await response.json();
          detail = payload && payload.detail
            ? String(payload.detail)
            : '';
        } catch (e) {
          // Ignore JSON parsing failure.
        }

        const error = new Error(
          detail || `Sync service returned HTTP ${response.status}.`
        );

        error.status = response.status;
        throw error;
      }

      return await response.json();

    } catch (error) {
      console.error(
        '[SmartAgAPI] Failed to synchronize records:',
        error
      );

      throw error;
    }
  },

  /* =========================================================================
   * MARKET PRICES & HISTORY ENDPOINTS
   * ========================================================================= */

  /**
   * Fetch available agricultural commodities list.
   * @returns {Promise<Array>} List of crops metadata
   */
  async getMarketCrops() {
    try {
      const response = await fetch(`${API_BASE_URL}/market/crops`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('[SmartAgAPI] Market crops endpoint unavailable, using local crop registry:', error);
      if (window.CropsData) return window.CropsData.getCrops();
      throw error;
    }
  },

  /**
   * Fetch location hierarchy for market selection.
   * @returns {Promise<Object>} States -> Districts -> Mandis map
   */
  async getMarketLocations() {
    try {
      const response = await fetch(`${API_BASE_URL}/market/locations`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('[SmartAgAPI] Market locations endpoint unavailable:', error);
      throw error;
    }
  },

  /**
   * Fetch latest mandi prices for selected crop and location.
   * @param {Object} params { commodity, state, district, market }
   * @returns {Promise<Object>} Latest price response
   */
  async getLatestMarketPrice({ commodity, state, district, market }) {
    const url = new URL(`${API_BASE_URL}/market/latest`, window.location.origin);
    url.searchParams.set('commodity', commodity);
    if (state) url.searchParams.set('state', state);
    if (district) url.searchParams.set('district', district);
    if (market) url.searchParams.set('market', market);

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        const error = new Error(`Market price service returned HTTP ${response.status}.`);
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('[SmartAgAPI] Failed to fetch latest market price:', error);
      throw error;
    }
  },

  /**
   * Fetch historical recorded prices and trend calculations.
   * @param {Object} params { commodity, state, district, market, period }
   * @returns {Promise<Object>} History response
   */
  async getMarketPriceHistory({ commodity, state, district, market, period = '30d' }) {
    const url = new URL(`${API_BASE_URL}/market/history`, window.location.origin);
    url.searchParams.set('commodity', commodity);
    if (state) url.searchParams.set('state', state);
    if (district) url.searchParams.set('district', district);
    if (market) url.searchParams.set('market', market);
    url.searchParams.set('period', period);

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        const error = new Error(`Market history service returned HTTP ${response.status}.`);
        error.status = response.status;
        throw error;
      }
      return await response.json();
    } catch (error) {
      console.error('[SmartAgAPI] Failed to fetch market price history:', error);
      throw error;
    }
  },

  /* =========================================================================
   * GOVERNMENT SCHEMES ENDPOINTS
   * ========================================================================= */

  /**
   * Fetch verified government schemes matching search & filters.
   * @param {Object} params { q, category, level, state, crop }
   * @returns {Promise<Array>} List of schemes
   */
  async getGovernmentSchemes(params = {}) {
    const url = new URL(`${API_BASE_URL}/schemes`, window.location.origin);
    if (params.q) url.searchParams.set('q', params.q);
    if (params.category && params.category !== 'all') url.searchParams.set('category', params.category);
    if (params.level && params.level !== 'all') url.searchParams.set('level', params.level);
    if (params.state && params.state !== 'all') url.searchParams.set('state', params.state);
    if (params.crop && params.crop !== 'all') url.searchParams.set('crop', params.crop);

    try {
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('[SmartAgAPI] Failed to fetch government schemes:', error);
      throw error;
    }
  },

  /**
   * Fetch scheme categories with live counts.
   * @returns {Promise<Array>} Categories list
   */
  async getSchemeCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/schemes/categories`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('[SmartAgAPI] Failed to fetch scheme categories:', error);
      throw error;
    }
  },

  /**
   * Fetch full details for a single government scheme.
   * @param {string} schemeId 
   * @returns {Promise<Object>} Scheme details
   */
  async getSchemeById(schemeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/schemes/${encodeURIComponent(schemeId)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`[SmartAgAPI] Failed to fetch scheme details for ${schemeId}:`, error);
      throw error;
    }
  },

  /**
   * Check farmer eligibility against official scheme criteria.
   * @param {string} schemeId 
   * @param {Object} answers 
   * @returns {Promise<Object>} Eligibility evaluation
   */
  async checkSchemeEligibility(schemeId, answers) {
    try {
      const response = await fetch(`${API_BASE_URL}/schemes/${encodeURIComponent(schemeId)}/check-eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`[SmartAgAPI] Failed to evaluate scheme eligibility for ${schemeId}:`, error);
      throw error;
    }
  },

  /* =========================================================================
   * DEVELOPMENT FALLBACK MOCKS (ONLY FOR FRONTEND TESTING WITHOUT FASTAPI)
   * ========================================================================= */

  _getMockDiagnosisResponse(imageFile) {
    // Generate realistic agricultural response for UI demonstration
    return {
      id: 'mock_' + Date.now(),
      crop: 'Tomato',
      disease: 'Early Blight (Alternaria solani)',
      confidence: 0.94,
      severity: 'Moderate',
      timestamp: new Date().toISOString(),
      symptoms: [
        'Concentric dark rings (target spot appearance) on lower, older leaves.',
        'Yellow halo surrounding brownish-black leaf spots.',
        'Premature leaf loss starting from bottom foliage progressing upward.'
      ],
      cause: 'Fungal infection favoured by humid weather, warm temperatures (24-29°C), and wet foliage.',
      treatment: 'Remove severely infected lower leaves immediately. Apply copper-based fungicide or Mancozeb every 7-10 days. Ensure drip irrigation instead of overhead watering to keep leaves dry.',
      pesticides: [
        { name: 'Copper Oxychloride 50% WP', dosage: '2.5g per litre of water' },
        { name: 'Mancozeb 75% WP', dosage: '2g per litre of water' }
      ],
      fertilizer: 'Apply balanced N-P-K (19-19-19) with calcium nitrate spray to strengthen plant cell walls and promote fresh foliage growth.',
      prevention: [
        'Practice 3-year crop rotation with non-solanaceous crops.',
        'Mulch around base of plant to prevent soil spores splashing onto leaves.',
        'Maintain proper plant spacing (45-60cm) for adequate airflow.'
      ],
      isDevMockPayload: true
    };
  },

  _getMockHistoryRecords() {
    return [
      {
        id: 'scan_001',
        crop: 'Tomato',
        disease: 'Early Blight',
        confidence: 0.94,
        date: '2026-08-10 14:30',
        syncStatus: 'SYNCED',
        imagePreview: null,
        symptoms: ['Concentric dark rings on leaves'],
        treatment: 'Apply copper oxychloride spray.'
      },
      {
        id: 'scan_002',
        crop: 'Potato',
        disease: 'Late Blight',
        confidence: 0.88,
        date: '2026-08-09 09:15',
        syncStatus: 'PENDING',
        imagePreview: null,
        symptoms: ['Water-soaked dark lesions on leaf tips'],
        treatment: 'Apply systemic fungicide (Metalaxyl + Mancozeb).'
      }
    ];
  }
};

window.SmartAgAPI = SmartAgAPI;
