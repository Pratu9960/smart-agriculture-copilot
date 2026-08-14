/**
 * Smart Agriculture Copilot - Crop Disease Diagnosis Module
 *
 * Handles:
 * - Image selection
 * - Image preview
 * - Image validation
 * - Gemini diagnosis API request
 * - Verified knowledge-base recommendation rendering
 * - Saving diagnosis to history
 *
 * IMPORTANT:
 * The frontend NEVER generates agricultural recommendations.
 * All diagnosis/recommendation data comes from the backend.
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
        if (fileInputCamera) {
          fileInputCamera.click();
        }
      });
    }

    const btnCamera = document.getElementById('btn-trigger-camera');

    if (btnCamera && fileInputCamera) {
      btnCamera.addEventListener('click', () => {
        fileInputCamera.click();
      });
    }

    const btnGallery = document.getElementById('btn-trigger-gallery');

    if (btnGallery && fileInputGallery) {
      btnGallery.addEventListener('click', () => {
        fileInputGallery.click();
      });
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

  /**
   * Handle image selection.
   */
  handleFileSelect(event) {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    // Validate file type.
    if (!file.type || !file.type.startsWith('image/')) {
      if (window.App) {
        window.App.showToast(
          'Please select a valid leaf image file.',
          'error'
        );
      }

      return;
    }

    // Validate file size: 10 MB maximum.
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

  /**
   * Display selected image preview.
   */
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

  /**
   * Clear selected image and diagnosis state.
   */
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

    if (previewImg) {
      previewImg.src = '';
    }

    if (previewContainer) {
      previewContainer.classList.remove('active');
    }

    if (btnDiagnose) {
      btnDiagnose.style.display = 'none';
    }

    if (fileInputCamera) {
      fileInputCamera.value = '';
    }

    if (fileInputGallery) {
      fileInputGallery.value = '';
    }
  },

  /**
   * Send image to backend for diagnosis.
   */
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

    if (loadingBox) {
      loadingBox.classList.add('active');
    }

    if (btnDiagnose) {
      btnDiagnose.style.display = 'none';
    }

    try {
      const result =
        await window.SmartAgAPI.diagnoseCrop(this.selectedFile);

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

      const message =
        error && error.message
          ? error.message
          : 'Diagnosis failed. Please try again.';

      if (window.App) {
        window.App.showToast(message, 'error');
      }
    } finally {
      if (loadingBox) {
        loadingBox.classList.remove('active');
      }

      if (btnDiagnose && this.selectedFile) {
        btnDiagnose.style.display = 'inline-flex';
      }
    }
  },

  /**
   * Render backend diagnosis result.
   *
   * The frontend only displays values supplied by the backend.
   * It does not generate medical/agricultural recommendations.
   */
  renderDiagnosisResult(data) {
    if (!data || typeof data !== 'object') {
      console.error(
        '[DiagnosisModule] Invalid diagnosis response:',
        data
      );

      return;
    }

    // ============================================================
    // Header
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
          Math.max(0, Math.min(1, numericConfidence)) * 100
        );

        confidenceText.innerText =
          `Confidence: ${pct}%`;
      } else {
        confidenceText.innerText =
          'Confidence: unavailable';
      }
    }

    // ============================================================
    // Symptoms
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
    // Cause
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
    // Treatment
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

    /*
     * New backend field:
     *
     * recommendationsAvailable: true / false
     *
     * If the backend provides this field, use it to communicate
     * whether the disease exists in the verified knowledge base.
     *
     * We don't require the field so this frontend remains
     * compatible with the existing backend response.
     */

    const recommendationStatus =
      document.getElementById(
        'result-recommendation-status'
      );

    if (recommendationStatus) {
      if (data.recommendationsAvailable === false) {
        recommendationStatus.innerText =
          'Verified agricultural recommendations are currently unavailable for this diagnosis.';
      } else if (data.recommendationsAvailable === true) {
        recommendationStatus.innerText =
          'Agricultural recommendations verified from the knowledge base.';
      } else {
        recommendationStatus.innerText = '';
      }
    }

    // ============================================================
    // Development / Real AI indicator
    // ============================================================

    const mockIndicator =
      document.getElementById(
        'result-dev-mock-indicator'
      );

    if (mockIndicator) {
      if (data.isDevMockPayload === true) {
        mockIndicator.innerText =
          'Development mock diagnosis';
      } else if (data.isDevMockPayload === false) {
        mockIndicator.innerText =
          'AI diagnosis';
      } else {
        mockIndicator.innerText = '';
      }
    }
  },

  /**
   * Escape text before inserting backend values into innerHTML.
   *
   * This is used for symptoms, pesticide fields and prevention
   * because those sections use HTML lists.
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

      await window.SmartAgAPI.saveHistory(recordToSave);

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