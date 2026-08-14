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

  init() {
    this.setupEventListeners();
  },

  setupEventListeners() {
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
          'Please select a valid leaf image file.',
          'error'
        );
      }
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      if (window.App) {
        window.App.showToast(
          'Image file size exceeds 10MB limit.',
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
          'Unable to preview the selected image.',
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
          'Please select or capture a leaf image first.',
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
          'You are offline and this browser does not have the local agriculture model installed.',
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
      'Checking visual symptoms',
      'Comparing crop patterns',
      'Preparing recommendations'
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

      this.renderDiagnosisResult(result);

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
            : 'Diagnosis failed. Please try again.',
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
        'Offline diagnosis is available in the Android app with its local agriculture model. This browser does not have that model installed.'
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
        'The Android offline model did not return a diagnosis. Please check that the local model is installed and ready.'
      );
    }

    if (typeof bridgeResponse === 'string') {
      try {
        return JSON.parse(bridgeResponse);
      } catch (error) {
        throw new Error(
          'The Android offline model returned an unreadable diagnosis.'
        );
      }
    }

    if (typeof bridgeResponse === 'object') {
      return bridgeResponse;
    }

    throw new Error(
      'The Android offline model returned an unsupported diagnosis format.'
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
            'Unable to read the selected leaf image.'
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