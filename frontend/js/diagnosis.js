/**
 * Smart Agriculture Copilot - Crop Disease Diagnosis Module
 *
 * Handles:
 * - Image selection and validation
 * - Image preview
 * - Online Gemini diagnosis
 * - Android offline diagnosis bridge
 * - AI analysis progress UI
 * - Verified knowledge-base recommendation rendering
 * - Diagnosis history saving
 *
 * IMPORTANT:
 * The frontend NEVER generates agricultural recommendations.
 * All diagnosis/recommendation data comes from the backend or
 * the installed Android offline model.
 */

const DiagnosisModule = {
  selectedFile: null,
  currentResult: null,

  t(key, fallback = '') {
    return window.i18n ? window.i18n.t(key) : fallback;
  },

  init() {
    this.setupEventListeners();
  },

  setupEventListeners() {
    if (this.initialized) return;
    this.initialized = true;

    window.addEventListener('smartag:languagechange', (e) => {
      if (e.detail && e.detail.language) {
        this.onLanguageChange(e.detail.language);
      }
    });

    const fileInputCamera = document.getElementById('input-camera');
    const fileInputGallery = document.getElementById('input-gallery');
    const uploadZone = document.getElementById('upload-zone');

    if (uploadZone) {
      uploadZone.addEventListener('click', () => {
        if (fileInputCamera) fileInputCamera.click();
      });
    }

    const btnCamera = document.getElementById('btn-trigger-camera');

    if (btnCamera && fileInputCamera) {
      btnCamera.addEventListener('click', () => fileInputCamera.click());
    }

    const btnGallery = document.getElementById('btn-trigger-gallery');

    if (btnGallery && fileInputGallery) {
      btnGallery.addEventListener('click', () => fileInputGallery.click());
    }

    [fileInputCamera, fileInputGallery].forEach((input) => {
      if (input) {
        input.addEventListener('change', (event) => {
          this.handleFileSelect(event);
        });
      }
    });

    const btnDiagnose = document.getElementById('btn-run-diagnose');

    if (btnDiagnose) {
      btnDiagnose.addEventListener('click', () => {
        this.executeDiagnosis();
      });
    }

    const btnClearPhoto = document.getElementById('btn-clear-photo');

    if (btnClearPhoto) {
      btnClearPhoto.addEventListener('click', () => {
        this.clearPreview();
      });
    }

    const btnSaveScan = document.getElementById('btn-save-scan');

    if (btnSaveScan) {
      btnSaveScan.addEventListener('click', () => {
        this.saveCurrentResult();
      });
    }

    const btnScanAnother = document.getElementById('btn-scan-another');

    if (btnScanAnother) {
      btnScanAnother.addEventListener('click', () => {
        this.clearPreview();

        if (window.App) {
          window.App.navigateTo('view-scan');
        }
      });
    }

    const btnFindShopsForResult =
      document.getElementById('btn-result-find-shops');

    if (btnFindShopsForResult) {
      btnFindShopsForResult.addEventListener('click', () => {
        if (window.App) {
          window.App.navigateTo('view-shops');
        }
      });
    }
  },

  handleFileSelect(event) {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    if (!file.type || !file.type.startsWith('image/')) {
      if (window.App) {
        window.App.showToast(
          this.t('scan.invalidImage', 'Please select a valid crop image.'),
          'error'
        );
      }
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      if (window.App) {
        window.App.showToast(
          this.t('scan.tooLarge', 'Image file size exceeds 10 MB.'),
          'error'
        );
      }
      return;
    }

    this.selectedFile = file;
    this.displayPreview(file);
  },

  displayPreview(file) {
    const reader = new FileReader();

    reader.onload = (event) => {
      const previewImg = document.getElementById('img-preview');
      const previewContainer =
        document.getElementById('preview-container');
      const btnDiagnose =
        document.getElementById('btn-run-diagnose');

      if (previewImg) {
        previewImg.src = event.target.result;
      }

      if (previewContainer) {
        previewContainer.classList.add('active');
      }

      if (btnDiagnose) {
        btnDiagnose.style.display = 'inline-flex';
      }
    };

    reader.onerror = () => {
      if (window.App) {
        window.App.showToast(
          this.t('validation.default', 'Unable to preview the selected image.'),
          'error'
        );
      }
    };

    reader.readAsDataURL(file);
  },

  clearPreview() {
    this.selectedFile = null;
    this.currentResult = null;

    const previewImg = document.getElementById('img-preview');
    const previewContainer =
      document.getElementById('preview-container');
    const btnDiagnose =
      document.getElementById('btn-run-diagnose');
    const fileInputCamera =
      document.getElementById('input-camera');
    const fileInputGallery =
      document.getElementById('input-gallery');

    if (previewImg) previewImg.src = '';
    if (previewContainer) previewContainer.classList.remove('active');
    if (btnDiagnose) btnDiagnose.style.display = 'none';
    if (fileInputCamera) fileInputCamera.value = '';
    if (fileInputGallery) fileInputGallery.value = '';
  },

  async executeDiagnosis() {
    if (!this.selectedFile) {
      if (window.App) {
        window.App.showToast(
          this.t('scan.selectFirst', 'Please select or capture a crop image first.'),
          'warning'
        );
      }
      return;
    }

    const loadingBox =
      document.getElementById('scan-loading-box');
    const btnDiagnose =
      document.getElementById('btn-run-diagnose');
    const analysisStep =
      document.getElementById('analysis-step');

    const selectedMode =
      window.App &&
      typeof window.App.getAIMode === 'function'
        ? window.App.getAIMode()
        : (navigator.onLine ? 'online' : 'offline-unavailable');

    if (selectedMode === 'offline-unavailable') {
      if (window.App) {
        window.App.showToast(
          this.t('scan.offlineUnavailable', 'You are offline and this browser does not have the local agriculture model installed.'),
          'warning'
        );
      }
      return;
    }

    if (loadingBox) {
      loadingBox.classList.add('active');
    }

    if (btnDiagnose) {
      btnDiagnose.style.display = 'none';
    }

    const analysisSteps = [
      this.t('scan.stepSymptoms', 'Checking visual symptoms'),
      this.t('scan.stepPatterns', 'Comparing crop patterns'),
      this.t('scan.stepRecommendations', 'Preparing recommendations')
    ];

    let analysisStepIndex = 0;

    if (analysisStep) {
      analysisStep.textContent = analysisSteps[0];
    }

    const analysisTimer = window.setInterval(() => {
      analysisStepIndex =
        (analysisStepIndex + 1) % analysisSteps.length;

      if (analysisStep) {
        analysisStep.textContent =
          analysisSteps[analysisStepIndex];
      }
    }, 850);

    try {
      let result;

      if (selectedMode === 'online') {
        result =
          await window.SmartAgAPI.diagnoseCrop(
            this.selectedFile
          );
      } else {
        result =
          await this.runOfflineDiagnosis(
            this.selectedFile
          );
      }

      this.currentResult = result;

      const targetLang = (window.LanguageModule && window.LanguageModule.currentLang) || 'en';
      let displayResult = result;

      if (targetLang !== 'en') {
        if (analysisStep) {
          analysisStep.textContent = this.t('common.loading', 'Translating diagnosis...');
        }
        try {
          displayResult = await this.translateDiagnosisPayload(result, targetLang);
        } catch (transErr) {
          console.warn('[DiagnosisModule] Dynamic translation failed, using original English payload:', transErr);
          if (window.App) {
            window.App.showToast(
              this.t('validation.default', 'Translation service unavailable. Displaying original diagnosis.'),
              'warning'
            );
          }
          displayResult = result;
        }
      }

      this.renderDiagnosisResult(displayResult);

      if (window.App) {
        window.App.navigateTo('view-result');
      }
    } catch (error) {
      console.error(
        '[DiagnosisModule] Error during diagnosis:',
        error
      );

      if (window.App) {
        window.App.showToast(
          error && error.message
            ? error.message
            : this.t('scan.diagnosisFailed', 'Crop analysis failed. Please try again.'),
          'error'
        );
      }
    } finally {
      window.clearInterval(analysisTimer);

      if (loadingBox) {
        loadingBox.classList.remove('active');
      }

      if (btnDiagnose && this.selectedFile) {
        btnDiagnose.style.display = 'inline-flex';
      }
    }
  },

  async runOfflineDiagnosis(file) {
    if (
      !window.SmartAgBridge ||
      !window.SmartAgBridge.isAvailable()
    ) {
      throw new Error(
        this.t('scan.offlineUnavailable', 'Offline diagnosis is available in the Android app with its local agriculture model. This browser does not have that model installed.')
      );
    }

    const imageData =
      await this.readFileAsDataUrl(file);

    const bridgeResponse =
      await Promise.resolve(
        window.SmartAgBridge.triggerOfflineDiagnosis(
          imageData
        )
      );

    if (!bridgeResponse) {
      throw new Error(
        this.t('scan.offlineNoResult', 'The local model did not return a diagnosis. Check that it is installed and ready.')
      );
    }

    if (typeof bridgeResponse === 'string') {
      try {
        return JSON.parse(bridgeResponse);
      } catch (error) {
        throw new Error(
          this.t('scan.offlineUnreadable', 'The local model returned an unreadable diagnosis.')
        );
      }
    }

    if (typeof bridgeResponse === 'object') {
      return bridgeResponse;
    }

    throw new Error(
      this.t('scan.offlineUnsupported', 'The local model returned an unsupported diagnosis format.')
    );
  },

  readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = () => {
        reject(
          new Error(
            this.t('validation.default', 'Unable to read the selected crop image.')
          )
        );
      };

      reader.readAsDataURL(file);
    });
  },

  renderDiagnosisResult(data) {
    if (!data || typeof data !== 'object') {
      console.error(
        '[DiagnosisModule] Invalid diagnosis response:',
        data
      );
      return;
    }

    // ============================================================
    // Main diagnosis header
    // ============================================================

    const cropBadge =
      document.getElementById('result-crop-name');

    const diseaseName =
      document.getElementById('result-disease-name');

    const confidenceText =
      document.getElementById('result-confidence');

    if (cropBadge) {
      cropBadge.innerText =
        data.crop || 'Unknown';
    }

    if (diseaseName) {
      diseaseName.innerText =
        data.disease || 'Unknown';
    }

    if (confidenceText) {
      const numericConfidence =
        Number(data.confidence);

      if (
        Number.isFinite(numericConfidence) &&
        numericConfidence >= 0
      ) {
        const pct = Math.round(
          Math.max(
            0,
            Math.min(1, numericConfidence)
          ) * 100
        );

        confidenceText.innerText =
          `Confidence: ${pct}%`;
      } else {
        confidenceText.innerText =
          'Confidence: unavailable';
      }
    }

    // ============================================================
    // New redesigned result metadata
    // ============================================================

    const overviewElem =
      document.getElementById('result-overview');

    const severityElem =
      document.getElementById('result-severity');

    const cropMetaElem =
      document.getElementById('result-crop-meta');

    if (overviewElem) {
      overviewElem.innerText =
        data.cause ||
        data.overview ||
        'Verified observation information is currently unavailable.';
    }

    if (severityElem) {
      severityElem.innerText =
        data.severity || 'Unknown';
    }

    if (cropMetaElem) {
      cropMetaElem.innerText =
        data.crop || 'Unknown';
    }

    // ============================================================
    // Symptoms / observations
    // ============================================================

    const symptomsElem =
      document.getElementById('result-symptoms');

    if (symptomsElem) {
      if (
        Array.isArray(data.symptoms) &&
        data.symptoms.length > 0
      ) {
        symptomsElem.innerHTML = `
          <ul>
            ${data.symptoms
              .map(
                (symptom) =>
                  `<li>${this.escapeHtml(symptom)}</li>`
              )
              .join('')}
          </ul>
        `;
      } else if (
        typeof data.symptoms === 'string' &&
        data.symptoms.trim()
      ) {
        symptomsElem.innerText =
          data.symptoms;
      } else {
        symptomsElem.innerText =
          'Verified symptom information is currently unavailable.';
      }
    }

    // ============================================================
    // Cause / overview
    // ============================================================

    const causeElem =
      document.getElementById('result-cause');

    if (causeElem) {
      if (
        typeof data.cause === 'string' &&
        data.cause.trim()
      ) {
        causeElem.innerText =
          data.cause;
      } else {
        causeElem.innerText =
          'Verified cause information is currently unavailable.';
      }
    }

    // ============================================================
    // Treatment / recommended actions
    // ============================================================

    const treatmentElem =
      document.getElementById('result-treatment');

    if (treatmentElem) {
      if (
        typeof data.treatment === 'string' &&
        data.treatment.trim()
      ) {
        treatmentElem.innerText =
          data.treatment;
      } else {
        treatmentElem.innerText =
          'Verified treatment information is currently unavailable for this diagnosis.';
      }
    }

    // ============================================================
    // Pesticides
    //
    // IMPORTANT:
    // Empty pesticides array MUST NOT result in generated
    // pesticide recommendations.
    // ============================================================

    const pesticidesElem =
      document.getElementById('result-pesticides');

    if (pesticidesElem) {
      if (
        Array.isArray(data.pesticides) &&
        data.pesticides.length > 0
      ) {
        pesticidesElem.innerHTML = `
          <ul>
            ${data.pesticides
              .map((pesticide) => {
                if (
                  !pesticide ||
                  typeof pesticide !== 'object'
                ) {
                  return '';
                }

                const name =
                  this.escapeHtml(
                    pesticide.name ||
                    'Verified pesticide'
                  );

                const formulation =
                  pesticide.formulation
                    ? ` (${this.escapeHtml(
                        pesticide.formulation
                      )})`
                    : '';

                const dosage =
                  pesticide.dosage
                    ? ` - ${this.escapeHtml(
                        pesticide.dosage
                      )}`
                    : '';

                const application =
                  pesticide.application
                    ? `
                      <br>
                      <small>
                        ${this.escapeHtml(
                          pesticide.application
                        )}
                      </small>
                    `
                    : '';

                const source =
                  pesticide.source
                    ? `
                      <br>
                      <small>
                        Source:
                        ${this.escapeHtml(
                          pesticide.source
                        )}
                      </small>
                    `
                    : '';

                return `
                  <li>
                    <strong>${name}</strong>
                    ${formulation}
                    ${dosage}
                    ${application}
                    ${source}
                  </li>
                `;
              })
              .join('')}
          </ul>
        `;
      } else if (
        typeof data.pesticides === 'string' &&
        data.pesticides.trim()
      ) {
        pesticidesElem.innerText =
          data.pesticides;
      } else {
        pesticidesElem.innerHTML = `
          <p>
            <strong>
              Verified pesticide information is currently unavailable.
            </strong>
          </p>
          <p>
            No verified pesticide dosage is available in the
            agricultural knowledge base for this diagnosis.
            Please consult a qualified local agricultural
            extension officer before applying pesticides.
          </p>
        `;
      }
    }

    // ============================================================
    // Fertilizer
    // ============================================================

    const fertilizerElem =
      document.getElementById('result-fertilizer');

    if (fertilizerElem) {
      if (
        typeof data.fertilizer === 'string' &&
        data.fertilizer.trim()
      ) {
        fertilizerElem.innerText =
          data.fertilizer;
      } else {
        fertilizerElem.innerText =
          'Verified fertilizer guidance is currently unavailable for this diagnosis.';
      }
    }

    // ============================================================
    // Prevention
    // ============================================================

    const preventionElem =
      document.getElementById('result-prevention');

    if (preventionElem) {
      if (
        Array.isArray(data.prevention) &&
        data.prevention.length > 0
      ) {
        preventionElem.innerHTML = `
          <ul>
            ${data.prevention
              .map(
                (prevention) =>
                  `<li>${this.escapeHtml(
                    prevention
                  )}</li>`
              )
              .join('')}
          </ul>
        `;
      } else if (
        typeof data.prevention === 'string' &&
        data.prevention.trim()
      ) {
        preventionElem.innerText =
          data.prevention;
      } else {
        preventionElem.innerText =
          'Verified prevention information is currently unavailable.';
      }
    }

    // ============================================================
    // Recommendation availability
    // ============================================================

    const recommendationStatus =
      document.getElementById(
        'result-recommendation-status'
      );

    if (recommendationStatus) {
      if (data.recommendationsAvailable === false) {
        recommendationStatus.innerText =
          'Verified agricultural recommendations are currently unavailable for this diagnosis.';
      } else if (
        data.recommendationsAvailable === true
      ) {
        recommendationStatus.innerText =
          'Agricultural recommendations verified from the knowledge base.';
      } else {
        recommendationStatus.innerText = '';
      }
    }

    // ============================================================
    // AI / Mock indicator
    // ============================================================

    const mockIndicator =
      document.getElementById(
        'result-dev-mock-indicator'
      );

    if (mockIndicator) {
      if (data.isDevMockPayload === true) {
        mockIndicator.innerText =
          'Development mock diagnosis';
      } else if (
        data.isDevMockPayload === false
      ) {
        mockIndicator.innerText =
          'AI diagnosis';
      } else {
        mockIndicator.innerText = '';
      }
    }
  },

  /**
   * Escape backend-provided values before inserting into innerHTML.
   */
  escapeHtml(value) {
    if (value === null || value === undefined) {
      return '';
    }

    const div = document.createElement('div');
    div.textContent = String(value);

    return div.innerHTML;
  },

  /**
   * Translate diagnosis fields efficiently using SmartAgAPI.translateText without mutating original result.
   */
  async translateDiagnosisPayload(result, targetLang) {
    if (!result || typeof result !== 'object') return result;
    if (!targetLang || targetLang === 'en') return result;

    const stringsToTranslate = new Set();
    const addStr = (val) => {
      if (typeof val === 'string' && val.trim().length > 0) {
        stringsToTranslate.add(val.trim());
      }
    };

    addStr(result.crop);
    addStr(result.disease);
    addStr(result.severity);
    addStr(result.cause);
    addStr(result.overview);
    addStr(result.treatment);
    addStr(result.fertilizer);

    if (Array.isArray(result.symptoms)) {
      result.symptoms.forEach(s => addStr(s));
    } else if (typeof result.symptoms === 'string') {
      addStr(result.symptoms);
    }

    if (Array.isArray(result.prevention)) {
      result.prevention.forEach(p => addStr(p));
    } else if (typeof result.prevention === 'string') {
      addStr(result.prevention);
    }

    if (Array.isArray(result.pesticides)) {
      result.pesticides.forEach(p => {
        if (p && typeof p === 'object') {
          addStr(p.name);
          addStr(p.dosage);
          addStr(p.application);
          addStr(p.formulation);
        } else if (typeof p === 'string') {
          addStr(p);
        }
      });
    } else if (typeof result.pesticides === 'string') {
      addStr(result.pesticides);
    }

    const textList = Array.from(stringsToTranslate);
    if (textList.length === 0) return result;

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
      console.warn('[DiagnosisModule] Error translating diagnosis fields:', err);
      throw err;
    }

    const tr = (val) => {
      if (typeof val !== 'string' || !val.trim()) return val;
      return translationMap.get(val.trim()) || val;
    };

    const translatedResult = {
      ...result,
      crop: tr(result.crop),
      disease: tr(result.disease),
      severity: tr(result.severity),
      cause: tr(result.cause),
      overview: tr(result.overview),
      treatment: tr(result.treatment),
      fertilizer: tr(result.fertilizer)
    };

    if (Array.isArray(result.symptoms)) {
      translatedResult.symptoms = result.symptoms.map(s => tr(s));
    } else if (typeof result.symptoms === 'string') {
      translatedResult.symptoms = tr(result.symptoms);
    }

    if (Array.isArray(result.prevention)) {
      translatedResult.prevention = result.prevention.map(p => tr(p));
    } else if (typeof result.prevention === 'string') {
      translatedResult.prevention = tr(result.prevention);
    }

    if (Array.isArray(result.pesticides)) {
      translatedResult.pesticides = result.pesticides.map(p => {
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
    } else if (typeof result.pesticides === 'string') {
      translatedResult.pesticides = tr(result.pesticides);
    }

    return translatedResult;
  },

  /**
   * Handler triggered when user changes active language.
   * If a diagnosis is currently loaded, re-translates and re-renders immediately.
   */
  async onLanguageChange(newLang) {
    if (!this.currentResult) return;

    const targetLang = newLang || (window.LanguageModule && window.LanguageModule.currentLang) || 'en';
    let displayResult = this.currentResult;

    if (targetLang !== 'en') {
      if (window.App) {
        window.App.showToast('Translating diagnosis...', 'info');
      }
      try {
        displayResult = await this.translateDiagnosisPayload(this.currentResult, targetLang);
      } catch (err) {
        console.warn('[DiagnosisModule] Failed to translate diagnosis on language change:', err);
        if (window.App) {
          window.App.showToast('Translation service unavailable. Displaying original diagnosis.', 'warning');
        }
        displayResult = this.currentResult;
      }
    }

    this.renderDiagnosisResult(displayResult);
  },

  /**
   * Save current diagnosis to History.
   */
  async saveCurrentResult() {
    if (!this.currentResult) {
      return;
    }

    try {
      const recordToSave = {
        ...this.currentResult,
        date: new Date().toLocaleString(),
        savedAt: Date.now()
      };

      await window.SmartAgAPI.saveHistory(
        recordToSave
      );

      if (window.App) {
        window.App.showToast(
          'Scan record saved to History!',
          'success'
        );
      }
    } catch (error) {
      console.error(
        '[DiagnosisModule] Failed to save scan:',
        error
      );

      if (window.App) {
        window.App.showToast(
          'Unable to save scan to History. Please try again.',
          'error'
        );
      }
    }
  }
};


document.addEventListener('DOMContentLoaded', () => {
  DiagnosisModule.init();
});


window.DiagnosisModule = DiagnosisModule;
