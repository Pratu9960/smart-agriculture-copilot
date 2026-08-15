#  Smart Agriculture Copilot

> An AI-powered agriculture assistant that helps farmers identify crop diseases, understand symptoms, access verified treatment and pesticide information, monitor weather conditions, and make better crop-management decisions.

##  Overview

Smart Agriculture Copilot is a full-stack agricultural assistance platform designed to provide farmers with simple, accessible, and reliable crop intelligence.

The platform combines **Google Gemini Vision** for crop disease identification with a **verified agricultural knowledge base** for treatment, pesticide, fertilizer, and prevention recommendations.

Unlike systems that allow AI to generate agricultural chemical recommendations, Smart Agriculture Copilot follows a strict architecture:

**AI identifies the disease → Knowledge Base provides the agricultural recommendations.**

This separation helps reduce hallucinated pesticide names, dosages, and treatment instructions.

---

##  Key Features

###  AI Crop Disease Detection
- Upload or capture a crop leaf image.
- Google Gemini Vision analyzes the image.
- Identifies:
  - Crop
  - Disease
  - Confidence score
- Real AI responses are clearly distinguished from development mock responses.
- Invalid or unavailable AI responses are not silently converted into fake diagnoses.

###  Agricultural Knowledge Base
A structured database containing **26 crop-disease records**.

Provides:
- Disease severity
- Symptoms
- Cause
- Treatment
- Verified pesticide information
- Fertilizer guidance
- Prevention methods
- Source references where available

The knowledge base is responsible for agricultural recommendations rather than Gemini.

###  Verified Pesticide Recommendations
Pesticide information is displayed only when verified information is available in the knowledge base.

Each verified pesticide can contain:
- Name
- Formulation
- Dosage
- Application instructions
- Source

If verified pesticide information is unavailable, the system clearly informs the user instead of inventing a recommendation.

###  Live Weather Intelligence
The application retrieves weather information using **Open-Meteo** based on the user's latitude and longitude.

Displays:
- Temperature
- Humidity
- Wind speed
- Weather condition
- Rain probability
- Irrigation advisory

The irrigation advisory is generated using application rules based on weather conditions rather than AI-generated pesticide or treatment advice.

###  Firebase Authentication
- User registration
- Email/password login
- Confirm password validation
- Password visibility toggle
- Remembered authentication session
- Logout
- User profile management

###  Smart Crop Scanning
- Camera support
- Gallery upload
- Image preview
- Image validation
- 10 MB image limit
- AI analysis progress state
- Clear error and loading states

###  Scan History
- Save diagnosis results
- View previous scans
- Store important diagnosis information
- Local/offline record support

###  Multilingual Support
The application supports language switching to make agricultural information more accessible to users from different language backgrounds.

###  Agricultural Shop Finder
Google Maps integration helps users locate nearby agricultural shops and services.

###  Offline Support
The Android version can use the native offline diagnosis bridge when an installed local crop-disease model is available.

The web version does not pretend to provide offline AI diagnosis when the local model is unavailable.

###  Responsive Design
Designed for:
- Mobile
- Tablet
- Desktop

Includes:
- Desktop navigation
- Mobile bottom navigation
- Responsive layouts
- Reduced-motion accessibility support

---

##  System Architecture

```text
                    ┌─────────────────────┐
                    │       Farmer        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Web / Android UI  │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
        Authentication     Crop Image        Weather
          Firebase            │              Location
                              │                 │
                              ▼                 ▼
                       Gemini Vision       Open-Meteo
                              │
                              ▼
                   Crop + Disease +
                      Confidence
                              │
                              ▼
                    KnowledgeService
                              │
                              ▼
                26-Disease Knowledge Base
                              │
             ┌────────────────┼─────────────────┐
             │                │                 │
             ▼                ▼                 ▼
          Symptoms        Treatment        Prevention
             │                │                 │
             └────────────────┼─────────────────┘
                              │
                     ┌────────┴────────┐
                     ▼                 ▼
                Pesticides         Fertilizer
                (verified)          Guidance
