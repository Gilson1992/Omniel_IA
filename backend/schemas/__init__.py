from pydantic import BaseModel
from typing import List, Optional, Any


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class Action(BaseModel):
    type: str
    payload: Any = None


class ChatResponse(BaseModel):
    reply: str
    actions: List[Action] = []
    session_id: str


class WeatherResponse(BaseModel):
    location: str
    temperature: float
    condition: str
    humidity: int
    wind_speed: float
    icon: str


class SystemResponse(BaseModel):
    cpu_percent: float
    ram_percent: float
    ram_used_gb: float
    ram_total_gb: float
    uptime_seconds: int
    status: str
