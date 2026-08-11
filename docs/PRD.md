# Smart Agriculture Copilot --- Product Requirements Document (PRD)

**Version:** 1.0\
**Project:** Smart Agriculture Copilot\
**Type:** 30-day hackathon MVP\
**Platforms:** Responsive Web Application + Android Hybrid Application\
**Target:** Indian farmers, especially rural and semi-rural users\
**Architecture:** Hybrid Online/Offline AI\
**Development Strategy:** Web-first, Android hybrid deployment

------------------------------------------------------------------------

## 1. Executive Summary

Smart Agriculture Copilot is an AI-powered agriculture assistance
platform designed to help Indian farmers identify crop diseases,
understand treatment options, receive weather-based irrigation guidance,
communicate in regional languages, maintain scan history, and find
nearby agricultural supply stores.

The application is developed first as a responsive web application using
HTML5, CSS3, JavaScript, Python/FastAPI and Firebase. It is subsequently
packaged as an Android Hybrid Application using a WebView-based approach
with native Android capabilities for offline AI, local storage, device
connectivity and synchronization.

The key innovation is the hybrid online/offline architecture.

When internet connectivity is available, the platform can use Google
Gemini Vision, OpenWeatherMap, Firebase, Bhashini and Google Maps.

When internet connectivity is unavailable, the Android application can
perform crop disease classification locally using a TensorFlow Lite
model. The predicted disease is mapped through `labels.txt` and a
compact local `crop_disease_database.json` provides treatment,
pesticide, fertilizer and prevention information.

Offline scan records are stored locally using Room Database and
synchronized with Firebase when connectivity returns.

------------------------------------------------------------------------

# 2. Product Vision

> Provide farmers with a simple digital farming assistant that continues
> to provide useful crop-health assistance even when internet
> connectivity is unreliable.

The product should help answer:

-   What disease is affecting my crop?
-   What symptoms are associated with it?
-   What treatment information is available?
-   What pesticide information is available?
-   What fertilizer guidance is available?
-   How can I prevent the problem?
-   Should I irrigate based on the current weather?
-   Where is a nearby agriculture shop?
-   Can I diagnose my crop without internet?

------------------------------------------------------------------------

# 3. Problem Statement

Farmers may face difficulty identifying crop diseases, selecting
appropriate treatment information, planning irrigation around weather
conditions, accessing agricultural information in a preferred language,
maintaining previous diagnosis records, and locating nearby agricultural
supply stores.

Internet-dependent agriculture applications can become less useful in
remote areas where connectivity is unreliable.

Smart Agriculture Copilot addresses this by combining cloud services
with an on-device offline disease-diagnosis workflow.

------------------------------------------------------------------------

# 4. Target Users

## Primary User --- Farmer

The primary user may:

-   Use a smartphone.
-   Have limited technical knowledge.
-   Experience intermittent connectivity.
-   Prefer simple language and visual information.
-   Prefer a regional Indian language.
-   Need fast field-level assistance.

## Secondary Users

-   Agriculture students
-   Agricultural advisors
-   Farmer organizations
-   Hackathon evaluators and demonstrators

------------------------------------------------------------------------

# 5. Product Goals

## Primary Goals

1.  Provide crop disease diagnosis from leaf images.
2.  Provide treatment and prevention information.
3.  Provide pesticide and fertilizer information for supported diseases.
4.  Provide online weather information.
5.  Provide basic weather-based irrigation guidance.
6.  Support multilingual interaction.
7.  Store scan history.
8.  Locate nearby agriculture shops.
9.  Provide offline disease diagnosis on Android.
10. Automatically synchronize offline records when internet returns.

## Secondary Goals

-   Keep the interface simple.
-   Minimize steps required for diagnosis.
-   Keep the Android application practical in size.
-   Separate AI classification from agricultural knowledge.
-   Make the system modular and easy for a beginner team to maintain.

------------------------------------------------------------------------

# 6. MVP Scope

The MVP includes:

