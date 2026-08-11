# Smart Agriculture Copilot — App Flow

**Version:** 1.0

---

# 1. Complete Application Flow

```text
START
  ↓
Open Smart Agriculture Copilot
  ↓
Login / Register
  ↓
Home Dashboard
  ↓
Choose Feature
 ┌──────────┬──────────┬──────────┬──────────┐
 ↓          ↓          ↓          ↓
Scan       Weather    History    Language
Crop
```

---

# 2. Authentication Flow

```text
Open App
   ↓
Authenticated?
  / \
NO   YES
│     │
▼     ▼
Login/Register
│
▼
Firebase Authentication
│
▼
Home Dashboard
```

---

# 3. Main Dashboard

Main actions:

```text
Home
├── Scan Crop
├── Weather
├── Scan History
├── Language
├── Find Agriculture Shop
└── Profile
```

---

# 4. Crop Diagnosis Flow

```text
Home
 ↓
Scan Crop
 ↓
Camera / Gallery
 ↓
Select Leaf Image
 ↓
Image Preview
 ↓
Validate Image
 ↓
Connectivity Check
 ├───────────────┐
 │               │
ONLINE          OFFLINE
 │               │
 ▼               ▼
FastAPI         TFLite
 │               │
 ▼               ▼
Gemini         Class Index
 │               │
 ▼            labels.txt
Diagnosis        │
 │               ▼
 │        Local Knowledge DB
 │               │
 └───────┬───────┘
         ▼
Diagnosis Result
         ↓
Treatment
         ↓
Pesticide Information
         ↓
Fertilizer Guidance
         ↓
Prevention
         ↓
Save Scan
         ↓
History
```

---

# 5. Online Diagnosis Flow

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
Backend Validation
 ↓
Frontend Result
 ↓
Firebase Storage / Firestore
```

---

# 6. Offline Diagnosis Flow

```text
Leaf Image
 ↓
Android Native Layer
 ↓
Preprocessing
 ↓
TensorFlow Lite
 ↓
Prediction
 ↓
labels.txt
 ↓
Disease Name
 ↓
crop_disease_database.json
 ↓
Treatment / Pesticide / Fertilizer / Prevention
 ↓
Room Database
 ↓
Result Screen
```

---

# 7. Online/Offline Switching

```text
                 Check Connectivity
                        │
                 ┌──────┴──────┐
                YES            NO
                 │              │
                 ▼              ▼
             ONLINE          OFFLINE
                 │              │
               FastAPI        TFLite
               Gemini         Local DB
               Weather        Room
               Firebase       Local Images
               Bhashini
               Maps
```

The user does not need to manually select the mode.

---

# 8. Weather Flow

```text
Home
 ↓
Weather
 ↓
Get Location
 ↓
GPS Permission?
 ├── NO → Ask Permission / Manual Location
 └── YES
      ↓
OpenWeatherMap
      ↓
Weather Data
      ↓
Irrigation Logic
      ↓
Weather Screen
```

Offline:

```text
No Internet
 ↓
Live Weather Unavailable
 ↓
Show last synchronized weather + timestamp
(if available)
```

---

# 9. Irrigation Flow

```text
Weather
 ↓
Temperature
Humidity
Rain Forecast
 ↓
Irrigation Logic
 ↓
Simple Advice
 ↓
Farmer
```

Examples:

```text
Rain expected
→ Consider delaying irrigation.

Hot/dry conditions
→ Consider irrigation based on crop requirements.

Weather unavailable
→ Live irrigation advice unavailable.
```

---

# 10. Scan History Flow

## Online

```text
Diagnosis
 ↓
Create Scan Record
 ↓
Upload Image
 ↓
Save Metadata
 ↓
Firestore
 ↓
History
```

## Offline

```text
Diagnosis
 ↓
Create Scan Record
 ↓
Save Image Locally
 ↓
Room Database
 ↓
syncStatus = PENDING
 ↓
History
```

---

# 11. Synchronization Flow

```text
Offline Scan
 ↓
Room
 ↓
PENDING
 ↓
Internet Returns
 ↓
Connectivity Monitor
 ↓
Sync Manager
 ↓
Upload Image
 ↓
Upload Metadata
 ↓
Firebase
 ↓
Success?
 ├── YES → SYNCED
 └── NO  → FAILED → Retry
```

---

# 12. Multilingual Flow

```text
User Selects Language
 ↓
English / Hindi / Marathi
 ↓
Text Input
 ↓
FastAPI
 ↓
Bhashini
 ↓
Translated Text
 ↓
Display
```

Future:

```text
Voice
 ↓
Speech-to-Text
 ↓
Bhashini
 ↓
Text
 ↓
Response
 ↓
Text-to-Speech
```

---

# 13. Agriculture Shop Flow

```text
Home
 ↓
Find Agriculture Shop
 ↓
Location Permission
 ↓
Get GPS
 ↓
Create Search
 ↓
Google Maps
 ↓
Nearby Agriculture Shops
```

Possible searches:

- Agriculture shop
- Pesticide shop
- Fertilizer dealer
- Seed supplier

---

# 14. Android Hybrid Flow

```text
Android App
 ↓
WebView
 ↓
Hosted Smart Agriculture Copilot
 ↓
Web Features
 ↓
Native Android Bridge/Services
 ├── TFLite
 ├── Room
 ├── Connectivity
 ├── Local Storage
 └── Synchronization
```

---

# 15. Error Flows

## Poor Image

```text
Upload
 ↓
Image Validation
 ↓
Invalid
 ↓
Ask User to Upload Clear Leaf Image
```

## API Failure

```text
Gemini Request
 ↓
Failure
 ↓
Android?
 ├── YES → Try Offline TFLite
 └── NO  → Show Retry/Error
```

## GPS Denied

```text
GPS Request
 ↓
Denied
 ↓
Explain Permission
 ↓
Manual Location where feasible
```

## Firebase Failure

```text
Save Scan
 ↓
Firebase Failure
 ↓
Android?
 ├── YES → Save Locally → Retry Later
 └── NO  → Show Retry
```

---

# 16. Complete User Journey

```text
Farmer
 ↓
Open App
 ↓
Login
 ↓
Home
 ↓
Scan Crop
 ↓
Capture Leaf
 ↓
Connectivity Check
 ↓
┌─────────────────────────────┐
│                             │
▼                             ▼
ONLINE                        OFFLINE
Gemini                        TFLite
Weather                       Local DB
Firebase                      Room
Bhashini
│                             │
└──────────────┬──────────────┘
               ▼
        Diagnosis Result
               ↓
        Treatment Guidance
               ↓
        Pesticide Information
               ↓
        Fertilizer Guidance
               ↓
        Prevention
               ↓
        Save Scan
               ↓
        Weather / Irrigation
               ↓
        Find Nearby Shop
               ↓
           History
               ↓
       Internet Restored?
               ↓
         Auto Synchronize
```
