# AI_RULES.md — Smart Agriculture Copilot

## Purpose

Rules for every AI coding agent working on Smart Agriculture Copilot. The team is beginner-level, so agents must explain important decisions, follow the project documentation, and never silently change the architecture.

## 1. Source of Truth

Before major tasks, read:

```text
/docs/PRD.md
/docs/TRD.md
/docs/APP_FLOW.md
/docs/BACKEND_SCHEMA.md
/docs/IMPLEMENTATION_PLAN.md
/docs/AI_RULES.md
```

If documents conflict, stop and report the conflict instead of guessing.

## 2. Beginner-Friendly Development

For every major task:

1. Explain what is being built.
2. Explain why it is needed.
3. Identify files that will change.
4. Explain important decisions.
5. Implement the smallest practical solution.
6. Test it.
7. Report the result.

Do not use unnecessarily advanced patterns.

## 3. Build Incrementally

Never build the whole application in one step.

```text
PLAN → IMPLEMENT → TEST → REVIEW → COMMIT → NEXT FEATURE
```

## 4. Agent Ownership

### Frontend Agent
Work only in `/frontend/`.
Responsible for HTML, CSS, Vanilla JavaScript, UI, navigation, browser interactions, and API hooks.

### Backend Agent
Work only in `/backend/`.
Responsible for FastAPI, routes, schemas, services, validation, external API server-side integration, and errors.

### Firebase Agent
Responsible for Firebase Authentication, Firestore, Storage, configuration, security rules, and cloud synchronization.

### AI/ML Agent
Responsible for Gemini integration, TensorFlow/TFLite, `labels.txt`, `crop_disease_database.json`, model testing, and inference.

### Android Agent
Responsible for Android WebView, native bridge, TFLite integration, Room, offline storage, and synchronization.

### QA Agent
Responsible for testing, regression testing, bug reports, browser/API/Android verification.

Do not modify another agent's module without approval.

## 5. Architecture Rules

Current stack:

```text
Frontend: HTML5, CSS3, Vanilla JavaScript
Backend: Python, FastAPI
Cloud: Firebase Authentication, Cloud Firestore, Firebase Storage
AI: Gemini Vision, TensorFlow, TensorFlow Lite, EfficientNetB0, PlantVillage
APIs: OpenWeatherMap, Google Maps, Bhashini
Android: Hybrid WebView, native Android, Room, TFLite
```

Do not replace the architecture with React, Next.js, Node.js, Supabase, MongoDB, or another major technology without explicit approval.

## 6. Online vs Offline

### Online diagnosis

```text
Leaf Image → Frontend → FastAPI → Gemini → Structured Diagnosis → Frontend
```

### Android offline diagnosis

```text
Leaf Image → Android → TFLite → labels.txt → Disease
→ crop_disease_database.json → Treatment/Pesticide/Fertilizer/Prevention
```

JavaScript development mocks are NOT the real offline AI system.

## 7. Development Mocks

Mocks are allowed only for development when real services are unavailable.

They must:
- Be clearly isolated.
- Be easy to replace.
- Never be presented as real AI results.
- Never hide a real production error.

## 8. Android Bridge

The web app must work normally without Android.

```text
Browser → AndroidNativeBridge unavailable → Web app still works
Android WebView → AndroidNativeBridge available → Native TFLite/Room
```

Do not make browser functionality depend on `window.AndroidNativeBridge`.

## 9. API Contracts

Current frontend API expectations:

```text
POST /api/diagnose
GET  /api/weather
GET  /api/history
POST /api/history
POST /api/translate
POST /api/sync
```

Do not silently change API contracts. If a change is necessary, explain the impact, update documentation, and obtain approval.

## 10. Secrets

Never put secrets in HTML, frontend JavaScript, GitHub, or public configuration.

Never commit:

```text
.env
API keys
passwords
Firebase private keys
service-account credentials
```