1.  Firebase Authentication
2.  Home dashboard
3.  Crop image upload/capture
4.  Online Gemini disease diagnosis
5.  Offline TensorFlow Lite diagnosis on Android
6.  Offline agricultural knowledge database
7.  Treatment information
8.  Pesticide information
9.  Fertilizer guidance
10. Prevention information
11. Weather information
12. Irrigation guidance
13. Multilingual support
14. Scan history
15. GPS location
16. Google Maps agriculture-shop search
17. Firebase synchronization
18. Android hybrid deployment

------------------------------------------------------------------------

# 7. Out of Scope for MVP

The following are future enhancements rather than core 30-day
requirements:

-   Full agricultural marketplace
-   Live expert consultation
-   Satellite crop monitoring
-   IoT soil sensors
-   Automatic irrigation hardware control
-   Complete crop-yield prediction
-   Advanced GIS
-   Autonomous pesticide application
-   Complete coverage of all Indian crops
-   Full voice assistant if time is insufficient
-   Complex government-scheme recommendation engine

------------------------------------------------------------------------

# 8. Core Functional Requirements

## FR-001 --- Authentication

The application shall allow users to register, sign in and sign out
using Firebase Authentication.

## FR-002 --- Crop Image Input

The application shall allow users to select or capture a crop leaf
image.

## FR-003 --- Online Diagnosis

When online, the application shall send the image through FastAPI to
Gemini Vision and display a structured diagnosis.

## FR-004 --- Offline Diagnosis

When offline on Android, the application shall use the packaged
TensorFlow Lite model to classify supported disease classes.

## FR-005 --- Label Mapping

The TFLite output shall be mapped using the exact order in `labels.txt`.

## FR-006 --- Offline Recommendations

The predicted disease shall be used as a key to retrieve information
from `crop_disease_database.json`.

## FR-007 --- Weather

The application shall retrieve online weather information from
OpenWeatherMap.

## FR-008 --- Irrigation

The application shall convert available weather information into simple
irrigation guidance.

## FR-009 --- Multilingual Support

The application shall support selected regional languages through
Bhashini.

## FR-010 --- Scan History

The application shall save diagnosis records for authenticated users.

## FR-011 --- Offline History

The Android application shall save offline scan records locally.

## FR-012 --- Synchronization

Pending offline records shall be synchronized with Firebase when
connectivity returns.

## FR-013 --- GPS

The application shall request location permission where required.

## FR-014 --- Agriculture Shop Finder

The application shall provide a button that opens a Google Maps search
for nearby agricultural supply stores.

## FR-015 --- Hybrid Android

The responsive web application shall be loadable inside an Android
WebView-based application.

------------------------------------------------------------------------

# 9. Disease Diagnosis

## 9.1 Online Architecture

``` text
Leaf Image
    ↓
Web Frontend
    ↓
FastAPI
    ↓
Gemini Vision API
    ↓
Structured Diagnosis
    ↓
Frontend
```

Expected information may include:

-   Crop
-   Disease
-   Confidence, where available
-   Symptoms
-   Cause
-   Treatment
-   Pesticide information
-   Fertilizer guidance
-   Prevention

Gemini provides advanced, contextual online analysis.

## 9.2 Offline Architecture

``` text
Leaf Image
    ↓
Android
    ↓
Image Preprocessing
    ↓
TensorFlow Lite
    ↓
Class Index
    ↓
labels.txt
    ↓
Disease Name
    ↓
crop_disease_database.json
    ↓
Treatment / Pesticide / Fertilizer / Prevention
```

The TFLite model is responsible for image classification. The local
database is responsible for agricultural information.

------------------------------------------------------------------------

# 10. Current Offline Model Classes

The current uploaded `labels.txt` contains 38 classes:

