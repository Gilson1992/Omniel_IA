import httpx
from fastapi import HTTPException

from core.config import get_settings
from schemas import WeatherResponse


def get_weather_data(city: str) -> WeatherResponse:
    settings = get_settings()
    if not settings.weather_api_key:
        raise HTTPException(status_code=400, detail='WEATHER_API_KEY not configured')

    params = {'q': city, 'appid': settings.weather_api_key, 'units': 'metric'}
    try:
        with httpx.Client(timeout=8.0) as client:
            response = client.get(settings.weather_base_url, params=params)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f'Weather provider error: {exc}') from exc

    payload = response.json()
    weather = payload['weather'][0]
    main = payload['main']
    wind = payload.get('wind', {})
    return WeatherResponse(
        location=f"{payload['name']}, {payload['sys'].get('country', '')}".strip(', '),
        temperature=float(main['temp']),
        condition=weather['description'].title(),
        humidity=int(main['humidity']),
        wind_speed=float(wind.get('speed', 0.0)),
        icon=weather.get('icon', ''),
    )
