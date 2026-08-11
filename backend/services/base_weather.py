from abc import ABC, abstractmethod
from datetime import datetime
from config.settings import settings
from models.schemas import WeatherResponse, IrrigationAdvisory

class BaseWeatherService(ABC):
    """
    Abstract interface for Weather and Irrigation Guidance Service.
    """
    @abstractmethod
    async def get_weather(self, latitude: float, longitude: float) -> WeatherResponse:
        pass

class MockWeatherService(BaseWeatherService):
    """
    Development Mock Weather Service.
    Returns structured location-aware mock weather snapshot & irrigation advisory.
    """
    async def get_weather(self, latitude: float, longitude: float) -> WeatherResponse:
        now_str = datetime.now().strftime("%I:%M %p")
        
        # Simple dynamic location name formatting based on coordinates
        location_name = f"Location ({latitude:.2f}, {longitude:.2f})"
        if 19.0 <= latitude <= 21.0 and 73.0 <= longitude <= 75.0:
            location_name = "Nashik, Maharashtra"
        elif 18.0 <= latitude <= 19.5 and 73.5 <= longitude <= 74.5:
            location_name = "Pune, Maharashtra"

        advisory = IrrigationAdvisory(
            recommendation="DELAY_IRRIGATION",
            headline="Rain expected within 24 hours (60% probability)",
            detail="Soil moisture levels are currently adequate. Holding off on irrigation today will conserve water and avoid waterlogging crop roots.",
            urgency="Low"
        )

        return WeatherResponse(
            location=location_name,
            latitude=latitude,
            longitude=longitude,
            temperature=28.5,
            humidity=65.0,
            windSpeed=14.2,
            condition="Partly Cloudy",
            icon="🌤️",
            rainProbability=20.0,
            timestamp=now_str,
            irrigationAdvisory=advisory,
            isDevMockPayload=True
        )

def get_weather_service() -> BaseWeatherService:
    """
    Factory function to return Weather service.
    If OPENWEATHER_API_KEY is empty/missing, uses MockWeatherService.
    """
    if not settings.OPENWEATHER_API_KEY or not settings.OPENWEATHER_API_KEY.strip():
        return MockWeatherService()
    return MockWeatherService()