-   Apple --- Apple scab
-   Apple --- Black rot
-   Apple --- Cedar apple rust
-   Apple --- Healthy
-   Blueberry --- Healthy
-   Cherry --- Powdery mildew
-   Cherry --- Healthy
-   Corn/Maize --- Cercospora leaf spot / Gray leaf spot
-   Corn/Maize --- Common rust
-   Corn/Maize --- Northern Leaf Blight
-   Corn/Maize --- Healthy
-   Grape --- Black rot
-   Grape --- Esca / Black Measles
-   Grape --- Leaf blight / Isariopsis Leaf Spot
-   Grape --- Healthy
-   Orange --- Huanglongbing / Citrus greening
-   Peach --- Bacterial spot
-   Peach --- Healthy
-   Bell Pepper --- Bacterial spot
-   Bell Pepper --- Healthy
-   Potato --- Early blight
-   Potato --- Late blight
-   Potato --- Healthy
-   Raspberry --- Healthy
-   Soybean --- Healthy
-   Squash --- Powdery mildew
-   Strawberry --- Leaf scorch
-   Strawberry --- Healthy
-   Tomato --- Bacterial spot
-   Tomato --- Early blight
-   Tomato --- Late blight
-   Tomato --- Leaf Mold
-   Tomato --- Septoria leaf spot
-   Tomato --- Spider mites / Two-spotted spider mite
-   Tomato --- Target Spot
-   Tomato --- Tomato Yellow Leaf Curl Virus
-   Tomato --- Tomato mosaic virus
-   Tomato --- Healthy

The exact model labels and ordering must remain synchronized with
`labels.txt`.

------------------------------------------------------------------------

# 11. Offline Knowledge Database

The Android application should contain:

``` text
app/src/main/assets/
├── crop_disease_model.tflite
├── labels.txt
└── crop_disease_database.json
```

Recommended record:

``` json
{
  "crop": "",
  "disease": "",
  "symptoms": [],
  "cause": "",
  "treatment": "",
  "recommended_pesticides": [],
  "fertilizer": "",
  "prevention": [],
  "organic_control": "",
  "severity": ""
}
```

The knowledge database is intentionally small compared with the ML
training dataset. It contains information for the classes the offline
model can recognize.

### Safety Requirement

Pesticide and fertilizer information must be reviewed using
authoritative agricultural sources before production release. Dosage
should not be invented or treated as universally applicable. Where exact
chemical usage is shown, the application should direct users to approved
product labels and applicable local agricultural guidance.

------------------------------------------------------------------------

# 12. Weather and Irrigation

## Online Flow

``` text
GPS
 ↓
OpenWeatherMap
 ↓
Temperature / Humidity / Rain / Forecast
 ↓
Irrigation Logic
 ↓
Farmer
```

## Offline Behavior

Live weather cannot be retrieved without internet.

The app may show the last synchronized weather data with its timestamp,
if implemented.

The application must not present stale weather information as current.

## Irrigation

The system provides decision support, not automatic irrigation control.

Examples:

-   Rain expected → consider delaying irrigation.
-   Hot/dry conditions → consider irrigation based on crop requirements.
-   Weather unavailable → explain that live irrigation guidance is
    unavailable.

------------------------------------------------------------------------

# 13. Multilingual Support

Bhashini is the planned multilingual service.

Initial languages:

-   English
-   Hindi
-   Marathi

Planned capabilities:

-   UI/content translation
-   Text translation
-   Regional language interaction

Future capabilities:

-   Speech-to-text
-   Text-to-speech
-   Voice assistant

Voice features are optional for the first MVP if time becomes limited.

------------------------------------------------------------------------

# 14. Scan History

A scan record may contain:

-   Scan ID
-   User ID
-   Date/time
-   Crop
-   Disease
-   Confidence
-   Image
-   Symptoms
-   Cause
-   Treatment
-   Pesticide information
-   Fertilizer guidance
-   Prevention
-   Weather summary
-   Location
-   Mode: online/offline
-   Synchronization status

Online records are stored in Firebase.

Offline records are first stored locally and later synchronized.

------------------------------------------------------------------------

# 15. Nearby Agriculture Shop Finder

The MVP does not require a custom map interface.

Flow:

``` text
User
 ↓
Location Permission
 ↓
GPS Coordinates
 ↓
Find Nearby Agriculture Shop
 ↓
Google Maps
```

Search categories may include:

-   Agriculture shop
-   Pesticide shop
-   Fertilizer dealer
-   Seed supplier

------------------------------------------------------------------------

# 16. Online/Offline Decision System

