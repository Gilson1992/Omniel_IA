import uuid

from core.config import Settings
from schemas import Action, ChatResponse
from services.llm import get_llm_client
from services.tools.system import get_system_data
from services.tools.weather import get_weather_data


def authenticate_user(username: str, password: str, settings: Settings) -> bool:
    return username == settings.admin_user and password == settings.admin_pass


def process_chat(message: str, session_id: str | None) -> ChatResponse:
    sid = session_id or str(uuid.uuid4())
    messages = [
        {'role': 'system', 'content': 'You are Omniel assistant. Be concise.'},
        {'role': 'user', 'content': message},
    ]
    client = get_llm_client()
    reply = client.generate(messages)
    actions = []
    msg_lower = message.lower()
    if 'weather' in msg_lower:
        actions.append(Action(type='show_weather', payload={'trigger': True}))
    if 'system' in msg_lower or 'status' in msg_lower:
        actions.append(Action(type='show_system', payload={'trigger': True}))
    return ChatResponse(reply=reply, actions=actions, session_id=sid, source=client.source)


__all__ = ['authenticate_user', 'get_system_data', 'get_weather_data', 'process_chat']
