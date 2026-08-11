# Smart Agriculture Copilot — Technical Requirements Document (TRD)

**Version:** 1.0  
**Project:** Smart Agriculture Copilot  
**Platforms:** Responsive Web Application + Android Hybrid Application  
**Architecture:** Hybrid Online/Offline AI  
**Frontend:** HTML5, CSS3, JavaScript  
**Backend:** Python + FastAPI  
**Cloud:** Firebase Authentication, Cloud Firestore, Firebase Storage  
**Online AI:** Google Gemini Vision API  
**Offline AI:** TensorFlow + EfficientNetB0 + TensorFlow Lite  
**Weather:** OpenWeatherMap API  
**Multilingual:** Bhashini API  
**Maps:** Google Maps  
**Local Android DB:** Room / SQLite  

---

## 1. Technical Architecture

```text
                         SMART AGRICULTURE COPILOT
                                  │
                                  ▼
                       RESPONSIVE WEB APPLICATION
                          HTML + CSS + JavaScript
                                  │
                                  ▼
                       ANDROID HYBRID APPLICATION
                               WebView
                                  │
                                  ▼
                         CONNECTIVITY CHECK
                            /             \
                           /               \
                         YES               NO
                          │                 │
                          ▼                 ▼
                    ONLINE MODE       OFFLINE MODE
                          │                 │
                       FastAPI            TFLite
                          │                 │
             ┌────────────┼─────────┐       ▼
             │            │         │    labels.txt
          Gemini       Weather   Firebase    │
             │            │         │         ▼
          Bhashini      Maps      Storage  Local Knowledge
             │            │         │       Database
             └────────────┴─────────┘         │
                                              ▼
                                             Room
                                              │
                                              ▼
                                      Auto Synchronization
                                              │
                                              ▼
                                       Farmer Dashboard
```

---

# 2. Frontend Technical Requirements

## 2.1 Technologies

- HTML5
- CSS3
- JavaScript
- DOM manipulation
- Fetch API
- Responsive Web Design

## 2.2 Frontend Responsibilities

The frontend shall:

- Display the dashboard.
- Accept crop images.
- Preview selected images.
- Send requests to FastAPI.
- Display diagnosis results.
- Display weather.
- Display irrigation guidance.
- Display scan history.
- Provide language selection.
- Launch Google Maps searches.
- Show online/offline status.
- Display loading and error states.

## 2.3 Suggested Frontend Structure

```text
frontend/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── diagnosis.js
│   ├── weather.js
│   ├── history.js
│   ├── language.js
│   └── maps.js
└── assets/
```

---

# 3. Backend Technical Requirements

## 3.1 FastAPI

FastAPI is the main backend framework.

Responsibilities:

- Receive frontend requests.
- Validate uploaded images.
- Communicate with Gemini.
- Communicate with OpenWeatherMap.
- Communicate with Bhashini.
- Communicate with Firebase.
- Return structured JSON.
- Handle errors.

## 3.2 Backend Structure

```text
backend/
├── main.py
├── routes/
│   ├── diagnosis.py
│   ├── weather.py
│   ├── history.py
│   ├── translation.py
│   └── sync.py
├── services/
│   ├── gemini_service.py
│   ├── weather_service.py
│   ├── firebase_service.py
│   └── bhashini_service.py
├── models/
│   └── schemas.py
├── config/
│   └── settings.py
└── requirements.txt
```

---

# 4. Online AI Architecture

## 4.1 Gemini Vision

Flow:

```text
Leaf Image
    ↓
Frontend
    ↓
POST /api/diagnose
    ↓
FastAPI
    ↓
Gemini Vision API
    ↓
Structured JSON
    ↓
Frontend
```

## 4.2 Expected Diagnosis

```json
{
  "crop": "Tomato",
  "disease": "Early Blight",
  "confidence": 0.94,
  "symptoms": [],
  "cause": "",
  "treatment": "",
  "pesticides": [],
  "fertilizer": "",
  "prevention": []
}
```

The exact response schema should be validated by the backend before being displayed.

---

# 5. Offline AI Architecture

The Android application contains:

```text
app/src/main/assets/
├── crop_disease_model.tflite
├── labels.txt
└── crop_disease_database.json
```

## 5.1 TFLite Responsibilities

The TFLite model performs image classification.

It returns a class index/probability distribution.

It does not need to contain treatment or pesticide text.

## 5.2 Label Mapping

```text
TFLite Class Index
        ↓
labels.txt
        ↓
Disease Name
```

The ordering of `labels.txt` must exactly match the model's output classes.

## 5.3 Local Knowledge Lookup

```text
Disease Name
      ↓
crop_disease_database.json
      ↓
Symptoms
Treatment
Pesticide Information
Fertilizer Guidance
Prevention
```

---

# 6. Current Offline Model

The current model has 38 PlantVillage classes as represented by the project's `labels.txt`.

The model currently covers classes from:

- Apple
- Blueberry
- Cherry
- Corn/Maize
- Grape
- Orange
- Peach
- Bell Pepper
- Potato
- Raspberry
- Soybean
- Squash
- Strawberry
- Tomato

The exact class names and ordering must be taken directly from the project's `labels.txt` and must not be changed without retraining/re-exporting the model.

---

# 7. Offline Knowledge Database

Recommended file:

```text
crop_disease_database.json
```

Example:

```json
{
  "Tomato___Early_blight": {
    "crop": "Tomato",
    "disease": "Early Blight",
    "symptoms": [],
    "cause": "",
    "treatment": "",
    "recommended_pesticides": [],
    "fertilizer": "",
    "prevention": [],
    "organic_control": "",
    "severity": ""
  }
}
```