``` text
Internet Available?
       │
   ┌───┴───┐
  YES      NO
   │        │
Online    Offline
   │        │
   ▼        ▼
FastAPI   TFLite
Gemini    Local DB
Weather   Room
Firebase  Local Images
Bhashini
Maps
```

The user should not need to manually select a mode.

------------------------------------------------------------------------

# 17. Automatic Synchronization

## Offline

``` text
Scan
 ↓
TFLite
 ↓
Local Result
 ↓
Room Database
 ↓
syncStatus = PENDING
```

## Internet Restored

``` text
Connectivity Detected
 ↓
Sync Manager
 ↓
Read Pending Records
 ↓
Upload Images
 ↓
Upload Scan Metadata
 ↓
Firebase
 ↓
syncStatus = SYNCED
```

Failed synchronization should remain queued for retry.

------------------------------------------------------------------------

# 18. Platform Architecture

## Web Application

Technology:

-   HTML5
-   CSS3
-   JavaScript
-   Python
-   FastAPI
-   Firebase
-   Gemini
-   OpenWeatherMap
-   Bhashini
-   Google Maps

## Android Hybrid Application

The web application is loaded using WebView.

The native Android layer handles capabilities that are important for
offline operation:

-   Connectivity detection
-   TFLite inference
-   Room database
-   Local images
-   Synchronization
-   Device-level functionality

------------------------------------------------------------------------

# 19. Technology Stack

  Layer              Technology
  ------------------ --------------------------
  Web UI             HTML5
  Styling            CSS3
  Client Logic       JavaScript
  Backend            Python
  API Framework      FastAPI
  Authentication     Firebase Authentication
  Cloud Database     Cloud Firestore
  Cloud Files        Firebase Storage
  Online AI          Google Gemini Vision API
  Offline AI         TensorFlow Lite
  ML Framework       TensorFlow
  Model              EfficientNetB0
  Training Classes   PlantVillage
  Weather            OpenWeatherMap
  Translation        Bhashini
  Maps               Google Maps
  Android            Android Studio + WebView
  Local DB           Room / SQLite
  Offline Assets     TFLite + labels + JSON

------------------------------------------------------------------------

# 20. Android Offline Package

The offline assets are stored in:

``` text
app/src/main/assets/
```

with:

``` text
crop_disease_model.tflite
labels.txt
crop_disease_database.json
```

The model is packaged with the Android application so that it can be
accessed without internet connectivity.

The knowledge database is also packaged locally.

------------------------------------------------------------------------

# 21. User Experience

## Home

Main actions:

-   Scan Crop
-   Weather
-   History
-   Language
-   Find Agriculture Shop

## Diagnosis

``` text
Scan Crop
 ↓
Take / Select Image
 ↓
Diagnose
 ↓
Online AI or Offline AI
 ↓
Result
 ↓
Treatment
 ↓
Pesticide
 ↓
Fertilizer
 ↓
Prevention
 ↓
Save
```

## Result Page

Recommended sections:

1.  Disease
2.  Confidence
3.  Symptoms
4.  Treatment
5.  Pesticide Information
6.  Fertilizer Guidance
7.  Prevention
8.  Weather/Irrigation
9.  Find Nearby Shop
10. Save/View History

------------------------------------------------------------------------

# 22. Error Handling

## No Internet

Show:

> You're offline. Offline crop diagnosis is available for supported
> classes.

## Unsupported Offline Class

Show:

> This diagnosis is not supported in Offline Mode. Connect to the
> internet for online analysis.

## Poor Image

Show:

> Please upload a clear crop leaf image.

## Camera Permission Denied

Allow gallery upload as an alternative.

## GPS Denied

Explain that location is required for location-based weather/shop
features and provide manual location where feasible.

## API Failure

Show a clear error and, on Android, use offline diagnosis when possible.

## Weather Failure

Show that live weather is unavailable rather than inventing weather
information.

------------------------------------------------------------------------

# 23. Backend API Requirements

## POST `/api/diagnose`

Receives an image and returns structured diagnosis data.

## GET `/api/weather`

Receives location and returns weather information.

## GET `/api/history`