Use environment variables and secure server-side configuration.

## 11. Firebase and Database

Follow `/docs/BACKEND_SCHEMA.md`.

Do not invent collections, fields, or synchronization behavior without approval. Update documentation when an approved schema change is made.

## 12. TFLite

`crop_disease_model.tflite` performs disease classification only.

Recommendations come from:

```text
TFLite class → labels.txt → disease → crop_disease_database.json
```

Do not assume the model contains pesticide, fertilizer, treatment, or prevention information.

## 13. Safety

Do not invent pesticide names, doses, application rates, or agricultural claims.

Clearly distinguish AI guidance from verified product-label instructions and local agricultural guidance. If reliable information is unavailable, say so.

## 14. Error Handling

Never hide errors. For failures, report:
- What failed
- Likely reason
- User-facing behavior
- Developer checks

Handle API failure, invalid images, GPS denial, network loss, Firebase failure, Gemini failure, and TFLite failure gracefully.

## 15. Testing

A feature is not complete because code was generated.

```text
CODE → RUN → TEST → CHECK LOGS → FIX → RETEST
```

Frontend: desktop, mobile, navigation, console, API failures, online/offline behavior.

Backend: endpoints, invalid inputs, errors, external API failures.

Android: online, offline, reconnect, TFLite, Room, Firebase sync.

## 16. Git Rules

Do not develop directly on `main`.

Use branches such as:

```text
main
├── feature/frontend
├── feature/backend
├── feature/firebase
├── feature/ai
└── feature/android
```

Before changes:

```bash
git status
```

After a completed feature:

```bash
git add .
git commit -m "feat: description"
git push -u origin feature/branch-name
```

Never force-push unless explicitly approved.

## 17. Debugging

Do not rewrite an entire module immediately.

```text
Reproduce → Read error → Identify cause → Propose smallest fix
→ Apply → Test again
```

## 18. Dependencies

Do not add libraries just for convenience.

Before adding a major dependency, explain why it is needed and whether the existing stack can solve the problem. Obtain approval for major dependencies.

## 19. UI Rules

The farmer-facing UI must be:
- Simple
- Mobile-first
- High contrast
- Easy to read
- Large touch targets (minimum 48px)
- Low in technical terminology
- Clear about loading, success, and errors

## 20. Documentation

If architecture or behavior changes, update the relevant:

```text
PRD.md
TRD.md
APP_FLOW.md
BACKEND_SCHEMA.md
IMPLEMENTATION_PLAN.md
```

Do not leave documentation describing an obsolete architecture.

## 21. Agent Reporting

Every task must end with:

```text
STATUS:
FILES CHANGED:
WHAT CHANGED:
TESTS:
ERRORS:
NEXT RECOMMENDED STEP:
```

If blocked:

```text
BLOCKED BY:
```

## 22. Approval Gates

Stop and request approval before:
- Architecture changes
- Major dependencies
- API contract changes
- Database schema changes
- Security-sensitive changes
- Modifying another agent's module

## 23. Definition of Done

A feature is DONE only when:

```text
✓ Requirements satisfied
✓ Code implemented
✓ Application runs
✓ Feature works
✓ Errors handled
✓ Tests pass
✓ Documentation is consistent
✓ Git checkpoint/commit exists
```

AI saying "Done" is not sufficient evidence.

## 24. Golden Rule

> AI agents should help the team build the project, not silently redesign the project.

When uncertain:

```text
STOP → EXPLAIN → ASK → WAIT FOR APPROVAL
```

When certain:

```text
PLAN → IMPLEMENT → TEST → REPORT
```

## 25. Development Sequence

```text
Documentation
↓
Frontend
↓
FastAPI
↓
Gemini
↓
Firebase
↓
Weather
↓
Maps
↓
Android WebView
↓
TFLite Offline AI
↓
Room
↓
Offline Sync
↓
Full Testing
↓
Deployment & Demo
```
