from abc import ABC, abstractmethod
from datetime import datetime
import logging

import httpx

from models.schemas import WeatherResponse, IrrigationAdvisory

logger = logging.getLogger("smart_ag_backend.weather")

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


class BaseWeatherService(ABC):
    """
    Abstract interface for Weather and Irrigation Guidance Service.
    """

    @abstractmethod
    async def get_weather(
        self,
        latitude: float,
        longitude: float
    ) -> WeatherResponse:
        pass


class MockWeatherService(BaseWeatherService):
    """
    Development mock weather service.
    """

    async def get_weather(
        self,
        latitude: float,
        longitude: float
    ) -> WeatherResponse:

        now_str = datetime.now().strftime("%I:%M %p")

        location_name = f"Location ({latitude:.2f}, {longitude:.2f})"

        if 19.0 <= latitude <= 21.0 and 73.0 <= longitude <= 75.0:
            location_name = "Nashik, Maharashtra"
        elif 18.0 <= latitude <= 19.5 and 73.5 <= longitude <= 74.5:
            location_name = "Pune, Maharashtra"

        advisory = IrrigationAdvisory(
            recommendation="DELAY_IRRIGATION",
            headline="Development mock weather",
            detail="This is simulated weather data used for local development.",
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


class RealWeatherService(BaseWeatherService):
    """
    Real weather service using Open-Meteo.

    Open-Meteo provides weather data using latitude/longitude
    and does not require an OpenWeather API key for this use case.
    """

    async def get_weather(
        self,
        latitude: float,
        longitude: float
    ) -> WeatherResponse:

        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": (
                "temperature_2m,"
                "relative_humidity_2m,"
                "precipitation,"
                "weather_code,"
                "wind_speed_10m"
            ),
            "hourly": "precipitation_probability",
            "forecast_hours": 24,
            "timezone": "auto"
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    OPEN_METEO_URL,
                    params=params
                )

                response.raise_for_status()
                data = response.json()

        except httpx.TimeoutException as exc:
            logger.error(
                "[RealWeatherService] Open-Meteo timeout: %s",
                exc
            )
            raise RuntimeError(
                "Weather service request timed out."
            ) from exc

        except httpx.HTTPError as exc:
            logger.error(
                "[RealWeatherService] Open-Meteo HTTP error: %s",
                exc
            )
            raise RuntimeError(
                "Weather service request failed."
            ) from exc

        except Exception as exc:
            logger.error(
                "[RealWeatherService] Unexpected weather error: %s",
                exc
            )
            raise RuntimeError(
                "Unable to retrieve weather information."
            ) from exc

        try:
            current = data["current"]

            temperature = float(
                current["temperature_2m"]
            )

            humidity = float(
                current["relative_humidity_2m"]
            )

            wind_speed = float(
                current["wind_speed_10m"]
            )

            precipitation = float(
                current.get("precipitation", 0.0)
            )

            weather_code = int(
                current.get("weather_code", 0)
            )

            hourly = data.get("hourly", {})

            precipitation_probabilities = (
                hourly.get(
                    "precipitation_probability",
                    []
                )
            )

            rain_probability = float(
                max(
                    precipitation_probabilities,
                    default=0
                )
            )

        except (KeyError, TypeError, ValueError) as exc:
            logger.error(
                "[RealWeatherService] Invalid Open-Meteo response: %s",
                exc
            )
            raise RuntimeError(
                "Weather service returned invalid data."
            ) from exc

        condition, icon = self._weather_description(
            weather_code
        )

        advisory = self._build_irrigation_advisory(
            temperature=temperature,
            humidity=humidity,
            precipitation=precipitation,
            rain_probability=rain_probability
        )

        location_name = (
            f"Location ({latitude:.2f}, {longitude:.2f})"
        )

        return WeatherResponse(
            location=location_name,
            latitude=latitude,
            longitude=longitude,
            temperature=temperature,
            humidity=humidity,
            windSpeed=wind_speed,
            condition=condition,
            icon=icon,
            rainProbability=rain_probability,
            timestamp=datetime.now().strftime("%I:%M %p"),
            irrigationAdvisory=advisory,
            isDevMockPayload=False
        )

    @staticmethod
    def _weather_description(code: int):
        """
        Convert WMO weather code into a simple user-facing
        description and icon.
        """

        mapping = {
            0: ("Clear Sky", "☀️"),
            1: ("Mainly Clear", "🌤️"),
            2: ("Partly Cloudy", "⛅"),
            3: ("Overcast", "☁️"),
            45: ("Foggy", "🌫️"),
            48: ("Rime Fog", "🌫️"),
            51: ("Light Drizzle", "🌦️"),
            53: ("Drizzle", "🌦️"),
            55: ("Heavy Drizzle", "🌧️"),
            61: ("Light Rain", "🌦️"),
            63: ("Rain", "🌧️"),
            65: ("Heavy Rain", "🌧️"),
            71: ("Light Snow", "🌨️"),
            73: ("Snow", "🌨️"),
            75: ("Heavy Snow", "❄️"),
            80: ("Rain Showers", "🌦️"),
            81: ("Rain Showers", "🌧️"),
            82: ("Heavy Rain Showers", "⛈️"),
            95: ("Thunderstorm", "⛈️"),
            96: ("Thunderstorm with Hail", "⛈️"),
            99: ("Severe Thunderstorm", "⛈️"),
        }

        return mapping.get(
            code,
            ("Unknown Conditions", "🌤️")
        )

    @staticmethod
    def _build_irrigation_advisory(
        temperature: float,
        humidity: float,
        precipitation: float,
        rain_probability: float
    ) -> IrrigationAdvisory:

        if precipitation > 0.5 or rain_probability >= 60:
            return IrrigationAdvisory(
                recommendation="DELAY_IRRIGATION",
                headline="Rain is likely",
                detail=(
                    "Rainfall is currently occurring or has a "
                    "high probability. Consider delaying irrigation "
                    "to avoid unnecessary water use."
                ),
                urgency="Low"
            )

        if temperature >= 35 and humidity < 45:
            return IrrigationAdvisory(
                recommendation="IRRIGATE_SOON",
                headline="Hot and dry conditions",
                detail=(
                    "High temperature and relatively low humidity "
                    "may increase crop water demand. Check soil "
                    "moisture and irrigate if required."
                ),
                urgency="High"
            )

        if temperature >= 30 and humidity < 60:
            return IrrigationAdvisory(
                recommendation="CHECK_SOIL_MOISTURE",
                headline="Moderate water demand",
                detail=(
                    "Warm conditions may increase water demand. "
                    "Check soil moisture before irrigation."
                ),
                urgency="Medium"
            )

        return IrrigationAdvisory(
            recommendation="CHECK_SOIL_MOISTURE",
            headline="Normal irrigation conditions",
            detail=(
                "No strong weather signal indicates immediate "
                "irrigation. Check actual soil moisture and crop needs "
                "before watering."
            ),
            urgency="Low"
        )


def get_weather_service() -> BaseWeatherService:
    """
    Use real Open-Meteo weather service.

    Open-Meteo does not require an API key for this use case.
    """

    return RealWeatherService()