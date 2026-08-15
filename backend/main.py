from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config.settings import settings
from routes.diagnosis import router as diagnosis_router
from routes.weather import router as weather_router
from routes.history import router as history_router
from routes.translation import router as translation_router
from routes.sync import router as sync_router
from routes.location import router as location_router

app = FastAPI(
    title="Smart Agriculture Copilot API",
    description="FastAPI Backend for AI Crop Disease Diagnosis, Weather Guidance, History & Synchronization.",
    version="1.0.0"
)

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check Route
@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "smart-agriculture-copilot-backend",
        "environment": settings.ENVIRONMENT
    }

# Include Feature Routers
app.include_router(diagnosis_router)
app.include_router(weather_router)
app.include_router(history_router)
app.include_router(translation_router)
app.include_router(sync_router)
app.include_router(location_router)

# Custom Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal backend error occurred.", "error": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