Returns authenticated user's scan history.

## POST `/api/history`

Stores a scan record.

## POST `/api/translate`

Translates text using the multilingual service.

## POST `/api/sync`

Handles synchronization of pending records.

------------------------------------------------------------------------

# 24. Firebase Data Model

## Users

``` text
users/{userId}
```

Example:

``` json
{
  "uid": "user-id",
  "name": "Farmer Name",
  "language": "mr",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Scans

``` text
users/{userId}/scans/{scanId}
```

Example:

``` json
{
  "scanId": "scan_001",
  "userId": "user_001",
  "crop": "Tomato",
  "disease": "Early Blight",
  "confidence": 0.94,
  "mode": "offline",
  "imageUrl": "",
  "treatment": "",
  "pesticides": [],
  "fertilizer": "",
  "prevention": [],
  "createdAt": "timestamp",
  "syncStatus": "synced"
}
```

## Firebase Storage

Recommended structure:

``` text
users/{userId}/scans/{scanId}/leaf.jpg
```

------------------------------------------------------------------------

# 25. Android Room Schema

Recommended local `ScanEntity`:

  Field        Type
  ------------ --------
  id           String
  userId       String
  crop         String
  disease      String
  confidence   Float
  imagePath    String
  treatment    String
  pesticides   String
  fertilizer   String
  prevention   String
  latitude     Double
  longitude    Double
  createdAt    Long
  syncStatus   String

Sync states:

``` text
PENDING
SYNCING
SYNCED
FAILED
```

------------------------------------------------------------------------

# 26. Security Requirements

-   Firebase Authentication must protect user accounts.
-   Firestore rules must restrict users to their own records.
-   Firebase Storage rules must restrict unauthorized image access.
-   API credentials should not be exposed unnecessarily in frontend
    JavaScript.
-   Sensitive backend API calls should go through FastAPI where
    appropriate.
-   Uploaded files must be validated.
-   Application-private storage should be used for sensitive offline
    data.
-   Chemical recommendations should be reviewed before production use.

------------------------------------------------------------------------

# 27. Performance Requirements

The application should:

-   Avoid unnecessary image transfers.
-   Resize images when appropriate.
-   Keep the UI responsive.
-   Provide loading indicators.
-   Handle API timeouts.
-   Keep the offline model practical for Android devices.
-   Avoid loading unnecessary large datasets into memory.
-   Use a compact local knowledge database.

------------------------------------------------------------------------

# 28. Reliability Requirements

The system should gracefully handle:

-   Internet loss
-   API timeouts
-   Firebase errors
-   Invalid images
-   Camera permission denial
-   GPS permission denial
-   Model errors
-   Failed synchronization
-   Duplicate sync attempts

Offline scans should not be lost because of temporary connectivity
failures.

------------------------------------------------------------------------

# 29. Suggested Project Structure

## Web

``` text
smart-agriculture-copilot/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── diagnosis.js
│   │   ├── weather.js
│   │   ├── history.js
│   │   └── maps.js
│   └── assets/
│
├── backend/
│   ├── main.py
│   ├── routes/
│   ├── services/
│   ├── models/
│   └── config/
│
├── android/
├── docs/
└── README.md
```

## Android

``` text
app/
└── src/
    └── main/
        ├── java/
        │   ├── MainActivity
        │   ├── NetworkMonitor
        │   ├── OfflineManager
        │   ├── TensorFlowHelper
        │   ├── SyncManager
        │   └── database/
        │
        ├── assets/
        │   ├── crop_disease_model.tflite
        │   ├── labels.txt
        │   └── crop_disease_database.json
        │
        ├── res/
        └── AndroidManifest.xml
