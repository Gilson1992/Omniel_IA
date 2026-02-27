from fastapi import APIRouter, HTTPException, Depends, status
from core.config import get_settings
from core.security import create_access_token, get_current_user
from schemas import LoginRequest, TokenResponse, ChatRequest, ChatResponse, WeatherResponse, SystemResponse
from services import authenticate_user, get_weather_data, get_system_data, process_chat

router = APIRouter()
settings = get_settings()


@router.post("/auth/login", response_model=TokenResponse, tags=["Auth"])
def login(body: LoginRequest):
    if not authenticate_user(body.username, body.password, settings):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": body.username})
    return TokenResponse(access_token=token)


@router.post("/assistant/chat", response_model=ChatResponse, tags=["Assistant"])
def chat(body: ChatRequest, _user=Depends(get_current_user)):
    return process_chat(body.message, body.session_id)


@router.get("/tools/weather", response_model=WeatherResponse, tags=["Tools"])
def weather(_user=Depends(get_current_user)):
    return get_weather_data()


@router.get("/tools/system", response_model=SystemResponse, tags=["Tools"])
def system_stats(_user=Depends(get_current_user)):
    return get_system_data()
