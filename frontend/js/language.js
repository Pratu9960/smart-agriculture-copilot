/* Central UI language service for HaritKranti. */
const LanguageModule = {
  storageKey: 'smart_ag_language',
  supportedLanguages: { en: 'English', mr: 'मराठी', hi: 'हिन्दी', ta: 'தமிழ்', te: 'తెలుగు' },
  currentLang: 'en',
  translations: {
    en: {
      auth: { workspace: 'Your farm workspace', visualOverline: 'Agricultural intelligence for every growing season', visualTitle: 'Smarter decisions. Healthier crops.', visualBody: 'AI-powered crop diagnosis, weather insights, mandi prices, and verified agricultural guidance — all in one workspace.', secure: 'Secure workspace', connected: 'Online + on-device ready', signInTitle: 'Welcome back', signInSubtitle: 'Sign in to continue to your crop intelligence workspace.', createTitle: 'Create your workspace', createSubtitle: 'Create a secure workspace for your crop insights.', signIn: 'Sign in', createAccount: 'Create account', fullName: 'Full Name', email: 'Email Address', password: 'Password', confirmPassword: 'Confirm Password', remember: 'Remember me', forgot: 'Forgot password?', show: 'Show', hide: 'Hide', submitSignIn: 'Sign in', submitCreate: 'Create account', newHere: "Don't have an account?", alreadyMember: 'Already have an account?', switchCreate: 'Create account', switchSignIn: 'Sign in', continueWithGoogle: 'Continue with Google', orDivider: 'OR', legal: 'By continuing, you agree to use AI guidance alongside local agricultural expertise.', processing: 'Processing...', resetSent: 'Password reset email sent. Check your inbox.', resetPrompt: 'Enter your email address first, then choose forgot password.', passwordMismatch: 'Passwords do not match. Please check both fields.', confirmPasswordRequired: 'Please confirm your password.', missingPassword: 'Please enter your password.' },
      nav: { home: 'Home', dashboard: 'Dashboard', scan: 'Scan crop', weather: 'Weather', market: 'Market prices', schemes: 'Govt schemes', history: 'History', profile: 'Profile', language: 'Language', more: 'More' },
      network: { online: 'Online', offline: 'Offline', onlineAI: 'Online AI available', offlineAI: 'Offline AI available', offlineUnavailable: 'Offline AI unavailable on this device', usingOnline: 'Using Online AI', usingOffline: 'Using Offline AI', connectionLost: 'You are offline. Checking local AI availability.', connectionRestored: 'Connection restored. Online AI is available.', offlineBanner: 'Offline right now. Local capabilities remain available.' },
      dashboard: { eyebrow: 'YOUR FIELD WORKSPACE', greeting: 'Good to see you, {{name}}.', subtitle: 'Clear signals for better crop decisions.', heroEyebrow: 'CROP INTELLIGENCE', heroTitle: 'Smarter decisions for healthier crops.', heroBody: 'Upload a leaf image and get practical, explainable guidance for what to do next.', startScan: 'Start a crop scan', quickEyebrow: 'QUICK ACCESS', quickTitle: 'Useful around the farm', scanTitle: 'Scan crop health', scanBody: 'Photo to practical next steps', weatherTitle: 'Weather & water', weatherBody: 'Make irrigation decisions with confidence', marketTitle: 'Market prices & trends', marketBody: 'Latest mandi prices and 30-day historical trends', schemesTitle: 'Government schemes', schemesBody: 'Explore subsidies, PM-KISAN, crop insurance & more', historyTitle: 'Scan history', historyBody: 'Review your farm’s recent insights', nearby: 'Nearby agri shops', settings: 'Profile settings' },
      scan: { eyebrow: 'CROP INTELLIGENCE', title: 'Crop scan', subtitle: 'Upload a clear image of your crop or leaf for AI analysis.', upload: 'Upload crop image', formats: 'JPG or PNG • Up to 10 MB', photoTip: 'For best results, use a well-lit photo of one leaf.', takePhoto: 'Take photo', uploadImage: 'Upload image', ready: 'Ready for analysis', review: 'Review your image before continuing.', analyze: 'Analyze crop', guideEyebrow: 'PHOTO GUIDE', guideTitle: 'Help the model see clearly', guideOne: 'Use natural light and avoid glare.', guideTwo: 'Keep the leaf centered and in focus.', guideThree: 'Include one affected leaf at a time.', privacy: 'Your image is sent only to the connected analysis service.', analyzing: 'Analyzing your crop...', stepSymptoms: 'Checking visual symptoms', stepPatterns: 'Comparing crop patterns', stepRecommendations: 'Preparing recommendations', newScan: 'New scan', invalidImage: 'Please select a valid crop image.', tooLarge: 'Image file size exceeds 10 MB.', selectFirst: 'Please select or capture a crop image first.', onlineNeedsConnection: 'Online AI needs a connection. Reconnect or use the local model in the app.', offlineUnavailable: 'You are offline and this browser does not have the local agriculture model installed.', offlineNoResult: 'The local model did not return a diagnosis. Check that it is installed and ready.', offlineUnreadable: 'The local model returned an unreadable diagnosis.', offlineUnsupported: 'The local model returned an unsupported diagnosis format.', diagnosisFailed: 'Crop analysis failed. Please try again.' },
      diagnosis: { eyebrow: 'ANALYSIS COMPLETE', title: 'Crop analysis', observation: 'OBSERVATION', observationTitle: 'What we found', nextStep: 'NEXT STEP', actionTitle: 'Recommended action', confidence: 'Confidence', aiVision: 'AI vision analysis', severity: 'Severity', crop: 'Crop', prevention: 'Prevention', inputs: 'Inputs to consider', overviewFallback: 'Your crop image has been reviewed for visible symptoms.', symptomsFallback: 'Visual symptoms will appear here.', treatmentFallback: 'Treatment guidance will appear here.', fertilizerFallback: 'Fertilizer guidance will appear here.', pesticidesFallback: 'Recommended products will appear here.', disclaimer: 'AI guidance supports farm decisions and should be verified with local agricultural authorities and product labels.', save: 'Save to scan history', findShops: 'Find nearby agri shops', saved: 'Scan record saved to history.', saveFailed: 'Unable to save scan to history. Please try again.' },
      weather: { eyebrow: 'FIELD CONDITIONS', title: 'Weather & water', currentLocation: 'Current location', locationLoading: 'Detecting your location...', current: 'CURRENT CONDITIONS', temperature: 'Temperature', humidity: 'Humidity', wind: 'Wind', rain: 'Rain chance', refresh: 'Refresh weather location', adviceEyebrow: 'IRRIGATION ADVISORY', loading: 'Loading field guidance', loadingBody: 'Weather-based irrigation guidance will appear when current conditions are available.', unavailableLocation: 'Live conditions unavailable', unavailableCondition: 'Weather service unavailable', unavailableTitle: 'No live irrigation guidance', unavailableBody: 'Reconnect to retrieve current conditions before planning irrigation.', fallbackAdvice: 'Follow standard irrigation guidance for your crop.', pageSubtitle: 'Your local weather and farming conditions', locationLabel: 'Location', locationPermissionTitle: 'Allow location access', locationPermissionBody: 'Use your location to provide local weather and agricultural recommendations.', useLocation: 'Use My Location', searchLocation: 'Search Location', changeLocation: 'Change location', gettingLocationTitle: 'Getting your location...', gettingLocationBody: 'Allow location access to determine your coordinates.', fetchingWeatherTitle: 'Fetching local weather...', fetchingWeatherBody: 'Retrieving live conditions for your selected location.', locationDeniedTitle: 'Location access is unavailable', locationDeniedBody: 'Location permission was denied. Search for a city or locality instead.', locationUnavailableTitle: 'Unable to determine your location', locationUnavailableBody: 'Your device could not provide a usable position. You can retry or search manually.', locationTimeoutTitle: 'Location request timed out', locationTimeoutBody: 'Try again, or search for a city or locality manually.', locationUnsupportedTitle: 'Location is not supported', locationUnsupportedBody: 'This browser does not support device location. Search for a city or locality instead.', offlineTitle: 'Weather requires an internet connection', offlineBody: 'Live weather is unavailable while you are offline. Cached weather will appear here when available.', serviceErrorTitle: 'Weather service is temporarily unavailable', serviceErrorBody: 'We could not retrieve live weather right now. Try again or change location.', invalidLocationTitle: 'We couldn’t find weather information for this location', invalidLocationBody: 'Search again and select a nearby city, town, district, or locality.', lastUpdated: 'Last updated: {{time}}', live: 'Live', cached: 'Cached', offlineCached: 'Offline · showing last available weather', searchTitle: 'Search for your location', searchPlaceholder: 'City, town, district or locality', searching: 'Searching locations...', noSearchResults: 'No matching locations found.', locationSearchUnavailable: 'Location search is temporarily unavailable. Try again.', retry: 'Retry', cancel: 'Cancel', currentWeather: 'CURRENT WEATHER', atAGlance: 'At a glance', precipitation: 'Precipitation', windDirection: 'Wind direction', cloudCover: 'Cloud cover', visibility: 'Visibility', pressure: 'Pressure', rainWater: 'RAIN & WATER', rainIrrigation: 'Rain & irrigation', rainSummary: 'Rain information', upcoming: 'UPCOMING CONDITIONS', forecast: 'Forecast', forecastUnavailable: 'Forecast information is unavailable for this response.', rainProbabilityValue: '{{value}}% rain probability', precipitationValue: '{{value}} mm precipitation', rainDataUnavailable: 'Rainfall details are not available.', adviceUnavailable: 'Irrigation guidance unavailable', adviceUnavailableBody: 'Use current rainfall and soil moisture information before irrigating.', unknownCondition: 'Conditions unavailable' },
      market: {
        eyebrow: 'MANDI INTELLIGENCE',
        title: 'Market prices',
        subtitle: 'Check recent mandi prices and historical trends for your crop and location.',
        selectCrop: 'Select crop',
        selectLocation: 'Select location',
        detectLocation: 'Detect location',
        allMarkets: 'All Mandis',
        latestTitle: 'Latest Mandi Price',
        modalPrice: 'Modal Price',
        minPrice: 'Min Price',
        maxPrice: 'Max Price',
        priceUnit: '₹ / Quintal',
        variety: 'Variety: {{value}}',
        updated: 'Updated: {{date}}',
        latestAvailable: 'Latest available market data',
        saveCrop: '☆ Save crop',
        saveMarket: '☆ Save mandi',
        saved: '★ Saved to profile',
        compareTitle: 'Compare Mandis',
        compareSubtitle: 'Wholesale prices across nearby district markets',
        highestPrice: 'Highest price',
        lowestPrice: 'Lowest price',
        nearestLocation: 'Nearest location',
        sameDistrict: 'Same District',
        sameState: 'Same State',
        otherMarket: 'Other Market',
        priceHistoryTitle: 'Price History & Trend Analysis',
        priceHistorySubtitle: 'Understand how this crop’s wholesale mandi price has changed over time.',
        period7d: '7 Days',
        period30d: '30 Days',
        period3m: '3 Months',
        period6m: '6 Months',
        period1y: '1 Year',
        typeModal: 'Modal Price',
        typeMin: 'Minimum Price',
        typeMax: 'Maximum Price',
        summaryLatest: 'Latest Modal Price',
        summaryHigh: 'Period High',
        summaryLow: 'Period Low',
        summaryChange: 'Price Change',
        trendTitle: 'Price Trend',
        trendIncreasing: 'Increasing',
        trendStable: 'Stable',
        trendDecreasing: 'Decreasing',
        trendInsufficient: 'Insufficient data',
        whatChartShowsTitle: 'What the chart shows',
        historicalRecordsTitle: 'Historical Records',
        downloadCsv: 'Download Price History (CSV)',
        tableDate: 'Date',
        tableMarket: 'Market / Mandi',
        tableCommodity: 'Commodity',
        tableVariety: 'Variety',
        tableMin: 'Min (₹)',
        tableModal: 'Modal (₹)',
        tableMax: 'Max (₹)',
        noDataTitle: 'No market data found',
        noDataBody: 'No market records found for this crop and location. Try selecting another market or crop.',
        serviceErrorTitle: 'Market service unavailable',
        serviceErrorBody: 'Market prices are temporarily unavailable. Please retry or check your network.',
        offlineTitle: 'Offline Mode',
        offlineCached: 'Offline · Showing last available market data (Updated: {{date}})',
        offlineNoCache: 'Market prices require an active internet connection to load fresh records.',
        sourceLabel: 'Source: Government of India — Data.gov.in / AGMARKNET',
        sourceInfo: 'Daily wholesale agricultural mandi arrival data released under Open Government Data (OGD) Platform India.',
        officialPortal: 'Agmarknet Portal ↗',
        retry: 'Retry',
        loading: 'Fetching mandi prices...'
      },
      schemes: {
        eyebrow: 'GOVERNMENT INITIATIVES',
        title: 'Government schemes',
        subtitle: 'Discover financial support, subsidies, and insurance available for farmers.',
        searchPlaceholder: 'Search schemes by crop, name, or keyword (e.g. crop insurance, solar pump, PM Kisan)...',
        allCategories: 'All Categories',
        allLevels: 'All Levels',
        central: 'Central Govt',
        state: 'State Govt',
        allStates: 'All States',
        recommendedTitle: 'Recommended for your farm',
        recommendedSubtitle: 'Schemes matched with your profile crop & location',
        mayBeRelevant: 'May be relevant to your farm profile',
        viewDetails: 'View Details',
        checkEligibility: 'Check Eligibility',
        officialWebsite: 'Official Website ↗',
        modalOverview: 'Scheme Overview',
        modalBenefits: 'Key Benefits',
        modalEligibility: 'Eligibility Criteria',
        modalDocuments: 'Required Documents',
        modalApplication: 'Application Process',
        modalSource: 'Official Source & Verification',
        eligibilityTitle: 'Eligibility Self-Check',
        eligibilitySubtitle: 'Answer a few questions to see if you appear to meet the primary criteria based on official guidelines.',
        btnCheckNow: 'Evaluate Eligibility',
        btnProceedOfficial: 'Proceed to Official Portal',
        qLandowner: 'Do you own cultivable agricultural land in your name?',
        qAadhaar: 'Do you have an active Aadhaar card linked with your mobile?',
        qBank: 'Do you have an Aadhaar-seeded bank account (NPCI mapped)?',
        qTax: 'Are you an income tax payer or government employee?',
        qWater: 'Do you have an assured water source (well / borewell / canal / pond)?',
        yes: 'Yes',
        no: 'No',
        matchedHeader: 'Criteria Met',
        unmatchedHeader: 'Important Conditions to Verify',
        noSchemesFound: 'No government schemes found matching your search. Try different keywords or reset filters.',
        offlineTitle: 'Offline Mode',
        offlineBody: 'Showing cached verified scheme directory. Connect to internet to check latest portal updates.',
        sourceLabel: 'Source: Government of India — myScheme.gov.in / Ministry of Agriculture & Farmers Welfare',
        sourceDisclaimer: 'Information is grounded in official government notifications. Always verify with local agricultural offices or official portals before applying.'
      },
      history: { eyebrow: 'YOUR RECORDS', title: 'Scan history', subtitle: 'Review your recent crop analyses.', sync: 'Sync records', search: 'Search crop or condition', emptyTitle: 'No scan history yet', emptyBody: 'Your saved crop analyses will appear here.', analysisRecord: 'Analysis record', severity: '{{value}} severity', detail: 'Diagnosis detail', date: 'Date', status: 'Status', symptoms: 'Symptoms', treatment: 'Treatment', syncAlready: 'All scan records are already synchronized.', syncStart: 'Synchronizing records with cloud...', syncSuccess: 'All pending records synchronized.', syncFailed: 'Records could not be synchronized. They remain available on this device.' },
      profile: { eyebrow: 'ACCOUNT', title: 'Profile settings', subtitle: 'Keep your workspace details and preferences up to date.', fullName: 'Full name', phone: 'Mobile number', crop: 'Primary crop', location: 'Village / district', save: 'Save profile', statusEyebrow: 'WORKSPACE STATUS', network: 'Network', bridge: 'Offline model bridge', accountSync: 'Account sync', signOut: 'Sign out', signedIn: 'Signed in as {{email}}. Scans and settings are synchronized.', signInToSync: 'Sign in to sync records.', connected: 'Connected', localMode: 'Offline (local mode)', bridgeAvailable: 'Available (Android app)', bridgeUnavailable: 'Unavailable (standard browser)', saved: 'Profile information updated successfully.' },
      shops: { eyebrow: 'LOCAL SUPPORT', title: 'Nearby agri shops', subtitle: 'Find agriculture suppliers around your current location.', store: 'Agri store', pesticides: 'Pesticides', fertilizer: 'Fertilizer', seeds: 'Seeds', detect: 'Detect my location', detecting: 'Detecting GPS location...', found: 'Location found ({{lat}}, {{lon}})', manual: 'Using manual/general area search', unavailable: 'Browser geolocation unavailable', search: 'Search: “{{category}}” {{near}}', near: 'near current coordinates', open: 'Open Google Maps', noteTitle: 'Location-aware search', noteBody: 'Your browser location is used only to center the map search.' },
      language: { eyebrow: 'PREFERENCES', title: 'Language', subtitle: 'Choose the language you’re most comfortable using in the field.', default: 'Default language', hindi: 'Hindi', marathi: 'Marathi', tamil: 'Tamil', telugu: 'Telugu', changed: 'Language changed to {{language}}.' },
      validation: { invalidEmail: 'Please enter a valid email address.', weakPassword: 'Password must be at least 6 characters.', missingEmail: 'Please enter your email address.', nameRequired: 'Please enter your full name.', wrongPassword: 'Email or password is incorrect.', emailInUse: 'This email is already registered.', popupClosed: 'Sign in popup was closed before completing. Please try again.', popupCancelled: 'Sign in popup request was cancelled. Please try again.', popupBlocked: 'Sign in popup was blocked by your browser. Please allow popups for this site and try again.', accountExistsDifferentCredential: 'An account already exists with the same email using a different sign-in method.', unauthorizedDomain: 'This domain is not authorized for OAuth sign-in. Please contact support.', googleProviderNotFound: 'Google Sign-In is temporarily unavailable. Please try again.', network: 'Unable to connect. Please check your internet connection and try again.', default: 'Something went wrong. Please try again.', resetUnavailable: 'Unable to send a password reset email.' },
      authStatus: { loginSuccess: 'Logged in successfully.', registerSuccess: 'Account created successfully.', logoutSuccess: 'Signed out successfully.', tooMany: 'Too many attempts. Please wait a moment and try again.', disabled: 'This account has been deactivated. Please contact support.', notAllowed: 'Email and password login is not enabled in Firebase.' },
      common: { back: 'Back', retry: 'Retry', cancel: 'Cancel', remove: 'Remove image', change: 'Change image', loading: 'Loading...', online: 'Online', offline: 'Offline' }
    },
    mr: {
      auth: { workspace: 'तुमचे शेती कार्यक्षेत्र', visualOverline: 'प्रत्येक हंगामासाठी कृषी बुद्धिमत्ता', visualTitle: 'अधिक चांगले निर्णय. निरोगी पिके.', visualBody: 'एआय-आधारित पीक तपासणी, हवामान माहिती, बाजार भाव आणि खात्रीशीर कृषी मार्गदर्शन — सर्व एकाच कार्यक्षेत्रात.', secure: 'सुरक्षित कार्यक्षेत्र', connected: 'ऑनलाइन + डिव्हाइसवर उपलब्ध', signInTitle: 'पुन्हा स्वागत आहे', signInSubtitle: 'तुमच्या पीक माहिती कार्यक्षेत्रात जाण्यासाठी साइन इन करा.', createTitle: 'तुमचे कार्यक्षेत्र तयार करा', createSubtitle: 'तुमच्या पीक माहितीसाठी सुरक्षित कार्यक्षेत्र तयार करा.', signIn: 'साइन इन', createAccount: 'खाते तयार करा', fullName: 'पूर्ण नाव', email: 'ईमेल पत्ता', password: 'पासवर्ड', confirmPassword: 'पासवर्ड पुन्हा लिहा', remember: 'मला लक्षात ठेवा', forgot: 'पासवर्ड विसरलात?', show: 'दाखवा', hide: 'लपवा', submitSignIn: 'साइन इन', submitCreate: 'खाते तयार करा', newHere: 'HaritKranti वर नवीन आहात?', alreadyMember: 'आधीच खाते आहे?', switchCreate: 'खाते तयार करा', switchSignIn: 'साइन इन', continueWithGoogle: 'Google सह सुरू ठेवा', orDivider: 'किंवा', legal: 'पुढे सुरू ठेवून, एआय मार्गदर्शनासोबत स्थानिक कृषी तज्ज्ञांचा सल्ला घेण्यास आपण सहमत आहात.', processing: 'प्रक्रिया सुरू आहे...', resetSent: 'पासवर्ड बदलण्याचा ईमेल पाठवला आहे. तुमचा इनबॉक्स तपासा.', resetPrompt: 'आधी ईमेल पत्ता लिहा आणि मग पासवर्ड विसरलात हे निवडा.', passwordMismatch: 'दोन्ही पासवर्ड जुळत नाहीत. कृपया तपासा.', confirmPasswordRequired: 'कृपया पासवर्डची खात्री करा.', missingPassword: 'कृपया पासवर्ड लिहा.' },
      nav: { home: 'मुख्यपृष्ठ', dashboard: 'डॅशबोर्ड', scan: 'पीक तपासा', weather: 'हवामान', market: 'बाजार भाव', schemes: 'शासकीय योजना', history: 'इतिहास', profile: 'प्रोफाइल', language: 'भाषा', more: 'अधिक' },
      network: { online: 'ऑनलाइन', offline: 'ऑफलाइन', onlineAI: 'ऑनलाइन एआय उपलब्ध', offlineAI: 'ऑफलाइन एआय उपलब्ध', offlineUnavailable: 'या डिव्हाइसवर ऑफलाइन एआय उपलब्ध नाही', usingOnline: 'ऑनलाइन एआय वापरत आहे', usingOffline: 'ऑफलाइन एआय वापरत आहे', connectionLost: 'आपण ऑफलाइन आहात. स्थानिक एआय उपलब्धता तपासत आहे.', connectionRestored: 'कनेक्शन पुन्हा सुरू झाले. ऑनलाइन एआय उपलब्ध आहे.', offlineBanner: 'सध्या ऑफलाइन. स्थानिक सुविधा उपलब्ध आहेत.' },
      dashboard: { eyebrow: 'तुमचे शेती कार्यक्षेत्र', greeting: 'तुम्हाला पाहून आनंद झाला, {{name}}.', subtitle: 'पिकांच्या चांगल्या निर्णयांसाठी स्पष्ट माहिती.', heroEyebrow: 'पीक माहिती', heroTitle: 'निरोगी पिकांसाठी अधिक चांगले निर्णय.', heroBody: 'पानाचा फोटो अपलोड करा आणि पुढील कृतीसाठी उपयुक्त मार्गदर्शन मिळवा.', startScan: 'पीक तपासणी सुरू करा', quickEyebrow: 'जलद प्रवेश', quickTitle: 'शेतासाठी उपयुक्त सुविधा', scanTitle: 'पिकाचे आरोग्य तपासा', scanBody: 'फोटोमधून पुढील कृतीचे मार्गदर्शन', weatherTitle: 'हवामान आणि पाणी', weatherBody: 'सिंचनाचे निर्णय आत्मविश्वासाने घ्या', marketTitle: 'बाजार भाव व कल', marketBody: 'थेट कृषी उत्पन्न बाजार समितीचे दर आणि ऐतिहासिक कल', schemesTitle: 'शासकीय योजना', schemesBody: 'अनुदान, पीएम-किसान, पीक विमा आणि इतर योजना पहा', historyTitle: 'तपासणी इतिहास', historyBody: 'तुमच्या अलीकडील पीक माहितीचा आढावा घ्या', nearby: 'जवळची कृषी दुकाने', settings: 'प्रोफाइल सेटिंग्ज' },
      scan: { eyebrow: 'पीक माहिती', title: 'पीक तपासणी', subtitle: 'एआय विश्लेषणासाठी पिकाचा किंवा पानाचा स्पष्ट फोटो अपलोड करा.', upload: 'पिकाचा फोटो अपलोड करा', formats: 'JPG किंवा PNG • जास्तीत जास्त 10 MB', photoTip: 'चांगल्या परिणामासाठी एका पानाचा स्वच्छ, प्रकाशमान फोटो वापरा.', takePhoto: 'फोटो काढा', uploadImage: 'फोटो अपलोड करा', ready: 'विश्लेषणासाठी तयार', review: 'पुढे जाण्यापूर्वी फोटो तपासा.', analyze: 'पीक विश्लेषण करा', guideEyebrow: 'फोटो मार्गदर्शक', guideTitle: 'मॉडेलला स्पष्ट फोटो दिसू द्या', guideOne: 'नैसर्गिक प्रकाश वापरा आणि चमक टाळा.', guideTwo: 'पान मध्यभागी आणि स्पष्ट ठेवा.', guideThree: 'एका वेळी एक प्रभावित पान ठेवा.', privacy: 'तुमचा फोटो केवळ जोडलेल्या विश्लेषण सेवेकडे पाठवला जातो.', analyzing: 'तुमच्या पिकाचे विश्लेषण सुरू आहे...', stepSymptoms: 'दृश्य लक्षणे तपासत आहे', stepPatterns: 'पीक नमुन्यांची तुलना करत आहे', stepRecommendations: 'शिफारसी तयार करत आहे', newScan: 'नवीन तपासणी', invalidImage: 'कृपया योग्य पीक फोटो निवडा.', tooLarge: 'फोटोचा आकार 10 MB पेक्षा जास्त आहे.', selectFirst: 'कृपया आधी पीकाचा फोटो निवडा किंवा काढा.', onlineNeedsConnection: 'ऑनलाइन एआयसाठी इंटरनेट आवश्यक आहे. पुन्हा कनेक्ट करा किंवा अॅपमधील स्थानिक मॉडेल वापरा.', offlineUnavailable: 'आपण ऑफलाइन आहात आणि या ब्राउझरमध्ये स्थानिक कृषी मॉडेल उपलब्ध नाही.', offlineNoResult: 'स्थानिक मॉडेलने निदान दिले नाही. ते स्थापित आणि तयार आहे का ते तपासा.', offlineUnreadable: 'स्थानिक मॉडेलने वाचता न येणारे निदान दिले.', offlineUnsupported: 'स्थानिक मॉडेलने असमर्थित निदान दिले.', diagnosisFailed: 'पीक विश्लेषण अयशस्वी झाले. पुन्हा प्रयत्न करा.' },
      diagnosis: { eyebrow: 'विश्लेषण पूर्ण', title: 'पीक विश्लेषण', observation: 'निरीक्षण', observationTitle: 'आम्हाला काय दिसले', nextStep: 'पुढील कृती', actionTitle: 'शिफारस केलेली कृती', confidence: 'विश्वास पातळी', aiVision: 'एआय दृश्य विश्लेषण', severity: 'तीव्रता', crop: 'पीक', prevention: 'प्रतिबंध', inputs: 'लक्षात घेण्यासारख्या गोष्टी', overviewFallback: 'तुमच्या पीक फोटोतील दृश्य लक्षणांचा आढावा घेण्यात आला आहे.', symptomsFallback: 'दृश्य लक्षणे येथे दिसतील.', treatmentFallback: 'उपचाराचे मार्गदर्शन येथे दिसेल.', fertilizerFallback: 'खताचे मार्गदर्शन येथे दिसेल.', pesticidesFallback: 'शिफारस केलेली उत्पादने येथे दिसतील.', disclaimer: 'एआय मार्गदर्शनाला स्थानिक कृषी अधिकारी आणि उत्पादन लेबलच्या सल्ल्याने तपासा.', save: 'तपासणी इतिहासात जतन करा', findShops: 'जवळची कृषी दुकाने शोधा', saved: 'तपासणी इतिहासात जतन केली.', saveFailed: 'तपासणी इतिहासात जतन करता आले नाही. पुन्हा प्रयत्न करा.' },
      weather: { eyebrow: 'शेतातील परिस्थिती', title: 'हवामान आणि पाणी', currentLocation: 'सध्याचे स्थान', locationLoading: 'तुमचे स्थान शोधत आहे...', current: 'सध्याची परिस्थिती', temperature: 'तापमान', humidity: 'आर्द्रता', wind: 'वारा', rain: 'पावसाची शक्यता', refresh: 'हवामान स्थान पुन्हा शोधा', adviceEyebrow: 'सिंचन मार्गदर्शन', loading: 'शेतातील मार्गदर्शन लोड होत आहे', loadingBody: 'सध्याची परिस्थिती उपलब्ध झाल्यावर हवामानावर आधारित सिंचन मार्गदर्शन दिसेल.', unavailableLocation: 'थेट परिस्थिती उपलब्ध नाही', unavailableCondition: 'हवामान सेवा उपलब्ध नाही', unavailableTitle: 'थेट सिंचन मार्गदर्शन नाही', unavailableBody: 'सिंचनाचे नियोजन करण्यापूर्वी पुन्हा कनेक्ट करून सध्याची परिस्थिती मिळवा.', fallbackAdvice: 'तुमच्या पिकासाठी सामान्य सिंचन मार्गदर्शनाचे पालन करा.', pageSubtitle: 'तुमच्या परिसरातील हवामान आणि शेतीची परिस्थिती', locationLabel: 'स्थान', locationPermissionTitle: 'स्थानाची परवानगी द्या', locationPermissionBody: 'स्थानिक हवामान आणि कृषी मार्गदर्शन देण्यासाठी तुमचे स्थान वापरू द्या.', useLocation: 'माझे स्थान वापरा', searchLocation: 'स्थान शोधा', changeLocation: 'स्थान बदला', gettingLocationTitle: 'तुमचे स्थान घेत आहे...', gettingLocationBody: 'तुमचे निर्देशांक मिळवण्यासाठी स्थानाची परवानगी द्या.', fetchingWeatherTitle: 'स्थानिक हवामान घेत आहे...', fetchingWeatherBody: 'निवडलेल्या स्थानासाठी थेट परिस्थिती मिळवत आहे.', locationDeniedTitle: 'स्थानाचा प्रवेश उपलब्ध नाही', locationDeniedBody: 'स्थानाची परवानगी नाकारली गेली. त्याऐवजी शहर किंवा परिसर शोधा.', locationUnavailableTitle: 'तुमचे स्थान ठरवता आले नाही', locationUnavailableBody: 'तुमच्या डिव्हाइसने वापरता येईल असे स्थान दिले नाही. पुन्हा प्रयत्न करा किंवा स्थान शोधा.', locationTimeoutTitle: 'स्थान विनंतीची वेळ संपली', locationTimeoutBody: 'पुन्हा प्रयत्न करा किंवा शहर अथवा परिसर शोधा.', locationUnsupportedTitle: 'स्थान सुविधा समर्थित नाही', locationUnsupportedBody: 'या ब्राउझरमध्ये डिव्हाइस स्थान उपलब्ध नाही. शहर किंवा परिसर शोधा.', offlineTitle: 'हवामानासाठी इंटरनेट कनेक्शन आवश्यक आहे', offlineBody: 'ऑफलाइन असताना थेट हवामान उपलब्ध नाही. उपलब्ध असल्यास मागील हवामान येथे दिसेल.', serviceErrorTitle: 'हवामान सेवा तात्पुरती उपलब्ध नाही', serviceErrorBody: 'आत्ता थेट हवामान मिळवता आले नाही. पुन्हा प्रयत्न करा किंवा स्थान बदला.', invalidLocationTitle: 'या स्थानासाठी हवामान माहिती सापडली नाही', invalidLocationBody: 'पुन्हा शोधा आणि जवळचे शहर, गाव, जिल्हा किंवा परिसर निवडा.', lastUpdated: 'शेवटचे अद्यतन: {{time}}', live: 'थेट', cached: 'संग्रहित', offlineCached: 'ऑफलाइन · शेवटचे उपलब्ध हवामान', searchTitle: 'तुमचे स्थान शोधा', searchPlaceholder: 'शहर, गाव, जिल्हा किंवा परिसर', searching: 'स्थाने शोधत आहे...', noSearchResults: 'जुळणारी स्थाने सापडली नाहीत.', locationSearchUnavailable: 'स्थान शोध सेवा तात्पुरती उपलब्ध नाही. पुन्हा प्रयत्न करा.', retry: 'पुन्हा प्रयत्न करा', cancel: 'रद्द करा', currentWeather: 'सध्याचे हवामान', atAGlance: 'एका दृष्टीक्षेपात', precipitation: 'पर्जन्य', windDirection: 'वाऱ्याची दिशा', cloudCover: 'ढगांचे आच्छादन', visibility: 'दृश्यता', pressure: 'दाब', rainWater: 'पाऊस आणि पाणी', rainIrrigation: 'पाऊस आणि सिंचन', rainSummary: 'पावसाची माहिती', upcoming: 'आगामी परिस्थिती', forecast: 'अंदाज', forecastUnavailable: 'या प्रतिसादासाठी अंदाज उपलब्ध नाही.', rainProbabilityValue: '{{value}}% पावसाची शक्यता', precipitationValue: '{{value}} मिमी पर्जन्य', rainDataUnavailable: 'पावसाची माहिती उपलब्ध नाही.', adviceUnavailable: 'सिंचन मार्गदर्शन उपलब्ध नाही', adviceUnavailableBody: 'सिंचनापूर्वी सध्याचा पाऊस आणि मातीतील ओलावा तपासा.', unknownCondition: 'परिस्थिती उपलब्ध नाही' },
      market: {
        eyebrow: 'बाजार माहिती',
        title: 'बाजार भाव',
        subtitle: 'तुमच्या पिकासाठी आणि परिसरासाठी कृषी उत्पन्न बाजार समितीचे ताजे भाव व कल तपासा.',
        selectCrop: 'पीक निवडा',
        selectLocation: 'स्थान निवडा',
        detectLocation: 'स्थान शोधा',
        allMarkets: 'सर्व बाजार समित्या',
        latestTitle: 'ताजा बाजार भाव',
        modalPrice: 'सरासरी भाव',
        minPrice: 'किमान भाव',
        maxPrice: 'कमाल भाव',
        priceUnit: '₹ / क्विंटल',
        variety: 'वाण: {{value}}',
        updated: 'अद्यतन: {{date}}',
        latestAvailable: 'शेवटची उपलब्ध बाजार माहिती',
        saveCrop: '☆ पीक जतन करा',
        saveMarket: '☆ बाजार समिती जतन करा',
        saved: '★ प्रोफाइलमध्ये जतन झाले',
        compareTitle: 'बाजार समित्यांची तुलना',
        compareSubtitle: 'जिल्ह्यातील आणि जवळपासच्या बाजारांमधील घाऊक भाव',
        highestPrice: 'सर्वोच्च भाव',
        lowestPrice: 'कमी भाव',
        nearestLocation: 'जवळचे स्थान',
        sameDistrict: 'तोच जिल्हा',
        sameState: 'तेच राज्य',
        otherMarket: 'इतर बाजार',
        priceHistoryTitle: 'भाव इतिहास आणि कल विश्लेषण',
        priceHistorySubtitle: 'या पिकाचे बाजार भाव काळाच्या ओघात कसे बदलले ते समजून घ्या.',
        period7d: '७ दिवस',
        period30d: '३० दिवस',
        period3m: '३ महिने',
        period6m: '६ महिने',
        period1y: '१ वर्ष',
        typeModal: 'सरासरी भाव',
        typeMin: 'किमान भाव',
        typeMax: 'कमाल भाव',
        summaryLatest: 'ताजा सरासरी भाव',
        summaryHigh: 'कालावधीतील उच्चांक',
        summaryLow: 'कालावधीतील नीचांक',
        summaryChange: 'भावातील बदल',
        trendTitle: 'भावाचा कल',
        trendIncreasing: 'वाढता',
        trendStable: 'स्थिर',
        trendDecreasing: 'घटता',
        trendInsufficient: 'अपुरा डेटा',
        whatChartShowsTitle: 'आलेख काय दर्शवतो',
        historicalRecordsTitle: 'ऐतिहासिक नोंदी',
        downloadCsv: 'भाव इतिहास डाउनलोड करा (CSV)',
        tableDate: 'दिनांक',
        tableMarket: 'बाजार समिती',
        tableCommodity: 'पीक',
        tableVariety: 'वाण',
        tableMin: 'किमान (₹)',
        tableModal: 'सरासरी (₹)',
        tableMax: 'कमाल (₹)',
        noDataTitle: 'बाजार भाव सापडले नाहीत',
        noDataBody: 'या पिकासाठी आणि स्थानासाठी बाजार नोंदी उपलब्ध नाहीत. दुसरे पीक किंवा बाजार निवडा.',
        serviceErrorTitle: 'बाजार सेवा तात्पुरती अनुपलब्ध',
        serviceErrorBody: 'बाजार माहिती आत्ता मिळवता आली नाही. कृपया पुन्हा प्रयत्न करा.',
        offlineTitle: 'ऑफलाइन मोड',
        offlineCached: 'ऑफलाइन · शेवटचा उपलब्ध बाजार भाव (अद्यतन: {{date}})',
        offlineNoCache: 'ताजे बाजार भाव पाहण्यासाठी इंटरनेट कनेक्शन आवश्यक आहे.',
        sourceLabel: 'स्रोत: भारत सरकार — Data.gov.in / AGMARKNET',
        sourceInfo: 'अधिकृत ॲगमार्कनेट कृषी बाजार समिती आवक आणि भाव डेटा.',
        officialPortal: 'ॲगमार्कनेट पोर्टल ↗',
        retry: 'पुन्हा प्रयत्न',
        loading: 'बाजार भाव लोड होत आहेत...'
      },
      schemes: {
        eyebrow: 'शासकीय उपक्रम',
        title: 'शासकीय योजना',
        subtitle: 'शेतकऱ्यांसाठी उपलब्ध आर्थिक मदत, अनुदान आणि विमा योजना शोधा.',
        searchPlaceholder: 'पीक, नाव किंवा उद्देशानुसार योजना शोधा (उदा. पीक विमा, सौर पंप, पीएम किसान)...',
        allCategories: 'सर्व प्रवर्ग',
        allLevels: 'सर्व स्तर',
        central: 'केंद्र शासन',
        state: 'राज्य शासन',
        allStates: 'सर्व राज्ये',
        recommendedTitle: 'तुमच्या शेतासाठी शिफारस केलेल्या योजना',
        recommendedSubtitle: 'तुमच्या प्रोफाइलमधील पीक व स्थानाशी जुळणाऱ्या योजना',
        mayBeRelevant: 'तुमच्या शेती प्रोफाइलशी संबंधित असू शकते',
        viewDetails: 'तपशील पहा',
        checkEligibility: 'पात्रता तपासा',
        officialWebsite: 'अधिकृत संकेतस्थळ ↗',
        modalOverview: 'योजनेचा तपशील',
        modalBenefits: 'प्रमुख लाभ',
        modalEligibility: 'पात्रतेचे निकष',
        modalDocuments: 'आवश्यक कागदपत्रे',
        modalApplication: 'अर्ज प्रक्रिया',
        modalSource: 'अधिकृत स्रोत व पडताळणी',
        eligibilityTitle: 'पात्रता स्वयं-तपासणी',
        eligibilitySubtitle: 'अधिकृत नियमांनुसार तुम्ही प्राथमिक निकष पूर्ण करता का ते पाहण्यासाठी काही प्रश्नांची उत्तरे द्या.',
        btnCheckNow: 'पात्रतेचे मूल्यांकन करा',
        btnProceedOfficial: 'अधिकृत पोर्टलवर अर्ज करा',
        qLandowner: 'तुमच्या नावावर लागवडीयोग्य शेतजमीन आहे का?',
        qAadhaar: 'तुमच्याकडे मोबाइलशी जोडलेले आधार कार्ड आहे का?',
        qBank: 'तुमचे बँक खाते आधारशी जोडलेले (NPCI मॅप) आहे का?',
        qTax: 'तुम्ही आयकर भरणारे किंवा शासकीय कर्मचारी आहात का?',
        qWater: 'तुमच्याकडे खात्रीशीर पाण्याचा स्रोत (विहीर / बोअरवेल / कालवा / शेततळे) आहे का?',
        yes: 'होय',
        no: 'नाही',
        matchedHeader: 'पूर्ण झालेले निकष',
        unmatchedHeader: 'तपासण्यासारख्या अटी',
        noSchemesFound: 'तुमच्या शोधाशी जुळणाऱ्या योजना सापडल्या नाहीत. इतर शब्द शोधा किंवा फिल्टर बदला.',
        offlineTitle: 'ऑफलाइन मोड',
        offlineBody: 'संग्रहित योजनांची माहिती दाखवत आहे. पोर्टल अद्यतने पाहण्यासाठी इंटरनेट जोडा.',
        sourceLabel: 'स्रोत: भारत सरकार — myScheme.gov.in / कृषी आणि शेतकरी कल्याण मंत्रालय',
        sourceDisclaimer: 'माहिती अधिकृत सरकारी अधिसूचनांवर आधारित आहे. अर्ज करण्यापूर्वी अधिकृत पोर्टलवर खात्री करा.'
      },
      history: { eyebrow: 'तुमच्या नोंदी', title: 'तपासणी इतिहास', subtitle: 'तुमच्या अलीकडील पीक विश्लेषणाचा आढावा घ्या.', sync: 'नोंदी समक्रमित करा', search: 'पीक किंवा रोग शोधा', emptyTitle: 'अजून तपासणी इतिहास नाही', emptyBody: 'तुमची जतन केलेली पीक विश्लेषणे येथे दिसतील.', analysisRecord: 'विश्लेषण नोंद', severity: '{{value}} तीव्रता', detail: 'निदान तपशील', date: 'दिनांक', status: 'स्थिती', symptoms: 'लक्षणे', treatment: 'उपचार', syncAlready: 'सर्व तपासणी नोंदी आधीच समक्रमित आहेत.', syncStart: 'क्लाउडसोबत नोंदी समक्रमित करत आहे...', syncSuccess: 'सर्व प्रलंबित नोंदी समक्रमित झाल्या.', syncFailed: 'नोंदी समक्रमित करता आल्या नाहीत. त्या या डिव्हाइसवर उपलब्ध आहेत.' },
      profile: { eyebrow: 'खाते', title: 'प्रोफाइल सेटिंग्ज', subtitle: 'तुमच्या कार्यक्षेत्राची माहिती आणि पसंती अद्ययावत ठेवा.', fullName: 'पूर्ण नाव', phone: 'मोबाइल क्रमांक', crop: 'मुख्य पीक', location: 'गाव / जिल्हा', save: 'प्रोफाइल जतन करा', statusEyebrow: 'कार्यक्षेत्र स्थिती', network: 'नेटवर्क', bridge: 'ऑफलाइन मॉडेल ब्रिज', accountSync: 'खाते समक्रमण', signOut: 'साइन आउट', signedIn: '{{email}} म्हणून साइन इन. तपासण्या आणि सेटिंग्ज समक्रमित आहेत.', signInToSync: 'नोंदी समक्रमित करण्यासाठी साइन इन करा.', connected: 'कनेक्टेड', localMode: 'ऑफलाइन (स्थानिक मोड)', bridgeAvailable: 'उपलब्ध (Android अॅप)', bridgeUnavailable: 'उपलब्ध नाही (सामान्य ब्राउझर)', saved: 'प्रोफाइल माहिती यशस्वीरित्या जतन झाली.' },
      shops: { eyebrow: 'स्थानिक मदत', title: 'जवळची कृषी दुकाने', subtitle: 'तुमच्या सध्याच्या स्थानाजवळ कृषी पुरवठादार शोधा.', store: 'कृषी दुकान', pesticides: 'कीटकनाशके', fertilizer: 'खते', seeds: 'बियाणे', detect: 'माझे स्थान शोधा', detecting: 'GPS स्थान शोधत आहे...', found: 'स्थान सापडले ({{lat}}, {{lon}})', manual: 'सामान्य क्षेत्र शोध वापरत आहे', unavailable: 'ब्राउझर स्थान सुविधा उपलब्ध नाही', search: 'शोध: “{{category}}” {{near}}', near: 'सध्याच्या स्थानाजवळ', open: 'Google Maps उघडा', noteTitle: 'स्थानावर आधारित शोध', noteBody: 'नकाशा शोध केंद्रित करण्यासाठी तुमचे ब्राउझर स्थान वापरले जाते.' },
      language: { eyebrow: 'पसंती', title: 'भाषा', subtitle: 'शेतात वापरण्यासाठी तुम्हाला सोयीची भाषा निवडा.', default: 'मूळ भाषा', hindi: 'हिंदी', marathi: 'मराठी', tamil: 'तमिळ', telugu: 'तेलुगू', changed: 'भाषा {{language}} वर बदलली.' },
      validation: { invalidEmail: 'कृपया योग्य ईमेल पत्ता लिहा.', weakPassword: 'पासवर्ड किमान 6 अक्षरांचा असावा.', missingEmail: 'कृपया तुमचा ईमेल पत्ता लिहा.', nameRequired: 'कृपया तुमचे पूर्ण नाव लिहा.', wrongPassword: 'ईमेल किंवा पासवर्ड चुकीचा आहे.', emailInUse: 'हा ईमेल आधीपासून नोंदणीकृत आहे.', popupClosed: 'साइन इन विंडो पूर्ण होण्यापूर्वी बंद केली. कृपया पुन्हा प्रयत्न करा.', popupCancelled: 'साइन इन विनंती रद्द झाली. कृपया पुन्हा प्रयत्न करा.', popupBlocked: 'ब्राउझरने साइन इन विंडो ब्लॉक केली. कृपया पॉप-अप सुरू करा.', accountExistsDifferentCredential: 'या ईमेलवर आधीपासून दुसऱ्या पद्धतीने खाते नोंदणीकृत आहे.', unauthorizedDomain: 'हा डोमेन Google साइन-इनसाठी अधिकृत नाही.', googleProviderNotFound: 'Google साइन-इन तात्पुरते अनुपलब्ध आहे. कृपया पुन्हा प्रयत्न करा.', network: 'कनेक्ट करता आले नाही. इंटरनेट कनेक्शन तपासा.', default: 'काहीतरी चुकले. पुन्हा प्रयत्न करा.', resetUnavailable: 'पासवर्ड बदलण्याचा ईमेल पाठवता आला नाही.' },
      authStatus: { loginSuccess: 'यशस्वीरित्या साइन इन झाले.', registerSuccess: 'खाते यशस्वीरित्या तयार झाले.', logoutSuccess: 'यशस्वीरित्या साइन आउट झाले.', tooMany: 'खूप प्रयत्न झाले. थोडा वेळ थांबा.', disabled: 'हे खाते निष्क्रिय केले आहे. मदतीशी संपर्क साधा.', notAllowed: 'Firebase मध्ये ईमेल आणि पासवर्ड लॉगिन सुरू केलेले नाही.' },
      common: { back: 'मागे', retry: 'पुन्हा प्रयत्न', cancel: 'रद्द करा', remove: 'फोटो काढून टाका', change: 'फोटो बदला', loading: 'लोड होत आहे...', online: 'ऑनलाइन', offline: 'ऑफलाइन' }
    },
    hi: {
      auth: { workspace: 'आपका खेती कार्यक्षेत्र', visualOverline: 'हर फसल मौसम के लिए कृषि बुद्धिमत्ता', visualTitle: 'बेहतर फैसले। स्वस्थ फसलें।', visualBody: 'एआई फसल निदान, मौसम जानकारी, मंडी भाव और प्रमाणित कृषि मार्गदर्शन — सब एक ही कार्यक्षेत्र में।', secure: 'सुरक्षित कार्यक्षेत्र', connected: 'ऑनलाइन + डिवाइस पर उपलब्ध', signInTitle: 'फिर से स्वागत है', signInSubtitle: 'अपने फसल जानकारी कार्यक्षेत्र में जाने के लिए साइन इन करें।', createTitle: 'अपना कार्यक्षेत्र बनाएं', createSubtitle: 'अपनी फसल जानकारी के लिए सुरक्षित कार्यक्षेत्र बनाएं।', signIn: 'साइन इन', createAccount: 'खाता बनाएं', fullName: 'पूरा नाम', email: 'ईमेल पता', password: 'पासवर्ड', confirmPassword: 'पासवर्ड की पुष्टि करें', remember: 'मुझे याद रखें', forgot: 'पासवर्ड भूल गए?', show: 'दिखाएं', hide: 'छिपाएं', submitSignIn: 'साइन इन', submitCreate: 'खाता बनाएं', newHere: 'HaritKranti पर नए हैं?', alreadyMember: 'पहले से खाता है?', switchCreate: 'खाता बनाएं', switchSignIn: 'साइन इन', continueWithGoogle: 'Google के साथ जारी रखें', orDivider: 'या', legal: 'जारी रखकर, आप स्थानीय कृषि विशेषज्ञ की सलाह के साथ एआई मार्गदर्शन उपयोग करने से सहमत हैं।', processing: 'प्रक्रिया जारी है...', resetSent: 'पासवर्ड रीसेट ईमेल भेज दिया गया है। इनबॉक्स देखें।', resetPrompt: 'पहले ईमेल पता लिखें, फिर पासवर्ड भूल गए चुनें।', passwordMismatch: 'दोनों पासवर्ड मेल नहीं खाते। कृपया जांचें।', confirmPasswordRequired: 'कृपया पासवर्ड की पुष्टि करें।', missingPassword: 'कृपया अपना पासवर्ड लिखें।' },
      nav: { home: 'होम', dashboard: 'डैशबोर्ड', scan: 'फसल जांचें', weather: 'मौसम', market: 'मंडी भाव', schemes: 'सरकारी योजनाएं', history: 'इतिहास', profile: 'प्रोफाइल', language: 'भाषा', more: 'अधिक' },
      network: { online: 'ऑनलाइन', offline: 'ऑफलाइन', onlineAI: 'ऑनलाइन एआई उपलब्ध', offlineAI: 'ऑफलाइन एआई उपलब्ध', offlineUnavailable: 'इस डिवाइस पर ऑफलाइन एआई उपलब्ध नहीं', usingOnline: 'ऑनलाइन एआई उपयोग हो रहा है', usingOffline: 'ऑफलाइन एआई उपयोग हो रहा है', connectionLost: 'आप ऑफलाइन हैं। स्थानीय एआई उपलब्धता जांच रहे हैं।', connectionRestored: 'कनेक्शन वापस आ गया। ऑनलाइन एआई उपलब्ध है।', offlineBanner: 'अभी ऑफलाइन हैं। स्थानीय सुविधाएं उपलब्ध हैं।' },
      dashboard: { eyebrow: 'आपका खेती कार्यक्षेत्र', greeting: 'आपका स्वागत है, {{name}}।', subtitle: 'बेहतर फसल फैसलों के लिए स्पष्ट जानकारी।', heroEyebrow: 'फसल जानकारी', heroTitle: 'स्वस्थ फसलों के लिए बेहतर फैसले।', heroBody: 'पत्ती की तस्वीर अपलोड करें और अगले कदम के लिए उपयोगी सलाह पाएं।', startScan: 'फसल जांच शुरू करें', quickEyebrow: 'त्वरित पहुंच', quickTitle: 'खेत के लिए उपयोगी सुविधाएं', scanTitle: 'फसल स्वास्थ्य जांचें', scanBody: 'तस्वीर से अगले कदम की सलाह', weatherTitle: 'मौसम और पानी', weatherBody: 'सिंचाई के फैसले भरोसे से लें', marketTitle: 'मंडी भाव व रुझान', marketBody: 'ताजा मंडी थोक भाव और 30 दिन का ऐतिहासिक रुझान', schemesTitle: 'सरकारी योजनाएं', schemesBody: 'सब्सिडी, पीएम किसान, फसल बीमा और अन्य योजनाएं', historyTitle: 'जांच इतिहास', historyBody: 'अपनी हाल की फसल जानकारी देखें', nearby: 'पास की कृषि दुकानें', settings: 'प्रोफाइल सेटिंग्स' },
      scan: { eyebrow: 'फसल जानकारी', title: 'फसल जांच', subtitle: 'एआई विश्लेषण के लिए अपनी फसल या पत्ती की साफ तस्वीर अपलोड करें।', upload: 'फसल की तस्वीर अपलोड करें', formats: 'JPG या PNG • अधिकतम 10 MB', photoTip: 'बेहतर परिणाम के लिए एक पत्ती की साफ और रोशनी वाली तस्वीर लें।', takePhoto: 'तस्वीर लें', uploadImage: 'तस्वीर अपलोड करें', ready: 'विश्लेषण के लिए तैयार', review: 'आगे बढ़ने से पहले तस्वीर जांचें।', analyze: 'फसल का विश्लेषण करें', guideEyebrow: 'तस्वीर गाइड', guideTitle: 'मॉडल को साफ तस्वीर दिखाएं', guideOne: 'प्राकृतिक रोशनी का उपयोग करें और चमक से बचें।', guideTwo: 'पत्ती को बीच में और साफ रखें।', guideThree: 'एक बार में एक प्रभावित पत्ती रखें।', privacy: 'आपकी तस्वीर केवल जुड़ी हुई विश्लेषण सेवा को भेजी जाती है।', analyzing: 'आपकी फसल का विश्लेषण हो रहा है...', stepSymptoms: 'दिखने वाले लक्षण जांच रहे हैं', stepPatterns: 'फसल के पैटर्न की तुलना कर रहे हैं', stepRecommendations: 'सलाह तैयार कर रहे हैं', newScan: 'नई जांच', invalidImage: 'कृपया सही फसल तस्वीर चुनें।', tooLarge: 'तस्वीर का आकार 10 MB से अधिक है।', selectFirst: 'कृपया पहले फसल की तस्वीर चुनें या लें।', onlineNeedsConnection: 'ऑनलाइन एआई के लिए इंटरनेट चाहिए। फिर से कनेक्ट करें या ऐप का स्थानीय मॉडल उपयोग करें।', offlineUnavailable: 'आप ऑफलाइन हैं और इस ब्राउज़र में स्थानीय कृषि मॉडल उपलब्ध नहीं है।', offlineNoResult: 'स्थानीय मॉडल ने निदान नहीं दिया। जांचें कि यह इंस्टॉल और तैयार है।', offlineUnreadable: 'स्थानीय मॉडल ने पढ़ा न जा सकने वाला निदान दिया।', offlineUnsupported: 'स्थानीय मॉडल ने असमर्थित निदान दिया।', diagnosisFailed: 'फसल विश्लेषण विफल हुआ। फिर से प्रयास करें।' },
      diagnosis: { eyebrow: 'विश्लेषण पूरा', title: 'फसल विश्लेषण', observation: 'अवलोकन', observationTitle: 'हमें क्या दिखा', nextStep: 'अगला कदम', actionTitle: 'सुझाई गई कार्रवाई', confidence: 'विश्वास स्तर', aiVision: 'एआई दृश्य विश्लेषण', severity: 'गंभीरता', crop: 'फसल', prevention: 'बचाव', inputs: 'ध्यान देने योग्य बातें', overviewFallback: 'आपकी फसल तस्वीर में दिखने वाले लक्षणों की समीक्षा की गई है।', symptomsFallback: 'दिखने वाले लक्षण यहां आएंगे।', treatmentFallback: 'उपचार की सलाह यहां आएगी।', fertilizerFallback: 'उर्वरक सलाह यहां आएगी।', pesticidesFallback: 'सुझाए गए उत्पाद यहां आएंगे।', disclaimer: 'एआई सलाह के साथ स्थानीय कृषि विशेषज्ञ या उत्पाद लेबल की जांच अवश्य करें।', save: 'जांच इतिहास में सहेजें', findShops: 'पास की कृषि दुकानें खोजें', saved: 'जांच इतिहास में सहेज ली गई।', saveFailed: 'जांच इतिहास में सहेजी नहीं जा सकी। फिर से प्रयास करें।' },
      weather: { eyebrow: 'खेत की स्थिति', title: 'मौसम और पानी', currentLocation: 'वर्तमान स्थान', locationLoading: 'आपका स्थान खोज रहे हैं...', current: 'वर्तमान स्थिति', temperature: 'तापमान', humidity: 'नमी', wind: 'हवा', rain: 'बारिश की संभावना', refresh: 'मौसम स्थान ताज़ा करें', adviceEyebrow: 'सिंचाई सलाह', loading: 'खेत की सलाह लोड हो रही है', loadingBody: 'वर्तमान स्थिति उपलब्ध होने पर मौसम आधारित सिंचाई सलाह दिखेगी।', unavailableLocation: 'वर्तमान स्थिति उपलब्ध नहीं', unavailableCondition: 'मौसम सेवा उपलब्ध नहीं', unavailableTitle: 'लाइव सिंचाई सलाह उपलब्ध नहीं', unavailableBody: 'सिंचाई योजना से पहले फिर से कनेक्ट करके वर्तमान स्थिति प्राप्त करें।', fallbackAdvice: 'अपनी फसल के लिए सामान्य सिंचाई सलाह का पालन करें।', pageSubtitle: 'आपके क्षेत्र का मौसम और खेती की स्थिति', locationLabel: 'स्थान', locationPermissionTitle: 'स्थान की अनुमति दें', locationPermissionBody: 'स्थानीय मौसम और कृषि सलाह देने के लिए अपने स्थान की अनुमति दें।', useLocation: 'मेरा स्थान उपयोग करें', searchLocation: 'स्थान खोजें', changeLocation: 'स्थान बदलें', gettingLocationTitle: 'आपका स्थान प्राप्त कर रहे हैं...', gettingLocationBody: 'निर्देशांक प्राप्त करने के लिए स्थान की अनुमति दें।', fetchingWeatherTitle: 'स्थानीय मौसम प्राप्त कर रहे हैं...', fetchingWeatherBody: 'चुने गए स्थान के लिए लाइव स्थिति प्राप्त हो रही है।', locationDeniedTitle: 'स्थान की अनुमति नहीं मिली', locationDeniedBody: 'स्थान की अनुमति अस्वीकार कर दी गई। इसके बजाय शहर या इलाका खोजें।', locationUnavailableTitle: 'आपका स्थान निर्धारित नहीं हो सका', locationUnavailableBody: 'डिवाइस से मान्य स्थान नहीं मिला। फिर से प्रयास करें या खोजें।', locationTimeoutTitle: 'स्थान अनुरोध का समय समाप्त हुआ', locationTimeoutBody: 'फिर से प्रयास करें या शहर या इलाका खोजें।', locationUnsupportedTitle: 'स्थान सुविधा समर्थित नहीं', locationUnsupportedBody: 'इस ब्राउज़र में स्थान सुविधा उपलब्ध नहीं है। शहर या इलाका खोजें।', offlineTitle: 'मौसम के लिए इंटरनेट कनेक्शन आवश्यक है', offlineBody: 'ऑफलाइन होने पर लाइव मौसम उपलब्ध नहीं है। उपलब्ध होने पर पुराना मौसम दिखेगा।', serviceErrorTitle: 'मौसम सेवा अस्थायी रूप से अनुपलब्ध है', serviceErrorBody: 'अभी लाइव मौसम प्राप्त नहीं हो सका। फिर से प्रयास करें या स्थान बदलें।', invalidLocationTitle: 'इस स्थान के लिए मौसम जानकारी नहीं मिली', invalidLocationBody: 'फिर से खोजें और पास का शहर, कस्बा, जिला या इलाका चुनें।', lastUpdated: 'अंतिम अपडेट: {{time}}', live: 'लाइव', cached: 'संग्रहित', offlineCached: 'ऑफलाइन · अंतिम उपलब्ध मौसम', searchTitle: 'अपना स्थान खोजें', searchPlaceholder: 'शहर, कस्बा, जिला या इलाका', searching: 'स्थान खोज रहे हैं...', noSearchResults: 'कोई मेल खाता स्थान नहीं मिला।', locationSearchUnavailable: 'स्थान खोज सेवा अस्थायी रूप से अनुपलब्ध है। फिर से प्रयास करें।', retry: 'फिर से प्रयास करें', cancel: 'रद्द करें', currentWeather: 'वर्तमान मौसम', atAGlance: 'एक नज़र में', precipitation: 'वर्षा', windDirection: 'हवा की दिशा', cloudCover: 'बादल', visibility: 'दृश्यता', pressure: 'दबाव', rainWater: 'बारिश और पानी', rainIrrigation: 'बारिश और सिंचाई', rainSummary: 'बारिश की जानकारी', upcoming: 'आगामी स्थिति', forecast: 'पूर्वानुमान', forecastUnavailable: 'इस प्रतिक्रिया के लिए पूर्वानुमान उपलब्ध नहीं है।', rainProbabilityValue: '{{value}}% बारिश की संभावना', precipitationValue: '{{value}} मिमी वर्षा', rainDataUnavailable: 'बारिश का विवरण उपलब्ध नहीं है।', adviceUnavailable: 'सिंचाई सलाह उपलब्ध नहीं', adviceUnavailableBody: 'सिंचाई से पहले वर्तमान बारिश और मिट्टी की नमी जांचें।', unknownCondition: 'स्थिति उपलब्ध नहीं' },
      market: {
        eyebrow: 'मंडी भाव व विश्लेषण',
        title: 'मंडी भाव',
        subtitle: 'अपनी फसल और स्थान के लिए ताज़ा थोक मंडी भाव और ऐतिहासिक रुझान देखें।',
        selectCrop: 'फसल चुनें',
        selectLocation: 'स्थान चुनें',
        detectLocation: 'स्थान खोजें',
        allMarkets: 'सभी मंडियां',
        latestTitle: 'ताज़ा मंडी भाव',
        modalPrice: 'मॉडल भाव',
        minPrice: 'न्यूनतम भाव',
        maxPrice: 'अधिकतम भाव',
        priceUnit: '₹ / क्विंटल',
        variety: 'किस्म: {{value}}',
        updated: 'अपडेट: {{date}}',
        latestAvailable: 'नवीनतम उपलब्ध मंडी डेटा',
        saveCrop: '☆ फसल सहेजें',
        saveMarket: '☆ मंडी सहेजें',
        saved: '★ प्रोफाइल में सहेजा गया',
        compareTitle: 'मंडियों की तुलना',
        compareSubtitle: 'जिले और आसपास की मंडियों के थोक भाव',
        highestPrice: 'उच्चतम भाव',
        lowestPrice: 'न्यूनतम भाव',
        nearestLocation: 'निकटतम स्थान',
        sameDistrict: 'समान जिला',
        sameState: 'समान राज्य',
        otherMarket: 'अन्य मंडी',
        priceHistoryTitle: 'मूल्य इतिहास और रुझान विश्लेषण',
        priceHistorySubtitle: 'समझें कि समय के साथ इस फसल का मंडी भाव कैसे बदला है।',
        period7d: '7 दिन',
        period30d: '30 दिन',
        period3m: '3 महीने',
        period6m: '6 महीने',
        period1y: '1 वर्ष',
        typeModal: 'मॉडल भाव',
        typeMin: 'न्यूनतम भाव',
        typeMax: 'अधिकतम भाव',
        summaryLatest: 'ताज़ा मॉडल भाव',
        summaryHigh: 'अवधि का उच्चतम',
        summaryLow: 'अवधि का न्यूनतम',
        summaryChange: 'मूल्य परिवर्तन',
        trendTitle: 'मूल्य रुझान',
        trendIncreasing: 'बढ़ता हुआ',
        trendStable: 'स्थिर',
        trendDecreasing: 'घटता हुआ',
        trendInsufficient: 'अपर्याप्त डेटा',
        whatChartShowsTitle: 'चार्ट क्या दर्शाता है',
        historicalRecordsTitle: 'ऐतिहासिक रिकॉर्ड',
        downloadCsv: 'मूल्य इतिहास डाउनलोड करें (CSV)',
        tableDate: 'दिनांक',
        tableMarket: 'मंडी',
        tableCommodity: 'फसल',
        tableVariety: 'किस्म',
        tableMin: 'न्यूनतम (₹)',
        tableModal: 'मॉडल (₹)',
        tableMax: 'अधिकतम (₹)',
        noDataTitle: 'कोई मंडी डेटा नहीं मिला',
        noDataBody: 'इस फसल और स्थान के लिए कोई मंडी रिकॉर्ड नहीं मिला। दूसरी मंडी या फसल चुनें।',
        serviceErrorTitle: 'मंडी सेवा अस्थायी रूप से अनुपलब्ध',
        serviceErrorBody: 'मंडी भाव अभी उपलब्ध नहीं हैं। कृपया पुनः प्रयास करें।',
        offlineTitle: 'ऑफलाइन मोड',
        offlineCached: 'ऑफलाइन · अंतिम उपलब्ध मंडी भाव (अपडेट: {{date}})',
        offlineNoCache: 'ताज़ा मंडी भाव देखने के लिए इंटरनेट कनेक्शन आवश्यक है।',
        sourceLabel: 'स्रोत: भारत सरकार — Data.gov.in / AGMARKNET',
        sourceInfo: 'आधिकारिक एगमार्कनेट दैनिक थोक कृषि मंडी आवक डेटा।',
        officialPortal: 'एगमार्कनेट पोर्टल ↗',
        retry: 'पुनः प्रयास करें',
        loading: 'मंडी भाव लोड हो रहे हैं...'
      },
      schemes: {
        eyebrow: 'सरकारी पहल',
        title: 'सरकारी योजनाएं',
        subtitle: 'किसानों के लिए उपलब्ध वित्तीय सहायता, सब्सिडी और बीमा योजनाएं खोजें।',
        searchPlaceholder: 'फसल, नाम या उद्देश्य से खोजें (जैसे फसल बीमा, सोलर पंप, पीएम किसान)...',
        allCategories: 'सभी श्रेणियां',
        allLevels: 'सभी स्तर',
        central: 'केंद्र सरकार',
        state: 'राज्य सरकार',
        allStates: 'सभी राज्य',
        recommendedTitle: 'आपके खेत के लिए अनुशंसित योजनाएं',
        recommendedSubtitle: 'आपकी प्रोफाइल फसल और स्थान से मेल खाने वाली योजनाएं',
        mayBeRelevant: 'आपकी खेती प्रोफाइल के लिए प्रासंगिक हो सकती है',
        viewDetails: 'विवरण देखें',
        checkEligibility: 'पात्रता जांचें',
        officialWebsite: 'आधिकारिक वेबसाइट ↗',
        modalOverview: 'योजना विवरण',
        modalBenefits: 'प्रमुख लाभ',
        modalEligibility: 'पात्रता मानदंड',
        modalDocuments: 'आवश्यक दस्तावेज',
        modalApplication: 'आवेदन प्रक्रिया',
        modalSource: 'आधिकारिक स्रोत व सत्यापन',
        eligibilityTitle: 'पात्रता स्व-जांच',
        eligibilitySubtitle: 'यह देखने के लिए कुछ प्रश्नों के उत्तर दें कि क्या आप आधिकारिक नियमों के अनुसार प्राथमिक शर्तें पूरी करते हैं।',
        btnCheckNow: 'पात्रता का मूल्यांकन करें',
        btnProceedOfficial: 'आधिकारिक पोर्टल पर आवेदन करें',
        qLandowner: 'क्या आपके नाम पर कृषि योग्य भूमि है?',
        qAadhaar: 'क्या आपके पास मोबाइल से जुड़ा आधार कार्ड है?',
        qBank: 'क्या आपका बैंक खाता आधार से लिंक (NPCI मैप) है?',
        qTax: 'क्या आप आयकर दाता या सरकारी कर्मचारी हैं?',
        qWater: 'क्या आपके पास सुनिश्चित जल स्रोत (कुआं / बोरवेल / नहर / तालाब) है?',
        yes: 'हाँ',
        no: 'नहीं',
        matchedHeader: 'पूरी हुई शर्तें',
        unmatchedHeader: 'सत्यापन योग्य शर्तें',
        noSchemesFound: 'आपकी खोज से मेल खाने वाली कोई योजना नहीं मिली। अन्य शब्द खोजें या फ़िल्टर बदलें।',
        offlineTitle: 'ऑफलाइन मोड',
        offlineBody: 'संग्रहित योजनाओं की जानकारी दिख रही है। नवीनतम अपडेट के लिए इंटरनेट कनेक्ट करें।',
        sourceLabel: 'स्रोत: भारत सरकार — myScheme.gov.in / कृषि एवं किसान कल्याण मंत्रालय',
        sourceDisclaimer: 'जानकारी आधिकारिक सरकारी अधिसूचनाओं पर आधारित है। आवेदन से पहले आधिकारिक पोर्टल पर पुष्टि अवश्य करें।'
      },
      history: { eyebrow: 'आपके रिकॉर्ड', title: 'जांच इतिहास', subtitle: 'अपनी हाल की फसल जांचों की समीक्षा करें।', sync: 'रिकॉर्ड सिंक करें', search: 'फसल या रोग खोजें', emptyTitle: 'अभी कोई जांच इतिहास नहीं', emptyBody: 'आपके सहेजे गए फसल विश्लेषण यहां दिखेंगे।', analysisRecord: 'विश्लेषण रिकॉर्ड', severity: '{{value}} गंभीरता', detail: 'निदान विवरण', date: 'दिनांक', status: 'स्थिति', symptoms: 'लक्षण', treatment: 'उपचार', syncAlready: 'सभी जांच रिकॉर्ड पहले से सिंक हैं।', syncStart: 'क्लाउड के साथ रिकॉर्ड सिंक हो रहे हैं...', syncSuccess: 'सभी लंबित रिकॉर्ड सिंक हो गए।', syncFailed: 'रिकॉर्ड सिंक नहीं हो सके। वे इस डिवाइस पर उपलब्ध हैं।' },
      profile: { eyebrow: 'खाता', title: 'प्रोफाइल सेटिंग्स', subtitle: 'अपने कार्यक्षेत्र का विवरण और पसंद अपडेट रखें।', fullName: 'पूरा नाम', phone: 'मोबाइल नंबर', crop: 'मुख्य फसल', location: 'गांव / जिला', save: 'प्रोफाइल सहेजें', statusEyebrow: 'कार्यक्षेत्र स्थिति', network: 'नेटवर्क', bridge: 'ऑफलाइन मॉडल ब्रिज', accountSync: 'खाता सिंक', signOut: 'साइन आउट', signedIn: '{{email}} के रूप में साइन इन। जांच और सेटिंग्स सिंक हैं।', signInToSync: 'रिकॉर्ड सिंक करने के लिए साइन इन करें।', connected: 'कनेक्टेड', localMode: 'ऑफलाइन (स्थानीय मोड)', bridgeAvailable: 'उपलब्ध (Android ऐप)', bridgeUnavailable: 'अनुपलब्ध (सामान्य ब्राउज़र)', saved: 'प्रोफाइल जानकारी सफलतापूर्वक अपडेट हुई।' },
      shops: { eyebrow: 'स्थानीय सहायता', title: 'पास की कृषि दुकानें', subtitle: 'अपने वर्तमान स्थान के पास कृषि आपूर्तिकर्ता खोजें।', store: 'कृषि स्टोर', pesticides: 'कीटनाशक', fertilizer: 'उर्वरक', seeds: 'बीज', detect: 'मेरा स्थान खोजें', detecting: 'GPS स्थान खोज रहे हैं...', found: 'स्थान मिला ({{lat}}, {{lon}})', manual: 'सामान्य क्षेत्र खोज उपयोग हो रही है', unavailable: 'ब्राउज़र स्थान सुविधा उपलब्ध नहीं', search: 'खोज: “{{category}}” {{near}}', near: 'वर्तमान निर्देशांक के पास', open: 'Google Maps खोलें', noteTitle: 'स्थान आधारित खोज', noteBody: 'नक्शा खोज केंद्रित करने के लिए आपके ब्राउज़र स्थान का उपयोग होता है।' },
      language: { eyebrow: 'पसंद', title: 'भाषा', subtitle: 'खेत में उपयोग के लिए अपनी सुविधाजनक भाषा चुनें।', default: 'डिफ़ॉल्ट भाषा', hindi: 'हिंदी', marathi: 'मराठी', tamil: 'तमिल', telugu: 'तेलुगु', changed: 'भाषा बदलकर {{language}} कर दी गई।' },
      validation: { invalidEmail: 'कृपया सही ईमेल पता लिखें।', weakPassword: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।', missingEmail: 'कृपया अपना ईमेल पता लिखें।', nameRequired: 'कृपया अपना पूरा नाम लिखें।', wrongPassword: 'ईमेल या पासवर्ड गलत है।', emailInUse: 'यह ईमेल पहले से पंजीकृत है।', popupClosed: 'साइन इन पॉपअप पूरा होने से पहले बंद हो गया। कृपया पुनः प्रयास करें।', popupCancelled: 'साइन इन अनुरोध रद्द कर दिया गया। कृपया पुनः प्रयास करें।', popupBlocked: 'ब्राउज़र द्वारा साइन इन पॉपअप ब्लॉक कर दिया गया। कृपया पॉपअप की अनुमति दें।', accountExistsDifferentCredential: 'इस ईमेल पते से पहले से ही किसी अन्य विधि से खाता मौजूद है।', unauthorizedDomain: 'यह डोमेन Google साइन-इन के लिए अधिकृत नहीं है।', googleProviderNotFound: 'Google साइन-इन अस्थायी रूप से अनुपलब्ध है। कृपया पुनः प्रयास करें।', network: 'कनेक्ट नहीं हो सका। इंटरनेट कनेक्शन जांचें।', default: 'कुछ गलत हो गया। फिर से प्रयास करें।', resetUnavailable: 'पासवर्ड रीसेट ईमेल नहीं भेजा जा सका।' },
      authStatus: { loginSuccess: 'सफलतापूर्वक साइन इन किया।', registerSuccess: 'खाता सफलतापूर्वक बन गया।', logoutSuccess: 'सफलतापूर्वक साइन आउट किया।', tooMany: 'बहुत अधिक प्रयास हुए। थोड़ी देर प्रतीक्षा करें।', disabled: 'यह खाता निष्क्रिय कर दिया गया है।', notAllowed: 'Firebase में ईमेल पासवर्ड लॉगिन सक्षम नहीं है।' },
      common: { back: 'पीछे', retry: 'पुनः प्रयास', cancel: 'रद्द करें', remove: 'तस्वीर हटाएं', change: 'तस्वीर बदलें', loading: 'लोड हो रहा है...', online: 'ऑनलाइन', offline: 'ऑफलाइन' }
    },
    ta: {
      auth: { workspace: 'உங்கள் பண்ணை பணியிடம்', visualOverline: 'ஒவ்வொரு பயிர் பருவத்திற்கும் நுண்ணறிவு', visualTitle: 'ஆரோக்கியமான பயிர்களுக்கான சிறந்த முடிவுகள்.', visualBody: 'உங்கள் வயலுக்குத் தேவைப்படும்போது ஆன்லைன் மற்றும் ஆஃப்லைனில் செயல்படும் ஏஐ பயிர் வழிகாட்டல்.', secure: 'பாதுகாப்பான பணியிடம்', connected: 'ஆன்லைன் + சாதனத்தில் தயார்', signInTitle: 'மீண்டும் வருக', signInSubtitle: 'உங்கள் பயிர் நுண்ணறிவு பணியிடத்திற்குச் செல்ல உள்நுழைக.', createTitle: 'உங்கள் பணியிடத்தை உருவாக்குக', createSubtitle: 'உங்கள் பயிர் நுண்ணறிவுக்கு பாதுகாப்பான பணியிடத்தை உருவாக்குக.', signIn: 'உள்நுழைக', createAccount: 'கணக்கை உருவாக்குக', fullName: 'முழுப் பெயர்', email: 'மின்னஞ்சல் முகவரி', password: 'கடவுச்சொல்', confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்துக', remember: 'என்னை நினைவில் கொள்க', forgot: 'கடவுச்சொல் மறந்துவிட்டதா?', show: 'காட்டு', hide: 'மறை', submitSignIn: 'உள்நுழைக', submitCreate: 'கணக்கை உருவாக்குக', newHere: 'HaritKranti-க்கு புதியவரா?', alreadyMember: 'ஏற்கனவே கணக்கு உள்ளதா?', switchCreate: 'கணக்கை உருவாக்குக', switchSignIn: 'உள்நுழைக', continueWithGoogle: 'Google மூலம் தொடரவும்', orDivider: 'அல்லது', legal: 'தொடர்வதன் மூலம், உள்ளூர் வேளாண் வல்லுநரின் ஆலோசனையுடன் ஏஐ வழிகாட்டலைப் பயன்படுத்த ஒப்புக்கொள்கிறீர்கள்.', processing: 'செயலாக்கத்தில் உள்ளது...', resetSent: 'கடவுச்சொல் மீட்டமைப்பு மின்னஞ்சல் அனுப்பப்பட்டது.', resetPrompt: 'முதலில் மின்னஞ்சலை உள்ளிட்டு பின்னர் கடவுச்சொல் மறந்துவிட்டதா என்பதைத் தேர்ந்தெடுக்கவும்.', passwordMismatch: 'கடவுச்சொற்கள் பொருந்தவில்லை.', confirmPasswordRequired: 'கடவுச்சொல்லை உறுதிப்படுத்துக.', missingPassword: 'கடவுச்சொல்லை உள்ளிடவும்.' },
      nav: { home: 'முகப்பு', dashboard: 'டாஷ்போர்டு', scan: 'பயிர் ஸ்கேன்', weather: 'வானிலை', market: 'சந்தை விலைகள்', schemes: 'அரசுத் திட்டங்கள்', history: 'வரலாறு', profile: 'சுயவிவரம்', language: 'மொழி', more: 'மேலும்' },
      network: { online: 'ஆன்லைன்', offline: 'ஆஃப்லைன்', onlineAI: 'ஆன்லைன் ஏஐ கிடைக்கிறது', offlineAI: 'ஆஃப்லைன் ஏஐ கிடைக்கிறது', offlineUnavailable: 'இந்தச் சாதனத்தில் ஆஃப்லைன் ஏஐ கிடைக்கவில்லை', usingOnline: 'ஆன்லைன் ஏஐ பயன்படுகிறது', usingOffline: 'ஆஃப்லைன் ஏஐ பயன்படுகிறது', connectionLost: 'நீங்கள் ஆஃப்லைனில் உள்ளீர்கள்.', connectionRestored: 'இணைப்பு மீண்டும் கிடைத்தது.', offlineBanner: 'தற்போது ஆஃப்லைனில் உள்ளது. உள்ளூர் வசதிகள் கிடைக்கின்றன.' },
      dashboard: { eyebrow: 'உங்கள் பண்ணை பணியிடம்', greeting: 'வணக்கம், {{name}}.', subtitle: 'சிறந்த பயிர் முடிவுகளுக்கான தெளிவான சமிக்ஞைகள்.', heroEyebrow: 'பயிர் நுண்ணறிவு', heroTitle: 'ஆரோக்கியமான பயிர்களுக்கான சிறந்த முடிவுகள்.', heroBody: 'இலை படத்தை பதிவேற்றி அடுத்த கட்ட நடைமுறை வழிகாட்டலைப் பெறுங்கள்.', startScan: 'பயிர் ஸ்கேனைத் தொடங்குங்கள்', quickEyebrow: 'விரைவு அணுகல்', quickTitle: 'பண்ணைக்கு பயனுள்ளவை', scanTitle: 'பயிர் ஆரோக்கியத்தை ஸ்கேன் செய்க', scanBody: 'புகைப்படத்திலிருந்து அடுத்த கட்ட வழிகாட்டல்', weatherTitle: 'வானிலை மற்றும் நீர்', weatherBody: 'நீர்ப்பாசன முடிவுகளை நம்பிக்கையுடன் எடுங்கள்', marketTitle: 'சந்தை விலைகள் & போக்குகள்', marketBody: 'சமீபத்திய மண்டி விலைகள் மற்றும் வரலாற்று போக்குகள்', schemesTitle: 'அரசுத் திட்டங்கள்', schemesBody: 'மானியம், பி.எம் கிசான், பயிர் காப்பீடு மற்றும் பல', historyTitle: 'ஸ்கேன் வரலாறு', historyBody: 'சமீபத்திய பயிர் விவரங்களை மதிப்பாய்வு செய்க', nearby: 'அருகிலுள்ள வேளாண் கடைகள்', settings: 'சுயவிவர அமைப்புகள்' },
      scan: { eyebrow: 'பயிர் நுண்ணறிவு', title: 'பயிர் ஸ்கேன்', subtitle: 'ஏஐ பகுப்பாய்விற்கு தெளிவான பயிர் அல்லது இலை படத்தை பதிவேற்றவும்.', upload: 'பயிர் படத்தை பதிவேற்றவும்', formats: 'JPG அல்லது PNG • 10 MB வரை', photoTip: 'சிறந்த முடிவுகளுக்கு நல்ல வெளிச்சத்தில் ஒரு இலை புகைப்படத்தை எடுக்கவும்.', takePhoto: 'புகைப்படம் எடு', uploadImage: 'படத்தை பதிவேற்று', ready: 'பகுப்பாய்விற்கு தயார்', review: 'தொடர்வதற்கு முன் உங்கள் படத்தை சரிபார்க்கவும்.', analyze: 'பயிரை பகுப்பாய்வு செய்', guideEyebrow: 'புகைப்பட வழிகாட்டி', guideTitle: 'மாடலுக்கு தெளிவாகக் காட்டவும்', guideOne: 'இயற்கை ஒளியைப் பயன்படுத்தவும்.', guideTwo: 'இலையை மையமாகவும் தெளிவாகவும் வைக்கவும்.', guideThree: 'ஒரு நேரத்தில் ஒரு பாதிக்கப்பட்ட இலையை வைக்கவும்.', privacy: 'உங்கள் படம் பகுப்பாய்வு சேவைக்கு மட்டுமே அனுப்பப்படும்.', analyzing: 'உங்கள் பயிர் பகுப்பாய்வு செய்யப்படுகிறது...', stepSymptoms: 'காணக்கூடிய அறிகுறிகளை சரிபார்க்கிறது', stepPatterns: 'பயிர் முறைகளை ஒப்பிடுகிறது', stepRecommendations: 'பரிந்துரைகளைத் தயாரிக்கிறது', newScan: 'புதிய ஸ்கேன்', invalidImage: 'சரியான பயிர் படத்தை தேர்வு செய்யவும்.', tooLarge: 'படத்தின் அளவு 10 MB-க்கு மேல் உள்ளது.', selectFirst: 'முதலில் பயிர் படத்தை தேர்வு செய்யவும் அல்லது எடுக்கவும்.', onlineNeedsConnection: 'ஆன்லைன் ஏஐ-க்கு இணையம் தேவை.', offlineUnavailable: 'ஆஃப்லைனில் உள்ளீர்கள், உள்ளூர் மாதிரி கிடைக்கவில்லை.', offlineNoResult: 'உள்ளூர் மாதிரி முடிவை அளிக்கவில்லை.', offlineUnreadable: 'முடிவை படிக்க முடியவில்லை.', offlineUnsupported: 'ஆதரிக்கப்படாத முடிவு வடிவம்.', diagnosisFailed: 'பகுப்பாய்வு தோல்வியடைந்தது.' },
      diagnosis: { eyebrow: 'பகுப்பாய்வு முடிந்தது', title: 'பயிர் பகுப்பாய்வு', observation: 'கண்காணிப்பு', observationTitle: 'நாங்கள் கண்டறிந்தது', nextStep: 'அடுத்த படி', actionTitle: 'பரிந்துரைக்கப்பட்ட நடவடிக்கை', confidence: 'நம்பகத்தன்மை', aiVision: 'ஏஐ பார்வை பகுப்பாய்வு', severity: 'தீவிரம்', crop: 'பயிர்', prevention: 'தடுப்பு', inputs: 'கவனிக்க வேண்டிய இடுபொருட்கள்', overviewFallback: 'உங்கள் பயிர் படம் ஆய்வு செய்யப்பட்டுள்ளது.', symptomsFallback: 'அறிகுறிகள் இங்கே தோன்றும்.', treatmentFallback: 'சிகிச்சை வழிகாட்டல் இங்கே தோன்றும்.', fertilizerFallback: 'உர வழிகாட்டல் இங்கே தோன்றும்.', pesticidesFallback: 'பரிந்துரைக்கப்பட்ட மருந்துகள் இங்கே தோன்றும்.', disclaimer: 'ஏஐ வழிகாட்டலை உள்ளூர் வேளாண் அலுவலரிடம் சரிபார்க்கவும்.', save: 'வரலாற்றில் சேமிக்கவும்', findShops: 'அருகிலுள்ள வேளாண் கடைகளைக் கண்டறியவும்', saved: 'பதிவு சேமிக்கப்பட்டது.', saveFailed: 'சேமிக்க முடியவில்லை.' },
      weather: { eyebrow: 'வயல் நிலைமைகள்', title: 'வானிலை மற்றும் நீர்', currentLocation: 'தற்போதைய இடம்', locationLoading: 'இடத்தை கண்டறிகிறது...', current: 'தற்போதைய நிலைமைகள்', temperature: 'வெப்பநிலை', humidity: 'ஈரப்பதம்', wind: 'காற்று', rain: 'மழை வாய்ப்பு', refresh: 'வானிலை இடத்தை புதுப்பிக்கவும்', adviceEyebrow: 'நீர்ப்பாசன ஆலோசனை', loading: 'வழிகாட்டல் ஏற்றப்படுகிறது', loadingBody: 'தற்போதைய நிலை கிடைத்தவுடன் நீர்ப்பாசன ஆலோசனை தோன்றும்.', unavailableLocation: 'நேரலை நிலைமைகள் கிடைக்கவில்லை', unavailableCondition: 'வானிலை சேவை கிடைக்கவில்லை', unavailableTitle: 'நேரலை நீர்ப்பாசன ஆலோசனை இல்லை', unavailableBody: 'நீர்ப்பாசனம் திட்டமிடுவதற்கு முன் மீண்டும் இணைக்கவும்.', fallbackAdvice: 'உங்கள் பயிருக்கான நிலையான நீர்ப்பாசன வழிகாட்டலைப் பின்பற்றவும்.', pageSubtitle: 'உங்கள் உள்ளூர் வானிலை மற்றும் விவசாய நிலைமைகள்', locationLabel: 'இடம்', locationPermissionTitle: 'இருப்பிட அனுமதியை வழங்கவும்', locationPermissionBody: 'உள்ளூர் வானிலை பரிந்துரைகளை வழங்க உங்கள் இருப்பிடத்தைப் பயன்படுத்தவும்.', useLocation: 'என் இருப்பிடத்தைப் பயன்படுத்து', searchLocation: 'இடத்தைத் தேடு', changeLocation: 'இடத்தை மாற்று', gettingLocationTitle: 'இருப்பிடத்தைப் பெறுகிறது...', gettingLocationBody: 'அச்சுரேகைகளைப் பெற அனுமதி வழங்கவும்.', fetchingWeatherTitle: 'உள்ளூர் வானிலையைப் பெறுகிறது...', fetchingWeatherBody: 'நேரலை நிலைமைகளை மீட்டெடுக்கிறது.', locationDeniedTitle: 'இருப்பிட அணுகல் கிடைக்கவில்லை', locationDeniedBody: 'இருப்பிட அனுமதி மறுக்கப்பட்டது. நகரத்தைத் தேடவும்.', locationUnavailableTitle: 'இருப்பிடத்தை தீர்மானிக்க முடியவில்லை', locationUnavailableBody: 'மீண்டும் முயற்சிக்கவும் அல்லது கைமுறையாகத் தேடவும்.', locationTimeoutTitle: 'கோரிக்கை நேரம் முடிந்தது', locationTimeoutBody: 'மீண்டும் முயற்சிக்கவும் அல்லது தேடவும்.', locationUnsupportedTitle: 'இருப்பிடம் ஆதரிக்கப்படவில்லை', locationUnsupportedBody: 'நகரம் அல்லது பகுதியைத் தேடவும்.', offlineTitle: 'வானிலைக்கு இணையம் தேவை', offlineBody: 'ஆஃப்லைனில் இருக்கும்போது நேரலை வானிலை கிடைக்காது.', serviceErrorTitle: 'வானிலை சேவை தற்காலிகமாக கிடைக்கவில்லை', serviceErrorBody: 'மீண்டும் முயற்சிக்கவும் அல்லது இடத்தை மாற்றவும்.', invalidLocationTitle: 'தகவல் கிடைக்கவில்லை', invalidLocationBody: 'மீண்டும் தேடி அருகிலுள்ள நகரத்தைத் தேர்ந்தெடுக்கவும்.', lastUpdated: 'கடைசி புதுப்பிப்பு: {{time}}', live: 'நேரலை', cached: 'சேமிக்கப்பட்டது', offlineCached: 'ஆஃப்லைன் · கடைசி வானிலை', searchTitle: 'இடத்தைத் தேடுங்கள்', searchPlaceholder: 'நகரம், கிராமம் அல்லது மாவட்டம்', searching: 'தேடுகிறது...', noSearchResults: 'பொருந்தும் இடம் இல்லை.', locationSearchUnavailable: 'தேடல் சேவை கிடைக்கவில்லை.', retry: 'மீண்டும் முயற்சி', cancel: 'ரத்து', currentWeather: 'தற்போதைய வானிலை', atAGlance: 'ஒரு பார்வையில்', precipitation: 'மழைப்பொழிவு', windDirection: 'காற்றின் திசை', cloudCover: 'மேக மூட்டம்', visibility: 'பார்வைத் திறன்', pressure: 'அழுத்தம்', rainWater: 'மழை & நீர்', rainIrrigation: 'மழை & பாசனம்', rainSummary: 'மழை தகவல்', upcoming: 'வரவிருக்கும் நிலைமைகள்', forecast: 'வானிலை முன்னறிவிப்பு', forecastUnavailable: 'முன்னறிவிப்பு கிடைக்கவில்லை.', rainProbabilityValue: '{{value}}% மழை வாய்ப்பு', precipitationValue: '{{value}} மி.மீ மழைப்பொழிவு', rainDataUnavailable: 'மழை விவரங்கள் கிடைக்கவில்லை.', adviceUnavailable: 'ஆலோசனை கிடைக்கவில்லை', adviceUnavailableBody: 'பாசனத்திற்கு முன் ஈரப்பதத்தை சரிபார்க்கவும்.', unknownCondition: 'நிலைமை கிடைக்கவில்லை' },
      market: {
        eyebrow: 'மண்டி நுண்ணறிவு',
        title: 'சந்தை விலைகள்',
        subtitle: 'உங்கள் பயிர் மற்றும் இடத்திற்கான சமீபத்திய மொத்த மண்டி விலைகள் மற்றும் வரலாற்று போக்குகளைப் பார்க்கவும்.',
        selectCrop: 'பயிரைத் தேர்வுசெய்',
        selectLocation: 'இடத்தைத் தேர்வுசெய்',
        detectLocation: 'இருப்பிடத்தை கண்டறி',
        allMarkets: 'அனைத்து மண்டிகள்',
        latestTitle: 'சமீபத்திய மண்டி விலை',
        modalPrice: 'சராசரி மாதிரி விலை',
        minPrice: 'குறைந்தபட்ச விலை',
        maxPrice: 'அதிகபட்ச விலை',
        priceUnit: '₹ / குவிண்டால்',
        variety: 'ரகம்: {{value}}',
        updated: 'புதுப்பிப்பு: {{date}}',
        latestAvailable: 'சமீபத்திய சந்தை தரவு',
        saveCrop: '☆ பயிரை சேமி',
        saveMarket: '☆ மண்டியை சேமி',
        saved: '★ சுயவிவரத்தில் சேமிக்கப்பட்டது',
        compareTitle: 'மண்டிகளை ஒப்பிடுக',
        compareSubtitle: 'அருகிலுள்ள மாவட்ட சந்தைகளின் மொத்த விலை ஒப்பீடு',
        highestPrice: 'அதிகபட்ச விலை',
        lowestPrice: 'குறைந்தபட்ச விலை',
        nearestLocation: 'அருகிலுள்ள இடம்',
        sameDistrict: 'அதே மாவட்டம்',
        sameState: 'அதே மாநிலம்',
        otherMarket: 'மற்ற சந்தை',
        priceHistoryTitle: 'விலை வரலாறு மற்றும் போக்கு பகுப்பாய்வு',
        priceHistorySubtitle: 'காலப்போக்கில் இந்த பயிரின் மண்டி விலை எவ்வாறு மாறியுள்ளது என்பதைப் புரிந்து கொள்ளுங்கள்.',
        period7d: '7 நாட்கள்',
        period30d: '30 நாட்கள்',
        period3m: '3 மாதங்கள்',
        period6m: '6 மாதங்கள்',
        period1y: '1 ஆண்டு',
        typeModal: 'சராசரி மாதிரி விலை',
        typeMin: 'குறைந்தபட்ச விலை',
        typeMax: 'அதிகபட்ச விலை',
        summaryLatest: 'சமீபத்திய மாதிரி விலை',
        summaryHigh: 'காலத்தின் உச்ச விலை',
        summaryLow: 'காலத்தின் குறைந்த விலை',
        summaryChange: 'விலை மாற்றம்',
        trendTitle: 'விலைப் போக்கு',
        trendIncreasing: 'அதிகரிக்கிறது',
        trendStable: 'நிலையானது',
        trendDecreasing: 'குறைகிறது',
        trendInsufficient: 'போதுமான தரவு இல்லை',
        whatChartShowsTitle: 'விளக்கப்படம் என்ன காட்டுகிறது',
        historicalRecordsTitle: 'வரலாற்றுப் பதிவுகள்',
        downloadCsv: 'விலை வரலாற்றைப் பதிவிறக்கு (CSV)',
        tableDate: 'தேதி',
        tableMarket: 'மண்டி / சந்தை',
        tableCommodity: 'பயிர்',
        tableVariety: 'ரகம்',
        tableMin: 'குறைந்தது (₹)',
        tableModal: 'சராசரி (₹)',
        tableMax: 'அதிகம் (₹)',
        noDataTitle: 'சந்தை தரவு இல்லை',
        noDataBody: 'இந்த பயிர் மற்றும் இடத்திற்கான சந்தை பதிவுகள் எதுவும் கிடைக்கவில்லை.',
        serviceErrorTitle: 'சந்தை சேவை கிடைக்கவில்லை',
        serviceErrorBody: 'சந்தை விலைகள் தற்காலிகமாக கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.',
        offlineTitle: 'ஆஃப்லைன் பயன்முறை',
        offlineCached: 'ஆஃப்லைன் · கடைசியாக கிடைத்த சந்தை தரவு (புதுப்பிப்பு: {{date}})',
        offlineNoCache: 'புதிய சந்தை விலைகளைப் பார்க்க இணைய இணைப்பு தேவை.',
        sourceLabel: 'ஆதாரம்: இந்திய அரசு — Data.gov.in / AGMARKNET',
        sourceInfo: 'அக்மார்க்நெட் அதிகாரப்பூர்வ தினசரி மொத்த விவசாய சந்தை தரவு.',
        officialPortal: 'அக்மார்க்நெட் போர்டல் ↗',
        retry: 'மீண்டும் முயற்சி',
        loading: 'சந்தை விலைகள் ஏற்றப்படுகின்றன...'
      },
      schemes: {
        eyebrow: 'அரசு முயற்சிகள்',
        title: 'அரசுத் திட்டங்கள்',
        subtitle: 'விவசாயிகளுக்கு கிடைக்கும் நிதி உதவி, மானியங்கள் மற்றும் காப்பீட்டுத் திட்டங்களைக் கண்டறியவும்.',
        searchPlaceholder: 'பயிர், பெயர் அல்லது நோக்கத்தின்படி தேடுங்கள் (எ.கா. பயிர் காப்பீடு, சோலார் பம்ப், பிஎம் கிசான்)...',
        allCategories: 'அனைத்துப் பிரிவுகள்',
        allLevels: 'அனைத்து நிலைகள்',
        central: 'மத்திய அரசு',
        state: 'மாநில அரசு',
        allStates: 'அனைத்து மாநிலங்கள்',
        recommendedTitle: 'உங்கள் பண்ணைக்கு பரிந்துரைக்கப்படுபவை',
        recommendedSubtitle: 'உங்கள் பயிர் மற்றும் இடத்திற்கு பொருந்தும் திட்டங்கள்',
        mayBeRelevant: 'உங்கள் சுயவிவரத்திற்கு பொருத்தமானதாக இருக்கலாம்',
        viewDetails: 'விவரங்களைப் பார்',
        checkEligibility: 'தகுதியைச் சரிபார்',
        officialWebsite: 'அதிகாரப்பூர்வ தளம் ↗',
        modalOverview: 'திட்ட விவரம்',
        modalBenefits: 'முக்கிய நன்மைகள்',
        modalEligibility: 'தகுதி வரம்புகள்',
        modalDocuments: 'தேவையான ஆவணங்கள்',
        modalApplication: 'விண்ணப்பிக்கும் முறை',
        modalSource: 'அதிகாரப்பூர்வ ஆதாரம்',
        eligibilityTitle: 'சுய தகுதிச் சரிபார்ப்பு',
        eligibilitySubtitle: 'அதிகாரப்பூர்வ விதிகளின்படி நீங்கள் தகுதி பெறுகிறீர்களா என்பதைப் பார்க்க சில கேள்விகளுக்கு பதிலளிக்கவும்.',
        btnCheckNow: 'தகுதியை மதிப்பிடு',
        btnProceedOfficial: 'அதிகாரப்பூர்வ தளத்தில் விண்ணப்பிக்கவும்',
        qLandowner: 'உங்கள் பெயரில் சாகுபடி செய்யக்கூடிய விவசாய நிலம் உள்ளதா?',
        qAadhaar: 'மொபைலுடன் இணைக்கப்பட்ட ஆதார் அட்டை உள்ளதா?',
        qBank: 'ஆதார் இணைக்கப்பட்ட வங்கி கணக்கு உள்ளதா?',
        qTax: 'நீங்கள் வருமான வரி செலுத்துபவரா அல்லது அரசு ஊழியரா?',
        qWater: 'உங்களிடம் உறுதிசெய்யப்பட்ட நீர் ஆதாரம் (கிணறு / போர்வெல் / கால்வாய் / குளம்) உள்ளதா?',
        yes: 'ஆம்',
        no: 'இல்லை',
        matchedHeader: 'பொருந்திய தகுதிகள்',
        unmatchedHeader: 'சரிபார்க்க வேண்டிய நிபந்தனைகள்',
        noSchemesFound: 'திட்டங்கள் எதுவும் கிடைக்கவில்லை. வேறு சொற்களைத் தேடுங்கள்.',
        offlineTitle: 'ஆஃப்லைன் பயன்முறை',
        offlineBody: 'சேமிக்கப்பட்ட திட்டங்கள் காட்டப்படுகின்றன.',
        sourceLabel: 'ஆதாரம்: இந்திய அரசு — myScheme.gov.in / வேளாண் அமைச்சகம்',
        sourceDisclaimer: 'விவரங்கள் அதிகாரப்பூர்வ அறிவிப்புகளின் அடிப்படையிலானவை. விண்ணப்பிக்கும் முன் சரிபார்க்கவும்.'
      },
      history: { eyebrow: 'உங்கள் பதிவுகள்', title: 'ஸ்கேன் வரலாறு', subtitle: 'சமீபத்திய பயிர் பகுப்பாய்வுகளை மதிப்பாய்வு செய்க.', sync: 'பதிவுகளை ஒத்திசைக்கவும்', search: 'பயிர் அல்லது நிலையைத் தேடவும்', emptyTitle: 'இன்னும் வரலாறு இல்லை', emptyBody: 'உங்கள் சேமிக்கப்பட்ட பகுப்பாய்வுகள் இங்கே தோன்றும்.', analysisRecord: 'பகுப்பாய்வு பதிவு', severity: '{{value}} தீவிரம்', detail: 'கண்டறிதல் விவரம்', date: 'தேதி', status: 'நிலை', symptoms: 'அறிகுறிகள்', treatment: 'சிகிச்சை', syncAlready: 'அனைத்து பதிவுகளும் ஏற்கனவே ஒத்திசைக்கப்பட்டுள்ளன.', syncStart: 'ஒத்திசைக்கிறது...', syncSuccess: 'ஒத்திசைவு முடிந்தது.', syncFailed: 'ஒத்திசைக்க முடியவில்லை.' },
      profile: { eyebrow: 'கணக்கு', title: 'சுயவிவர அமைப்புகள்', subtitle: 'உங்கள் விவரங்கள் மற்றும் விருப்பங்களைப் புதுப்பித்த நிலையில் வைத்திருங்கள்.', fullName: 'முழுப் பெயர்', phone: 'மொபைல் எண்', crop: 'முதன்மைப் பயிர்', location: 'கிராமம் / மாவட்டம்', save: 'சுயவிவரத்தை சேமி', statusEyebrow: 'பணியிட நிலை', network: 'நெட்வொர்க்', bridge: 'ஆஃப்லைன் மாதிரி பாலம்', accountSync: 'கணக்கு ஒத்திசைவு', signOut: 'வெளியேறு', signedIn: '{{email}} ஆக உள்நுழைந்துள்ளீர்கள்.', signInToSync: 'ஒத்திசைக்க உள்நுழைக.', connected: 'இணைக்கப்பட்டது', localMode: 'ஆஃப்லைன் (உள்ளூர் முறை)', bridgeAvailable: 'கிடைக்கிறது (Android)', bridgeUnavailable: 'கிடைக்கவில்லை (உலாவி)', saved: 'சுயவிவரம் புதுப்பிக்கப்பட்டது.' },
      shops: { eyebrow: 'உள்ளூர் ஆதரவு', title: 'அருகிலுள்ள வேளாண் கடைகள்', subtitle: 'விவசாய சப்ளையர்களைக் கண்டறியவும்.', store: 'வேளாண் கடை', pesticides: 'பூச்சிக்கொல்லிகள்', fertilizer: 'உரம்', seeds: 'விதைகள்', detect: 'என் இடத்தை கண்டறி', detecting: 'GPS தேடுகிறது...', found: 'இடம் கிடைத்தது ({{lat}}, {{lon}})', manual: 'பொது பகுதி தேடல்', unavailable: 'இருப்பிடம் கிடைக்கவில்லை', search: 'தேடல்: “{{category}}” {{near}}', near: 'அருகில்', open: 'Google Maps திற', noteTitle: 'இருப்பிட அடிப்படையிலான தேடல்', noteBody: 'வரைபடத்தை மையப்படுத்த மட்டுமே இருப்பிடம் பயன்படுகிறது.' },
      language: { eyebrow: 'விருப்பங்கள்', title: 'மொழி', subtitle: 'வயலில் பயன்படுத்த வசதியான மொழியைத் தேர்வுசெய்யவும்.', default: 'இயல்புநிலை மொழி', hindi: 'இந்தி', marathi: 'மராத்தி', tamil: 'தமிழ்', telugu: 'தெலுங்கு', changed: 'மொழி {{language}} ஆக மாற்றப்பட்டது.' },
      validation: { invalidEmail: 'சரியான மின்னஞ்சலை உள்ளிடவும்.', weakPassword: 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.', missingEmail: 'மின்னஞ்சலை உள்ளிடவும்.', nameRequired: 'முழுப் பெயரை உள்ளிடவும்.', wrongPassword: 'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது.', emailInUse: 'மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது.', popupClosed: 'உள்நுழைவு பாப்அப் முடிவதற்குள் மூடப்பட்டது. மீண்டும் முயற்சிக்கவும்.', popupCancelled: 'உள்நுழைவு கோரிக்கை ரத்து செய்யப்பட்டது.', popupBlocked: 'உலாவி பாப்அப்பைத் தடுத்துள்ளது. தயவுசெய்து பாப்அப்பை அனுமதிக்கவும்.', accountExistsDifferentCredential: 'இந்த மின்னஞ்சலில் ஏற்கனவே மற்றொரு முறையில் கணக்கு உள்ளது.', unauthorizedDomain: 'இந்த டொமைன் அங்கீகரிக்கப்படவில்லை.', googleProviderNotFound: 'Google உள்நுழைவு தற்காலிகமாக கிடைக்கவில்லை.', network: 'இணைக்க முடியவில்லை.', default: 'ஏதோ தவறு நடந்தது.', resetUnavailable: 'மின்னஞ்சல் அனுப்ப முடியவில்லை.' },
      authStatus: { loginSuccess: 'உள்நுழைவு வெற்றிகரமானது.', registerSuccess: 'கணக்கு உருவாக்கப்பட்டது.', logoutSuccess: 'வெளியேறியது வெற்றிகரமானது.', tooMany: 'அதிக முயற்சிகள். காத்திருக்கவும்.', disabled: 'கணக்கு முடக்கப்பட்டது.', notAllowed: 'மின்னஞ்சல் உள்நுழைவு இயக்கப்படவில்லை.' },
      common: { back: 'பின்செல்', retry: 'மீண்டும் முயற்சி', cancel: 'ரத்து', remove: 'நீக்கு', change: 'மாற்று', loading: 'ஏற்றுகிறது...', online: 'ஆன்லைன்', offline: 'ஆஃப்லைன்' }
    },
    te: {
      auth: { workspace: 'మీ వ్యవసాయ కార్యస్థలం', visualOverline: 'ప్రతి పంట కాలానికి వ్యవసాయ మేధస్సు', visualTitle: 'ఆరోగ్యకరమైన పంటల కోసం మెరుగైన నిర్ణయాలు.', visualBody: 'మీ పొలానికి అవసరమైనప్పుడు ఆన్‌లైన్ మరియు ఆఫ్‌లైన్‌లో పనిచేసే ఏఐ పంట మార్గదర్శకత్వం.', secure: 'సురక్షిత కార్యస్థలం', connected: 'ఆన్‌లైన్ + పరికరంలో సిద్ధం', signInTitle: 'తిరిగి స్వాగతం', signInSubtitle: 'మీ పంట మేధస్సు కార్యస్థలానికి వెళ్లడానికి సైన్ ఇన్ చేయండి.', createTitle: 'మీ కార్యస్థలాన్ని సృష్టించండి', createSubtitle: 'మీ పంట సమాచారం కోసం సురక్షిత కార్యస్థలాన్ని సృష్టించండి.', signIn: 'సైన్ ఇన్', createAccount: 'ఖాతా సృష్టించండి', fullName: 'పూర్తి పేరు', email: 'ఈమెయిల్ చిరునామా', password: 'పాస్‌వర్డ్', confirmPassword: 'పాస్‌వర్డ్ నిర్ధారించండి', remember: 'నన్ను గుర్తుంచుకో', forgot: 'పాస్‌వర్డ్ మర్చిపోయారా?', show: 'చూపించు', hide: 'దాచు', submitSignIn: 'సైన్ ఇన్', submitCreate: 'ఖాతా సృష్టించండి', newHere: 'HaritKranti కి కొత్తవారా?', alreadyMember: 'ఇప్పటికే ఖాతా ఉందా?', switchCreate: 'ఖాతా సృష్టించండి', switchSignIn: 'సైన్ ఇన్', continueWithGoogle: 'Google తో కొనసాగించండి', orDivider: 'లేదా', legal: 'కొనసాగించడం ద్వారా, స్థానిక వ్యవసాయ నిపుణుల సలహాతో పాటు ఏఐ మార్గదర్శకత్వాన్ని ఉపయోగించడానికి అంగీకరిస్తున్నారు.', processing: 'ప్రాసెస్ అవుతోంది...', resetSent: 'పాస్‌వర్డ్ రీసెట్ ఈమెయిల్ పంపబడింది.', resetPrompt: 'ముందుగా ఈమెయిల్ నమోదు చేసి పాస్‌వర్డ్ మర్చిపోయారా ఎంచుకోండి.', passwordMismatch: 'పాస్‌వర్డ్‌లు సరిపోలలేదు.', confirmPasswordRequired: 'పాస్‌వర్డ్ నిర్ధారించండి.', missingPassword: 'దయచేసి పాస్‌వర్డ్ నమోదు చేయండి.' },
      nav: { home: 'హోమ్', dashboard: 'డాష్‌బోర్డ్', scan: 'పంట స్కాన్', weather: 'వాతావరణం', market: 'మార్కెట్ ధరలు', schemes: 'ప్రభుత్వ పథకాలు', history: 'చరిత్ర', profile: 'ప్రొఫైల్', language: 'భాష', more: 'మరిన్ని' },
      network: { online: 'ఆన్‌లైన్', offline: 'ఆఫ్‌లైన్', onlineAI: 'ఆన్‌లైన్ ఏఐ అందుబాటులో ఉంది', offlineAI: 'ఆఫ్‌లైన్ ఏఐ అందుబాటులో ఉంది', offlineUnavailable: 'ఈ పరికరంలో ఆఫ్‌లైన్ ఏఐ అందుబాటులో లేదు', usingOnline: 'ఆన్‌లైన్ ఏఐ ఉపయోగిస్తోంది', usingOffline: 'ఆఫ్‌లైన్ ఏఐ ఉపయోగిస్తోంది', connectionLost: 'మీరు ఆఫ్‌లైన్‌లో ఉన్నారు.', connectionRestored: 'కనెక్షన్ పునరుద్ధరించబడింది.', offlineBanner: 'ప్రస్తుతం ఆఫ్‌లైన్‌లో ఉంది. స్థానిక ఫీచర్లు అందుబాటులో ఉన్నాయి.' },
      dashboard: { eyebrow: 'మీ వ్యవసాయ కార్యస్థలం', greeting: 'నమస్కారం, {{name}}.', subtitle: 'మెరుగైన పంట నిర్ణయాల కోసం స్పష్టమైన సమాచారం.', heroEyebrow: 'పంట మేధస్సు', heroTitle: 'ఆరోగ్యకరమైన పంటల కోసం మెరుగైన నిర్ణయాలు.', heroBody: 'ఆకు ఫోటోను అప్‌లోడ్ చేసి తదుపరి ఆచరణాత్మక మార్గదర్శకత్వాన్ని పొందండి.', startScan: 'పంట స్కాన్ ప్రారంభించండి', quickEyebrow: 'త్వరిత ప్రాప్యత', quickTitle: 'పొలానికి ఉపయోగపడేవి', scanTitle: 'పంట ఆరోగ్యాన్ని స్కాన్ చేయండి', scanBody: 'ఫోటో నుండి ఆచరణాత్మక సలహా', weatherTitle: 'వాతావరణం & నీరు', weatherBody: 'నీటిపారుదల నిర్ణయాలు నమ్మకంగా తీసుకోండి', marketTitle: 'మార్కెట్ ధరలు & పోకడలు', marketBody: 'తాజా మండి ధరలు మరియు 30 రోజుల చారిత్రక పోకడలు', schemesTitle: 'ప్రభుత్వ పథకాలు', schemesBody: 'రైతు సబ్సిడీలు, పీఎం కిసాన్, పంట బీమా మరియు మరిన్ని', historyTitle: 'స్కాన్ చరిత్ర', historyBody: 'మీ ఇటీవలి పంట సమాచారాన్ని సమీక్షించండి', nearby: 'సమీప వ్యవసాయ దుకాణాలు', settings: 'ప్రొఫైల్ సెట్టింగ్‌లు' },
      scan: { eyebrow: 'పంట మేధస్సు', title: 'పంట స్కాన్', subtitle: 'ఏఐ విశ్లేషణ కోసం మీ పంట లేదా ఆకు యొక్క స్పష్టమైన చిత్రాన్ని అప్‌లోడ్ చేయండి.', upload: 'పంట చిత్రాన్ని అప్‌లోడ్ చేయండి', formats: 'JPG లేదా PNG • 10 MB వరకు', photoTip: 'మంచి ఫలితాల కోసం ఒక ఆకును స్పష్టమైన వెలుతురులో ఫోటో తీయండి.', takePhoto: 'ఫోటో తీయండి', uploadImage: 'చిత్రాన్ని అప్‌లోడ్ చేయండి', ready: 'విశ్లేషణకు సిద్ధంగా ఉంది', review: 'కొనసాగే ముందు చిత్రాన్ని తనిఖీ చేయండి.', analyze: 'పంటను విశ్లేషించండి', guideEyebrow: 'ఫోటో గైడ్', guideTitle: 'మోడల్‌కు స్పష్టంగా చూపించండి', guideOne: 'సహజ వెలుతురును ఉపయోగించండి.', guideTwo: 'ఆకును మధ్యలో ఉంచండి.', guideThree: 'ఒకసారి ఒక ప్రభావిత ఆకును ఉంచండి.', privacy: 'మీ చిత్రం విశ్లేషణ సేవకు మాత్రమే పంపబడుతుంది.', analyzing: 'మీ పంట విశ్లేషించబడుతోంది...', stepSymptoms: 'లక్షణాలను తనిఖీ చేస్తోంది', stepPatterns: 'పంట నమూనాలను పోలుస్తోంది', stepRecommendations: 'సిఫార్సులను సిద్ధం చేస్తోంది', newScan: 'కొత్త స్కాన్', invalidImage: 'సరైన పంట చిత్రాన్ని ఎంచుకోండి.', tooLarge: 'చిత్రం పరిమాణం 10 MB మించిపోయింది.', selectFirst: 'ముందుగా చిత్రాన్ని ఎంచుకోండి.', onlineNeedsConnection: 'ఆన్‌లైన్ ఏఐకి ఇంటర్నెట్ అవసరం.', offlineUnavailable: 'ఆఫ్‌లైన్‌లో ఉన్నారు, మోడల్ అందుబాటులో లేదు.', offlineNoResult: 'విశ్లేషణ ఫలితం రాలేదు.', offlineUnreadable: 'ఫలితం చదవలేకపోయాము.', offlineUnsupported: 'మద్దతు లేని ఫలితం.', diagnosisFailed: 'విశ్లేషణ విఫలమైంది.' },
      diagnosis: { eyebrow: 'విశ్లేషణ పూర్తయింది', title: 'పంట విశ్లేషణ', observation: 'పరిశీలన', observationTitle: 'మేము గుర్తించినవి', nextStep: 'తదుపరి చర్య', actionTitle: 'సిఫార్సు చేసిన చర్య', confidence: 'విశ్వసనీయత', aiVision: 'ఏఐ దృష్టి విశ్లేషణ', severity: 'తీవ్రత', crop: 'పంట', prevention: 'నివారణ', inputs: 'పరిశీలించవలసిన మందులు', overviewFallback: 'మీ పంట చిత్రం సమీక్షించబడింది.', symptomsFallback: 'లక్షణాలు ఇక్కడ కనిపిస్తాయి.', treatmentFallback: 'చికిత్స మార్గదర్శకత్వం ఇక్కడ కనిపిస్తుంది.', fertilizerFallback: 'ఎరువుల మార్గదర్శకత్వం ఇక్కడ కనిపిస్తుంది.', pesticidesFallback: 'సిఫార్సు చేసిన మందులు ఇక్కడ కనిపిస్తాయి.', disclaimer: 'ఏఐ సలహాను స్థానిక వ్యవసాయ అధికారి లేదా లేబుల్ ద్వారా సరిచూసుకోండి.', save: 'చరిత్రలో భద్రపరచు', findShops: 'సమీప వ్యవసాయ దుకాణాలను కనుగొనండి', saved: 'రికార్డ్ భద్రపరచబడింది.', saveFailed: 'భద్రపరచడం విఫలమైంది.' },
      weather: { eyebrow: 'పొలం పరిస్థితులు', title: 'వాతావరణం & నీరు', currentLocation: 'ప్రస్తుత స్థానం', locationLoading: 'స్థానాన్ని గుర్తిస్తోంది...', current: 'ప్రస్తుత పరిస్థితులు', temperature: 'ఉష్ణోగ్రత', humidity: 'తేమ', wind: 'గాలి', rain: 'వర్షం అవకాశం', refresh: 'వాతావరణ స్థానాన్ని తాజాకరించు', adviceEyebrow: 'నీటిపారుదల సలహా', loading: 'సలహా లోడ్ అవుతోంది', loadingBody: 'ప్రస్తుత పరిస్థితులు అందుబాటులోకి వచ్చినప్పుడు నీటిపారుదల సలహా కనిపిస్తుంది.', unavailableLocation: 'ప్రత్యక్ష పరిస్థితులు అందుబాటులో లేవు', unavailableCondition: 'వాతావరణ సేవ అందుబాటులో లేదు', unavailableTitle: 'ప్రత్యక్ష నీటిపారుదల సలహా లేదు', unavailableBody: 'నీటిపారుదల ప్రణాళికకు ముందు తిరిగి కనెక్ట్ చేయండి.', fallbackAdvice: 'మీ పంటకు సాధారణ నీటిపారుదల సలహాను అనుసరించండి.', pageSubtitle: 'మీ స్థానిక వాతావరణం మరియు వ్యవసాయ పరిస్థితులు', locationLabel: 'స్థానం', locationPermissionTitle: 'స్థాన అనుమతిని ఇవ్వండి', locationPermissionBody: 'స్థానిక వాతావరణ సిఫార్సులను అందించడానికి మీ స్థానాన్ని ఉపయోగించండి.', useLocation: 'నా స్థానాన్ని ఉపయోగించు', searchLocation: 'స్థానాన్ని శోధించండి', changeLocation: 'స్థానాన్ని మార్చండి', gettingLocationTitle: 'స్థానాన్ని పొందుతోంది...', gettingLocationBody: 'అనుమతిని ఇవ్వండి.', fetchingWeatherTitle: 'వాతావరణాన్ని పొందుతోంది...', fetchingWeatherBody: 'ప్రత్యక్ష పరిస్థితులను పొందుతోంది.', locationDeniedTitle: 'స్థాన అనుమతి నిరాకరించబడింది', locationDeniedBody: 'నగరాన్ని శోధించండి.', locationUnavailableTitle: 'స్థానాన్ని నిర్ణయించలేకపోయాము', locationUnavailableBody: 'మళ్లీ ప్రయత్నించండి.', locationTimeoutTitle: 'సమయం ముగిసింది', locationTimeoutBody: 'మళ్లీ ప్రయత్నించండి.', locationUnsupportedTitle: 'స్థాన ఫీచర్‌కు మద్దతు లేదు', locationUnsupportedBody: 'నగరాన్ని శోధించండి.', offlineTitle: 'వాతావరణానికి ఇంటర్నెట్ అవసరం', offlineBody: 'ఆఫ్‌లైన్‌లో ఉన్నప్పుడు ప్రత్యక్ష వాతావరణం అందుబాటులో ఉండదు.', serviceErrorTitle: 'సేవ తాత్కాలికంగా అందుబాటులో లేదు', serviceErrorBody: 'మళ్లీ ప్రయత్నించండి లేదా స్థానాన్ని మార్చండి.', invalidLocationTitle: 'సమాచారం కనుగొనబడలేదు', invalidLocationBody: 'మళ్లీ శోధించండి.', lastUpdated: 'చివరి అప్‌డేట్: {{time}}', live: 'ప్రత్యక్షం', cached: 'సేవ్ చేయబడింది', offlineCached: 'ఆఫ్‌లైన్ · చివరి వాతావరణం', searchTitle: 'మీ స్థానాన్ని శోధించండి', searchPlaceholder: 'నగరం, గ్రామం లేదా జిల్లా', searching: 'శోధిస్తోంది...', noSearchResults: 'సరిపోలే స్థానాలు లేవు.', locationSearchUnavailable: 'శోధన సేవ అందుబాటులో లేదు.', retry: 'మళ్లీ ప్రయత్నించండి', cancel: 'రద్దు', currentWeather: 'ప్రస్తుత వాతావరణం', atAGlance: 'ఒక చూపులో', precipitation: 'వర్షపాతం', windDirection: 'గాలి దిశ', cloudCover: 'మేఘావృతం', visibility: 'దృశ్యమానత', pressure: 'పీడనం', rainWater: 'వర్షం & నీరు', rainIrrigation: 'వర్షం & నీటిపారుదల', rainSummary: 'వర్షం సమాచారం', upcoming: 'రాబోయే పరిస్థితులు', forecast: 'వాతావరణ సూచన', forecastUnavailable: 'సూచన అందుబాటులో లేదు.', rainProbabilityValue: '{{value}}% వర్షం అవకాశం', precipitationValue: '{{value}} మి.మీ వర్షపాతం', rainDataUnavailable: 'వర్షం వివరాలు అందుబాటులో లేవు.', adviceUnavailable: 'సలహా అందుబాటులో లేదు', adviceUnavailableBody: 'తేమను తనిఖీ చేయండి.', unknownCondition: 'పరిస్థితి అందుబాటులో లేదు' },
      market: {
        eyebrow: 'మండి సమాచారం',
        title: 'మార్కెట్ ధరలు',
        subtitle: 'మీ పంట మరియు ప్రాంతం కోసం తాజా మార్కెట్ యార్డ్ హోల్‌సేల్ ధరలు మరియు చారిత్రక పోకడలను తనిఖీ చేయండి.',
        selectCrop: 'పంటను ఎంచుకోండి',
        selectLocation: 'స్థానాన్ని ఎంచుకోండి',
        detectLocation: 'స్థానాన్ని గుర్తించండి',
        allMarkets: 'అన్ని మార్కెట్లు',
        latestTitle: 'తాజా మార్కెట్ ధర',
        modalPrice: 'సగటు మోడల్ ధర',
        minPrice: 'కనిష్ట ధర',
        maxPrice: 'గరిష్ట ధర',
        priceUnit: '₹ / క్వింటాల్',
        variety: 'రకం: {{value}}',
        updated: 'అప్‌డేట్: {{date}}',
        latestAvailable: 'తాజా మార్కెట్ సమాచారం',
        saveCrop: '☆ పంటను సేవ్ చేయి',
        saveMarket: '☆ మార్కెట్‌ను సేవ్ చేయి',
        saved: '★ ప్రొఫైల్‌లో సేవ్ చేయబడింది',
        compareTitle: 'మార్కెట్ల పోలిక',
        compareSubtitle: 'సమీప జిల్లాల మార్కెట్లలో హోల్‌సేల్ ధరల పోలిక',
        highestPrice: 'అత్యధిక ధర',
        lowestPrice: 'అతి తక్కువ ధర',
        nearestLocation: 'సమీప స్థానం',
        sameDistrict: 'అదే జిల్లా',
        sameState: 'అదే రాష్ట్రం',
        otherMarket: 'ఇతర మార్కెట్',
        priceHistoryTitle: 'ధర చరిత్ర & ట్రెండ్ విశ్లేషణ',
        priceHistorySubtitle: 'కాలక్రమేణా ఈ పంట మండి ధర ఎలా మారిందో అర్థం చేసుకోండి.',
        period7d: '7 రోజులు',
        period30d: '30 రోజులు',
        period3m: '3 నెలలు',
        period6m: '6 నెలలు',
        period1y: '1 సంవత్సరం',
        typeModal: 'మోడల్ ధర',
        typeMin: 'కనిష్ట ధర',
        typeMax: 'గరిష్ట ధర',
        summaryLatest: 'తాజా మోడల్ ధర',
        summaryHigh: 'గరిష్ట ధర',
        summaryLow: 'కనిష్ట ధర',
        summaryChange: 'ధర మార్పు',
        trendTitle: 'ధర ట్రెండ్',
        trendIncreasing: 'పెరుగుతోంది',
        trendStable: 'స్థిరంగా ఉంది',
        trendDecreasing: 'తగ్గుతోంది',
        trendInsufficient: 'సరిపడా డేటా లేదు',
        whatChartShowsTitle: 'చార్ట్ ఏమి చూపుతుంది',
        historicalRecordsTitle: 'చారిత్రక రికార్డులు',
        downloadCsv: 'ధరల చరిత్రను డౌన్‌లోడ్ చేయండి (CSV)',
        tableDate: 'తేదీ',
        tableMarket: 'మార్కెట్ / మండి',
        tableCommodity: 'పంట',
        tableVariety: 'రకం',
        tableMin: 'కనిష్ట (₹)',
        tableModal: 'మోడల్ (₹)',
        tableMax: 'గరిష్ట (₹)',
        noDataTitle: 'మార్కెట్ సమాచారం కనుగొనబడలేదు',
        noDataBody: 'ఈ పంట మరియు ప్రాంతానికి మార్కెట్ రికార్డులు అందుబాటులో లేవు.',
        serviceErrorTitle: 'సేవ తాత్కాలికంగా అందుబాటులో లేదు',
        serviceErrorBody: 'మార్కెట్ ధరలు ప్రస్తుతం అందుబాటులో లేవు. దయచేసి మళ్లీ ప్రయత్నించండి.',
        offlineTitle: 'ఆఫ్‌లైన్ మోడ్',
        offlineCached: 'ఆఫ్‌లైన్ · చివరి మార్కెట్ ధర (అప్‌డేట్: {{date}})',
        offlineNoCache: 'తాజా మార్కెట్ ధరలను చూడటానికి ఇంటర్నెట్ అవసరం.',
        sourceLabel: 'మూలం: భారత ప్రభుత్వం — Data.gov.in / AGMARKNET',
        sourceInfo: 'అధికారిక అగ్‌మార్క్‌నెట్ రోజువారీ వ్యవసాయ మార్కెట్ ధరల డేటా.',
        officialPortal: 'అగ్‌మార్క్‌నెట్ పోర్టల్ ↗',
        retry: 'మళ్లీ ప్రయత్నించండి',
        loading: 'మార్కెట్ ధరలు లోడ్ అవుతున్నాయి...'
      },
      schemes: {
        eyebrow: 'ప్రభుత్వ కార్యక్రమాలు',
        title: 'ప్రభుత్వ పథకాలు',
        subtitle: 'రైతులకు అందుబాటులో ఉన్న ఆర్థిక సహాయం, సబ్సిడీలు మరియు బీమా పథకాలను కనుగొనండి.',
        searchPlaceholder: 'పంట, పేరు లేదా ప్రయోజనం ద్వారా శోధించండి (ఉదా. పంట బీమా, సోలార్ పంప్, పీఎం కిసాన్)...',
        allCategories: 'అన్ని విభాగాలు',
        allLevels: 'అన్ని స్థాయిలు',
        central: 'కేంద్ర ప్రభుత్వం',
        state: 'రాష్ట్ర ప్రభుత్వం',
        allStates: 'అన్ని రాష్ట్రాలు',
        recommendedTitle: 'మీ పొలానికి సిఫార్సు చేయబడినవి',
        recommendedSubtitle: 'మీ ప్రొఫైల్ పంట మరియు స్థానానికి సరిపోలే పథకాలు',
        mayBeRelevant: 'మీ వ్యవసాయ ప్రొఫైల్‌కు సంబంధించి ఉండవచ్చు',
        viewDetails: 'వివరాలు చూడండి',
        checkEligibility: 'అర్హతను తనిఖీ చేయండి',
        officialWebsite: 'అధికారిక వెబ్‌సైట్ ↗',
        modalOverview: 'పథకం వివరణ',
        modalBenefits: 'ముఖ్య ప్రయోజనాలు',
        modalEligibility: 'అర్హత ప్రమాణాలు',
        modalDocuments: 'కావలసిన పత్రాలు',
        modalApplication: 'దరఖాస్తు విధానం',
        modalSource: 'అధికారిక మూలం',
        eligibilityTitle: 'స్వీయ అర్హత తనిఖీ',
        eligibilitySubtitle: 'అధికారిక నిబంధనల ప్రకారం మీరు ప్రాథమిక అర్హతను కలిగి ఉన్నారో లేదో చూడటానికి కొన్ని ప్రశ్నలకు సమాధానం ఇవ్వండి.',
        btnCheckNow: 'అర్హతను అంచనా వేయండి',
        btnProceedOfficial: 'అధికారిక పోర్టల్‌లో దరఖాస్తు చేసుకోండి',
        qLandowner: 'మీ పేరు మీద సాగు చేయగల వ్యవసాయ భూమి ఉందా?',
        qAadhaar: 'మొబైల్‌తో లింక్ చేయబడిన ఆధార్ కార్డు ఉందా?',
        qBank: 'ఆధార్ లింక్ చేయబడిన బ్యాంక్ ఖాతా ఉందా?',
        qTax: 'మీరు ఆదాయపు పన్ను చెల్లింపుదారులా లేదా ప్రభుత్వ ఉద్యోగా?',
        qWater: 'మీకు హామీ ఉన్న నీటి వనరు (బావి / బోర్ / కాలువ / చెరువు) ఉందా?',
        yes: 'అవును',
        no: 'కాదు',
        matchedHeader: 'సరిపోలిన ప్రమాణాలు',
        unmatchedHeader: 'ధృవీకరించవలసిన నిబంధనలు',
        noSchemesFound: 'పథకాలు ఏవీ కనుగొనబడలేదు. ఇతర పదాలతో శోధించండి.',
        offlineTitle: 'ఆఫ్‌లైన్ మోడ్',
        offlineBody: 'సేవ్ చేసిన పథకాల సమాచారం చూపబడుతోంది.',
        sourceLabel: 'మూలం: భారత ప్రభుత్వం — myScheme.gov.in / వ్యవసాయ మంత్రిత్వ శాఖ',
        sourceDisclaimer: 'వివరాలు అధికారిక ప్రభుత్వ సమాచారంపై ఆధారపడి ఉన్నాయి. దరఖాస్తుకు ముందు సరిచూసుకోండి.'
      },
      history: { eyebrow: 'మీ రికార్డులు', title: 'స్కాన్ చరిత్ర', subtitle: 'మీ ఇటీవలి పంట విశ్లేషణలను సమీక్షించండి.', sync: 'రికార్డులను సింక్ చేయండి', search: 'పంట లేదా వ్యాధిని శోధించండి', emptyTitle: 'ఇంకా చరిత్ర లేదు', emptyBody: 'మీరు భద్రపరిచిన విశ్లేషణలు ఇక్కడ కనిపిస్తాయి.', analysisRecord: 'విశ్లేషణ రికార్డు', severity: '{{value}} తీవ్రత', detail: 'నిర్ధారణ వివరాలు', date: 'తేదీ', status: 'స్థితి', symptoms: 'లక్షణాలు', treatment: 'చికిత్స', syncAlready: 'అన్ని రికార్డులు ఇప్పటికే సింక్ అయ్యాయి.', syncStart: 'సింక్ అవుతోంది...', syncSuccess: 'సింక్ పూర్తయింది.', syncFailed: 'సింక్ విఫలమైంది.' },
      profile: { eyebrow: 'ఖాతా', title: 'ప్రొఫైల్ సెట్టింగ్‌లు', subtitle: 'మీ వివరాలను ఎప్పటికప్పుడు అప్‌డేట్ చేసుకోండి.', fullName: 'పూర్తి పేరు', phone: 'మొబైల్ నంబర్', crop: 'ప్రధాన పంట', location: 'గ్రామం / జిల్లా', save: 'ప్రొఫైల్ సేవ్ చేయి', statusEyebrow: 'కార్యస్థలం స్థితి', network: 'నెట్‌వర్క్', bridge: 'ఆఫ్‌లైన్ మోడల్ బ్రిడ్జ్', accountSync: 'ఖాతా సింక్', signOut: 'సైన్ అవుట్', signedIn: '{{email}} గా సైన్ ఇన్ అయ్యారు.', signInToSync: 'సింక్ చేయడానికి సైన్ ఇన్ చేయండి.', connected: 'కనెక్ట్ అయింది', localMode: 'ఆఫ్‌లైన్ (స్థానిక మోడ్)', bridgeAvailable: 'అందుబాటులో ఉంది (Android)', bridgeUnavailable: 'అందుబాటులో లేదు (బ్రౌజర్)', saved: 'ప్రొఫైల్ అప్‌డేట్ చేయబడింది.' },
      shops: { eyebrow: 'స్థానిక సహాయం', title: 'సమీప వ్యవసాయ దుకాణాలు', subtitle: 'సమీపంలోని డీలర్లను కనుగొనండి.', store: 'వ్యవసాయ దుకాణం', pesticides: 'పురుగుమందులు', fertilizer: 'ఎరువులు', seeds: 'విత్తనాలు', detect: 'నా స్థానాన్ని గుర్తించు', detecting: 'GPS శోధిస్తోంది...', found: 'స్థానం కనుగొనబడింది ({{lat}}, {{lon}})', manual: 'సాధారణ శోధన', unavailable: 'స్థానం అందుబాటులో లేదు', search: 'శోధన: “{{category}}” {{near}}', near: 'సమీపంలో', open: 'Google Maps తెరవండి', noteTitle: 'స్థాన ఆధారిత శోధన', noteBody: 'మ్యాప్‌ను కేంద్రీకరించడానికి స్థానం ఉపయోగపడుతుంది.' },
      language: { eyebrow: 'ప్రాధాన్యతలు', title: 'భాష', subtitle: 'మీకు అనుకూలమైన భాషను ఎంచుకోండి.', default: 'డిఫాల్ట్ భాష', hindi: 'హిందీ', marathi: 'మరాఠీ', tamil: 'తమిళం', telugu: 'తెలుగు', changed: 'భాష {{language}} కి మార్చబడింది.' },
      validation: { invalidEmail: 'సరైన ఈమెయిల్‌ను నమోదు చేయండి.', weakPassword: 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.', missingEmail: 'ఈమెయిల్ నమోదు చేయండి.', nameRequired: 'దయచేసి పూర్తి పేరు నమోదు చేయండి.', wrongPassword: 'ఈమెయిల్ లేదా పాస్‌వర్డ్ తప్పు.', emailInUse: 'ఈమెయిల్ ఇప్పటికే నమోదు చేయబడింది.', popupClosed: 'పూర్తికాకముందే సైన్ ఇన్ పాప్అప్ మూసివేయబడింది. దయచేసి మళ్లీ ప్రయత్నించండి.', popupCancelled: 'సైన్ ఇన్ అభ్యర్థన రద్దు చేయబడింది.', popupBlocked: 'బ్రౌజర్ పాప్అప్‌ను నిరోధించింది. దయచేసి పాప్అప్‌లను అనుమతించండి.', accountExistsDifferentCredential: 'ఈ ఈమెయిల్‌తో ఇప్పటికే వేరొక పద్ధతిలో ఖాతా ఉంది.', unauthorizedDomain: 'ఈ డొమైన్ ప్రామాణీకరించబడలేదు.', googleProviderNotFound: 'Google సైన్ ఇన్ తాత్కాలికంగా అందుబాటులో లేదు.', network: 'కనెక్ట్ కాలేకపోయాము.', default: 'ఏదో తప్పు జరిగింది.', resetUnavailable: 'ఈమెయిల్ పంపలేకపోయాము.' },
      authStatus: { loginSuccess: 'సైన్ ఇన్ విజయవంతమైంది.', registerSuccess: 'ఖాతా సృష్టించబడింది.', logoutSuccess: 'సైన్ అవుట్ విజయవంతమైంది.', tooMany: 'చాలా ప్రయత్నాలు జరిగాయి. వేచి ఉండండి.', disabled: 'ఖాతా నిలిపివేయబడింది.', notAllowed: 'ఈమెయిల్ లాగిన్ ప్రారంభించబడలేదు.' },
      common: { back: 'వెనుకకు', retry: 'మళ్లీ ప్రయత్నించు', cancel: 'రద్దు', remove: 'తొలగించు', change: 'మార్చు', loading: 'లోడ్ అవుతోంది...', online: 'ఆన్‌లైన్', offline: 'ఆఫ్‌లైన్' }
    }
  },

  init() {
    const saved = localStorage.getItem(this.storageKey) || localStorage.getItem('app_language');
    if (saved && this.supportedLanguages[saved]) {
      this.currentLang = saved;
      localStorage.setItem(this.storageKey, saved);
    }
    this.setupHeaderDropdown();
    this.setupEventListeners();
    this.updateLanguageCards();
    this.updateDOM();
  },

  setupHeaderDropdown() {
    const btn = document.getElementById('lang-dropdown-btn');
    const wrapper = document.getElementById('header-lang-dropdown');
    const menu = document.getElementById('lang-dropdown-menu');
    if (!btn || !wrapper || !menu) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.contains('open');
      if (isOpen) {
        this.closeDropdown();
      } else {
        wrapper.classList.add('open');
        menu.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeDropdown();
    });
  },

  closeDropdown() {
    const wrapper = document.getElementById('header-lang-dropdown');
    const menu = document.getElementById('lang-dropdown-menu');
    const btn = document.getElementById('lang-dropdown-btn');
    if (wrapper) wrapper.classList.remove('open');
    if (menu) menu.classList.add('hidden');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  },

  setupEventListeners() {
    if (this._listenersAttached) return;
    this._listenersAttached = true;

    document.addEventListener('click', (event) => {
      const targetLangEl = event.target.closest('[data-lang]');
      if (!targetLangEl) {
        // Close header dropdown when clicking outside
        this.closeDropdown();
        return;
      }

      if (targetLangEl.tagName === 'OPTION') return;

      const langCode = targetLangEl.dataset.lang;
      if (!langCode || !this.supportedLanguages[langCode]) return;

      this.setLanguage(langCode);
      this.closeDropdown();
    });
  },

  setLanguage(langCode) {
    if (!this.supportedLanguages[langCode]) return;
    this.currentLang = langCode;
    localStorage.setItem(this.storageKey, langCode);
    this.updateLanguageCards();
    this.updateDOM();

    // Broadcast global language change custom events
    const detail = { language: langCode };
    window.dispatchEvent(new CustomEvent('smartag:languagechange', { detail }));
    document.dispatchEvent(new CustomEvent('languagechange', { detail }));

    // Notify active modules directly
    if (window.DiagnosisModule && typeof window.DiagnosisModule.onLanguageChange === 'function') {
      window.DiagnosisModule.onLanguageChange(langCode);
    }
    if (window.HistoryModule && typeof window.HistoryModule.onLanguageChange === 'function') {
      window.HistoryModule.onLanguageChange(langCode);
    }
  },

  t(path, params = {}, fallbackText = '') {
    let fallback = fallbackText;
    let actualParams = params;
    if (typeof params === 'string') {
      fallback = params;
      actualParams = {};
    }
    const lang = this.translations[this.currentLang] || this.translations.en;
    const defaultDict = this.translations.en;
    const getVal = (obj, p) => p.split('.').reduce((prev, curr) => prev && prev[curr], obj);
    let text = getVal(lang, path);
    if (text === undefined) text = getVal(defaultDict, path);
    if (text === undefined) return fallback || path;
    if (actualParams && typeof actualParams === 'object') {
      Object.keys(actualParams).forEach(key => {
        text = text.replace(new RegExp(`{{${key}}}`, 'g'), actualParams[key]);
      });
    }
    return text;
  },

  updateLanguageCards() {
    // Update all data-lang elements (Language page cards & header dropdown items)
    document.querySelectorAll('[data-lang]').forEach(el => {
      if (el.tagName === 'OPTION') return;
      el.classList.toggle('selected', el.dataset.lang === this.currentLang);
    });

    const activeText = document.getElementById('active-lang-text');
    if (activeText) activeText.textContent = this.currentLang.toUpperCase();

    const selectEl = document.getElementById('auth-language-select');
    if (selectEl) selectEl.value = this.currentLang;
  },

  updateDOM() {
    document.documentElement.lang = this.currentLang;

    // Standard data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = this.t(key);
    });

    // Specific navigation & headers (target only text label spans)
    const navMapping = {
      '.sidebar-nav button[data-target="view-home"]': 'nav.dashboard',
      '.sidebar-nav button[data-target="view-weather"]': 'nav.weather',
      '.sidebar-nav button[data-target="view-market"]': 'nav.market',
      '.sidebar-nav button[data-target="view-schemes"]': 'nav.schemes',
      '.sidebar-nav button[data-target="view-history"]': 'nav.history',
      '.sidebar-bottom button[data-target="view-language"]': 'nav.language',
      '.sidebar-bottom button[data-target="view-profile"]': 'nav.profile'
    };
    Object.entries(navMapping).forEach(([selector, key]) => {
      document.querySelectorAll(selector).forEach(el => {
        const span = el.querySelector('.nav-label');
        if (span) {
          span.textContent = this.t(key);
        }
      });
    });

    // Placeholders
    const placeholders = {
      '#auth-name': 'auth.fullName',
      '#auth-email': 'auth.email',
      '#auth-password': 'auth.password',
      '#auth-confirm-password': 'auth.confirmPassword',
      '#history-search-input': 'history.search',
      '#weather-location-search': 'weather.searchPlaceholder',
      '#market-search-input': 'market.selectCrop',
      '#schemes-search-input': 'schemes.searchPlaceholder',
      '#profile-name': 'profile.fullName',
      '#profile-phone': 'profile.phone',
      '#profile-crop': 'profile.crop',
      '#profile-location': 'profile.location'
    };
    Object.entries(placeholders).forEach(([selector, key]) => {
      const el = document.querySelector(selector);
      if (el) el.placeholder = this.t(key);
    });

    // Weather, Market, Schemes, Profile updates
    if (window.ProfileModule && typeof window.ProfileModule.refreshAuthCopy === 'function') {
      window.ProfileModule.refreshAuthCopy();
    }
    if (window.WeatherModule && typeof window.WeatherModule.refreshStatusCopy === 'function') {
      window.WeatherModule.refreshStatusCopy();
    }
    if (window.MarketModule && typeof window.MarketModule.refreshTranslations === 'function') {
      window.MarketModule.refreshTranslations();
    }
    if (window.SchemesModule && typeof window.SchemesModule.refreshTranslations === 'function') {
      window.SchemesModule.refreshTranslations();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => LanguageModule.init());
window.i18n = LanguageModule;
window.LanguageModule = LanguageModule;