```

------------------------------------------------------------------------

# 30. 30-Day Implementation Plan

## Days 1--5 --- Foundation

All members:

-   HTML
-   CSS
-   JavaScript
-   Python
-   Git/GitHub
-   APIs
-   JSON
-   Frontend/backend concepts

Deliverable: basic responsive application.

## Days 6--10 --- Frontend

Build:

-   Home
-   Scan
-   Result
-   Weather
-   History
-   Profile
-   Language

Deliverable: complete frontend prototype.

## Days 11--14 --- FastAPI

Build:

-   Backend
-   Routes
-   File upload
-   JSON responses
-   Firebase communication

Deliverable: frontend ↔ backend connection.

## Days 15--17 --- Gemini

Integrate:

``` text
Image → FastAPI → Gemini → JSON → Frontend
```

Deliverable: online disease diagnosis.

## Days 18--19 --- Firebase

Implement:

-   Authentication
-   Firestore
-   Storage
-   Scan history

Deliverable: cloud-backed history.

## Days 20--21 --- Weather + Maps

Implement:

-   GPS
-   OpenWeatherMap
-   Irrigation advice
-   Google Maps agriculture-shop search

Deliverable: location-aware assistant.

## Days 22--23 --- Android Hybrid

Create Android Studio WebView application.

Deliverable: web application running inside Android.

## Days 24--26 --- Offline AI

Add:

``` text
crop_disease_model.tflite
labels.txt
crop_disease_database.json
```

Implement:

-   Image preprocessing
-   TFLite inference
-   Label mapping
-   Offline recommendation lookup
-   Connectivity decision

Deliverable: offline diagnosis.

## Days 27--28 --- Room + Synchronization

Implement:

-   Room
-   Local image storage
-   Pending sync queue
-   Firebase synchronization

Deliverable: offline-first Android workflow.

## Day 29 --- Integration

Test:

-   Online diagnosis
-   Offline diagnosis
-   Weather
-   Firebase
-   Maps
-   Bhashini
-   Camera
-   GPS
-   Synchronization
-   API failures

## Day 30 --- Presentation

Prepare:

-   PPT
-   Architecture
-   Demo
-   Video
-   Final Android build
-   Final web deployment
-   Judge Q&A

------------------------------------------------------------------------

# 31. Team Responsibilities

  -----------------------------------------------------------------------
  Team Member                         Responsibility
  ----------------------------------- -----------------------------------
  Team Lead                           Architecture, integration, Gemini,
                                      GitHub, final testing

  Member 2                            HTML/CSS and responsive UI

  Member 3                            JavaScript, Fetch API,
                                      frontend-backend integration,
                                      WebView

  Member 4                            Python, FastAPI, Firebase and
                                      database

  Team Lead + Member 4                TFLite, offline database, Room and
                                      synchronization
  -----------------------------------------------------------------------

All team members should understand the overall system before the final
presentation.

------------------------------------------------------------------------

# 32. MVP Acceptance Criteria

## Authentication

-   [ ] Registration works.
-   [ ] Login works.
-   [ ] Logout works.

## Online Diagnosis

-   [ ] Image upload works.
-   [ ] FastAPI receives image.
-   [ ] Gemini returns a structured result.
-   [ ] Result is displayed.
-   [ ] Scan is saved.

## Offline Diagnosis

-   [ ] TFLite model is packaged.
-   [ ] `labels.txt` mapping works.
-   [ ] Supported image can be classified.
-   [ ] Local knowledge database lookup works.
-   [ ] Treatment information is displayed.
-   [ ] Offline scan is saved.

## Weather

-   [ ] Location can be obtained.
-   [ ] Weather is retrieved online.
-   [ ] Irrigation guidance is displayed.
-   [ ] Offline weather state is clearly communicated.

## History

-   [ ] Online records appear in Firebase.
-   [ ] Offline records appear locally.
-   [ ] Pending records synchronize after reconnection.

## Maps

-   [ ] Location permission works.
-   [ ] Agriculture-shop search opens correctly.

## Android

-   [ ] Web application loads inside WebView.
-   [ ] Native offline functionality works.
-   [ ] TFLite diagnosis works without internet.

------------------------------------------------------------------------

# 33. Risks and Mitigation

  ---------------------------------------------------------------------------
  Risk                    Impact                  Mitigation
  ----------------------- ----------------------- ---------------------------
  Gemini API failure      High                    Android offline TFLite
                                                  fallback

  Poor leaf image         High                    Image validation and user
                                                  guidance

  Incorrect AI prediction High                    Confidence/status display
                                                  and safety messaging

  Internet loss           High                    Offline model and Room

  Firebase failure        Medium                  Local queue and retry

  Weather API failure     Medium                  Clearly show
                                                  unavailable/last-sync state

  GPS denied              Medium                  Manual location where
                                                  feasible

  TFLite model too large  Medium                  Model
                                                  optimization/quantization

  Incorrect offline       High                    Review against
  agricultural data                               authoritative sources

  Team integration        Medium                  Git branches and clear
  conflicts                                       ownership

  Time shortage           High                    Finish online MVP before
                                                  advanced enhancements
  ---------------------------------------------------------------------------

------------------------------------------------------------------------

# 34. Demo Plan

The strongest hackathon demo should show three stages.

## Stage 1 --- Online

``` text
Open App
 ↓
