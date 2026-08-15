/**
 * Centralized Crop Metadata System
 * Shared across Crop Scan, Market Prices, Farm Profile, and Government Schemes
 */

const CropsData = {
  crops: [
    {
      id: 'soybean',
      name: 'Soybean',
      marathiName: 'सोयाबीन',
      hindiName: 'सोयाबीन',
      tamilName: 'சோயாபீன்',
      teluguName: 'సోయాబీన్',
      category: 'Oilseeds',
      accentColor: '#2d6a4f',
      lightAccent: '#d8f3dc',
      defaultVariety: 'Yellow',
      unit: '₹ / Quintal',
      iconSvg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-8m0 0c-4.4 0-8-3.6-8-8 0 0 3.6 1 8 1s8-1 8-1c0 4.4-3.6 8-8 8z"/></svg>'
    },
    {
      id: 'tomato',
      name: 'Tomato',
      marathiName: 'टोमॅटो',
      hindiName: 'टमाटर',
      tamilName: 'தக்காளி',
      teluguName: 'టమోటా',
      category: 'Vegetables',
      accentColor: '#e76f51',
      lightAccent: '#ffe8e1',
      defaultVariety: 'Hybrid',
      unit: '₹ / Quintal',
      iconSvg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="14" r="8"/><path d="M12 6V2m-3 3 6 0m-4 1c-2-2-4-2-4-2m7 2c2-2 4-2 4-2"/></svg>'
    },
    {
      id: 'onion',
      name: 'Onion',
      marathiName: 'कांदा',
      hindiName: 'प्याज़',
      tamilName: 'வெங்காயம்',
      teluguName: 'ఉల్లిపాయ',
      category: 'Vegetables',
      accentColor: '#b7094c',
      lightAccent: '#fce4ec',
      defaultVariety: 'Red / Nasik',
      unit: '₹ / Quintal',
      iconSvg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v3m0 17c-5 0-9-4-9-9 0-4.5 4-7.5 9-11 5 3.5 9 6.5 9 11 0 5-4 9-9 9z"/><path d="M12 7c-3 3-3 8 0 11m0-11c3 3 3 8 0 11"/></svg>'
    },
    {
      id: 'wheat',
      name: 'Wheat',
      marathiName: 'गहू',
      hindiName: 'गेहूं',
      tamilName: 'கோதுமை',
      teluguName: 'గోధుమలు',
      category: 'Cereals & Grains',
      accentColor: '#d4a373',
      lightAccent: '#faedcd',
      defaultVariety: 'Lokwan / Sharbati',
      unit: '₹ / Quintal',
      iconSvg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22V8m0 0C10 6 8 8 8 8s0 4 4 0zm0 0c2-2 4 0 4 0s0 4-4 0zm0 4C10 10 8 12 8 12s0 4 4 0zm0 0c2-2 4 0 4 0s0 4-4 0zm0 4c-2-2-4 0-4 0s0 4 4 0zm0 0c2-2 4 0 4 0s0 4-4 0z"/></svg>'
    },
    {
      id: 'cotton',
      name: 'Cotton',
      marathiName: 'कापूस',
      hindiName: 'कपास',
      tamilName: 'பருத்தி',
      teluguName: 'పత్తి',
      category: 'Cash Crops',
      accentColor: '#52b788',
      lightAccent: '#e8f5e9',
      defaultVariety: 'Medium Staple',
      unit: '₹ / Quintal',
      iconSvg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-6m0 0c-3 0-5-2-5-5 0-3 2-4 4-4 1-2 3-3 5-2 2 1 3 3 2 5 2 0 4 2 4 4 0 3-2 5-5 5z"/></svg>'
    },
    {
      id: 'rice',
      name: 'Rice (Paddy)',
      marathiName: 'तांदूळ / भात',
      hindiName: 'धान / चावल',
      tamilName: 'நெல்',
      teluguName: 'వరి',
      category: 'Cereals & Grains',
      accentColor: '#6a994e',
      lightAccent: '#f0f7ea',
      defaultVariety: 'Common / Basmati',
      unit: '₹ / Quintal',
      iconSvg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-9m0 0c-2-3-1-7 2-9 3 2 4 6 2 9-1 1-3 1-4 0z"/><path d="M8 17c-2-2-1-5 1-7m8 7c2-2 1-5-1-7"/></svg>'
    },
    {
      id: 'gram',
      name: 'Gram (Chana)',
      marathiName: 'हरभरा / चणा',
      hindiName: 'चना',
      tamilName: 'கொண்டைக்கடலை',
      teluguName: 'శనగలు',
      category: 'Pulses',
      accentColor: '#f4a261',
      lightAccent: '#fef5ec',
      defaultVariety: 'Desi',
      unit: '₹ / Quintal',
      iconSvg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="7"/><path d="M12 5c2 2 3 5 3 7s-1 5-3 7"/></svg>'
    },
    {
      id: 'maize',
      name: 'Maize',
      marathiName: 'मका',
      hindiName: 'मक्का',
      tamilName: 'மக்காச்சோளம்',
      teluguName: 'మొక్కజొన్న',
      category: 'Cereals & Grains',
      accentColor: '#e9c46a',
      lightAccent: '#fff9db',
      defaultVariety: 'Yellow',
      unit: '₹ / Quintal',
      iconSvg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-4m-4 4c0-4 1-8 4-12 3 4 4 8 4 12m-8-8c3 1 5 1 8 0m-7 4c2 1 4 1 6 0"/></svg>'
    },
    {
      id: 'turmeric',
      name: 'Turmeric',
      marathiName: 'हळद',
      hindiName: 'हल्दी',
      tamilName: 'மஞ்சள்',
      teluguName: 'పసుపు',
      category: 'Spices',
      accentColor: '#fb8500',
      lightAccent: '#fff3e0',
      defaultVariety: 'Salem / Rajapuri',
      unit: '₹ / Quintal',
      iconSvg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 18c2-4 6-6 10-6 2 0 4 1 5 3m-15 3c1 2 3 3 5 3 4 0 8-3 10-6m-15 3V9a6 6 0 0 1 12 0v3"/></svg>'
    },
    {
      id: 'groundnut',
      name: 'Groundnut',
      marathiName: 'भुईमूग / शेंगदाणा',
      hindiName: 'मूंगफली',
      tamilName: 'வேர்க்கடலை',
      teluguName: 'వేరుశనగ',
      category: 'Oilseeds',
      accentColor: '#9c6644',
      lightAccent: '#f5ebe0',
      defaultVariety: 'Bold / Pod',
      unit: '₹ / Quintal',
      iconSvg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/></svg>'
    },
    {
      id: 'sugarcane',
      name: 'Sugarcane',
      marathiName: 'ऊस',
      hindiName: 'गन्ना',
      tamilName: 'கரும்பு',
      teluguName: 'చెరకు',
      category: 'Cash Crops',
      accentColor: '#38b000',
      lightAccent: '#ebfbee',
      defaultVariety: 'Co 86032',
      unit: '₹ / Quintal',
      iconSvg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M9 6h6M9 12h6M9 18h6"/></svg>'
    },
    {
      id: 'chilli',
      name: 'Green Chilli',
      marathiName: 'हिरवी मिरची',
      hindiName: 'हरी मिर्च',
      tamilName: 'பச்சை மிளகாய்',
      teluguName: 'పచ్చి మిరపకాయ',
      category: 'Vegetables',
      accentColor: '#d90429',
      lightAccent: '#ffebee',
      defaultVariety: 'G-4',
      unit: '₹ / Quintal',
      iconSvg: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3c-1 3-2 6-2 10 0 4 2 7 4 8 1 0 2-1 2-2 1-3 0-6-1-9-1-3-2-5-3-7z"/><path d="M12 3c2-2 4-2 6-1"/></svg>'
    }
  ],

  getCrops() {
    return this.crops;
  },

  getCropById(id) {
    if (!id) return this.crops[0];
    const match = this.crops.find(c => c.id.toLowerCase() === id.toLowerCase() || c.name.toLowerCase() === id.toLowerCase());
    return match || this.crops[0];
  },

  getCropDisplayName(cropObj, lang = 'en') {
    if (!cropObj) return '';
    if (lang === 'mr' && cropObj.marathiName) return cropObj.marathiName;
    if (lang === 'hi' && cropObj.hindiName) return cropObj.hindiName;
    if (lang === 'ta' && cropObj.tamilName) return cropObj.tamilName;
    if (lang === 'te' && cropObj.teluguName) return cropObj.teluguName;
    return cropObj.name;
  }
};

window.CropsData = CropsData;
