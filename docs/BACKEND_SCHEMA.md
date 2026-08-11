# Smart Agriculture Copilot — Backend Schema

**Version:** 1.0  
**Cloud Database:** Firebase Cloud Firestore  
**Cloud Storage:** Firebase Storage  
**Authentication:** Firebase Authentication  
**Android Local Database:** Room / SQLite  
**Offline Knowledge:** `crop_disease_database.json`

---

# 1. Architecture

```text
Firebase Authentication
        │
        ▼
      User
        │
        ▼
Cloud Firestore
 ├── User Profile
 └── Scan History
        │
        ▼
Firebase Storage
 └── Leaf Images
```

Android:

```text
Android
 ├── Room Database
 ├── Local Images
 ├── TFLite
 ├── labels.txt
 └── crop_disease_database.json
```

---

# 2. Firestore Structure

Recommended:

```text
users/
  {userId}/
    profile

    scans/
      {scanId}
```

---

# 3. User Document

Path:

```text
users/{userId}
```

Schema:

```json
{
  "uid": "firebase-user-id",
  "name": "Farmer Name",
  "language": "mr",
  "email": "optional",
  "phone": "optional",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| uid | String | Yes | Firebase user ID |
| name | String | Yes | Display name |
| language | String | Yes | Preferred language |
| email | String | No | Email if used |
| phone | String | No | Phone if used |
| createdAt | Timestamp | Yes | Account creation |
| updatedAt | Timestamp | Yes | Last update |

---

# 4. Scan Document

Path:

```text
users/{userId}/scans/{scanId}
```

Schema:

```json
{
  "scanId": "scan_001",
  "userId": "user_001",
  "crop": "Tomato",
  "disease": "Early Blight",
  "confidence": 0.94,
  "mode": "online",
  "imageUrl": "firebase-storage-url",
  "symptoms": [],
  "cause": "",
  "treatment": "",
  "pesticides": [],
  "fertilizer": "",
  "prevention": [],
  "latitude": 18.52,
  "longitude": 73.85,
  "weather": {
    "temperature": 30,
    "humidity": 65,
    "rainProbability": 20,
    "condition": "Cloudy",
    "timestamp": "timestamp"
  },
  "createdAt": "timestamp",
  "syncStatus": "synced"
}
```

---

# 5. Scan Fields

| Field | Type | Required | Description |
|---|---|---:|---|
| scanId | String | Yes | Unique scan ID |
| userId | String | Yes | Owner |
| crop | String | Yes | Detected crop |
| disease | String | Yes | Detected disease |
| confidence | Number | No | Model/AI confidence |
| mode | String | Yes | online/offline |
| imageUrl | String | No | Firebase Storage URL |
| symptoms | Array | No | Symptoms |
| cause | String | No | Disease cause |
| treatment | String | No | Treatment |
| pesticides | Array | No | Pesticide information |
| fertilizer | String | No | Fertilizer guidance |
| prevention | Array | No | Prevention |
| latitude | Number | No | Location |
| longitude | Number | No | Location |
| weather | Object | No | Weather snapshot |
| createdAt | Timestamp | Yes | Scan time |
| syncStatus | String | Yes | Sync state |

---

# 6. Weather Object

```json
{
  "temperature": 30,
  "humidity": 65,
  "rainProbability": 20,
  "condition": "Cloudy",
  "timestamp": "timestamp"
}
```

Weather is a snapshot attached to the scan, not a replacement for live weather.

---

# 7. Firebase Storage Schema

Recommended:

```text
users/
  {userId}/
    scans/
      {scanId}/
        leaf.jpg
```

Optional future files:

```text
result.json
```

---

# 8. Room Database

The Android application needs a local scan table.

## ScanEntity

```text
ScanEntity
```

Fields:

| Field | Type |
|---|---|
| id | String |
| userId | String |
| crop | String |
| disease | String |
| confidence | Float |
| imagePath | String |
| treatment | String |
| pesticides | String |
| fertilizer | String |
| prevention | String |
| latitude | Double |
| longitude | Double |
| weatherJson | String |
| mode | String |
| createdAt | Long |
| syncStatus | String |

---

# 9. Sync Status

Allowed states:

```text
PENDING
SYNCING
SYNCED
FAILED
```

Flow:

```text
New Offline Scan
 ↓
PENDING
 ↓
Sync Started
 ↓
SYNCING
 ↓
Success → SYNCED
Failure → FAILED
```

---

# 10. Offline Knowledge Schema

File:

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

The keys should match `labels.txt` exactly.

---

# 11. User → Scan Relationship

```text
User
 │
 ├── Scan 1
 ├── Scan 2
 ├── Scan 3
 └── Scan N
```

Firestore:

```text
users/{userId}/scans/{scanId}
```

This makes security rules and user-specific history easier to implement.

---

# 12. API Schema

## POST /api/diagnose

### Request

Multipart form:

```text
image: file
```

### Response

```json
{
  "crop": "",
  "disease": "",
  "confidence": 0,
  "symptoms": [],
  "cause": "",
  "treatment": "",
  "pesticides": [],
  "fertilizer": "",
  "prevention": []
}
```

---

# 13. Weather API Schema

## GET /api/weather

Parameters:

```text
latitude
longitude
```

Response:

```json
{
  "temperature": 30,
  "humidity": 65,
  "rainProbability": 20,
  "condition": "Cloudy",
  "irrigationAdvice": "..."
}
```

---

# 14. History API

## GET /api/history

Authenticated request.

Response:

```json
{
  "scans": [
    {
      "scanId": "scan_001",
      "crop": "Tomato",
      "disease": "Early Blight",
      "confidence": 0.94,
      "createdAt": "timestamp",
      "mode": "online"
    }
  ]
}
```

---

# 15. Translation API

## POST /api/translate

Request:

```json
{
  "text": "What disease is affecting my crop?",
  "sourceLanguage": "en",
  "targetLanguage": "mr"
}
```

Response:

```json
{
  "translatedText": "..."
}
```

---

# 16. Synchronization API

## POST /api/sync

Conceptual request:

```json
{
  "scans": [
    {
      "scanId": "scan_001",
      "crop": "Tomato",
      "disease": "Early Blight",
      "mode": "offline"
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "synced": [
    "scan_001"
  ],
  "failed": []
}
```

---

# 17. Firestore Security Concept

The intended security model is:

```text
Authenticated User
       ↓
Check request UID
       ↓
Compare with document userId
       ↓
Allow only own user/scan data
```

A user should not be able to read or modify another user's scans.

---

# 18. Data Lifecycle

## Online Scan

```text
Image
 ↓
Gemini
 ↓
Result
 ↓
Firebase Storage
 ↓
Firestore
```

## Offline Scan

```text
Image
 ↓
TFLite
 ↓
Local Knowledge DB
 ↓
Room
 ↓
Local Image
 ↓
PENDING
 ↓
Internet Restored
 ↓
Firebase
 ↓
SYNCED
```

---

# 19. Data Ownership

Each scan belongs to exactly one authenticated user.

```text
userId → scans
```

Leaf images should use the same ownership hierarchy.

---

# 20. Schema Design Principles

- Keep user data isolated.
- Keep images in Firebase Storage rather than Firestore.
- Keep scan metadata in Firestore.
- Keep offline records in Room.
- Keep model files in Android assets.
- Keep offline knowledge separate from model weights.
- Keep model labels synchronized with model output.
- Avoid storing unnecessary duplicate data.
