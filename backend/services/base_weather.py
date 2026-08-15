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
                "apparent_temperature,"
                "relative_humidity_2m,"
                "precipitation,"
                "weather_code,"
                "wind_speed_10m,"
                "wind_direction_10m,"
                "cloud_cover,"
                "visibility,"
                "surface_pressure"
            ),
            "hourly": "precipitation_probability",
            "forecast_hours": 24,
            "daily": (
                "weather_code,"
                "temperature_2m_max,"
                "temperature_2m_min,"
                "precipitation_sum,"
                "precipitation_probability_max"
            ),
            "forecast_days": 5,
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

            feels_like = self._optional_float(current.get("apparent_temperature"))

            wind_direction = self._optional_float(current.get("wind_direction_10m"))
            cloud_cover = self._optional_float(current.get("cloud_cover"))
            visibility = self._optional_float(current.get("visibility"))
            pressure = self._optional_float(current.get("surface_pressure"))

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

            daily = data.get("daily", {})
            daily_dates = daily.get("time", [])
            daily_codes = daily.get("weather_code", [])
            daily_max = daily.get("temperature_2m_max", [])
            daily_min = daily.get("temperature_2m_min", [])
            daily_precip = daily.get("precipitation_sum", [])
            daily_rain_prob = daily.get("precipitation_probability_max", [])
            forecast = []
            for index, date in enumerate(daily_dates):
                code = int(daily_codes[index]) if index < len(daily_codes) else 0
                day_condition, day_icon = self._weather_description(code)
                forecast.append({
                    "date": str(date),
                    "temperatureMax": self._optional_float(daily_max[index]) if index < len(daily_max) else None,
                    "temperatureMin": self._optional_float(daily_min[index]) if index < len(daily_min) else None,
                    "precipitation": self._optional_float(daily_precip[index]) if index < len(daily_precip) else None,
                    "rainProbability": self._optional_float(daily_rain_prob[index]) if index < len(daily_rain_prob) else None,
                    "condition": day_condition,
                    "icon": day_icon
                })

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
            timestamp=current.get("time") or datetime.now().astimezone().isoformat(),
            irrigationAdvisory=advisory,
            feelsLike=feels_like,
            windDirection=wind_direction,
            cloudCover=cloud_cover,
            visibility=visibility,
            pressure=pressure,
            precipitation=precipitation,
            forecast=forecast,
            isDevMockPayload=False
        )

    @staticmethod
    def _optional_float(value):
        if value is None:
            return None
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

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
