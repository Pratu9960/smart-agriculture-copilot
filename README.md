🌱 HaritKranti --- Smart Agriculture Copilot
Smart farming assistance that works online when connected and automatically switches to on-device AI when internet connectivity is unavailable.
HaritKranti (Smart Agriculture Copilot) is an AI-powered agriculture assistance platform designed to help farmers with crop disease diagnosis, treatment guidance, weather-based irrigation advice, multilingual support, scan history, and nearby agricultural store discovery.
The project follows a hybrid online/offline AI architecture. The responsive web application is the primary product, with an Android Hybrid/WebView application for mobile deployment. When internet connectivity is available, the system uses cloud services such as Gemini Vision, Firebase, OpenWeatherMap, Bhashini, and Google Maps. When connectivity is unavailable on Android, the application automatically switches to an on-device TensorFlow Lite model with locally stored disease information and saves offline history for later synchronization.
🚜 Problem
Farmers may face difficulty identifying crop diseases early, accessing experts, choosing treatments, planning irrigation around weather, using digital services in regional languages, and finding nearby agricultural suppliers. Poor or unreliable rural connectivity can also make cloud-only solutions unavailable when needed.
💡 Solution
HaritKranti combines:
AI crop disease diagnosis
Automatic online/offline switching
Treatment, pesticide, fertilizer and prevention guidance
Weather-based irrigation recommendations
Multilingual support
Cloud scan history
Nearby agriculture shop finder
Hybrid Web + Android deployment
⭐ Key Features
🌿 AI Crop Disease Diagnosis
Farmers can upload or capture a crop leaf image.
Online flow:
Crop Image → FastAPI → Gemini Vision → Disease + Treatment Information
The diagnosis can include crop, disease, confidence when available, symptoms, causes, treatment, pesticide/fungicide/insecticide recommendations, prevention and safety guidance.
📶 Automatic Offline Mode
Offline mode activates when connectivity is unavailable.
Crop Image
                   ↓
          Connectivity Check
             /           \
          ONLINE        OFFLINE
            ↓              ↓
      Cloud Services    TFLite Model
            ↓              ↓
       Diagnosis       Local Database
             \            /
              \          /
               ↓        ↓
             Result
When connectivity returns, locally stored data can be synchronized with Firebase.
🤖 On-Device AI
Offline Android inference uses:
TensorFlow
EfficientNetB0
TensorFlow Lite
PlantVillage-trained model
labels.txt
Local disease database
Image → TFLite → Class Index → labels.txt → Disease
      → Local Disease Database → Treatment / Prevention
🌦 Weather & Irrigation
OpenWeatherMap provides current temperature, humidity, weather conditions and rain forecast. The application can generate practical irrigation guidance based on these conditions.
📍 Agriculture Shop Finder
Device/browser geolocation can be used to open Google Maps searches for agriculture stores, pesticide shops, fertilizer dealers and seed suppliers.
🗣 Multilingual Support
Bhashini is used for regional-language support, targeting English, Hindi, Marathi and additional Indian languages.
☁️ Cloud Scan History
Firebase supports authentication, cloud storage and synchronization of scan history, including user information, date/time, crop, disease, image reference, treatment recommendations and weather summary.
🏗️ System Architecture
HARITKRANTI
                         ↓
          Responsive Web Application
             HTML + CSS + JavaScript
                         ↓
              Android Hybrid / WebView
                         ↓
                Connectivity Check
                   /           \
                 YES            NO
                  ↓              ↓
             ONLINE MODE    OFFLINE MODE
                  ↓              ↓
        Gemini / Weather /   TensorFlow Lite
        Firebase / Maps /    labels.txt +
        Bhashini             Local Database
                  \              /
                   \            /
                    ↓          ↓
                 Diagnosis & Guidance
                         ↓
              Treatment / Weather /
              History / Nearby Store
                         ↓
                    Firebase Sync