Login
 ↓
Upload Leaf
 ↓
Gemini Diagnosis
 ↓
Treatment
 ↓
Pesticide/Fertilizer
 ↓
Weather
 ↓
Irrigation Advice
 ↓
Nearby Agriculture Shop
 ↓
History
```

## Stage 2 --- Offline

Turn off internet.

``` text
No Internet
 ↓
Offline Mode
 ↓
Upload Supported Leaf
 ↓
TensorFlow Lite
 ↓
Disease
 ↓
Local Knowledge Database
 ↓
Treatment/Pesticide/Fertilizer/Prevention
 ↓
Room Database
```

## Stage 3 --- Reconnection

``` text
Internet Restored
 ↓
Automatic Sync
 ↓
Firebase
 ↓
Offline Scan Appears in Cloud History
```

This demonstrates the core innovation rather than only showing a normal
AI API call.

------------------------------------------------------------------------

# 35. Product Success Metrics

## Diagnosis

-   Successful diagnosis rate
-   Average response time
-   Offline inference time

## Reliability

-   Online request success rate
-   Offline diagnosis success rate
-   Synchronization success rate

## User Experience

-   Time from application open to diagnosis
-   Number of steps required for diagnosis
-   History loading time

## Technical

-   APK size
-   TFLite model size
-   API latency
-   Synchronization latency

------------------------------------------------------------------------

# 36. Future Enhancements

## Version 1.1

-   More Indian crop classes
-   Improved regional-language coverage
-   Improved offline knowledge base
-   Better image quality detection

## Version 2.0

-   Voice assistant
-   Personalized farming calendar
-   Government agriculture information
-   Pest outbreak alerts
-   Push notifications

## Version 3.0

-   IoT soil sensors
-   Soil moisture monitoring
-   Satellite crop monitoring
-   Crop-yield prediction
-   Expert consultation
-   Precision-agriculture analytics

------------------------------------------------------------------------

# 37. Final Architecture

``` text
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
                            /                                        /                                        YES               NO
                          │                 │
                          ▼                 ▼
                    ONLINE MODE       OFFLINE MODE
                          │                 │
                       FastAPI            TFLite
                          │                 │
            ┌─────────────┼────────┐        ▼
            │             │        │    labels.txt
          Gemini       Weather   Firebase    │
            │             │        │         ▼
          Bhashini      Maps      Storage  Local Knowledge
            │             │        │       Database
            └─────────────┴────────┘         │
                                             ▼
                                            Room
                                             │
                                             ▼
                                    Offline Synchronization
                                             │
                                             ▼
                                      FARMER DASHBOARD
                                             │
                         ┌───────────────────┼──────────────────┐
                         ▼                   ▼                  ▼
                     Diagnosis            Weather            History
                         │
                         ▼
             Treatment / Pesticide /
             Fertilizer / Prevention
```

------------------------------------------------------------------------

# 38. Product Principle

The core product principle is:

> **Use cloud intelligence when the internet is available and local
> intelligence when it is not.**

Gemini provides advanced online analysis.

TensorFlow Lite provides local disease classification.

The local knowledge database provides offline agricultural information.

Firebase provides cloud identity, storage and synchronization.

Together, these components create a practical hybrid agriculture
assistant designed for real-world connectivity constraints.