The knowledge database should contain only information relevant to the model's supported classes.

Pesticide and fertilizer information must be reviewed against authoritative agricultural sources before production release.

---

# 8. Firebase Technical Architecture

## 8.1 Authentication

Firebase Authentication provides:

- Registration
- Login
- Logout
- User identity

## 8.2 Firestore

Cloud Firestore stores:

- User profile
- Scan metadata
- Scan history
- Synchronization status

## 8.3 Firebase Storage

Stores:

- Leaf images
- Scan images

Recommended structure:

```text
users/
  {userId}/
    scans/
      {scanId}/
        leaf.jpg
```

---

# 9. Weather Architecture

```text
GPS
 ↓
OpenWeatherMap API
 ↓
Weather Data
 ↓
Irrigation Logic
 ↓
Frontend
```

Data may include:

- Temperature
- Humidity
- Current conditions
- Rain/forecast information
- Timestamp
- Coordinates

The application must identify stale or unavailable weather information.

---

# 10. Multilingual Architecture

```text
User Text
    ↓
Frontend
    ↓
FastAPI
    ↓
Bhashini
    ↓
Translated Text
    ↓
Frontend
```

Initial target languages:

- English
- Hindi
- Marathi

Voice support is a future/optional extension unless implemented within the MVP schedule.

---

# 11. Maps Architecture

The MVP does not build a custom mapping engine.

```text
GPS Location
     ↓
Find Agriculture Shop
     ↓
Google Maps Search
```

The web application can construct a location-aware Google Maps search link.

---

# 12. Android Hybrid Architecture

The Android application loads the responsive web application through WebView.

```text
Android
  ↓
WebView
  ↓
Hosted Web Application
```

Native Android components provide:

- TFLite inference
- Connectivity detection
- Room database
- Local image storage
- Synchronization
- Device permissions

---

# 13. Connectivity Decision

```text
                 Internet?
                    │
             ┌──────┴──────┐
            YES            NO
             │              │
             ▼              ▼
         Online Mode    Offline Mode
             │              │
           FastAPI        TFLite
           Gemini         Local DB
           Weather        Room
           Firebase       Local Storage
           Bhashini
           Maps
```

The application should switch automatically rather than requiring the farmer to manually choose a mode.

---

# 14. Local Storage

## Room Database

Used for:

- Offline scan records
- Sync queue
- Metadata

## Internal App Storage

Used for:

- Offline leaf images
- Temporary files

The application should use app-private storage for sensitive local information.

---

# 15. Synchronization

## Offline

```text
Scan
 ↓
TFLite
 ↓
Local Recommendation
 ↓
Room
 ↓
PENDING
```

## Online Again

```text
Internet Restored
 ↓
Sync Manager
 ↓
Read PENDING Records
 ↓
Upload Image
 ↓
Upload Metadata
 ↓
Firebase
 ↓
SYNCED
```

Failed uploads remain queued and are retried.

---

# 16. API Specification

## POST /api/diagnose

### Request

Multipart image upload.

### Response

```json
{
  "crop": "",
  "disease": "",
  "confidence": 0,
  "symptoms": [],
  "treatment": "",
  "pesticides": [],
  "fertilizer": "",
  "prevention": []
}
```

## GET /api/weather

Parameters:

```text
latitude
longitude
```

Returns weather information.

## GET /api/history

Returns authenticated user's scan records.

## POST /api/history

Stores a scan record.

## POST /api/translate

Translates text.

## POST /api/sync

Processes pending records.

---

# 17. Security

- Firebase Authentication protects user accounts.
- Firestore Security Rules restrict user data.
- Firebase Storage Rules restrict image access.
- External API keys should not be unnecessarily exposed in frontend JavaScript.
- Backend secrets should be stored in environment/configuration variables.
- Uploaded files must be validated.
- Application-private storage should be used for sensitive offline data.
- Pesticide recommendations must be reviewed before release.

---

# 18. Error Handling

The application shall handle:

- No internet
- API timeout
- API failure
- Invalid image
- Camera permission denial
- GPS permission denial
- Firebase failure
- Failed synchronization
- Unsupported offline class
- TFLite inference errors

Example offline message:

> Offline mode is active. Disease diagnosis is available for supported classes.

Example unsupported message:

> This crop/disease is not available in Offline Mode. Connect to the internet for online analysis.

---

# 19. Performance Requirements

- Responsive UI.
- Clear loading states.
- Reasonable image size before API upload.
- Efficient TFLite inference.
- Avoid loading unnecessary large datasets.
- Compact offline knowledge database.
- Retry transient synchronization failures.
- Do not block the UI during long operations.

---

# 20. Technical Acceptance Criteria

- [ ] Responsive web application works on mobile and desktop browsers.
- [ ] FastAPI receives image uploads.
- [ ] Gemini diagnosis works online.
- [ ] Firebase authentication works.
- [ ] Firestore scan history works.
- [ ] Firebase Storage image upload works.
- [ ] Weather API works.
- [ ] Maps search works.
- [ ] Bhashini integration works for selected languages.
- [ ] Android WebView loads the web application.
- [ ] TFLite model runs on Android.
- [ ] `labels.txt` mapping works.
- [ ] Local knowledge database lookup works.
- [ ] Room stores offline scans.
- [ ] Offline images are stored locally.
- [ ] Pending records synchronize after reconnecting.