🛠️ Technology Stack
Layer          Technology
Frontend       HTML5, CSS3, JavaScript Backend        Python, FastAPI Cloud          Firebase Authentication, Firestore, Storage Online AI      Google Gemini Vision API Offline AI     TensorFlow, EfficientNetB0, TensorFlow Lite Dataset        PlantVillage Dataset Weather        OpenWeatherMap API Multilingual   Bhashini API Maps           Google Maps Android        Hybrid WebView Application Local DB       Room / SQLite
📁 Repository Structure
smart-agriculture-copilot/
├── docs/
│   ├── PRD.md
│   ├── TRD.md
│   ├── APP_FLOW.md
│   ├── BACKEND_SCHEMA.md
│   ├── IMPLEMENTATION_PLAN.md
│   └── AI_RULES.md
├── frontend/
├── backend/
├── android/
├── ml/
│   ├── crop_disease_model.tflite
│   ├── labels.txt
│   └── crop_disease_database.json
├── README.md
└── .gitignore
🔄 Main Workflow
Open App
 ↓
Upload / Capture Crop Image
 ↓
Check Internet
 ↓
Online → Gemini / Weather / Firebase / Maps
   OR
Offline → TFLite / Local Disease Database
 ↓
Disease + Treatment + Prevention
 ↓
Weather / Irrigation Guidance
 ↓
Save History
 ↓
Internet Restored → Sync with Firebase
🧠 AI Model Pipeline
PlantVillage Dataset
        ↓
Image Augmentation
        ↓
EfficientNetB0
        ↓
Transfer Learning
        ↓
Fine-Tuning
        ↓
TensorFlow Lite Conversion
        ↓
Android On-Device Inference
🌐 Online vs Offline
Capability                     Online         Offline
Crop disease detection           ✅             ✅ Gemini Vision                    ✅             ❌ TFLite AI                 Available locally     ✅ Local disease database           ✅             ✅ Live weather                     ✅             ❌ Firebase sync                    ✅           Queued Google Maps search               ✅             ❌ Offline scan history           Android          ✅
Offline mode is a fallback activated when internet connectivity is unavailable.
🔐 Security
Keep API keys in environment variables or secure configuration.
Never commit .env files or credentials.
Protect Firebase data with authentication and security rules.
Store large images in Firebase Storage rather than Firestore.
Restrict user scan history to the authenticated user.
🚀 Development Roadmap
Frontend
 ↓
FastAPI Backend
 ↓
Gemini
 ↓
Firebase
 ↓
Weather + Maps
 ↓
Android WebView
 ↓
TFLite Offline AI
 ↓
Room / SQLite
 ↓
Offline History + Sync
 ↓
Testing + Presentation
🧪 Testing
Test the following:
Responsive frontend
Image upload and validation
FastAPI requests
Gemini/API failures
Weather failures
Authentication and scan history
Internet ON/OFF transitions
TFLite inference
Camera/gallery permissions
Room storage
Firebase synchronization
🎬 Demo Flow
Open HaritKranti.
Login.
Capture/upload a crop image.
Show online AI diagnosis.
Display disease, treatment, pesticide/fertilizer and prevention information.
Show weather and irrigation guidance.
Open nearby agriculture stores.
Disable internet.
Scan a supported crop.
Demonstrate TFLite offline diagnosis.
Save the offline scan.
Restore internet.
Demonstrate Firebase synchronization.
📌 Project Status
Development Stage: MVP / Active Development
[x] Architecture defined
[x] Responsive web-first approach
[x] FastAPI architecture
[x] Online AI architecture
[x] Offline TFLite model pipeline
[x] Firebase architecture
[x] Weather integration design
[x] Maps integration design
[x] Multilingual integration design
[ ] Complete end-to-end integration
[ ] Android hybrid deployment
[ ] Offline synchronization
[ ] Full system testing
📄 Documentation
The /docs directory is the project source of truth:
PRD.md --- Product requirements
TRD.md --- Technical requirements and architecture
APP_FLOW.md --- Application/user flow
BACKEND_SCHEMA.md --- Backend/database structure
IMPLEMENTATION_PLAN.md --- Development roadmap
AI_RULES.md --- AI-assisted development rules
🌱 Vision
HaritKranti aims to make intelligent agricultural assistance accessible to farmers regardless of network availability --- combining cloud intelligence when connected with on-device AI when disconnected.
Smart Farming. Reliable Assistance. Anywhere, Anytime.