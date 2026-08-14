/**
 * Smart Agriculture Copilot - Language & Internationalization (i18n) Module
 * Supports English, Hindi (हिंदी), and Marathi (मराठी).
 */

const LanguageModule = {
  currentLang: localStorage.getItem('smart_ag_lang') || 'en',

  translations: {
    en: {
      appName: 'Smart Ag Copilot',
      tagline: 'AI Assistant for Indian Farmers',
      online: 'Online',
      offline: 'Offline Mode',
      scanCrop: 'Scan Crop',
      weather: 'Weather & Water',
      history: 'Scan History',
      language: 'Language',
      shops: 'Agri Shops',
      profile: 'Profile',
      heroTitle: 'Diagnose Crop Diseases Instantly',
      heroSubtitle: 'Upload or take a photo of an unhealthy leaf to receive AI remedies.',
      startScan: 'Take Photo / Upload Leaf',
      weatherWidgetTitle: 'Today\'s Farming Weather',
      selectImage: 'Select or Take Photo',
      camera: 'Camera Photo',
      gallery: 'Upload from Gallery',
      dropLeaf: 'Tap here to upload a clear leaf image',
      diagnoseBtn: 'Diagnose Crop Health',
      changePhoto: 'Choose Different Photo',
      symptoms: 'Symptoms Identified',
      treatment: 'Treatment & Remedies',
      pesticides: 'Recommended Pesticides',
      fertilizer: 'Fertilizer Guidance',
      prevention: 'Prevention Strategies',
      saveScan: 'Save to Scan History',
      findShops: 'Find Nearby Agri Shops',
      scanAnother: 'Scan Another Leaf',
      disclaimer: 'Pesticide advice should be verified with local agricultural authorities and product labels.',
      searchShops: 'Locate Agriculture Dealers',
      shopCategory: 'Select Store Category:',
      openMaps: 'Open Google Maps Search',
      detectLocation: 'Detect My Location',
      loginRegister: 'Farmer Login / Register',
      name: 'Full Name',
      phone: 'Mobile Number',
      cropType: 'Primary Crop',
      location: 'Village / District',
      saveProfile: 'Save Profile Information',
      loginBtn: 'Sign In',
      registerBtn: 'Create Account',
      logoutBtn: 'Sign Out',
      loggedInStatus: 'Logged In',
      loggedOutStatus: 'Not Logged In',
      guestFarmer: 'Guest Farmer',
      switchAccount: 'Switch Account / Login',
      authErrorInvalidEmail: 'Please enter a valid email address.',
      authErrorWeakPassword: 'Password must be at least 6 characters.',
      authErrorWrongPassword: 'Email or password is incorrect.',
      authErrorEmailInUse: 'An account with this email already exists.',
      authErrorNetwork: 'Unable to connect. Please check your internet connection and try again.',
      authErrorDefault: 'Something went wrong. Please try again.',
      authSuccessLogin: 'Logged in successfully!',
      authSuccessRegister: 'Account created successfully!',
      authSuccessLogout: 'Signed out successfully.'
    },
    hi: {
      appName: 'स्मार्ट कृषि सहायक',
      tagline: 'भारतीय किसानों के लिए एआई सहायक',
      online: 'ऑनलाइन',
      offline: 'ऑफलाइन मोड',
      scanCrop: 'फसल जांचें',
      weather: 'मौसम और सिंचाई',
      history: 'जांच इतिहास',
      language: 'भाषा बदलें',
      shops: 'कृषि दुकानें',
      profile: 'प्रोफाइल',
      heroTitle: 'फसल की बीमारी तुरंत पहचानें',
      heroSubtitle: 'पत्ती का फोटो लें और एआई से उपचार प्राप्त करें।',
      startScan: 'फोटो खींचें / अपलोड करें',
      weatherWidgetTitle: 'आज का कृषि मौसम',
      selectImage: 'फोटो चुनें या खींचें',
      camera: 'कैमरा फोटो',
      gallery: 'गैलरी से चुनें',
      dropLeaf: 'पत्ती का साफ फोटो अपलोड करने के लिए यहां टैप करें',
      diagnoseBtn: 'फसल स्वास्थ्य की जांच करें',
      changePhoto: 'दूसरी फोटो चुनें',
      symptoms: 'पहचाने गए लक्षण',
      treatment: 'उपचार और उपाय',
      pesticides: 'अनुशंसित कीटनाशक',
      fertilizer: 'उर्वरक सलाह',
      prevention: 'बचाव के तरीके',
      saveScan: 'इतिहास में सहेजें',
      findShops: 'पास की कृषि दुकानें खोजें',
      scanAnother: 'दूसरी पत्ती की जांच करें',
      disclaimer: 'कीटनाशक उपयोग से पहले स्थानीय कृषि अधिकारी या लेबल से पुष्टि करें।',
      searchShops: 'कृषि विक्रेताओं को खोजें',
      shopCategory: 'दुकान की श्रेणी चुनें:',
      openMaps: 'गूगल मैप्स खोज खोलें',
      detectLocation: 'मेरा स्थान पहचानें',
      loginRegister: 'किसान लॉगिन / पंजीकरण',
      name: 'पूरा नाम',
      phone: 'मोबाइल नंबर',
      cropType: 'मुख्य फसल',
      location: 'गांव / जिला',
      saveProfile: 'प्रोफाइल सहेजें',
      loginBtn: 'साइन इन करें',
      registerBtn: 'खाता बनाएं',
      logoutBtn: 'साइन आउट',
      loggedInStatus: 'लॉग इन',
      loggedOutStatus: 'लॉग इन नहीं है',
      guestFarmer: 'अतिथि किसान',
      switchAccount: 'खाता बदलें / लॉगिन',
      authErrorInvalidEmail: 'कृपया एक मान्य ईमेल पता दर्ज करें।',
      authErrorWeakPassword: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
      authErrorWrongPassword: 'ईमेल या पासवर्ड गलत है।',
      authErrorEmailInUse: 'इस ईमेल से पहले से एक खाता मौजूद है।',
      authErrorNetwork: 'कनेक्ट करने में असमर्थ। कृपया अपना इंटरनेट कनेक्शन जांचें।',
      authErrorDefault: 'कुछ गलत हो गया। कृपया पुन: प्रयास करें।',
      authSuccessLogin: 'सफलतापूर्वक लॉग इन किया गया!',
      authSuccessRegister: 'खाता सफलतापूर्वक बनाया गया!',
      authSuccessLogout: 'सफलतापूर्वक साइन आउट किया गया।'
    },
    mr: {
      appName: 'स्मार्ट शेती मित्र',
      tagline: 'भारतीय शेतकऱ्यांसाठी AI सहाय्यक',
      online: 'ऑनलाइन',
      offline: 'ऑफलाइन मोड',
      scanCrop: 'पिकाची तपासणी',
      weather: 'हवामान व पाणी',
      history: 'तपासणी इतिहास',
      language: 'भाषा निवडा',
      shops: 'कृषी दुकाने',
      profile: 'प्रोफाईल',
      heroTitle: 'पिकाचे आजार त्वरित ओळखा',
      heroSubtitle: 'पानाचा फोटो काढा आणि AI कडून तात्काळ उपाय मिळवा.',
      startScan: 'फोटो काढा / अपलोड करा',
      weatherWidgetTitle: 'आजचे शेती हवामान',
      selectImage: 'फोटो निवडा किंवा काढा',
      camera: 'कॅमेरा फोटो',
      gallery: 'गॅलरीतून निवडा',
      dropLeaf: 'पानाचा स्वच्छ फोटो अपलोड करण्यासाठी येथे टॅप करा',
      diagnoseBtn: 'पिकाचे आरोग्य तपासा',
      changePhoto: 'दुसरा फोटो निवडा',
      symptoms: 'आढळून आलेली लक्षणे',
      treatment: 'उपचार व उपाययोजना',
      pesticides: 'कीटकनाशक सल्ला',
      fertilizer: 'खत व्यवस्थापन',
      prevention: 'प्रतिबंधात्मक उपाय',
      saveScan: 'इतिहासात जतन करा',
      findShops: 'जवळील कृषी दुकाने शोधा',
      scanAnother: 'दुसऱ्या पानाची तपासणी',
      disclaimer: 'कीटकनाशकाचा वापर करण्यापूर्वी कृषी तज्ज्ञांचा किंवा लेबलचा सल्ला घ्या.',
      searchShops: 'कृषी विक्रेते शोधा',
      shopCategory: 'दुकानाचा प्रकार निवडा:',
      openMaps: 'गूगल मॅप्स शोध उघडा',
      detectLocation: 'माझे स्थान शोधा',
      loginRegister: 'शेतकरी लॉगिन / नोंदणी',
      name: 'पूर्ण नाव',
      phone: 'मोबाईल नंबर',
      cropType: 'मुख्य पीक',
      location: 'गाव / जिल्हा',
      saveProfile: 'प्रोफाईल जतन करा',
      loginBtn: 'लॉगिन करा',
      registerBtn: 'खाते तयार करा',
      logoutBtn: 'लॉग आउट करा',
      loggedInStatus: 'लॉग इन झाले',
      loggedOutStatus: 'लॉग इन नाही',
      guestFarmer: 'अतिथी शेतकरी',
      switchAccount: 'खाते बदला / लॉगिन',
      authErrorInvalidEmail: 'कृपया वैध ईमेल पत्ता प्रविष्ट करा.',
      authErrorWeakPassword: 'पासवर्ड किमान 6 अक्षरांचा असावा.',
      authErrorWrongPassword: 'ईमेल किंवा पासवर्ड चुकीचा आहे.',
      authErrorEmailInUse: 'या ईमेलसह आधीच खाते अस्तित्वात आहे.',
      authErrorNetwork: 'कनेक्ट करण्यात अयशस्वी. कृपया इंटरनेट कनेक्शन तपासा.',
      authErrorDefault: 'काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.',
      authSuccessLogin: 'यशस्वीरित्या लॉगिन झाले!',
      authSuccessRegister: 'खाते यशस्वीरित्या तयार केले गेले!',
      authSuccessLogout: 'यशस्वीरित्या साइन आउट केले.'
    }
  },

  init() {
    this.setLanguage(this.currentLang);
    this.setupUI();
  },

  setLanguage(langCode) {
    if (!this.translations[langCode]) {
      langCode = 'en';
    }
    this.currentLang = langCode;
    localStorage.setItem('smart_ag_lang', langCode);

    // Update active state in Language Selection View cards
    document.querySelectorAll('.lang-card').forEach(card => {
      if (card.getAttribute('data-lang') === langCode) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    // Update header pill text
    const langPillText = document.getElementById('active-lang-text');
    if (langPillText) {
      const labels = { en: 'EN', hi: 'हिंदी', mr: 'मराठी' };
      langPillText.innerText = labels[langCode] || 'EN';
    }

    this.translateDOM();
  },

  t(key) {
    const dict = this.translations[this.currentLang] || this.translations.en;
    return dict[key] || this.translations.en[key] || key;
  },

  translateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(elem => {
      const key = elem.getAttribute('data-i18n');
      const translated = this.t(key);
      if (translated) {
        if (elem.tagName === 'INPUT' && (elem.type === 'button' || elem.type === 'submit')) {
          elem.value = translated;
        } else if (elem.tagName === 'INPUT' && elem.placeholder) {
          elem.placeholder = translated;
        } else {
          elem.innerText = translated;
        }
      }
    });

    // Update connectivity UI text if App is loaded
    if (window.App) {
      window.App.updateConnectivityUI();
    }
  },

  setupUI() {
    document.querySelectorAll('.lang-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const lang = e.currentTarget.getAttribute('data-lang');
        if (lang) {
          this.setLanguage(lang);
          if (window.App) {
            window.App.showToast(`Language set to ${lang.toUpperCase()}`, 'success');
          }
        }
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  LanguageModule.init();
});

window.i18n = LanguageModule;
window.LanguageModule = LanguageModule;
