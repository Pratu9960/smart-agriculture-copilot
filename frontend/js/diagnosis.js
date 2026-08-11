/**
 * Smart Agriculture Copilot - Crop Disease Diagnosis Module
 * Handles image selection, preview, validation, API request, and result rendering.
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

    [fileInputCamera, fileInputGallery].forEach(input => {
      if (input) {
        input.addEventListener('change', (e) => this.handleFileSelect(e));
      }
    });

    const btnDiagnose = document.getElementById('btn-run-diagnose');
    if (btnDiagnose) {
      btnDiagnose.addEventListener('click', () => this.executeDiagnosis());
    }

    const btnClearPhoto = document.getElementById('btn-clear-photo');
    if (btnClearPhoto) {
      btnClearPhoto.addEventListener('click', () => this.clearPreview());
    }

    const btnSaveScan = document.getElementById('btn-save-scan');
    if (btnSaveScan) {
      btnSaveScan.addEventListener('click', () => this.saveCurrentResult());
    }

    const btnScanAnother = document.getElementById('btn-scan-another');
    if (btnScanAnother) {
      btnScanAnother.addEventListener('click', () => {
        this.clearPreview();
        if (window.App) window.App.navigateTo('view-scan');
      });
    }

    const btnFindShopsForResult = document.getElementById('btn-result-find-shops');
    if (btnFindShopsForResult) {
      btnFindShopsForResult.addEventListener('click', () => {
        if (window.App) window.App.navigateTo('view-shops');
      });
    }
  },

  handleFileSelect(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
      if (window.App) window.App.showToast('Please select a valid leaf image file.', 'error');
      return;
    }

    // Validate file size (10 MB limit)
    if (file.size > 10 * 1024 * 1024) {
      if (window.App) window.App.showToast('Image file size exceeds 10MB limit.', 'error');
      return;
    }

    this.selectedFile = file;
    this.displayPreview(file);
  },

  displayPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewImg = document.getElementById('img-preview');
      const previewContainer = document.getElementById('preview-container');
      const btnDiagnose = document.getElementById('btn-run-diagnose');

      if (previewImg) previewImg.src = e.target.result;
      if (previewContainer) previewContainer.classList.add('active');
      if (btnDiagnose) btnDiagnose.style.display = 'inline-flex';
    };
    reader.readAsDataURL(file);
  },

  clearPreview() {
    this.selectedFile = null;
    this.currentResult = null;
    const previewImg = document.getElementById('img-preview');
    const previewContainer = document.getElementById('preview-container');
    const btnDiagnose = document.getElementById('btn-run-diagnose');
    const fileInputCamera = document.getElementById('input-camera');
    const fileInputGallery = document.getElementById('input-gallery');

    if (previewImg) previewImg.src = '';
    if (previewContainer) previewContainer.classList.remove('active');
    if (btnDiagnose) btnDiagnose.style.display = 'none';
    if (fileInputCamera) fileInputCamera.value = '';
    if (fileInputGallery) fileInputGallery.value = '';
  },

  async executeDiagnosis() {
    if (!this.selectedFile) {
      if (window.App) window.App.showToast('Please select or capture a leaf image first.', 'warning');
      return;
    }

    const loadingBox = document.getElementById('scan-loading-box');
    const btnDiagnose = document.getElementById('btn-run-diagnose');

    if (loadingBox) loadingBox.classList.add('active');
    if (btnDiagnose) btnDiagnose.style.display = 'none';

    try {
      const result = await window.SmartAgAPI.diagnoseCrop(this.selectedFile);
      this.currentResult = result;
      this.renderDiagnosisResult(result);
      if (window.App) window.App.navigateTo('view-result');
    } catch (err) {
      console.error('[DiagnosisModule] Error during diagnosis:', err);
      if (window.App) window.App.showToast('Diagnosis failed. Please try again.', 'error');
    } finally {
      if (loadingBox) loadingBox.classList.remove('active');
    }
  },

  renderDiagnosisResult(data) {
    // Populate header card
    const cropBadge = document.getElementById('result-crop-name');
    const diseaseName = document.getElementById('result-disease-name');
    const confidenceText = document.getElementById('result-confidence');

    if (cropBadge) cropBadge.innerText = data.crop || 'Crop';
    if (diseaseName) diseaseName.innerText = data.disease || 'Undetected Condition';
    if (confidenceText) {
      const pct = data.confidence ? Math.round(data.confidence * 100) : 90;
      confidenceText.innerText = `Confidence: ${pct}%`;
    }

    // Symptoms
    const symptomsElem = document.getElementById('result-symptoms');
    if (symptomsElem) {
      if (Array.isArray(data.symptoms) && data.symptoms.length > 0) {
        symptomsElem.innerHTML = `<ul>${data.symptoms.map(s => `<li>${s}</li>`).join('')}</ul>`;
      } else {
        symptomsElem.innerHTML = `<p>${data.symptoms || 'Visual leaf discoloration and surface spots observed.'}</p>`;
      }
    }

    // Treatment
    const treatmentElem = document.getElementById('result-treatment');
    if (treatmentElem) {
      treatmentElem.innerText = data.treatment || 'Ensure adequate air circulation and remove affected plant tissue.';
    }

    // Pesticides
    const pesticidesElem = document.getElementById('result-pesticides');
    if (pesticidesElem) {
      if (Array.isArray(data.pesticides) && data.pesticides.length > 0) {
        pesticidesElem.innerHTML = `<ul>${data.pesticides.map(p => `<li><strong>${p.name}</strong> - ${p.dosage}</li>`).join('')}</ul>`;
      } else {
        pesticidesElem.innerText = typeof data.pesticides === 'string' ? data.pesticides : 'Consult local agricultural extension for recommended fungicides.';
      }
    }

    // Fertilizer
    const fertilizerElem = document.getElementById('result-fertilizer');
    if (fertilizerElem) {
      fertilizerElem.innerText = data.fertilizer || 'Maintain balanced nitrogen and calcium fertility.';
    }

    // Prevention
    const preventionElem = document.getElementById('result-prevention');
    if (preventionElem) {
      if (Array.isArray(data.prevention) && data.prevention.length > 0) {
        preventionElem.innerHTML = `<ul>${data.prevention.map(pr => `<li>${pr}</li>`).join('')}</ul>`;
      } else {
        preventionElem.innerText = data.prevention || 'Rotate crops annually and use certified clean seeds.';
      }
    }
  },

  async saveCurrentResult() {
    if (!this.currentResult) return;

    const recordToSave = {
      ...this.currentResult,
      date: new Date().toLocaleString(),
      savedAt: Date.now()
    };

    const res = await window.SmartAgAPI.saveHistory(recordToSave);
    if (window.App) {
      window.App.showToast('✅ Scan record saved to History!', 'success');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  DiagnosisModule.init();
});

window.DiagnosisModule = DiagnosisModule;
