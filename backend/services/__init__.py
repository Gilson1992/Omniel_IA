import random
import time
import uuid
from schemas import WeatherResponse, SystemResponse, ChatResponse, Action

_start_time = time.time()


def authenticate_user(username: str, password: str, settings) -> bool:
    return username == settings.admin_user and password == settings.admin_pass


def get_weather_data() -> WeatherResponse:
    conditions = [
        ("Partly Cloudy", "⛅"),
        ("Clear Sky", "☀️"),
        ("Light Rain", "🌧️"),
        ("Thunderstorm", "⛈️"),
        ("Foggy", "🌫️"),
    ]
    cond, icon = random.choice(conditions)
    return WeatherResponse(
        location="Recife, PE",
        temperature=round(random.uniform(24.0, 35.0), 1),
        condition=cond,
        humidity=random.randint(55, 90),
        wind_speed=round(random.uniform(5.0, 25.0), 1),
        icon=icon,
    )


def get_system_data() -> SystemResponse:
    uptime = int(time.time() - _start_time)
    return SystemResponse(
        cpu_percent=round(random.uniform(5.0, 85.0), 1),
        ram_percent=round(random.uniform(30.0, 75.0), 1),
        ram_used_gb=round(random.uniform(4.0, 12.0), 2),
        ram_total_gb=16.0,
        uptime_seconds=uptime,
        status="OPERATIONAL",
    )


JARVIS_REPLIES = [
    "Of course. I've processed your request and all systems are nominal.",
    "Understood. Initiating sequence. Please stand by.",
    "Affirmative. Cross-referencing data across all available nodes.",
    "Running analysis now. Results will be available shortly.",
    "I've already taken care of that. Anything else?",
    "Excellent query. Based on current telemetry, I recommend we proceed.",
    "Systems check complete. All parameters within acceptable ranges.",
    "Request acknowledged. Activating protocol now.",
]


def process_chat(message: str, session_id: str | None) -> ChatResponse:
    sid = session_id or str(uuid.uuid4())
    reply = random.choice(JARVIS_REPLIES)
    actions = []

    msg_lower = message.lower()
    if "weather" in msg_lower:
        actions.append(Action(type="show_weather", payload={"trigger": True}))
    if "system" in msg_lower or "status" in msg_lower:
        actions.append(Action(type="show_system", payload={"trigger": True}))

    return ChatResponse(reply=reply, actions=actions, session_id=sid)
