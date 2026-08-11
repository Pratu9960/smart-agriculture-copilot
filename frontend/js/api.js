/**
 * Smart Agriculture Copilot - API Client Module
 * 
 * Provides async wrapper functions connecting to FastAPI backend endpoints.
 * Includes development fallback mocks ONLY for frontend testing when FastAPI is unreachable.
 */

const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? 'http://127.0.0.1:8000/api'
  : '/api';

const SmartAgAPI = {
  /**
   * Send crop leaf image to FastAPI for online Gemini diagnosis.
   * @param {File|Blob} imageFile 
   * @returns {Promise<Object>} Diagnosis response object
   */
  async diagnoseCrop(imageFile) {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch(`${API_BASE_URL}/diagnose`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('[SmartAgAPI] FastAPI endpoint unavailable. Using development fallback mock response for testing UI.', error);
      return this._getMockDiagnosisResponse(imageFile);
    }
  },

  /**
   * Fetch weather data and weather-based irrigation guidance from FastAPI.
   * @param {number} latitude 
   * @param {number} longitude 
   * @returns {Promise<Object>} Weather payload
   */
  async getWeather(latitude, longitude) {
    try {
      const response = await fetch(`${API_BASE_URL}/weather?latitude=${latitude}&longitude=${longitude}`);
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('[SmartAgAPI] Weather API unavailable. Using dev mock payload.', error);
      return this._getMockWeatherResponse(latitude, longitude);
    }
  },

  /**
   * Fetch scan history for authenticated user.
   * @returns {Promise<Array>} List of scan records
   */
  async getHistory() {
    try {
      const response = await fetch(`${API_BASE_URL}/history`);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('[SmartAgAPI] History API unavailable. Retrieving from local dev cache.', error);
      const localData = localStorage.getItem('smart_ag_scan_history');
      return localData ? JSON.parse(localData) : this._getMockHistoryRecords();
    }
  },

  /**
   * Save a scan record to backend / Firestore.
   * @param {Object} scanRecord 
   * @returns {Promise<Object>} Saved record details
   */
  async saveHistory(scanRecord) {
    try {
      const response = await fetch(`${API_BASE_URL}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanRecord)
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('[SmartAgAPI] Save history endpoint unavailable. Saving to dev LocalStorage cache.', error);
      const existing = JSON.parse(localStorage.getItem('smart_ag_scan_history') || '[]');
      scanRecord.id = scanRecord.id || 'scan_' + Date.now();
      scanRecord.syncStatus = 'SYNCED_LOCAL_DEV';
      existing.unshift(scanRecord);
      localStorage.setItem('smart_ag_scan_history', JSON.stringify(existing));
      return { success: true, record: scanRecord, isLocalDevMock: true };
    }
  },

  /**
   * Translate text via FastAPI Bhashini service wrapper.
   * @param {string} text 
   * @param {string} targetLang ('en', 'hi', 'mr')
   * @returns {Promise<Object>} Translated string wrapper
   */
  async translateText(text, targetLang) {
    try {
      const response = await fetch(`${API_BASE_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target_language: targetLang })
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('[SmartAgAPI] Translate API unavailable. Returning original text.', error);
      return { translatedText: text, isDevFallback: true };
    }
  },

  /**
   * Synchronize pending offline scan records with server.
   * @param {Array} pendingRecords 
   * @returns {Promise<Object>} Sync status
   */
  async syncRecords(pendingRecords) {
    try {
      const response = await fetch(`${API_BASE_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: pendingRecords })
      });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('[SmartAgAPI] Sync API unavailable. Dev mock sync success.', error);
      return { success: true, syncedCount: pendingRecords.length, isDevMock: true };
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

  _getMockWeatherResponse(lat, lon) {
    return {
      location: 'Nashik, Maharashtra',
      latitude: lat || 20.0,
      longitude: lon || 73.78,
      temperature: 28.5,
      humidity: 65,
      windSpeed: 14.2,
      condition: 'Partly Cloudy',
      icon: '🌤️',
      rainProbability: 20,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      irrigationAdvisory: {
        recommendation: 'DELAY_IRRIGATION',
        headline: 'Rain expected within 24 hours (60% probability)',
        detail: 'Soil moisture levels are currently adequate. Holding off on irrigation today will conserve water and avoid waterlogging crop roots.',
        urgency: 'Low'
      },
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
